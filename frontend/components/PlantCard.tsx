import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text } from 'react-native-paper';
import theme from '../constants/theme';
import { useSpecies } from '../hooks/useSpecies';
import { Plant } from '../types/plant';

/**
 * Componente de cartão para exibir informações de uma planta com animação de escala.
 * @param plant Dados da planta.
 */
interface PlantCardProps {
  plant: Plant;
}

const { width: screenWidth } = Dimensions.get('window');

export default function PlantCard({ plant }: PlantCardProps) {
  const router = useRouter();
  const { species } = useSpecies();
  const [scale] = useState(new Animated.Value(1));

  const speciesName = species.find((s) => s.id === plant.speciesId)?.name || 'Desconhecida';
  const locationName = plant.locationId === '1' ? 'Sala' : plant.locationId === '2' ? 'Jardim' : 'Desconhecido';
  
  // Função segura para formatar data
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
      useNativeDriver: true,
    }).start();
  };

  const animatePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const cardWidth = screenWidth - 32; // Account for 16px padding on each side

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
              {plant.name}
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

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  cardContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  title: {
    fontSize: 18,
    // ✅ CORREÇÃO: Usar titleMedium que existe
    fontFamily: theme.fonts.titleMedium.fontFamily,
    fontWeight: theme.fonts.titleMedium.fontWeight,
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    // ✅ CORREÇÃO: Usar bodyMedium que existe
    fontFamily: theme.fonts.bodyMedium.fontFamily,
    fontWeight: theme.fonts.bodyMedium.fontWeight,
    color: theme.colors.accent, // Mantido 'accent' pois existe no tema
    marginBottom: 4,
  },
});