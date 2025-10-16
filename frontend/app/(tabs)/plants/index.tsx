import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import CustomButton from '../../../components/CustomButton';
import Header from '../../../components/Header';
import PlantCard from '../../../components/PlantCard';
import theme from '../../../constants/theme';
import { usePlants } from '../../../hooks/usePlants';
import { Plant } from '../../../types/plant';

/**
 * Tela para exibir a lista de plantas, com opção de adicionar uma nova planta.
 */
export default function PlantsScreen() {
  const { plants, loadPlants } = usePlants();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Carrega plantas quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      const fetchPlants = async () => {
        try {
          setLoading(true);
          await loadPlants();
        } catch (error) {
          console.error('Error loading plants:', error);
          // TODO: Exibir feedback visual (ex.: SnackBar)
        } finally {
          setLoading(false);
        }
      };
      fetchPlants();
    }, [loadPlants])
  );

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
      <Header title="Minhas Plantas" />
      <View style={styles.buttonContainer}>
        <CustomButton
          onPress={() => router.push('/plants/new')}
          label="Adicionar Planta"
          mode="contained"
          style={styles.button}
        />
      </View>
      {plants.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emptyText}>Nenhuma planta cadastrada.</Text>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={plants}
          keyExtractor={(item: Plant) => item.id}
          renderItem={({ item }: { item: Plant }) => <PlantCard plant={item} />}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    fontFamily: theme.fonts.default.fontFamily,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: theme.fonts.default.fontFamily,
    color: theme.colors.text,
    textAlign: 'center',
  },
});