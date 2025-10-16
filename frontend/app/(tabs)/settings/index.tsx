// app/(tabs)/settings/index.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const { plants, loadPlants } = usePlants();
  const { loadCareReminders } = useCareReminders();
  const { loadCareLogs } = useCareLogs();
  const { loadLocations } = useLocations();
  const { species, loadSpecies } = useSpecies();

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
   * Filtra as espécies para manter apenas as pré-definidas
   */
  const getDefaultSpecies = () => {
    // Lista de espécies pré-definidas que devem ser mantidas
    const defaultSpecies = [
      {
        id: '1',
        name: 'Rosa',
        commonName: 'Rosa',
        description: 'Planta ornamental conhecida por suas flores perfumadas.',
        careInstructions: 'Regar regularmente, podar após a floração.',
        idealConditions: 'Sol pleno, solo bem drenado.',
        photo: ''
      },
      {
        id: '2', 
        name: 'Samambaia',
        commonName: 'Samambaia',
        description: 'Planta de interior popular, ideal para ambientes sombreados.',
        careInstructions: 'Manter solo úmido, evitar sol direto.',
        idealConditions: 'Sombra, alta umidade.',
        photo: ''
      },
      {
        id: '3',
        name: 'Suculenta',
        commonName: 'Suculenta',
        description: 'Plantas que armazenam água, fáceis de cuidar.',
        careInstructions: 'Pouca água, sol direto.',
        idealConditions: 'Sol pleno, solo seco.',
        photo: ''
      },
      {
        id: '4',
        name: 'Orquídea',
        commonName: 'Orquídea',
        description: 'Plantas exóticas com flores impressionantes.',
        careInstructions: 'Regar moderadamente, alta umidade.',
        idealConditions: 'Luz indireta, temperatura amena.',
        photo: ''
      },
      {
        id: '5',
        name: 'Lavanda',
        commonName: 'Lavanda',
        description: 'Planta aromática com flores roxas.',
        careInstructions: 'Sol pleno, solo bem drenado.',
        idealConditions: 'Clima seco, sol direto.',
        photo: ''
      }
    ];
    return defaultSpecies;
  };

  /**
   * Executa a ação de limpeza confirmada pelo usuário.
   */
  const confirmAction = async () => {
    try {
      if (actionType === 'plants') {
        // Remove APENAS plantas e dados relacionados
        await AsyncStorage.removeItem('@plants');
        // Remove care logs relacionados às plantas
        const careLogs = await AsyncStorage.getItem('@careLogs');
        if (careLogs) {
          await AsyncStorage.setItem('@careLogs', JSON.stringify([]));
        }
        // Remove care reminders relacionados às plantas
        const careReminders = await AsyncStorage.getItem('@careReminders');
        if (careReminders) {
          await AsyncStorage.setItem('@careReminders', JSON.stringify([]));
        }
        await loadPlants();
        await loadCareReminders();
        await loadCareLogs();
        Alert.alert('Sucesso', 'Todas as plantas e dados relacionados foram removidos!');
      } else if (actionType === 'all') {
        // Remove TODOS os dados do usuário, mantendo apenas espécies pré-definidas
        await AsyncStorage.removeItem('@plants');
        await AsyncStorage.removeItem('@careReminders');
        await AsyncStorage.removeItem('@careLogs');
        await AsyncStorage.removeItem('@locations');
        
        // ✅ CORREÇÃO: Mantém apenas as espécies pré-definidas
        const defaultSpecies = getDefaultSpecies();
        await AsyncStorage.setItem('@species', JSON.stringify(defaultSpecies));
        
        // Recarrega todos os dados
        await Promise.all([
          loadPlants(),
          loadCareReminders(), 
          loadCareLogs(),
          loadLocations(),
          loadSpecies()
        ]);
        
        Alert.alert('Sucesso', 'Todos os dados do usuário foram removidos! Apenas espécies padrão foram mantidas.');
      }
      hideModal();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível limpar os dados.');
      console.error('Error clearing data:', error);
    }
  };

  /**
   * Obtém o título e mensagem do modal.
   */
  const getModalTitle = (): string => {
    return actionType === 'plants' ? 'Limpar Todas as Plantas' : 'Limpar Todos os Dados';
  };

  const getModalMessage = (): string => {
    return actionType === 'plants' 
      ? 'Tem certeza que deseja remover todas as plantas, lembretes e histórico relacionados? Esta ação não pode ser desfeita.'
      : 'Tem certeza que deseja remover TODOS os dados do aplicativo (plantas, lembretes, histórico, locais e espécies personalizadas)? Apenas as espécies padrão serão mantidas. Esta ação não pode ser desfeita.';
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
              label="Remover Todas as Plantas"
              mode="outlined"
              style={styles.button}
              textColor={theme.colors.error}
            />
            <CustomButton
              onPress={() => showModal('all')}
              label="Limpar Todos os Dados"
              mode="contained"
              style={[styles.button, styles.dangerButton]}
              buttonColor={theme.colors.error}
            />
            <Text variant="bodySmall" style={styles.noteText}>
              * Apenas espécies padrão serão mantidas
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
            />
            <CustomButton
              onPress={confirmAction}
              label="Confirmar"
              mode="contained"
              style={styles.modalButton}
              buttonColor={theme.colors.error}
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
    marginBottom: 12,
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
});