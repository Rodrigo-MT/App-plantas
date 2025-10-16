import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import CustomButton from '../../../components/CustomButton';
import Header from '../../../components/Header';
import { useTheme } from '../../../constants/theme';
import { useCareReminders } from '../../../hooks/useCareReminders';
import { usePlants } from '../../../hooks/usePlants';
import { CareReminder } from '../../../types/careReminder';
import { Plant } from '../../../types/plant';

/**
 * Tela para exibir a lista de lembretes de cuidados, com opção de criar um novo lembrete.
 */
export default function CareRemindersScreen() {
  const { careReminders, loadCareReminders } = useCareReminders();
  const { plants } = usePlants();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.colors.background, // #F5F5F5 (light) ou #202225 (dark)
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
      borderRadius: 12,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    inactiveCard: {
      opacity: 0.6,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    title: {
      fontSize: 18,
      fontFamily: theme.fonts.titleMedium.fontFamily,
      color: theme.colors.primary, // Verde #32c273 (light) ou #7289DA (dark)
    },
    status: {
      fontSize: 12,
      fontFamily: theme.fonts.labelSmall.fontFamily,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.onSurfaceVariant, // #666666 (light) ou #DBDBDB (dark)
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
      color: theme.colors.text, // #333333 (light) ou #FFFFFF (dark)
    },
    emptyText: {
      fontSize: 16,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.text,
      textAlign: 'center',
    },
  }), [theme]);

  useFocusEffect(
    useCallback(() => {
      const fetchReminders = async () => {
        try {
          setLoading(true);
          await loadCareReminders();
        } catch (error) {
          console.error('Error loading reminders:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchReminders();
    }, [loadCareReminders])
  );

  const getPlantName = (plantId: string): string => {
    const plant = plants.find((p: Plant) => p.id === plantId);
    return plant ? plant.name : 'Planta não encontrada';
  };

  const getCareTypeIcon = (type: string): string => {
    switch (type) {
      case 'watering':
        return '💧 Regar';
      case 'fertilizing':
        return '🌱 Adubar';
      case 'pruning':
        return '✂️ Podar';
      case 'sunlight':
        return '☀️ Sol';
      default:
        return '📝 Outro';
    }
  };

  const isOverdue = (nextDue: Date): boolean => {
    return new Date(nextDue) < new Date();
  };

  const getDueStatus = (nextDue: Date, isActive: boolean) => {
    if (!isActive) return { text: 'Inativo', color: theme.colors.onSurfaceVariant };
    if (isOverdue(nextDue)) return { text: 'Atrasado', color: theme.colors.error };
    const daysUntilDue = Math.ceil((new Date(nextDue).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 2) return { text: 'Próximo', color: theme.colors.accent };
    return { text: 'No prazo', color: theme.colors.primary };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Lembretes de Cuidado" />
      <View style={styles.buttonContainer}>
        <CustomButton
          onPress={() => router.push('/care-reminders/new')}
          label="Novo Lembrete"
          mode="contained"
          style={styles.button}
          buttonColor={theme.colors.primary} // Verde #32c273 (light) ou #7289DA (dark)
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
          data={careReminders.sort((a: CareReminder, b: CareReminder) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime())}
          keyExtractor={(item: CareReminder) => item.id}
          renderItem={({ item }) => {
            const status = getDueStatus(item.nextDue, item.isActive);
            return (
              <Card
                style={[styles.card, !item.isActive && styles.inactiveCard]}
                onPress={() => router.push(`/care-reminders/${item.id}`)}
              >
                <Card.Content>
                  <View style={styles.headerRow}>
                    <Text style={styles.title} variant="headlineSmall">
                      {getCareTypeIcon(item.type)}
                    </Text>
                    <Text style={[styles.status, { color: status.color }]}>
                      {status.text}
                    </Text>
                  </View>
                  <Text style={styles.subtitle} variant="bodyMedium">
                    🌿 {getPlantName(item.plantId)}
                  </Text>
                  <Text style={styles.subtitle} variant="bodyMedium">
                    📅 Próximo: {new Date(item.nextDue).toLocaleDateString('pt-BR')}
                  </Text>
                  <Text style={styles.subtitle} variant="bodyMedium">
                    🔄 A cada {item.frequency} dias
                  </Text>
                  <Text style={styles.subtitle} variant="bodyMedium">
                    📍 Último: {new Date(item.lastDone).toLocaleDateString('pt-BR')}
                  </Text>
                  {item.notes && (
                    <Text style={styles.notes} variant="bodyMedium">
                      📝 {item.notes}
                    </Text>
                  )}
                </Card.Content>
              </Card>
            );
          }}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}