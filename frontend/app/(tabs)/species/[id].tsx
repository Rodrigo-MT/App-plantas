import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Card, HelperText, Text } from 'react-native-paper';
import { z } from 'zod';
import FormField from '../../../components/FormField';
import Header from '../../../components/Header';
import ImagePicker from '../../../components/ImagePicker';
import { useSpecies } from '../../../hooks/useSpecies';

const speciesSchema = z.object({
  name: z.string().min(1, 'Nome científico é obrigatório'),
  commonName: z.string().optional(),
  description: z.string().optional(),
  careInstructions: z.string().optional(),
  idealConditions: z.string().optional(),
  photo: z.string().optional(),
});

export default function SpeciesDetailScreen() {
  const { id } = useLocalSearchParams();
  const { species, updateSpecies, deleteSpecies } = useSpecies();
  const router = useRouter();
  const speciesData = species.find((s) => s.id === id);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(speciesSchema),
    defaultValues: speciesData || {
      name: '',
      commonName: '',
      description: '',
      careInstructions: '',
      idealConditions: '',
      photo: '',
    },
  });

  useEffect(() => {
    if (speciesData) reset(speciesData);
  }, [speciesData, reset]);

  const onSubmit = async (data: any) => {
    try {
      await updateSpecies({ ...data, id });
      router.back();
    } catch (error) {
      console.error('Error updating species:', error);
    }
  };

  const onDelete = async () => {
    try {
      await deleteSpecies(id as string);
      router.back();
    } catch (error) {
      console.error('Error deleting species:', error);
    }
  };

  if (!speciesData) return <Text style={{ fontSize: 16, padding: 16 }}>Espécie não encontrada</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Editar Espécie" showBack={true} />
      <Card style={styles.card}>
        <Card.Content>
          <FormField control={control} name="name" label="Nome Científico" />
          <HelperText type="error" visible={!!errors.name}>
            {errors.name?.message as string}
          </HelperText>

          <FormField control={control} name="commonName" label="Nome Comum" />
          <HelperText type="error" visible={!!errors.commonName}>
            {errors.commonName?.message as string}
          </HelperText>

          <FormField control={control} name="description" label="Descrição" />
          <HelperText type="error" visible={!!errors.description}>
            {errors.description?.message as string}
          </HelperText>

          <FormField control={control} name="careInstructions" label="Instruções de Cuidado" />
          <HelperText type="error" visible={!!errors.careInstructions}>
            {errors.careInstructions?.message as string}
          </HelperText>

          <FormField control={control} name="idealConditions" label="Condições Ideais" />
          <HelperText type="error" visible={!!errors.idealConditions}>
            {errors.idealConditions?.message as string}
          </HelperText>

          <Text style={styles.optionalText}>Imagem (opcional)</Text>
          <ImagePicker control={control} name="photo" />
          <HelperText type="error" visible={!!errors.photo}>
            {errors.photo?.message as string}
          </HelperText>

          <Button mode="contained" onPress={handleSubmit(onSubmit)} style={styles.button}>
            Salvar
          </Button>
          <Button mode="outlined" onPress={onDelete} style={styles.button}>
            Excluir
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    elevation: 4,
  },
  optionalText: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
  },
});