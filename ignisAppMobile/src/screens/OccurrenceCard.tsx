import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

// Definindo o que o card precisa receber de dados
interface OccurrenceCardProps {
  data: {
    id: string;
    title: string;
    status: 'Aberto' | 'Em andamento' | 'Concluída' | 'Cancelada';
    location: string;
    time: string;
  };
  onPress: () => void;
}

export default function OccurrenceCard({ data, onPress }: OccurrenceCardProps) {
  
  // Função simples para escolher a cor do status
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Aberto': return '#D32F2F'; // Vermelho
      case 'Em andamento': return '#FBC02D'; // Amarelo
      case 'Concluída': return '#388E3C'; // Verde
      default: return '#999'; // Cinza
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title}>{data.title}</Text>
        {/* Ícone de status visual */}
        <MaterialCommunityIcons name="circle" size={12} color={getStatusColor(data.status)} />
      </View>
      
      <Text style={[styles.statusText, { color: getStatusColor(data.status) }]}>
        {data.status}
      </Text>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Local: </Text>
        <Text style={styles.info}>{data.location}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Enviado: </Text>
        <Text style={styles.info}>{data.time}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // Sombra estilo iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Sombra estilo Android
    elevation: 3,
    borderLeftWidth: 4, // Um detalhe visual bonito na esquerda
    borderLeftColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  info: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});