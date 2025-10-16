import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View, Platform } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import CustomButton from '../../../components/CustomButton';
import Header from '../../../components/Header';
import PlantCard from '../../../components/PlantCard';
import { useTheme } from '../../../constants/theme';
import { usePlants } from '../../../hooks/usePlants';
import { Plant } from '../../../types/plant';

/**
 * Tela para exibir a lista de plantas, com opção de adicionar uma nova planta.
 */
export default function PlantsScreen() {
  const { plants, loadPlants } = usePlants();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useFocusEffect(
    useCallback(() => {
      const fetchPlants = async () => {
        try {
          setLoading(true);
          await loadPlants();
        } catch (error) {
          console.error('Error loading plants:', error);
          // TODO: Exibir feedback visual (ex.: SnackBar)
        } finally {
          setLoading(false);
        }
      };
      fetchPlants();
    }, [loadPlants])
  );

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background, // #F5F5F5 (light) ou #202225 (dark)
      padding: 16,
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
      <Header title="Minhas Plantas" />
      <View style={styles.buttonContainer}>
        <CustomButton
          onPress={() => router.push('/plants/new')}
          label="Adicionar Planta"
          mode="contained"
          style={styles.button}
          buttonColor={theme.colors.primary} // #32c273 (light) ou #7289DA (dark)
          textColor={theme.colors.onPrimary} // Branco para contraste
        />
      </View>
      {plants.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emptyText}>Nenhuma planta cadastrada.</Text>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={plants}
          keyExtractor={(item: Plant) => item.id}
          renderItem={({ item }: { item: Plant }) => <PlantCard plant={item} />}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}