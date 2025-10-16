import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import CustomButton from '../../../components/CustomButton';
import Header from '../../../components/Header';
import theme from '../../../constants/theme';
import { useCareLogs } from '../../../hooks/useCareLogs';
import { usePlants } from '../../../hooks/usePlants';
import { CareLog } from '../../../types/careLog';
import { Plant } from '../../../types/plant';

/**
 * Tela para exibir a lista de registros de cuidados, com opção de criar um novo registro.
 */
export default function CareLogsScreen() {
  const { careLogs, loadCareLogs } = useCareLogs();
  const { plants } = usePlants();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Carrega registros de cuidados quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      const fetchCareLogs = async () => {
        try {
          setLoading(true);
          await loadCareLogs();
        } catch (error) {
          console.error('Error loading care logs:', error);
          // TODO: Exibir feedback visual (ex.: SnackBar)
        } finally {
          setLoading(false);
        }
      };
      fetchCareLogs();
    }, [loadCareLogs])
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
      case 'repotting':
        return '🪴 Transplantar';
      case 'cleaning':
        return '🧹 Limpar';
      default:
        return '📝 Outro';
    }
  };

  /**
   * Obtém o ícone correspondente ao status do cuidado.
   * @param success - Indica se o cuidado foi bem-sucedido.
   * @returns Ícone correspondente.
   */
  const getStatusIcon = (success: boolean): string => {
    return success ? '✅' : '❌';
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
      <Header title="Histórico de Cuidados" />
      <View style={styles.buttonContainer}>
        <CustomButton
          onPress={() => router.push('/care-logs/new')}
          label="Registrar Cuidado"
          mode="contained"
          style={styles.button}
        />
      </View>
      {careLogs.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emptyText}>Nenhum registro de cuidado.</Text>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={careLogs.sort((a: CareLog, b: CareLog) => new Date(b.date).getTime() - new Date(a.date).getTime())}
          keyExtractor={(item: CareLog) => item.id}
          renderItem={({ item }) => (
            <Card
              style={styles.card}
              onPress={() => router.push(`/care-logs/${item.id}`)}
            >
              <Card.Content>
                <Text style={styles.title} variant="headlineSmall">
                  {getCareTypeIcon(item.type)}
                </Text>
                <Text style={styles.subtitle} variant="bodyMedium">
                  🌿 {getPlantName(item.plantId)}
                </Text>
                <Text style={styles.subtitle} variant="bodyMedium">
                  📅 {new Date(item.date).toLocaleDateString('pt-BR')}
                </Text>
                <Text style={styles.subtitle} variant="bodyMedium">
                  {getStatusIcon(item.success)} {item.success ? 'Realizado com sucesso' : 'Não realizado'}
                </Text>
                {item.notes && (
                  <Text style={styles.notes} variant="bodyMedium">
                    📝 {item.notes}
                  </Text>
                )}
              </Card.Content>
            </Card>
          )}
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
  title: {
    fontSize: 18,
    fontFamily: theme.fonts.titleMedium.fontFamily, // ✅ CORRIGIDO: usar titleMedium
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.bodyMedium.fontFamily, // ✅ CORRIGIDO: usar bodyMedium
    color: theme.colors.onSurfaceVariant, // ✅ CORRIGIDO: usar onSurfaceVariant para texto secundário
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