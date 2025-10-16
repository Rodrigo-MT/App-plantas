import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet } from 'react-native';
import { Card, HelperText } from 'react-native-paper';
import { z } from 'zod';
import CustomButton from '../../../components/CustomButton';
import FormField from '../../../components/FormField';
import Header from '../../../components/Header';
import PickerField from '../../../components/PickerField';
import theme from '../../../constants/theme';
import { useLocations } from '../../../hooks/useLocations';

/**
 * Schema de validação para novos locais.
 */
const locationSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['indoor', 'outdoor', 'balcony', 'garden', 'terrace']),
  sunlight: z.enum(['full', 'partial', 'shade']),
  humidity: z.enum(['low', 'medium', 'high']),
  description: z.string().optional(),
});

/**
 * Tela para criar um novo local.
 */
export default function NewLocationScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      type: 'indoor',
      sunlight: 'partial',
      humidity: 'medium',
      description: '',
    },
  });

  const { createLocation } = useLocations();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      await createLocation(data);
      router.back();
    } catch (error) {
      console.error('Error creating location:', error);
      // TODO: Exibir feedback visual (ex.: SnackBar)
    }
  };

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
      <Header title="Novo Local" showBack={true} />
      <Card style={styles.card}>
        <Card.Content>
          <FormField control={control} name="name" label="Nome do Local" />
          <HelperText type="error" visible={!!errors.name}>
            {errors.name?.message ?? ''}
          </HelperText>
          <PickerField
            control={control}
            name="type"
            label="Tipo de Local"
            items={typeOptions}
          />
          <HelperText type="error" visible={!!errors.type}>
            {errors.type?.message ?? ''}
          </HelperText>
          <PickerField
            control={control}
            name="sunlight"
            label="Intensidade de Luz"
            items={sunlightOptions}
          />
          <HelperText type="error" visible={!!errors.sunlight}>
            {errors.sunlight?.message ?? ''}
          </HelperText>
          <PickerField
            control={control}
            name="humidity"
            label="Nível de Umidade"
            items={humidityOptions}
          />
          <HelperText type="error" visible={!!errors.humidity}>
            {errors.humidity?.message ?? ''}
          </HelperText>
          <FormField
            control={control}
            name="description"
            label="Descrição"
            multiline
            numberOfLines={3}
          />
          <HelperText type="error" visible={!!errors.description}>
            {errors.description?.message ?? ''}
          </HelperText>
          <CustomButton
            onPress={handleSubmit(onSubmit)}
            label="Salvar"
            mode="contained"
            style={styles.button}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  card: {
    backgroundColor: theme.colors.background,
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
});