import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, HelperText, Text } from 'react-native-paper';
import { z } from 'zod';
import CustomButton from '../../../components/CustomButton';
import FormField from '../../../components/FormField';
import Header from '../../../components/Header';
import ImagePicker from '../../../components/ImagePicker';
import theme from '../../../constants/theme';
import { useSpecies } from '../../../hooks/useSpecies';
import { Species } from '../../../types/species';

/**
 * Schema de validação para espécies.
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
 * Tela para editar ou excluir uma espécie existente.
 */
export default function SpeciesDetailScreen() {
  const { id } = useLocalSearchParams();
  const { species, updateSpecies, deleteSpecies } = useSpecies();
  const router = useRouter();
  const speciesData = species.find((s: Species) => s.id === id);

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
      // TODO: Exibir feedback visual (ex.: SnackBar)
    }
  };

  const onDelete = async () => {
    try {
      await deleteSpecies(id as string);
      router.back();
    } catch (error) {
      console.error('Error deleting species:', error);
      // TODO: Exibir feedback visual
    }
  };

  if (!speciesData) {
    return (
      <View style={styles.errorContainer}>
        <Header title="Espécie não encontrada" showBack={true} />
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.errorText}>Espécie não encontrada ou foi removida.</Text>
            <CustomButton
              onPress={() => router.back()}
              label="Voltar"
              mode="contained"
              style={styles.button}
            />
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Editar Espécie" showBack={true} />
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
          <CustomButton
            onPress={onDelete}
            label="Excluir"
            mode="outlined"
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
  errorContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: theme.fonts.default.fontFamily,
  },
});