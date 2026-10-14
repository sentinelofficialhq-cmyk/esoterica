import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useSettingsStore } from '@/store/settingsStore';
import { THEME_IDS, THEMES } from '@/ui/themes';
import { useTheme } from '@/ui/ThemeProvider';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

/** Three looks, each previewed with its own colors. Switching applies at once. */
export function AppearancePicker() {
  const t = useTheme();
  const chosen = useSettingsStore((s) => s.theme);
  const update = useSettingsStore((s) => s.update);
  return (
    <View style={styles.list} accessibilityRole="radiogroup" accessibilityLabel="Appearance">
      {THEME_IDS.map((id) => {
        const look = THEMES[id];
        const on = id === chosen;
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
            <LinearGradient colors={[look.gradients.glows[0].color, look.colors.bg]} start={{ x: 0.5, y: 1 }} end={{ x: 0.5, y: 0 }} style={styles.swatch}>
              <LinearGradient colors={look.gradients.numeral} style={styles.dot} />
              <Text style={[styles.sample, { color: look.colors.accentBright }]}>1</Text>
            </LinearGradient>
            <View style={styles.flex}>
              <Txt variant="body" style={{ fontFamily: t.fonts.bodyBold }}>
                {look.name}
              </Txt>
              <Txt variant="small">{look.blurb}</Txt>
            </View>
            <View style={[styles.radio, { borderColor: on ? t.colors.accent : t.colors.borderHi }]}>{on ? <View style={[styles.radioDot, { backgroundColor: t.colors.accent }]} /> : null}</View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: space(2) },
  option: { flexDirection: 'row', alignItems: 'center', gap: space(3), padding: space(3), borderRadius: 18, borderWidth: 1 },
  pressed: { opacity: 0.85 },
  swatch: { width: 54, height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  dot: { position: 'absolute', top: 6, right: 6, width: 10, height: 10, borderRadius: 5 },
  sample: { fontSize: 26, fontWeight: '700' },
  flex: { flex: 1 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
});
