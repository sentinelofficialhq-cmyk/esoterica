import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import type { Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import { replyTo, sendMessage } from '@/ai/chat';
import { describeAIError, getProvider, NoKeyError } from '@/ai/client';
import { dailyContextLine } from '@/ai/context';
import { maybeUpdateMemory } from '@/ai/memory';
import { GUIDE_NAME, GUIDE_SHORT, guideOfMode, modeInfo, type GuideId } from '@/ai/modes';
import { effortFor } from '@/ai/models';
import { detectCrisis } from '@/ai/safety';
import type { StoredMessage } from '@/ai/types';
import { energyFor } from '@/engines/timing';
import { todayLocal } from '@/lib/date';
import { useChatStore } from '@/store/chatStore';
import { useProfile } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/ui/Button';
import { CrisisBanner } from '@/ui/CrisisBanner';
import { EmptyState } from '@/ui/EmptyState';
import { SendIcon, StopIcon } from '@/ui/icons';
import { Markdown } from '@/ui/Markdown';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Txt } from '@/ui/Txt';
import { radii, space } from '@/ui/theme';

function Bubble({ m, guide, onRetry }: { m: StoredMessage; guide: GuideId; onRetry?: () => void }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  if (m.role === 'user') {
    return (
      <View style={styles.userWrap}>
        <View style={[styles.user, m.status === 'failed' && styles.failed]}>
          <Txt variant="body">{m.text}</Txt>
        </View>
        {m.status === 'failed' ? (
          <Txt variant="small" color={colors.danger} onPress={onRetry}>
            Not sent · Retry
          </Txt>
        ) : null}
      </View>
    );
  }
  return (
    <View style={styles.jung}>
      <Txt variant="label" color={colors.gold}>
        {GUIDE_SHORT[guide]}
      </Txt>
      {m.text ? <Markdown serif>{m.text}</Markdown> : null}
      {m.status === 'stopped' ? <Txt variant="small">Stopped</Txt> : null}
    </View>
  );
}

