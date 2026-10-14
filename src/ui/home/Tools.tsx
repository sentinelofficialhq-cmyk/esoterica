import { router, type Href } from 'expo-router';
import { useState, type ComponentType } from 'react';
import { ScrollView, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { LinkLine } from '@/ui/home/LinkLine';
import {
  BookIcon,
  ChartIcon,
  DateCheckIcon,
  DreamIcon,
  EyeIcon,
  FamilyIcon,
  ImagineIcon,
  MandalaIcon,
  MatchIcon,
  QuizIcon,
  ScriptureIcon,
  ShadowIcon,
  StarIcon,
  SyncIcon,
} from '@/ui/icons';
import type { Theme, ToolKey } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import { Tile } from '@/ui/Tile';
import { space } from '@/ui/theme';

/** A tool without an icon (Letterology) draws the look's `shape.letterGlyph`. */
type Tool = { key: ToolKey; label: string; icon?: ComponentType<{ size?: number; color?: string }>; href: Href };

const TOOLS: Tool[] = [
  { key: 'compat', label: 'Compatibility', icon: MatchIcon, href: '/match' },
  { key: 'date', label: 'Date check', icon: DateCheckIcon, href: { pathname: '/calculator', params: { pick: '1' } } },
  { key: 'neville', label: 'Neville AI', icon: ImagineIcon, href: { pathname: '/ask', params: { guide: 'neville' } } },
  { key: 'letters', label: 'Letterology', href: '/name-reading' },
  { key: 'forecast', label: 'Forecasts', icon: ChartIcon, href: '/calendar' },
  { key: 'readings', label: 'Readings', icon: BookIcon, href: '/readings' },
  { key: 'dreams', label: 'Dreams', icon: DreamIcon, href: '/dreams' },
  { key: 'shadow', label: 'Shadow work', icon: ShadowIcon, href: '/shadow' },
  { key: 'imagine', label: 'Imagination', icon: EyeIcon, href: '/imagine' },
  { key: 'scripture', label: 'Mind & Scripture', icon: ScriptureIcon, href: { pathname: '/learn', params: { group: 'Mind & Scripture' } } },
  { key: 'inner', label: 'Inner work', icon: MandalaIcon, href: '/inner' },
  { key: 'family', label: 'Family', icon: FamilyIcon, href: '/family' },
  { key: 'bestDate', label: 'Best date', icon: StarIcon, href: '/best-date' },
  { key: 'quizzes', label: 'Quizzes', icon: QuizIcon, href: '/quiz-types' },
  { key: 'sync', label: 'Synchronicity', icon: SyncIcon, href: '/synchronicity' },
  { key: 'learn', label: 'Learn', icon: BookIcon, href: '/learn' },
];

/** The calm and editorial looks' four tools, with short labels; the rest are a tap away under More. */
const ROW: Tool[] = [
  { key: 'compat', label: 'Match', icon: MatchIcon, href: '/match' },
  { key: 'dreams', label: 'Dreams', icon: DreamIcon, href: '/dreams' },
  { key: 'shadow', label: 'Shadow', icon: ShadowIcon, href: '/shadow' },
  { key: 'bestDate', label: 'Best day', icon: DateCheckIcon, href: '/best-date' },
];

/** The original looks' tool grid: two swipeable pages of eight tiles, with page dots. */
export function ToolGrid() {
  const s = useStyles(makeStyles);
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);
  const pages = [TOOLS.slice(0, 8), TOOLS.slice(8, 16)].filter((p) => p.length);
  return (
    <View onLayout={(ev) => setWidth(ev.nativeEvent.layout.width)} style={s.gridWrap}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(ev) => width && setPage(Math.round(ev.nativeEvent.contentOffset.x / width))}
        scrollEventThrottle={32}>
        {pages.map((tools, i) => (
          <View key={i} style={[s.grid, { width: width || undefined }]}>
            {tools.map((tool) => (
              <View key={tool.key} style={s.cell}>
                <ToolTile tool={tool} />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
      <View style={s.dots} accessibilityElementsHidden>
        {pages.map((_, i) => (
          <View key={i} style={[s.dot, i === page && s.dotOn]} />
        ))}
      </View>
    </View>
  );
}

/** One row of four tools and a link to every other tool. */
export function ToolRow({ style }: { style?: StyleProp<ViewStyle> }) {
  const s = useStyles(makeStyles);
  return (
    <View style={style}>
      <View style={s.row}>
        {ROW.map((tool) => (
          <ToolTile key={tool.key} tool={tool} />
        ))}
      </View>
      <LinkLine label="All tools" accessibilityLabel="All tools" onPress={() => router.push('/more')} />
    </View>
  );
}

function ToolTile({ tool }: { tool: Tool }) {
  const t = useTheme();
  return <Tile label={tool.label} tool={tool.key} icon={tool.icon} glyph={tool.icon ? undefined : t.shape.letterGlyph} onPress={() => router.push(tool.href)} />;
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    gridWrap: { gap: space(3) },
    grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: space(4) },
    cell: { width: '25%' },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: t.colors.borderHi },
    dotOn: { width: 18, backgroundColor: t.colors.accentBright },
    row: { flexDirection: 'row', gap: space(2) },
  });
