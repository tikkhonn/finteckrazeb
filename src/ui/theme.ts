import { useColorScheme } from 'react-native';

import { resolveScheme } from '@/domain/theme';
import { useThemeStore } from '@/store/themeStore';

import { makeGradients, makeShadow, makeTypography, palettes } from './tokens';

export function useTheme() {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const system = useColorScheme();
  const scheme = resolveScheme(preference, system === 'dark' ? 'dark' : 'light');
  const colors = palettes[scheme];

  return {
    preference,
    scheme,
    colors,
    gradients: makeGradients(colors),
    shadow: makeShadow(colors),
    typography: makeTypography(colors),
    setPreference,
  };
}
