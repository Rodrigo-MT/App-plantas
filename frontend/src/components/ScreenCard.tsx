import { Image } from 'expo-image';
import React, { useMemo, useRef } from 'react';
import { View, StyleSheet, Platform, Animated, TouchableOpacity } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useTheme } from '../constants/theme';

export interface ScreenCardProps {
  image?: string | null;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  secondLine?: React.ReactNode;
  description?: string | React.ReactNode;
  badges?: string[];
  onPress?: () => void;
  width?: number | string;
  // optional refresh key from parent screens to force image remount when needed
  refreshKey?: number;
}

export default function ScreenCard({ image, title, subtitle, secondLine, description, badges, onPress, width, refreshKey }: ScreenCardProps) {
  const { theme } = useTheme();

  // press animation (substitutes small wrappers like PlantCard)
  const scale = useRef(new Animated.Value(1)).current;
  const animatePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const animatePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const hasValidPhoto = useMemo(() => {
    if (!image) return false;
    try {
      return (
        image.startsWith('data:image') ||
        image.startsWith('http') ||
        image.startsWith('https') ||
        image.startsWith('file:')
      );
    } catch {
      return false;
    }
  }, [image]);

  const placeholderUri = 'https://via.placeholder.com/400x200/32c273/ffffff?text=%F0%9F%8C%B1+Item';

  const styles = StyleSheet.create({
    cardContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      elevation: 4,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: 150,
      backgroundColor: theme.colors.surfaceVariant,
    },
    content: { padding: 16 },
    title: {
      fontSize: 18,
      fontFamily: theme.fonts.titleMedium.fontFamily,
      fontWeight: '600' as const,
      color: theme.colors.primary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 4,
      lineHeight: 20,
    },
    description: {
      fontSize: 14,
      fontFamily: theme.fonts.bodyMedium.fontFamily,
      color: theme.colors.onSurfaceVariant,
      marginTop: 8,
      fontStyle: 'italic',
      lineHeight: 18,
    },
    badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
    badge: { backgroundColor: theme.colors.primaryContainer, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 8, marginBottom: 4 },
    badgeText: { fontSize: 12, fontFamily: theme.fonts.labelSmall.fontFamily, color: theme.colors.onPrimaryContainer },
  });

  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 12 }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={animatePressIn}
        onPressOut={animatePressOut}
        onPress={onPress}
      >
        <Card style={[styles.cardContainer, width ? { width: typeof width === 'number' ? width : undefined } : {} ]}>
          {hasValidPhoto ? (
            // key the Image with the image uri so it remounts when uri changes
            <Image key={String(image)} source={{ uri: image as string }} style={styles.image} contentFit="cover" transition={200} />
          ) : (
            // when there's no image, include refreshKey in key so removing an image forces remount
            <Image key={`placeholder-${refreshKey ?? 'nof'}`} source={{ uri: placeholderUri }} style={styles.image} contentFit="cover" transition={200} />
          )}
          <Card.Content style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
            {secondLine ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {secondLine}
              </Text>
            ) : null}
            {description ? (
              <Text style={styles.description} numberOfLines={2}>
                {description}
              </Text>
            ) : null}

            {badges && badges.length > 0 && (
              <View style={styles.badgeContainer}>
                {badges.map((b) => (
                  <View key={b} style={styles.badge}>
                    <Text style={styles.badgeText}>{b}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
}
