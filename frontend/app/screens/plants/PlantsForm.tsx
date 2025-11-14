import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View, Platform } from 'react-native';
import { ActivityIndicator, Card, HelperText, Text } from 'react-native-paper';
import { z } from 'zod';

import CustomButton from '../../../src/components/CustomButton';
import DatePickerField from '../../../src/components/DatePickerField';
import FormField from '../../../src/components/FormField';
import Header from '../../../src/components/Header';
import ImagePicker from '../../../src/components/ImagePicker';
import PickerField from '../../../src/components/PickerField';
import ErrorModal from '../../../src/components/ErrorModal';
import { useTheme } from '../../../src/constants/theme';
import { useLocations } from '../../../src/hooks/useLocations';
import { usePlants } from '../../../src/hooks/usePlants';
import { useSpecies } from '../../../src/hooks/useSpecies';
import { Plant, CreatePlantData, UpdatePlantData } from '../../../src/types/plant';

/**
 * Schema de validação da planta - AGORA COM NAMES
 */
const plantSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  speciesName: z.string().min(1, 'Espécie é obrigatória'), // MUDOU: speciesId → speciesName
  locationName: z.string().min(1, 'Local é obrigatório'), // MUDOU: locationId → locationName
  purchaseDate: z.date(),
  notes: z.string().optional(),
  photo: z.string().nullable().optional(),
});

type PlantFormData = z.infer<typeof plantSchema>;

/**
 * Tela unificada de criação e edição de plantas.
 * - Se tiver `id` nos params → modo de edição
 * - Caso contrário → modo de criação
 */
export default function PlantForm() {
  const { id } = useLocalSearchParams();
  const isEditing = !!id;

  const { plants, createPlant, updatePlant, deletePlant, error, clearError } = usePlants();
  const { species } = useSpecies();
  const { locations } = useLocations();
  const router = useRouter();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const plant = plants.find((p: Plant) => p.id === id);

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
        ? { boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }
        : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }),
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

  const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<PlantFormData>({
    resolver: zodResolver(plantSchema),
    defaultValues: {
      name: '',
      speciesName: '', // MUDOU: speciesId → speciesName
      locationName: '', // MUDOU: locationId → locationName
      purchaseDate: new Date(),
      notes: '',
      photo: null,
    },
  });

  // Carrega dados para edição
  useEffect(() => {
    if (isEditing) {
      if (plant) {
        reset({
          name: plant.name || '',
          speciesName: plant.speciesName || '', // MUDOU: speciesId → speciesName
          locationName: plant.locationName || '', // MUDOU: locationId → locationName
          purchaseDate: plant.purchaseDate instanceof Date 
            ? plant.purchaseDate 
            : new Date(plant.purchaseDate),
          notes: plant.notes || '',
          photo: plant.photo || null,
        });
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [isEditing, plant, reset]);

  const onSubmit = async (data: PlantFormData) => {
    try {
      setSubmitting(true);
      
      // Prepara os dados para a API
      const plantData: CreatePlantData | UpdatePlantData = {
        name: data.name,
        speciesName: data.speciesName, // ENVIA O NOME DIRETAMENTE
        locationName: data.locationName, // ENVIA O NOME DIRETAMENTE
        purchaseDate: data.purchaseDate,
        notes: data.notes || undefined,
  // send explicit null when the user removed the image so backend will remove it
  photo: data.photo ?? null,
      };

      if (isEditing) {
        await updatePlant(id as string, plantData);
      } else {
        await createPlant(plantData as CreatePlantData);
      }

      router.back();
    } catch (error) {
      console.error('❌ Erro ao salvar planta:', error);
      // O hook já seta o error state
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    try {
      setSubmitting(true);
      await deletePlant(id as string);
      router.back();
    } catch (error) {
      console.error('❌ Erro ao deletar planta:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ CORREÇÃO: Options agora usam NOMES como valores
  const speciesOptions = useMemo(() => 
    species.map((s) => ({
      label: s.commonName ? `${s.name} (${s.commonName})` : s.name,
      value: s.name, // MUDOU: s.id → s.name
    })),
    [species]
  );

  const locationOptions = useMemo(() => 
    locations.map((l) => ({
      label: l.name,
      value: l.name, // MUDOU: l.id → l.name
    })),
    [locations]
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>
          {isEditing ? 'Carregando planta...' : 'Preparando formulário...'}
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Header title={isEditing ? 'Editar Planta' : 'Nova Planta'} showBack />
        
        <Card style={styles.card}>
          <Card.Content>
            {/* Nome da Planta */}
            <FormField 
              control={control} 
              name="name" 
              label="Nome da Planta *" 
            />
            <HelperText type="error" visible={!!errors.name} style={styles.helperText}>
              {errors.name?.message ?? ''}
            </HelperText>

            {/* Espécie - AGORA COM NOMES */}
            <PickerField 
              control={control} 
              name="speciesName" // MUDOU: speciesId → speciesName
              label="Espécie *" 
              items={speciesOptions}
            />
            <HelperText type="error" visible={!!errors.speciesName} style={styles.helperText}>
              {errors.speciesName?.message ?? ''}
            </HelperText>

            {/* Local - AGORA COM NOMES */}
            <PickerField 
              control={control} 
              name="locationName" // MUDOU: locationId → locationName
              label="Local *" 
              items={locationOptions}
            />
            <HelperText type="error" visible={!!errors.locationName} style={styles.helperText}>
              {errors.locationName?.message ?? ''}
            </HelperText>

            {/* Data de Compra */}
            <DatePickerField 
              control={control} 
              name="purchaseDate" 
              label="Data de Compra/Plantio *" 
            />
            <HelperText type="error" visible={!!errors.purchaseDate} style={styles.helperText}>
              {errors.purchaseDate?.message ?? ''}
            </HelperText>

            {/* Observações */}
            <FormField 
              control={control} 
              name="notes" 
              label="Observações" 
              multiline 
              numberOfLines={3}
            />
            <HelperText type="error" visible={!!errors.notes} style={styles.helperText}>
              {errors.notes?.message ?? ''}
            </HelperText>

            {/* Imagem */}
            <Text style={styles.optionalText}>Imagem (opcional)</Text>
            <ImagePicker control={control} name="photo" />
            <HelperText type="error" visible={!!errors.photo} style={styles.helperText}>
              {errors.photo?.message ?? ''}
            </HelperText>

            {/* Botão Salvar/Criar */}
            <CustomButton
              onPress={handleSubmit(onSubmit)}
              label={isEditing ? 'Salvar Alterações' : 'Criar Planta'}
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
                label="Excluir Planta"
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