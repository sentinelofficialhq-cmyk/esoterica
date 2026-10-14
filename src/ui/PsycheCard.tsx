import { router, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/ui/ThemeProvider';
import { ARCHETYPES, type ArchetypeId } from '@/content/archetypes';
import { FUNCTION_MEANINGS } from '@/content/functions';
import { formatDate } from '@/lib/date';
import { useQuizStore } from '@/store/quizStore';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

type Row = { label: string; value: string | null; takenAt: string | null; reading: Href; quiz: Href };

function PsycheRow({ label, value, takenAt, reading, quiz }: Row) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.flex}>
        <Txt variant="label">{label}</Txt>
        {value ? <Txt variant="body">{value}</Txt> : null}
        {takenAt ? (
          <Txt variant="small">
            {`Taken ${formatDate(takenAt)} · `}
            <Txt variant="small" color={colors.text} accessibilityRole="link" onPress={() => router.push(quiz)}>
              Retake
            </Txt>
          </Txt>
        ) : null}
      </View>
      <Button
        label={value ? 'View' : 'Take quiz'}
        variant={value ? 'subtle' : 'primary'}
        small
        onPress={() => router.push(value ? reading : quiz)}
      />
    </View>
  );
}

/** The three Jung quizzes with their latest results, or a button to take each one. */
export function PsycheCard() {
  const { colors } = useTheme();
  const types = useQuizStore((s) => s.types);
  const archetypes = useQuizStore((s) => s.archetypes);
  const alignment = useQuizStore((s) => s.alignment[0] ?? null);
  return (
    <Card tone="violet">
      <Txt variant="label" color={colors.violet}>
        Your psyche
      </Txt>
      <PsycheRow
        label="Psychological type"
        value={types ? `${FUNCTION_MEANINGS[types.dominant].name} · ${types.code}` : null}
        takenAt={types?.takenAt ?? null}
        reading={{ pathname: '/reading', params: { type: 'type' } }}
        quiz="/quiz-types"
      />
      <PsycheRow
        label="Archetypes"
        value={archetypes ? archetypes.top.map((id) => ARCHETYPES[id as ArchetypeId]?.name).join(' · ') : null}
        takenAt={archetypes?.takenAt ?? null}
        reading={{ pathname: '/reading', params: { type: 'archetype' } }}
        quiz="/quiz-archetypes"
      />
      <PsycheRow
        label="Persona & Self alignment"
        value={alignment ? `${alignment.percent}% · ${alignment.tier}` : null}
        takenAt={alignment?.takenAt ?? null}
        reading={{ pathname: '/reading', params: { type: 'alignment' } }}
        quiz="/quiz-alignment"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space(3), paddingVertical: space(1) },
  flex: { flex: 1, gap: 2 },
});
