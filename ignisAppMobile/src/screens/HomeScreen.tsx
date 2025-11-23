import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import OccurrenceCard from '../screens/OccurrenceCard'; // Importe o componente novo
import { COLORS } from '../constants/themes';

// Dados Fakes para teste visual (MOCK)
const MOCK_DATA = [
  {
    id: '1',
    title: 'Vazamento na Tubulação',
    status: 'Em andamento',
    location: 'Sala 20',
    time: '17:47'
  },
  {
    id: '2',
    title: 'Gatinho na Árvore',
    status: 'Concluída',
    location: 'Rua da Aurora, 120',
    time: '14:30'
  },
  {
    id: '3',
    title: 'Acidente de Carro',
    status: 'Cancelada',
    location: 'Av. Boa Viagem',
    time: '10:00'
  },
];

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_DATA}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        // Renderiza cada item usando nosso componente Card
        renderItem={({ item }) => (
          <OccurrenceCard 
            data={item as any} 
            onPress={() => console.log('Clicou na ocorrência', item.id)} 
          />
        )}
        // Caso a lista esteja vazia (Visual do Template 02)
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhuma Ocorrência em andamento</Text>
            </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Fundo cinza claro para destacar os cards brancos
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50
  },
  emptyText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333'
  }
});