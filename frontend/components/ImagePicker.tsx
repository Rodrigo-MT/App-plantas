// components/ImagePicker.tsx
import * as ImagePickerLib from 'expo-image-picker';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Alert, Image, Platform, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import theme from '../constants/theme';

/**
 * URI → Base64 usando APENAS LEGACY API (SEM FileSystem nova)
 */
async function uriToBase64(uri: string): Promise<string> {
  console.log('🔄 Convertendo URI:', uri.substring(0, 50) + '...');
  
  try {
    if (Platform.OS === 'web') {
      console.log('🌐 WEB: usando FileReader');
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log('✅ WEB base64 pronto');
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } 

    // MOBILE: IMPORTA LEGACY DINAMICAMENTE (sem TypeScript errors)
    console.log('📱 MOBILE: importando legacy API');
    const legacyFS = await import('expo-file-system/legacy');
    const base64 = await legacyFS.readAsStringAsync(uri, { encoding: 'base64' });
    
    const extension = uri.split('.').pop()?.toLowerCase();
    const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
    const result = `data:${mimeType};base64,${base64}`;
    
    console.log('✅ MOBILE base64 pronto:', result.substring(0, 50) + '...');
    return result;
    
  } catch (error) {
    console.error('❌ Erro na conversão:', error);
    console.warn('🔄 Fallback: URI original para backend');
    return uri;
  }
}

/**
 * Verifica tamanho do arquivo (simplificado)
 */
const checkFileSize = async (uri: string): Promise<number> => {
  try {
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      return blob.size;
    }
    // Mobile: pula por agora (legacy API pode ser usada aqui também)
    return 0;
  } catch {
    return 0;
  }
};

// ... resto do componente permanece IGUAL ...

interface ImagePickerProps {
  control: any;
  name: string;
}

export default function ImagePicker({ control, name }: ImagePickerProps) {
  const [image, setImage] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const pickImage = async (onChange: (value: string) => void) => {
    try {
      const { status } = await ImagePickerLib.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria.');
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
        await processImage(uri, onChange);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const takePhoto = async (onChange: (value: string) => void) => {
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
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        await processImage(uri, onChange);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    }
  };

  const processImage = async (uri: string, onChange: (value: string) => void) => {
    setConverting(true);
    try {
      console.log('🔄 Processando:', uri);
      
      // Verifica tamanho apenas no web por agora
      const fileSize = await checkFileSize(uri);
      if (Platform.OS === 'web' && fileSize > MAX_FILE_SIZE) {
        Alert.alert('Imagem muito grande', `A imagem tem ${Math.round(fileSize / 1024 / 1024)}MB. Máximo: 5MB.`);
        return;
      }
      
      const base64Image = await uriToBase64(uri);
      console.log('✅ Base64 pronto para form');
      
      setImage(base64Image);
      onChange(base64Image);
    } catch (error) {
      console.error('❌ Erro processando imagem:', error);
      Alert.alert('Erro', 'Não foi possível processar a imagem.');
      onChange(uri); // Fallback
    } finally {
      setConverting(false);
    }
  };

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
                loading={converting}
                disabled={converting}
              >
                {converting ? 'Processando...' : 'Remover Imagem'}
              </Button>
            </View>
          )}
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
    fontFamily: theme.fonts.bodyMedium?.fontFamily || 'System',
  },
  convertingText: { // ← ADICIONADO NO STYLES
    fontSize: 12,
    color: theme.colors.primary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
    fontFamily: theme.fonts.bodyMedium?.fontFamily || 'System',
  },
});