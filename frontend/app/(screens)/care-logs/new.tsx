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
import PickerField from '../../../components/PickerField';
import { useTheme } from '../../../constants/theme';
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
  const { theme } = useTheme();

const onSubmit = async (data: any) => {
  try {
    const payload = {
      plantId: data.plantId,
      type: data.type,
      date: data.date instanceof Date ? data.date.toISOString() : data.date,
      notes: data.notes,
      success: data.success,
    };

    await createCareLog(payload);
    router.back();
  } catch (error) {
    console.error('Error creating care log:', error);
    // Aqui também pode mostrar um feedback visual
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Novo Registro" showBack={true} />
      <Card style={styles.card}>
        <Card.Content>
          <PickerField control={control} name="plantId" label="Planta" items={plantOptions} />
          <HelperText type="error" visible={!!errors.plantId}>{errors.plantId?.message}</HelperText>
          <PickerField control={control} name="type" label="Tipo de Cuidado" items={typeOptions} />
          <HelperText type="error" visible={!!errors.type}>{errors.type?.message}</HelperText>
          <DatePickerField control={control} name="date" label="Data do Cuidado" />
          <HelperText type="error" visible={!!errors.date}>{errors.date?.message}</HelperText>
          <FormField control={control} name="notes" label="Observações" multiline numberOfLines={3} />
          <HelperText type="error" visible={!!errors.notes}>{errors.notes?.message}</HelperText>
          <Text style={styles.switchLabel}>Realizado com sucesso</Text>
          <Controller
            control={control}
            name="success"
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