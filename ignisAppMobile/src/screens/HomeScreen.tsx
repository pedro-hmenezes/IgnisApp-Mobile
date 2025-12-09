import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import OccurrenceCard from '../screens/OccurrenceCard';
import { getOccurrences } from '../services/occurrenceService';
import { Occurrence } from '../types/types';
import { COLORS } from '../constants/theme';

export default function HomeScreen({ navigation }: any) {
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const data = await getOccurrences();
      
      // 1. FILTRA (Só ativas)
      const activeData = data.filter((item: any) => {
         const status = (item.statusGeral || item.situacaoOcorrencia || '').toLowerCase();
         return status !== 'finalizada' && status !== 'cancelada';
      });

      // 2. LIMITA A 20 ITENS
      // Pegamos os últimos 20 (slice -20) pois geralmente o banco devolve os antigos primeiro
      const recentData = activeData.slice(-20);

      // 3. ADAPTA (Mapeamento atualizado)
      const adaptedData = recentData.map((item: Occurrence) => ({
        id: item._id, 
        
        // MUDANÇA: Título agora é a Natureza (descrição), se não tiver usa o Tipo
        title: item.naturezaInicial || item.tipoOcorrencia, 
        
        // NOVO: Campo Tipo separado
        type: item.tipoOcorrencia,

        status: item.statusGeral || item.situacaoOcorrencia || 'Aberto',
        location: `${item.endereco?.rua || 'Rua não inf.'}, ${item.endereco?.numero || 'S/N'}`, 
        time: item.timestampRecebimento ? new Date(item.timestampRecebimento).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : '--:--',
        originalData: item 
      }));

      // Inverte para exibir a mais recente no topo
      setOccurrences(adaptedData.reverse());

    } catch (error) {
      // tratamento de erro
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