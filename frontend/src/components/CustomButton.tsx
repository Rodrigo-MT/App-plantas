import { useState, useMemo } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useTheme } from '../constants/theme';

/**
 * Botão customizado com animações de escala e hover (para web), integrado com o tema do aplicativo.
 * @param label Texto do botão.
 * @param onPress Função chamada ao pressionar o botão.
 * @param mode Modo do botão ('contained' ou 'outlined').
 * @param disabled Indica se o botão está desabilitado.
 * @param icon Ícone opcional (nome do ícone do @expo/vector-icons).
 * @param style Estilo adicional para o botão.
 * @param onMouseEnter Função chamada ao passar o mouse (web).
 * @param onMouseLeave Função chamada ao sair o mouse (web).
 * @param buttonColor Cor de fundo personalizada (sobrescreve tema).
 * @param textColor Cor do texto personalizada (sobrescreve tema).
 */
interface CustomButtonProps extends TouchableOpacityProps {
  label: string;
  onPress: () => void;
  mode?: 'contained' | 'outlined';
  disabled?: boolean;
  icon?: string;
  style?: any;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  buttonColor?: string;
  textColor?: string;
}

export default function CustomButton({
  label,
  onPress,
  mode = 'contained',
  disabled = false,
  icon,
  style,
  onMouseEnter,
  onMouseLeave,
  buttonColor,
  textColor,
  ...props
}: CustomButtonProps) {
  const { theme } = useTheme(); // ✅ Tema dinâmico
  const [scale] = useState(new Animated.Value(1));
  const [backgroundColor] = useState(new Animated.Value(0));
  const [isHovered, setIsHovered] = useState(false);

  const handlePressIn = () => {
    if (!disabled) {
      Animated.spring(scale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleMouseEnter = () => {
    if (!disabled) {
      setIsHovered(true);
      Animated.timing(backgroundColor, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
      onMouseEnter?.();
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setIsHovered(false);
      Animated.timing(backgroundColor, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      onMouseLeave?.();
    }
  };

  // ✅ Estilos dinâmicos com useMemo
  const styles = useMemo(() => StyleSheet.create({
    button: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
      marginVertical: 8,
      flexDirection: 'row',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    contained: {
      backgroundColor: buttonColor || theme.colors.primary, // Verde #32c273 (light) ou #7289DA (dark)
    },
    outlined: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: buttonColor || theme.colors.primary,
    },
    label: {
      fontSize: 14,
      fontFamily: theme.fonts.labelMedium.fontFamily,
      fontWeight: theme.fonts.labelMedium.fontWeight,
    },
    containedLabel: {
      color: textColor || theme.colors.onPrimary, // Branco sobre verde/azul
    },
    outlinedLabel: {
      color: textColor || theme.colors.primary, // Verde #32c273 (light) ou #7289DA (dark)
    },
    disabled: {
      backgroundColor: theme.colors.background,
      opacity: 0.5,
    },
    disabledLabel: {
      color: theme.colors.onSurfaceVariant, // #666666 (light) ou #DBDBDB (dark)
    },
    icon: {
      fontFamily: 'MaterialIcons',
      fontSize: 18,
      marginRight: 8,
      color: textColor || (mode === 'contained' ? theme.colors.onPrimary : theme.colors.primary),
    },
  }), [theme, buttonColor, textColor, mode]);

  // Animação de fundo
  const buttonBackground = backgroundColor.interpolate({
    inputRange: [0, 1],
    outputRange: [
      buttonColor || (mode === 'contained' ? theme.colors.primary : theme.colors.background),
      buttonColor || (mode === 'contained' ? theme.colors.accent : theme.colors.surfaceVariant),
    ],
  });

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.9}
      {...Platform.select({
        web: {
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
        },
        default: {},
      })}
      {...props}
    >
      <Animated.View
        style={[
          styles.button,
          mode === 'contained' ? styles.contained : styles.outlined,
          { transform: [{ scale }], backgroundColor: buttonBackground },
          disabled && styles.disabled,
          style,
        ]}
      >
        {icon && (
          <Text style={[styles.icon, textColor && { color: textColor }]}>
            {icon}
          </Text>
        )}
        <Text
          style={[
            styles.label,
            mode === 'contained' ? styles.containedLabel : styles.outlinedLabel,
            disabled && styles.disabledLabel,
            textColor && { color: textColor },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}