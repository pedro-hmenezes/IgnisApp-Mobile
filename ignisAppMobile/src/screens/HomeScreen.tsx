import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import OccurrenceCard from './OccurrenceCard';
import { COLORS } from '../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Dados simulados realistas para o teste
const MOCK_DATA = [
  // Esta primeira é a "Nova" que ele vai atender
  {
    id: '2594',
    title: 'Incêndio em Residência',
    status: 'Aberto', // Status que chama atenção
    location: 'Rua do Sol, 142 - Centro',
    time: 'Há 2 min',
    victim: 'Carlos Edu (Idoso acamado)', // Dado extra pro Detalhes
    type: 'Incêndio'
  },
  // Estas são as antigas/outras
  {
    id: '2590',
    title: 'Captura de Animal',
    status: 'Concluída',
    location: 'Av. Boa Viagem, 3000',
    time: '09:30',
    victim: 'Solicitante: Condomínio',
    type: 'Resgate'
  }
];

export default function HomeScreen({ navigation }: any) {

  // Card Especial de "Alerta" para a primeira ocorrência
  const renderItem = ({ item, index }: any) => {
    
    // Se for o primeiro item, damos um destaque especial de "Novo Alerta"
    if (index === 0 && item.status === 'Aberto') {
        return (
            <View style={styles.alertContainer}>
                <View style={styles.alertHeader}>
                    <MaterialCommunityIcons name="radio-tower" size={20} color="#fff" />
                    <Text style={styles.alertTitle}>NOVA OCORRÊNCIA RECEBIDA</Text>
                </View>
                <OccurrenceCard 
                    data={item} 
                    onPress={() => navigation.navigate('Details', { occurrence: item })} 
                />
                <Text style={styles.alertInstruction}>Toque para aceitar e ver detalhes</Text>
            </View>
        );
    }

    // Cards normais
    return (
      <OccurrenceCard 
        data={item} 
        onPress={() => navigation.navigate('Details', { occurrence: item })} 
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        ListHeaderComponent={
            <Text style={styles.listTitle}>Acioanamentos</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10, marginLeft: 5 },
  
  // Estilo do "Container de Alerta"
  alertContainer: {
    backgroundColor: '#D32F2F22', // Fundo vermelho bem clarinho
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D32F2F',
    borderStyle: 'dashed'
  },
  alertHeader: {
    flexDirection: 'row',
    backgroundColor: '#D32F2F',
    padding: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 10,
    alignItems: 'center'
  },
  alertTitle: { color: '#fff', fontWeight: 'bold', fontSize: 12, marginLeft: 5 },
  alertInstruction: { textAlign: 'center', color: '#D32F2F', fontSize: 12, marginTop: 5, fontWeight: 'bold' }
});