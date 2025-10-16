import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import CustomButton from '../../../components/CustomButton';
import Header from '../../../components/Header';
import { useTheme } from '../../../constants/theme';
import { useLocations } from '../../../hooks/useLocations';
import { Location } from '../../../types/location';

/**
 * Tela para exibir a lista de locais, com opção de adicionar um novo local.
 */
export default function LocationsScreen() {
  const { locations, loadLocations } = useLocations();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useFocusEffect(
    useCallback(() => {
      const fetchLocations = async () => {
        try {
          setLoading(true);
          await loadLocations();
        } catch (error) {
          console.error('Error loading locations:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchLocations();
    }, [loadLocations])
  );

  const getSunlightIcon = (sunlight: string): string => {
    switch (sunlight) {
      case 'full': return '☀️';
      case 'partial': return '⛅';
      case 'shade': return '🌤️';
      default: return '🏠';
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'indoor': return '🏠';
      case 'outdoor': return '🌳';
      case 'garden': return '🌷';
      case 'balcony': return '🏞️';
      case 'terrace': return '🏡';
      default: return '📍';
    }
  };

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
      backgroundColor: theme.colors.surface, // #FFFFFF (light) ou #292B2F (dark)
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    title: {
      fontSize: 18,
      fontFamily: theme.fonts.titleMedium.fontFamily,
      color: theme.colors.primary, // #32c273 (light) ou #7289DA (dark)
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.onSurfaceVariant, // #666666 (light) ou #DBDBDB (dark)
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
      color: theme.colors.text, // #333333 (light) ou #FFFFFF (dark)
      fontFamily: theme.fonts.bodyMedium.fontFamily,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.text,
      textAlign: 'center',
    },
  }), [theme]);

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
          buttonColor={theme.colors.primary}
          textColor={theme.colors.onPrimary}
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
            <Card style={styles.card} onPress={() => router.push(`/locations/${item.id}`)}>
              <Card.Content>
                <Text style={styles.title} variant="headlineSmall">
                  {getTypeIcon(item.type)} {item.name || 'Nome não definido'}
                </Text>
                <Text style={styles.subtitle} variant="bodyMedium">
                  {getSunlightIcon(item.sunlight)} Luz: {item.sunlight === 'full' ? 'Sol Pleno' : item.sunlight === 'partial' ? 'Meia Sombra' : 'Sombra'}
                </Text>
                <Text style={styles.subtitle} variant="bodyMedium">
                  💧 Umidade: {item.humidity === 'high' ? 'Alta' : item.humidity === 'medium' ? 'Média' : 'Baixa'}
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