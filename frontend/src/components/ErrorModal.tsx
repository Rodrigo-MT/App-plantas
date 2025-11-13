import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Text as RNText,
} from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useTheme } from '../constants/theme';

interface ErrorModalProps {
  visible: boolean;
  onDismiss: () => void;
  message: string;
  title?: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  onDismiss,
  message,
  title = 'Erro',
}) => {
  const { theme } = useTheme();
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, opacityAnim, scaleAnim]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onDismiss}>
      <TouchableWithoutFeedback onPress={onDismiss}>
        <Animated.View style={[styles.overlay, { opacity: opacityAnim, backgroundColor: theme.colors.surface + 'CC' }]} />
      </TouchableWithoutFeedback>

      <View style={styles.centered}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.colors.surface,
              transform: [{ scale: scaleAnim }],
              borderColor: theme.colors.error,
            },
          ]}
        >
          <Text style={[styles.title, { color: theme.colors.error }]}>{title}</Text>
          <RNText style={[styles.message, { color: theme.colors.text }]}>{message}</RNText>
          <Button
            mode="contained"
            onPress={onDismiss}
            style={[styles.button, { backgroundColor: theme.colors.error }]}
          >
            Fechar
          </Button>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ErrorModal;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
