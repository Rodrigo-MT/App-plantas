// app/screens/species/SpeciesScreen.tsx
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View, Platform } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import CustomButton from '../../../src/components/CustomButton';
import Header from '../../../src/components/Header';
import ErrorModal from '../../../src/components/ErrorModal';
import { useTheme } from '../../../src/constants/theme';
import { useSpecies } from '../../../src/hooks/useSpecies';
import { handleApiError } from '../../../src/utils/handleApiError';
import { Species } from '../../../src/types/species';

/**
 * Tela de listagem de espécies, com suporte a tema dinâmico,
 * modal de erro e recarregamento ao focar a tela.
 */
export default function SpeciesScreen() {
  const { species, loadSpecies } = useSpecies();
  const router = useRouter();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      const fetchSpecies = async () => {
        try {
          setLoading(true);
          await loadSpecies();
        } catch (error) {
          const message = handleApiError(error, 'Erro ao carregar espécies');
          setErrorMessage(message);
          setErrorVisible(true);
        } finally {
          setLoading(false);
        }
      };
      fetchSpecies();
    }, [loadSpecies])
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          padding: 16,
          backgroundColor: theme.colors.background,
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
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          elevation: 4,
          ...(Platform.OS === 'web'
            ? {
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              }
            : {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }),
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
          color: theme.colors.text,
          fontFamily: theme.fonts.bodyMedium.fontFamily,
        },
        emptyText: {
          fontSize: 16,
          fontFamily: theme.fonts.bodyMedium.fontFamily,
          color: theme.colors.text,
          textAlign: 'center',
        },
      }),
    [theme]
  );

  if (loading) {
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
      <View style={styles.buttonContainer}>
        <CustomButton
          onPress={() => router.push('/screens/species/SpeciesForm')}
          label="Adicionar Espécie"
          mode="contained"
          style={styles.button}
          buttonColor={theme.colors.primary}
          textColor={theme.colors.onPrimary}
        />
      </View>
      {species.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emptyText}>Nenhuma espécie cadastrada.</Text>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={species}
          keyExtractor={(item: Species) => item.id}
          renderItem={({ item }: { item: Species }) => (
            <Card
              style={styles.card}
              onPress={() => router.push(`/screens/species/SpeciesForm?id=${item.id}`)}
            >
              <Card.Content>
                <Text style={styles.title}>
                  {item.name || 'Espécie sem nome'}
                </Text>
                <Text style={styles.subtitle}>
                  Nome Comum: {item.commonName || 'Sem nome comum'}
                </Text>
                <Text style={styles.subtitle}>
                  Descrição: {item.description || 'N/A'}
                </Text>
              </Card.Content>
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
