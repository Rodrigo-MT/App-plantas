import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, HelperText, Switch, Text } from 'react-native-paper';
import { z } from 'zod';
import CustomButton from '../../../components/CustomButton';
import DatePickerField from '../../../components/DatePickerField';
import FormField from '../../../components/FormField';
import Header from '../../../components/Header';
import PickerField from '../../../components/PickerField';
import theme from '../../../constants/theme';
import { useCareReminders } from '../../../hooks/useCareReminders';
import { usePlants } from '../../../hooks/usePlants';
import { CareReminder } from '../../../types/careReminder';

/**
 * Schema de validação para lembretes de cuidado.
 */
const reminderSchema = z.object({
  plantId: z.string().min(1, 'Planta é obrigatória'),
  type: z.enum(['watering', 'fertilizing', 'pruning', 'sunlight', 'other']),
  frequency: z
    .string()
    .min(1, 'Frequência é obrigatória')
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, 'Frequência deve ser um número positivo'),
  lastDone: z.date(),
  nextDue: z.date(),
  notes: z.string().optional(),
  isActive: z.boolean(),
});

/**
 * Tela para editar ou excluir um lembrete de cuidado existente.
 */
export default function CareReminderDetailScreen() {
  const { id } = useLocalSearchParams();
  const { careReminders, updateCareReminder, deleteCareReminder } = useCareReminders();
  const { plants } = usePlants();
  const router = useRouter();
  const reminder = careReminders.find((r: CareReminder) => r.id === id);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(reminderSchema),
    defaultValues: reminder
      ? {
          ...reminder,
          frequency: reminder.frequency.toString(),
        }
      : {
          plantId: '',
          type: 'watering',
          frequency: '7',
          lastDone: new Date(),
          nextDue: new Date(),
          notes: '',
          isActive: true,
        },
  });

  useEffect(() => {
    if (reminder) {
      reset({
        ...reminder,
        frequency: reminder.frequency.toString(),
      });
    }
  }, [reminder, reset]);

  const onSubmit = async (data: any) => {
    try {
      await updateCareReminder({
        ...data,
        id,
        frequency: Number(data.frequency),
      });
      router.back();
    } catch (error) {
      console.error('Error updating reminder:', error);
      // TODO: Exibir feedback visual (ex.: SnackBar)
    }
  };

  const onDelete = async () => {
    try {
      await deleteCareReminder(id as string);
      router.back();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      // TODO: Exibir feedback visual
    }
  };

  if (!reminder) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Lembrete não encontrado</Text>
      </View>
    );
  }

  const plantOptions = plants.map((plant) => ({
    label: plant.name,
    value: plant.id,
  }));

  const typeOptions = [
    { label: '💧 Regar', value: 'watering' },
    { label: '🌱 Adubar', value: 'fertilizing' },
    { label: '✂️ Podar', value: 'pruning' },
    { label: '☀️ Sol', value: 'sunlight' },
    { label: '📝 Outro', value: 'other' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Editar Lembrete" showBack={true} />
      <Card style={styles.card}>
        <Card.Content>
          <PickerField
            control={control}
            name="plantId"
            label="Planta"
            items={plantOptions}
          />
          <HelperText type="error" visible={!!errors.plantId}>
            {errors.plantId?.message ?? ''}
          </HelperText>
          <PickerField
            control={control}
            name="type"
            label="Tipo de Cuidado"
            items={typeOptions}
          />
          <HelperText type="error" visible={!!errors.type}>
            {errors.type?.message ?? ''}
          </HelperText>
          <FormField
            control={control}
            name="frequency"
            label="Frequência (dias)"
            keyboardType="numeric"
          />
          <HelperText type="error" visible={!!errors.frequency}>
            {errors.frequency?.message ?? ''}
          </HelperText>
          <DatePickerField
            control={control}
            name="lastDone"
            label="Última Realização"
            allowFutureDates={true}
          />
          <HelperText type="error" visible={!!errors.lastDone}>
            {errors.lastDone?.message ?? ''}
          </HelperText>
          <DatePickerField
            control={control}
            name="nextDue"
            label="Próxima Data"
            allowFutureDates={true}
          />
          <HelperText type="error" visible={!!errors.nextDue}>
            {errors.nextDue?.message ?? ''}
          </HelperText>
          <FormField
            control={control}
            name="notes"
            label="Observações"
            multiline
            numberOfLines={3}
          />
          <HelperText type="error" visible={!!errors.notes}>
            {errors.notes?.message ?? ''}
          </HelperText>
          <Text style={styles.switchLabel}>Lembrete Ativo</Text>
          <Controller
            control={control}
            name="isActive"
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
          <CustomButton
            onPress={onDelete}
            label="Excluir"
            mode="outlined"
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
    fontFamily: theme.fonts.bodyMedium.fontFamily, // ✅ CORRIGIDO
  },
});