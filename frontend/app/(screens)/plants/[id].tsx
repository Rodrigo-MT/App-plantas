import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View, Platform } from 'react-native';
import { ActivityIndicator, Card, HelperText, Text } from 'react-native-paper';
import { z } from 'zod';
import CustomButton from '../../../components/CustomButton';
import DatePickerField from '../../../components/DatePickerField';
import FormField from '../../../components/FormField';
import Header from '../../../components/Header';
import ImagePicker from '../../../components/ImagePicker';
import PickerField from '../../../components/PickerField';
import { useTheme } from '../../../constants/theme';
import { useLocations } from '../../../hooks/useLocations';
import { usePlants } from '../../../hooks/usePlants';
import { useSpecies } from '../../../hooks/useSpecies';
import { Plant } from '../../../types/plant';
import { Species } from '../../../types/species';

/**
 * Schema de validação para plantas.
 */
const plantSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  speciesId: z.string().min(1, 'Espécie é obrigatória'),
  locationId: z.string().min(1, 'Local é obrigatório'),
  purchaseDate: z.date(),
  notes: z.string().optional(),
  photo: z.string().optional(),
});

/**
 * Tela para editar ou excluir uma planta existente.
 */
export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams();
  const { plants, updatePlant, deletePlant } = usePlants();
  const { species } = useSpecies();
  const { locations } = useLocations();
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const plant = plants.find((p: Plant) => p.id === id);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 16,
      backgroundColor: theme.colors.background, // #F5F5F5 (light) ou #202225 (dark)
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
      color: theme.colors.onSurfaceVariant, // #666666 (light) ou #DBDBDB (dark)
      fontFamily: theme.fonts.default.fontFamily,
    },
    errorContainer: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    card: {
      backgroundColor: theme.colors.surface, // #FFFFFF (light) ou #292B2F (dark)
      borderRadius: 12,
      elevation: 4,
      margin: 16,
      ...(Platform.OS === 'web' ? {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      } : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }),
    },
    errorText: {
      fontSize: 16,
      color: theme.colors.error,
      textAlign: 'center',
      marginBottom: 16,
      fontFamily: theme.fonts.default.fontFamily,
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
  }), [theme]);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(plantSchema),
    defaultValues: plant
      ? {
          ...plant,
          purchaseDate: plant.purchaseDate instanceof Date ? plant.purchaseDate : new Date(plant.purchaseDate),
        }
      : {
          name: '',
          speciesId: '',
          locationId: '',
          purchaseDate: new Date(),
          notes: '',
          photo: '',
        },
  });

  useEffect(() => {
    if (plant) {
      reset({
        ...plant,
        purchaseDate: plant.purchaseDate instanceof Date ? plant.purchaseDate : new Date(plant.purchaseDate),
      });
    }
    setLoading(false);
  }, [plant, reset]);

  const onSubmit = async (data: any) => {
    try {
      await updatePlant({ ...data, id });
      router.back();
    } catch (error) {
      console.error('Error updating plant:', error);
      // TODO: Exibir feedback visual (ex.: SnackBar)
    }
  };

  const onDelete = async () => {
    try {
      await deletePlant(id as string);
      router.back();
    } catch (error) {
      console.error('Error deleting plant:', error);
      // TODO: Exibir feedback visual
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

  if (!plant) {
    return (
      <View style={styles.errorContainer}>
        <Header title="Planta não encontrada" showBack={true} />
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.errorText}>Planta não encontrada ou foi removida.</Text>
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

  const speciesOptions = species.map((s: Species) => ({
    label: `${s.name} (${s.commonName || 'Sem nome comum'})`,
    value: s.id,
  }));

  const locationOptions = locations.map((l) => ({
    label: l.name,
    value: l.id,
  }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Editar Planta" showBack={true} />
      <Card style={styles.card}>
        <Card.Content>
          <FormField control={control} name="name" label="Nome da Planta" />
          <HelperText type="error" visible={!!errors.name}>{errors.name?.message ?? ''}</HelperText>
          <PickerField control={control} name="speciesId" label="Espécie" items={speciesOptions} />
          <HelperText type="error" visible={!!errors.speciesId}>{errors.speciesId?.message ?? ''}</HelperText>
          <PickerField control={control} name="locationId" label="Local" items={locationOptions} />
          <HelperText type="error" visible={!!errors.locationId}>{errors.locationId?.message ?? ''}</HelperText>
          <DatePickerField control={control} name="purchaseDate" label="Data de Compra" />
          <HelperText type="error" visible={!!errors.purchaseDate}>{errors.purchaseDate?.message ?? ''}</HelperText>
          <FormField control={control} name="notes" label="Observações" multiline numberOfLines={3} />
          <HelperText type="error" visible={!!errors.notes}>{errors.notes?.message ?? ''}</HelperText>
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