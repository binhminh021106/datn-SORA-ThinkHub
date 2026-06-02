import { Platform } from 'react-native';

export const PRICE_FONT_FAMILY = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'system-ui',
});

export const PRICE_FONT_WEIGHT = '700';
