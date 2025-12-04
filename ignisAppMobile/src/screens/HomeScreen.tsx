import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import OccurrenceCard from '../screens/OccurrenceCard';
import { getOccurrences } from '../services/occurrenceService';
import { Occurrence } from '../types/types';
import { COLORS } from '../constants/theme';

export default function HomeScreen({ navigation }: any) {
  const [occurrences, setOccurrences] = useState<any[]>([]); // Estado dos dados
  const [loading, setLoading] = useState(true); // Spinner inicial
  const [refreshing, setRefreshing] = useState(false); // Spinner de "puxar pra baixo"

  // Função que busca no back-end e adapta para o visual
const fetchData = async () => {
  try {
    const data = await getOccurrences();
    
    // --- O TRUQUE DE PERFORMANCE ---
    // Se tiver muita coisa, pegamos apenas os últimos 30 itens para o teste
    // O backend manda tudo, mas o celular só processa o finalzinho
    const recentData = data.length > 30 ? data.slice(-30) : data;

    const adaptedData = recentData.map((item: Occurrence) => ({
      id: item._id, 
      title: item.tipoOcorrencia, 
      status: item.statusGeral || item.situacaoOcorrencia || 'Aberto',
      location: `${item.endereco.rua}, ${item.endereco.numero} - ${item.endereco.bairro}`, 
      time: new Date(item.timestampRecebimento).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      originalData: item 
    }));

    // Inverte para o mais novo ficar no topo da lista
    setOccurrences(adaptedData.reverse());

  } catch (error) {
    Alert.alert('Erro', 'Não foi possível carregar as ocorrências.');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  // Carrega ao abrir a tela
  useEffect(() => {
    fetchData();
  }, []);

  // Função para quando o usuário arrasta pra baixo
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  // Renderização
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{marginTop: 10, color: '#666'}}>Buscando ocorrências...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={occurrences}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OccurrenceCard 
            data={item} 
            // Passamos os dados reais para a tela de detalhes
            onPress={() => navigation.navigate('Details', { occurrence: item })} 
          />
        )}
        contentContainerStyle={{ padding: 20 }}
        
        // Configuração do "Arrastar para Atualizar"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }

        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhuma ocorrência encontrada.</Text>
                <Text style={styles.emptySubText}>Puxe para baixo para atualizar.</Text>
            </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  emptySubText: { fontSize: 14, color: '#999', marginTop: 5 }
});