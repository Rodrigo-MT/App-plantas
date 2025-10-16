import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View, Platform } from 'react-native';
import { Card, HelperText, Text } from 'react-native-paper';
import { z } from 'zod';
import CustomButton from '../../../components/CustomButton';
import FormField from '../../../components/FormField';
import Header from '../../../components/Header';
import ImagePicker from '../../../components/ImagePicker';
import { useTheme } from '../../../constants/theme';
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
  const { theme } = useTheme();
  const speciesData = species.find((s: Species) => s.id === id);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 16,
      backgroundColor: theme.colors.background, // #F5F5F5 (light) ou #202225 (dark)
    },
    card: {
      backgroundColor: theme.colors.surface, // #FFFFFF (light) ou #292B2F (dark)
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
    optionalText: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant, // #666666 (light) ou #DBDBDB (dark)
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
  }), [theme]);

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
              buttonColor={theme.colors.primary} // #32c273 (light) ou #7289DA (dark)
              textColor={theme.colors.onPrimary} // Branco para contraste
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
          <HelperText type="error" visible={!!errors.name}>{errors.name?.message ?? ''}</HelperText>
          <FormField control={control} name="commonName" label="Nome Comum" />
          <HelperText type="error" visible={!!errors.commonName}>{errors.commonName?.message ?? ''}</HelperText>
          <FormField control={control} name="description" label="Descrição" multiline numberOfLines={3} />
          <HelperText type="error" visible={!!errors.description}>{errors.description?.message ?? ''}</HelperText>
          <FormField control={control} name="careInstructions" label="Instruções de Cuidado" multiline numberOfLines={3} />
          <HelperText type="error" visible={!!errors.careInstructions}>{errors.careInstructions?.message ?? ''}</HelperText>
          <FormField control={control} name="idealConditions" label="Condições Ideais" multiline numberOfLines={3} />
          <HelperText type="error" visible={!!errors.idealConditions}>{errors.idealConditions?.message ?? ''}</HelperText>
          <Text style={styles.optionalText}>Imagem (opcional)</Text>
          <ImagePicker control={control} name="photo" />
          <HelperText type="error" visible={!!errors.photo}>{errors.photo?.message ?? ''}</HelperText>
          <CustomButton
            onPress={handleSubmit(onSubmit)}
            label="Salvar"
            mode="contained"
            style={styles.button}
            buttonColor={theme.colors.primary} // #32c273 (light) ou #7289DA (dark)
            textColor={theme.colors.onPrimary} // Branco para contraste
          />
          <CustomButton
            onPress={onDelete}
            label="Excluir"
            mode="outlined"
            style={styles.button}
            buttonColor={theme.colors.error}
            textColor={theme.colors.error}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
}