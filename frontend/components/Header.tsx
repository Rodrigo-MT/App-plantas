import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { Appbar } from 'react-native-paper';
import theme from '../constants/theme';

/**
 * Componente de cabeçalho com título e botão de voltar animado (opcional).
 * @param title Título exibido no cabeçalho.
 * @param showBack Indica se o botão de voltar deve ser exibido.
 */
interface HeaderProps {
  title: string;
  showBack?: boolean;
}

export default function Header({ title, showBack = false }: HeaderProps) {
  const router = useRouter();
  const [scale] = useState(new Animated.Value(1));

  const animatePressIn = () => {
    Animated.timing(scale, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const animatePressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Appbar.Header style={styles.header}>
      {showBack && (
        <TouchableOpacity 
          onPressIn={animatePressIn} 
          onPressOut={animatePressOut} 
          onPress={() => router.back()}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Appbar.BackAction color={theme.colors.onPrimary} />
          </Animated.View>
        </TouchableOpacity>
      )}
      <Appbar.Content 
        title={title} 
        titleStyle={styles.title}
        // ✅ Adicionar esta prop para garantir compatibilidade
        color={theme.colors.onPrimary}
      />
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.primary,
  },
  title: {
    color: theme.colors.onPrimary,
    // ✅ USAR AS VARIANTES CORRETAS
    fontFamily: theme.fonts.titleLarge.fontFamily,
    fontSize: theme.fonts.titleLarge.fontSize,
    fontWeight: theme.fonts.titleLarge.fontWeight,
  },
});