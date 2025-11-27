import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { COLORS } from '../constants/theme';

export default function MapScreen() {
  
  // Coordenada inicial (Marco Zero - Recife)
  const INITIAL_REGION = {
    latitude: -8.0631,
    longitude: -34.8711,
    latitudeDelta: 0.05, // Zoom level
    longitudeDelta: 0.05,
  };

  // Ocorrências Mockadas no Mapa
  const MARKERS = [
    {
      id: 1,
      title: "Incêndio Residencial",
      description: "Rua do Sol (Prioridade Alta)",
      coords: { latitude: -8.0645, longitude: -34.8730 },
      color: "#D32F2F" // Vermelho
    },
    {
      id: 2,
      title: "Resgate Veicular",
      description: "Av. Agamenon (Em andamento)",
      coords: { latitude: -8.0580, longitude: -34.8850 },
      color: "#FBC02D" // Amarelo
    },
    {
      id: 3,
      title: "Vistoria Técnica",
      description: "Shopping Tacaruna",
      coords: { latitude: -8.0370, longitude: -34.8710 },
      color: "#388E3C" // Verde
    }
  ];

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        initialRegion={INITIAL_REGION}
        showsUserLocation={true} // Tenta mostrar a bolinha azul de onde você está
      >
        {MARKERS.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coords}
            pinColor={marker.color}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{marker.title}</Text>
                <Text style={styles.calloutDesc}>{marker.description}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      
      {/* Legenda Flutuante */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Legenda Operacional</Text>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#D32F2F' }]} />
          <Text style={styles.legendText}>Incêndio (Crítico)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#FBC02D' }]} />
          <Text style={styles.legendText}>Resgate (Em andamento)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  
  // Estilo do Balãozinho ao clicar no pino
  callout: { width: 150, padding: 5 },
  calloutTitle: { fontWeight: 'bold', fontSize: 14, marginBottom: 2 },
  calloutDesc: { fontSize: 12, color: '#666' },

  // Legenda flutuante
  legendContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  legendTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { fontSize: 12, color: '#555' }
});