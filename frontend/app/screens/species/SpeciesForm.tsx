import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View, Platform } from 'react-native';
import { Card, HelperText, Text } from 'react-native-paper';
import { z } from 'zod';

import CustomButton from '../../../src/components/CustomButton';
import FormField from '../../../src/components/FormField';
import Header from '../../../src/components/Header';
import ImagePicker from '../../../src/components/ImagePicker';
import ErrorModal from '../../../src/components/ErrorModal';
import { useTheme } from '../../../src/constants/theme';
import { useSpecies } from '../../../src/hooks/useSpecies';
import { Species } from '../../../src/types/species';
import { handleApiError } from '../../../src/utils/handleApiError';

/**
 * Schema de validação das espécies
 */
const speciesSchema = z.object({
  name: z.string().min(1, 'Nome científico é obrigatório'),
  commonName: z.string().optional(),
  description: z.string().optional(),
  careInstructions: z.string().optional(),
  idealConditions: z.string().optional(),
  photo: z.string().nullable().transform((v) => v ?? '').optional(),
});

export default function SpeciesForm() {
  const { id } = useLocalSearchParams();
  const isEditing = !!id;
  const router = useRouter();
  const { theme } = useTheme();

  const { species, createSpecies, updateSpecies, deleteSpecies } = useSpecies();
  const speciesData = isEditing ? species.find((s: Species) => s.id === id) : null;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      elevation: 4,
      ...(Platform.OS === 'web'
        ? { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }
        : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }),
    },
    optionalText: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 8,
      fontFamily: theme.fonts.default.fontFamily,
    },
    button: {
      marginTop: 16,
    },
    errorContainer: {
      flex: 1,
      padding: 16,
      justifyContent: 'center',
      alignItems: 'center',
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

const onSubmit = async (data: any) => {
  try {
    // 🔹 Remove o campo 'photo' se o usuário não escolheu imagem
if (!data.photo || data.photo.trim() === '') {
  data.photo = null; // envia explicitamente
}


    if (isEditing) {
      await updateSpecies({ ...data, id });
    } else {
      await createSpecies(data);
    }

    router.back();
  } catch (error) {
    setErrorMessage(handleApiError(error));
  }
};


  const onDelete = async () => {
    try {
      await deleteSpecies(id as string);
      router.back();
    } catch (error) {
      setErrorMessage(handleApiError(error));
    }
  };

  // Caso o ID seja inválido
  if (isEditing && !speciesData) {
    return (
      <View style={styles.errorContainer}>
        <Header title="Espécie não encontrada" showBack={true} />
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.errorText}>
              Espécie não encontrada ou foi removida.
            </Text>
            <CustomButton
              onPress={() => router.back()}
              label="Voltar"
              mode="contained"
              style={styles.button}
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
            />
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Header title={isEditing ? 'Editar Espécie' : 'Nova Espécie'} showBack={true} />
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
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
            />

            {isEditing && (
              <CustomButton
                onPress={onDelete}
                label="Excluir"
                mode="outlined"
                style={styles.button}
                buttonColor={theme.colors.error}
                textColor={theme.colors.error}
              />
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <ErrorModal
        visible={!!errorMessage}
        message={errorMessage || ''}
        onDismiss={() => setErrorMessage(null)}
      />
    </>
  );
}
