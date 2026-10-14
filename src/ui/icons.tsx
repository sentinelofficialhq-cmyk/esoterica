import type React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import type { Theme } from '@/ui/themes';
import { useTheme } from '@/ui/ThemeProvider';

type IconProps = { size?: number; color?: string };
/** Stroke props in the look's icon weight; `bold` for the send arrow and the check. */
const stroke = (color: string, t: Theme, bold = false) => ({
  stroke: color,
  strokeWidth: bold ? t.shape.iconStrokeBold : t.shape.iconStroke,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none',
});

export function TodayIcon({ size = 24, color }: IconProps) {
  const t = useTheme();
  const c = color ?? t.colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={4.5} {...stroke(c, t)} />
      <Path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" {...stroke(c, t)} />
    </Svg>
  );
}

export function SelfIcon({ size = 24, color }: IconProps) {
  const t = useTheme();
  const c = color ?? t.colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={8.5} {...stroke(c, t)} />
      <Circle cx={12} cy={12} r={2.2} fill={c} />
    </Svg>
  );
}

export function SparkIcon({ size = 24, color }: IconProps) {
  const t = useTheme();
  const c = color ?? t.colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7Z" {...stroke(c, t)} />
      <Path d="M19 16.5c.2 1.4.8 2 2.2 2.2-1.4.2-2 .8-2.2 2.2-.2-1.4-.8-2-2.2-2.2 1.4-.2 2-.8 2.2-2.2Z" {...stroke(c, t)} />
    </Svg>
  );
}

export function MatchIcon({ size = 24, color }: IconProps) {
  const t = useTheme();
  const c = color ?? t.colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={9} cy={12} r={6} {...stroke(c, t)} />
      <Circle cx={15} cy={12} r={6} {...stroke(c, t)} />
    </Svg>
  );
}

export function MandalaIcon({ size = 24, color }: IconProps) {
  const t = useTheme();
  const c = color ?? t.colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} {...stroke(c, t)} />
      <Path d="M12 3v18M3 12h18" {...stroke(c, t)} />
      <Rect x={7.5} y={7.5} width={9} height={9} rx={1} transform="rotate(45 12 12)" {...stroke(c, t)} />
    </Svg>
  );
}

export function BackIcon({ size = 24, color }: IconProps) {
  const t = useTheme();
  const c = color ?? t.colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M15 5l-7 7 7 7" {...stroke(c, t)} />
    </Svg>
  );
}

export function GearIcon({ size = 22, color }: IconProps) {
  const t = useTheme();
  const c = color ?? t.colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={3.2} {...stroke(c, t)} />
      <Path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" {...stroke(c, t)} />
    </Svg>
  );
}

export function PlusIcon({ size = 22, color }: IconProps) {
  const t = useTheme();
  const c = color ?? t.colors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 5v14M5 12h14" {...stroke(c, t)} />
    </Svg>
  );
}

export function SendIcon({ size = 20, color }: IconProps) {
  const t = useTheme();
  const c = color ?? t.colors.onAccent;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 19V5M5.5 11.5L12 5l6.5 6.5" {...stroke(c, t, true)} />
    </Svg>
  );
}

export function StopIcon({ size = 18, color }: IconProps) {
  const t = useTheme();
  const c = color ?? t.colors.onAccent;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={6} y={6} width={12} height={12} rx={2} fill={c} />
    </Svg>
  );
}

export function SearchIcon({ size = 20, color }: IconProps) {
  const t = useTheme();
  const c = color ?? t.colors.textDim;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={11} cy={11} r={6.5} {...stroke(c, t)} />
      <Path d="M16 16l4.5 4.5" {...stroke(c, t)} />
    </Svg>
  );
}

export function CloseIcon({ size = 20, color }: IconProps) {
  const t = useTheme();
  const c = color ?? t.colors.textDim;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 6l12 12M18 6L6 18" {...stroke(c, t)} />
    </Svg>
  );
}

export function CheckIcon({ size = 18, color }: IconProps) {
  const t = useTheme();
  const c = color ?? t.colors.teal;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 12.5l4.5 4.5L19 7.5" {...stroke(c, t, true)} />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 18, color }: IconProps) {
  const t = useTheme();
  const c = color ?? t.colors.textFaint;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M9 5l7 7-7 7" {...stroke(c, t)} />
    </Svg>
  );
}

export function MoonIcon({ size = 20, color }: IconProps) {
  const t = useTheme();
  const c = color ?? t.colors.gold;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z" {...stroke(c, t)} />
    </Svg>
  );
}

/** Settings as three sliders, in the calm and editorial headers. */
export function SlidersIcon({ size = 18, color }: IconProps) {
  const t = useTheme();
  const c = color ?? t.colors.textDim;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" {...stroke(c, t)} />
    </Svg>
  );
}

/** The trailing arrow on Home's link rows. */
export function ArrowRightIcon({ size = 16, color }: IconProps) {
  const t = useTheme();
  const c = color ?? t.colors.accent;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 12h14M13 6l6 6-6 6" {...stroke(c, t, true)} />
    </Svg>
  );
}

// ── Esoterica icons: same 24-unit stroke style; default color follows the active look ──

function strokeIcon(paths: (c: string, t: Theme) => React.ReactNode) {
  return function Icon({ size = 24, color }: IconProps) {
    const t = useTheme();
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        {paths(color ?? t.colors.text, t)}
      </Svg>
    );
  };
}

