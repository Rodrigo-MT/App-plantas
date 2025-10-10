import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Card, HelperText, Text } from 'react-native-paper';
import { z } from 'zod';
import DatePickerField from '../../../components/DatePickerField';
import FormField from '../../../components/FormField';
import Header from '../../../components/Header';
import ImagePicker from '../../../components/ImagePicker';
import PickerField from '../../../components/PickerField';
import { usePlants } from '../../../hooks/usePlants';
import { useSpecies } from '../../../hooks/useSpecies';
import { Species } from '../../../types/species';

const plantSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  speciesId: z.string().min(1, 'Espécie é obrigatória'),
  locationId: z.string().min(1, 'Local é obrigatório'),
  purchaseDate: z.date(),
  notes: z.string().optional(),
  photo: z.string().optional(),
});

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
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      await createPlant(data);
      router.back();
    } catch (error) {
      console.error('Error creating plant:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Adicione uma nova planta" showBack={true} />
      <Card style={styles.card}>
        <Card.Content>
          <FormField control={control} name="name" label="Nome da Planta" />
          <HelperText type="error" visible={!!errors.name}>
            {errors.name?.message || ''}
          </HelperText>

          <PickerField
            control={control}
            name="speciesId"
            label="Espécie"
            items={species.map((s: Species) => ({
              label: `${s.name} (${s.commonName || 'Sem nome comum'})`,
              value: s.id,
            }))}
          />
          <HelperText type="error" visible={!!errors.speciesId}>
            {errors.speciesId?.message || ''}
          </HelperText>

          <PickerField
            control={control}
            name="locationId"
            label="Local"
            items={[{ label: 'Sala', value: '1' }, { label: 'Jardim', value: '2' }]}
          />
          <HelperText type="error" visible={!!errors.locationId}>
            {errors.locationId?.message || ''}
          </HelperText>

          <DatePickerField control={control} name="purchaseDate" label="Data de Compra" />
          <HelperText type="error" visible={!!errors.purchaseDate}>
            {errors.purchaseDate?.message || ''}
          </HelperText>

          <FormField control={control} name="notes" label="Observações" />
          <HelperText type="error" visible={!!errors.notes}>
            {errors.notes?.message || ''}
          </HelperText>

          <Text style={styles.optionalText}>Imagem (opcional)</Text>
          <ImagePicker control={control} name="photo" />
          <HelperText type="error" visible={!!errors.photo}>
            {errors.photo?.message || ''}
          </HelperText>

          <Button mode="contained" onPress={handleSubmit(onSubmit)} style={styles.button}>
            Salvar
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    elevation: 4,
  },
  optionalText: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 8,
  },
  button: {
    marginTop: 24,
  },
});