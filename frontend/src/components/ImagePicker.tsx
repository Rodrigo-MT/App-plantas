import * as ImagePickerLib from 'expo-image-picker';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Alert, Image, Platform, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import theme from '../constants/theme';

/**
 * 🔹 Converte URI → Base64 de forma segura (sem usar expo-file-system)
 */
async function uriToBase64(uri: string): Promise<string | null> {
  console.log('🔄 Convertendo URI segura:', uri.substring(0, 50) + '...');

  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === 'string') {
          console.log('✅ Conversão via FileReader concluída');
          resolve(reader.result);
        } else {
          reject(new Error('Falha ao ler imagem'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('❌ Erro na conversão segura:', error);
    console.warn('🔄 Fallback: não será enviada imagem (retornando string vazia)');
    // Return null to indicate no valid image was produced instead of returning a file:// URI
    return null;
  }
}

/**
 * 🔹 Obtém tamanho do arquivo (usado apenas no web)
 */
const checkFileSize = async (uri: string): Promise<number> => {
  try {
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      return blob.size;
    }
    return 0;
  } catch {
    return 0;
  }
};

interface ImagePickerProps {
  control: any;
  name: string;
}

export default function ImagePicker({ control, name }: ImagePickerProps) {
  const [converting, setConverting] = useState(false);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * 🔹 Escolher da galeria
   */
  const pickImage = async (onChange: (value: string | null) => void) => {
    try {
      const { status } = await ImagePickerLib.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria.');
        return;
      }

      const result = await ImagePickerLib.launchImageLibraryAsync({
        // Omit mediaTypes (defaults to images) to avoid using deprecated API
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const uri = result.assets[0].uri;
        await processImage(uri, onChange);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  /**
   * 🔹 Tirar foto
   */
  const takePhoto = async (onChange: (value: string | null) => void) => {
    try {
      const { status } = await ImagePickerLib.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera.');
        return;
      }

      const result = await ImagePickerLib.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const uri = result.assets[0].uri;
        await processImage(uri, onChange);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    }
  };

  /**
   * 🔹 Processa e converte imagem
   */
  const processImage = async (uri: string, onChange: (value: string | null) => void) => {
    setConverting(true);
    try {
      console.log('🔄 Processando:', uri);

      // ✅ Evita reconverter base64
      if (uri.startsWith('data:image')) {
        console.log('⚠️ URI já em base64, ignorando conversão.');
        // preview is driven by the controlled form value; no local state needed
        onChange(uri);
        return;
      }

      // Verifica tamanho apenas no web
      const fileSize = await checkFileSize(uri);
      if (Platform.OS === 'web' && fileSize > MAX_FILE_SIZE) {
        Alert.alert('Imagem muito grande', `A imagem tem ${Math.round(fileSize / 1024 / 1024)}MB. Máximo: 5MB.`);
        return;
      }

      const base64Image = await uriToBase64(uri);
      console.log('✅ Base64 pronto para form');
      // preview is driven by the controlled form value; no local state needed
      // If conversion failed we get null — forward null so forms send explicit null to backend
      onChange(base64Image);
    } catch (error) {
      console.error('❌ Erro processando imagem:', error);
      Alert.alert('Erro', 'Não foi possível processar a imagem.');
      // Do not send a raw file:// URI to the backend — clear the field instead.
      onChange(null);
    } finally {
      setConverting(false);
    }
  };

  /**
   * 🔹 Remover imagem
   */
  const removeImage = (onChange: (value: string | null) => void) => {
    // preview is driven by the controlled form value; clear the form field
    onChange(null);
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          {value ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: value }} style={styles.image} />
              <Button
                mode="outlined"
                onPress={() => removeImage(onChange)}
                style={styles.removeButton}
                textColor={theme.colors.error}
                disabled={converting}
              >
                Remover Imagem
              </Button>
            </View>
          ) : null}

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => pickImage(onChange)}
              style={styles.button}
              icon="image"
              disabled={converting}
              loading={converting}
            >
              Galeria
            </Button>
            <Button
              mode="outlined"
              onPress={() => takePhoto(onChange)}
              style={styles.button}
              icon="camera"
              disabled={converting}
              loading={converting}
            >
              Câmera
            </Button>
          </View>

          {error && <Text style={styles.errorText}>{error.message}</Text>}
          {converting && <Text style={styles.convertingText}>Convertendo imagem...</Text>}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  imageContainer: { alignItems: 'center', marginBottom: 16 },
  image: { width: 200, height: 150, borderRadius: 8, marginBottom: 8 },
  removeButton: { borderColor: theme.colors.error },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  button: { flex: 1 },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 4,
    fontFamily: theme.fonts.bodyMedium?.fontFamily || 'System',
  },
  convertingText: {
    fontSize: 12,
    color: theme.colors.primary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
    fontFamily: theme.fonts.bodyMedium?.fontFamily || 'System',
  },
});
