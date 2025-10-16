import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState, useMemo } from 'react';
import { Animated, Dimensions, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useTheme } from '../constants/theme';
import { useSpecies } from '../hooks/useSpecies';
import { Plant } from '../types/plant';

interface PlantCardProps {
  plant: Plant;
}

const { width: screenWidth } = Dimensions.get('window');

export default function PlantCard({ plant }: PlantCardProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const { species } = useSpecies();
  const [scale] = useState(new Animated.Value(1));
  const speciesName = species.find((s) => s.id === plant.speciesId)?.name || 'Desconhecida';
  const locationName = plant.locationId === '1' ? 'Sala' : plant.locationId === '2' ? 'Jardim' : 'Desconhecido';

  const getPurchaseDate = () => {
    try {
      const date = plant.purchaseDate instanceof Date ? plant.purchaseDate : new Date(plant.purchaseDate);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  useEffect(() => {
    console.log('Plant photo URL:', plant.photo); // Debug photo URL
  }, [plant.photo]);

  const animatePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const animatePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const cardWidth = screenWidth - 32;

  const styles = useMemo(() => StyleSheet.create({
    card: {
      marginBottom: 16,
    },
    cardContainer: {
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
    image: {
      width: '100%',
      height: 150,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    },
    title: {
      fontSize: 18,
      fontFamily: theme.fonts.titleMedium.fontFamily,
      fontWeight: theme.fonts.titleMedium.fontWeight,
      color: theme.colors.primary, // #32c273 (light) ou #7289DA (dark)
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      fontWeight: theme.fonts.bodyMedium.fontWeight,
      color: theme.colors.onSurfaceVariant, // #666666 (light) ou #DBDBDB (dark)
      marginBottom: 4,
    },
  }), [theme]);

  return (
    <TouchableOpacity
      onPressIn={animatePressIn}
      onPressOut={animatePressOut}
      onPress={() => router.push(`/(screens)/plants/${plant.id}`)}
      activeOpacity={0.9}
    >
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <Card style={[styles.cardContainer, { width: cardWidth }]}>
          <Image
            source={{ uri: plant.photo || 'https://placehold.co/400x200?text=Sem+Imagem' }}
            style={styles.image}
            contentFit="cover"
            placeholder="L3g4h~WBt7of~qj[j[ayofayj[ay"
            onError={(e) => console.log('Image error:', e)}
          />
          <Card.Content>
            <Text style={styles.title} variant="titleMedium">
              {plant.name || 'Planta sem nome'}
            </Text>
            <Text style={styles.subtitle} variant="bodyMedium">
              Espécie: {speciesName}
            </Text>
            <Text style={styles.subtitle} variant="bodyMedium">
              Local: {locationName}
            </Text>
            <Text style={styles.subtitle} variant="bodyMedium">
              Data de Compra: {getPurchaseDate()}
            </Text>
            <Text style={styles.subtitle} variant="bodyMedium">
              Observações: {plant.notes || 'N/A'}
            </Text>
          </Card.Content>
        </Card>
      </Animated.View>
    </TouchableOpacity>
  );
}