import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const ALERTS = [
  {
    id: '1',
    title: 'Nova Ocorrência Atribuída',
    message: 'Incêndio em Residência - Rua do Sol. Deslocamento imediato solicitado.',
    time: 'Há 2 min',
    type: 'urgent', // Urgent = Vermelho
    read: false
  },
  {
    id: '2',
    title: 'Alerta Meteorológico',
    message: 'Defesa Civil alerta para chuvas fortes na RMR nas próximas 4 horas.',
    time: 'Há 1 hora',
    type: 'warning', // Warning = Laranja
    read: true
  },
  {
    id: '3',
    title: 'Manutenção de Viatura',
    message: 'A Viatura ABT-45 deve retornar à base para troca de óleo até as 18h.',
    time: 'Há 3 horas',
    type: 'info', // Info = Azul
    read: true
  },
  {
    id: '4',
    title: 'Troca de Turno',
    message: 'Lembrete: O preenchimento do relatório de passagem de serviço é obrigatório.',
    time: 'Ontem',
    type: 'info',
    read: true
  },
];

export default function AlertsScreen() {

  const renderItem = ({ item }: any) => {
    // Define a cor e o ícone baseados no tipo
    let iconName = 'bell-outline';
    let color = '#666';
    let bgColor = '#fff';

    if (item.type === 'urgent') {
      iconName = 'fire-alert';
      color = '#D32F2F';
      bgColor = '#FFEBEE'; // Fundo avermelhado leve
    } else if (item.type === 'warning') {
      iconName = 'weather-lightning-rainy';
      color = '#F57C00';
    } else {
      iconName = 'information-outline';
      color = '#1976D2';
    }

    return (
      <TouchableOpacity style={[styles.card, !item.read && styles.unreadCard]}>
        <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
          <MaterialCommunityIcons name={iconName as any} size={24} color={color} />
        </View>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, !item.read && styles.unreadText]}>{item.title}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
        </View>
        {!item.read && <View style={styles.dot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Central de Notificações</Text>
      <FlatList
        data={ALERTS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#333', margin: 20, marginBottom: 5 },
  
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    // Sombra
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 }
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary
  },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginRight: 15
  },
  content: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontSize: 15, color: '#333', fontWeight: '500' },
  unreadText: { fontWeight: 'bold', color: '#000' },
  time: { fontSize: 12, color: '#999' },
  message: { fontSize: 13, color: '#666', lineHeight: 18 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginLeft: 5 }
});