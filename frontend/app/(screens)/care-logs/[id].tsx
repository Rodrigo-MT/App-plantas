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
import { useCareLogs } from '../../../hooks/useCareLogs';
import { usePlants } from '../../../hooks/usePlants';

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

/**
 * Tela para editar ou excluir um registro de cuidado existente.
 */
export default function CareLogDetailScreen() {
  const { id } = useLocalSearchParams();
  const { careLogs, updateCareLog, deleteCareLog } = useCareLogs();
  const { plants } = usePlants();
  const router = useRouter();
  const careLog = careLogs.find((cl) => cl.id === id);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(careLogSchema),
    defaultValues: careLog || {
      plantId: '',
      type: 'watering',
      date: new Date(),
      notes: '',
      success: true,
    },
  });

  useEffect(() => {
    if (careLog) {
      reset(careLog);
    }
  }, [careLog, reset]);

  const onSubmit = async (data: any) => {
    try {
      await updateCareLog({ ...data, id });
      router.back();
    } catch (error) {
      console.error('Error updating care log:', error);
      // TODO: Exibir feedback visual (ex.: SnackBar)
    }
  };

  const onDelete = async () => {
    try {
      await deleteCareLog(id as string);
      router.back();
    } catch (error) {
      console.error('Error deleting care log:', error);
      // TODO: Exibir feedback visual
    }
  };

  if (!careLog) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Registro não encontrado</Text>
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
    { label: '🪴 Transplantar', value: 'repotting' },
    { label: '🧹 Limpar', value: 'cleaning' },
    { label: '📝 Outro', value: 'other' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Editar Registro" showBack={true} />
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