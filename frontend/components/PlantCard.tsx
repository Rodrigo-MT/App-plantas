import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Plant } from '../types/plant';

interface PlantCardProps {
  plant: Plant;
}

export default function PlantCard({ plant }: PlantCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push(`/plants/${plant.id}`)}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">{plant.name}</Text>
          <Text variant="bodyMedium">Espécie: {plant.speciesId}</Text>
          <Text variant="bodyMedium">Local: {plant.locationId}</Text>
          <Text variant="bodyMedium">
            Data de Compra: {plant.purchaseDate instanceof Date ? plant.purchaseDate.toLocaleDateString() : 'N/A'}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // Replaced shadow* props
  },
});