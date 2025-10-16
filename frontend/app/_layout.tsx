import { Quicksand_400Regular, Quicksand_600SemiBold, Quicksand_700Bold, useFonts } from '@expo-google-fonts/quicksand';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { LogBox, Text, View } from 'react-native';
import { ActivityIndicator, PaperProvider } from 'react-native-paper';
import theme from '../constants/theme';

/**
 * Layout global do aplicativo, configurando fontes, tema e navegação.
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  // Ignorar warnings específicos
  LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
    'VirtualizedLists should never be nested',
  ]);

  // Desabilitar console em produção
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

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.bodyMedium.fontFamily, marginTop: 8 }}>
          Carregando fontes...
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