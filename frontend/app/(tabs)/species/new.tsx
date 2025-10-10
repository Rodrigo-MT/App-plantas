import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
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

export default function NewSpeciesScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(speciesSchema),
    defaultValues: {
      name: '',
      commonName: '',
      description: '',
      careInstructions: '',
      idealConditions: '',
      photo: '',
    },
  });
  const { createSpecies } = useSpecies();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      await createSpecies(data);
      router.back();
    } catch (error) {
      console.error('Error creating species:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Adicione uma nova espécie" showBack={true} />
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
    marginTop: 24,
  },
});