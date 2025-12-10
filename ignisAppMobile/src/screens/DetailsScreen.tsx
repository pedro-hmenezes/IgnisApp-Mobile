import React, { useState, useEffect } from 'react';
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
import { updateOccurrence, getOccurrenceById, finalizeOccurrenceService } from '../services/occurrenceService';
import { createSignature } from '../services/signatureService';
import { uploadMedia, uploadMultipleMedia, uploadSignature } from '../services/mediaService';

import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SignaturePad } from '../components/SignaturePad';
import { SignatureDisplay } from '../components/SignatureDisplay';

export default function DetailsScreen({ route, navigation }: any) {
  const { occurrence } = route.params || {};

  // --- MUDANÇA 1: Estados para guardar os dados completos ---
  const [fullData, setFullData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Pega o ID (tenta de todas as formas possíveis para não falhar)
  const occurrenceId = occurrence?._id || occurrence?.originalData?._id || occurrence?.id;

  // --- MUDANÇA 2: Função para carregar dados do servidor ---
  const loadFullData = async () => {
    if (!occurrenceId) return;
    try {
      const dataFromServer = await getOccurrenceById(occurrenceId);
      
      if (dataFromServer) {
        console.log("✅ Dados completos atualizados! Solicitante:", dataFromServer.solicitante?.nome);
        setFullData(dataFromServer);
      }
    } catch (error) {
      console.log("⚠️ Erro ao atualizar detalhes, mantendo dados do cache.");
    } finally {
      setLoadingData(false);
    }
  };

  // --- MUDANÇA 3: O Efeito que busca os dados no servidor ---
  useEffect(() => {
    loadFullData();
  }, [occurrenceId]);

  // --- MUDANÇA 3: A Lógica de Prioridade ---
  // Se tiver fullData (do servidor), usa ele. Se não, usa o que veio da lista (occurrence)
  const rawData = fullData || occurrence?.originalData || occurrence || {};
  
  // Cria o objeto 'data' seguro
  const data = {
    ...rawData,
    // Garante que solicitante é um objeto (para evitar o crash)
    solicitante: rawData.solicitante || {}, 
    endereco: rawData.endereco || {}
  };
  
  const insets = useSafeAreaInsets();

  // Verifica se a ocorrência está finalizada
  const isFinalized = (data.statusGeral || '').toLowerCase() === 'finalizada';

  // Estados do Formulário
  const [description, setDescription] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [team, setTeam] = useState('');
  const [errors, setErrors] = useState<{ vehicle?: string; signature?: string }>({});

  // Estados Hardware
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [photos, setPhotos] = useState<string[]>([]); // URIs locais
  const [cloudinaryPhotos, setCloudinaryPhotos] = useState<any[]>([]); // Fotos do Cloudinary
  
  // Estados Assinatura
  const [signature, setSignature] = useState<string | null>(null);
  const [isSignaturePadVisible, setIsSignaturePadVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- EFEITO: Preenche os dados se já estiver finalizada ---
  useEffect(() => {
    if (isFinalized && fullData) {
      setVehicle(fullData.viaturaEmpenhada || '');
      setTeam(fullData.equipe || '');
      setDescription(fullData.descricaoAcoes || '');
      setSignature(fullData.assinatura?.signatureData || null);
      
      // Se tem coordenadas finais, cria o objeto location
      if (fullData.latitudeFinal && fullData.longitudeFinal) {
        setLocation({
          coords: {
            latitude: fullData.latitudeFinal,
            longitude: fullData.longitudeFinal,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        });
      }

      // Carrega fotos do Cloudinary se houver
      if (fullData.media && Array.isArray(fullData.media) && fullData.media.length > 0) {
        setCloudinaryPhotos(fullData.media);
        console.log(`📸 ${fullData.media.length} fotos carregadas do Cloudinary`);
      }
    }
  }, [isFinalized, fullData]);

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
    // 1. Validação dos Campos Obrigatórios
    if (!occurrenceId) {
      Alert.alert("Erro", "ID da ocorrência não encontrado. Volte e tente novamente.");
      return;
    }
    if (!vehicle.trim() || !team.trim() || !description.trim()) {
      Alert.alert("Dados Incompletos", "Preencha Viatura, Equipe e Descrição.");
      return;
    }
    if (!signature) {
      Alert.alert("Dados Incompletos", "A assinatura é obrigatória.");
      return;
    }
    if (!location) {
      Alert.alert("Sem GPS", "Aguarde a captura do GPS ou clique para atualizar.");
      return;
    }

    Alert.alert("Finalizar", "Confirma o envio do relatório?", [
      { text: "Cancelar", style: "cancel" },
      { 
        text: "Enviar", 
        onPress: async () => {
          setIsSaving(true);
          try {
            // --- PASSO 1: UPLOAD DAS FOTOS (SE HOUVER) ---
            let uploadedPhotoIds: string[] = [];

            if (photos.length > 0) {
              try {
                console.log(`📸 Enviando ${photos.length} fotos para Cloudinary...`);
                
                // Upload múltiplo para Cloudinary
                const response = await uploadMultipleMedia(photos, occurrenceId);
                
                if (response.sucesso && response.dados) {
                  // Extrai os IDs das fotos registradas no backend (se houver)
                  uploadedPhotoIds = response.dados
                    .map((photo: any) => photo._id)
                    .filter((id: any) => id); // Remove undefined/null
                  
                  console.log("✅ Fotos enviadas para Cloudinary");
                  console.log("📋 IDs registrados no backend:", uploadedPhotoIds);
                  console.log("🔗 URLs:", response.dados.map((p: any) => p.fileUrl || p.url));
                  
                  // Se não tem IDs mas tem URLs, as fotos estão no Cloudinary
                  if (uploadedPhotoIds.length === 0 && response.dados.length > 0) {
                    console.warn("⚠️ Fotos no Cloudinary mas sem IDs do backend");
                  }
                } else {
                  throw new Error(response.mensagem || 'Falha no upload');
                }
              } catch (uploadError: any) {
                console.warn("⚠️ Erro no upload de fotos:", uploadError.message);
                // Pergunta ao usuário se quer continuar sem as fotos
                const continueWithoutPhotos = await new Promise<boolean>((resolve) => {
                  Alert.alert(
                    "Erro no Upload de Fotos",
                    "Não foi possível enviar as fotos. Deseja continuar sem elas?",
                    [
                      { text: "Cancelar", onPress: () => resolve(false), style: "cancel" },
                      { text: "Continuar sem fotos", onPress: () => resolve(true) }
                    ]
                  );
                });
                
                if (!continueWithoutPhotos) {
                  setIsSaving(false);
                  return;
                }
              }
            }

            // --- PASSO 2: ENVIAR ASSINATURA PARA CLOUDINARY ---
            let signatureUrl = null;
            
            if (signature) {
              try {
                console.log("✍️ Enviando assinatura para Cloudinary...");
                const signatureResponse = await uploadSignature(signature, occurrenceId);
                
                if (signatureResponse.sucesso && signatureResponse.dados) {
                  signatureUrl = signatureResponse.dados.fileUrl;
                  console.log("✅ Assinatura enviada:", signatureUrl);
                } else {
                  throw new Error('Falha no upload da assinatura');
                }
              } catch (signatureError: any) {
                console.error("❌ Erro ao enviar assinatura:", signatureError.message);
                Alert.alert("Erro", "Não foi possível enviar a assinatura. Tente novamente.");
                setIsSaving(false);
                return;
              }
            }

            // --- PASSO 3: FINALIZAR TUDO (CHAMADA ÚNICA) ---
            console.log("🚀 Enviando pacote final...");

            // Pegar nome do usuário (se tiver salvo no storage, senão usa o 1º da equipe)
            // const userName = await AsyncStorage.getItem('userName'); 
            const signerName = team.split(',')[0].trim(); 

            const finalPayload = {
              // Relatório
              viaturaEmpenhada: vehicle.toUpperCase(),
              equipe: team,
              descricaoAcoes: description,
              
              // GPS
              latitudeFinal: location.coords.latitude,
              longitudeFinal: location.coords.longitude,
              
              // Assinatura (agora é URL do Cloudinary!)
              signerName: signerName,
              signerRole: `Comandante - Viatura ${vehicle.toUpperCase()}`,
              signatureUrl: signatureUrl, // URL do Cloudinary
              
              // Fotos (IDs)
              photosIds: uploadedPhotoIds
            };

            // Chamada final para o backend
            console.log("📤 Payload final:");
            console.log("  - Viatura:", finalPayload.viaturaEmpenhada);
            console.log("  - Equipe:", finalPayload.equipe);
            console.log("  - GPS:", finalPayload.latitudeFinal, finalPayload.longitudeFinal);
            console.log("  - signatureUrl:", finalPayload.signatureUrl); // ✅ URL do Cloudinary
            console.log("  - Fotos:", finalPayload.photosIds.length);
            
            const response = await finalizeOccurrenceService(occurrenceId, finalPayload);
            console.log("✅ Resposta do servidor:", response);
            
            // Recarrega os dados completos para atualizar a tela com as fotos
            console.log("🔄 Recarregando dados da ocorrência finalizada...");
            await loadFullData();
            
            setIsSaving(false);
            Alert.alert("Sucesso", "Ocorrência finalizada com sucesso!", [
              { text: "OK", onPress: () => navigation.goBack() }
            ]);

          } catch (error: any) {
            console.error("❌ ERRO AO FINALIZAR:", error);
            console.error("❌ Detalhes:", {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
              config: error.config?.url
            });
            setIsSaving(false);
            const msg = error.response?.data?.mensagem || error.message || "Erro desconhecido";
            Alert.alert("Erro ao Finalizar", `${msg}\n\nVerifique sua conexão e tente novamente.`);
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

            {/* Solicitante / Vítima - ATUALIZADO */}
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account-outline" size={20} color="#666" style={{ width: 25 }} />
              <View style={{flex: 1}}>
                <Text style={styles.infoLabel}>Solicitante</Text>
                
                {/* Nome do Solicitante */}
                <Text style={styles.infoValue}>
                  {data.solicitante?.nome ?? 'Anônimo'}
                </Text>

                {/* Telefone */}
                <Text style={styles.infoSub}>
                  {data.solicitante?.telefone ?? 'Sem telefone'}
                </Text>
                
                {/* Relação (Vítima, Testemunha, etc) - EM VERMELHO PARA DESTAQUE */}
                {data.solicitante?.relacao && (
                   <Text style={[styles.infoSub, { color: '#D32F2F', fontWeight: 'bold', marginTop: 2 }]}>
                     ({data.solicitante.relacao})
                   </Text>
                )}
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
            style={[styles.input, errors.vehicle && styles.inputError, isFinalized && styles.inputDisabled]} 
            placeholder="Ex: ABT-45" 
            value={vehicle}
            onChangeText={handleVehicleChange} 
            autoCapitalize="characters" autoCorrect={false} autoComplete="off"
            editable={!isFinalized}
          />
          {errors.vehicle && <Text style={styles.errorText}>{errors.vehicle}</Text>}

          <Text style={styles.label}>Equipe</Text>
          <TextInput 
            style={[styles.input, isFinalized && styles.inputDisabled]} 
            placeholder="Comandante e auxiliares..." 
            value={team} 
            onChangeText={setTeam}
            editable={!isFinalized}
          />
          
          <Text style={styles.label}>Descrição das Ações</Text>
          <TextInput 
            style={[styles.input, styles.textArea, isFinalized && styles.inputDisabled]} 
            placeholder="Relate o que foi feito no local..." 
            multiline 
            numberOfLines={4} 
            value={description} 
            onChangeText={setDescription}
            editable={!isFinalized}
          />

          {/* EVIDÊNCIAS */}
          <Text style={styles.sectionTitle}>Evidências</Text>
          {!isFinalized && (
            <TouchableOpacity style={[styles.actionButton, styles.shadow]} onPress={handleTakePhoto}>
              <MaterialCommunityIcons name="camera" size={24} color={COLORS.primary} />
              <Text style={styles.actionText}>Adicionar Foto</Text>
            </TouchableOpacity>
          )}
          
          {/* Fotos locais (antes de enviar) */}
          {photos.length > 0 && (
            <>
              <Text style={styles.photoLabel}>Fotos Pendentes ({photos.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoContainer}>
                {photos.map((uri, index) => (
                  <Image key={`local-${index}`} source={{ uri }} style={styles.photo} />
                ))}
              </ScrollView>
            </>
          )}

          {/* Fotos do Cloudinary (já enviadas) */}
          {cloudinaryPhotos.length > 0 && (
            <>
              <View style={styles.photoLabelContainer}>
                <MaterialCommunityIcons name="cloud-check" size={16} color="#4CAF50" />
                <Text style={styles.photoLabel}>
                  Fotos Enviadas ({cloudinaryPhotos.length})
                </Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoContainer}>
                {cloudinaryPhotos.map((photo, index) => (
                  <View key={`cloud-${photo._id || index}`} style={styles.photoWrapper}>
                    <Image source={{ uri: photo.fileUrl }} style={styles.photo} />
                    <View style={styles.cloudBadge}>
                      <MaterialCommunityIcons name="cloud-check" size={12} color="#fff" />
                    </View>
                  </View>
                ))}
              </ScrollView>
            </>
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
          ) : !isFinalized ? (
            <TouchableOpacity style={[styles.gpsButtonPlaceholder]} onPress={handleGetGPS} disabled={loadingGPS}>
              {loadingGPS ? <ActivityIndicator color={COLORS.primary} /> : <><MaterialCommunityIcons name="crosshairs-gps" size={30} color={COLORS.primary} /><Text>Capturar Ponto GPS</Text></>}
            </TouchableOpacity>
          ) : (
            <View style={styles.noDataBox}>
              <Text style={styles.noDataText}>Localização não registrada</Text>
            </View>
          )}

          {/* VALIDAÇÃO */}
          <Text style={[styles.sectionTitle, {marginTop: 20}]}>Validação</Text>
          <Text style={styles.label}>Assinatura do Responsável *</Text>

          <View style={errors.signature ? styles.signatureErrorBox : {}}>
            <SignatureDisplay 
              signature={signature}
              onEdit={!isFinalized ? handleOpenSignaturePad : undefined}
              onDelete={!isFinalized ? handleRemoveSignature : undefined}
              isLoading={isSaving}
            />
          </View>
          {errors.signature && <Text style={styles.errorText}>{errors.signature}</Text>}

          {!isFinalized && (
            <TouchableOpacity style={[styles.submitButton, styles.shadow]} onPress={handleSave} disabled={isSaving}>
              {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>FINALIZAR OCORRÊNCIA</Text>}
            </TouchableOpacity>
          )}
          
          {isFinalized && (
            <View style={styles.finalizedBanner}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#2E7D32" />
              <Text style={styles.finalizedText}>Ocorrência Finalizada</Text>
            </View>
          )}

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
  photoLabelContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  photoLabel: { fontSize: 13, color: '#666', fontWeight: '600' },
  photoContainer: { marginBottom: 15, flexDirection: 'row' },
  photoWrapper: { position: 'relative', marginRight: 10 },
  photo: { width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  cloudBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: '#4CAF50', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  gpsButtonPlaceholder: { height: 100, backgroundColor: '#e0e0e0', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  mapPreviewContainer: { height: 150, borderRadius: 12, overflow: 'hidden', marginBottom: 20, backgroundColor: '#fff' },
  map: { flex: 1 },
  submitButton: { backgroundColor: '#2E7D32', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  submitButtonText: { color: '#fff', fontWeight: 'bold' },
  inputDisabled: { backgroundColor: '#f5f5f5', color: '#999' },
  noDataBox: { backgroundColor: '#f5f5f5', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  noDataText: { color: '#999', fontSize: 14 },
  finalizedBanner: { backgroundColor: '#E8F5E9', padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  finalizedText: { color: '#2E7D32', fontWeight: 'bold', marginLeft: 8, fontSize: 16 },
});