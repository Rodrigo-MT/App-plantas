import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View, Platform, ActivityIndicator } from 'react-native';
import { Card, HelperText, Switch, Text } from 'react-native-paper';
import { z } from 'zod';
import CustomButton from '../../../src/components/CustomButton';
import DatePickerField from '../../../src/components/DatePickerField';
import FormField from '../../../src/components/FormField';
import Header from '../../../src/components/Header';
import MaskedInput from '../../../src/components/MaskedInput';
import PickerField from '../../../src/components/PickerField';
import ErrorModal from '../../../src/components/ErrorModal';
import { useTheme } from '../../../src/constants/theme';
import { useCareReminders } from '../../../src/hooks/useCareReminders';
import { usePlants } from '../../../src/hooks/usePlants';
import { CareReminder } from '../../../src/types/careReminder';
import { handleApiError } from '../../../src/utils/handleApiError';

/**
 * Schema de validação para lembretes de cuidado.
 */
const reminderSchema = z.object({
  plantId: z.string().min(1, 'Planta é obrigatória'),
  type: z.enum(['watering', 'fertilizing', 'pruning', 'sunlight', 'other']),
  frequency: z
    .string()
    .min(1, 'Frequência é obrigatória')
    .regex(/^\d+$/, 'A frequência deve conter apenas números')
    .refine((val) => {
      const num = parseInt(val, 10);
      return num > 0 && num <= 99;
    }, 'Frequência deve ser entre 1 e 99 dias'),
  lastDone: z.date(),
  nextDue: z.date(),
  notes: z.string().optional(),
  isActive: z.boolean(),
});

/**
 * Função auxiliar para zerar horas, minutos, segundos e milissegundos
 */
const normalizeDate = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Tela para criar ou editar um lembrete de cuidado.
 */
export default function CareReminderForm() {
  const { id } = useLocalSearchParams();
  const idString = Array.isArray(id) ? id[0] : id; // garante ser string
  const { careReminders, createCareReminder, updateCareReminder, deleteCareReminder } = useCareReminders();
  const { plants } = usePlants();
  const router = useRouter();
  const { theme } = useTheme();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reminder = careReminders.find((r: CareReminder) => r.id === idString);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flexGrow: 1, padding: 16, backgroundColor: theme.colors.background },
        card: {
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          elevation: 4,
          ...(Platform.OS === 'web'
            ? { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }
            : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }),
        },
        switchLabel: {
          fontSize: 16,
          fontFamily: theme.fonts.bodyMedium.fontFamily,
          color: theme.colors.onSurfaceVariant,
          marginBottom: 8,
        },
        button: { marginTop: 16 },
      }),
    [theme]
  );

  const { control, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof reminderSchema>>({
    resolver: zodResolver(reminderSchema),
    defaultValues: reminder
      ? {
          ...reminder,
          frequency: reminder.frequency.toString(),
          lastDone: normalizeDate(new Date(reminder.lastDone)),
          nextDue: normalizeDate(new Date(reminder.nextDue)),
        }
      : {
          plantId: '',
          type: 'watering',
          frequency: '7',
          lastDone: normalizeDate(new Date()),
          nextDue: normalizeDate(new Date()),
          notes: '',
          isActive: true,
        },
  });

  useEffect(() => {
    if (reminder) {
      reset({
        ...reminder,
        frequency: reminder.frequency.toString(),
        lastDone: normalizeDate(new Date(reminder.lastDone)),
        nextDue: normalizeDate(new Date(reminder.nextDue)),
      });
    }
  }, [reminder, reset]);

  const onSubmit = async (data: z.infer<typeof reminderSchema>) => {
    setSubmitting(true);

    // Normaliza datas antes de enviar
    const normalizedData = {
      ...data,
      lastDone: normalizeDate(data.lastDone),
      nextDue: normalizeDate(data.nextDue),
      frequency: parseInt(data.frequency, 10),
    };

    try {
      if (reminder) {
        await updateCareReminder({ ...normalizedData, id: idString });
      } else {
        await createCareReminder(normalizedData);
      }
      router.back();
    } catch (error: unknown) {
      console.error('Erro ao salvar lembrete:', error);
      setErrorMessage(handleApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!reminder) return;
    setSubmitting(true);
    try {
      await deleteCareReminder(idString);
      router.back();
    } catch (error: unknown) {
      console.error('Erro ao deletar lembrete:', error);
      setErrorMessage(handleApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const plantOptions = plants.map((plant) => ({ label: plant.name, value: plant.id }));
  const typeOptions = [
    { label: '💧 Regar', value: 'watering' },
    { label: '🌱 Adubar', value: 'fertilizing' },
    { label: '✂️ Podar', value: 'pruning' },
    { label: '☀️ Sol', value: 'sunlight' },
    { label: '📝 Outro', value: 'other' },
  ];

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Header title={reminder ? "Editar Lembrete" : "Novo Lembrete"} showBack />

        <Card style={styles.card}>
          <Card.Content>
            <PickerField control={control} name="plantId" label="Planta" items={plantOptions} />
            <HelperText type="error" visible={!!errors.plantId}>{errors.plantId?.message ?? ''}</HelperText>

            <PickerField control={control} name="type" label="Tipo de Cuidado" items={typeOptions} />
            <HelperText type="error" visible={!!errors.type}>{errors.type?.message ?? ''}</HelperText>

            <MaskedInput control={control} name="frequency" label="Frequência (dias)" mask="99" />
            <HelperText type="error" visible={!!errors.frequency}>{errors.frequency?.message ?? ''}</HelperText>

            <DatePickerField control={control} name="lastDone" label="Última Realização" allowFutureDates />
            <HelperText type="error" visible={!!errors.lastDone}>{errors.lastDone?.message ?? ''}</HelperText>

            <DatePickerField control={control} name="nextDue" label="Próxima Data" allowFutureDates />
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

            {submitting && (
              <View style={{ marginVertical: 16, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            )}

            <CustomButton
              onPress={handleSubmit(onSubmit)}
              label="Salvar"
              mode="contained"
              style={styles.button}
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
            />

            {reminder && (
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
