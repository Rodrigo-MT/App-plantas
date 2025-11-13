// app/screens/care-logs/CareLogsForm.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import {
  ScrollView,
  StyleSheet,
  View,
  Platform,
  Alert,
} from 'react-native';
import { Card, HelperText, Switch, Text } from 'react-native-paper';
import { z } from 'zod';

import CustomButton from '../../../src/components/CustomButton';
import DatePickerField from '../../../src/components/DatePickerField';
import FormField from '../../../src/components/FormField';
import Header from '../../../src/components/Header';
import PickerField from '../../../src/components/PickerField';
import ErrorModal from '../../../src/components/ErrorModal';

import { useTheme } from '../../../src/constants/theme';
import { useCareLogs } from '../../../src/hooks/useCareLogs';
import { usePlants } from '../../../src/hooks/usePlants';
import { handleApiError } from '../../../src/utils/handleApiError';
import { CareLog } from '../../../src/types/careLog';

/**
 * Schema de validação para registros de cuidado.
 */
const careLogSchema = z.object({
  plantId: z.string().min(1, 'Planta é obrigatória'),
  type: z.enum(['watering', 'fertilizing', 'pruning', 'repotting', 'cleaning', 'other']),
  date: z.date(),
  notes: z.string().optional(),
  success: z.boolean(),
});
type FormValues = z.infer<typeof careLogSchema>;

export default function CareLogsForm() {
  const { id } = useLocalSearchParams() as { id?: string };
  const router = useRouter();
  const { theme } = useTheme();

  const { careLogs, createCareLog, updateCareLog, deleteCareLog } = useCareLogs();
  const { plants } = usePlants();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(careLogSchema),
    defaultValues: {
      plantId: '',
      type: 'watering',
      date: new Date(),
      notes: '',
      success: true,
    },
  });

  // popula o form em modo edição
  useEffect(() => {
    if (!id) return;
    const careLog = careLogs.find((c) => c.id === id);
    if (careLog) {
      reset({
        plantId: careLog.plantId,
        type: careLog.type,
        date: careLog.date instanceof Date ? careLog.date : new Date(careLog.date),
        notes: careLog.notes ?? '',
        success: careLog.success,
      });
    }
  }, [id, careLogs, reset]);

  const plantOptions = plants.map((p) => ({ label: p.name, value: p.id }));
  const typeOptions = [
    { label: '💧 Regar', value: 'watering' },
    { label: '🌱 Adubar', value: 'fertilizing' },
    { label: '✂️ Podar', value: 'pruning' },
    { label: '🪴 Transplantar', value: 'repotting' },
    { label: '🧹 Limpar', value: 'cleaning' },
    { label: '📝 Outro', value: 'other' },
  ];

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexGrow: 1,
          padding: 16,
          backgroundColor: theme.colors.background,
        },
        card: {
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          elevation: 4,
          ...(Platform.OS === 'web'
            ? { boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }
            : {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }),
        },
        switchLabel: {
          fontSize: 16,
          fontFamily: theme.fonts.bodyMedium.fontFamily,
          color: theme.colors.onSurfaceVariant,
          marginBottom: 8,
        },
        button: {
          marginTop: 16,
        },
      }),
    [theme]
  );

  // garante que temos um Date antes de enviar ao service (os serviços esperam Date no tipo)
  const normalizeDateForApi = (d?: Date | string): Date => {
    if (!d) return new Date();
    return d instanceof Date ? d : new Date(d);
  };

  const onCreate = async (data: FormValues) => {
    try {
      const payload: Omit<CareLog, 'id' | 'createdAt' | 'updatedAt'> = {
        plantId: data.plantId,
        type: data.type,
        date: normalizeDateForApi(data.date),
        notes: data.notes,
        success: data.success,
      };
      await createCareLog(payload);
      router.back();
    } catch (err: unknown) {
      const msg = handleApiError(err);
      setErrorMessage(msg);
      throw err;
    }
  };

  const onUpdate = async (data: FormValues) => {
    try {
      const payload: CareLog = {
        id: id as string,
        plantId: data.plantId,
        type: data.type,
        date: normalizeDateForApi(data.date),
        notes: data.notes,
        success: data.success,
        // createdAt/updatedAt serão preenchidos pelo backend; deixamos undefined ou new Date() se necessário
      };
      await updateCareLog(payload);
      router.back();
    } catch (err: unknown) {
      const msg = handleApiError(err);
      setErrorMessage(msg);
      throw err;
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      'Excluir registro',
      'Tem certeza que deseja excluir este registro de cuidado?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCareLog(id);
              router.back();
            } catch (err: unknown) {
              const msg = handleApiError(err);
              setErrorMessage(msg);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const onSubmit = handleSubmit(async (data) => {
    if (id) await onUpdate(data);
    else await onCreate(data);
  });

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Header title={id ? 'Editar Registro' : 'Novo Registro'} showBack={true} />
        <Card style={styles.card}>
          <Card.Content>
            <PickerField control={control} name="plantId" label="Planta" items={plantOptions} />
            <HelperText type="error" visible={!!errors.plantId}>
              {errors.plantId?.message ?? ''}
            </HelperText>

            <PickerField control={control} name="type" label="Tipo de Cuidado" items={typeOptions} />
            <HelperText type="error" visible={!!errors.type}>
              {errors.type?.message ?? ''}
            </HelperText>

            <DatePickerField control={control} name="date" label="Data do Cuidado" />
            <HelperText type="error" visible={!!errors.date}>
              {errors.date?.message ?? ''}
            </HelperText>

            <FormField control={control} name="notes" label="Observações" multiline numberOfLines={3} />
            <HelperText type="error" visible={!!errors.notes}>
              {errors.notes?.message ?? ''}
            </HelperText>

            <Text style={styles.switchLabel}>Realizado com sucesso</Text>
            <Controller
              control={control}
              name="success"
              render={({ field: { value, onChange } }) => (
                <Switch value={value} onValueChange={onChange} color={theme.colors.primary} />
              )}
            />

            <CustomButton
              onPress={onSubmit}
              label="Salvar"
              mode="contained"
              style={styles.button}
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
              disabled={isSubmitting}
            />

            {id && (
              <CustomButton
                onPress={handleDelete}
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
        message={errorMessage ?? ''}
        onDismiss={() => setErrorMessage(null)}
      />
    </>
  );
}
