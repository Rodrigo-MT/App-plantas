import * as ImagePickerLib from 'expo-image-picker';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Image, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

interface ImagePickerProps {
  control: any;
  name: string;
}

export default function ImagePicker({ control, name }: ImagePickerProps) {
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async (onChange: (value: string) => void) => {
    const result = await ImagePickerLib.launchImageLibraryAsync({
      mediaTypes: ImagePickerLib.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImage(uri);
      onChange(uri);
    }
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={{ marginBottom: 16 }}>
          {value && <Image source={{ uri: value }} style={{ width: 200, height: 200, marginBottom: 8 }} />}
          <Button mode="contained" onPress={() => pickImage(onChange)}>
            Selecionar Imagem
          </Button>
          {error && <Text style={{ color: 'red' }}>{error.message}</Text>}
        </View>
      )}
    />
  );
}