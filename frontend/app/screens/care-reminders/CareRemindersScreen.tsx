// app/screens/care-reminders/CareRemindersScreen.tsx
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View, Platform } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import CustomButton from '../../../src/components/CustomButton';
import Header from '../../../src/components/Header';
import ErrorModal from '../../../src/components/ErrorModal';
import { useTheme } from '../../../src/constants/theme';
import { useCareReminders } from '../../../src/hooks/useCareReminders';
import { usePlants } from '../../../src/hooks/usePlants';
import { handleApiError } from '../../../src/utils/handleApiError';
import { CareReminder } from '../../../src/types/careReminder';
import { Plant } from '../../../src/types/plant';

/**
 * Tela para exibir a lista de lembretes de cuidados, com opção de criar e editar lembretes.
 */
export default function CareRemindersScreen() {
  const { careReminders, loadCareReminders } = useCareReminders();
  const { plants } = usePlants();
  const router = useRouter();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 🔁 Recarrega os lembretes sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      const fetchReminders = async () => {
        try {
          setLoading(true);
          await loadCareReminders();
        } catch (error) {
          const msg = handleApiError(error, 'Erro ao carregar lembretes');
          setErrorMessage(msg);
          setErrorVisible(true);
        } finally {
          setLoading(false);
        }
      };
      fetchReminders();
    }, [loadCareReminders])
  );

  // 🌿 Funções utilitárias
  const getPlantName = (plantId: string): string => {
    const plant = plants.find((p: Plant) => p.id === plantId);
    return plant ? plant.name : 'Planta não encontrada';
  };

  const getCareTypeIcon = (type: string): string => {
    switch (type) {
      case 'watering': return '💧 Regar';
      case 'fertilizing': return '🌱 Adubar';
      case 'pruning': return '✂️ Podar';
      case 'sunlight': return '☀️ Sol';
      default: return '📝 Outro';
    }
  };

  const isOverdue = (nextDue: Date): boolean => new Date(nextDue) < new Date();

  const getDueStatus = (nextDue: Date, isActive: boolean) => {
    if (!isActive) return { text: 'Inativo', color: theme.colors.onSurfaceVariant };
    if (isOverdue(nextDue)) return { text: 'Atrasado', color: theme.colors.error };
    const daysUntilDue = Math.ceil((new Date(nextDue).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 2) return { text: 'Próximo', color: theme.colors.accent };
    return { text: 'No prazo', color: theme.colors.primary };
  };

  // 🎨 Estilos dinâmicos dependentes do tema
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    buttonContainer: {
      marginTop: 16,
      alignItems: 'flex-start',
    },
    button: {
      marginBottom: 16,
    },
    card: {
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      elevation: 4,
      ...(Platform.OS === 'web'
        ? { boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.12)' }
        : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
          }),
    },
    inactiveCard: { opacity: 0.6 },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    title: {
      fontSize: 18,
      fontFamily: theme.fonts.titleMedium.fontFamily,
      color: theme.colors.primary,
    },
    status: {
      fontSize: 12,
      fontFamily: theme.fonts.labelSmall.fontFamily,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 4,
    },
    notes: {
      fontSize: 12,
      fontFamily: theme.fonts.bodySmall.fontFamily,
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
      fontStyle: 'italic',
    },
    list: {
      paddingBottom: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.text,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.text,
      textAlign: 'center',
    },
  }), [theme]);

  // ⏳ Estado de carregamento
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando lembretes...</Text>
      </View>
    );
  }

  // 🪴 Tela principal
  return (
    <View style={styles.container}>
      <Header title="Lembretes de Cuidado" />
      <View style={styles.buttonContainer}>
        <CustomButton
          onPress={() => router.push('/screens/care-reminders/CareRemindersForm')}
          label="Novo Lembrete"
          mode="contained"
          style={styles.button}
          buttonColor={theme.colors.primary}
          textColor={theme.colors.onPrimary}
        />
      </View>

      {careReminders.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emptyText}>Nenhum lembrete cadastrado.</Text>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={careReminders.sort((a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime())}
          keyExtractor={(item: CareReminder) => item.id}
          renderItem={({ item }) => {
            const status = getDueStatus(item.nextDue, item.isActive);
            return (
              <Card
                style={[styles.card, !item.isActive && styles.inactiveCard]}
                onPress={() => router.push(`/screens/care-reminders/CareRemindersForm?id=${item.id}`)}
              >
                <Card.Content>
                  <View style={styles.headerRow}>
                    <Text style={styles.title}>{getCareTypeIcon(item.type)}</Text>
                    <Text style={[styles.status, { color: status.color }]}>{status.text}</Text>
                  </View>
                  <Text style={styles.subtitle}>🌿 {getPlantName(item.plantId)}</Text>
                  <Text style={styles.subtitle}>📅 Próximo: {new Date(item.nextDue).toLocaleDateString('pt-BR')}</Text>
                  <Text style={styles.subtitle}>🔄 A cada {item.frequency} dias</Text>
                  <Text style={styles.subtitle}>📍 Último: {new Date(item.lastDone).toLocaleDateString('pt-BR')}</Text>
                  {item.notes && <Text style={styles.notes}>📝 {item.notes}</Text>}
                </Card.Content>
              </Card>
            );
          }}
          contentContainerStyle={styles.list}
        />
      )}

      <ErrorModal
        visible={errorVisible}
        message={errorMessage}
        onDismiss={() => setErrorVisible(false)}
      />
    </View>
  );
}
