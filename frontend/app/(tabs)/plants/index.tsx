import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import Header from '../../../components/Header';
import PlantCard from '../../../components/PlantCard';
import { usePlants } from '../../../hooks/usePlants';

export default function PlantsScreen() {
  const { plants } = usePlants();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Header title="Minhas Plantas" />
      <Button mode="contained" onPress={() => router.push('/plants/new')} style={styles.addButton}>
        Adicionar Planta
      </Button>
      <FlatList
        data={plants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PlantCard plant={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  addButton: {
    marginBottom: 16,
  },
});