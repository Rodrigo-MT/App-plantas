import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, HelperText } from 'react-native-paper';
import theme from '../constants/theme';

/**
 * Campo de seleção de data integrado com react-hook-form, com validação de datas futuras e botões para iOS.
 * @param control Controlador do react-hook-form.
 * @param name Nome do campo no formulário.
 * @param label Rótulo do campo.
 */
interface DatePickerFieldProps {
  control: any;
  name: string;
  label: string;
}

export default function DatePickerField({ control, name, label }: DatePickerFieldProps) {
  const [show, setShow] = useState(false);

  /**
   * Valida se a data selecionada não é futura.
   * @param selectedDate Data a ser validada.
   * @returns True se a data é válida (não futura), false caso contrário.
   */
  const validateDate = (selectedDate: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    if (selected > today) {
      Alert.alert('Data inválida', 'A data de compra não pode ser no futuro. Por favor, selecione uma data válida.', [
        { text: 'OK' },
      ]);
      return false;
    }
    return true;
  };

  /**
   * Lida com a mudança de data no picker.
   * @param event Evento do DateTimePicker.
   * @param selectedDate Data selecionada.
   * @param onChange Função do react-hook-form para atualizar o valor.
   */
  const handleDateChange = (event: any, selectedDate: Date | undefined, onChange: (date: Date) => void) => {
    setShow(Platform.OS === 'ios');
    if (event.type === 'set' && selectedDate) {
      if (validateDate(selectedDate)) {
        onChange(selectedDate);
      }
    }
    if (Platform.OS === 'android') {
      setShow(false);
    }
  };

  /**
   * Lida com a mudança de data na web.
   * @param event Evento do input date.
   * @param onChange Função do react-hook-form para atualizar o valor.
   */
  const handleWebDateChange = (event: React.ChangeEvent<HTMLInputElement>, onChange: (date: Date) => void) => {
    const selectedDate = new Date(event.target.value);
    if (validateDate(selectedDate)) {
      onChange(selectedDate);
    }
  };

  /**
   * Exibe o picker de data.
   */
  const showDatepicker = () => {
    setShow(true);
  };

  /**
   * Formata a data para exibição.
   * @param value Valor do campo (Date ou string).
   * @returns String formatada para exibição.
   */
  const getDisplayDate = (value: any): string => {
    if (value instanceof Date) {
      return value.toLocaleDateString('pt-BR');
    }
    if (typeof value === 'string' && value) {
      return new Date(value).toLocaleDateString('pt-BR');
    }
    return 'Selecionar data';
  };

  /**
   * Converte a data para formato YYYY-MM-DD (para input type="date")
   */
  const getInputDateValue = (value: any): string => {
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    if (typeof value === 'string' && value) {
      return new Date(value).toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <Text style={styles.label}>{label}</Text>
          
          {Platform.OS === 'web' ? (
            // ✅ PARA WEB: Usar input type="date" nativo
            <View>
              <input
                type="date"
                value={getInputDateValue(value)}
                onChange={(e) => handleWebDateChange(e, onChange)}
                style={{
                  padding: '12px',
                  border: `1px solid ${error ? theme.colors.error : theme.colors.primary}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  width: '100%',
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  fontFamily: theme.fonts.bodyMedium.fontFamily,
                }}
                max={new Date().toISOString().split('T')[0]} // Não permite datas futuras
              />
            </View>
          ) : (
            // ✅ PARA MOBILE: Usar DateTimePicker normal
            <>
              <TouchableOpacity onPress={showDatepicker} style={styles.dateDisplay}>
                <Text style={styles.dateText}>{getDisplayDate(value)}</Text>
                <Button mode="outlined" onPress={showDatepicker} style={styles.button} icon="calendar">
                  Selecionar
                </Button>
              </TouchableOpacity>
              
              {show && (
                <DateTimePicker
                  value={value instanceof Date ? value : typeof value === 'string' && value ? new Date(value) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => handleDateChange(event, selectedDate, onChange)}
                  maximumDate={new Date()}
                  style={styles.datePicker}
                />
              )}
              
              {show && Platform.OS === 'ios' && (
                <View style={styles.iosButtons}>
                  <Button mode="contained" onPress={() => setShow(false)} style={styles.iosButton}>
                    Confirmar
                  </Button>
                  <Button mode="outlined" onPress={() => setShow(false)} style={styles.iosButton}>
                    Cancelar
                  </Button>
                </View>
              )}
            </>
          )}
          
          <HelperText type="error" visible={!!error}>
            {error?.message || ''}
          </HelperText>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: theme.colors.text,
    fontFamily: theme.fonts.labelMedium.fontFamily,
    fontWeight: theme.fonts.labelMedium.fontWeight,
  },
  dateDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
  },
  dateText: {
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyMedium.fontFamily,
    fontWeight: theme.fonts.bodyMedium.fontWeight,
    flex: 1,
  },
  button: {
    marginLeft: 12,
  },
  datePicker: {
    marginTop: 8,
  },
  iosButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  iosButton: {
    flex: 1,
  },
});