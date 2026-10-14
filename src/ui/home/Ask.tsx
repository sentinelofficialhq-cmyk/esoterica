import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState, type ComponentType } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import type { ModeId } from '@/ai/modes';
import { startConversation } from '@/ai/start';
import { Card } from '@/ui/Card';
import { LinkLine } from '@/ui/home/LinkLine';
import { ChartIcon, DateCheckIcon, SendIcon, ShadowIcon, SparkleIcon } from '@/ui/icons';
import type { Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import { Txt } from '@/ui/Txt';
import { solidFill, space } from '@/ui/theme';

type Suggestion = {
  q: string;
  /** The chip and link label in the calm and editorial looks; the question sent is still `q`. */
  short: string;
  mode: ModeId;
  icon: ComponentType<{ size?: number; color?: string }>;
  tone: 'teal' | 'violet' | 'accent';
};

const SUGGESTIONS: Suggestion[] = [
  { q: 'What are my strongest days this month?', short: 'My strongest days this month', mode: 'timing', icon: ChartIcon, tone: 'teal' },
  { q: 'What is my shadow trying to show me?', short: 'What is my shadow trying to show me?', mode: 'shadow', icon: ShadowIcon, tone: 'violet' },
  { q: 'When should I start something new?', short: 'When should I start something new?', mode: 'timing', icon: DateCheckIcon, tone: 'accent' },
];
/** The calm and editorial looks offer fewer prompts, the shadow question first. */
const QUICK = [SUGGESTIONS[1], SUGGESTIONS[0]];

/** Starts a conversation in `mode` and opens it with the question. */
const ask = (q: string, mode: ModeId = 'general') => {
  const question = q.trim();
  if (!question) return;
  const id = startConversation({ mode });
  router.push({ pathname: '/chat', params: { id, q: question } });
};

/** The original looks' Ask bar: sparkle tile, pill field with the send button inside, three suggestion cards. */
export function AskBar() {
  const t = useTheme();
  const s = useStyles(makeStyles);
  const [text, setText] = useState('');
  const tones = { teal: t.colors.teal, violet: t.colors.violet, accent: t.colors.accentBright };
  const sendFill = solidFill(t.gradients.cta);
  return (
    <Card style={s.askCard}>
      <View style={s.askRow}>
        <View style={[s.askSpark, { backgroundColor: t.colors.accentSoft, borderColor: t.colors.accentBorder }]}>
          <SparkleIcon size={20} color={t.colors.accentBright} />
        </View>
        <View style={[s.askInputWrap, { borderColor: t.colors.border }]}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Ask Jung anything…"
            placeholderTextColor={t.colors.askPlaceholder}
            selectionColor={t.colors.accent}
            keyboardAppearance={t.scheme}
            onSubmitEditing={() => ask(text)}
            accessibilityLabel="Ask Jung anything"
            style={s.askInput}
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Send" onPress={() => ask(text)} disabled={!text.trim()} style={({ pressed }) => [pressed && s.pressed]}>
            {sendFill ? (
              <View style={[s.send, { backgroundColor: sendFill }, !text.trim() && s.sendOff]}>
                <SendIcon size={18} color={t.colors.onAccent} />
              </View>
            ) : (
              <LinearGradient colors={t.gradients.cta} style={[s.send, !text.trim() && s.sendOff]}>
                <SendIcon size={18} color={t.colors.onAccent} />
              </LinearGradient>
            )}
          </Pressable>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.suggestions}>
        {SUGGESTIONS.map((sg) => (
          <Pressable key={sg.q} accessibilityRole="button" onPress={() => ask(sg.q, sg.mode)} style={({ pressed }) => [s.suggestion, pressed && s.pressed]}>
            <sg.icon size={20} color={tones[sg.tone]} />
            <Txt variant="small" color={t.colors.text} style={s.bold}>
              {sg.q}
            </Txt>
          </Pressable>
        ))}
      </ScrollView>
    </Card>
  );
}

