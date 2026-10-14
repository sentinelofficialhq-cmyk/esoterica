import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import type { Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

type Props = TextInputProps & { label?: string; hint?: string };

export function TextField({ label, hint, style, multiline, ...rest }: Props) {
  const t = useTheme();
  const s = useStyles(makeStyles);
  return (
    <View style={s.wrap}>
      {label ? <Txt variant="label">{label}</Txt> : null}
      <TextInput
        placeholderTextColor={t.colors.placeholder}
        selectionColor={t.colors.accent}
        keyboardAppearance={t.scheme}
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
      ...t.fonts.body,
      fontSize: 16,
      color: t.colors.text,
      backgroundColor: t.colors.field,
      borderWidth: 1,
      borderColor: t.colors.fieldBorder,
      borderRadius: t.shape.fieldRadius,
      paddingHorizontal: space(4),
      paddingVertical: space(3),
      minHeight: 52,
    },
    multiline: { minHeight: 120, textAlignVertical: 'top', lineHeight: 22 },
  });
