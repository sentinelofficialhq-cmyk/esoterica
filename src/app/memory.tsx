import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/ui/ThemeProvider';
import { confirm } from '@/lib/confirm';
import { MEMORY_CATEGORIES, useMemoryStore, type MemoryNote } from '@/store/memoryStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { EmptyState } from '@/ui/EmptyState';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { TextField } from '@/ui/TextField';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

function NoteRow({ note }: { note: MemoryNote }) {
  const { colors } = useTheme();
  const updateNote = useMemoryStore((s) => s.updateNote);
  const removeNote = useMemoryStore((s) => s.removeNote);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note.text);

  if (editing) {
    return (
      <View style={styles.edit}>
        <TextField value={text} onChangeText={setText} multiline />
        <View style={styles.row}>
          <Button label="Save" small onPress={() => { updateNote(note.id, text.trim() || note.text); setEditing(false); }} />
          <Button label="Cancel" small variant="ghost" onPress={() => { setText(note.text); setEditing(false); }} />
        </View>
      </View>
    );
  }
  return (
    <View style={styles.note}>
      <Txt variant="body" style={styles.flex}>
        {note.text}
      </Txt>
      <Txt variant="small" color={colors.accent} onPress={() => setEditing(true)}>
        Edit
      </Txt>
      <Txt variant="small" color={colors.danger} onPress={() => removeNote(note.id)}>
        Forget
      </Txt>
    </View>
  );
}

export default function Memory() {
  const { colors } = useTheme();
  const notes = useMemoryStore((s) => s.notes);
  const clear = useMemoryStore((s) => s.clear);
  const enabled = useSettingsStore((s) => s.memoryEnabled);

  return (
    <Screen header={<ScreenHeader title="What Jung remembers" />}>
      <Txt variant="bodyDim">
        After a conversation, Jung keeps a few short notes so he can pick up where you left off. They stay on this device. Edit or remove anything.
      </Txt>
      {!enabled ? <Txt variant="small" color={colors.gold}>Memory is turned off in Settings, so no new notes will be added.</Txt> : null}
      {notes.length === 0 ? (
        <EmptyState title="Nothing yet" body="Notes appear here after you’ve had a conversation with Jung." />
      ) : (
        MEMORY_CATEGORIES.filter((c) => notes.some((n) => n.category === c)).map((c) => (
          <Card key={c}>
            <Txt variant="label">{c}</Txt>
            {notes
              .filter((n) => n.category === c)
              .map((n) => (
                <NoteRow key={n.id} note={n} />
              ))}
          </Card>
        ))
      )}
      {notes.length ? (
        <Button
          label="Forget everything"
          variant="ghost"
          onPress={async () => {
            if (await confirm('Forget everything?', 'All of Jung’s notes about you will be deleted.', 'Forget')) clear();
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: space(3), paddingVertical: space(1) },
  edit: { gap: space(2) },
  row: { flexDirection: 'row', gap: space(2) },
  flex: { flex: 1 },
});
