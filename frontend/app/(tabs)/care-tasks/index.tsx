import { StyleSheet, Text, View } from 'react-native';
import Header from '../../../components/Header';

export default function CareTasksScreen() {
  return (
    <View style={styles.container}>
      <Header title="Tarefas" />
      <Text style={styles.text}>Em desenvolvimento...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});