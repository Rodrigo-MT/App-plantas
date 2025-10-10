import { Controller } from 'react-hook-form';
import { View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

interface FormFieldProps {
  control: any;
  name: string;
  label: string;
}

export default function FormField({ control, name, label }: FormFieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={{ marginBottom: 16 }}>
          <TextInput
            label={label}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!error}
          />
          {error && <Text style={{ color: 'red' }}>{error.message}</Text>}
        </View>
      )}
    />
  );
}