import type { ReactElement } from 'react';
import { StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';

import { useSettingsStore } from '@/store/settingsStore';
import { Columns } from '@/ui/Bars';
import { EnergyBar, EnergyMeter } from '@/ui/Energy';
import { ScoreRing } from '@/ui/ScoreRing';
import { ThemeProvider } from '@/ui/ThemeProvider';
import { THEME_IDS, THEMES, type ThemeId } from '@/ui/themes';

let mounted: ReactTestRenderer | null = null;

afterEach(() => {
  act(() => mounted?.unmount());
  mounted = null;
});

function render(id: ThemeId, el: ReactElement): ReactTestInstance {
  useSettingsStore.setState({ theme: id });
  act(() => {
    mounted = create(<ThemeProvider>{el}</ThemeProvider>);
  });
  return mounted!.root;
}

const flat = <S,>(node: ReactTestInstance) => StyleSheet.flatten(node.props.style) as S;
const textNode = (root: ReactTestInstance, content: string) =>
  root.findAll((n) => n.type === Text && [n.props.children].flat().join('') === content)[0];

describe.each(THEME_IDS)('%s', (id) => {
  const t = THEMES[id];

  test('EnergyBar takes the look meter and fills to the score', () => {
    const root = render(id, <EnergyBar score={130} />);
    const bar = root.findAll((n) => n.type === View && n.props.accessibilityRole === 'progressbar')[0];
    expect(bar.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 100 });
    expect(flat<ViewStyle>(bar)).toMatchObject({ height: t.shape.meter.height, borderRadius: t.shape.meter.radius, backgroundColor: t.colors.meterTrack });
    const fill = bar.findAll((n) => n.type === View && n !== bar)[0];
    expect(flat<ViewStyle>(fill)).toMatchObject({ width: '100%', backgroundColor: t.colors.accent });
  });

  test('EnergyMeter shows the score in the numeral face with its label', () => {
    const root = render(id, <EnergyMeter score={70} label="Good" />);
    expect(root.findAll((n) => n.props.accessibilityLabel === 'Energy 70 of 100, Good').length).toBeGreaterThan(0);
    expect(flat<TextStyle>(textNode(root, '70'))).toMatchObject({ ...t.fonts.numeral, fontSize: 34, lineHeight: 38, fontVariant: ['tabular-nums'] });
    expect(flat<TextStyle>(textNode(root, 'Good'))).toMatchObject({ ...t.fonts.bodySemi, fontSize: 12, color: t.colors.textDim });
  });

  test('micro labels follow the look label case', () => {
    const root = render(id, <ScoreRing score={64} label="Good" caption="Compatibility" />);
    const caption = flat<TextStyle>(textNode(root, 'Compatibility'));
    expect(caption.textTransform).toBe(t.shape.labelCase === 'upper' ? 'uppercase' : 'none');
    if (t.shape.labelCase === 'sentence') expect(caption.letterSpacing).toBe(0);
  });

  test('forecast columns follow the chart trait and draw no glow without dataGlow', () => {
    const data = [
      { key: 'a', label: 'Mon', value: 40 },
      { key: 'b', label: 'Tue', value: 80, highlight: true },
    ];
    const root = render(id, <Columns data={data} />);
    const columns = root.findAll((n) => n.type === View && typeof flat<ViewStyle>(n)?.maxWidth === 'number');
    expect(columns).toHaveLength(2);
    const strong = flat<ViewStyle>(columns[1]);
    expect(strong.width).toBe(t.shape.chart === 'hairline' ? 10 : '62%');
    if (t.shadows.dataGlow) expect(strong).toMatchObject({ shadowColor: t.colors.accent, shadowOpacity: t.shadows.dataGlow.opacity });
    else expect(strong.shadowOpacity).toBeUndefined();
  });
});
