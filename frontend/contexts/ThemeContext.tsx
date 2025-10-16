import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, ReactNode } from 'react';
import { useColorScheme, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { ThemeContext, ThemeMode, getTheme, lightTheme, darkTheme } from '../constants/theme'; // ✅ Importe aqui

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [loading, setLoading] = useState(true);
  const theme = getTheme(themeMode, systemColorScheme);

  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@app_theme');
        if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
          setThemeMode(savedTheme as ThemeMode);
        } else {
          await AsyncStorage.setItem('@app_theme', 'light');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
        setThemeMode('light');
      } finally {
        setLoading(false);
      }
    };
    loadSavedTheme();
  }, []);

  const handleSetThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeMode(mode);
      await AsyncStorage.setItem('@app_theme', mode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: lightTheme.colors.background }}>
        <ActivityIndicator size="large" color={lightTheme.colors.primary} />
      </View>
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        setThemeMode: handleSetThemeMode,
        isDark: themeMode === 'dark' || (themeMode === 'auto' && systemColorScheme === 'dark'),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};