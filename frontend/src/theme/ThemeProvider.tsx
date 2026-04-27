import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';
import { palette } from './tokens';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeName = 'light' | 'dark';

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  brand: string;
  brandMuted: string;
  danger: string;
  success: string;
  warning: string;
  overlay: string;
};

export type Theme = {
  name: ThemeName;
  colors: ThemeColors;
};

const LIGHT: Theme = {
  name: 'light',
  colors: {
    background: palette.neutral[0],
    surface: palette.neutral[50],
    surfaceAlt: palette.neutral[100],
    border: palette.neutral[200],
    text: palette.neutral[900],
    textMuted: palette.neutral[500],
    brand: palette.brand[500],
    brandMuted: palette.brand[100],
    danger: palette.danger[500],
    success: palette.success[500],
    warning: palette.warning[500],
    overlay: 'rgba(11, 18, 32, 0.4)',
  },
};

const DARK: Theme = {
  name: 'dark',
  colors: {
    background: palette.neutral[900],
    surface: palette.neutral[800],
    surfaceAlt: palette.neutral[700],
    border: palette.neutral[600],
    text: palette.neutral[0],
    textMuted: palette.neutral[300],
    brand: palette.brand[300],
    brandMuted: palette.brand[800],
    danger: '#ff6b67',
    success: '#6fd47b',
    warning: '#ffd14d',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
};

type Ctx = {
  theme: Theme;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<Ctx | null>(null);

function resolveTheme(mode: ThemeMode, system: ColorSchemeName): Theme {
  if (mode === 'dark') return DARK;
  if (mode === 'light') return LIGHT;
  return system === 'dark' ? DARK : LIGHT;
}

export function ThemeProvider({
  children,
  defaultMode = 'system',
}: PropsWithChildren<{ defaultMode?: ThemeMode }>) {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => sub.remove();
  }, []);

  const theme = useMemo(() => resolveTheme(mode, systemScheme), [mode, systemScheme]);

  const value = useMemo<Ctx>(
    () => ({
      theme,
      mode,
      setMode,
      toggle: () => setMode((m) => (m === 'light' ? 'dark' : m === 'dark' ? 'system' : 'light')),
    }),
    [theme, mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within <ThemeProvider>');
  }
  return ctx;
}
