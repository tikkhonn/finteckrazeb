export const colors = {
  bg: '#F4F6FA',
  surface: '#FFFFFF',
  text: '#0B1F3A',
  textMuted: '#5C6B80',
  primary: '#0033A0',
  primaryPressed: '#00257A',
  accent: '#009FDF',
  success: '#0F8A4B',
  successBg: '#E7F6EE',
  danger: '#D32F2F',
  dangerBg: '#FDECEC',
  warning: '#B86E00',
  warningBg: '#FFF6E5',
  info: '#0033A0',
  infoBg: '#E8EEF8',
  border: '#E2E8F0',
  chip: '#E8EEF8',
  overlay: 'rgba(11, 31, 58, 0.45)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 20, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 16, fontWeight: '400' as const, color: colors.text },
  bodyStrong: { fontSize: 16, fontWeight: '600' as const, color: colors.text },
  caption: { fontSize: 13, fontWeight: '400' as const, color: colors.textMuted },
  amount: { fontSize: 36, fontWeight: '700' as const, color: colors.text },
  amountMd: { fontSize: 22, fontWeight: '700' as const, color: colors.text },
};
