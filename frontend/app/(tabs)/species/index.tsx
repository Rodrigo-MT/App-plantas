import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View, Platform } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import CustomButton from '../../../components/CustomButton';
import Header from '../../../components/Header';
import { useTheme } from '../../../constants/theme';
import { useSpecies } from '../../../hooks/useSpecies';
import { Species } from '../../../types/species';

/**
 * Tela para exibir a lista de espécies, com opção de adicionar uma nova espécie.
 */
export default function SpeciesScreen() {
  const { species, loadSpecies } = useSpecies();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

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

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.colors.background, // #F5F5F5 (light) ou #202225 (dark)
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
      backgroundColor: theme.colors.surface, // #FFFFFF (light) ou #292B2F (dark)
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
    title: {
      fontSize: 18,
      fontFamily: theme.fonts.titleMedium.fontFamily,
      color: theme.colors.primary, // #32c273 (light) ou #7289DA (dark)
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.onSurfaceVariant, // #666666 (light) ou #DBDBDB (dark)
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
      color: theme.colors.text, // #333333 (light) ou #FFFFFF (dark)
      fontFamily: theme.fonts.bodyMedium.fontFamily,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.text,
      textAlign: 'center',
    },
  }), [theme]);

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
          buttonColor={theme.colors.primary} // #32c273 (light) ou #7289DA (dark)
          textColor={theme.colors.onPrimary} // Branco para contraste
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
            <Card style={styles.card} onPress={() => router.push(`/species/${item.id}`)}>
              <Card.Content>
                <Text style={styles.title} variant="headlineSmall">
                  {item.name || 'Espécie sem nome'}
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