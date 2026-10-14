import { Fragment, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import { space } from '@/ui/theme';

type Block = { kind: 'h1' | 'h2' | 'p' | 'li'; text: string };

/** Split markdown into headings, list items and paragraphs. Enough for Jung's replies and readings. */
export function parseBlocks(md: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ kind: 'p', text: para.join(' ') });
    para = [];
  };
  for (const raw of md.replace(/\r/g, '').split('\n')) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    const li = /^(?:[-*•]|\d+\.)\s+(.*)$/.exec(line);
    if (h) {
      flush();
      blocks.push({ kind: h[1].length === 1 ? 'h1' : 'h2', text: h[2] });
    } else if (li) {
      flush();
      blocks.push({ kind: 'li', text: li[1] });
    } else {
      para.push(line);
    }
  }
  flush();
  return blocks;
}

/** Inline **bold** and *italic*. */
function inline(text: string, baseKey: string, styles: ReturnType<typeof makeStyles>): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={`${baseKey}-${i}`} style={styles.bold}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <Text key={`${baseKey}-${i}`} style={styles.italic}>
          {part.slice(1, -1)}
        </Text>
      );
    }
    return <Fragment key={`${baseKey}-${i}`}>{part}</Fragment>;
  });
}

/** `serif` sets Jung's and Neville's voice (`typography.prose`); it keeps its old name. */
export function Markdown({ children, serif = false, color: colorProp }: { children: string; serif?: boolean; color?: string }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const color = colorProp ?? colors.text;
  const blocks = parseBlocks(children);
  const bodyStyle = [serif ? styles.serif : styles.body, { color }];
  return (
    <View style={styles.wrap}>
      {blocks.map((b, i) => {
        const key = `b${i}`;
        if (b.kind === 'h1' || b.kind === 'h2') {
          return (
            <Text key={key} style={[b.kind === 'h1' ? styles.h1 : styles.h2, { color }]}>
              {inline(b.text, key, styles)}
            </Text>
          );
        }
        if (b.kind === 'li') {
          return (
            <View key={key} style={styles.li}>
              <Text style={[bodyStyle, styles.bullet]}>•</Text>
              <Text style={[bodyStyle, styles.liText]}>{inline(b.text, key, styles)}</Text>
            </View>
          );
        }
        return (
          <Text key={key} style={bodyStyle}>
            {inline(b.text, key, styles)}
          </Text>
        );
      })}
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    wrap: { gap: space(3) },
    body: { ...t.fonts.body, fontSize: 16, lineHeight: 24 },
    serif: t.typography.prose,
    h1: { ...t.fonts.displaySemi, fontSize: 22, lineHeight: 28 },
    h2: { ...t.fonts.displaySemi, fontSize: 18, lineHeight: 24, marginTop: space(1) },
    bold: { ...t.fonts.strong },
    italic: { ...t.fonts.emphasis },
    li: { flexDirection: 'row', gap: space(2) },
    bullet: { color: t.colors.accent },
    liText: { flex: 1 },
  });
