import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState, useMemo } from 'react';
import { Animated, Dimensions, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useTheme } from '../constants/theme';
import { useSpecies } from '../hooks/useSpecies';
import { useLocations } from '../hooks/useLocations';
import { Plant } from '../types/plant';

interface PlantCardProps {
  plant: Plant;
}

const { width: screenWidth } = Dimensions.get('window');

export default function PlantCard({ plant }: PlantCardProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const { species } = useSpecies();
  const { locations } = useLocations();
  const [scale] = useState(new Animated.Value(1));
  
  // CORREÇÃO LOCAL: Busca nome do local pelo ID
  const locationName = useMemo(() => {
    if (!plant.locationId || !locations.length) {
      // FALLBACK TEMPORÁRIO enquanto cria o hook
      return plant.locationId === '1' ? 'Sala' : 
             plant.locationId === '2' ? 'Jardim' : 
             plant.location?.name || 'Desconhecido';
    }
    
    const location = locations.find(loc => loc.id === plant.locationId);
    return location?.name || 'Desconhecido';
  }, [plant.locationId, locations, plant.location]);

  const speciesName = species.find((s) => s.id === plant.speciesId)?.name || 'Desconhecida';

  const getPurchaseDate = () => {
    try {
      const date = plant.purchaseDate instanceof Date ? plant.purchaseDate : new Date(plant.purchaseDate);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  // CORREÇÃO IMAGEM: SEM assets locais
  const getImageSource = useMemo(() => {
    // PRIORIDADE 1: Imagem base64 ou URL válida
    if (plant.photo && (
      plant.photo.startsWith('data:image') || 
      plant.photo.startsWith('http') || 
      plant.photo.startsWith('https')
    )) {
      return { uri: plant.photo };
    }
    
    // PRIORIDADE 2: Placeholder online (não quebra)
    console.warn('🖼️ Sem imagem válida, usando placeholder:', plant.photo);
    return { uri: 'https://via.placeholder.com/400x200/32c273/ffffff?text=%F0%9F%8C%B1+Planta' };
  }, [plant.photo]);

  useEffect(() => {
    console.log('🌱 PlantCard debug:', {
      id: plant.id,
      name: plant.name,
      locationId: plant.locationId,
      locationName,
      hasLocationData: !!locations.length,
      photoType: plant.photo?.startsWith('data:image') ? 'base64' : 
                 plant.photo?.startsWith('blob:') ? 'blob' : 
                 plant.photo?.startsWith('http') ? 'url' : 'none',
      photoPreview: plant.photo?.substring(0, 50) + '...'
    });
  }, [plant.id, plant.locationId, locationName, locations.length, plant.photo]);

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
      backgroundColor: theme.colors.surface,
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
      color: theme.colors.primary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      fontWeight: theme.fonts.bodyMedium.fontWeight,
      color: theme.colors.onSurfaceVariant,
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
            source={getImageSource}
            style={styles.image}
            contentFit="cover"
            placeholder="L3g4h~WBt7of~qj[j[ayofayj[ay"
            transition={1000}
            onError={(e) => {
              console.log('❌ Image error:', e);
              console.log('❌ Fallback para placeholder online');
            }}
            cachePolicy="memory-disk"
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
            <Text style={styles.subtitle} variant="bodyMedium" numberOfLines={1}>
              Observações: {plant.notes || 'N/A'}
            </Text>
          </Card.Content>
        </Card>
      </Animated.View>
    </TouchableOpacity>
  );
}