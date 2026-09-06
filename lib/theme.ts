export const colors = {
  background: '#FAF3E8',
  surface: '#FFFFFF',
  surfaceMuted: '#F1E9DA',
  border: '#E9DFCB',
  textPrimary: '#2B2620',
  textSecondary: '#6B6255',
  textMuted: '#948B7C',
  accent: '#C9622F',
  accentMuted: '#FBEADD',
  hosting: '#B4652E',
  success: '#3F6B4F',
  successBg: '#E4F0E6',
  danger: '#C0392B',
  dangerBg: '#FBEAEA',
  dangerBorder: '#F3CFCB',
  skeleton: '#EDE3D2',
  overlay: 'rgba(43, 38, 32, 0.4)',
  sunrise: '#E8A05C',
  mountainFar: '#C9A876',
  mountainNear: '#5B7A5C',
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
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '700' as const, color: colors.textPrimary },
  heading: { fontSize: 20, fontWeight: '700' as const, color: colors.textPrimary },
  subheading: { fontSize: 16, fontWeight: '600' as const, color: colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.textPrimary },
  caption: { fontSize: 13, fontWeight: '400' as const, color: colors.textSecondary },
  small: { fontSize: 12, fontWeight: '400' as const, color: colors.textMuted },
};
