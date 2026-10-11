import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export type ThemeColors = {
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryPressed: string;
  accent: string;
  sky: string;
  skyLight: string;
  featuredStart: string;
  featuredEnd: string;
  success: string;
  successBg: string;
  danger: string;
  dangerBg: string;
  warning: string;
  warningBg: string;
  info: string;
  infoBg: string;
  border: string;
  chip: string;
  chipOnDark: string;
  overlay: string;
  onPrimary: string;
  island: string;
  islandTint: string;
  capsule: string;
};

export const palettes: Record<'light' | 'dark', ThemeColors> = {
  light: {
    bg: '#F2F4F7',
    surface: '#FFFFFF',
    text: '#0B1F3A',
    textMuted: '#6B7789',
    primary: '#0033A0',
    primaryPressed: '#00257A',
    accent: '#009FDF',
    sky: '#D7E4F4',
    skyLight: '#EEF3F8',
    featuredStart: '#0033A0',
    featuredEnd: '#1A5BBF',
    success: '#0F8A4B',
    successBg: '#E7F6EE',
    danger: '#D32F2F',
    dangerBg: '#FDECEC',
    warning: '#B86E00',
    warningBg: '#FFF6E5',
    info: '#0033A0',
    infoBg: '#E8EEF8',
    border: '#E4E8EE',
    chip: '#E8EEF8',
    chipOnDark: 'rgba(255,255,255,0.22)',
    overlay: 'rgba(11, 31, 58, 0.45)',
    onPrimary: '#FFFFFF',
    island: '#0B1F3A',
    islandTint: 'rgba(11, 31, 58, 0.55)',
    capsule: 'rgba(255,255,255,0.92)',
  },
  dark: {
    bg: '#0F1523',
    surface: '#1A2233',
    text: '#F4F7FB',
    textMuted: '#9AA6B8',
    primary: '#4DA3FF',
    primaryPressed: '#2B7FE0',
    accent: '#009FDF',
    sky: '#152033',
    skyLight: '#121A28',
    featuredStart: '#1A5BBF',
    featuredEnd: '#0033A0',
    success: '#4ADE80',
    successBg: '#143322',
    danger: '#FF6B6B',
    dangerBg: '#3A1C1C',
    warning: '#E6A23C',
    warningBg: '#3A2E18',
    info: '#7EC8F5',
    infoBg: '#1A2A4A',
    border: '#2A3548',
    chip: '#243044',
    chipOnDark: 'rgba(255,255,255,0.18)',
    overlay: 'rgba(0, 0, 0, 0.55)',
    onPrimary: '#FFFFFF',
    island: '#1E2838',
    islandTint: 'rgba(30, 40, 56, 0.72)',
    capsule: 'rgba(255,255,255,0.94)',
  },
};

/** Светлая палитра по умолчанию. Для живого UI используйте useTheme(). */
export const colors = palettes.light;

export function makeGradients(palette: ThemeColors) {
  return {
    sky: [palette.skyLight, palette.bg] as const,
    featured: [palette.featuredStart, palette.featuredEnd] as const,
  };
}

export const gradients = makeGradients(colors);

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const contentPad = spacing.lg;

export const radius = {
  sm: 8,
  md: 10,
  lg: 14,
  xl: 16,
  xxl: 20,
  pill: 999,
} as const;

function platformShadow(
  boxShadow: string,
  native: {
    color: string;
    height: number;
    opacity: number;
    radius: number;
    elevation: number;
  },
): ViewStyle {
  if (Platform.OS === 'web') {
    return { boxShadow } as ViewStyle;
  }
  return {
    shadowColor: native.color,
    shadowOffset: { width: 0, height: native.height },
    shadowOpacity: native.opacity,
    shadowRadius: native.radius,
    elevation: native.elevation,
  };
}

export function makeShadow(palette: ThemeColors) {
  const dark = palette.bg === palettes.dark.bg;
  return {
    card: platformShadow(
      dark ? '0px 4px 12px rgba(0,0,0,0.35)' : '0px 2px 8px rgba(11,31,58,0.06)',
      {
        color: dark ? '#000000' : '#0B1F3A',
        height: dark ? 4 : 2,
        opacity: dark ? 0.35 : 0.06,
        radius: dark ? 12 : 8,
        elevation: dark ? 6 : 2,
      },
    ),
    soft: platformShadow(
      dark ? '0px 1px 6px rgba(0,0,0,0.28)' : '0px 1px 4px rgba(11,31,58,0.04)',
      {
        color: dark ? '#000000' : '#0B1F3A',
        height: 1,
        opacity: dark ? 0.28 : 0.04,
        radius: dark ? 6 : 4,
        elevation: dark ? 3 : 1,
      },
    ),
  };
}

export function textOutline(radius = 2): TextStyle {
  if (Platform.OS === 'web') {
    return { textShadow: `0px 1px ${radius}px rgba(0,0,0,0.35)` } as TextStyle;
  }
  return {
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: radius,
  };
}

export const shadow = makeShadow(colors);

export const TAB_ISLAND_CLEARANCE = 120;

export function makeTypography(palette: ThemeColors) {
  return {
    title: { fontSize: 22, fontWeight: '700' as const, color: palette.text },
    h2: { fontSize: 17, fontWeight: '700' as const, color: palette.text },
    body: { fontSize: 15, fontWeight: '400' as const, color: palette.text },
    bodyStrong: { fontSize: 15, fontWeight: '600' as const, color: palette.text },
    caption: { fontSize: 12, fontWeight: '400' as const, color: palette.textMuted },
    amount: { fontSize: 28, fontWeight: '700' as const, color: palette.text },
    amountMd: { fontSize: 20, fontWeight: '700' as const, color: palette.text },
  };
}

export const typography = makeTypography(colors);
