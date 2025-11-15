import { Controller } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import theme from '../constants/theme';

interface PickerFieldProps {
  control: any;
  name: string;
  label: string;
  items: { label: string; value: string }[];
  disabled?: boolean;
}

export default function PickerField({ control, name, label, items, disabled = false }: PickerFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, disabled && styles.disabledLabel]}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <RNPickerSelect
              onValueChange={disabled ? () => undefined : onChange}
              value={value || ''}
              items={items}
              style={pickerSelectStyles}
              placeholder={{ label: `Selecione ${label.toLowerCase()}`, value: '' }}
              disabled={disabled}
            />
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </>
        )}
      />
    </View>
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
    fontFamily: theme.fonts.default.fontFamily,
  },
  disabledLabel: {
    opacity: 0.6,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 4,
    fontFamily: theme.fonts.default.fontFamily,
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    color: theme.colors.text,
    fontFamily: theme.fonts.default.fontFamily,
    backgroundColor: theme.colors.background,
  },
  inputAndroid: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    color: theme.colors.text,
    fontFamily: theme.fonts.default.fontFamily,
    backgroundColor: theme.colors.background,
  },
  placeholder: {
    color: theme.colors.text,
    fontFamily: theme.fonts.default.fontFamily,
  },
  disabled: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.onSurfaceVariant,
    opacity: 0.6,
  },
};