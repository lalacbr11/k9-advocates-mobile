import { Platform } from 'react-native';
import type { TextStyle } from 'react-native';

export const colors = {
  charcoal: '#171918',
  softCharcoal: '#202321',
  warmCream: '#EEE5D5',
  lightCream: '#F5EFE5',
  offWhite: '#F7F5F0',
  mutedGold: '#C49A55',
  darkGold: '#9A7843',
  mutedGray: '#B9B8B2',
} as const;

// Built-in fonts only; no font loading is required.
const fontFamilies = {
  heading: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia',
  }),
  body: Platform.select({
    ios: 'Helvetica Neue',
    android: 'sans-serif',
    default: 'Arial',
  }),
} as const;

export const typography = {
  fontFamilies,
  heading: {
    fontFamily: fontFamilies.heading,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '400',
  },
  subheading: {
    fontFamily: fontFamilies.heading,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '400',
  },
  body: {
    fontFamily: fontFamilies.body,
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400',
  },
  caption: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  button: {
    fontFamily: fontFamilies.body,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '500',
  },
} as const satisfies {
  fontFamilies: typeof fontFamilies;
  heading: TextStyle;
  subheading: TextStyle;
  body: TextStyle;
  caption: TextStyle;
  button: TextStyle;
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 16,
  pill: 999,
} as const;

// Muted gray is secondary text on dark surfaces. Use charcoal text on
// cream surfaces and gold buttons; gold on cream is reserved for decoration.
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
} as const;
