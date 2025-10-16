import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import CustomButton from '../../../components/CustomButton';
import Header from '../../../components/Header';
import theme from '../../../constants/theme';
import { useLocations } from '../../../hooks/useLocations';
import { Location } from '../../../types/location';

/**
 * Tela para exibir a lista de locais, com opção de adicionar um novo local.
 */
export default function LocationsScreen() {
  const { locations, loadLocations } = useLocations();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Carrega locais quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      const fetchLocations = async () => {
        try {
          setLoading(true);
          await loadLocations();
        } catch (error) {
          console.error('Error loading locations:', error);
          // TODO: Exibir feedback visual (ex.: SnackBar)
        } finally {
          setLoading(false);
        }
      };
      fetchLocations();
    }, [loadLocations])
  );

  /**
   * Obtém o ícone correspondente ao nível de luz solar.
   * @param sunlight - Nível de luz solar (full, partial, shade).
   * @returns Ícone correspondente.
   */
  const getSunlightIcon = (sunlight: string): string => {
    switch (sunlight) {
      case 'full':
        return '☀️';
      case 'partial':
        return '⛅';
      case 'shade':
        return '🌤️';
      default:
        return '🏠';
    }
  };

  /**
   * Obtém o ícone correspondente ao tipo de local.
   * @param type - Tipo de local (indoor, outdoor, garden, balcony, terrace).
   * @returns Ícone correspondente.
   */
  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'indoor':
        return '🏠';
      case 'outdoor':
        return '🌳';
      case 'garden':
        return '🌷';
      case 'balcony':
        return '🏞️';
      case 'terrace':
        return '🏡';
      default:
        return '📍';
    }
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
      <Header title="Locais" />
      <View style={styles.buttonContainer}>
        <CustomButton
          onPress={() => router.push('/locations/new')}
          label="Adicionar Local"
          mode="contained"
          style={styles.button}
        />
      </View>
      {locations.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emptyText}>Nenhum local cadastrado.</Text>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={locations}
          keyExtractor={(item: Location) => item.id}
          renderItem={({ item }: { item: Location }) => (
            <Card
              style={styles.card}
              onPress={() => router.push(`/locations/${item.id}`)}
            >
              <Card.Content>
                <Text style={styles.title} variant="headlineSmall">
                  {getTypeIcon(item.type)} {item.name}
                </Text>
                <Text style={styles.subtitle} variant="bodyMedium">
                  {getSunlightIcon(item.sunlight)} Luz:{' '}
                  {item.sunlight === 'full'
                    ? 'Sol Pleno'
                    : item.sunlight === 'partial'
                    ? 'Meia Sombra'
                    : 'Sombra'}
                </Text>
                <Text style={styles.subtitle} variant="bodyMedium">
                  💧 Umidade:{' '}
                  {item.humidity === 'high'
                    ? 'Alta'
                    : item.humidity === 'medium'
                    ? 'Média'
                    : 'Baixa'}
                </Text>
                <Text style={styles.subtitle} variant="bodyMedium">
                  {item.description || 'Sem descrição'}
                </Text>
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