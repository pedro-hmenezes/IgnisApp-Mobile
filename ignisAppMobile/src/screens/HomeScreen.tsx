import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Alert, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import OccurrenceCard from '../screens/OccurrenceCard';
import { getOccurrences } from '../services/occurrenceService';
import { Occurrence } from '../types/types';
import { COLORS } from '../constants/theme';

export default function HomeScreen({ navigation }: any) {
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [filteredOccurrences, setFilteredOccurrences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');

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

      // Guarda os dados sem inverter ainda (aplicaremos o filtro depois)
      setOccurrences(adaptedData);

    } catch (error) {
      // tratamento de erro
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Função para aplicar filtros e busca
  const applyFilters = useCallback(() => {
    let filtered = [...occurrences];

    // 1. Aplica busca por palavra-chave
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        const title = (item.title || '').toLowerCase();
        const type = (item.type || '').toLowerCase();
        const location = (item.location || '').toLowerCase();
        const status = (item.status || '').toLowerCase();
        
        return title.includes(query) || 
               type.includes(query) || 
               location.includes(query) || 
               status.includes(query);
      });
    }

    // 2. Aplica ordenação
    if (sortOrder === 'recent') {
      filtered.reverse(); // Mais recentes primeiro
    }
    // Se for 'oldest', mantém a ordem original (mais antigas primeiro)

    setFilteredOccurrences(filtered);
  }, [occurrences, searchQuery, sortOrder]);

  // Aplica filtros sempre que mudar occurrences, searchQuery ou sortOrder
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

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
      {/* BARRA DE BUSCA E FILTROS */}
      <View style={styles.filterContainer}>
        {/* Campo de Busca */}
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por natureza, tipo, local..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Botões de Ordenação */}
        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={[styles.sortButton, sortOrder === 'recent' && styles.sortButtonActive]}
            onPress={() => setSortOrder('recent')}
          >
            <MaterialCommunityIcons 
              name="clock-outline" 
              size={18} 
              color={sortOrder === 'recent' ? '#fff' : COLORS.primary} 
            />
            <Text style={[styles.sortButtonText, sortOrder === 'recent' && styles.sortButtonTextActive]}>
              Recentes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortButton, sortOrder === 'oldest' && styles.sortButtonActive]}
            onPress={() => setSortOrder('oldest')}
          >
            <MaterialCommunityIcons 
              name="history" 
              size={18} 
              color={sortOrder === 'oldest' ? '#fff' : COLORS.primary} 
            />
            <Text style={[styles.sortButtonText, sortOrder === 'oldest' && styles.sortButtonTextActive]}>
              Antigas
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LISTA DE OCORRÊNCIAS */}
      <FlatList
        data={filteredOccurrences}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OccurrenceCard 
            data={item} 
            onPress={() => navigation.navigate('Details', { occurrence: item })} 
          />
        )}
        contentContainerStyle={{ padding: 20, paddingTop: 10 }}
        
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }

        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'Nenhum resultado encontrado' : 'Nenhuma ocorrência encontrada'}
                </Text>
                <Text style={styles.emptySubText}>
                  {searchQuery ? 'Tente outra busca' : 'Puxe para baixo para atualizar'}
                </Text>
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
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 10 },
  emptySubText: { fontSize: 14, color: '#999', marginTop: 5 },
  
  // Estilos do filtro
  filterContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  sortButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: '#fff',
    gap: 6,
  },
  sortButtonActive: {
    backgroundColor: COLORS.primary,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  sortButtonTextActive: {
    color: '#fff',
  },
});