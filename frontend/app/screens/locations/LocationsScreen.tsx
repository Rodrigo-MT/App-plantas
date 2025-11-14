import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View, Platform, RefreshControl } from 'react-native';
import { ActivityIndicator, Card, Text, Searchbar } from 'react-native-paper';
import CustomButton from '../../../src/components/CustomButton';
import Header from '../../../src/components/Header';
import ErrorModal from '../../../src/components/ErrorModal';
import ScreenCard from '../../../src/components/ScreenCard';
import { useTheme } from '../../../src/constants/theme';
import { useLocations } from '../../../src/hooks/useLocations';
import { Location } from '../../../src/types/location';

/**
 * Tela responsável por exibir todos os locais cadastrados.
 * Segue o mesmo padrão visual de PlantsScreen.
 */
export default function LocationsScreen() {
  const { 
    locations, 
    loadLocations, 
    error, 
    clearError, 
    refreshing,
    findLocationsByType,
  } = useLocations();
  
  const router = useRouter();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Filtra locais baseado na busca
  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return locations;
    
    const normalizedSearch = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    return locations.filter(location => 
      location.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedSearch) ||
      location.description?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedSearch) ||
      location.type.toLowerCase().includes(normalizedSearch)
    );
  }, [locations, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      loadLocations();
      // ensure FlatList re-renders recycled items (fix stale images)
      setRefreshKey((k) => k + 1);
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

  const getSunlightText = (sunlight: string): string => {
    switch (sunlight) {
      case 'full': return 'Sol Pleno';
      case 'partial': return 'Meia Sombra';
      case 'shade': return 'Sombra';
      default: return sunlight;
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

  const getTypeText = (type: string): string => {
    switch (type) {
      case 'indoor': return 'Interno';
      case 'outdoor': return 'Externo';
      case 'garden': return 'Jardim';
      case 'balcony': return 'Varanda';
      case 'terrace': return 'Terraço';
      default: return type;
    }
  };

  const getHumidityText = (humidity: string): string => {
    switch (humidity) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return humidity;
    }
  };

  // Deletion handled in edit form; keep list simple

  // Função para recarregar com pull-to-refresh
  const handleRefresh = useCallback(() => {
    loadLocations();
  }, [loadLocations]);

  // 🎨 Estilos dependentes do tema
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 16,
    },
    searchContainer: {
      marginBottom: 16,
    },
    searchInput: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
    },
    buttonContainer: {
      marginBottom: 16,
      alignItems: 'flex-start',
    },
    button: {
      marginBottom: 8,
    },
    list: {
      paddingBottom: 16,
    },
    card: {
      marginBottom: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      overflow: 'hidden',
      elevation: 4,
      ...(Platform.OS === 'web'
        ? { 
            boxShadow: '0px 2px 6px rgba(0,0,0,0.12)',
            cursor: 'pointer'
          }
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
      backgroundColor: theme.colors.surfaceVariant,
    },
    content: {
      padding: 16,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    titleContainer: {
      flex: 1,
      marginRight: 8,
    },
    title: {
      fontSize: 18,
      fontFamily: theme.fonts.titleMedium.fontFamily,
      fontWeight: '600',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 4,
      lineHeight: 20,
    },
    description: {
      fontSize: 14,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.onSurfaceVariant,
      marginTop: 8,
      fontStyle: 'italic',
      lineHeight: 18,
    },
    emptyCard: {
      backgroundColor: theme.colors.surface,
      padding: 32,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 32,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    emptySearchText: {
      fontSize: 14,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.secondary,
      textAlign: 'center',
      marginTop: 32,
      fontStyle: 'italic',
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
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
      paddingHorizontal: 8,
    },
    statsText: {
      fontSize: 14,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.secondary,
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 12,
      gap: 8,
    },
    deleteButton: {
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    badgeContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
      gap: 6,
    },
    badge: {
      backgroundColor: theme.colors.primaryContainer,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: {
      fontSize: 12,
      fontFamily: theme.fonts.labelSmall.fontFamily,
      color: theme.colors.onPrimaryContainer,
      fontWeight: '500',
    },
  }), [theme]);

  // Loading apenas na primeira carga
  if (refreshing && locations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando locais...</Text>
      </View>
    );
  }

  // Estatísticas
  const indoorCount = findLocationsByType('indoor').length;
  const outdoorCount = findLocationsByType('outdoor').length;
  const totalCount = locations.length;

  // 🏡 Tela principal
  return (
    <View style={styles.container}>
      <Header title="Locais" />

      {/* Barra de pesquisa */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar por nome, tipo ou descrição..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchInput}
          iconColor={theme.colors.primary}
          placeholderTextColor={theme.colors.secondary}
          inputStyle={{ color: theme.colors.text }}
        />
      </View>

      {/* Estatísticas */}
      {locations.length > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {filteredLocations.length} de {totalCount} local{totalCount !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.statsText}>
            {indoorCount} interno{indoorCount !== 1 ? 's' : ''} • {outdoorCount} externo{outdoorCount !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <CustomButton
          onPress={() => router.push('/screens/locations/LocationsForm')}
          label="Adicionar Local"
          mode="contained"
          style={styles.button}
          buttonColor={theme.colors.primary}
          textColor={theme.colors.onPrimary}
          icon="plus"
        />
      </View>

      {locations.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyText}>
              Nenhum local cadastrado até o momento.
            </Text>
            <Text style={[styles.emptyText, { fontSize: 14 }]}> 
              Toque em &quot;Adicionar Local&quot; para começar!
            </Text>
          </Card.Content>
        </Card>
      ) : filteredLocations.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptySearchText}>
              Nenhum local encontrado para &quot;{searchQuery}&quot;.
            </Text>
            <Text style={[styles.emptySearchText, { marginTop: 8 }]}>
              Tente ajustar os termos da busca.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={filteredLocations.sort((a, b) => a.name.localeCompare(b.name))}
          keyExtractor={(item: Location) => item.id}
          extraData={refreshKey}
          renderItem={({ item }: { item: Location }) => (
            <ScreenCard
              image={item.photo ?? null}
              title={`${getTypeIcon(item.type)} ${item.name || 'Sem nome'}`}
              subtitle={`${getSunlightIcon(item.sunlight)} ${getSunlightText(item.sunlight)}`}
              secondLine={`💧 Umidade: ${getHumidityText(item.humidity)}`}
              description={item.description}
              badges={[getTypeText(item.type), getSunlightText(item.sunlight)]}
              onPress={() => router.push(`/screens/locations/LocationsForm?id=${item.id}`)}
              refreshKey={refreshKey}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <ErrorModal visible={!!error} message={error || ''} onDismiss={clearError} />
    </View>
  );
}