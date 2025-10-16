import { Quicksand_400Regular, Quicksand_600SemiBold, Quicksand_700Bold, useFonts } from '@expo-google-fonts/quicksand';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Provider as PaperProvider, Text } from 'react-native-paper';
import theme from '../../constants/theme';

/**
 * Layout de navegação por abas do aplicativo, com carregamento de fontes e tema personalizado.
 */
export default function TabsLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  if (!fontsLoaded && !fontsError) {
    return (
      <View style={styles.loadingContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Carregando...</Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  if (fontsError) {
    console.error('Error loading fonts:', fontsError);
    // TODO: Exibir feedback visual (ex.: SnackBar)
    return (
      <View style={styles.loadingContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.errorText}>Erro ao carregar fontes.</Text>
          </Card.Content>
        </Card>
      </View>
    );
  }

  const tabScreenOptions = {
    headerShown: false,
    // ✅ CORREÇÃO: Cores das tabs
    tabBarActiveTintColor: theme.colors.primary, // VERDE CLARO para tab ativa
    tabBarInactiveTintColor: theme.colors.onSurface, // VERDE ESCURO para tab inativa
    tabBarStyle: {
      backgroundColor: theme.colors.surface, // FUNDO BRANCO para contraste
      borderTopWidth: 0,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    tabBarLabelStyle: {
      // ✅ CORREÇÃO: Usar fontes que existem no tema
      fontFamily: theme.fonts.labelSmall.fontFamily,
      fontSize: 12,
    },
  };

  return (
    <PaperProvider theme={theme}>
      <Tabs screenOptions={tabScreenOptions}>
        <Tabs.Screen
          name="dashboard/index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }: { color: string }) => (
              <MaterialIcons name="dashboard" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="plants/index"
          options={{
            title: 'Plantas',
            tabBarIcon: ({ color }: { color: string }) => (
              <MaterialIcons name="local-florist" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="species/index"
          options={{
            title: 'Espécies',
            tabBarIcon: ({ color }: { color: string }) => (
              <MaterialIcons name="category" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="care-reminders/index"
          options={{
            title: 'Lembretes',
            tabBarIcon: ({ color }: { color: string }) => (
              <MaterialIcons name="notifications" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="care-logs/index"
          options={{
            title: 'Histórico',
            tabBarIcon: ({ color }: { color: string }) => (
              <MaterialIcons name="history" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="locations/index"
          options={{
            title: 'Locais',
            tabBarIcon: ({ color }: { color: string }) => (
              <MaterialIcons name="place" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings/index"
          options={{
            title: 'Configurações',
            tabBarIcon: ({ color }: { color: string }) => (
              <MaterialIcons name="settings" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface, // ✅ CORREÇÃO: usar surface
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    // ✅ CORREÇÃO: Usar fontes que existem
    fontFamily: theme.fonts.bodyMedium.fontFamily,
    color: theme.colors.text,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    // ✅ CORREÇÃO: Usar fontes que existem
    fontFamily: theme.fonts.bodyMedium.fontFamily,
    color: theme.colors.error,
    textAlign: 'center',
  },
});