import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Platform } from 'react-native';
import { Card, HelperText, Text } from 'react-native-paper';
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
import { Location } from '../../../types/location';
import { Species } from '../../../types/species';

/**
 * Schema de validação para novas plantas.
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
 * Tela para criar uma nova planta.
 */
export default function NewPlantScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm({
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
  const { createPlant } = usePlants();
  const { species } = useSpecies();
  const { locations } = useLocations();
  const router = useRouter();
  const { theme } = useTheme();

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
  }), [theme]);

  const onSubmit = async (data: any) => {
    try {
      await createPlant(data);
      router.back();
    } catch (error) {
      console.error('Error creating plant:', error);
      // TODO: Exibir feedback visual (ex.: SnackBar)
    }
  };

  const speciesOptions = species.map((s: Species) => ({
    label: `${s.name} (${s.commonName || 'Sem nome comum'})`,
    value: s.id,
  }));

  const locationOptions = locations.map((l: Location) => ({
    label: l.name,
    value: l.id,
  }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Adicione uma nova planta" showBack={true} />
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
        </Card.Content>
      </Card>
    </ScrollView>
  );
}