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
import { handleApiError } from '../../../src/utils/handleApiError';
import { Plant } from '../../../src/types/plant';
import { Species } from '../../../src/types/species';
import { Location } from '../../../src/types/location';

/**
 * Schema de validação da planta
 */
const plantSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  speciesId: z.string().min(1, 'Espécie é obrigatória'),
  locationId: z.string().min(1, 'Local é obrigatório'),
  purchaseDate: z.date(),
  notes: z.string().optional(),
  photo: z.string().nullable().optional(),
});

/**
 * Tela unificada de criação e edição de plantas.
 * - Se tiver `id` nos params → modo de edição
 * - Caso contrário → modo de criação
 */
export default function PlantForm() {
  const { id } = useLocalSearchParams();
  const isEditing = !!id;

  const { plants, createPlant, updatePlant, deletePlant } = usePlants();
  const { species } = useSpecies();
  const { locations } = useLocations();
  const router = useRouter();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
  }), [theme]);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(plantSchema),
    defaultValues: {
      name: '',
      speciesId: '',
      locationId: '',
      purchaseDate: new Date(),
      notes: '',
      photo: '',
    },
  });

  // Carrega dados para edição
  useEffect(() => {
    if (isEditing && plant) {
      reset({
        ...plant,
        purchaseDate:
          plant.purchaseDate instanceof Date
            ? plant.purchaseDate
            : new Date(plant.purchaseDate),
      });
    }
    setLoading(false);
  }, [isEditing, plant, reset]);

const onSubmit = async (data: any) => {
  try {
    // 🔹 Garante que o campo 'photo' só vai se o usuário escolheu uma imagem
    if (!data.photo || data.photo.trim() === '') {
      delete data.photo;
    }

    if (isEditing) {
      await updatePlant({ ...data, id });
    } else {
      await createPlant(data);
    }

    router.back();
  } catch (error) {
    console.error('❌ Erro ao salvar planta:', error);
    setErrorMessage(handleApiError(error));
  }
};

  const onDelete = async () => {
    try {
      await deletePlant(id as string);
      router.back();
    } catch (error) {
      console.error('❌ Erro ao deletar planta:', error);
      setErrorMessage(handleApiError(error));
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  const speciesOptions = species.map((s: Species) => ({
    label: `${s.name} (${s.commonName || 'Sem nome comum'})`,
    value: s.id,
  }));

  const locationOptions = locations.map((l: Location) => ({
    label: l.name,
    value: l.id,
  }));

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Header title={isEditing ? 'Editar Planta' : 'Nova Planta'} showBack />
        <Card style={styles.card}>
          <Card.Content>
            <FormField control={control} name="name" label="Nome da Planta" />
            <HelperText type="error" visible={!!errors.name}>
              {errors.name?.message ?? ''}
            </HelperText>

            <PickerField control={control} name="speciesId" label="Espécie" items={speciesOptions} />
            <HelperText type="error" visible={!!errors.speciesId}>
              {errors.speciesId?.message ?? ''}
            </HelperText>

            <PickerField control={control} name="locationId" label="Local" items={locationOptions} />
            <HelperText type="error" visible={!!errors.locationId}>
              {errors.locationId?.message ?? ''}
            </HelperText>

            <DatePickerField control={control} name="purchaseDate" label="Data de Compra" />
            <HelperText type="error" visible={!!errors.purchaseDate}>
              {errors.purchaseDate?.message ?? ''}
            </HelperText>

            <FormField control={control} name="notes" label="Observações" multiline numberOfLines={3} />
            <HelperText type="error" visible={!!errors.notes}>
              {errors.notes?.message ?? ''}
            </HelperText>

            <Text style={styles.optionalText}>Imagem (opcional)</Text>
            <ImagePicker control={control} name="photo" />
            <HelperText type="error" visible={!!errors.photo}>
              {errors.photo?.message ?? ''}
            </HelperText>

            <CustomButton
              onPress={handleSubmit(onSubmit)}
              label={isEditing ? 'Salvar Alterações' : 'Criar Planta'}
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