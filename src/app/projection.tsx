import { router } from 'expo-router';
import { useState } from 'react';

import { startConversation } from '@/ai/start';
import { todayLocal } from '@/lib/date';
import { useJournalStore } from '@/store/journalStore';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { TextField } from '@/ui/TextField';
import { Txt } from '@/ui/Txt';

const STEPS = [
  { key: 'who', label: '1 · Who triggered you?', placeholder: 'A person, a group, a public figure…' },
  { key: 'what', label: '2 · What exactly did they do?', placeholder: 'Describe it plainly, without judging yet' },
  { key: 'quality', label: '3 · What quality does that show?', placeholder: 'e.g. arrogance, neediness, laziness, boldness' },
  { key: 'inMe', label: '4 · Where might that quality live in you?', placeholder: 'Even a small, hidden version of it' },
  { key: 'owning', label: '5 · What would owning a little of it look like?', placeholder: 'A healthy dose you could allow yourself' },
] as const;

type Answers = Record<(typeof STEPS)[number]['key'], string>;

export default function ProjectionCheck() {
  const addProjection = useJournalStore((s) => s.addProjection);
  const [a, setA] = useState<Answers>({ who: '', what: '', quality: '', inMe: '', owning: '' });
  const complete = STEPS.every((s) => a[s.key].trim());

  const save = (thenAsk: boolean) => {
    addProjection({ date: todayLocal(), who: a.who.trim(), what: a.what.trim(), quality: a.quality.trim(), inMe: a.inMe.trim(), owning: a.owning.trim() });
    if (thenAsk) {
      const id = startConversation({ mode: 'shadow' });
      const q = `A projection check. Who triggered me: ${a.who}. What they did: ${a.what}. The quality it shows: ${a.quality}. Where it might live in me: ${a.inMe}. Owning a little of it might look like: ${a.owning}.`;
      router.replace({ pathname: '/chat', params: { id, q } });
    } else {
      router.back();
    }
  };

  return (
    <Screen header={<ScreenHeader title="Projection check" />}>
      <Txt variant="bodyDim">
        When someone irritates us out of all proportion, Jung suggested we may be seeing something of our own in them. Go slowly; be kind to yourself.
      </Txt>
      {STEPS.map((s) => (
        <TextField
          key={s.key}
          label={s.label}
          value={a[s.key]}
          onChangeText={(t) => setA((prev) => ({ ...prev, [s.key]: t }))}
          placeholder={s.placeholder}
          multiline={s.key !== 'who'}
        />
      ))}
      <Button label="Save and explore with Jung" disabled={!complete} onPress={() => save(true)} />
      <Button label="Just save" variant="ghost" disabled={!complete} onPress={() => save(false)} />
    </Screen>
  );
}
