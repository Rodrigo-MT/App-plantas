import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Platform } from 'react-native';
import { Card, HelperText, Switch, Text } from 'react-native-paper';
import { z } from 'zod';
import CustomButton from '../../../components/CustomButton';
import DatePickerField from '../../../components/DatePickerField';
import FormField from '../../../components/FormField';
import Header from '../../../components/Header';
import MaskedInput from '../../../components/MaskedInput';
import PickerField from '../../../components/PickerField';
import { useTheme } from '../../../constants/theme';
import { useCareReminders } from '../../../hooks/useCareReminders';
import { usePlants } from '../../../hooks/usePlants';

/**
 * Schema de validação para novos lembretes de cuidado.
 */
const reminderSchema = z.object({
  plantId: z.string().min(1, 'Planta é obrigatória'),
  type: z.enum(['watering', 'fertilizing', 'pruning', 'sunlight', 'other']),
  frequency: z
    .string()
    .min(1, 'Frequência é obrigatória')
    .regex(/^\d+$/, 'A frequência deve conter apenas números')
    .refine((val) => {
      const num = parseInt(val);
      return num > 0 && num <= 99;
    }, 'Frequência deve ser entre 1 e 99 dias'),
  lastDone: z.date(),
  nextDue: z.date(),
  notes: z.string().optional(),
  isActive: z.boolean(),
});

/**
 * Tela para criar um novo lembrete de cuidado.
 */
export default function NewCareReminderScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      plantId: '',
      type: 'watering',
      frequency: '7',
      lastDone: new Date(),
      nextDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: '',
      isActive: true,
    },
  });
  const { createCareReminder } = useCareReminders();
  const { plants } = usePlants();
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
    switchLabel: {
      fontSize: 16,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.onSurfaceVariant, // #666666 (light) ou #DBDBDB (dark)
      marginBottom: 8,
    },
    button: {
      marginTop: 16,
    },
  }), [theme]);

  const onSubmit = async (data: any) => {
    try {
      await createCareReminder({
        ...data,
        frequency: parseInt(data.frequency),
      });
      router.back();
    } catch (error) {
      console.error('Error creating reminder:', error);
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
    { label: '☀️ Sol', value: 'sunlight' },
    { label: '📝 Outro', value: 'other' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Novo Lembrete" showBack={true} />
      <Card style={styles.card}>
        <Card.Content>
          <PickerField control={control} name="plantId" label="Planta" items={plantOptions} />
          <HelperText type="error" visible={!!errors.plantId}>{errors.plantId?.message ?? ''}</HelperText>
          <PickerField control={control} name="type" label="Tipo de Cuidado" items={typeOptions} />
          <HelperText type="error" visible={!!errors.type}>{errors.type?.message ?? ''}</HelperText>
          <MaskedInput control={control} name="frequency" label="Frequência (dias)" mask="99" />
          <HelperText type="error" visible={!!errors.frequency}>{errors.frequency?.message ?? ''}</HelperText>
          <DatePickerField control={control} name="lastDone" label="Última Realização" allowFutureDates={true} />
          <HelperText type="error" visible={!!errors.lastDone}>{errors.lastDone?.message ?? ''}</HelperText>
          <DatePickerField control={control} name="nextDue" label="Próxima Data" allowFutureDates={true} />
          <HelperText type="error" visible={!!errors.nextDue}>{errors.nextDue?.message ?? ''}</HelperText>
          <FormField control={control} name="notes" label="Observações" multiline numberOfLines={3} />
          <HelperText type="error" visible={!!errors.notes}>{errors.notes?.message ?? ''}</HelperText>
          <Text style={styles.switchLabel}>Lembrete Ativo</Text>
          <Controller
            control={control}
            name="isActive"
            render={({ field: { onChange, value } }) => (
              <Switch value={value} onValueChange={onChange} color={theme.colors.primary} />
            )}
          />
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