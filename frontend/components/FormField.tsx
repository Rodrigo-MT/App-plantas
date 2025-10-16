import { Controller } from 'react-hook-form';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { useTheme } from '../constants/theme';

interface FormFieldProps {
  control: any;
  name: string;
  label: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
}

export default function FormField({
  control,
  name,
  label,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  secureTextEntry = false,
}: FormFieldProps) {
  const { theme } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      marginBottom: 8,
      color: theme.colors.text, // #333333 (light) ou #FFFFFF (dark)
      fontFamily: theme.fonts.bodyMedium.fontFamily,
    },
    input: {
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      backgroundColor: theme.colors.surface, // #FFFFFF (light) ou #292B2F (dark)
    },
    multilineInput: {
      height: 100,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
    },
  }), [theme]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!error}
            multiline={multiline}
            numberOfLines={numberOfLines}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            mode="outlined"
            outlineColor={theme.colors.primary} // #32c273 (light) ou #7289DA (dark)
            activeOutlineColor={theme.colors.primary} // Consistência com borda
            style={[styles.input, multiline && styles.multilineInput]}
            theme={{ colors: { background: theme.colors.surface } }} // #FFFFFF (light) ou #292B2F (dark)
          />
          {error && <Text style={styles.errorText}>{error.message || ''}</Text>}
        </View>
      )}
    />
  );
}