/** A field and a separate solid send button of the same height, its corners following the look's fields. */
function AskField({ height, padding }: { height: number; padding: number }) {
  const t = useTheme();
  const s = useStyles(makeStyles);
  const [text, setText] = useState('');
  const empty = !text.trim();
  const radius = Math.min(t.shape.fieldRadius, height / 2);
  return (
    <View style={s.fieldRow}>
      <View style={[s.field, { height, borderRadius: radius, paddingHorizontal: padding }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Ask Jung anything"
          placeholderTextColor={t.colors.askPlaceholder}
          selectionColor={t.colors.accent}
          keyboardAppearance={t.scheme}
          onSubmitEditing={() => ask(text)}
          accessibilityLabel="Ask Jung anything"
          style={s.fieldInput}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send"
        onPress={() => ask(text)}
        disabled={empty}
        style={({ pressed }) => [s.solidSend, { width: height, height, borderRadius: radius }, empty && s.sendOff, pressed && s.pressed]}>
        <SendIcon size={18} color={t.colors.onAccent} />
      </Pressable>
    </View>
  );
}

/** The calm looks' Ask card: field, send, and two outline suggestion chips. */
export function CalmAsk() {
  const s = useStyles(makeStyles);
  return (
    <Card style={s.calmCard}>
      <AskField height={44} padding={14} />
      <View style={s.chips}>
        {QUICK.map((sg) => (
          <Pressable key={sg.q} accessibilityRole="button" accessibilityLabel={sg.q} onPress={() => ask(sg.q, sg.mode)} style={({ pressed }) => [s.chip, pressed && s.chipPressed]}>
            <Text style={s.chipText}>{sg.short}</Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

/** The editorial look's Ask: an outlined field on the page with a square send, and one suggestion as a link row. */
export function EditorialAsk() {
  const s = useStyles(makeStyles);
  const [first] = QUICK;
  return (
    <View style={s.editorial}>
      <AskField height={48} padding={16} />
      <LinkLine label={first.short} accessibilityLabel={first.q} onPress={() => ask(first.q, first.mode)} />
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    bold: { ...t.fonts.bodyBold },
    pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
    askCard: { padding: space(3.5), gap: space(3), borderRadius: t.shape.cardRadius + 4 },
    askRow: { flexDirection: 'row', alignItems: 'center', gap: space(2.5) },
    askSpark: { width: 48, height: 48, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    askInputWrap: {
      flex: 1,
      height: 50,
      borderRadius: 25,
      borderWidth: 1,
      backgroundColor: t.colors.inputWell,
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: space(4),
      paddingRight: 6,
    },
    askInput: { flex: 1, minWidth: 0, ...t.ui.askInput, color: t.colors.text },
    send: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
    sendOff: { opacity: 0.5 },
    suggestions: { gap: space(2.5) },
    suggestion: {
      width: 160,
      height: 88,
      borderRadius: 20,
      padding: space(3),
      justifyContent: 'space-between',
      backgroundColor: t.colors.cardHi,
      borderWidth: 1,
      borderColor: t.colors.border,
    },
    fieldRow: { flexDirection: 'row', gap: space(2) },
    field: { flex: 1, minWidth: 0, justifyContent: 'center', borderWidth: 1, borderColor: t.colors.fieldBorder, backgroundColor: t.colors.inputWell },
    fieldInput: { ...t.ui.askInput, color: t.colors.text, paddingVertical: 0 },
    solidSend: { alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.accent },
    calmCard: { padding: space(4), gap: space(3) },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
    chip: {
      minHeight: 36,
      justifyContent: 'center',
      paddingHorizontal: space(3),
      borderRadius: 18,
      borderWidth: 1,
      borderColor: t.colors.chipBorder,
      backgroundColor: t.colors.chipBg,
    },
    chipPressed: { opacity: 0.75 },
    chipText: { ...t.ui.chip, color: t.colors.chipInk },
    editorial: { marginTop: space(5), gap: 10 },
  });
