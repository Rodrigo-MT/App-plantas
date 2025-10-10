import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import Header from '../../../components/Header';
import { useSpecies } from '../../../hooks/useSpecies';

export default function SpeciesScreen() {
  const { species } = useSpecies();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Header title="Espécies" />
      <Button mode="contained" onPress={() => router.push('/species/new')} style={styles.addButton}>
        Adicionar Espécie
      </Button>
      <FlatList
        data={species}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/species/${item.id}`)}>
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleLarge">{item.name}</Text>
                <Text variant="bodyMedium">Nome Comum: {item.commonName || 'Sem nome comum'}</Text>
                <Text variant="bodyMedium">Descrição: {item.description || 'N/A'}</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
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
  card: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    elevation: 2,
  },
});