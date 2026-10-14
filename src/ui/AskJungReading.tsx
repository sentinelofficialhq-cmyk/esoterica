import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/ui/ThemeProvider';
import { describeAIError, getProvider, NoKeyError } from '@/ai/client';
import { GUIDE_SHORT, type GuideId } from '@/ai/modes';
import { startConversation, systemPromptFor } from '@/ai/start';
import type { StoredMessage } from '@/ai/types';
import { todayLocal } from '@/lib/date';
import type { ReadingDoc } from '@/readings/types';
import { useReadingStore } from '@/store/readingStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Markdown } from '@/ui/Markdown';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

/** The user turn that asks a guide for a reading: the reading's computed facts, nothing else. */
export const readingRequest = (doc: ReadingDoc) =>
  `Please give me my ${doc.title} reading. Here are Esoterica's computed facts:\n${JSON.stringify(doc.facts, null, 2)}`;

type Exchange = { system: string; user: StoredMessage; assistant: StoredMessage };

/**
 * "Ask Jung (or Neville) to read this": streams the guide's synthesis of a reading, saves it with the reading,
 * and can continue the exchange as a conversation.
 */
export function AskJungReading({ doc, savedId, onSaved, guide = 'jung' }: { doc: ReadingDoc; savedId: string | null; onSaved: (id: string) => void; guide?: GuideId }) {
  const { colors } = useTheme();
  const saved = useReadingStore((s) => (savedId ? s.readings.find((r) => r.id === savedId) : undefined));
  const name = GUIDE_SHORT[guide];
  const mode = guide === 'neville' ? 'nevilleReading' : 'reading';
  const savedText = (saved?.ai?.guide ?? 'jung') === guide ? saved?.ai?.text : undefined;
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<{ text: string; noKey: boolean } | null>(null);
  const exchange = useRef<Exchange | null>(null);

  const ask = async () => {
    setBusy(true);
    setError(null);
    setText('');
    try {
      const settings = useSettingsStore.getState();
      const provider = await getProvider(settings);
      const system = systemPromptFor(mode);
      const content = readingRequest(doc);
      const user: StoredMessage = { role: 'user', content, text: `Please read: ${doc.title}`, status: 'ok' };
      let buffer = '';
      const res = await provider.streamReply({
        system,
        messages: [user],
        effort: 'medium',
        onText: (d) => {
          buffer += d;
          setText(buffer);
        },
      });
      settings.addUsage(provider.model, res.usage, todayLocal().slice(0, 7));
      if (res.refused || !res.assistant.text.trim()) {
        setError({ text: `${name} could not give this reading. Try again later.`, noKey: false });
        return;
      }
      exchange.current = { system, user, assistant: res.assistant };
      const store = useReadingStore.getState();
      const id = savedId ?? store.saveReading(doc);
      store.setAi(id, { text: res.assistant.text, model: provider.model, guide });
      if (!savedId) onSaved(id);
    } catch (err) {
      setError({ text: describeAIError(err), noKey: err instanceof NoKeyError });
    } finally {
      setBusy(false);
    }
  };

  const continueInChat = () => {
    const ex = exchange.current;
    const aiText = ex?.assistant.text ?? savedText ?? '';
    const id = ex
      ? startConversation({ mode, system: ex.system, seed: [ex.user, ex.assistant], title: doc.title })
      : startConversation({
          mode,
          title: doc.title,
          seed: [
            { role: 'user', content: readingRequest(doc), text: `Please read: ${doc.title}`, status: 'ok' },
            { role: 'assistant', content: aiText, text: aiText, status: 'ok' },
          ],
        });
    router.push({ pathname: '/chat', params: { id } });
  };

  const shown = text || savedText || '';

  return (
    <Card tone="violet">
      <Txt variant="label" color={colors.violet}>
        {shown ? `${name}’s reading` : `Ask ${name} to read this`}
      </Txt>
      {shown ? (
        <Markdown serif>{shown}</Markdown>
      ) : (
        <Txt variant="small" color={colors.text}>
          {guide === 'neville'
            ? 'Neville reads these results as states you can choose to live from, with a verse and a practice for tonight.'
            : 'Jung weaves these results into one reading in his own voice, linked to your type, archetypes and shadow.'}
        </Txt>
      )}
      {busy && !text ? (
        <Txt variant="bodyDim" italic>
          {`${name} is ${guide === 'neville' ? 'considering' : 'reflecting'}…`}
        </Txt>
      ) : null}
      {error ? (
        <View style={{ gap: space(2) }}>
          <Txt variant="small" color={colors.danger}>
            {error.text}
          </Txt>
          {error.noKey ? <Button label="Open Settings" variant="subtle" small onPress={() => router.push('/settings')} /> : null}
        </View>
      ) : null}
      {!busy && !shown ? <Button label={`Ask ${name} to read this`} onPress={ask} /> : null}
      {!busy && shown ? <Button label="Continue in chat" variant="ghost" onPress={continueInChat} /> : null}
    </Card>
  );
}
