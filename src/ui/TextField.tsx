import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import type { Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import { Txt } from '@/ui/Txt';
import { radii, space } from '@/ui/theme';

type Props = TextInputProps & { label?: string; hint?: string };

export function TextField({ label, hint, style, multiline, ...rest }: Props) {
  const t = useTheme();
  const s = useStyles(makeStyles);
  return (
    <View style={s.wrap}>
      {label ? <Txt variant="label">{label}</Txt> : null}
      <TextInput
        placeholderTextColor={t.colors.textFaint}
        selectionColor={t.colors.accent}
        multiline={multiline}
        {...rest}
        style={[s.input, multiline && s.multiline, style]}
      />
      {hint ? <Txt variant="small">{hint}</Txt> : null}
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    wrap: { gap: space(2) },
    input: {
      fontFamily: t.fonts.body,
      fontSize: 16,
      color: t.colors.text,
      backgroundColor: t.colors.cardSolid,
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: radii.md + 4,
      paddingHorizontal: space(4),
      paddingVertical: space(3),
      minHeight: 52,
    },
    multiline: { minHeight: 120, textAlignVertical: 'top', lineHeight: 22 },
  });
