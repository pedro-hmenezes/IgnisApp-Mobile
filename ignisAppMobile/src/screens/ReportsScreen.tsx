import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import OccurrenceCard from './OccurrenceCard';
import { COLORS } from '../constants/theme';

// Dados Históricos Mockados
const HISTORY_DATA = [
  {
    id: '2580',
    title: 'Resgate de Animal (Gato)',
    status: 'Concluída',
    location: 'Rua da Aurora, 500',
    time: 'Ontem, 14:30',
    type: 'Resgate'
  },
  {
    id: '2575',
    title: 'Princípio de Incêndio',
    status: 'Concluída',
    location: 'Shopping RioMar (Praça de Alimentação)',
    time: '20/11/2025',
    type: 'Incêndio'
  },
  {
    id: '2572',
    title: 'Vazamento de Gás',
    status: 'Cancelada', // Aqui mostramos o caso de cancelamento
    location: 'Av. Caxangá, 2020',
    time: '19/11/2025',
    type: 'Perigo'
  },
  {
    id: '2560',
    title: 'Colisão Moto x Carro',
    status: 'Concluída',
    location: 'Av. Norte, Cruzamento',
    time: '18/11/2025',
    type: 'Acidente'
  }
];

export default function ReportsScreen({ navigation }: any) {
  const [searchText, setSearchText] = useState('');

  return (
    <View style={styles.container}>
      {/* Barra de Busca (Visual apenas) */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={24} color="#666" style={{ marginRight: 10 }} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Buscar por ID, data ou tipo..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.statsText}>Total: 45</Text>
        <Text style={styles.statsText}>Canceladas: 3</Text>
      </View>

      <FlatList
        data={HISTORY_DATA}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingTop: 0 }}
        renderItem={({ item }) => (
          // Reutilizamos o Card, mas desabilitamos o clique (ou poderíamos abrir um "Detalhes Read-Only")
          <View style={{ opacity: item.status === 'Cancelada' ? 0.7 : 1 }}>
             <OccurrenceCard 
              data={item as any} 
              onPress={() => {}} // Sem ação de clique por enquanto
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2
  },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    marginBottom: 15
  },
  statsText: { fontSize: 14, fontWeight: 'bold', color: '#666' }
});