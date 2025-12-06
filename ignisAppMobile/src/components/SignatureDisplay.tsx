import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface SignatureDisplayProps {
  signature: string | null;
  onEdit: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

export const SignatureDisplay: React.FC<SignatureDisplayProps> = ({
  signature,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const handleDelete = () => {
    Alert.alert(
      'Remover assinatura?',
      'Você tem certeza que deseja remover a assinatura coletada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  if (!signature) {
    return (
      <TouchableOpacity
        style={styles.emptyContainer}
        onPress={onEdit}
        disabled={isLoading}
      >
        <MaterialCommunityIcons
          name="draw"
          size={40}
          color={COLORS.primary}
          style={{ marginBottom: 8 }}
        />
        <Text style={styles.emptyText}>Coletar Assinatura</Text>
        <Text style={styles.emptySubtext}>Toque para iniciar</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.signedContainer}>
      <View style={styles.previewHeader}>
        <View style={styles.signedBadge}>
          <MaterialCommunityIcons name="check-circle" size={16} color="white" />
          <Text style={styles.signedLabel}>Assinado</Text>
        </View>
      </View>

      <View style={styles.signatureImageContainer}>
        <Image
          source={{ uri: signature }}
          style={styles.signatureImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={onEdit}
          disabled={isLoading}
        >
          <MaterialCommunityIcons
            name="pencil"
            size={18}
            color={COLORS.primary}
          />
          <Text style={styles.actionButtonText}>Alterar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
          disabled={isLoading}
        >
          <MaterialCommunityIcons name="trash-can" size={18} color="#d32f2f" />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            Remover
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    height: 120,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  signedContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  previewHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'flex-start',
  },
  signedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  signedLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  signatureImageContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  signatureImage: {
    width: '100%',
    height: 80,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  editButton: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: '#f5f5f5',
  },
  deleteButton: {
    borderWidth: 1.5,
    borderColor: '#ffebee',
    backgroundColor: '#fff3e0',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  deleteButtonText: {
    color: '#d32f2f',
  },
});
