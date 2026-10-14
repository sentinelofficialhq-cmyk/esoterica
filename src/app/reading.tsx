import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import type { GuideId } from '@/ai/modes';

import { buildReading, type ReadingParams } from '@/readings/fromParams';
import { useReadingContext } from '@/readings/useReadingContext';
import { useReadingStore } from '@/store/readingStore';
import { AskJungReading } from '@/ui/AskJungReading';
import { Button } from '@/ui/Button';
import { Chip } from '@/ui/Chip';
import { EmptyState } from '@/ui/EmptyState';
import { ReadingView } from '@/ui/ReadingView';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

function normalize(params: Record<string, string | string[] | undefined>): ReadingParams {
  return Object.fromEntries(Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
}

export default function ReadingScreen() {
  const params = normalize(useLocalSearchParams());
  const ctx = useReadingContext();
  const saved = useReadingStore((s) => (params.id ? s.readings.find((r) => r.id === params.id) : undefined));
  const saveReading = useReadingStore((s) => s.saveReading);
  const [savedId, setSavedId] = useState<string | null>(params.id ?? null);
  const [guide, setGuide] = useState<GuideId>(saved?.ai?.guide ?? 'jung');

  const doc = saved?.doc ?? (ctx ? buildReading(params, ctx) : null);

  if (!doc) {
    return (
      <Screen header={<ScreenHeader title="Reading" />}>
        <EmptyState title="Nothing to read yet" body="This reading needs more information. Go back and try again." />
      </Screen>
    );
  }

  return (
    <Screen header={<ScreenHeader title={doc.subtitle ?? 'Reading'} />}>
      <ReadingView doc={doc} />
      {doc.type === 'type' && String(doc.facts.depth ?? '').startsWith('quick') ? (
        <Button label="Take the 32-question deep dive" onPress={() => router.push({ pathname: '/quiz-types', params: { depth: 'full' } })} />
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(2) }}>
        <Txt variant="label">Read with</Txt>
        <Chip label="Jung" selected={guide === 'jung'} onPress={() => setGuide('jung')} />
        <Chip label="Neville" selected={guide === 'neville'} onPress={() => setGuide('neville')} />
      </View>
      <AskJungReading key={guide} doc={doc} savedId={savedId} onSaved={setSavedId} guide={guide} />
      {savedId ? (
        <Txt variant="small" center>
          Saved to your readings
        </Txt>
      ) : (
        <Button label="Save reading" variant="ghost" onPress={() => setSavedId(saveReading(doc))} />
      )}
    </Screen>
  );
}
