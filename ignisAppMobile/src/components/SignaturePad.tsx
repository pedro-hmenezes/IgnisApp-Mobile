import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SignatureScreen from 'react-native-signature-canvas';
import * as ScreenOrientation from 'expo-screen-orientation';
import { COLORS } from '../constants/theme';

interface SignaturePadProps {
  visible: boolean;
  onClose: () => void;
  onSign: (signature: string) => void;
  isLoading?: boolean;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  visible,
  onClose,
  onSign,
  isLoading = false,
}) => {
  const signatureRef = useRef<any>(null);
  const [isSignatureEmpty, setIsSignatureEmpty] = React.useState(true);

  // Controlar orientação quando o modal abre/fecha
  useEffect(() => {
    if (visible) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
  }, [visible]);

  const handleClear = () => {
    signatureRef.current?.clearSignature();
    setIsSignatureEmpty(true);
  };

  const handleConfirm = () => {
    if (isSignatureEmpty) {
      Alert.alert('Assinatura vazia', 'Por favor, assine antes de confirmar.');
      return;
    }
    signatureRef.current?.readSignature();
  };

  const handleSignatureOK = (signatureBase64: string) => {
    onSign(signatureBase64);
    setIsSignatureEmpty(true);
    onClose();
  };

  const handleSignatureEmpty = () => {
    setIsSignatureEmpty(true);
  };

  const handleSignatureStart = () => {
    setIsSignatureEmpty(false);
  };

  const handleClose = async () => {
    if (!isSignatureEmpty) {
      Alert.alert(
        'Descartar assinatura?',
        'Você tem uma assinatura não confirmada. Deseja descartar?',
        [
          { text: 'Continuar', style: 'cancel' },
          {
            text: 'Descartar',
            style: 'destructive',
            onPress: () => {
              handleClear();
              onClose();
            },
          },
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="fade">
      <SafeAreaView style={styles.container}>
        {/* Header Compacto */}
        <View style={styles.header}>
          <Text style={styles.title}>Assinatura</Text>
          <TouchableOpacity
            onPress={handleClose}
            disabled={isLoading}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={isLoading ? '#ccc' : '#333'}
            />
          </TouchableOpacity>
        </View>

        {/* Signature Canvas - Máximo de espaço */}
        <View style={styles.canvasContainer}>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          )}
          <SignatureScreen
            ref={signatureRef}
            onOK={handleSignatureOK}
            onEmpty={handleSignatureEmpty}
            onBegin={handleSignatureStart}
            descriptionText=""
            clearText="Limpar"
            confirmText="Confirmar"
            webStyle={`
              .m-signature-pad--footer {
                display: none;
              }
              .m-signature-pad--body {
                flex: 1;
              }
              .m-signature-pad {
                flex: 1;
                display: flex;
                flex-direction: column;
              }
              canvas {
                width: 100% !important;
                height: 100% !important;
              }
            `}
            imageType="image/png"
          />
        </View>

        {/* Footer com Ações - Compacto */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.buttonSecondary, isLoading && styles.buttonDisabled]}
            onPress={handleClear}
            disabled={isLoading || isSignatureEmpty}
          >
            <MaterialCommunityIcons
              name="delete"
              size={18}
              color={isLoading || isSignatureEmpty ? '#ccc' : COLORS.primary}
            />
            <Text
              style={[
                styles.buttonText,
                isLoading || isSignatureEmpty ? styles.buttonTextDisabled : styles.buttonTextSecondary,
              ]}
            >
              Limpar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buttonPrimary, (isLoading || isSignatureEmpty) && styles.buttonDisabled]}
            onPress={handleConfirm}
            disabled={isLoading || isSignatureEmpty}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="check-circle" size={18} color="#fff" />
                <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
                  Confirmar
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 0,
    padding: 0,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 0,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  footer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  buttonSecondary: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  buttonPrimary: {
    flex: 1.2,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: COLORS.primary,
  },
  buttonTextPrimary: {
    color: '#fff',
  },
  buttonTextDisabled: {
    color: '#ccc',
  },
});
