import { MaterialIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Tabs } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Provider as PaperProvider, Text } from 'react-native-paper';

export default function TabsLayout() {
  const [notificationPermission, setNotificationPermission] = useState(false);

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setNotificationPermission(status === 'granted');
  };

  return (
    <PaperProvider>
      {!notificationPermission && (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Permissões de notificação são necessárias para lembretes de cuidado.
          </Text>
          <Button mode="contained" onPress={requestPermissions} style={styles.permissionButton}>
            Permitir Notificações
          </Button>
        </View>
      )}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#4CAF50',
          tabBarStyle: { backgroundColor: '#ffffff' },
        }}
      >
        <Tabs.Screen
          name="plants/index"
          options={{
            title: 'Plantas',
            tabBarIcon: ({ color }) => <MaterialIcons name="local-florist" size={24} color={color} />,
            href: '/plants',
          }}
        />
        <Tabs.Screen
          name="species/index"
          options={{
            title: 'Espécies',
            tabBarIcon: ({ color }) => <MaterialIcons name="category" size={24} color={color} />,
            href: '/species',
          }}
        />
        <Tabs.Screen
          name="locations/index"
          options={{
            title: 'Locais',
            tabBarIcon: ({ color }) => <MaterialIcons name="place" size={24} color={color} />,
            href: '/locations',
          }}
        />
        <Tabs.Screen
          name="care-tasks/index"
          options={{
            title: 'Tarefas',
            tabBarIcon: ({ color }) => <MaterialIcons name="event" size={24} color={color} />,
            href: '/care-tasks',
          }}
        />
        <Tabs.Screen
          name="care-logs/index"
          options={{
            title: 'Logs',
            tabBarIcon: ({ color }) => <MaterialIcons name="history" size={24} color={color} />,
            href: '/care-logs',
          }}
        />
        <Tabs.Screen
          name="dashboard/index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <MaterialIcons name="dashboard" size={24} color={color} />,
            href: '/dashboard',
          }}
        />
        <Tabs.Screen
          name="settings/index"
          options={{
            title: 'Configurações',
            tabBarIcon: ({ color }) => <MaterialIcons name="settings" size={24} color={color} />,
            href: '/settings',
          }}
        />
      </Tabs>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  permissionContainer: {
    padding: 16,
    backgroundColor: '#fff3cd',
    borderBottomWidth: 1,
    borderBottomColor: '#ffeeba',
  },
  permissionText: {
    fontSize: 16,
    color: '#856404',
    marginBottom: 8,
  },
  permissionButton: {
    backgroundColor: '#4CAF50',
  },
});