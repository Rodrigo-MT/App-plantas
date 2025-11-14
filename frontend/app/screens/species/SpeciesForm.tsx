import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View, Platform } from 'react-native';
import { ActivityIndicator, Card, HelperText, Text } from 'react-native-paper';
import { z } from 'zod';

import CustomButton from '../../../src/components/CustomButton';
import FormField from '../../../src/components/FormField';
import Header from '../../../src/components/Header';
import ImagePicker from '../../../src/components/ImagePicker';
import ErrorModal from '../../../src/components/ErrorModal';
import { useTheme } from '../../../src/constants/theme';
import { useSpecies } from '../../../src/hooks/useSpecies';
import { CreateSpeciesData, UpdateSpeciesData } from '../../../src/types/species';

/**
 * Schema de validação das espécies
 */
const speciesSchema = z.object({
  name: z.string().min(1, 'Nome científico é obrigatório'),
  commonName: z.string().optional(),
  description: z.string().optional(),
  careInstructions: z.string().optional(),
  idealConditions: z.string().optional(),
  photo: z.string().nullable().optional(),
});

type SpeciesFormData = z.infer<typeof speciesSchema>;

export default function SpeciesForm() {
  const { id } = useLocalSearchParams();
  const isEditing = !!id;
  const router = useRouter();
  const { theme } = useTheme();

  const { 
    createSpecies, 
    updateSpecies, 
    deleteSpecies, 
    error, 
    clearError,
    findSpeciesById 
  } = useSpecies();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const speciesData = isEditing ? findSpeciesById(id as string) : null;

  const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<SpeciesFormData>({
    resolver: zodResolver(speciesSchema),
    defaultValues: {
      name: '',
      commonName: '',
      description: '',
      careInstructions: '',
      idealConditions: '',
      photo: null,
    },
  });

  // Carrega dados para edição
  useEffect(() => {
    if (isEditing) {
      if (speciesData) {
        reset({
          name: speciesData.name || '',
          commonName: speciesData.commonName || '',
          description: speciesData.description || '',
          careInstructions: speciesData.careInstructions || '',
          idealConditions: speciesData.idealConditions || '',
          photo: speciesData.photo || null,
        });
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [isEditing, speciesData, reset]);

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
      margin: 16,
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
    deleteButton: {
      marginTop: 8,
      borderColor: theme.colors.error,
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      fontFamily: theme.fonts.default.fontFamily,
    },
    submittingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    helperText: {
      marginTop: -8,
      marginBottom: 12,
    }
  }), [theme]);

  const onSubmit = async (data: SpeciesFormData) => {
    try {
      setSubmitting(true);
      
      // Prepara os dados para a API
      const speciesData: CreateSpeciesData | UpdateSpeciesData = {
        name: data.name,
        commonName: data.commonName || undefined,
        description: data.description || undefined,
        careInstructions: data.careInstructions || undefined,
        idealConditions: data.idealConditions || undefined,
        // send explicit null when the user removed the image
        photo: data.photo ?? null,
      };

      if (isEditing) {
        await updateSpecies(id as string, speciesData);
      } else {
        await createSpecies(speciesData as CreateSpeciesData);
      }

      router.back();
    } catch (error) {
      console.error('❌ Erro ao salvar espécie:', error);
      // O hook já seta o error state
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    try {
      setSubmitting(true);
      await deleteSpecies(id as string);
      router.back();
    } catch (error) {
      console.error('❌ Erro ao deletar espécie:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading durante carregamento inicial
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>
          {isEditing ? 'Carregando espécie...' : 'Preparando formulário...'}
        </Text>
      </View>
    );
  }

  // Caso o ID seja inválido (apenas em edição)
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
            {/* Nome Científico */}
            <FormField 
              control={control} 
              name="name" 
              label="Nome Científico *" 
            />
            <HelperText type="error" visible={!!errors.name} style={styles.helperText}>
              {errors.name?.message ?? ''}
            </HelperText>

            {/* Nome Comum */}
            <FormField 
              control={control} 
              name="commonName" 
              label="Nome Comum" 
            />
            <HelperText type="error" visible={!!errors.commonName} style={styles.helperText}>
              {errors.commonName?.message ?? ''}
            </HelperText>

            {/* Descrição */}
            <FormField 
              control={control} 
              name="description" 
              label="Descrição" 
              multiline 
              numberOfLines={3}
            />
            <HelperText type="error" visible={!!errors.description} style={styles.helperText}>
              {errors.description?.message ?? ''}
            </HelperText>

            {/* Instruções de Cuidado */}
            <FormField 
              control={control} 
              name="careInstructions" 
              label="Instruções de Cuidado" 
              multiline 
              numberOfLines={3}
            />
            <HelperText type="error" visible={!!errors.careInstructions} style={styles.helperText}>
              {errors.careInstructions?.message ?? ''}
            </HelperText>

            {/* Condições Ideais */}
            <FormField 
              control={control} 
              name="idealConditions" 
              label="Condições Ideais" 
              multiline 
              numberOfLines={3}
            />
            <HelperText type="error" visible={!!errors.idealConditions} style={styles.helperText}>
              {errors.idealConditions?.message ?? ''}
            </HelperText>

            {/* Imagem */}
            <Text style={styles.optionalText}>Imagem (opcional)</Text>
            <ImagePicker control={control} name="photo" />
            <HelperText type="error" visible={!!errors.photo} style={styles.helperText}>
              {errors.photo?.message ?? ''}
            </HelperText>

            {/* Botão Salvar */}
            <CustomButton
              onPress={handleSubmit(onSubmit)}
              label={isEditing ? 'Salvar Alterações' : 'Criar Espécie'}
              mode="contained"
              style={styles.button}
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
              disabled={submitting || (isEditing && !isDirty)}
            />

            {/* Botão Excluir (apenas edição) */}
            {isEditing && (
              <CustomButton
                onPress={onDelete}
                label="Excluir Espécie"
                mode="outlined"
                style={[styles.button, styles.deleteButton]}
                buttonColor={theme.colors.surface}
                textColor={theme.colors.error}
                disabled={submitting}
              />
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Loading durante submit */}
      {submitting && (
        <View style={styles.submittingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onPrimary }]}>
            {isEditing ? 'Salvando...' : 'Criando...'}
          </Text>
        </View>
      )}

      {/* Modal de erro */}
      <ErrorModal visible={!!error} message={error || ''} onDismiss={clearError} />
    </>
  );
}