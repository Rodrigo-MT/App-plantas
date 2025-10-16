import { Quicksand_400Regular, Quicksand_600SemiBold, Quicksand_700Bold, useFonts } from '@expo-google-fonts/quicksand';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useMemo } from 'react';
import { LogBox, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, PaperProvider, Text } from 'react-native-paper';
import { useTheme } from '../../constants/theme';

export default function TabsLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });
  const { theme } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background, // #F5F5F5 (light) ou #202225 (dark)
    },
    card: {
      padding: 16,
      borderRadius: 12,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      textAlign: 'center',
      color: theme.colors.text, // #333333 (light) ou #FFFFFF (dark)
    },
    errorText: {
      fontSize: 16,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      textAlign: 'center',
      color: theme.colors.text, // #333333 (light) ou #FFFFFF (dark)
    },
  }), [theme]);

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
    tabBarActiveTintColor: theme.colors.primary, // #32c273 (light) ou #7289DA (dark)
    tabBarInactiveTintColor: theme.colors.onSurface,
    tabBarStyle: {
      backgroundColor: theme.colors.surface, // #FFFFFF (light) ou #292B2F (dark)
      borderTopWidth: 0,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    tabBarLabelStyle: {
      fontFamily: theme.fonts.labelSmall.fontFamily,
      fontSize: 12,
    },
  };

  return (
    <PaperProvider theme={theme}>
      <Tabs screenOptions={tabScreenOptions}>
        <Tabs.Screen name="dashboard/index" options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <MaterialIcons name="dashboard" size={24} color={color} /> }} />
        <Tabs.Screen name="plants/index" options={{ title: 'Plantas', tabBarIcon: ({ color }) => <MaterialIcons name="local-florist" size={24} color={color} /> }} />
        <Tabs.Screen name="species/index" options={{ title: 'Espécies', tabBarIcon: ({ color }) => <MaterialIcons name="category" size={24} color={color} /> }} />
        <Tabs.Screen name="care-reminders/index" options={{ title: 'Lembretes', tabBarIcon: ({ color }) => <MaterialIcons name="notifications" size={24} color={color} /> }} />
        <Tabs.Screen name="care-logs/index" options={{ title: 'Histórico', tabBarIcon: ({ color }) => <MaterialIcons name="history" size={24} color={color} /> }} />
        <Tabs.Screen name="locations/index" options={{ title: 'Locais', tabBarIcon: ({ color }) => <MaterialIcons name="place" size={24} color={color} /> }} />
        <Tabs.Screen name="settings/index" options={{ title: 'Configurações', tabBarIcon: ({ color }) => <MaterialIcons name="settings" size={24} color={color} /> }} />
      </Tabs>
    </PaperProvider>
  );
}