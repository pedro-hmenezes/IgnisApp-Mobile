import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { updateOccurrence } from '../services/occurrenceService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function DetailsScreen({ route, navigation }: any) {
  const { occurrence } = route.params || {};

  // Estados do Formulário
  const [description, setDescription] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [team, setTeam] = useState('');
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<string | null>(null);
  const [photoCount, setPhotoCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // --- SIMULAÇÕES ---
  const handleGetGPS = () => {
    setLoadingGPS(true);
    setTimeout(() => {
      setLoadingGPS(false);
      setGpsLocation('-8.0631, -34.8711 (Precisão: 5m)');
      Alert.alert("GPS", "Localização exata da ocorrência capturada.");
    }, 2000);
  };

  const handleTakePhoto = () => {
    Alert.alert("Câmera", "Foto capturada e anexada ao prontuário.", [
      { text: "OK", onPress: () => setPhotoCount(prev => prev + 1) }
    ]);
  };

const handleSave = async () => {
    // 1. Validação Visual
    if (!vehicle) {
      Alert.alert("Campo Obrigatório", "Por favor, informe a viatura utilizada.");
      return;
    }
    
    Alert.alert(
      "Finalizar Atendimento",
      "Confirma o envio dos dados para a central?",
      [
        { text: "Voltar", style: "cancel" },
        { 
          text: "Enviar Relatório", 
          onPress: async () => {
            setIsSaving(true);
            try {
              // 2. Monta o objeto com os dados que o bombeiro preencheu
              // Nota: Estamos assumindo que seu Banco aceita 'viatura', 'equipe', 'descricao'
              const payload = {
                viatura: vehicle,
                equipe: team,
                descricao: description,
                statusGeral: 'finalizada' as const // Força a mudança de status
              };

              // 3. Chama a API Real
              await updateOccurrence(occurrence.id, payload);

              setIsSaving(false);
              
              // 4. Sucesso!
              Alert.alert("Sucesso", "Ocorrência finalizada e sincronizada!", [
                { text: "OK", onPress: () => navigation.goBack() }
              ]);

            } catch (error) {
              setIsSaving(false);
              Alert.alert("Erro", "Falha ao enviar dados. Tente novamente.");
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      
      {/* 1. CABEÇALHO VISUAL (TIPO E LOCAL) */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.idText}>#{occurrence?.id || '2594'}</Text>
          <View style={styles.priorityBadge}>
            <Text style={styles.priorityText}>PRIORIDADE ALTA</Text>
          </View>
        </View>
        <Text style={styles.title}>{occurrence?.title || 'Resgate de Vítima'}</Text>
        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker" size={18} color="#fff" />
          <Text style={styles.locationText}>
            {occurrence?.location || 'Av. Agamenon Magalhães, 1200'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        
        {/* 2. DADOS DA CENTRAL (LEITURA) - O que o bombeiro precisa saber */}
        <View style={styles.dispatchBox}>
          <Text style={styles.boxTitle}>DADOS DO DESPACHO (COBOM)</Text>
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account-alert" size={20} color="#555" />
            <Text style={styles.infoText}>
              <Text style={{fontWeight: 'bold'}}>Solicitante/Vítima:</Text> {occurrence?.victim || 'Maria da Silva (Vítima Consciente)'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="phone" size={20} color="#555" />
            <Text style={styles.infoText}>
              <Text style={{fontWeight: 'bold'}}>Contato:</Text> (81) 99999-0000
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="alert-box" size={20} color="#555" />
            <Text style={styles.infoText}>
              <Text style={{fontWeight: 'bold'}}>Observação:</Text> Vítima presa no 2º andar, fumaça densa relatada.
            </Text>
          </View>
        </View>

        {/* 3. PREENCHIMENTO DO BOMBEIRO (ESCRITA) */}
        <Text style={styles.sectionTitle}>Registro da Operação</Text>

        <Text style={styles.label}>Viatura Empenhada *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: ABT-45" 
          value={vehicle}
          onChangeText={setVehicle}
        />

        <Text style={styles.label}>Equipe (Guarnição)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Comandante e auxiliares..." 
          value={team}
          onChangeText={setTeam}
        />

        <Text style={styles.label}>Descrição / Código de Encerramento</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Relate as ações tomadas..." 
          multiline 
          numberOfLines={4}
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />

        {/* 4. AÇÕES DE CAMPO */}
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionButton, photoCount > 0 && styles.activeButton]} 
            onPress={handleTakePhoto}
          >
            <MaterialCommunityIcons 
              name="camera" 
              size={24} 
              color={photoCount > 0 ? "#fff" : COLORS.primary} 
            />
            <Text style={[styles.actionText, photoCount > 0 && {color: '#fff'}]}>
              {photoCount > 0 ? `${photoCount} Fotos` : "Fotografar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, gpsLocation ? styles.activeButton : {}]} 
            onPress={handleGetGPS}
          >
            {loadingGPS ? <ActivityIndicator color={COLORS.primary} /> : (
              <>
                <MaterialCommunityIcons 
                  name={gpsLocation ? "check-circle" : "crosshairs-gps"} 
                  size={24} 
                  color={gpsLocation ? "#fff" : COLORS.primary} 
                />
                <Text style={[styles.actionText, gpsLocation && {color: '#fff'}]}>
                  {gpsLocation ? "GPS OK" : "Validar Local"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* 5. BOTÃO FINAL */}
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
             <ActivityIndicator color="#fff" />
          ) : (
             <Text style={styles.submitButtonText}>FINALIZAR OCORRÊNCIA</Text>
          )}
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  header: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 10, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  idText: { color: '#ffffff99', fontWeight: 'bold' },
  priorityBadge: { backgroundColor: '#ff0000', paddingHorizontal: 8, borderRadius: 4 },
  priorityText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  locationRow: { flexDirection: 'row', marginTop: 5, opacity: 0.9 },
  locationText: { color: '#fff', marginLeft: 5, fontSize: 14 },
  
  content: { padding: 20 },
  
  // Estilo da Caixa de Despacho
  dispatchBox: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 25, borderLeftWidth: 4, borderLeftColor: '#666', elevation: 2 },
  boxTitle: { fontSize: 12, color: '#666', fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 },
  infoRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'center' },
  infoText: { marginLeft: 10, color: '#333', fontSize: 14, flex: 1 },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  label: { fontSize: 14, color: '#666', marginBottom: 5, fontWeight: '600' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  textArea: { height: 100 },
  
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  actionButton: { flex: 0.48, backgroundColor: '#fff', padding: 15, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', elevation: 2 },
  activeButton: { backgroundColor: COLORS.primary },
  actionText: { marginLeft: 8, fontWeight: 'bold', color: COLORS.primary },
  
  submitButton: { backgroundColor: '#2E7D32', padding: 16, borderRadius: 8, alignItems: 'center', elevation: 4 },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});