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
import PickerField from '../../../src/components/PickerField';
import ImagePicker from '../../../src/components/ImagePicker';
import ErrorModal from '../../../src/components/ErrorModal';

import { useTheme } from '../../../src/constants/theme';
import { useLocations } from '../../../src/hooks/useLocations';
import { handleApiError } from '../../../src/utils/handleApiError';

/**
 * Schema de validação conforme DTO/backend.
 * Agora o campo photo é opcional e tratado como anexagem.
 */
const locationSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Máx. 100 caracteres'),
  type: z.enum(['indoor', 'outdoor', 'balcony', 'garden', 'terrace']),
  sunlight: z.enum(['full', 'partial', 'shade']),
  humidity: z.enum(['low', 'medium', 'high']),
  description: z.string().min(1, 'Descrição é obrigatória').max(500, 'Máx. 500 caracteres'),
  photo: z.string().nullable().transform((v) => v ?? '').optional(),
});

type LocationFormValues = z.infer<typeof locationSchema>;

export default function LocationsForm() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { locations, createLocation, updateLocation, deleteLocation } = useLocations();
  const { theme } = useTheme();

  const isEditing = !!id;
  const location = locations.find((l) => l.id === id);

  const [loading, setLoading] = useState(isEditing);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema) as any,
    defaultValues: {
      name: '',
      type: 'indoor',
      sunlight: 'partial',
      humidity: 'medium',
      description: '',
      photo: '',
    },
  });

  useEffect(() => {
    if (isEditing && location) {
      reset({
        ...location,
      });
    }
    setLoading(false);
  }, [isEditing, location, reset]);

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
        ? { boxShadow: '0px 2px 6px rgba(0,0,0,0.12)' }
        : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 4,
          }),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
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
    button: { marginTop: 16 },
  }), [theme]);

  const typeOptions = [
    { label: '🏠 Interior', value: 'indoor' },
    { label: '🌳 Exterior', value: 'outdoor' },
    { label: '🏞️ Varanda', value: 'balcony' },
    { label: '🌷 Jardim', value: 'garden' },
    { label: '🏡 Terraço', value: 'terrace' },
  ];

  const sunlightOptions = [
    { label: '☀️ Sol Pleno', value: 'full' },
    { label: '⛅ Meia Sombra', value: 'partial' },
    { label: '🌤️ Sombra', value: 'shade' },
  ];

  const humidityOptions = [
    { label: '💧 Baixa', value: 'low' },
    { label: '💧💧 Média', value: 'medium' },
    { label: '💧💧💧 Alta', value: 'high' },
  ];

  const onSubmit = async (data: LocationFormValues) => {
    try {
      // 🔹 Garante que 'photo' só vai se o usuário escolheu uma imagem
      if (!data.photo || data.photo.trim() === '') {
        delete data.photo;
      }

      if (isEditing) {
        await updateLocation({ id: id as string, ...data });
      } else {
        await createLocation(data);
      }

      router.back();
    } catch (error) {
      console.error('❌ Erro ao salvar local:', error);
      setErrorMessage(handleApiError(error));
    }
  };

  const onDelete = async () => {
    try {
      await deleteLocation(id as string);
      router.back();
    } catch (error) {
      console.error('❌ Erro ao deletar local:', error);
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

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Header title={isEditing ? 'Editar Local' : 'Novo Local'} showBack />
        <Card style={styles.card}>
          <Card.Content>
            <FormField control={control} name="name" label="Nome do Local" />
            <HelperText type="error" visible={!!errors.name}>{errors.name?.message ?? ''}</HelperText>

            <PickerField control={control} name="type" label="Tipo de Local" items={typeOptions} />
            <HelperText type="error" visible={!!errors.type}>{errors.type?.message ?? ''}</HelperText>

            <PickerField control={control} name="sunlight" label="Intensidade de Luz" items={sunlightOptions} />
            <HelperText type="error" visible={!!errors.sunlight}>{errors.sunlight?.message ?? ''}</HelperText>

            <PickerField control={control} name="humidity" label="Nível de Umidade" items={humidityOptions} />
            <HelperText type="error" visible={!!errors.humidity}>{errors.humidity?.message ?? ''}</HelperText>

            <FormField control={control} name="description" label="Descrição" multiline numberOfLines={3} />
            <HelperText type="error" visible={!!errors.description}>{errors.description?.message ?? ''}</HelperText>

            <Text style={styles.optionalText}>Imagem (opcional)</Text>
            <ImagePicker control={control} name="photo" />
            <HelperText type="error" visible={!!errors.photo}>{errors.photo?.message ?? ''}</HelperText>

            <CustomButton
              onPress={handleSubmit(onSubmit)}
              label={isEditing ? 'Salvar Alterações' : 'Criar Local'}
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
