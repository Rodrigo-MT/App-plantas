import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import Header from '../../../components/Header';
import theme from '../../../constants/theme';
import { useCareReminders } from '../../../hooks/useCareReminders';
import { useLocations } from '../../../hooks/useLocations';
import { usePlants } from '../../../hooks/usePlants';
import { useSpecies } from '../../../hooks/useSpecies';
import { CareReminder } from '../../../types/careReminder';
import { Location } from '../../../types/location';
import { Plant } from '../../../types/plant';

const screenWidth = Dimensions.get('window').width;

/**
 * Tela de dashboard com estatísticas de plantas, espécies, lembretes, e gráfico de plantas por local.
 */
export default function DashboardScreen() {
  const { plants, loadPlants } = usePlants();
  const { species, loadSpecies } = useSpecies();
  const { careReminders, loadCareReminders } = useCareReminders();
  const { locations, loadLocations } = useLocations();
  const [loading, setLoading] = useState(true);

  // Carrega todos os dados quando a tela ganha foco
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([loadPlants(), loadSpecies(), loadCareReminders(), loadLocations()]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // TODO: Exibir feedback visual (ex.: SnackBar)
    } finally {
      setLoading(false);
    }
  }, [loadPlants, loadSpecies, loadCareReminders, loadLocations]);

  useFocusEffect(useCallback(() => {
    refreshData();
  }, [refreshData]));

  /**
   * Calcula a distribuição de plantas por local.
   * @returns Objeto com contagem de plantas por locationId.
   */
  const plantsByLocation = plants?.reduce((acc: Record<string, number>, plant: Plant) => {
    if (plant?.locationId) {
      acc[plant.locationId] = (acc[plant.locationId] || 0) + 1;
    }
    return acc;
  }, {}) || {};

  /**
   * Filtra lembretes atrasados.
   * @returns Array de lembretes com nextDue no passado e isActive true.
   */
  const overdueReminders = careReminders?.filter((reminder: CareReminder) => {
    if (!reminder?.nextDue || !reminder.isActive) return false;
    try {
      return new Date(reminder.nextDue) < new Date();
    } catch {
      return false;
    }
  }) || [];

  /**
   * Filtra lembretes próximos (em até 3 dias).
   * @returns Array de lembretes com nextDue em até 3 dias e isActive true.
   */
  const upcomingReminders = careReminders?.filter((reminder: CareReminder) => {
    if (!reminder?.nextDue || !reminder.isActive) return false;
    try {
      const daysUntilDue = Math.ceil(
        (new Date(reminder.nextDue).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilDue <= 3;
    } catch {
      return false;
    }
  }) || [];

  /**
   * Obtém o nome do local com base no locationId.
   * @param locationId - ID do local.
   * @returns Nome do local ou fallback.
   */
  const getLocationName = (locationId: string): string => {
    const location = locations?.find((l: Location) => l?.id === locationId);
    return location ? location.name : `Local ${locationId}`;
  };

  /**
   * Formata uma data com tratamento de erros.
   * @param date - Data a ser formatada.
   * @returns Data formatada ou mensagem de erro.
   */
  const formatDateSafe = (date: any): string => {
    try {
      if (!date) return 'Data inválida';
      const dateObj = date instanceof Date ? date : new Date(date);
      return isNaN(dateObj.getTime()) ? 'Data inválida' : dateObj.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  /**
   * Calcula dias até a data de vencimento com tratamento de erros.
   * @param date - Data a ser verificada.
   * @returns Número de dias ou 0 em caso de erro.
   */
  const getDaysUntilDueSafe = (date: any): number => {
    try {
      if (!date) return 0;
      const dateObj = date instanceof Date ? date : new Date(date);
      return isNaN(dateObj.getTime())
        ? 0
        : Math.ceil((dateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  // Dados para o gráfico de plantas por local
  const chartData = Object.entries(plantsByLocation)
    .filter(([_, count]) => count > 0)
    .map(([locationId, count], index) => {
      const colors = [
        theme.colors.primary,
        theme.colors.accent,
        '#32c273', // Verde alternativo
        '#28afd4', // Ciano alternativo
        '#E6F4FE', // Azul claro
      ];
      return {
        name: getLocationName(locationId),
        population: count,
        color: colors[index % colors.length],
        legendFontColor: theme.colors.text,
        legendFontSize: 12,
      };
    });

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
      <Header title="Dashboard" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cartões de Estatísticas */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <Text variant="headlineMedium" style={styles.statNumber}>
                {plants?.length || 0}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Plantas
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <Text variant="headlineMedium" style={styles.statNumber}>
                {species?.length || 0}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Espécies
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <Text variant="headlineMedium" style={styles.statNumber}>
                {overdueReminders.length}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Pendentes
              </Text>
            </Card.Content>
          </Card>
        </View>
        {/* Gráfico de Plantas por Local */}
        {chartData.length > 0 ? (
          <Card style={styles.chartCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.chartTitle}>
                Plantas por Local
              </Text>
              <PieChart
                data={chartData}
                width={screenWidth - 32}
                height={220}
                chartConfig={{
                  backgroundColor: theme.colors.surface,
                  backgroundGradientFrom: theme.colors.surface,
                  backgroundGradientTo: theme.colors.surface,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  decimalPlaces: 0,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.chartCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.chartTitle}>
                Plantas por Local
              </Text>
              <Text variant="bodyMedium" style={styles.emptyChartText}>
                Adicione plantas em diferentes locais para ver o gráfico.
              </Text>
            </Card.Content>
          </Card>
        )}
        {/* Lembretes Pendentes */}
        {overdueReminders.length > 0 && (
          <Card style={styles.remindersCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.remindersTitle}>
                ⚠️ Cuidados Atrasados
              </Text>
              {overdueReminders.slice(0, 5).map((reminder: CareReminder) => {
                const plant = plants?.find((p: Plant) => p?.id === reminder?.plantId);
                return (
                  <View key={reminder?.id} style={styles.reminderItem}>
                    <View style={styles.reminderInfo}>
                      <Text variant="bodyMedium" style={styles.reminderType}>
                        {reminder?.type === 'watering'
                          ? '💧 Regar'
                          : reminder?.type === 'fertilizing'
                          ? '🌱 Adubar'
                          : reminder?.type === 'pruning'
                          ? '✂️ Podar'
                          : '☀️ Sol'}
                      </Text>
                      <Text variant="bodySmall" style={styles.reminderPlant}>
                        {plant?.name || 'Planta não encontrada'}
                      </Text>
                    </View>
                    <Text variant="bodySmall" style={styles.overdueText}>
                      {formatDateSafe(reminder?.nextDue)}
                    </Text>
                  </View>
                );
              })}
            </Card.Content>
          </Card>
        )}
        {/* Próximos Lembretes */}
        {upcomingReminders.length > 0 && (
          <Card style={styles.upcomingCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.upcomingTitle}>
                📅 Próximos Cuidados
              </Text>
              {upcomingReminders.slice(0, 5).map((reminder: CareReminder) => {
                const plant = plants?.find((p: Plant) => p?.id === reminder?.plantId);
                const daysUntilDue = getDaysUntilDueSafe(reminder?.nextDue);
                return (
                  <View key={reminder?.id} style={styles.reminderItem}>
                    <View style={styles.reminderInfo}>
                      <Text variant="bodyMedium" style={styles.reminderType}>
                        {reminder?.type === 'watering'
                          ? '💧 Regar'
                          : reminder?.type === 'fertilizing'
                          ? '🌱 Adubar'
                          : reminder?.type === 'pruning'
                          ? '✂️ Podar'
                          : '☀️ Sol'}
                      </Text>
                      <Text variant="bodySmall" style={styles.reminderPlant}>
                        {plant?.name || 'Planta não encontrada'}
                      </Text>
                    </View>
                    <Text variant="bodySmall" style={styles.upcomingText}>
                      em {daysUntilDue} {daysUntilDue === 1 ? 'dia' : 'dias'}
                    </Text>
                  </View>
                );
              })}
            </Card.Content>
          </Card>
        )}
        {/* Mensagem quando não há dados */}
        {(!plants || plants.length === 0) && (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.emptyTitle}>
                🌱 Bem-vindo!
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Comece adicionando suas primeiras plantas para ver estatísticas e lembretes aqui.
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCardContent: {
    alignItems: 'center',
    padding: 12,
  },
  statNumber: {
    fontFamily: theme.fonts.titleMedium.fontFamily, // ✅ CORRIGIDO
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: theme.fonts.labelMedium.fontFamily, // ✅ CORRIGIDO
    color: theme.colors.text,
    textAlign: 'center',
  },
  chartCard: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontFamily: theme.fonts.titleMedium.fontFamily, // ✅ CORRIGIDO
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyChartText: {
    fontFamily: theme.fonts.bodyMedium.fontFamily, // ✅ CORRIGIDO
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  remindersCard: {
    marginBottom: 16,
    backgroundColor: '#FFF3E0', // Cor de fundo para alertas
    borderRadius: 12,
    borderColor: '#FFB74D', // Cor da borda para alertas
    borderWidth: 1,
  },
  remindersTitle: {
    fontFamily: theme.fonts.titleMedium.fontFamily, // ✅ CORRIGIDO
    color: '#E65100', // Cor do texto para alertas
    marginBottom: 12,
  },
  upcomingCard: {
    marginBottom: 16,
    backgroundColor: '#E8F5E8', // Cor de fundo para informações
    borderRadius: 12,
    borderColor: '#81C784', // Cor da borda para informações
    borderWidth: 1,
  },
  upcomingTitle: {
    fontFamily: theme.fonts.titleMedium.fontFamily, // ✅ CORRIGIDO
    color: '#2E7D32', // Cor do texto para informações
    marginBottom: 12,
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  reminderInfo: {
    flex: 1,
  },
  reminderType: {
    fontFamily: theme.fonts.labelMedium.fontFamily, // ✅ CORRIGIDO
    color: theme.colors.text,
    marginBottom: 2,
  },
  reminderPlant: {
    fontFamily: theme.fonts.bodyMedium.fontFamily, // ✅ CORRIGIDO
    color: theme.colors.onSurfaceVariant,
  },
  overdueText: {
    fontFamily: theme.fonts.labelMedium.fontFamily, // ✅ CORRIGIDO
    color: '#D32F2F', // Vermelho para atrasados
  },
  upcomingText: {
    fontFamily: theme.fonts.labelMedium.fontFamily, // ✅ CORRIGIDO
    color: '#2E7D32', // Verde para próximos
  },
  emptyCard: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyTitle: {
    fontFamily: theme.fonts.titleMedium.fontFamily, // ✅ CORRIGIDO
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: theme.fonts.bodyMedium.fontFamily, // ✅ CORRIGIDO
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
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
    fontFamily: theme.fonts.bodyMedium.fontFamily, // ✅ CORRIGIDO
  },
});