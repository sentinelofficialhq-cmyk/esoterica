import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { catchUpMemory } from '@/ai/memory';
import { ASK_MODES, GUIDE_SHORT, guideOfMode, modeInfo, NEVILLE_ASK_MODES, type AnyModeId, type GuideId } from '@/ai/modes';
import { startConversation } from '@/ai/start';
import { timeAgo } from '@/lib/timeAgo';
import { useChatStore } from '@/store/chatStore';
import { getKey } from '@/store/secrets';
import { useSettingsStore } from '@/store/settingsStore';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { GearIcon, SendIcon } from '@/ui/icons';
import { IconButton } from '@/ui/IconButton';
import { Orb } from '@/ui/Orb';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { TextField } from '@/ui/TextField';
import type { Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import { Accent, Txt } from '@/ui/Txt';
import { radii, space } from '@/ui/theme';

const FIRST_MODE: Record<GuideId, AnyModeId> = { jung: 'general', neville: 'nevilleGeneral' };
const CUSTOM: AnyModeId[] = ['custom', 'nevilleCustom'];

export default function AskScreen() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ guide?: string }>();
  const provider = useSettingsStore((s) => s.provider);
  const conversations = useChatStore((s) => s.conversations);
  const [guide, setGuide] = useState<GuideId>(params.guide === 'neville' ? 'neville' : 'jung');
  const [mode, setMode] = useState<AnyModeId>(FIRST_MODE[guide]);
  const [focus, setFocus] = useState('');
  const [text, setText] = useState('');
  const [hasKey, setHasKey] = useState(true);
  const modes: AnyModeId[] = guide === 'neville' ? NEVILLE_ASK_MODES : ASK_MODES;
  const name = GUIDE_SHORT[guide];

  useFocusEffect(
    useCallback(() => {
      void catchUpMemory();
      if (provider === 'mock') {
        setHasKey(true);
        return;
      }
      let alive = true;
      getKey(provider).then((k) => alive && setHasKey(!!k));
      return () => {
        alive = false;
      };
    }, [provider]),
  );

  const switchGuide = (g: GuideId) => {
    setGuide(g);
    setMode(FIRST_MODE[g]);
  };

  const begin = (question: string, asMode: AnyModeId = mode) => {
    const q = question.trim();
    if (!q) return;
    const id = startConversation({ mode: asMode, customFocus: CUSTOM.includes(asMode) ? focus : undefined });
    setText('');
    router.push({ pathname: '/chat', params: { id, q } });
  };

  return (
    <Screen
      header={
        <ScreenHeader
          title={`Ask ${name}`}
          right={
            <IconButton label="Settings" onPress={() => router.push('/settings')} size={40}>
              <GearIcon size={18} />
            </IconButton>
          }
        />
      }>
      <View style={styles.switch} accessibilityRole="tablist">
        {(['jung', 'neville'] as GuideId[]).map((g) => (
          <Pressable
            key={g}
            accessibilityRole="tab"
            accessibilityState={{ selected: guide === g }}
            onPress={() => switchGuide(g)}
            style={[styles.switchItem, guide === g && styles.switchOn]}>
            <Txt variant="body" style={styles.switchLabel} color={guide === g ? colors.accentBright : colors.textDim}>
              {g === 'jung' ? 'C.G. Jung' : 'Neville Goddard'}
            </Txt>
          </Pressable>
        ))}
      </View>

      <Txt variant="title">
        {guide === 'jung' ? 'What is on ' : 'What do you want to '}
        <Accent>{guide === 'jung' ? 'your mind?' : 'create?'}</Accent>
      </Txt>

      <View style={styles.orb}>
        <Orb
          size={160}
          onPress={() => begin(guide === 'jung' ? modeInfo('timing').starters[0] : modeInfo('nevilleScene').starters[0], guide === 'jung' ? 'timing' : 'nevilleScene')}
          label={guide === 'jung' ? 'Ask Jung how to use today’s energy' : 'Ask Neville to help you build a scene'}
        />
      </View>

      {!hasKey ? (
        <Card tone="gold" onPress={() => router.push('/settings')}>
          <Txt variant="heading">{`Connect ${name}`}</Txt>
          <Txt variant="small" color={colors.text}>
            Add a Claude, Gemini or OpenAI API key in Settings. It stays on this device, and your guides use it to answer you directly.
          </Txt>
        </Card>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {modes.map((m) => (
          <Chip key={m} label={modeInfo(m).label} selected={mode === m} onPress={() => setMode(m)} />
        ))}
      </ScrollView>
      <Txt variant="small">{modeInfo(mode).blurb}</Txt>
      {CUSTOM.includes(mode) ? <TextField label="Focus for this conversation" value={focus} onChangeText={setFocus} placeholder="e.g. my career change" /> : null}

      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={`Ask ${name} anything…`}
          placeholderTextColor={colors.textFaint}
          selectionColor={colors.accent}
          multiline
          style={styles.input}
          accessibilityLabel={`Ask ${name} anything`}
          onSubmitEditing={() => begin(text)}
        />
        <Pressable accessibilityRole="button" accessibilityLabel="Send" disabled={!text.trim()} onPress={() => begin(text)} style={[styles.send, !text.trim() && styles.sendDisabled]}>
          <SendIcon />
        </Pressable>
      </View>

      <View style={styles.list}>
        {modeInfo(mode).starters.map((s) => (
          <Card key={s} onPress={() => begin(s)} style={styles.starter}>
            <Txt variant="body" italic>
              {s}
            </Txt>
          </Card>
        ))}
      </View>

      {conversations.length ? (
        <View style={styles.list}>
          <Txt variant="label">Your conversations</Txt>
          {conversations.map((c) => {
            const last = c.messages[c.messages.length - 1];
            const who = GUIDE_SHORT[guideOfMode(c.mode)];
            return (
              <Card key={c.id} onPress={() => router.push({ pathname: '/chat', params: { id: c.id } })}>
                <View style={styles.convHead}>
                  <Txt variant="body" numberOfLines={1} style={styles.flex}>
                    {c.title}
                  </Txt>
                  <Chip label={who} tone={who === 'Neville' ? 'gold' : 'violet'} />
                  <Txt variant="small">{timeAgo(c.updatedAt)}</Txt>
                </View>
                <Txt variant="small" numberOfLines={2}>
                  {`${modeInfo(c.mode).label}${last ? ` · ${last.text}` : ''}`}
                </Txt>
              </Card>
            );
          })}
        </View>
      ) : null}

      <Txt variant="small" center>
        {guide === 'jung'
          ? 'Jung here is an AI inspired by Carl Jung’s writings, not Jung himself and not a therapist.'
          : 'Neville here is an AI modeled on Neville Goddard’s lectures and books, not Neville himself. His practices are inner work, not promises of outcomes.'}
      </Txt>
    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    switch: {
      flexDirection: 'row',
      padding: 4,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: t.colors.border,
      backgroundColor: t.colors.card,
    },
    switchItem: { flex: 1, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
    switchOn: { backgroundColor: t.colors.accentSoft, borderWidth: 1, borderColor: t.colors.accentBorder },
    switchLabel: { fontFamily: t.fonts.bodyBold, fontSize: 14 },
    orb: { alignItems: 'center' },
    chips: { gap: space(2), paddingRight: space(4) },
    inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space(2) },
    input: {
      flex: 1,
      minHeight: 52,
      maxHeight: 140,
      fontFamily: t.fonts.body,
      fontSize: 16,
      color: t.colors.text,
      backgroundColor: t.colors.cardSolid,
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: radii.lg,
      paddingHorizontal: space(4),
      paddingVertical: space(3),
    },
    send: { width: 52, height: 52, borderRadius: 26, backgroundColor: t.colors.accent, alignItems: 'center', justifyContent: 'center' },
    sendDisabled: { opacity: 0.4 },
    list: { gap: space(2) },
    starter: { paddingVertical: space(3) },
    convHead: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
  });
