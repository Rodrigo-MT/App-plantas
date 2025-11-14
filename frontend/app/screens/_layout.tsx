import React, { useEffect, useCallback, useRef } from 'react';
import { Tabs, usePathname } from 'expo-router';
import { Animated, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/constants/theme';

export default function ScreensLayout() {
  const { theme } = useTheme();
  const pathname = usePathname();

  // Ícones personalizados
  const getIcon = (name: string, color: string, size = 24) => (
    <MaterialCommunityIcons name={name as any} color={color} size={size} />
  );

  // Efeito de animação só para o ícone de Lembretes
  // Mantemos o Animated.Value estável entre renders
  const scaleRef = useRef<Animated.Value>(new Animated.Value(1));
  const scale = scaleRef.current;

  const pulse = useCallback(() => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.15, duration: 500, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [scale]);

  useEffect(() => {
    const interval = setInterval(pulse, 3000);
    return () => clearInterval(interval);
  }, [pulse]);

  // Ocultar o tab bar em forms e telas de detalhes ([id])
  const hideTabBar =
    pathname.includes('Form') ||
    pathname.match(/\/screens\/[^/]+\/\[\w+\]/) ||
    pathname.match(/\/screens\/[^/]+\/\d+/);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: hideTabBar
          ? { display: 'none' } // Esconde nas telas de Form e detalhes
          : {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.outlineVariant,
              borderTopWidth: 1,
              height: Platform.OS === 'ios' ? 85 : 70,
              paddingBottom: Platform.OS === 'ios' ? 25 : 12,
            },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
      }}
    >
      {/* === Ordem correta === */}

      {/* 1️⃣ Dashboard */}
      <Tabs.Screen
        name="dashboard/DashboardScreen"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => getIcon('view-dashboard', color),
        }}
      />

      {/* 2️⃣ Plantas */}
      <Tabs.Screen
        name="plants/PlantsScreen"
        options={{
          title: 'Plantas',
          tabBarIcon: ({ color }) => getIcon('leaf', color),
        }}
      />

      {/* 3️⃣ Espécies */}
      <Tabs.Screen
        name="species/SpeciesScreen"
        options={{
          title: 'Espécies',
          tabBarIcon: ({ color }) => getIcon('sprout', color),
        }}
      />

      {/* 4️⃣ Lembretes */}
      <Tabs.Screen
        name="care-reminders/CareRemindersScreen"
        options={{
          title: 'Lembretes',
          tabBarIcon: ({ color }) => (
            <Animated.View style={{ transform: [{ scale }] }}>
              {getIcon('bell-ring', color, 26)}
            </Animated.View>
          ),
        }}
      />

      {/* 5️⃣ Registros */}
      <Tabs.Screen
        name="care-logs/CareLogsScreen"
        options={{
          title: 'Registros',
          tabBarIcon: ({ color }) => getIcon('notebook-check', color),
        }}
      />

      {/* 6️⃣ Locais */}
      <Tabs.Screen
        name="locations/LocationsScreen"
        options={{
          title: 'Locais',
          tabBarIcon: ({ color }) => getIcon('map-marker-radius', color),
        }}
      />

      {/* 7️⃣ Configurações */}
      <Tabs.Screen
        name="settings/SettingsScreen"
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color }) => getIcon('cog', color),
        }}
      />

      {/* === Forms e [id] ocultos === */}
      <Tabs.Screen name="plants/PlantsForm" options={{ href: null }} />
      <Tabs.Screen name="species/SpeciesForm" options={{ href: null }} />
      <Tabs.Screen name="care-reminders/CareRemindersForm" options={{ href: null }} />
      <Tabs.Screen name="care-logs/CareLogsForm" options={{ href: null }} />
      <Tabs.Screen name="locations/LocationsForm" options={{ href: null }} />

      <Tabs.Screen name="plants/[id]" options={{ href: null }} />
      <Tabs.Screen name="species/[id]" options={{ href: null }} />
      <Tabs.Screen name="care-reminders/[id]" options={{ href: null }} />
      <Tabs.Screen name="care-logs/[id]" options={{ href: null }} />
      <Tabs.Screen name="locations/[id]" options={{ href: null }} />
    </Tabs>
  );
}
