import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View, Platform, RefreshControl } from 'react-native';
import { ActivityIndicator, Card, Text, Searchbar } from 'react-native-paper';
import CustomButton from '../../../src/components/CustomButton';
import Header from '../../../src/components/Header';
import ScreenCard from '../../../src/components/ScreenCard';
import ErrorModal from '../../../src/components/ErrorModal';
import { useTheme } from '../../../src/constants/theme';
import { usePlants } from '../../../src/hooks/usePlants';
import { Plant } from '../../../src/types/plant';

/**
 * Tela responsável por exibir todas as plantas do usuário,
 * permitindo visualizar, editar e adicionar novas.
 */
export default function PlantsScreen() {
  const { 
    plants, 
    loadPlants, 
    error, 
    clearError, 
    refreshing, 
    filterPlants 
  } = usePlants();
  
  const router = useRouter();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Filtra plantas baseado na busca
  const filteredPlants = useMemo(() => {
    return filterPlants(searchQuery);
  }, [searchQuery, filterPlants]);

  // Recarrega as plantas ao focar na tela
  useFocusEffect(
    useCallback(() => {
      loadPlants();
      // Force FlatList extraData update so recycled item views (images) re-render
      setRefreshKey((k) => k + 1);
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
        card: {
          marginBottom: 12,
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          elevation: 4,
          ...(Platform.OS === 'web'
            ? { 
                boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.12)',
                cursor: 'pointer'
              }
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
          marginTop: 32,
        },
        emptySearchText: {
          fontSize: 14,
          fontFamily: theme.fonts.bodyMedium.fontFamily,
          color: theme.colors.secondary,
          textAlign: 'center',
          marginTop: 32,
          fontStyle: 'italic',
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
      }),
    [theme]
  );

  // Função para navegar para o formulário de edição
  const handleEditPlant = useCallback((plant: Plant) => {
    router.push(`/screens/plants/PlantsForm?id=${plant.id}`);
  }, [router]);

  // Função para recarregar com pull-to-refresh
  const handleRefresh = useCallback(() => {
    loadPlants();
  }, [loadPlants]);

  // ⏳ Estado de carregamento
  if (refreshing && plants.length === 0) {
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

      {/* Barra de pesquisa */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar por nome, espécie ou localização..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchInput}
          iconColor={theme.colors.primary}
          placeholderTextColor={theme.colors.secondary}
          inputStyle={{ color: theme.colors.text }}
        />
      </View>

      {/* Estatísticas */}
      {plants.length > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {filteredPlants.length} de {plants.length} planta{plants.length !== 1 ? 's' : ''}
          </Text>
          {searchQuery && (
            <Text style={styles.statsText}>
              Buscando: &quot;{searchQuery}&quot;
            </Text>
          )}
        </View>
      )}

      {/* Botão para adicionar nova planta */}
      <View style={styles.buttonContainer}>
        <CustomButton
          onPress={() => router.push('/screens/plants/PlantsForm')}
          label="Adicionar Planta"
          mode="contained"
          style={styles.button}
          buttonColor={theme.colors.primary}
          textColor={theme.colors.onPrimary}
          icon="plus"
        />
      </View>

      {/* Lista de plantas */}
      {plants.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emptyText}>
              Nenhuma planta cadastrada até o momento.
            </Text>
            <Text style={[styles.emptyText, { fontSize: 14, marginTop: 8 }]}> 
              Toque em &quot;Adicionar Planta&quot; para começar sua coleção!
            </Text>
          </Card.Content>
        </Card>
      ) : filteredPlants.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emptySearchText}>
              Nenhuma planta encontrada para &quot;{searchQuery}&quot;.
            </Text>
            <Text style={[styles.emptySearchText, { marginTop: 8 }]}>
              Tente ajustar os termos da busca.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={filteredPlants}
          keyExtractor={(item: Plant) => item.id}
          extraData={refreshKey}
          renderItem={({ item }: { item: Plant }) => (
            <ScreenCard
              image={item.photo ?? null}
              title={item.name || 'Planta sem nome'}
              subtitle={`🌿 ${item.speciesName || 'Espécie não definida'}`}
              secondLine={`📍 ${item.locationName || 'Local não definido'}`}
              description={item.notes ? `📝 ${item.notes}` : undefined}
              badges={[item.speciesName?.split(' ')[0] ?? '', item.locationName ?? ''].filter(Boolean)}
              onPress={() => handleEditPlant(item)}
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

      {/* Modal de erro */}
      <ErrorModal 
        visible={!!error} 
        message={error || ''} 
        onDismiss={clearError} 
      />
    </View>
  );
}