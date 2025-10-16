import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { ColorSchemeName } from 'react-native';
import { createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';

// Configurações de fonte comuns (mantidas)
const fontConfig = {
  labelLarge: {
    fontFamily: 'Quicksand_700Bold',
    fontWeight: '700' as '700',
    fontSize: 16,
  },
  // ... (o resto das fontes igual ao seu original, para brevidade)
};

// Tema Light (igual)
export const lightTheme = {
  ...MD3LightTheme,
  fonts: {
    ...MD3LightTheme.fonts,
    ...fontConfig,
  },
  colors: {
    ...MD3LightTheme.colors,
    primary: '#32c273',
    onPrimary: '#FFFFFF',
    secondary: '#1a7a4c',
    onSecondary: '#FFFFFF',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    error: '#B00020',
    accent: '#28afd4',
    text: '#333333',
    onSurfaceVariant: '#666666',
    placeholder: '#999999',
    onSurface: '#1a7a4c',
  },
};

// Tema Dark (Discord, sem elevation para testar)
export const darkTheme = {
  ...MD3DarkTheme,
  fonts: {
    ...MD3DarkTheme.fonts,
    ...fontConfig,
  },
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#7289DA', // Azul Discord
    onPrimary: '#FFFFFF',
    secondary: '#43B581', // Verde Discord
    onSecondary: '#000000',
    background: '#202225', // Fundo quase preto Discord
    surface: '#292B2F', // Superfície Discord
    error: '#F04747', // Vermelho Discord
    accent: '#7289DA',
    text: '#FFFFFF',
    onSurfaceVariant: '#DBDBDB',
    placeholder: '#72767D',
    onSurface: '#FFFFFF',
    // Removi elevation aqui para testar – o Paper usa defaults
  },
};

// Tema padrão
export default lightTheme;

// Context (mova para cá para evitar conflitos)
type ThemeContextType = {
  theme: typeof lightTheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  themeMode: 'light', // Padrão light
  setThemeMode: () => {},
  isDark: false,
});

// Hook useTheme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// getTheme (igual)
export const getTheme = (mode: ThemeMode, systemColorScheme: ColorSchemeName = 'light') => {
  const isDark = mode === 'dark' || (mode === 'auto' && systemColorScheme === 'dark');
  return isDark ? darkTheme : lightTheme;
};