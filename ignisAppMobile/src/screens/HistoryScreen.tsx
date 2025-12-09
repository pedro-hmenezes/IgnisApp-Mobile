import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, RefreshControl } from 'react-native';
import OccurrenceCard from '../screens/OccurrenceCard'; // Reutiliza o mesmo card bonito!
import { getOccurrences } from '../services/occurrenceService';
import { Occurrence } from '../types/types';
import { COLORS } from '../constants/theme';

export default function HistoryScreen({ navigation }: any) {
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const data = await getOccurrences();
      
      // FILTRO INVERTIDO: Só finalizadas ou canceladas
      const historyData = data.filter((item: any) => {
         const status = (item.statusGeral || item.situacaoOcorrencia || '').toLowerCase();
         return status === 'finalizada' || status === 'cancelada';
      });

      // Pega as últimas 50 do histórico
      const recentHistory = historyData.slice(-50); 

      const adaptedData = recentHistory.map((item: Occurrence) => ({
        id: item._id, 
        title: item.naturezaInicial || item.tipoOcorrencia,
        type: item.tipoOcorrencia,
        status: item.statusGeral || item.situacaoOcorrencia,
        location: `${item.endereco?.bairro || 'Local'} - ${item.endereco?.municipio || 'PE'}`, 
        time: new Date(item.timestampRecebimento).toLocaleDateString('pt-BR'), // Aqui mostra a DATA, não hora
        originalData: item 
      }));

      setOccurrences(adaptedData.reverse());

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={occurrences}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OccurrenceCard 
            data={item} 
            onPress={() => navigation.navigate('Details', { occurrence: item })} 
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListEmptyComponent={
            <View style={{marginTop: 50, alignItems: 'center'}}>
                <Text style={{color: '#999'}}>Nenhum histórico disponível.</Text>
            </View>
        }
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
});