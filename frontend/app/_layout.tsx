import { Quicksand_400Regular, Quicksand_600SemiBold, Quicksand_700Bold, useFonts } from '@expo-google-fonts/quicksand';
import { Stack } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { LogBox, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, PaperProvider } from 'react-native-paper';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useTheme } from '../constants/theme';

function RootLayoutContent() {
  const [fontsLoaded, fontError] = useFonts({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });
  const { theme } = useTheme();

  LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
    'VirtualizedLists should never be nested',
  ]);

  if (!__DEV__) {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
  }

  useEffect(() => {
    if (fontError) {
      console.error('Error loading fonts:', fontError);
    }
  }, [fontError]);

  const styles = useMemo(() => StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background, // #F5F5F5 (light) ou #202225 (dark)
    },
    loadingText: {
      color: theme.colors.text, // #333333 (light) ou #FFFFFF (dark)
      fontFamily: 'Quicksand_400Regular',
      marginTop: 8,
    },
  }), [theme]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>
          Carregando...
        </Text>
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(screens)" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}