import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, HelperText, Text } from 'react-native-paper';
import { z } from 'zod';
import CustomButton from '../../../components/CustomButton';
import FormField from '../../../components/FormField';
import Header from '../../../components/Header';
import PickerField from '../../../components/PickerField';
import { useTheme } from '../../../constants/theme';
import { useLocations } from '../../../hooks/useLocations';
import { Location } from '../../../types/location';

/**
 * Schema de validação para locais.
 */
const locationSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['indoor', 'outdoor', 'balcony', 'garden', 'terrace']),
  sunlight: z.enum(['full', 'partial', 'shade']),
  humidity: z.enum(['low', 'medium', 'high']),
  description: z.string().optional(),
});

/**
 * Tela para editar ou excluir um local existente.
 */
export default function LocationDetailScreen() {
  const { id } = useLocalSearchParams();
  const { locations, updateLocation, deleteLocation } = useLocations();
  const router = useRouter();
  const { theme } = useTheme();
  const location = locations.find((l: Location) => l.id === id);
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(locationSchema),
    defaultValues: location || {
      name: '',
      type: 'indoor',
      sunlight: 'partial',
      humidity: 'medium',
      description: '',
    },
  });

  useEffect(() => {
    if (location) {
      reset(location);
    }
  }, [location, reset]);

  const onSubmit = async (data: any) => {
    try {
      await updateLocation({ ...data, id });
      router.back();
    } catch (error) {
      console.error('Error updating location:', error);
      // TODO: Exibir feedback visual (ex.: SnackBar)
    }
  };

  const onDelete = async () => {
    try {
      await deleteLocation(id as string);
      router.back();
    } catch (error) {
      console.error('Error deleting location:', error);
      // TODO: Exibir feedback visual
    }
  };

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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    button: {
      marginTop: 16,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    errorText: {
      fontSize: 16,
      color: theme.colors.error,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
    },
  }), [theme]);

  if (!location) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Local não encontrado</Text>
      </View>
    );
  }

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Editar Local" showBack={true} />
      <Card style={styles.card}>
        <Card.Content>
          <FormField control={control} name="name" label="Nome do Local" />
          <HelperText type="error" visible={!!errors.name}>
            {errors.name?.message || ''}
          </HelperText>
          <PickerField
            control={control}
            name="type"
            label="Tipo de Local"
            items={typeOptions}
          />
          <HelperText type="error" visible={!!errors.type}>
            {errors.type?.message || ''}
          </HelperText>
          <PickerField
            control={control}
            name="sunlight"
            label="Intensidade de Luz"
            items={sunlightOptions}
          />
          <HelperText type="error" visible={!!errors.sunlight}>
            {errors.sunlight?.message || ''}
          </HelperText>
          <PickerField
            control={control}
            name="humidity"
            label="Nível de Umidade"
            items={humidityOptions}
          />
          <HelperText type="error" visible={!!errors.humidity}>
            {errors.humidity?.message || ''}
          </HelperText>
          <FormField
            control={control}
            name="description"
            label="Descrição"
            multiline
            numberOfLines={3}
          />
          <HelperText type="error" visible={!!errors.description}>
            {errors.description?.message || ''}
          </HelperText>
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
            buttonColor={theme.colors.primary}
            textColor={theme.colors.primary}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
}