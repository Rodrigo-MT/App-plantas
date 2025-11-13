// app/screens/care-logs/CareLogsScreen.tsx
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Platform, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import Header from '../../../src/components/Header';
import CustomButton from '../../../src/components/CustomButton';
import ErrorModal from '../../../src/components/ErrorModal';
import { useTheme } from '../../../src/constants/theme';
import { useCareLogs } from '../../../src/hooks/useCareLogs';
import { usePlants } from '../../../src/hooks/usePlants';
import { handleApiError } from '../../../src/utils/handleApiError';
import { CareLog } from '../../../src/types/careLog';
import { Plant } from '../../../src/types/plant';

/**
 * Tela para exibir a lista de registros de cuidados realizados.
 */
export default function CareLogsScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const { careLogs, loadCareLogs } = useCareLogs();
  const { plants } = usePlants();

  const [loading, setLoading] = useState(true);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 🔁 Carrega logs sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      const fetchLogs = async () => {
        try {
          setLoading(true);
          await loadCareLogs();
        } catch (error) {
          const msg = handleApiError(error, 'Erro ao carregar registros');
          setErrorMessage(msg);
          setErrorVisible(true);
        } finally {
          setLoading(false);
        }
      };
      fetchLogs();
    }, [loadCareLogs])
  );

  // 🌿 Retorna o nome da planta associada ao log
  const getPlantName = (plantId: string): string => {
    const plant = plants.find((p: Plant) => p.id === plantId);
    return plant ? plant.name : 'Planta não encontrada';
  };

  // 🪴 Mapeia o tipo de cuidado para ícone + texto
  const getCareTypeIcon = (type: string): string => {
    switch (type) {
      case 'watering': return '💧 Regar';
      case 'fertilizing': return '🌱 Adubar';
      case 'pruning': return '✂️ Podar';
      case 'sunlight': return '☀️ Sol';
      default: return '📝 Outro';
    }
  };

  // 🎨 Estilos dependentes do tema
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
    title: {
      fontSize: 18,
      fontFamily: theme.fonts.titleMedium.fontFamily,
      color: theme.colors.primary,
      marginBottom: 4,
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

  // ⏳ Loading
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando registros...</Text>
      </View>
    );
  }

  // 🪴 Tela principal
  return (
    <View style={styles.container}>
      <Header title="Registros de Cuidado" />

      <View style={styles.buttonContainer}>
        <CustomButton
          onPress={() => router.push('/screens/care-logs/CareLogsForm')}
          label="Novo Registro"
          mode="contained"
          style={styles.button}
          buttonColor={theme.colors.primary}
          textColor={theme.colors.onPrimary}
        />
      </View>

      {careLogs.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emptyText}>Nenhum registro cadastrado.</Text>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={[...careLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
          keyExtractor={(item: CareLog) => item.id}
          renderItem={({ item }) => (
            <Card
              style={styles.card}
              onPress={() => router.push(`/screens/care-logs/CareLogsForm?id=${item.id}`)}
            >
              <Card.Content>
                <Text style={styles.title}>{getCareTypeIcon(item.type)}</Text>
                <Text style={styles.subtitle}>🌿 {getPlantName(item.plantId)}</Text>
                <Text style={styles.subtitle}>📅 Data: {new Date(item.date).toLocaleDateString('pt-BR')}</Text>
                {item.notes && <Text style={styles.notes}>📝 {item.notes}</Text>}
              </Card.Content>
            </Card>
          )}
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
