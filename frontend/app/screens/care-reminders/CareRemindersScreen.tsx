// app/screens/care-reminders/CareRemindersScreen.tsx
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View, Platform, RefreshControl } from 'react-native';
import { ActivityIndicator, Card, Text, Searchbar } from 'react-native-paper';
import CustomButton from '../../../src/components/CustomButton';
import Header from '../../../src/components/Header';
import ErrorModal from '../../../src/components/ErrorModal';
import { useTheme } from '../../../src/constants/theme';
import { useCareReminders } from '../../../src/hooks/useCareReminders';
import { CareReminder } from '../../../src/types/careReminder';

/**
 * Tela para exibir a lista de lembretes de cuidados, com opção de criar e editar lembretes.
 */
export default function CareRemindersScreen() {
  const { 
    careReminders, 
    loadCareReminders, 
    error, 
    clearError, 
    refreshing,
    getOverdueReminders,
    getUpcomingReminders 
  } = useCareReminders();
  
  const router = useRouter();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // Filtra lembretes baseado na busca
  const filteredReminders = useMemo(() => {
    if (!searchQuery.trim()) return careReminders;
    
    const normalizedSearch = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    return careReminders.filter(reminder => 
      reminder.plantName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedSearch) ||
      reminder.type.toLowerCase().includes(normalizedSearch) ||
      reminder.notes?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedSearch)
    );
  }, [careReminders, searchQuery]);

  // Recarrega os lembretes ao focar na tela
  useFocusEffect(
    useCallback(() => {
      loadCareReminders();
    }, [loadCareReminders])
  );

  // 🌿 Funções utilitárias
  const getCareTypeIcon = (type: string): string => {
    switch (type) {
      case 'watering': return '💧 Regar';
      case 'fertilizing': return '🌱 Adubar';
      case 'pruning': return '✂️ Podar';
      case 'sunlight': return '☀️ Sol';
      default: return '📝 Outro';
    }
  };

  const getCareTypeColor = (type: string): string => {
    switch (type) {
      case 'watering': return theme.colors.accent;
      case 'fertilizing': return theme.colors.primary;
      case 'pruning': return theme.colors.secondary;
      case 'sunlight': return theme.colors.accent;
      default: return theme.colors.secondary;
    }
  };


  const getDueStatus = (nextDue: Date, isActive: boolean) => {
    if (!isActive) return { text: 'Inativo', color: theme.colors.onSurfaceVariant };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(nextDue);
    
    if (dueDate < today) return { text: 'Atrasado', color: theme.colors.error };
    
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 2) return { text: 'Próximo', color: theme.colors.accent };
    return { text: 'No prazo', color: theme.colors.primary };
  };

  // Mark-as-done action handled in individual reminder form; removed inline action to avoid unused vars

  // Função para recarregar com pull-to-refresh
  const handleRefresh = useCallback(() => {
    loadCareReminders();
  }, [loadCareReminders]);

  // 🎨 Estilos dinâmicos dependentes do tema
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
    inactiveCard: { 
      opacity: 0.6,
      backgroundColor: theme.colors.surfaceVariant,
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
    doneButton: {
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
  }), [theme]);

  // Loading apenas na primeira carga
  if (refreshing && careReminders.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando lembretes...</Text>
      </View>
    );
  }

  // Estatísticas
  const overdueCount = getOverdueReminders().length;
  const upcomingCount = getUpcomingReminders().length;

  // 🪴 Tela principal
  return (
    <View style={styles.container}>
      <Header title="Lembretes de Cuidado" />

      {/* Barra de pesquisa */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar por planta, tipo ou observações..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchInput}
          iconColor={theme.colors.primary}
          placeholderTextColor={theme.colors.secondary}
          inputStyle={{ color: theme.colors.text }}
        />
      </View>

      {/* Estatísticas */}
      {careReminders.length > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {filteredReminders.length} de {careReminders.length} lembrete{careReminders.length !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.statsText}>
            {overdueCount} atrasado{overdueCount !== 1 ? 's' : ''} • {upcomingCount} próximo{upcomingCount !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Botão para novo lembrete */}
      <View style={styles.buttonContainer}>
        <CustomButton
          onPress={() => router.push('/screens/care-reminders/CareRemindersForm')}
          label="Novo Lembrete"
          mode="contained"
          style={styles.button}
          buttonColor={theme.colors.primary}
          textColor={theme.colors.onPrimary}
          icon="plus"
        />
      </View>

      {/* Lista de lembretes */}
      {careReminders.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emptyText}>
              Nenhum lembrete cadastrado até o momento.
            </Text>
            <Text style={[styles.emptyText, { fontSize: 14, marginTop: 8 }]}>
              Toque em &quot;Novo Lembrete&quot; para começar!
            </Text>
          </Card.Content>
        </Card>
      ) : filteredReminders.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emptySearchText}>
              Nenhum lembrete encontrado para &quot;{searchQuery}&quot;.
            </Text>
            <Text style={[styles.emptySearchText, { marginTop: 8 }]}>
              Tente ajustar os termos da busca.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={filteredReminders.sort((a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime())}
          keyExtractor={(item: CareReminder) => item.id}
          renderItem={({ item }) => {
            const status = getDueStatus(item.nextDue, item.isActive);
            const typeColor = getCareTypeColor(item.type);
            
            return (
              <Card
                style={[styles.card, !item.isActive && styles.inactiveCard]}
                onPress={() => router.push(`/screens/care-reminders/CareRemindersForm?id=${item.id}`)}
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
                      {status.text}
                    </Text>
                  </View>

                  {/* Informações */}
                  <Text style={styles.subtitle}>
                    📅 Próximo: {new Date(item.nextDue).toLocaleDateString('pt-BR')}
                  </Text>
                  <Text style={styles.subtitle}>
                    🔄 A cada {item.frequency} dia{item.frequency !== 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.subtitle}>
                    📍 Último: {new Date(item.lastDone).toLocaleDateString('pt-BR')}
                  </Text>
                  
                  {item.notes && (
                    <Text style={styles.notes} numberOfLines={2}>
                      📝 {item.notes}
                    </Text>
                  )}

                  {/* Ações: removido botão 'Concluir' — não é necessário */}
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

      <ErrorModal visible={!!error} message={error || ''} onDismiss={clearError} />
    </View>
  );
}