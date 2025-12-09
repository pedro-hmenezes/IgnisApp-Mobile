import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme'; 

interface OccurrenceCardProps {
  data: {
    id: string;
    title: string; // Agora será a Natureza (ex: Fogo em residência)
    type: string;  // Novo campo: Tipo (ex: Incêndio)
    status: string;
    location: string;
    time: string;
  };
  onPress: () => void;
}

export default function OccurrenceCard({ data, onPress }: OccurrenceCardProps) {
  
  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('andamento')) return '#D32F2F'; 
    if (s.includes('pendente') || s.includes('aberto')) return '#F57C00'; 
    if (s.includes('finalizada') || s.includes('concluída')) return '#388E3C'; 
    if (s.includes('cancelada')) return '#9E9E9E'; 
    return COLORS.primary; 
  };

  const statusColor = getStatusColor(data.status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Tarja Lateral */}
      <View style={[styles.colorStrip, { backgroundColor: statusColor }]} />

      <View style={styles.contentContainer}>
        {/* Cabeçalho: ID e Hora */}
        <View style={styles.header}>
          <Text style={[styles.idText, { color: statusColor }]}>
            #{data.id.slice(-4).toUpperCase()}
          </Text>
          <View style={styles.timeBadge}>
            <MaterialCommunityIcons name="clock-outline" size={12} color="#666" />
            <Text style={styles.timeText}>{data.time}</Text>
          </View>
        </View>

        {/* --- NOVIDADE: Badge do TIPO da Ocorrência --- */}
        <View style={styles.typeBadgeContainer}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{data.type?.toUpperCase() || 'OCORRÊNCIA'}</Text>
          </View>
        </View>

        {/* Título (Agora mostra a Natureza, que é mais descritiva) */}
        <Text style={styles.title} numberOfLines={2}>
          {data.title}
        </Text>
        
        {/* Localização */}
        <View style={styles.row}>
          <MaterialCommunityIcons name="map-marker" size={14} color="#888" />
          <Text style={styles.location} numberOfLines={1}>
            {data.location}
          </Text>
        </View>

        {/* Rodapé: Status */}
        <View style={styles.footer}>
           <Text style={[styles.statusTextFooter, { color: statusColor }]}>
             {data.status.toUpperCase()}
           </Text>
           <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  colorStrip: { width: 6, height: '100%' },
  contentContainer: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  idText: { fontWeight: 'bold', fontSize: 12 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  timeText: { fontSize: 10, color: '#666', marginLeft: 4 },
  
  // Estilos novos do Tipo
  typeBadgeContainer: { flexDirection: 'row', marginBottom: 6 },
  typeBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  typeText: { fontSize: 10, fontWeight: 'bold', color: '#1565C0' },

  title: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  location: { fontSize: 13, color: '#666', marginLeft: 4, flex: 1 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 8 },
  statusTextFooter: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
});