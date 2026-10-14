import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { practiceById } from '@/content/neville';
import { confirm } from '@/lib/confirm';
import { formatDate, todayLocal } from '@/lib/date';
import { useImaginationStore } from '@/store/imaginationStore';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { SectionLabel } from '@/ui/SectionLabel';
import { TextField } from '@/ui/TextField';
import { useTheme } from '@/ui/ThemeProvider';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

export default function AimScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const aim = useImaginationStore((s) => s.aims.find((a) => a.id === id));
  return aim ? <AimDetail id={aim.id} /> : <NewAim />;
}

function NewAim() {
  const [title, setTitle] = useState('');
  const [scene, setScene] = useState('');
  const ready = title.trim() && scene.trim();
  return (
    <Screen header={<ScreenHeader title="New aim" />}>
      <Txt variant="bodyDim">
        Name what you want, then picture one short moment that would only happen if it were already done. Neville suggested something small
        and specific, felt from inside the scene rather than watched from outside.
      </Txt>
      <TextField label="What do you want?" value={title} onChangeText={setTitle} placeholder="e.g. A job I love in a city by the sea" />
      <TextField
        label="The scene that implies it’s done"
        value={scene}
        onChangeText={setScene}
        multiline
        placeholder="e.g. My best friend hugging me at the door of my new place, saying “you did it”"
      />
      <Button
        label="Save aim"
        disabled={!ready}
        onPress={() => {
          const newId = useImaginationStore.getState().addAim({ title, scene, date: todayLocal() });
          router.replace({ pathname: '/aim', params: { id: newId } });
        }}
      />
    </Screen>
  );
}

function AimDetail({ id }: { id: string }) {
  const t = useTheme();
  const aim = useImaginationStore((s) => s.aims.find((a) => a.id === id));
  const sessions = useImaginationStore((s) => s.sessions);
  const [note, setNote] = useState('');
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(aim?.title ?? '');
  const [scene, setScene] = useState(aim?.scene ?? '');
  if (!aim) return null;
  const store = useImaginationStore.getState();
  const mine = sessions.filter((x) => x.aimId === id);

  return (
    <Screen header={<ScreenHeader title="Aim" />}>
      {editing ? (
        <>
          <TextField label="What do you want?" value={title} onChangeText={setTitle} />
          <TextField label="The scene that implies it’s done" value={scene} onChangeText={setScene} multiline />
          <Button
            label="Save changes"
            disabled={!title.trim() || !scene.trim()}
            onPress={() => {
              store.updateAim(id, { title: title.trim(), scene: scene.trim() });
              setEditing(false);
            }}
          />
        </>
      ) : (
        <>
          <View style={styles.row}>
            <Txt variant="title" style={styles.flex}>
              {aim.title}
            </Txt>
            <Chip label={aim.status === 'open' ? 'Open' : aim.status === 'fulfilled' ? 'Fulfilled' : 'Released'} tone={aim.status === 'fulfilled' ? 'teal' : aim.status === 'open' ? 'accent' : 'default'} />
          </View>
          <Txt variant="small">{`Since ${formatDate(aim.createdAt)}${aim.closedAt ? ` · closed ${formatDate(aim.closedAt)}` : ''}`}</Txt>
          <Card tone="accent">
            <Txt variant="label" color={t.colors.accentBright}>
              The scene
            </Txt>
            <Txt variant="body">{aim.scene}</Txt>
          </Card>
        </>
      )}

      {aim.status === 'open' && !editing ? (
        <View style={styles.group}>
          <Button label="Practice this scene tonight" onPress={() => router.push({ pathname: '/practice', params: { kind: 'scene', aim: id } })} />
          <Button label="Live from the end today" variant="subtle" onPress={() => router.push({ pathname: '/practice', params: { kind: 'end', aim: id } })} />
        </View>
      ) : null}

      <View style={styles.group}>
        <SectionLabel>Signs along the way</SectionLabel>
        {aim.notes.length === 0 ? <Txt variant="small">Write down anything you notice: a conversation, an opening, a change in how you feel.</Txt> : null}
        {aim.notes.map((n, i) => (
          <Card key={`${n.date}-${i}`}>
            <Txt variant="small" color={t.colors.text}>
              {formatDate(n.date)}
            </Txt>
            <Txt variant="body">{n.text}</Txt>
          </Card>
        ))}
        <TextField value={note} onChangeText={setNote} placeholder="What did you notice?" accessibilityLabel="New sign" />
        <Button
          label="Add sign"
          variant="subtle"
          small
          disabled={!note.trim()}
          onPress={() => {
            store.addAimNote(id, note, todayLocal());
            setNote('');
          }}
        />
      </View>

      {mine.length ? (
        <View style={styles.group}>
          <SectionLabel>{`Practice sessions · ${mine.length}`}</SectionLabel>
          {mine.slice(0, 10).map((x) => (
            <Card key={x.id}>
              <View style={styles.row}>
                <Txt variant="body" style={styles.flex}>
                  {practiceById(x.kind)?.title ?? x.kind}
                </Txt>
                <Txt variant="small">{formatDate(x.date)}</Txt>
              </View>
              {x.text ? <Txt variant="small">{x.text}</Txt> : null}
            </Card>
          ))}
        </View>
      ) : null}

      <View style={styles.group}>
        {aim.status === 'open' ? (
          <View style={styles.row}>
            <Button label="It’s fulfilled" variant="subtle" style={styles.flex} onPress={() => store.closeAim(id, 'fulfilled', todayLocal())} />
            <Button label="Release it" variant="ghost" style={styles.flex} onPress={() => store.closeAim(id, 'released', todayLocal())} />
          </View>
        ) : (
          <Button label="Reopen" variant="subtle" onPress={() => store.reopenAim(id)} />
        )}
        {!editing ? <Button label="Edit" variant="ghost" small onPress={() => setEditing(true)} /> : null}
        <Button
          label="Delete aim"
          variant="ghost"
          small
          onPress={async () => {
            if (await confirm('Delete this aim?', 'Its signs are deleted too. Practice sessions stay in your history.', 'Delete')) {
              store.removeAim(id);
              router.back();
            }
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: space(2) },
  row: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
  flex: { flex: 1 },
});
