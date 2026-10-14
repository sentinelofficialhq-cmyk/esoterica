import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/ui/Button';
import type { Theme } from '@/ui/themes';
import { useStyles } from '@/ui/ThemeProvider';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

/** A quiet countdown for practices. No sound; it simply stops at zero. */
export function Timer({ minutes }: { minutes: number }) {
  const s = useStyles(makeStyles);
  const [left, setLeft] = useState(minutes * 60);
  const [running, setRunning] = useState(false);
  const active = running && left > 0;

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(id);
  }, [active]);

  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  return (
    <View style={s.wrap} accessible accessibilityLabel={`Timer ${mm} minutes ${ss} seconds${active ? ', running' : ''}`}>
      <Text style={s.time}>{`${mm}:${ss}`}</Text>
      {left === 0 ? <Txt variant="small" center>Time. Let the feeling settle, then write a line below.</Txt> : null}
      <View style={s.row}>
        <Button label={active ? 'Pause' : left === minutes * 60 ? 'Start' : 'Resume'} small onPress={() => setRunning(!active)} disabled={left === 0} style={s.flex} />
        <Button
          label="Reset"
          variant="subtle"
          small
          style={s.flex}
          onPress={() => {
            setRunning(false);
            setLeft(minutes * 60);
          }}
        />
      </View>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    wrap: { alignItems: 'center', gap: space(3) },
    time: { ...t.fonts.numeral, fontSize: 48, color: t.colors.text, fontVariant: ['tabular-nums', 'lining-nums'] },
    row: { flexDirection: 'row', gap: space(2), alignSelf: 'stretch' },
    flex: { flex: 1 },
  });
