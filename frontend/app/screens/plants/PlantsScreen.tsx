import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View, Platform } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import CustomButton from '../../../src/components/CustomButton';
import Header from '../../../src/components/Header';
import PlantCard from '../../../src/components/PlantCard';
import ErrorModal from '../../../src/components/ErrorModal';
import { useTheme } from '../../../src/constants/theme';
import { usePlants } from '../../../src/hooks/usePlants';
import { handleApiError } from '../../../src/utils/handleApiError';
import { Plant } from '../../../src/types/plant';

/**
 * Tela responsável por exibir todas as plantas do usuário,
 * permitindo visualizar, editar e adicionar novas.
 */
export default function PlantsScreen() {
  const { plants, loadPlants } = usePlants();
  const router = useRouter();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 🔁 Recarrega as plantas toda vez que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      const fetchPlants = async () => {
        try {
          setLoading(true);
          await loadPlants();
        } catch (error) {
          const msg = handleApiError(error, 'Erro ao carregar plantas');
          setErrorMessage(msg);
          setErrorVisible(true);
        } finally {
          setLoading(false);
        }
      };
      fetchPlants();
    }, [loadPlants])
  );

  // 🎨 Estilos dependentes do tema
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
          padding: 16,
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
          fontFamily: theme.fonts.bodyMedium.fontFamily,
        },
        emptyText: {
          fontSize: 16,
          fontFamily: theme.fonts.bodyMedium.fontFamily,
          color: theme.colors.text,
          textAlign: 'center',
        },
      }),
    [theme]
  );

  // ⏳ Estado de carregamento
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando suas plantas...</Text>
      </View>
    );
  }

  // 🌱 Tela principal
  return (
    <View style={styles.container}>
      <Header title="Minhas Plantas" />

      {/* Botão para adicionar nova planta */}
      <View style={styles.buttonContainer}>
        <CustomButton
          onPress={() => router.push('/screens/plants/PlantsForm')}
          label="Adicionar Planta"
          mode="contained"
          style={styles.button}
          buttonColor={theme.colors.primary}
          textColor={theme.colors.onPrimary}
        />
      </View>

      {/* Lista de plantas */}
      {plants.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emptyText}>
              Nenhuma planta cadastrada até o momento.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={plants}
          keyExtractor={(item: Plant) => item.id}
          renderItem={({ item }: { item: Plant }) => (
            <Card
              style={styles.card}
              onPress={() =>
                router.push(`/screens/plants/PlantsForm?id=${item.id}`)
              }
            >
              <Card.Content>
                <PlantCard plant={item} />
              </Card.Content>
            </Card>
          )}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Modal de erro */}
      <ErrorModal
        visible={errorVisible}
        message={errorMessage}
        onDismiss={() => setErrorVisible(false)}
      />
    </View>
  );
}
