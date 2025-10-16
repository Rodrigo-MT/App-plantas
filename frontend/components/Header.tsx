import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { useTheme } from '../constants/theme';

interface HeaderProps {
  title: string;
  showBack?: boolean;
}

export default function Header({ title, showBack = false }: HeaderProps) {
  const router = useRouter();
  const { theme } = useTheme();
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

  const styles = useMemo(() => StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.background, // #F5F5F5 (light) ou #202225 (dark)
      borderBottomWidth: 3, // Borda inferior grossa
      borderBottomColor: theme.colors.primary, // #32c273 (light) ou #7289DA (dark)
    },
    title: {
      fontFamily: theme.fonts.titleLarge.fontFamily,
      fontSize: theme.fonts.titleLarge.fontSize,
      fontWeight: theme.fonts.titleLarge.fontWeight,
      color: theme.colors.primary, // #32c273 (light) ou #7289DA (dark)
      flex: 1,
      textAlign: 'center',
    },
  }), [theme]);

  return (
    <View style={styles.header}>
      {showBack && (
        <TouchableOpacity
          onPressIn={animatePressIn}
          onPressOut={animatePressOut}
          onPress={() => router.back()}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Appbar.BackAction color={theme.colors.primary} />
          </Animated.View>
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}