export default function ChatScreen() {
  const styles = useStyles(makeStyles);
  const { colors, scheme } = useTheme();
  const { id, q } = useLocalSearchParams<{ id: string; q?: string }>();
  const conv = useChatStore((s) => s.conversations.find((c) => c.id === id));
  const guide: GuideId = conv ? guideOfMode(conv.mode) : 'jung';
  const settings = useSettingsStore();
  const profile = useProfile();

  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [streaming, setStreaming] = useState('');
  const [error, setError] = useState<{ text: string; noKey: boolean } | null>(null);
  const [refused, setRefused] = useState(false);
  const [crisis, setCrisis] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const bufferRef = useRef('');
  const scrollRef = useRef<ScrollView>(null);
  const startedRef = useRef(false);

  // Flush streamed text to the screen at most every 50 ms.
  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => setStreaming(bufferRef.current), 50);
    return () => clearInterval(t);
  }, [busy]);

  // Leaving the chat updates Jung's memory in the background.
  useEffect(() => () => void maybeUpdateMemory(id), [id]);

  const run = async (text: string | null) => {
    if (!profile || !conv) return;
    setError(null);
    setRefused(false);
    if (text && detectCrisis(text)) setCrisis(true);
    const controller = new AbortController();
    abortRef.current = controller;
    bufferRef.current = '';
    setStreaming('');
    setBusy(true);
    try {
      const provider = await getProvider(settings);
      const today = todayLocal();
      const deps = {
        convId: conv.id,
        provider,
        effort: conv.mode === 'reading' ? ('medium' as const) : effortFor(settings.chatDepth),
        today,
        signal: controller.signal,
        onText: (d: string) => {
          bufferRef.current += d;
        },
      };
      const out = text ? await sendMessage({ ...deps, text, dailyLine: dailyContextLine(energyFor(profile, today)) }) : await replyTo(deps);
      if (out.refused) setRefused(true);
    } catch (err) {
      setError({ text: describeAIError(err), noKey: err instanceof NoKeyError });
    } finally {
      setBusy(false);
      setStreaming('');
      abortRef.current = null;
    }
  };

  // A question passed from the Ask tab is sent once, when the chat first opens.
  useEffect(() => {
    if (q && conv && conv.messages.length === 0 && !startedRef.current) {
      startedRef.current = true;
      void run(q);
    }
  });

  if (!conv) {
    return (
      <Screen header={<ScreenHeader title="Conversation" />}>
        <EmptyState title="Conversation not found" />
      </Screen>
    );
  }

  // The crisis banner stays up once any message in this conversation has triggered it.
  const showCrisis = crisis || conv.messages.some((m) => m.role === 'user' && detectCrisis(m.text));

  const send = () => {
    const t = draft.trim();
    if (!t || busy) return;
    setDraft('');
    void run(t);
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        scroll={false}
        header={<ScreenHeader title={`${modeInfo(conv.mode).label} · ${GUIDE_NAME[guide]}`} />}
        footer={
          <View style={styles.inputRow}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={`Write to ${GUIDE_SHORT[guide]}…`}
              placeholderTextColor={colors.placeholder}
              selectionColor={colors.accent}
              keyboardAppearance={scheme}
              multiline
              style={styles.input}
            />
            {busy ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Stop" onPress={() => abortRef.current?.abort()} style={styles.send}>
                <StopIcon />
              </Pressable>
            ) : (
              <Pressable accessibilityRole="button" accessibilityLabel="Send" disabled={!draft.trim()} onPress={send} style={[styles.send, !draft.trim() && styles.disabled]}>
                <SendIcon />
              </Pressable>
            )}
          </View>
        }>
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled">
          {showCrisis ? <CrisisBanner /> : null}
          {conv.messages.length === 0 && !busy ? (
            <Txt variant="bodyDim" italic center>
              {`${modeInfo(conv.mode).blurb}. ${GUIDE_SHORT[guide]} is listening.`}
            </Txt>
          ) : null}
          {conv.messages.map((m, i) => (
            <Bubble key={i} m={m} guide={guide} onRetry={i === conv.messages.length - 1 ? () => void run(null) : undefined} />
          ))}
          {busy ? (
            <View style={styles.jung}>
              <Txt variant="label" color={colors.gold}>
                {GUIDE_SHORT[guide]}
              </Txt>
              {streaming ? (
                <Markdown serif>{streaming}</Markdown>
              ) : (
                <Txt variant="bodyDim" italic>{`${GUIDE_SHORT[guide]} is ${guide === 'neville' ? 'considering' : 'reflecting'}…`}</Txt>
              )}
            </View>
          ) : null}
          {refused ? (
            <Txt variant="small" color={colors.gold}>
              This reply was declined by the AI’s safety system. Try rephrasing, or start a new conversation.
            </Txt>
          ) : null}
          {error ? (
            <View style={styles.error}>
              <Txt variant="small" color={colors.danger}>
                {error.text}
              </Txt>
              {error.noKey ? null : (
                <Button label="Try again" variant="subtle" small onPress={() => void run(null)} />
              )}
            </View>
          ) : null}
        </ScrollView>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    messages: { gap: space(4), paddingVertical: space(2) },
    userWrap: { alignItems: 'flex-end', gap: space(1) },
    user: { maxWidth: '85%', backgroundColor: t.colors.accentSoft, borderRadius: radii.lg, borderBottomRightRadius: 4, padding: space(3) },
    failed: { borderWidth: 1, borderColor: t.colors.danger },
    jung: { gap: space(2), paddingRight: space(4) },
    error: { gap: space(2) },
    inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space(2) },
    input: {
      flex: 1,
      minHeight: 48,
      maxHeight: 140,
      ...t.fonts.body,
      fontSize: 16,
      color: t.colors.text,
      backgroundColor: t.colors.bgElev,
      borderWidth: 1,
      borderColor: t.colors.fieldBorder,
      borderRadius: radii.lg,
      paddingHorizontal: space(4),
      paddingVertical: space(3),
    },
    send: { width: 48, height: 48, borderRadius: 24, backgroundColor: t.colors.accent, alignItems: 'center', justifyContent: 'center' },
    disabled: { opacity: 0.4 },
  });
