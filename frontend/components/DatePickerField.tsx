import DateTimePicker from '@react-native-community/datetimepicker';
import { Controller } from 'react-hook-form';
import { StyleSheet, Text } from 'react-native';

interface DatePickerFieldProps {
  control: any;
  name: string;
  label: string;
}

export default function DatePickerField({ control, name, label }: DatePickerFieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <>
          <Text style={styles.label}>{label}</Text>
          <DateTimePicker
            value={value instanceof Date ? value : new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              const currentDate = selectedDate || new Date();
              onChange(currentDate);
            }}
          />
        </>
      )}
    />
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
});