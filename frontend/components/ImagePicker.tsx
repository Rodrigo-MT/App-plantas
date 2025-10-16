// components/ImagePicker.tsx
import * as ImagePickerLib from 'expo-image-picker';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Alert, Image, Platform, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import theme from '../constants/theme';

/**
 * Componente para seleção ou captura de imagens, com limite de 5MB.
 * @param control Controlador do react-hook-form.
 * @param name Nome do campo no formulário.
 */
interface ImagePickerProps {
  control: any;
  name: string;
}

export default function ImagePicker({ control, name }: ImagePickerProps) {
  const [image, setImage] = useState<string | null>(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Verifica o tamanho do arquivo usando fetch (alternativa ao FileSystem depreciado)
   */
  const checkFileSize = async (uri: string): Promise<number> => {
    if (Platform.OS === 'web') {
      // PARA WEB: Usar fetch para obter o tamanho
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        return blob.size;
      } catch (error) {
        console.error('Error checking file size on web:', error);
        return 0;
      }
    } else {
      // PARA MOBILE: Usar a nova API de FileSystem
      try {
        // Tenta usar a nova API primeiro
        const { getInfoAsync } = await import('expo-file-system');
        const fileInfo = await getInfoAsync(uri);
        
        // ✅ CORREÇÃO: Verificar se o arquivo existe e tem tamanho
        if (fileInfo.exists && fileInfo.size !== undefined) {
          return fileInfo.size;
        } else {
          console.warn('File does not exist or size is undefined:', uri);
          return 0;
        }
      } catch (error) {
        console.warn('Error with new FileSystem API, trying legacy:', error);
        try {
          // Fallback para API legada se necessário
          const { getInfoAsync } = await import('expo-file-system/legacy');
          const fileInfo = await getInfoAsync(uri);
          
          // ✅ CORREÇÃO: Verificar se a propriedade size existe
          if ('size' in fileInfo && typeof fileInfo.size === 'number') {
            return fileInfo.size;
          } else {
            console.warn('File size not available in legacy API');
            return 0;
          }
        } catch (legacyError) {
          console.error('Error with legacy FileSystem API:', legacyError);
          return 0;
        }
      }
    }
  };

  /**
   * Seleciona uma imagem da galeria.
   */
  const pickImage = async (onChange: (value: string) => void) => {
    try {
      const { status } = await ImagePickerLib.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para selecionar imagens.', [
          { text: 'OK' },
        ]);
        return;
      }
      const result = await ImagePickerLib.launchImageLibraryAsync({
        mediaTypes: ImagePickerLib.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const fileSize = await checkFileSize(uri);
        
        if (fileSize === 0) {
          console.warn('Could not determine file size, proceeding with upload');
          // Continua mesmo sem saber o tamanho
        } else if (fileSize > MAX_FILE_SIZE) {
          Alert.alert('Imagem muito grande', 'A imagem deve ter no máximo 5MB. Escolha uma menor ou comprima.');
          return;
        }
        
        setImage(uri);
        onChange(uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  /**
   * Captura uma foto com a câmera.
   */
  const takePhoto = async (onChange: (value: string) => void) => {
    try {
      const { status } = await ImagePickerLib.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à sua câmera para tirar fotos.', [
          { text: 'OK' },
        ]);
        return;
      }
      const result = await ImagePickerLib.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const fileSize = await checkFileSize(uri);
        
        if (fileSize === 0) {
          console.warn('Could not determine file size, proceeding with upload');
          // Continua mesmo sem saber o tamanho
        } else if (fileSize > MAX_FILE_SIZE) {
          Alert.alert('Imagem muito grande', 'A imagem deve ter no máximo 5MB.');
          return;
        }
        
        setImage(uri);
        onChange(uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    }
  };

  /**
   * Remove a imagem selecionada.
   */
  const removeImage = (onChange: (value: string) => void) => {
    setImage(null);
    onChange('');
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          {value && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: value }} style={styles.image} />
              <Button
                mode="outlined"
                onPress={() => removeImage(onChange)}
                style={styles.removeButton}
                textColor={theme.colors.error}
              >
                Remover Imagem
              </Button>
            </View>
          )}
          <View style={styles.buttonContainer}>
            <Button mode="contained" onPress={() => pickImage(onChange)} style={styles.button} icon="image">
              Galeria
            </Button>
            <Button mode="outlined" onPress={() => takePhoto(onChange)} style={styles.button} icon="camera">
              Câmera
            </Button>
          </View>
          {error && (
            <Text style={styles.errorText}>
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  removeButton: {
    borderColor: theme.colors.error,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 4,
    fontFamily: theme.fonts.bodyMedium.fontFamily,
  },
});