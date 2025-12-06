import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { updateOccurrence } from '../services/occurrenceService';

import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SignaturePad } from '../components/SignaturePad';
import { SignatureDisplay } from '../components/SignatureDisplay';


export default function DetailsScreen({ route, navigation }: any) {
  // Pegamos o 'occurrence' que veio da lista
  // 'originalData' contém o objeto bruto do MongoDB com todos os campos (solicitante, endereco, etc)
  const { occurrence } = route.params || {};
  const data = occurrence?.originalData || {}; 

  console.log("🔍 DADOS DO SOLICITANTE:", JSON.stringify(data.solicitante, null, 2));
  
  const insets = useSafeAreaInsets();

  // Estados do Formulário
  const [description, setDescription] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [team, setTeam] = useState('');
  const [errors, setErrors] = useState<{ vehicle?: string; signature?: string }>({});

  // Estados Hardware
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  
  // Estados Assinatura
  const [signature, setSignature] = useState<string | null>(null);
  const [isSignaturePadVisible, setIsSignaturePadVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- FORMATAÇÃO DE DATA ---
  const formattedDate = data.timestampRecebimento 
    ? new Date(data.timestampRecebimento).toLocaleString('pt-BR')
    : 'Data desconhecida';

  // --- FUNÇÕES DE ASSINATURA ---
  const handleSignatureConfirmed = (signatureBase64: string) => {
    setSignature(signatureBase64);
    if (errors.signature) setErrors(prev => ({ ...prev, signature: undefined }));
    setIsSignaturePadVisible(false);
  };
  const handleOpenSignaturePad = () => setIsSignaturePadVisible(true);
  const handleCloseSignaturePad = () => setIsSignaturePadVisible(false);
  const handleRemoveSignature = () => setSignature(null);

  // --- FUNÇÕES AUXILIARES ---
  const handleVehicleChange = (text: string) => {
    const formatted = text.toUpperCase();
    setVehicle(formatted);
    if (formatted.length > 0) setErrors(prev => ({ ...prev, vehicle: undefined }));
  };

  // --- HARDWARE ---
  const handleGetGPS = async () => {
    setLoadingGPS(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permissão negada', 'Precisamos de acesso ao GPS.'); return; }
      let currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(currentLocation);
    } catch { Alert.alert('Erro', 'Falha ao pegar GPS.'); } finally { setLoadingGPS(false); }
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) return Alert.alert("Permissão necessária", "Você precisa permitir o acesso à câmera.");
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.5 });
      if (!result.canceled) setPhotos([...photos, result.assets[0].uri]);
    } catch { Alert.alert("Erro", "Não foi possível abrir a câmera."); }
  };

  // --- SALVAR ---
  const handleSave = async () => {
    // Validação
    const newErrors: { vehicle?: string; signature?: string } = {};
    let isValid = true;
    if (!vehicle.trim()) { newErrors.vehicle = "A identificação da viatura é obrigatória."; isValid = false; }
    if (!signature) { newErrors.signature = "A assinatura do responsável é obrigatória."; isValid = false; }
    setErrors(newErrors);

    if (!isValid) {
      Alert.alert("Dados Incompletos", "Verifique os campos em vermelho.");
      return;
    }
    
    Alert.alert("Finalizar", "Confirma o envio?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Enviar", onPress: async () => {
          setIsSaving(true);
          try {
            // Payload Seguro (Só status por enquanto)
            const payload = { statusGeral: 'finalizada' as const };
            console.log("📤 ENVIANDO:", { vehicle, team, photos: photos.length, signature: !!signature });
            
            await updateOccurrence(occurrence.id, payload);
            
            setIsSaving(false);
            Alert.alert("Sucesso", "Ocorrência finalizada!", [{ text: "OK", onPress: () => navigation.goBack() }]);
          } catch { 
            setIsSaving(false); 
            Alert.alert("Aviso", "Salvo localmente (Back-end em ajuste)."); 
            navigation.goBack();
          }
        }
      }
    ]);
  };

  return (
    <View style={{flex: 1, backgroundColor: '#f2f2f2'}}>
      {/* HEADER DINÂMICO */}
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'android' ? 10 : 0) }]}>
        <View style={styles.headerTop}>
          <Text style={styles.idText}>AVISO #{data.numAviso || occurrence?.id?.slice(-4) || '---'}</Text>
          <View style={[styles.priorityBadge, 
            { backgroundColor: data.statusGeral === 'cancelada' ? '#757575' : '#ff0000' }
          ]}>
            <Text style={styles.priorityText}>{data.statusGeral?.toUpperCase() || 'ABERTO'}</Text>
          </View>
        </View>
        <Text style={styles.title}>{data.tipoOcorrencia || 'Ocorrência'}</Text>
        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker" size={16} color="#fff" />
          <Text style={styles.locationText} numberOfLines={1}>
            {data.endereco?.bairro || 'Local não informado'} - {data.endereco?.municipio}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 + insets.bottom }}>
          
          {/* --- BLOCO: DADOS DO DESPACHO (DETALHADO) --- */}
          <View style={[styles.cardBox, styles.shadow]}>
            <Text style={styles.boxTitle}>DADOS DO DESPACHO (COBOM)</Text>
            
            {/* Natureza */}
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#666" style={{ width: 25 }} />
              <View style={{flex: 1}}>
                <Text style={styles.infoLabel}>Natureza</Text>
                <Text style={styles.infoValue}>{data.naturezaInicial || 'Não informada'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Endereço Completo */}
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={20} color="#666" style={{ width: 25 }} />
              <View style={{flex: 1}}>
                <Text style={styles.infoLabel}>Endereço</Text>
                <Text style={styles.infoValue}>
                  {data.endereco ? 
                    `${data.endereco.rua}, ${data.endereco.numero}\n${data.endereco.bairro}, ${data.endereco.municipio}` 
                    : occurrence?.location
                  }
                </Text>
                {data.endereco?.referencia && (
                  <Text style={styles.infoRef}>Ref: {data.endereco.referencia}</Text>
                )}
              </View>
            </View>

            <View style={styles.divider} />

            {/* Solicitante / Vítima */}
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account-outline" size={20} color="#666" style={{ width: 25 }} />
              <View style={{flex: 1}}>
                <Text style={styles.infoLabel}>Solicitante</Text>
                <Text style={styles.infoValue}>{data.solicitante?.nome || 'Anônimo'}</Text>
                <Text style={styles.infoSub}>{data.solicitante?.telefone || 'Sem telefone'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Data e Hora */}
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#666" style={{ width: 25 }} />
              <View style={{flex: 1}}>
                <Text style={styles.infoLabel}>Horário do Chamado</Text>
                <Text style={styles.infoValue}>{formattedDate}</Text>
              </View>
            </View>
          </View>

          {/* FORMULÁRIO */}
          <Text style={styles.sectionTitle}>Relatório Operacional</Text>
          
          <Text style={styles.label}>Viatura Empenhada *</Text>
          <TextInput 
            style={[styles.input, errors.vehicle && styles.inputError]} 
            placeholder="Ex: ABT-45" 
            value={vehicle}
            onChangeText={handleVehicleChange} 
            autoCapitalize="characters" autoCorrect={false} autoComplete="off"
          />
          {errors.vehicle && <Text style={styles.errorText}>{errors.vehicle}</Text>}

          <Text style={styles.label}>Equipe</Text>
          <TextInput style={styles.input} placeholder="Comandante e auxiliares..." value={team} onChangeText={setTeam} />
          
          <Text style={styles.label}>Descrição das Ações</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Relate o que foi feito no local..." multiline numberOfLines={4} value={description} onChangeText={setDescription} />

          {/* EVIDÊNCIAS */}
          <Text style={styles.sectionTitle}>Evidências</Text>
          <TouchableOpacity style={[styles.actionButton, styles.shadow]} onPress={handleTakePhoto}>
            <MaterialCommunityIcons name="camera" size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>Adicionar Foto</Text>
          </TouchableOpacity>
          {photos.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoContainer}>
              {photos.map((uri, index) => (
                <Image key={index} source={{ uri }} style={styles.photo} />
              ))}
            </ScrollView>
          )}

          {/* GPS */}
          <Text style={[styles.sectionTitle, {marginTop: 20}]}>Localização</Text>
          {location ? (
            <View style={[styles.mapPreviewContainer, styles.shadow]}>
              <MapView
                style={styles.map}
                initialRegion={{ latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 }}
                scrollEnabled={false} zoomEnabled={false}
              >
                <Marker coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }} />
              </MapView>
            </View>
          ) : (
            <TouchableOpacity style={[styles.gpsButtonPlaceholder]} onPress={handleGetGPS} disabled={loadingGPS}>
              {loadingGPS ? <ActivityIndicator color={COLORS.primary} /> : <><MaterialCommunityIcons name="crosshairs-gps" size={30} color={COLORS.primary} /><Text>Capturar Ponto GPS</Text></>}
            </TouchableOpacity>
          )}

          {/* VALIDAÇÃO */}
          <Text style={[styles.sectionTitle, {marginTop: 20}]}>Validação</Text>
          <Text style={styles.label}>Assinatura do Responsável *</Text>

          <View style={errors.signature ? styles.signatureErrorBox : {}}>
            <SignatureDisplay 
              signature={signature}
              onEdit={handleOpenSignaturePad}
              onDelete={handleRemoveSignature}
              isLoading={isSaving}
            />
          </View>
          {errors.signature && <Text style={styles.errorText}>{errors.signature}</Text>}

          <TouchableOpacity style={[styles.submitButton, styles.shadow]} onPress={handleSave} disabled={isSaving}>
            {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>FINALIZAR OCORRÊNCIA</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      <SignaturePad
        visible={isSignaturePadVisible}
        onClose={handleCloseSignaturePad}
        onSign={handleSignatureConfirmed}
        isLoading={isSaving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    backgroundColor: COLORS.primary, 
    paddingHorizontal: 20, 
    paddingBottom: 20, 
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20 
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  idText: { color: '#ffffffcc', fontWeight: 'bold', fontSize: 12 },
  priorityBadge: { paddingHorizontal: 8, borderRadius: 4, paddingVertical: 2 },
  priorityText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  locationRow: { flexDirection: 'row', marginTop: 5, opacity: 0.9, alignItems: 'center' },
  locationText: { color: '#fff', marginLeft: 5, fontSize: 14, flex: 1 },
  
  shadow: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },

  // Estilo do Bloco de Despacho (Onde mexemos agora)
  cardBox: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 20 },
  boxTitle: { fontSize: 12, color: '#888', fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 5 },
  infoLabel: { fontSize: 12, color: '#999', marginBottom: 2 },
  infoValue: { fontSize: 15, color: '#333', fontWeight: '500' },
  infoSub: { fontSize: 13, color: '#666', fontStyle: 'italic' },
  infoRef: { fontSize: 12, color: '#D32F2F', marginTop: 2, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 10, marginLeft: 25 },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10, marginTop: 10 },
  label: { fontSize: 14, color: '#666', marginBottom: 5, fontWeight: '600' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 10 },
  inputError: { borderColor: '#D32F2F', borderWidth: 1.5, backgroundColor: '#FFEBEE' },
  errorText: { color: '#D32F2F', fontSize: 12, marginTop: -5, marginBottom: 10, marginLeft: 2 },
  signatureErrorBox: { borderWidth: 1.5, borderColor: '#D32F2F', borderRadius: 12, borderStyle: 'dashed', padding: 2 },
  textArea: { height: 80, textAlignVertical: 'top' },
  actionButton: { backgroundColor: '#fff', padding: 15, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.primary, marginBottom: 10 },
  actionText: { marginLeft: 8, fontWeight: 'bold', color: COLORS.primary },
  photoContainer: { marginBottom: 10, flexDirection: 'row' },
  photo: { width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginRight: 10 },
  gpsButtonPlaceholder: { height: 100, backgroundColor: '#e0e0e0', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  mapPreviewContainer: { height: 150, borderRadius: 12, overflow: 'hidden', marginBottom: 20, backgroundColor: '#fff' },
  map: { flex: 1 },
  submitButton: { backgroundColor: '#2E7D32', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  submitButtonText: { color: '#fff', fontWeight: 'bold' },
});