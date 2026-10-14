import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useSettingsStore } from '@/store/settingsStore';
import { NEW_THEME_IDS, ORIGINAL_THEME_IDS, THEME_IDS, THEMES, type ThemeId } from '@/ui/themes';
import { useTheme } from '@/ui/ThemeProvider';
import { Txt } from '@/ui/Txt';
import { solidFill, space } from '@/ui/theme';

const GROUPS: { title: string; ids: ThemeId[] }[] = [
  { title: 'Originals', ids: THEME_IDS.filter((id) => ORIGINAL_THEME_IDS.includes(id)) },
  { title: 'New', ids: THEME_IDS.filter((id) => NEW_THEME_IDS.includes(id)) },
];

/** Six looks, the originals then the new ones, each previewed with its own colors. Switching applies at once. */
export function AppearancePicker() {
  const t = useTheme();
  const chosen = useSettingsStore((s) => s.theme);
  const update = useSettingsStore((s) => s.update);
  return (
    <View style={styles.list} accessibilityRole="radiogroup" accessibilityLabel="Appearance">
      {GROUPS.map((group) => (
        <View key={group.title} style={styles.group}>
          <Txt variant="small" accessibilityRole="header">
            {group.title}
          </Txt>
          {group.ids.map((id) => {
            const look = THEMES[id];
            const on = id === chosen;
            const ground = solidFill(look.preview);
            const numeral = solidFill(look.gradients.numeral);
            const sample = (
              <>
                {numeral ? <View style={[styles.dot, { backgroundColor: numeral }]} /> : <LinearGradient colors={look.gradients.numeral} style={styles.dot} />}
                <Text style={[styles.sample, look.fonts.numeral, { color: look.colors.accentBright }]}>1</Text>
              </>
            );
            return (
              <Pressable
                key={id}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                accessibilityLabel={`${look.name}: ${look.blurb}`}
                onPress={() => update({ theme: id })}
                style={({ pressed }) => [
                  styles.option,
                  { borderColor: on ? t.colors.accentBorder : t.colors.border, backgroundColor: on ? t.colors.accentSoft : t.colors.card },
                  pressed && styles.pressed,
                ]}>
                {ground ? (
                  <View style={[styles.swatch, { backgroundColor: ground }]}>{sample}</View>
                ) : (
                  <LinearGradient colors={look.preview} start={{ x: 0.5, y: 1 }} end={{ x: 0.5, y: 0 }} style={styles.swatch}>
                    {sample}
                  </LinearGradient>
                )}
                <View style={styles.flex}>
                  <Txt variant="body" style={t.fonts.bodyBold}>
                    {look.name}
                  </Txt>
                  <Txt variant="small">{look.blurb}</Txt>
                </View>
                <View style={[styles.radio, { borderColor: on ? t.colors.accent : t.colors.borderHi }]}>{on ? <View style={[styles.radioDot, { backgroundColor: t.colors.accent }]} /> : null}</View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: space(4) },
  group: { gap: space(2) },
  option: { flexDirection: 'row', alignItems: 'center', gap: space(3), padding: space(3), borderRadius: 18, borderWidth: 1 },
  pressed: { opacity: 0.85 },
  swatch: { width: 54, height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  dot: { position: 'absolute', top: 6, right: 6, width: 10, height: 10, borderRadius: 5 },
  sample: { fontSize: 26 },
  flex: { flex: 1 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
});
