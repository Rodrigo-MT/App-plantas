import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import CustomButton from '../../../components/CustomButton';
import Header from '../../../components/Header';
import theme from '../../../constants/theme';
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

  // Carrega lembretes quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      const fetchReminders = async () => {
        try {
          setLoading(true);
          await loadCareReminders();
        } catch (error) {
          console.error('Error loading reminders:', error);
          // TODO: Exibir feedback visual (ex.: SnackBar)
        } finally {
          setLoading(false);
        }
      };
      fetchReminders();
    }, [loadCareReminders])
  );

  /**
   * Obtém o nome da planta com base no plantId.
   * @param plantId - ID da planta.
   * @returns Nome da planta ou mensagem de erro.
   */
  const getPlantName = (plantId: string): string => {
    const plant = plants.find((p: Plant) => p.id === plantId);
    return plant ? plant.name : 'Planta não encontrada';
  };

  /**
   * Obtém o ícone e texto correspondente ao tipo de cuidado.
   * @param type - Tipo de cuidado (watering, fertilizing, etc.).
   * @returns Ícone e texto formatados.
   */
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

  /**
   * Verifica se o lembrete está atrasado.
   * @param nextDue - Data do próximo cuidado.
   * @returns Verdadeiro se a data estiver no passado.
   */
  const isOverdue = (nextDue: Date): boolean => {
    return new Date(nextDue) < new Date();
  };

  /**
   * Obtém o status e a cor do lembrete com base na data e atividade.
   * @param nextDue - Data do próximo cuidado.
   * @param isActive - Indica se o lembrete está ativo.
   * @returns Objeto com texto e cor do status.
   */
  const getDueStatus = (nextDue: Date, isActive: boolean) => {
    if (!isActive) return { text: 'Inativo', color: theme.colors.onSurfaceVariant };
    if (isOverdue(nextDue)) return { text: 'Atrasado', color: theme.colors.error };
    const daysUntilDue = Math.ceil((new Date(nextDue).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 2) return { text: 'Próximo', color: theme.colors.accent };
    return { text: 'No prazo', color: theme.colors.primary };
  };

  // Estado de carregamento
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

const styles = StyleSheet.create({
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
    backgroundColor: theme.colors.surface, // ✅ CORRIGIDO: usar surface para cards
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inactiveCard: {
    opacity: 0.6,
    backgroundColor: theme.colors.surfaceDisabled, // ✅ CORRIGIDO: usar surfaceDisabled
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: theme.fonts.titleMedium.fontFamily, // ✅ CORRIGIDO: usar titleMedium
    color: theme.colors.text,
  },
  status: {
    fontSize: 12,
    fontFamily: theme.fonts.labelSmall.fontFamily, // ✅ CORRIGIDO: usar labelSmall
  },
  subtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.bodyMedium.fontFamily, // ✅ CORRIGIDO: usar bodyMedium
    color: theme.colors.onSurfaceVariant, // ✅ CORRIGIDO: usar onSurfaceVariant
    marginBottom: 4,
  },
  notes: {
    fontSize: 12,
    fontFamily: theme.fonts.bodySmall.fontFamily, // ✅ CORRIGIDO: usar bodySmall
    color: theme.colors.onSurfaceVariant, // ✅ CORRIGIDO: usar onSurfaceVariant
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
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyMedium.fontFamily, // ✅ CORRIGIDO: usar bodyMedium
  },
  emptyText: {
    fontSize: 16,
    fontFamily: theme.fonts.bodyMedium.fontFamily, // ✅ CORRIGIDO: usar bodyMedium
    color: theme.colors.text,
    textAlign: 'center',
  },
});