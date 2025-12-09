import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS } from '../constants/theme';
import { getOccurrences } from '../services/occurrenceService';

export default function MapScreen({ navigation }: any) {
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [region, setRegion] = useState({
    latitude: -8.0631,
    longitude: -34.8711,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  });
  const [filter, setFilter] = useState<'all' | 'active' | 'finalized'>('active');

  // Buscar localização do usuário
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let location = await Location.getCurrentPositionAsync({});
          const userCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setUserLocation(userCoords);
          setRegion({
            ...userCoords,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      } catch (error) {
        console.log('Erro ao obter localização:', error);
      }
    })();
  }, []);

  // Buscar ocorrências do servidor (com cache)
  const [allOccurrences, setAllOccurrences] = useState<any[]>([]);
  
  useEffect(() => {
    fetchOccurrences();
  }, []);

  // Aplica filtro local (muito mais rápido)
  useEffect(() => {
    applyFilter();
  }, [filter, allOccurrences]);

  const fetchOccurrences = async () => {
    try {
      setLoading(true);
      const data = await getOccurrences();
      
      console.log('📍 Total de ocorrências:', data.length);
      
      // Filtra ocorrências que têm coordenadas (pode estar em endereco ou nos campos raiz)
      const withCoords = data.filter((item: any) => {
        // Tenta pegar coordenadas de diferentes lugares
        const lat = item.endereco?.latitude || item.latitudeInicial || item.latitude;
        const lng = item.endereco?.longitude || item.longitudeInicial || item.longitude;
        
        const hasCoords = lat && lng;
        const isValid = hasCoords && !isNaN(Number(lat)) && !isNaN(Number(lng));
        
        // Se tem coordenadas válidas, normaliza para o objeto
        if (isValid) {
          if (!item.endereco) item.endereco = {};
          item.endereco.latitude = Number(lat);
          item.endereco.longitude = Number(lng);
        }
        
        return isValid;
      });

      console.log('📍 Ocorrências com coordenadas:', withCoords.length);
      if (withCoords.length > 0) {
        console.log('📍 Exemplo:', {
          id: withCoords[0]._id,
          lat: withCoords[0].endereco.latitude,
          lng: withCoords[0].endereco.longitude,
          tipo: withCoords[0].tipoOcorrencia
        });
      } else {
        console.warn('⚠️ Nenhuma ocorrência tem coordenadas GPS no banco de dados.');
      }

      setAllOccurrences(withCoords);
    } catch (error) {
      console.error('❌ Erro ao buscar ocorrências:', error);
      Alert.alert('Erro', 'Não foi possível carregar as ocorrências no mapa.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...allOccurrences];

    if (filter === 'active') {
      filtered = filtered.filter((item: any) => {
        const status = (item.statusGeral || '').toLowerCase();
        return status !== 'finalizada' && status !== 'cancelada';
      });
    } else if (filter === 'finalized') {
      filtered = filtered.filter((item: any) => {
        const status = (item.statusGeral || '').toLowerCase();
        return status === 'finalizada';
      });
    }

    console.log(`🔍 Filtro "${filter}" aplicado: ${filtered.length} ocorrências`);

    // Limita a 100 marcadores no mapa para performance
    const limited = filtered.slice(0, 100);
    console.log(`📌 Exibindo ${limited.length} marcadores no mapa`);
    setOccurrences(limited);
  };

  // Memoização para evitar recalcular cores a cada render
  const getMarkerColor = React.useCallback((occurrence: any) => {
    const status = (occurrence.statusGeral || '').toLowerCase();
    
    if (status === 'finalizada') return '#757575';
    if (status === 'cancelada') return '#9E9E9E';
    
    const tipo = (occurrence.tipoOcorrencia || '').toLowerCase();
    if (tipo.includes('incêndio') || tipo.includes('incendio')) return '#D32F2F';
    if (tipo.includes('resgate') || tipo.includes('salvamento')) return '#F57C00';
    if (tipo.includes('acidente')) return '#FBC02D';
    
    return COLORS.primary;
  }, []);

  const getMarkerIcon = React.useCallback((occurrence: any): any => {
    const tipo = (occurrence.tipoOcorrencia || '').toLowerCase();
    if (tipo.includes('incêndio') || tipo.includes('incendio')) return 'fire';
    if (tipo.includes('resgate') || tipo.includes('salvamento')) return 'ambulance';
    if (tipo.includes('acidente')) return 'car-multiple';
    return 'alert-circle';
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* BOTÕES DE FILTRO */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'active' && styles.filterButtonActive]}
          onPress={() => setFilter('active')}
        >
          <MaterialCommunityIcons 
            name="fire" 
            size={18} 
            color={filter === 'active' ? '#fff' : COLORS.primary} 
          />
          <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
            Ativas ({occurrences.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <MaterialCommunityIcons 
            name="map-marker-multiple" 
            size={18} 
            color={filter === 'all' ? '#fff' : COLORS.primary} 
          />
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'finalized' && styles.filterButtonActive]}
          onPress={() => setFilter('finalized')}
        >
          <MaterialCommunityIcons 
            name="check-circle" 
            size={18} 
            color={filter === 'finalized' ? '#fff' : '#757575'} 
          />
          <Text style={[styles.filterText, filter === 'finalized' && styles.filterTextActive]}>
            Finalizadas
          </Text>
        </TouchableOpacity>
      </View>

      {/* MAPA */}
      <MapView 
        style={styles.map} 
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        provider={PROVIDER_GOOGLE}
        maxZoomLevel={18}
        minZoomLevel={10}
        loadingEnabled={true}
        loadingIndicatorColor={COLORS.primary}
      >
        {/* Marcadores das Ocorrências */}
        {occurrences.map((occurrence) => (
          <Marker
            key={occurrence._id}
            coordinate={{
              latitude: occurrence.endereco.latitude,
              longitude: occurrence.endereco.longitude,
            }}
            pinColor={getMarkerColor(occurrence)}
          >
            <Callout 
              tooltip={false}
              onPress={() => navigation.navigate('Details', { occurrence: { 
                id: occurrence._id, 
                originalData: occurrence 
              }})}
            >
              <View style={styles.callout}>
                <View style={styles.calloutHeader}>
                  <MaterialCommunityIcons 
                    name={getMarkerIcon(occurrence)} 
                    size={20} 
                    color={getMarkerColor(occurrence)} 
                  />
                  <Text style={styles.calloutTitle} numberOfLines={1}>
                    {occurrence.tipoOcorrencia}
                  </Text>
                </View>
                <Text style={styles.calloutNature} numberOfLines={2}>
                  {occurrence.naturezaInicial}
                </Text>
                <Text style={styles.calloutAddress} numberOfLines={1}>
                  📍 {occurrence.endereco?.rua}, {occurrence.endereco?.numero}
                </Text>
                <Text style={styles.calloutAddress} numberOfLines={1}>
                  {occurrence.endereco?.bairro}
                </Text>
                <View style={styles.calloutFooter}>
                  <View style={[styles.statusBadge, { backgroundColor: getMarkerColor(occurrence) }]}>
                    <Text style={styles.statusText}>
                      {occurrence.statusGeral?.toUpperCase() || 'ATIVA'}
                    </Text>
                  </View>
                  <Text style={styles.calloutTime}>
                    {new Date(occurrence.timestampRecebimento).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                <Text style={styles.calloutTap}>Toque para ver detalhes</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      
      {/* Legenda Flutuante */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>📍 Legenda</Text>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#D32F2F' }]} />
          <Text style={styles.legendText}>Incêndio</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#F57C00' }]} />
          <Text style={styles.legendText}>Resgate</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#FBC02D' }]} />
          <Text style={styles.legendText}>Acidente</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#757575' }]} />
          <Text style={styles.legendText}>Finalizada</Text>
        </View>
      </View>

      {/* Botão de Recarregar */}
      <TouchableOpacity 
        style={styles.refreshButton} 
        onPress={fetchOccurrences}
      >
        <MaterialCommunityIcons name="refresh" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },

  // Barra de Filtros
  filterBar: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  filterTextActive: {
    color: '#fff',
  },
  
  // Callout (Balãozinho)
  callout: {
    width: 220,
    padding: 12,
    backgroundColor: '#fff',
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  calloutNature: {
    fontSize: 13,
    color: '#555',
    marginBottom: 6,
  },
  calloutAddress: {
    fontSize: 11,
    color: '#777',
    marginBottom: 2,
  },
  calloutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
  },
  calloutTime: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  calloutTap: {
    fontSize: 10,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
  },

  // Legenda flutuante
  legendContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendText: {
    fontSize: 12,
    color: '#555',
  },

  // Botão de Refresh
  refreshButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: COLORS.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});