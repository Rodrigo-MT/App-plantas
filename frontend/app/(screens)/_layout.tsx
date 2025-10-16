import { Stack } from 'expo-router';
import theme from '../../constants/theme';

/**
 * Layout para as telas de gerenciamento de plantas, espécies, lembretes, locais e registros.
 * Configura a navegação em pilha com apresentação modal para todas as telas.
 */
export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        contentStyle: { backgroundColor: theme.colors.background },
        // ✅ ADICIONAR: Configurações de tema para o header quando for mostrado
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontFamily: theme.fonts.titleMedium.fontFamily, // ✅ CORREÇÃO: usar fonte que existe
        },
      }}
    >
      {/* Plantas */}
      <Stack.Screen
        name="plants/new"
        options={{
          title: "Nova Planta",
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="plants/[id]"
        options={{
          title: "Editar Planta",
          presentation: 'modal',
        }}
      />

      {/* Espécies */}
      <Stack.Screen
        name="species/new"
        options={{
          title: "Nova Espécie",
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="species/[id]"
        options={{
          title: "Editar Espécie",
          presentation: 'modal',
        }}
      />

      {/* Lembretes */}
      <Stack.Screen
        name="care-reminders/new"
        options={{
          title: "Novo Lembrete",
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="care-reminders/[id]"
        options={{
          title: "Editar Lembrete",
          presentation: 'modal',
        }}
      />

      {/* Locais */}
      <Stack.Screen
        name="locations/new"
        options={{
          title: "Novo Local",
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="locations/[id]"
        options={{
          title: "Editar Local",
          presentation: 'modal',
        }}
      />

      {/* Histórico */}
      <Stack.Screen
        name="care-logs/new"
        options={{
          title: "Novo Registro",
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="care-logs/[id]"
        options={{
          title: "Editar Registro",
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}