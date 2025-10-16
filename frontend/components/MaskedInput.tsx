import { Controller } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { MaskedTextInput } from 'react-native-mask-text';
import { Text, TextInput } from 'react-native-paper';
import theme from '../constants/theme';

/**
 * Campo de entrada mascarada integrado com react-hook-form.
 * @param control Controlador do react-hook-form.
 * @param name Nome do campo no formulário.
 * @param label Rótulo do campo.
 * @param mask Máscara para formatação do texto (ex.: '999.999.999-99').
 */
interface MaskedInputProps {
  control: any;
  name: string;
  label: string;
  mask: string;
}

export default function MaskedInput({ control, name, label, mask }: MaskedInputProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <TextInput
            label={label}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={!!error}
            mode="outlined"
            outlineColor={theme.colors.primary}
            activeOutlineColor={theme.colors.secondary}
            render={(props) => (
              <MaskedTextInput
                {...props}
                mask={mask}
                onChangeText={(text, rawText) => {
                  onChange(text);
                }}
                style={styles.input}
              />
            )}
            theme={{ colors: { background: theme.colors.background } }}
          />
          {error && <Text style={styles.errorText}>{error.message}</Text>}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    fontFamily: theme.fonts.default.fontFamily,
    fontSize: 16,
    color: theme.colors.text,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 4,
    fontFamily: theme.fonts.default.fontFamily,
  },
});