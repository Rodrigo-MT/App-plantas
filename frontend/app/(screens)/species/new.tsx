import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Card, HelperText } from 'react-native-paper';
import { z } from 'zod';
import CustomButton from '../../../components/CustomButton';
import FormField from '../../../components/FormField';
import Header from '../../../components/Header';
import ImagePicker from '../../../components/ImagePicker';
import theme from '../../../constants/theme';
import { useSpecies } from '../../../hooks/useSpecies';

/**
 * Schema de validação para novas espécies.
 */
const speciesSchema = z.object({
  name: z.string().min(1, 'Nome científico é obrigatório'),
  commonName: z.string().optional(),
  description: z.string().optional(),
  careInstructions: z.string().optional(),
  idealConditions: z.string().optional(),
  photo: z.string().optional(),
});

/**
 * Tela para criar uma nova espécie.
 */
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
      // TODO: Exibir feedback visual (ex.: SnackBar)
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Adicione uma nova espécie" showBack={true} />
      <Card style={styles.card}>
        <Card.Content>
          <FormField control={control} name="name" label="Nome Científico" />
          <HelperText type="error" visible={!!errors.name}>
            {errors.name?.message ?? ''}
          </HelperText>
          <FormField control={control} name="commonName" label="Nome Comum" />
          <HelperText type="error" visible={!!errors.commonName}>
            {errors.commonName?.message ?? ''}
          </HelperText>
          <FormField control={control} name="description" label="Descrição" multiline numberOfLines={3} />
          <HelperText type="error" visible={!!errors.description}>
            {errors.description?.message ?? ''}
          </HelperText>
          <FormField control={control} name="careInstructions" label="Instruções de Cuidado" multiline numberOfLines={3} />
          <HelperText type="error" visible={!!errors.careInstructions}>
            {errors.careInstructions?.message ?? ''}
          </HelperText>
          <FormField control={control} name="idealConditions" label="Condições Ideais" multiline numberOfLines={3} />
          <HelperText type="error" visible={!!errors.idealConditions}>
            {errors.idealConditions?.message ?? ''}
          </HelperText>
          <Text style={styles.optionalText}>Imagem (opcional)</Text>
          <ImagePicker control={control} name="photo" />
          <HelperText type="error" visible={!!errors.photo}>
            {errors.photo?.message ?? ''}
          </HelperText>
          <CustomButton
            onPress={handleSubmit(onSubmit)}
            label="Salvar"
            mode="contained"
            style={styles.button}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionalText: {
    fontSize: 12,
    color: theme.colors.text, // Substituído por text, pode usar placeholder se adicionado ao theme.ts
    marginBottom: 8,
    fontFamily: theme.fonts.default.fontFamily,
  },
  button: {
    marginTop: 16,
  },
});