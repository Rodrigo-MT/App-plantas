// app/screens/care-logs/CareLogsScreen.tsx
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Platform, StyleSheet, View, RefreshControl } from 'react-native';
import { ActivityIndicator, Card, Text, Searchbar } from 'react-native-paper';
import Header from '../../../src/components/Header';
import CustomButton from '../../../src/components/CustomButton';
import ErrorModal from '../../../src/components/ErrorModal';
import { useTheme } from '../../../src/constants/theme';
import { useCareLogs } from '../../../src/hooks/useCareLogs';
import { CareLog } from '../../../src/types/careLog';

/**
 * Tela para exibir a lista de registros de cuidados realizados.
 */
export default function CareLogsScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const { 
    careLogs, 
    loadCareLogs, 
    error, 
    clearError, 
    refreshing,
    findSuccessfulLogs,
  } = useCareLogs();
  const [searchQueryLocal, setSearchQueryLocal] = useState('');

  // Filtra logs baseado na busca
  const filteredLogs = useMemo(() => {
    if (!searchQueryLocal.trim()) return careLogs;
    
    const normalizedSearch = searchQueryLocal.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    return careLogs.filter(log => 
      log.plantName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedSearch) ||
      log.type.toLowerCase().includes(normalizedSearch) ||
      log.notes?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedSearch)
    );
  }, [careLogs, searchQueryLocal]);

  // 🔁 Carrega logs sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      loadCareLogs();
    }, [loadCareLogs])
  );

  // 🪴 Mapeia o tipo de cuidado para ícone + texto
  const getCareTypeIcon = (type: string): string => {
    switch (type) {
      case 'watering': return '💧 Regar';
      case 'fertilizing': return '🌱 Adubar';
      case 'pruning': return '✂️ Podar';
      case 'repotting': return '🪴 Transplantar';
      case 'cleaning': return '🧹 Limpar';
      case 'sunlight': return '☀️ Sol';
      default: return '📝 Outro';
    }
  };

  const getCareTypeColor = (type: string): string => {
    switch (type) {
      case 'watering': return theme.colors.accent;
      case 'fertilizing': return theme.colors.primary;
      case 'pruning': return theme.colors.secondary;
      case 'repotting': return theme.colors.accent;
      case 'cleaning': return theme.colors.secondary;
      case 'sunlight': return theme.colors.accent;
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const getLogStatus = (item: CareLog) => {
    if (item.success === true) return { text: 'Bem-sucedido', color: theme.colors.primary };
    return { text: 'Não realizado', color: theme.colors.error };
  };

  // Note: delete action handled in the edit form. No inline delete here.

  // Função para recarregar com pull-to-refresh
  const handleRefresh = useCallback(() => {
    loadCareLogs();
  }, [loadCareLogs]);

  // 🎨 Estilos dependentes do tema
  const styles = useMemo(() => StyleSheet.create({
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
    plantName: {
      fontSize: 14,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    status: {
      fontSize: 12,
      fontFamily: theme.fonts.labelSmall.fontFamily,
      fontWeight: '600',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      overflow: 'hidden',
    },
    subtitle: {
      fontSize: 14,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 4,
      lineHeight: 20,
    },
    notes: {
      fontSize: 12,
      fontFamily: theme.fonts.bodySmall.fontFamily,
      color: theme.colors.onSurfaceVariant,
      marginTop: 8,
      fontStyle: 'italic',
      lineHeight: 16,
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
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.text,
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
    typeBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      marginBottom: 8,
    },
    typeBadgeText: {
      fontSize: 12,
      fontFamily: theme.fonts.labelSmall.fontFamily,
      color: theme.colors.onPrimary,
      fontWeight: '500',
    },
    successIcon: {
      fontSize: 16,
      marginRight: 4,
    },
  }), [theme]);

  // Loading apenas na primeira carga
  if (refreshing && careLogs.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando registros...</Text>
      </View>
    );
  }

  // Estatísticas
  const successfulCount = findSuccessfulLogs().length;
  const totalCount = careLogs.length;

  // 🪴 Tela principal
  return (
    <View style={styles.container}>
      <Header title="Registros de Cuidado" />

      {/* Barra de pesquisa */}
      <View style={styles.searchContainer}>
          <Searchbar
          placeholder="Buscar por planta, tipo ou observações..."
          onChangeText={setSearchQueryLocal}
          value={searchQueryLocal}
          style={styles.searchInput}
          iconColor={theme.colors.primary}
          placeholderTextColor={theme.colors.secondary}
          inputStyle={{ color: theme.colors.text }}
        />
      </View>

      {/* Estatísticas */}
      {careLogs.length > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {filteredLogs.length} de {totalCount} registro{totalCount !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.statsText}>
            {successfulCount} bem-sucedido{successfulCount !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <CustomButton
          onPress={() => router.push('/screens/care-logs/CareLogsForm')}
          label="Novo Registro"
          mode="contained"
          style={styles.button}
          buttonColor={theme.colors.primary}
          textColor={theme.colors.onPrimary}
          icon="plus"
        />
      </View>

      {careLogs.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emptyText}>
              Nenhum registro de cuidado cadastrado até o momento.
            </Text>
            <Text style={[styles.emptyText, { fontSize: 14, marginTop: 8 }]}>
              Toque em &quot;Novo Registro&quot; para começar!
            </Text>
          </Card.Content>
        </Card>
      ) : filteredLogs.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emptySearchText}>
              Nenhum registro encontrado para &quot;{searchQueryLocal}&quot;.
            </Text>
            <Text style={[styles.emptySearchText, { marginTop: 8 }]}>
              Tente ajustar os termos da busca.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={filteredLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
          keyExtractor={(item: CareLog) => item.id}
          renderItem={({ item }) => {
            const status = getLogStatus(item);
            const typeColor = getCareTypeColor(item.type);
            
            return (
              <Card
                style={styles.card}
                onPress={() => router.push(`/screens/care-logs/CareLogsForm?id=${item.id}`)}
              >
                <Card.Content>
                  {/* Badge do tipo */}
                  <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
                    <Text style={styles.typeBadgeText}>
                      {getCareTypeIcon(item.type)}
                    </Text>
                  </View>

                  {/* Cabeçalho */}
                  <View style={styles.headerRow}>
                    <View style={styles.titleContainer}>
                      <Text style={styles.plantName}>🌿 {item.plantName}</Text>
                    </View>
                    <Text style={[styles.status, { 
                      backgroundColor: status.color + '20',
                      color: status.color 
                    }]}>
                      {item.success ? '✅ ' : '❌ '}{status.text}
                    </Text>
                  </View>

                  {/* Informações */}
                  <Text style={styles.subtitle}>
                    📅 {new Date(item.date).toLocaleDateString('pt-BR')}
                  </Text>
                  
                  {item.notes && (
                    <Text style={styles.notes} numberOfLines={2}>
                      📝 {item.notes}
                    </Text>
                  )}

                  {/* Ações */}
                  {/* Ações removidas: editar/excluir via toque no cartão / formulário de edição */}
                </Card.Content>
              </Card>
            );
          }}
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

      <ErrorModal 
        visible={!!error} 
        message={error || ''} 
        onDismiss={clearError} 
      />
    </View>
  );
}