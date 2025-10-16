import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet } from 'react-native';
import { Card, HelperText, Switch, Text } from 'react-native-paper';
import { z } from 'zod';
import CustomButton from '../../../components/CustomButton';
import DatePickerField from '../../../components/DatePickerField';
import FormField from '../../../components/FormField';
import Header from '../../../components/Header';
import PickerField from '../../../components/PickerField';
import theme from '../../../constants/theme';
import { useCareLogs } from '../../../hooks/useCareLogs';
import { usePlants } from '../../../hooks/usePlants';

/**
 * Schema de validação para novos registros de cuidado.
 */
const careLogSchema = z.object({
  plantId: z.string().min(1, 'Planta é obrigatória'),
  type: z.enum(['watering', 'fertilizing', 'pruning', 'repotting', 'cleaning', 'other']),
  date: z.date().default(new Date()),
  notes: z.string().optional(),
  success: z.boolean().default(true),
});

/**
 * Tela para criar um novo registro de cuidado.
 */
export default function NewCareLogScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(careLogSchema),
    defaultValues: {
      plantId: '',
      type: 'watering',
      date: new Date(),
      notes: '',
      success: true,
    },
  });

  const { createCareLog } = useCareLogs();
  const { plants } = usePlants();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      await createCareLog(data);
      router.back();
    } catch (error) {
      console.error('Error creating care log:', error);
      // TODO: Exibir feedback visual (ex.: SnackBar)
    }
  };

  const plantOptions = plants.map((plant) => ({
    label: plant.name,
    value: plant.id,
  }));

  const typeOptions = [
    { label: '💧 Regar', value: 'watering' },
    { label: '🌱 Adubar', value: 'fertilizing' },
    { label: '✂️ Podar', value: 'pruning' },
    { label: '🪴 Transplantar', value: 'repotting' },
    { label: '🧹 Limpar', value: 'cleaning' },
    { label: '📝 Outro', value: 'other' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Novo Registro" showBack={true} />
      <Card style={styles.card}>
        <Card.Content>
          <PickerField
            control={control}
            name="plantId"
            label="Planta"
            items={plantOptions}
          />
          <HelperText type="error" visible={!!errors.plantId}>
            {errors.plantId?.message}
          </HelperText>
          <PickerField
            control={control}
            name="type"
            label="Tipo de Cuidado"
            items={typeOptions}
          />
          <HelperText type="error" visible={!!errors.type}>
            {errors.type?.message}
          </HelperText>
          <DatePickerField
            control={control}
            name="date"
            label="Data do Cuidado"
          />
          <HelperText type="error" visible={!!errors.date}>
            {errors.date?.message}
          </HelperText>
          <FormField
            control={control}
            name="notes"
            label="Observações"
            multiline
            numberOfLines={3}
          />
          <HelperText type="error" visible={!!errors.notes}>
            {errors.notes?.message}
          </HelperText>
          <Text style={styles.switchLabel}>Realizado com sucesso</Text>
          <Controller
            control={control}
            name="success"
            render={({ field: { onChange, value } }) => (
              <Switch
                value={value}
                onValueChange={onChange}
                color={theme.colors.primary}
              />
            )}
          />
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
  switchLabel: {
    fontSize: 16,
    fontFamily: theme.fonts.bodyMedium.fontFamily, // ✅ CORRIGIDO
    color: theme.colors.text,
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
  },
});