import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View, Platform, useColorScheme } from 'react-native';
import { Card, Modal, Portal, Text } from 'react-native-paper';
import CustomButton from '../../../src/components/CustomButton';
import Header from '../../../src/components/Header';
import { useCareLogs } from '../../../src/hooks/useCareLogs';
import { useCareReminders } from '../../../src/hooks/useCareReminders';
import { useLocations } from '../../../src/hooks/useLocations';
import { usePlants } from '../../../src/hooks/usePlants';
import { deleteAllPlants as apiDeleteAllPlants } from '../../../src/services/plants.service';
import { useSpecies } from '../../../src/hooks/useSpecies';
import { useTheme } from '../../../src/constants/theme';
 

/**
 * Tela de configurações para gerenciar dados do aplicativo e exibir informações e dicas.
 */
export default function SettingsScreen() {
  const [visible, setVisible] = useState(false);
  const [actionType, setActionType] = useState<'plants' | 'all' | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { theme, themeMode, setThemeMode } = useTheme();
  const systemColorScheme = useColorScheme();
  const { plants, loadPlants, deletePlant } = usePlants();
  const { careReminders, loadCareReminders, deleteCareReminder } = useCareReminders();
  const { careLogs, loadCareLogs, deleteCareLog } = useCareLogs();
  const { locations, loadLocations, clearEmptyLocations } = useLocations();
  const { species, loadSpecies, clearCustomSpecies } = useSpecies();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background, // #F5F5F5 (light) ou #202225 (dark)
    },
    scrollContent: {
      padding: 16,
    },
    card: {
      backgroundColor: theme.colors.surface, // #FFFFFF (light) ou #292B2F (dark)
      marginBottom: 16,
      borderRadius: 12,
      elevation: 4,
      ...(Platform.OS === 'web' ? {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      } : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }),
    },
    sectionTitle: {
      fontFamily: theme.fonts.titleMedium.fontFamily,
      color: theme.colors.onSurface, // #000000 (light) ou #FFFFFF (dark)
      marginBottom: 12,
    },
    infoText: {
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.onSurfaceVariant, // #666666 (light) ou #DBDBDB (dark)
      marginBottom: 8,
    },
    versionText: {
      fontFamily: theme.fonts.bodySmall.fontFamily,
      color: theme.colors.onSurfaceVariant,
      fontStyle: 'italic',
    },
    warningText: {
      fontFamily: theme.fonts.labelMedium.fontFamily,
      color: theme.colors.error,
      marginBottom: 16,
    },
    button: {
      marginBottom: 8,
      borderColor: theme.colors.error,
    },
    dangerButton: {
      marginBottom: 8,
    },
    noteText: {
      fontFamily: theme.fonts.bodySmall.fontFamily,
      color: theme.colors.onSurfaceVariant,
      fontStyle: 'italic',
      textAlign: 'center',
      marginBottom: 12,
    },
    tipText: {
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 8,
    },
    modalContainer: {
      backgroundColor: theme.colors.surface, // #FFFFFF (light) ou #292B2F (dark)
      padding: 20,
      margin: 20,
      borderRadius: 12,
      position: 'relative',
    },
    modalTitle: {
      fontFamily: theme.fonts.titleMedium.fontFamily,
      color: theme.colors.onSurface,
      marginBottom: 12,
      textAlign: 'center',
    },
    modalMessage: {
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 20,
      textAlign: 'center',
      lineHeight: 20,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalButton: {
      flex: 1,
      marginHorizontal: 6,
      borderColor: theme.colors.primary, // Adiciona borda para outlined
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
      color: theme.colors.onSurfaceVariant,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.background + 'CC', // Opacidade 80%
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
      zIndex: 1,
    },
    themeOption: {
      marginBottom: 16,
    },
    themeLabel: {
      fontSize: 16,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 8,
    },
    themeButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
    },
    themeButton: {
      flex: 1,
    },
  }), [theme]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          await Promise.all([
            loadPlants(),
            loadCareReminders(),
            loadCareLogs(),
            loadLocations(),
            loadSpecies(),
          ]);
        } catch (error) {
          console.error('Error loading settings data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [loadPlants, loadCareReminders, loadCareLogs, loadLocations, loadSpecies])
  );

  const showModal = (type: 'plants' | 'all') => {
    setActionType(type);
    setVisible(true);
  };

  const hideModal = () => {
    setVisible(false);
    setActionType(null);
  };

  // Execute bulk-delete via API, with a safe per-item fallback.
  const performDeleteAllPlants = async () => {
    try {
      setActionLoading(true);
      console.log('🌿 Iniciando exclusão de todas as plantas...');
      // Prefer bulk-delete endpoint for safety and atomicity
      try {
        await apiDeleteAllPlants();
        await Promise.all([loadPlants(), loadCareReminders(), loadCareLogs()]);
        console.log('🎉 Exclusão em massa concluída com sucesso');
        Alert.alert('Sucesso', 'Todas as plantas e dados relacionados foram removidos!');
      } catch (err) {
        console.warn('Bulk delete failed, falling back to per-item deletion:', err);
        // Fallback: try per-plant deletion for resilience
        let deletedPlants = 0;
        let deletedReminders = 0;
        let deletedLogs = 0;
        for (const plant of plants) {
          try {
            const plantCareLogs = careLogs.filter(log => log.plantId === plant.id);
            for (const log of plantCareLogs) {
              try { await deleteCareLog(log.id); deletedLogs++; } catch (error) { console.error('Erro ao deletar care log:', error); }
            }
            const plantReminders = careReminders.filter(reminder => reminder.plantId === plant.id);
            for (const reminder of plantReminders) {
              try { await deleteCareReminder(reminder.id); deletedReminders++; } catch (error) { console.error('Erro ao deletar reminder:', error); }
            }
            await deletePlant(plant.id);
            deletedPlants++;
          } catch (error) {
            console.error(`Erro ao deletar planta ${plant.name}:`, error);
          }
        }
        await Promise.all([loadPlants(), loadCareReminders(), loadCareLogs()]);
        Alert.alert(
          'Sucesso',
          `Operação concluída (fallback):\n• ${deletedPlants} plantas\n• ${deletedReminders} lembretes\n• ${deletedLogs} registros de cuidados`
        );
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível remover todas as plantas.');
      console.error('Error deleting all plants:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteAllData = async () => {
    try {
      setActionLoading(true);
      console.log('🔥 Iniciando limpeza completa de dados...');
      // perform bulk plant deletion (this will also remove reminders/logs server-side)
      await performDeleteAllPlants();
      // reload locations and species so clearing helpers operate on fresh state
      await Promise.all([loadLocations(), loadSpecies()]);
      console.log('📍 Limpando locais vazios...');
      await clearEmptyLocations();
      console.log('🌱 Limpando espécies personalizadas...');
      await clearCustomSpecies();
      await Promise.all([
        loadPlants(),
        loadCareReminders(),
        loadCareLogs(),
        loadLocations(),
        loadSpecies()
      ]);
      console.log('🎉 Limpeza completa concluída!');
      Alert.alert(
        'Sucesso',
        'Todos os dados do usuário foram removidos!\n\n' +
        '• Todas as plantas, lembretes e registros de cuidados\n' +
        '• Locais vazios\n' +
        '• Espécies personalizadas\n' +
        '• Apenas espécies e locais padrão foram mantidos'
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível limpar todos os dados.');
      console.error('Error clearing all data:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmAction = async () => {
    // close modal immediately to avoid UI/alert re-entrancy issues
    hideModal();
    try {
      if (actionType === 'plants') {
        await performDeleteAllPlants();
      } else if (actionType === 'all') {
        await deleteAllData();
      }
    } catch (err) {
      console.error('Error during confirmAction:', err);
      Alert.alert('Erro', 'Ocorreu um erro durante a operação.');
    }
  };

  const getModalTitle = (): string => {
    return actionType === 'plants' ? 'Limpar Todas as Plantas' : 'Limpar Todos os Dados';
  };

  const getModalMessage = (): string => {
    if (actionLoading) {
      return 'Processando...\n\nEsta operação pode levar alguns instantes.';
    }
    const plantsCount = plants.length;
    const remindersCount = careReminders.length;
    const logsCount = careLogs.length;
    const locationsCount = locations.length;
    const speciesCount = species.length;
    return actionType === 'plants'
      ? `Tem certeza que deseja remover?\n\n` +
        `• ${plantsCount} planta${plantsCount !== 1 ? 's' : ''}\n` +
        `• ${remindersCount} lembrete${remindersCount !== 1 ? 's' : ''} de cuidados\n` +
        `• ${logsCount} registro${logsCount !== 1 ? 's' : ''} de cuidados\n\n` +
        `Esta ação não pode ser desfeita.`
      : `Tem certeza que deseja remover TODOS os dados?\n\n` +
        `• ${plantsCount} planta${plantsCount !== 1 ? 's' : ''}\n` +
        `• ${remindersCount} lembrete${remindersCount !== 1 ? 's' : ''} de cuidados\n` +
        `• ${logsCount} registro${logsCount !== 1 ? 's' : ''} de cuidados\n` +
        `• ${locationsCount} local${locationsCount !== 1 ? 'is' : ''}\n` +
        `• ${speciesCount} espécie${speciesCount !== 1 ? 's' : ''} personalizada${speciesCount !== 1 ? 's' : ''}\n\n` +
        `Esta ação não pode ser desfeita.`;
  };

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
      <Header title="Configurações" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.sectionTitle}>Sobre o App</Text>
            <Text variant="bodyMedium" style={styles.infoText}>🌿 App Plantas - Gerencie suas plantas de forma fácil e organizada.</Text>
            <Text variant="bodySmall" style={styles.versionText}>Versão 1.0.0</Text>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.sectionTitle}>🎨 Aparência</Text>
            <View style={styles.themeOption}>
              <Text style={styles.themeLabel}>Tema</Text>
              <View style={styles.themeButtons}>
                <CustomButton
                  onPress={() => setThemeMode('light')}
                  label="🌞 Claro"
                  mode={themeMode === 'light' ? 'contained' : 'outlined'}
                  style={styles.themeButton}
                  buttonColor={themeMode === 'light' ? theme.colors.primary : undefined}
                  textColor={themeMode === 'light' ? theme.colors.onPrimary : theme.colors.primary}
                />
                <CustomButton
                  onPress={() => setThemeMode('dark')}
                  label="🌙 Escuro"
                  mode={themeMode === 'dark' ? 'contained' : 'outlined'}
                  style={styles.themeButton}
                  buttonColor={themeMode === 'dark' ? theme.colors.primary : undefined}
                  textColor={themeMode === 'dark' ? theme.colors.onPrimary : theme.colors.primary}
                />
                <CustomButton
                  onPress={() => setThemeMode('auto')}
                  label="⚙️ Automático"
                  mode={themeMode === 'auto' ? 'contained' : 'outlined'}
                  style={styles.themeButton}
                  buttonColor={themeMode === 'auto' ? theme.colors.primary : undefined}
                  textColor={themeMode === 'auto' ? theme.colors.onPrimary : theme.colors.primary}
                />
              </View>
            </View>
            <Text variant="bodySmall" style={styles.noteText}>
              {themeMode === 'auto'
                ? `Usando tema do sistema (${systemColorScheme === 'dark' ? 'escuro' : 'claro'})`
                : `Tema ${themeMode === 'light' ? 'claro' : 'escuro'} selecionado`}
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.sectionTitle}>Estatísticas</Text>
            <Text variant="bodyMedium" style={styles.infoText}>📊 Plantas cadastradas: {plants.length}</Text>
            <Text variant="bodyMedium" style={styles.infoText}>⏰ Lembretes ativos: {careReminders.length}</Text>
            <Text variant="bodyMedium" style={styles.infoText}>📝 Registros de cuidados: {careLogs.length}</Text>
            <Text variant="bodyMedium" style={styles.infoText}>🌱 Espécies: {species.length}</Text>
            <Text variant="bodyMedium" style={styles.infoText}>📍 Locais: {locations.length}</Text>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.sectionTitle}>Gerenciar Dados</Text>
            <Text variant="bodyMedium" style={styles.warningText}>⚠️ Ações irreversíveis</Text>
            <CustomButton
              onPress={() => showModal('plants')}
              label={`Remover Todas as Plantas (${plants.length})`}
              mode="outlined"
              style={[styles.button, styles.dangerButton]}
              textColor={theme.colors.error}
              disabled={plants.length === 0 || actionLoading}
            />
            <Text variant="bodySmall" style={styles.noteText}>
              Remove plantas, lembretes e registros de cuidados relacionados
            </Text>
            <CustomButton
              onPress={() => showModal('all')}
              label="Limpar Todos os Dados"
              mode="contained"
              style={[styles.button, styles.dangerButton]}
              buttonColor={theme.colors.error}
              textColor={theme.colors.onPrimary}
              disabled={actionLoading}
            />
            <Text variant="bodySmall" style={styles.noteText}>
              Remove tudo, incluindo espécies e locais padrão
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.sectionTitle}>Dicas</Text>
            <Text variant="bodyMedium" style={styles.tipText}>💡 Adicione fotos das suas plantas para um registro visual</Text>
            <Text variant="bodyMedium" style={styles.tipText}>⏰ Configure lembretes para não esquecer dos cuidados</Text>
            <Text variant="bodyMedium" style={styles.tipText}>📍 Organize suas plantas por locais específicos</Text>
            <Text variant="bodyMedium" style={styles.tipText}>📝 Registre os cuidados para acompanhar a saúde das plantas</Text>
          </Card.Content>
        </Card>
      </ScrollView>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContainer}
        >
          {actionLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Processando...</Text>
            </View>
          )}
          <Text variant="headlineSmall" style={styles.modalTitle}>{getModalTitle()}</Text>
          <Text variant="bodyMedium" style={styles.modalMessage}>{getModalMessage()}</Text>
          <View style={styles.modalButtons}>
            <CustomButton
              onPress={hideModal}
              label="Não"
              mode="outlined"
              style={styles.modalButton}
              textColor={theme.colors.primary}
              disabled={actionLoading}
            />
            <CustomButton
              onPress={confirmAction}
              label="Sim"
              mode="contained"
              style={styles.modalButton}
              buttonColor={theme.colors.error}
              textColor={theme.colors.onPrimary}
              disabled={actionLoading}
            />
          </View>
        </Modal>
      </Portal>
    </View>
  );
}