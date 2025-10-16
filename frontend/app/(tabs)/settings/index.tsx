// app/(tabs)/settings/index.tsx - VERSÃO CORRIGIDA
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Modal, Portal, Text } from 'react-native-paper';
import CustomButton from '../../../components/CustomButton';
import Header from '../../../components/Header';
import theme from '../../../constants/theme';
import { useCareLogs } from '../../../hooks/useCareLogs';
import { useCareReminders } from '../../../hooks/useCareReminders';
import { useLocations } from '../../../hooks/useLocations';
import { usePlants } from '../../../hooks/usePlants';
import { useSpecies } from '../../../hooks/useSpecies';

/**
 * Tela de configurações para gerenciar dados do aplicativo e exibir informações e dicas.
 */
export default function SettingsScreen() {
  const [visible, setVisible] = useState(false);
  const [actionType, setActionType] = useState<'plants' | 'all' | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { plants, loadPlants, deletePlant } = usePlants();
  const { careReminders, loadCareReminders, deleteCareReminder } = useCareReminders();
  const { careLogs, loadCareLogs, deleteCareLog } = useCareLogs();
  const { locations, loadLocations, clearEmptyLocations } = useLocations();
  const { species, loadSpecies, clearCustomSpecies } = useSpecies();

  // Carrega todos os dados quando a tela ganha foco
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

  /**
   * Exibe o modal de confirmação para a ação selecionada.
   */
  const showModal = (type: 'plants' | 'all') => {
    setActionType(type);
    setVisible(true);
  };

  /**
   * Oculta o modal de confirmação.
   */
  const hideModal = () => {
    setVisible(false);
    setActionType(null);
  };

  /**
   * Deleta todas as plantas e dados relacionados (care logs e reminders)
   */
  const deleteAllPlants = async () => {
    try {
      setActionLoading(true);
      
      console.log('🌿 Iniciando exclusão de todas as plantas...');
      
      // Deleta todas as plantas uma por uma
      let deletedPlants = 0;
      let deletedReminders = 0;
      let deletedLogs = 0;
      
      for (const plant of plants) {
        try {
          console.log(`🗑️ Deletando planta: ${plant.name}`);
          
          // Primeiro deleta os care logs relacionados à planta
          const plantCareLogs = careLogs.filter(log => log.plantId === plant.id);
          for (const log of plantCareLogs) {
            try {
              await deleteCareLog(log.id);
              deletedLogs++;
              console.log(`📝 Care log deletado para planta ${plant.name}`);
            } catch (error) {
              console.error(`Erro ao deletar care log:`, error);
            }
          }
          
          // Depois deleta os reminders relacionados à planta
          const plantReminders = careReminders.filter(reminder => reminder.plantId === plant.id);
          for (const reminder of plantReminders) {
            try {
              await deleteCareReminder(reminder.id);
              deletedReminders++;
              console.log(`⏰ Reminder deletado para planta ${plant.name}`);
            } catch (error) {
              console.error(`Erro ao deletar reminder:`, error);
            }
          }
          
          // Finalmente deleta a planta
          await deletePlant(plant.id);
          deletedPlants++;
          console.log(`✅ Planta ${plant.name} deletada com sucesso`);
          
        } catch (error) {
          console.error(`❌ Erro ao deletar planta ${plant.name}:`, error);
        }
      }
      
      // Recarrega os dados
      await Promise.all([
        loadPlants(),
        loadCareReminders(),
        loadCareLogs()
      ]);
      
      console.log(`🎉 Exclusão concluída: ${deletedPlants} plantas, ${deletedReminders} lembretes e ${deletedLogs} logs removidos`);
      
      Alert.alert(
        'Sucesso', 
        `Todas as plantas e dados relacionados foram removidos!\n\n` +
        `• ${deletedPlants} plantas\n` +
        `• ${deletedReminders} lembretes\n` +
        `• ${deletedLogs} registros de cuidados`
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível remover todas as plantas.');
      console.error('Error deleting all plants:', error);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Deleta todos os dados do usuário (plantas, logs, reminders, locais vazios e espécies personalizadas)
   */
  const deleteAllData = async () => {
    try {
      setActionLoading(true);
      
      console.log('🔥 Iniciando limpeza completa de dados...');
      
      // 1. Primeiro deleta todas as plantas e dados relacionados
      await deleteAllPlants();
      
      // 2. Limpa locais vazios (que não têm plantas)
      console.log('📍 Limpando locais vazios...');
      await clearEmptyLocations();
      
      // 3. Limpa espécies personalizadas (mantém apenas as pré-definidas do backend)
      console.log('🌱 Limpando espécies personalizadas...');
      await clearCustomSpecies();
      
      // 4. Recarrega todos os dados para atualizar a interface
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

  /**
   * Executa a ação de limpeza confirmada pelo usuário.
   */
  const confirmAction = async () => {
    try {
      if (actionType === 'plants') {
        await deleteAllPlants();
      } else if (actionType === 'all') {
        await deleteAllData();
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro durante a operação.');
    } finally {
      hideModal();
    }
  };

  /**
   * Obtém o título e mensagem do modal.
   */
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
      <Header title="Configurações" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Informações do App */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              Sobre o App
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              🌿 App Plantas - Gerencie suas plantas de forma fácil e organizada.
            </Text>
            <Text variant="bodySmall" style={styles.versionText}>
              Versão 1.0.0
            </Text>
          </Card.Content>
        </Card>

        {/* Estatísticas */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              Estatísticas
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              📊 Plantas cadastradas: {plants.length}
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              ⏰ Lembretes ativos: {careReminders.length}
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              📝 Registros de cuidados: {careLogs.length}
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              🌱 Espécies: {species.length}
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              📍 Locais: {locations.length}
            </Text>
          </Card.Content>
        </Card>

        {/* Limpeza de Dados */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              Gerenciar Dados
            </Text>
            <Text variant="bodyMedium" style={styles.warningText}>
              ⚠️ Ações irreversíveis
            </Text>
            
            <CustomButton
              onPress={() => showModal('plants')}
              label={`Remover Todas as Plantas (${plants.length})`}
              mode="outlined"
              style={styles.button}
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
              disabled={actionLoading}
            />
            <Text variant="bodySmall" style={styles.noteText}>
              Remove tudo, incluindo espécies e locais padrão
            </Text>
          </Card.Content>
        </Card>

        {/* Dicas */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              Dicas
            </Text>
            <Text variant="bodyMedium" style={styles.tipText}>
              💡 Adicione fotos das suas plantas para um registro visual
            </Text>
            <Text variant="bodyMedium" style={styles.tipText}>
              ⏰ Configure lembretes para não esquecer dos cuidados
            </Text>
            <Text variant="bodyMedium" style={styles.tipText}>
              📍 Organize suas plantas por locais específicos
            </Text>
            <Text variant="bodyMedium" style={styles.tipText}>
              📝 Registre os cuidados para acompanhar a saúde das plantas
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Modal de Confirmação */}
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
          
          <Text variant="headlineSmall" style={styles.modalTitle}>
            {getModalTitle()}
          </Text>
          <Text variant="bodyMedium" style={styles.modalMessage}>
            {getModalMessage()}
          </Text>
          <View style={styles.modalButtons}>
            <CustomButton
              onPress={hideModal}
              label="Cancelar"
              mode="outlined"
              style={styles.modalButton}
              disabled={actionLoading}
            />
            <CustomButton
              onPress={confirmAction}
              label="Confirmar"
              mode="contained"
              style={styles.modalButton}
              buttonColor={theme.colors.error}
              disabled={actionLoading}
            />
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontFamily: theme.fonts.titleMedium.fontFamily,
    color: theme.colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontFamily: theme.fonts.bodyMedium.fontFamily,
    color: theme.colors.onSurfaceVariant,
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
    backgroundColor: theme.colors.surface,
    padding: 20,
    margin: 20,
    borderRadius: 12,
    position: 'relative',
  },
  modalTitle: {
    fontFamily: theme.fonts.titleMedium.fontFamily,
    color: theme.colors.text,
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    zIndex: 1,
  },
});