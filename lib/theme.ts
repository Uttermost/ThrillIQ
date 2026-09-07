// Design tokens — the single source for color, type, spacing, radius, sizing
// and motion across the app. Screens should reference these, never hard-code
// a raw hex/px value. See the ThrillIQ UI/UX spec (design system section).

export const colors = {
  background: '#FAF3E8',
  surface: '#FFFFFF',
  surfaceMuted: '#F1E9DA',
  elevatedSurface: '#FFFFFF',
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

  // Semantic aliases (design-system section 79). Point at the values above —
  // new code should prefer these names; the underlying values stay unified.
  primary: '#C9622F',
  primarySurface: '#FBEADD',
  warning: '#B9832E',
  warningBg: '#F5E8D2',
  error: '#C0392B',
  errorBg: '#FBEAEA',
  info: '#3E6A82',
  infoBg: '#E2EEF2',
} as const;

// 8-point spacing scale (design-system section 5). Every margin/padding
// should resolve to one of these — no arbitrary 13/17/19/23px values.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  screenPaddingDetail: 20, // content-heavy/detail screens use 20px horizontal
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
} as const;

// Corner radii (section 6): small elements 8, inputs/buttons 12, cards 16,
// large sheets 24, pill for filters/tags/status only.
export const radius = {
  sm: 8,
  md: 12, // inputs, buttons
  lg: 16, // cards
  xl: 24, // large sheets / feature cards
  pill: 999,
} as const;

// Minimum interactive sizing (section 7).
export const touchTarget = {
  min: 44,
  comfortable: 48,
} as const;

export const controlHeight = {
  button: 50, // 48–52px range
  buttonSecondary: 48,
  input: 50,
} as const;

// Icon sizes (section 78).
export const iconSize = {
  inline: 20,
  standard: 24,
  prominent: 28,
} as const;

// Animation durations (section 61) — subtle, 150–250ms.
export const motion = {
  fast: 150,
  normal: 200,
  slow: 250,
} as const;

// Typography scale (section 4). Every style below carries an explicit
// line-height — no bare fontSize left to the platform default.
export const typography = {
  title: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34, color: colors.textPrimary }, // Large heading
  heading: { fontSize: 24, fontWeight: '700' as const, lineHeight: 30, color: colors.textPrimary }, // Screen heading
  subheading: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22, color: colors.textPrimary }, // Card title
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22, color: colors.textPrimary },
  caption: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20, color: colors.textSecondary }, // Secondary
  small: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16, color: colors.textMuted }, // Caption
} as const;

// Full spec-named scale, for new/redesigned components. Same values as
// above where they overlap — this just exposes the two sizes the legacy
// names don't cover (Display, Section heading, Large body) under their
// spec names, so new work can reference the exact system.
export const type = {
  display: { fontSize: 32, fontWeight: '700' as const, lineHeight: 39, color: colors.textPrimary },
  largeHeading: typography.title,
  screenHeading: typography.heading,
  sectionHeading: { fontSize: 20, fontWeight: '700' as const, lineHeight: 26, color: colors.textPrimary },
  cardTitle: typography.subheading,
  largeBody: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24, color: colors.textPrimary },
  body: typography.body,
  bodyEmphasis: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22, color: colors.textPrimary },
  secondary: typography.caption,
  caption: typography.small,
  button: { fontSize: 15, fontWeight: '600' as const, lineHeight: 20 },
  input: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  inputLabel: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18, color: colors.textPrimary },
  chip: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16 },
} as const;
