import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import CustomButton from '../../../components/CustomButton';
import Header from '../../../components/Header';
import theme from '../../../constants/theme';
import { useSpecies } from '../../../hooks/useSpecies';
import { Species } from '../../../types/species';

/**
 * Tela para exibir a lista de espécies, com opção de adicionar uma nova espécie.
 */
export default function SpeciesScreen() {
  const { species, loadSpecies } = useSpecies();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Carrega espécies quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      const fetchSpecies = async () => {
        try {
          setLoading(true);
          await loadSpecies();
        } catch (error) {
          console.error('Error loading species:', error);
          // TODO: Exibir feedback visual (ex.: SnackBar)
        } finally {
          setLoading(false);
        }
      };
      fetchSpecies();
    }, [loadSpecies])
  );

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
      <Header title="Espécies" />
      <View style={styles.buttonContainer}>
        <CustomButton
          onPress={() => router.push('/species/new')}
          label="Adicionar Espécie"
          mode="contained"
          style={styles.button}
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
              onPress={() => router.push(`/species/${item.id}`)}
            >
              <Card.Content>
                <Text style={styles.title} variant="headlineSmall">
                  {item.name}
                </Text>
                <Text style={styles.subtitle} variant="bodyMedium">
                  Nome Comum: {item.commonName || 'Sem nome comum'}
                </Text>
                <Text style={styles.subtitle} variant="bodyMedium">
                  Descrição: {item.description || 'N/A'}
                </Text>
              </Card.Content>
            </Card>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: theme.colors.surface, // ✅ CORRIGIDO: usar surface para cards
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: theme.fonts.titleMedium.fontFamily, // ✅ CORRIGIDO: usar titleMedium
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.bodyMedium.fontFamily, // ✅ CORRIGIDO: usar bodyMedium
    color: theme.colors.onSurfaceVariant, // ✅ CORRIGIDO: usar onSurfaceVariant para texto secundário
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
    fontFamily: theme.fonts.bodyMedium.fontFamily, // ✅ CORRIGIDO: usar bodyMedium
  },
  emptyText: {
    fontSize: 16,
    fontFamily: theme.fonts.bodyMedium.fontFamily, // ✅ CORRIGIDO: usar bodyMedium
    color: theme.colors.text,
    textAlign: 'center',
  },
});