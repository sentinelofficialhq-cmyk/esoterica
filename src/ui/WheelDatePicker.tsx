import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import type { Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import { daysInMonth as daysIn, parseYMD, toYMD } from '@/lib/date';
import { TextField } from '@/ui/TextField';
import { Txt } from '@/ui/Txt';
import { radii, space } from '@/ui/theme';

const ITEM = 40;
const VISIBLE = 5;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type WheelProps = { items: string[]; index: number; onChange: (index: number) => void; width: number; label: string };

/** One snapping column. Works on web too (snap is done after scrolling settles). */
function Wheel({ items, index, onChange, width, label }: WheelProps) {
  const styles = useStyles(makeStyles);
  const ref = useRef<ScrollView>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    ref.current?.scrollTo({ y: index * ITEM, animated: false });
  }, [index, items.length]);

  const finish = (y: number) => {
    const i = Math.max(0, Math.min(items.length - 1, Math.round(y / ITEM)));
    ref.current?.scrollTo({ y: i * ITEM, animated: true });
    if (i !== index) onChange(i);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => finish(y), 140);
  };

  return (
    <View style={{ width, height: ITEM * VISIBLE }} accessible accessibilityLabel={`${label}: ${items[index]}`}>
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={onScroll}
        contentOffset={{ x: 0, y: index * ITEM }}
        contentContainerStyle={{ paddingVertical: ITEM * 2 }}>
        {items.map((label, i) => (
          <Pressable key={`${label}-${i}`} style={styles.item} onPress={() => onChange(i)}>
            <Text style={[styles.itemText, i === index && styles.itemTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

type Props = { value: string; onChange: (value: string) => void; minYear?: number; maxYear?: number };

export function WheelDatePicker({ value, onChange, minYear = 1900, maxYear = new Date().getFullYear() }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { y, m, d } = parseYMD(value);
  const [typing, setTyping] = useState(false);
  const [typed, setTyped] = useState(value);

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => String(minYear + i));
  const days = Array.from({ length: daysIn(y, m) }, (_, i) => String(i + 1).padStart(2, '0'));

  const set = (ny: number, nm: number, nd: number) => onChange(toYMD({ y: ny, m: nm, d: Math.min(nd, daysIn(ny, nm)) }));

  if (typing) {
    let valid = true;
    try {
      parseYMD(typed);
    } catch {
      valid = false;
    }
    return (
      <View style={styles.typedWrap}>
        <TextField
          label="Date (YYYY-MM-DD)"
          value={typed}
          onChangeText={(t) => {
            setTyped(t);
            try {
              parseYMD(t);
              onChange(t);
            } catch {
              // keep typing
            }
          }}
          autoCapitalize="none"
          keyboardType="numbers-and-punctuation"
          hint={valid ? undefined : 'Use the format 1990-05-14'}
        />
        <Pressable onPress={() => setTyping(false)}>
          <Txt variant="small" color={colors.accent}>
            Use the wheels instead
          </Txt>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.wheels}>
        <View pointerEvents="none" style={styles.band} />
        <Wheel label="Month" width={84} items={MONTHS} index={m - 1} onChange={(i) => set(y, i + 1, d)} />
        <Wheel label="Day" width={64} items={days} index={d - 1} onChange={(i) => set(y, m, i + 1)} />
        <Wheel label="Year" width={88} items={years} index={Math.max(0, y - minYear)} onChange={(i) => set(minYear + i, m, d)} />
      </View>
      <Pressable
        onPress={() => {
          setTyped(value);
          setTyping(true);
        }}>
        <Txt variant="small" color={colors.textDim} center>
          Scroll or tap each wheel · <Txt variant="small" color={colors.accent}>type it instead</Txt>
        </Txt>
      </Pressable>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    wrap: { gap: space(3) },
    wheels: { flexDirection: 'row', justifyContent: 'center', gap: space(2), position: 'relative' },
    band: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: ITEM * 2,
      height: ITEM,
      borderRadius: radii.md,
      backgroundColor: t.colors.accentSoft,
      borderWidth: 1,
      borderColor: 'rgba(255,122,47,0.35)',
    },
    item: { height: ITEM, alignItems: 'center', justifyContent: 'center' },
    itemText: { fontFamily: t.fonts.bodyHeavy, fontSize: 16, color: t.colors.textFaint },
    itemTextActive: { color: t.colors.text, fontSize: 18 },
    typedWrap: { gap: space(3) },
  });
