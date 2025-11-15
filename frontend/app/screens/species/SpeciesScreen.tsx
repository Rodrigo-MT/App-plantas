// app/screens/species/SpeciesScreen.tsx
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View, Platform, RefreshControl } from 'react-native';
import { ActivityIndicator, Card, Text, Searchbar } from 'react-native-paper';
import CustomButton from '../../../src/components/CustomButton';
import Header from '../../../src/components/Header';
import ErrorModal from '../../../src/components/ErrorModal';
import ScreenCard from '../../../src/components/ScreenCard';
import { useTheme } from '../../../src/constants/theme';
import { useSpecies } from '../../../src/hooks/useSpecies';
import { Species } from '../../../src/types/species';

/**
 * Tela de listagem de espécies, com suporte a tema dinâmico,
 * modal de erro e recarregamento ao focar a tela.
 */
export default function SpeciesScreen() {
  const { 
    species, 
    loadSpecies, 
    error, 
    clearError, 
    refreshing,
    
  } = useSpecies();
  
  const router = useRouter();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Filtra espécies baseado na busca
  const filteredSpecies = useMemo(() => {
    if (!searchQuery.trim()) return species;
    
    const normalizedSearch = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    return species.filter(speciesItem => 
      speciesItem.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedSearch) ||
      speciesItem.commonName?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedSearch) ||
      speciesItem.description?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedSearch)
    );
  }, [species, searchQuery]);

  // Recarrega ao focar na tela
  useFocusEffect(
    useCallback(() => {
      loadSpecies();
      // force FlatList to re-evaluate items when returning to the screen
      setRefreshKey((k) => k + 1);
    }, [loadSpecies])
  );

  // Deletion handled in species form; no inline delete here to avoid unused state

  // Função para recarregar com pull-to-refresh
  const handleRefresh = useCallback(() => {
    loadSpecies();
  }, [loadSpecies]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          padding: 16,
          backgroundColor: theme.colors.background,
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
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer'
              }
            : {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }),
        },
        cardCover: {
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          height: 150,
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
        emptyField: {
          color: theme.colors.secondary,
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
      }),
    [theme]
  );

  // Loading apenas na primeira carga
  if (refreshing && species.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando espécies...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Espécies" />

      {/* Barra de pesquisa */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar por nome científico, comum ou descrição..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchInput}
          iconColor={theme.colors.primary}
          placeholderTextColor={theme.colors.secondary}
          inputStyle={{ color: theme.colors.text }}
        />
      </View>

      {/* Estatísticas */}
      {species.length > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {filteredSpecies.length} de {species.length} espécie{species.length !== 1 ? 's' : ''}
          </Text>
          {searchQuery && (
            <Text style={styles.statsText}>
              Buscando: &quot;{searchQuery}&quot;
            </Text>
          )}
        </View>
      )}

      {/* Botão para adicionar nova espécie */}
      <View style={styles.buttonContainer}>
        <CustomButton
          onPress={() => router.push('/screens/species/SpeciesForm')}
          label="Adicionar Espécie"
          mode="contained"
          style={styles.button}
          buttonColor={theme.colors.primary}
          textColor={theme.colors.onPrimary}
          icon="plus"
        />
      </View>

      {/* Lista de espécies */}
      {species.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emptyText}>
              Nenhuma espécie cadastrada até o momento.
            </Text>
            <Text style={[styles.emptyText, { fontSize: 14, marginTop: 8 }]}> 
              Toque em &quot;Adicionar Espécie&quot; para começar!
            </Text>
          </Card.Content>
        </Card>
      ) : filteredSpecies.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emptySearchText}>
              Nenhuma espécie encontrada para &quot;{searchQuery}&quot;.
            </Text>
            <Text style={[styles.emptySearchText, { marginTop: 8 }]}>
              Tente ajustar os termos da busca.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={filteredSpecies}
          keyExtractor={(item: Species) => item.id}
          extraData={refreshKey}
          renderItem={({ item }: { item: Species }) => (
            <ScreenCard
              image={item.photo ?? null}
              title={item.name || 'Espécie sem nome'}
              subtitle={item.commonName ? `🌿 ${item.commonName}` : '🌿 Sem nome comum'}
              description={item.description ? `📝 ${item.description}` : undefined}
              badges={[item.commonName ?? ''].filter(Boolean)}
              onPress={() => router.push(`/screens/species/SpeciesForm?id=${item.id}`)}
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