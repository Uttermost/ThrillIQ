// Design tokens — the single source for color, type, spacing, radius, sizing
// and motion across the app. Screens should reference these, never hard-code
// a raw hex/px value. See the ThrillIQ UI/UX spec (design system section).

// Brand palette: Deep Slate / Soft Off-White / Adventure Green / Energy
// Amber. These four are Tailwind's slate-900, slate-50, green-600 and
// amber-500 exactly, so the rest of the scale below is built out from the
// matching Tailwind slate/green/amber/red/blue steps for a coherent system,
// rather than bolting four raw hexes onto an otherwise-unrelated palette.
export const colors = {
  background: '#F8FAFC', // slate-50 — Soft Off-White
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9', // slate-100
  elevatedSurface: '#FFFFFF',
  border: '#E2E8F0', // slate-200
  textPrimary: '#0F172A', // slate-900 — Deep Slate
  textSecondary: '#475569', // slate-600
  textMuted: '#94A3B8', // slate-400
  accent: '#F59E0B', // amber-500 — Energy Amber
  accentMuted: '#FFFBEB', // amber-50
  hosting: '#D97706', // amber-600
  success: '#15803D', // green-700 (darker than brand green, for text contrast)
  successBg: '#F0FDF4', // green-50
  danger: '#DC2626', // red-600
  dangerBg: '#FEF2F2', // red-50
  dangerBorder: '#FECACA', // red-200
  skeleton: '#E2E8F0', // slate-200
  overlay: 'rgba(15, 23, 42, 0.5)', // slate-900 tint
  sunrise: '#F59E0B', // amber-500 — reused for the onboarding illustration's sun
  mountainFar: '#CBD5E1', // slate-300
  mountainNear: '#16A34A', // green-600 — Adventure Green

  // Semantic aliases (design-system section 79). Point at the values above —
  // new code should prefer these names; the underlying values stay unified.
  primary: '#16A34A', // green-600 — Adventure Green
  primarySurface: '#F0FDF4', // green-50
  warning: '#D97706', // amber-600 (darker than accent, for text-on-light contrast)
  warningBg: '#FFFBEB', // amber-50
  error: '#DC2626', // red-600
  errorBg: '#FEF2F2', // red-50
  info: '#2563EB', // blue-600
  infoBg: '#EFF6FF', // blue-50
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