export const HomeIcon = strokeIcon((c, t) => <Path d="M4 11l8-6.5 8 6.5V20h-5.5v-5h-5v5H4z" {...stroke(c, t)} />);
export const CalculatorIcon = strokeIcon((c, t) => (
  <>
    <Rect x={5} y={3} width={14} height={18} rx={3} {...stroke(c, t)} />
    <Path d="M8.5 7.5h7M9 12h.01M12 12h.01M15 12h.01M9 15.5h.01M12 15.5h.01M15 15.5h.01" {...stroke(c, t)} />
  </>
));
export const CalendarIcon = strokeIcon((c, t) => (
  <>
    <Rect x={3.5} y={5} width={17} height={15.5} rx={3.5} {...stroke(c, t)} />
    <Path d="M3.5 9.5h17M8 3v4M16 3v4" {...stroke(c, t)} />
  </>
));
export const MoreIcon = strokeIcon((c, t) => (
  <>
    <Circle cx={8} cy={8} r={3} {...stroke(c, t)} />
    <Circle cx={16} cy={8} r={3} {...stroke(c, t)} />
    <Circle cx={8} cy={16} r={3} {...stroke(c, t)} />
    <Circle cx={16} cy={16} r={3} {...stroke(c, t)} />
  </>
));
export const StarIcon = strokeIcon((c, t) => <Path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" {...stroke(c, t)} />);
export const HeartIcon = strokeIcon((c, t) => <Path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" {...stroke(c, t)} />);
export const BriefcaseIcon = strokeIcon((c, t) => (
  <>
    <Rect x={3.5} y={7.5} width={17} height={12} rx={2.5} {...stroke(c, t)} />
    <Path d="M9 7.5V5.5h6v2M3.5 12.5h17" {...stroke(c, t)} />
  </>
));
export const YinYangIcon = strokeIcon((c, t) => (
  <>
    <Circle cx={12} cy={12} r={8.5} {...stroke(c, t)} />
    <Path d="M12 3.5a4.25 4.25 0 0 1 0 8.5 4.25 4.25 0 0 0 0 8.5" {...stroke(c, t)} />
    <Circle cx={12} cy={7.75} r={1} fill={c} />
    <Circle cx={12} cy={16.25} r={1} fill={c} />
  </>
));
export const BookmarkIcon = strokeIcon((c, t) => <Path d="M6 3.5h12V21l-6-4.2L6 21z" {...stroke(c, t)} />);
export const PencilIcon = strokeIcon((c, t) => <Path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" {...stroke(c, t)} />);
export const SparkleIcon = strokeIcon((c) => <Path d="M12 2.5l2.2 6.3 6.3 2.2-6.3 2.2L12 19.5l-2.2-6.3L3.5 11l6.3-2.2z" fill={c} />);
export const TrophyIcon = strokeIcon((c, t) => <Path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7" {...stroke(c, t)} />);
export const EyeIcon = strokeIcon((c, t) => (
  <>
    <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" {...stroke(c, t)} />
    <Circle cx={12} cy={12} r={3} {...stroke(c, t)} />
  </>
));
export const BookIcon = strokeIcon((c, t) => <Path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5zM12 6.5V19" {...stroke(c, t)} />);
export const ChartIcon = strokeIcon((c, t) => <Path d="M4 20h16M7 16.5v-4M12 16.5V7M17 16.5v-6.5" {...stroke(c, t)} />);
export const DateCheckIcon = strokeIcon((c, t) => (
  <>
    <Rect x={3.5} y={5} width={17} height={15} rx={3.5} {...stroke(c, t)} />
    <Path d="M3.5 9.5h17M8 3v4M16 3v4M9 15l2 2 4-4" {...stroke(c, t)} />
  </>
));
export const FamilyIcon = strokeIcon((c, t) => (
  <>
    <Circle cx={12} cy={5.5} r={2.5} {...stroke(c, t)} />
    <Circle cx={5.5} cy={18} r={2.5} {...stroke(c, t)} />
    <Circle cx={18.5} cy={18} r={2.5} {...stroke(c, t)} />
    <Path d="M12 8v4M5.5 15.5V12h13v3.5" {...stroke(c, t)} />
  </>
));
export const DreamIcon = strokeIcon((c, t) => <Path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5zM17 3.5v3M15.5 5h3" {...stroke(c, t)} />);
export const ShadowIcon = strokeIcon((c, t) => (
  <>
    <Circle cx={12} cy={12} r={8} {...stroke(c, t)} />
    <Path d="M12 4a8 8 0 0 0 0 16z" fill={c} />
  </>
));
export const QuizIcon = strokeIcon((c, t) => <Path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" {...stroke(c, t)} />);
export const SyncIcon = strokeIcon((c, t) => <Path d="M8.5 9a3 3 0 1 0 0 6c2.5 0 4.5-6 7-6a3 3 0 1 1 0 6c-2.5 0-4.5-6-7-6z" {...stroke(c, t)} />);
/** Neville: the imaginal eye inside a four-pointed star. */
export const ImagineIcon = strokeIcon((c, t) => (
  <>
    <Path d="M12 2.5l2 5.5 5.5 2-5.5 2-2 5.5-2-5.5-5.5-2 5.5-2z" {...stroke(c, t)} />
    <Circle cx={12} cy={10} r={1.6} fill={c} />
    <Path d="M6 20.5h12" {...stroke(c, t)} />
  </>
));
/** Scripture: an open book with a ray above it. */
export const ScriptureIcon = strokeIcon((c, t) => (
  <>
    <Path d="M12 9.5C10.2 8.3 7.5 8 5 8.4v10.1c2.5-.4 5.2-.1 7 1.1 1.8-1.2 4.5-1.5 7-1.1V8.4c-2.5-.4-5.2-.1-7 1.1zM12 9.5v10" {...stroke(c, t)} />
    <Path d="M12 2.5v3M8.5 4l1 1.6M15.5 4l-1 1.6" {...stroke(c, t)} />
  </>
));
