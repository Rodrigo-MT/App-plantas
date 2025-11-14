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
import { CreateCareReminderData, UpdateCareReminderData } from '../../../src/types/careReminder';

/**
 * Schema de validação para lembretes de cuidado - AGORA COM PLANTNAME
 */
const reminderSchema = z.object({
  plantName: z.string().min(1, 'Planta é obrigatória'), // ✅ MUDOU: plantId → plantName
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

type ReminderFormData = z.infer<typeof reminderSchema>;

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
  const idString = Array.isArray(id) ? id[0] : id;
  
  const { 
    createCareReminder, 
    updateCareReminder, 
    deleteCareReminder, 
    error, 
    clearError,
    findReminderById 
  } = useCareReminders();
  
  const {plants} = usePlants();
  const router = useRouter();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const reminder = idString ? findReminderById(idString) : null;
  const isEditing = !!idString;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { 
          flexGrow: 1, 
          padding: 16, 
          backgroundColor: theme.colors.background 
        },
        card: {
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          elevation: 4,
          margin: 16,
          ...(Platform.OS === 'web'
            ? { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }
            : { 
                shadowColor: '#000', 
                shadowOffset: { width: 0, height: 2 }, 
                shadowOpacity: 0.1, 
                shadowRadius: 4 
              }),
        },
        switchLabel: {
          fontSize: 16,
          fontFamily: theme.fonts.bodyMedium.fontFamily,
          color: theme.colors.onSurfaceVariant,
          marginBottom: 8,
        },
        button: { 
          marginTop: 16 
        },
        deleteButton: {
          marginTop: 8,
          borderColor: theme.colors.error,
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
          color: theme.colors.onSurfaceVariant,
          fontFamily: theme.fonts.default.fontFamily,
        },
        submittingContainer: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        },
        helperText: {
          marginTop: -8,
          marginBottom: 12,
        }
      }),
    [theme]
  );

  const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      plantName: '', // ✅ MUDOU: plantId → plantName
      type: 'watering',
      frequency: '7',
      lastDone: normalizeDate(new Date()),
      nextDue: normalizeDate(new Date()),
      notes: '',
      isActive: true,
    },
  });

  // Carrega dados para edição
  useEffect(() => {
    if (isEditing) {
      if (reminder) {
        reset({
          plantName: reminder.plantName || '', // ✅ MUDOU: plantId → plantName
          type: reminder.type,
          frequency: reminder.frequency.toString(),
          lastDone: normalizeDate(new Date(reminder.lastDone)),
          nextDue: normalizeDate(new Date(reminder.nextDue)),
          notes: reminder.notes || '',
          isActive: reminder.isActive ?? true,
        });
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [isEditing, reminder, reset]);

  const onSubmit = async (data: ReminderFormData) => {
    try {
      setSubmitting(true);

      // Prepara os dados para a API
      const reminderData: CreateCareReminderData | UpdateCareReminderData = {
        plantName: data.plantName, // ✅ ENVIA O NOME DIRETAMENTE
        type: data.type,
        frequency: parseInt(data.frequency, 10),
        lastDone: normalizeDate(data.lastDone),
        nextDue: normalizeDate(data.nextDue),
        notes: data.notes || undefined,
        isActive: data.isActive,
      };

      if (isEditing) {
        await updateCareReminder(idString, reminderData);
      } else {
        await createCareReminder(reminderData as CreateCareReminderData);
      }

      router.back();
    } catch (error: unknown) {
      console.error('❌ Erro ao salvar lembrete:', error);
      // O hook já seta o error state
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!reminder) return;
    
    try {
      setSubmitting(true);
      await deleteCareReminder(idString);
      router.back();
    } catch (error: unknown) {
      console.error('❌ Erro ao deletar lembrete:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ CORREÇÃO: Options agora usam NOMES como valores
  const plantOptions = useMemo(() => 
    plants.map((plant) => ({ 
      label: plant.name, 
      value: plant.name // ✅ MUDOU: plant.id → plant.name
    })),
    [plants]
  );

  const typeOptions = [
    { label: '💧 Regar', value: 'watering' },
    { label: '🌱 Adubar', value: 'fertilizing' },
    { label: '✂️ Podar', value: 'pruning' },
    { label: '☀️ Sol', value: 'sunlight' },
    { label: '📝 Outro', value: 'other' },
  ];

  // Loading durante carregamento inicial
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>
          {isEditing ? 'Carregando lembrete...' : 'Preparando formulário...'}
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Header title={isEditing ? "Editar Lembrete" : "Novo Lembrete"} showBack />

        <Card style={styles.card}>
          <Card.Content>
            {/* Planta - AGORA COM NOMES */}
            <PickerField 
              control={control} 
              name="plantName" // ✅ MUDOU: plantId → plantName
              label="Planta *" 
              items={plantOptions}
            />
            <HelperText type="error" visible={!!errors.plantName} style={styles.helperText}>
              {errors.plantName?.message ?? ''}
            </HelperText>

            {/* Tipo de Cuidado */}
            <PickerField 
              control={control} 
              name="type" 
              label="Tipo de Cuidado *" 
              items={typeOptions} 
            />
            <HelperText type="error" visible={!!errors.type} style={styles.helperText}>
              {errors.type?.message ?? ''}
            </HelperText>

            {/* Frequência */}
            <MaskedInput 
              control={control} 
              name="frequency" 
              label="Frequência (dias) *" 
              mask="99" 
            />
            <HelperText type="error" visible={!!errors.frequency} style={styles.helperText}>
              {errors.frequency?.message ?? ''}
            </HelperText>

            {/* Última Realização */}
            <DatePickerField 
              control={control} 
              name="lastDone" 
              label="Última Realização *" 
              allowFutureDates 
            />
            <HelperText type="error" visible={!!errors.lastDone} style={styles.helperText}>
              {errors.lastDone?.message ?? ''}
            </HelperText>

            {/* Próxima Data */}
            <DatePickerField 
              control={control} 
              name="nextDue" 
              label="Próxima Data *" 
              allowFutureDates 
            />
            <HelperText type="error" visible={!!errors.nextDue} style={styles.helperText}>
              {errors.nextDue?.message ?? ''}
            </HelperText>

            {/* Observações */}
            <FormField 
              control={control} 
              name="notes" 
              label="Observações" 
              multiline 
              numberOfLines={3} 
            />
            <HelperText type="error" visible={!!errors.notes} style={styles.helperText}>
              {errors.notes?.message ?? ''}
            </HelperText>

            {/* Lembrete Ativo */}
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

            {/* Botão Salvar */}
            <CustomButton
              onPress={handleSubmit(onSubmit)}
              label={isEditing ? 'Salvar Alterações' : 'Criar Lembrete'}
              mode="contained"
              style={styles.button}
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
              disabled={submitting || (isEditing && !isDirty)}
            />

            {/* Botão Excluir (apenas edição) */}
            {isEditing && (
              <CustomButton
                onPress={onDelete}
                label="Excluir Lembrete"
                mode="outlined"
                style={[styles.button, styles.deleteButton]}
                buttonColor={theme.colors.surface}
                textColor={theme.colors.error}
                disabled={submitting}
              />
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Loading durante submit */}
      {submitting && (
        <View style={styles.submittingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onPrimary }]}>
            {isEditing ? 'Salvando...' : 'Criando...'}
          </Text>
        </View>
      )}

      {/* Modal de erro */}
      <ErrorModal visible={!!error} message={error || ''} onDismiss={clearError} />
    </>
  );
}