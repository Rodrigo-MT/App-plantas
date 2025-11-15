// app/screens/care-logs/CareLogsForm.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import {
  ScrollView,
  StyleSheet,
  View,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Card, HelperText, Switch, Text } from 'react-native-paper';
import { z } from 'zod';

import CustomButton from '../../../src/components/CustomButton';
import DatePickerField from '../../../src/components/DatePickerField';
import FormField from '../../../src/components/FormField';
import Header from '../../../src/components/Header';
import PickerField from '../../../src/components/PickerField';
import ErrorModal from '../../../src/components/ErrorModal';
// ImagePicker intentionally unused in this form; remove import to silence linter

import { useTheme } from '../../../src/constants/theme';
import { useCareLogs } from '../../../src/hooks/useCareLogs';
import { usePlants } from '../../../src/hooks/usePlants';
import { CreateCareLogData, UpdateCareLogData } from '../../../src/types/careLog';

/**
 * Schema de validação para registros de cuidado - AGORA COM PLANTNAME
 */
const careLogSchema = z.object({
  plantName: z.string().min(1, 'Planta é obrigatória'), // ✅ MUDOU: plantId → plantName
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

  const { 
    createCareLog, 
    updateCareLog, 
    deleteCareLog, 
    error, 
    clearError,
    findLogById 
  } = useCareLogs();
  
  const { plants } = usePlants();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const careLog = id ? findLogById(id) : null;
  const isEditing = !!id;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(careLogSchema),
    defaultValues: {
      plantName: '', // ✅ MUDOU: plantId → plantName
      type: 'watering',
      date: new Date(),
      notes: '',
      success: true,
    },
  });

  // Carrega dados para edição
  useEffect(() => {
    if (isEditing) {
      if (careLog) {
        reset({
          plantName: careLog.plantName || '', // ✅ MUDOU: plantId → plantName
          type: careLog.type,
          date: careLog.date instanceof Date ? careLog.date : new Date(careLog.date),
          notes: careLog.notes || '',
          success: careLog.success,
        });
      }
      setLoading(false);
    } else {
      // Reset explícito para limpar qualquer estado residual ao criar novo registro
      reset({
        plantName: '',
        type: 'watering',
        date: new Date(),
        notes: '',
        success: true,
      });
      setLoading(false);
    }
  }, [isEditing, careLog, reset]);

  // Garante limpeza quando volta a focar em modo criação (caso a tela não tenha sido desmontada)
  useFocusEffect(
    useMemo(
      () => () => {
        if (!isEditing) {
          reset({
            plantName: '',
            type: 'watering',
            date: new Date(),
            notes: '',
            success: true,
          });
        }
      },
      [isEditing, reset]
    )
  );

  // ✅ CORREÇÃO: Options agora usam NOMES como valores
  const plantOptions = useMemo(() => 
    plants.map((p) => ({ 
      label: p.name, 
      value: p.name // ✅ MUDOU: p.id → p.name
    })),
    [plants]
  );

  const typeOptions = [
    { label: '💧 Regar', value: 'watering' },
    { label: '🌱 Adubar', value: 'fertilizing' },
    { label: '✂️ Podar', value: 'pruning' },
    { label: '🪴 Transplantar', value: 'repotting' },
    { label: '🧹 Limpar', value: 'cleaning' },
    { label: '☀️ Sol', value: 'sunlight' },
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
          margin: 16,
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
        optionalText: {
          fontSize: 12,
          color: theme.colors.onSurfaceVariant,
          marginBottom: 8,
          fontFamily: theme.fonts.default.fontFamily,
        },
        button: {
          marginTop: 16,
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

  const onSubmit = async (data: FormValues) => {
    try {
      setSubmitting(true);

      // Prepara os dados para a API
      const careLogData: CreateCareLogData | UpdateCareLogData = {
        plantName: data.plantName, // ✅ ENVIA O NOME DIRETAMENTE
        type: data.type,
        date: data.date,
        notes: data.notes || undefined,
        success: data.success,
      };

      if (isEditing) {
        await updateCareLog(id, careLogData);
      } else {
        await createCareLog(careLogData as CreateCareLogData);
      }

      router.back();
    } catch (err: unknown) {
      console.error('❌ Erro ao salvar registro de cuidado:', err);
      // O hook já seta o error state
    } finally {
      setSubmitting(false);
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
              setSubmitting(true);
              await deleteCareLog(id);
              router.back();
            } catch (err: unknown) {
              console.error('❌ Erro ao excluir registro:', err);
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Loading durante carregamento inicial
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>
          {isEditing ? 'Carregando registro...' : 'Preparando formulário...'}
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Header title={isEditing ? 'Editar Registro' : 'Novo Registro'} showBack={true} />
        
        <Card style={styles.card}>
          <Card.Content>
            {/* Planta - AGORA COM NOMES */}
            <PickerField 
              control={control} 
              name="plantName" // ✅ MUDOU: plantId → plantName
              label="Planta *" 
              items={plantOptions}
              disabled={isEditing} // chave composta - não alterar na edição
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
              disabled={isEditing}
            />
            <HelperText type="error" visible={!!errors.type} style={styles.helperText}>
              {errors.type?.message ?? ''}
            </HelperText>

            {/* Data do Cuidado */}
            <DatePickerField 
              control={control} 
              name="date" 
              label="Data do Cuidado *" 
              disabled={isEditing}
            />
            <HelperText type="error" visible={!!errors.date} style={styles.helperText}>
              {errors.date?.message ?? ''}
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

            {/* Realizado com sucesso */}
            <Text style={styles.switchLabel}>Realizado com sucesso</Text>
            <Controller
              control={control}
              name="success"
              render={({ field: { value, onChange } }) => (
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
              label={isEditing ? 'Salvar Alterações' : 'Criar Registro'}
              mode="contained"
              style={styles.button}
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
              disabled={submitting || (isEditing && !isDirty)}
            />

            {/* Botão Excluir (apenas edição) */}
            {isEditing && (
              <CustomButton
                onPress={handleDelete}
                label="Excluir Registro"
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

      <ErrorModal visible={!!error} message={error ?? ''} onDismiss={clearError} />
    </>
  );
}