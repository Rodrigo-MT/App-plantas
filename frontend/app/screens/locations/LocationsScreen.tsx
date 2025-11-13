import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View, Platform, Image } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CustomButton from '../../../src/components/CustomButton';
import Header from '../../../src/components/Header';
import ErrorModal from '../../../src/components/ErrorModal';
import { useTheme } from '../../../src/constants/theme';
import { useLocations } from '../../../src/hooks/useLocations';
import { handleApiError } from '../../../src/utils/handleApiError';
import { Location } from '../../../src/types/location';

/**
 * Tela responsável por exibir todos os locais cadastrados.
 * Segue o mesmo padrão visual de PlantsScreen.
 */
export default function LocationsScreen() {
  const { locations, loadLocations } = useLocations();
  const router = useRouter();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 🔁 Recarrega os locais quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      const fetchLocations = async () => {
        try {
          setLoading(true);
          await loadLocations();
        } catch (error) {
          const msg = handleApiError(error, 'Erro ao carregar locais');
          setErrorMessage(msg);
          setErrorVisible(true);
        } finally {
          setLoading(false);
        }
      };
      fetchLocations();
    }, [loadLocations])
  );

  // 🌤️ Ícones utilitários
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

  // 🎨 Estilos dependentes do tema
  const styles = useMemo(() => StyleSheet.create({
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
    list: {
      paddingBottom: 16,
    },
    card: {
      marginBottom: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      overflow: 'hidden',
      elevation: 4,
      ...(Platform.OS === 'web'
        ? { boxShadow: '0px 2px 6px rgba(0,0,0,0.12)' }
        : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
          }),
    },
    image: {
      width: '100%',
      height: 160,
      resizeMode: 'cover',
    },
    imagePlaceholder: {
      width: '100%',
      height: 160,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
    },
    content: {
      padding: 12,
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
      marginBottom: 2,
    },
    emptyCard: {
      backgroundColor: theme.colors.surface,
      padding: 24,
      borderRadius: 12,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.text,
      textAlign: 'center',
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
  }), [theme]);

  // ⏳ Estado de carregamento
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando locais...</Text>
      </View>
    );
  }

  // 🏡 Tela principal
  return (
    <View style={styles.container}>
      <Header title="Locais" />

      <View style={styles.buttonContainer}>
        <CustomButton
          onPress={() => router.push('/screens/locations/LocationsForm')}
          label="Adicionar Local"
          mode="contained"
          style={styles.button}
          buttonColor={theme.colors.primary}
          textColor={theme.colors.onPrimary}
        />
      </View>

      {locations.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Nenhum local cadastrado ainda.</Text>
        </View>
      ) : (
        <FlatList
          data={locations.sort((a, b) => a.name.localeCompare(b.name))}
          keyExtractor={(item: Location) => item.id}
          renderItem={({ item }: { item: Location }) => (
            <Card
              style={styles.card}
              onPress={() => router.push(`/screens/locations/LocationsForm?id=${item.id}`)}
            >
              {/* Exibição da imagem do local (base64/data uri ou URL).
                  Se não houver imagem, exibe um ícone genérico (sem placeholder file). */}
              {item.photo ? (
                // item.photo pode ser base64 data URI ou URL; Image lida com ambos
                <Image
                  source={{ uri: item.photo }}
                  style={styles.image}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <MaterialCommunityIcons
                    name="image-off"
                    size={48}
                    color={theme.colors.onSurfaceVariant}
                  />
                </View>
              )}

              <View style={styles.content}>
                <Text style={styles.title}>
                  {getTypeIcon(item.type)} {item.name || 'Sem nome'}
                </Text>
                <Text style={styles.subtitle}>
                  {getSunlightIcon(item.sunlight)} Luz: {item.sunlight === 'full' ? 'Sol Pleno' : item.sunlight === 'partial' ? 'Meia Sombra' : 'Sombra'}
                </Text>
                <Text style={styles.subtitle}>
                  💧 Umidade: {item.humidity === 'high' ? 'Alta' : item.humidity === 'medium' ? 'Média' : 'Baixa'}
                </Text>
                {item.description && (
                  <Text style={styles.subtitle}>📝 {item.description}</Text>
                )}
              </View>
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
