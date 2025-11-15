import { Stack, useSegments, router, usePathname } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useFonts, Quicksand_400Regular, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { useTheme } from '../src/constants/theme';
import { View, Text, ActivityIndicator, StyleSheet, LogBox } from 'react-native';
import { useEffect, useMemo, useRef } from 'react';


function DynamicEditHandler() {
  const segments = useSegments();
  const pathname = usePathname();
  const lastHandledPath = useRef<string | null>(null);

  useEffect(() => {
    // Rota do tipo: /screens/plants/123
    if (segments.length === 3 && segments[0] === 'screens') {
      const section = segments[1];
      const id = segments[2];

      // ID numérico => tela de edição
      if (!isNaN(Number(id))) {
        const formMap: Record<string, string> = {
          plants: 'PlantsForm',
          species: 'SpeciesForm',
          'care-reminders': 'CareRemindersForm',
          'care-logs': 'CareLogsForm',
          locations: 'LocationsForm',
        };

        const formName = formMap[section];
        if (!formName) return;

        // ✅ Caminho absoluto padronizado
        const targetPath = `/screens/${section}/${formName}?id=${id}`;

        // Evita loops infinitos
        if (pathname === targetPath || lastHandledPath.current === targetPath) return;

        lastHandledPath.current = targetPath;
        router.replace(targetPath as any);
      }
    }
  }, [segments, pathname]);

  return null;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}

function RootLayoutContent() {
  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  const { theme } = useTheme();

  LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
    'VirtualizedLists should never be nested',
  ]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.background,
        },
        loadingText: {
          marginTop: 16,
          fontSize: 16,
          color: theme.colors.text,
          fontFamily: 'Quicksand_400Regular',
        },
      }),
    [theme]
  );

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando fontes...</Text>
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      {/* 🔥 Redirecionador de rotas dinâmicas */}
      <DynamicEditHandler />

      {/* 🔥 Todas as telas mapeadas ABSOLUTAMENTE */}
      <Stack screenOptions={{ headerShown: false }}>
        
        <Stack.Screen name="screens" />

        <Stack.Screen
          name="screens/plants/PlantsForm"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="screens/species/SpeciesForm"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="screens/care-reminders/CareRemindersForm"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="screens/care-logs/CareLogsForm"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="screens/locations/LocationsForm"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack>
    </PaperProvider>
  );
}
