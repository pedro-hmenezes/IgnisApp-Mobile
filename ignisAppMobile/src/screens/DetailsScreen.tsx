import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export default function DetailsScreen({ route, navigation }: any) {
  // Se vier com dados, é edição. Se vier null, é criação.
  const { occurrence } = route.params || {};
  
  const [description, setDescription] = useState(occurrence ? 'Vítima presa às ferragens...' : '');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>
        {occurrence ? `Ocorrência #${occurrence.id}` : 'Nova Ocorrência'}
      </Text>

      {/* Campos de Leitura (Vindos do Dispatch Web) */}
      <View style={styles.section}>
        <Text style={styles.label}>Tipo de Ocorrência</Text>
        <TextInput style={[styles.input, styles.disabledInput]} value={occurrence?.type || 'Resgate'} editable={false} />
        
        <Text style={styles.label}>Localização Inicial</Text>
        <TextInput style={[styles.input, styles.disabledInput]} value={occurrence?.location || 'Aguardando GPS'} editable={false} />
      </View>

      <View style={styles.divider} />

      {/* Campos de Coleta de Dados (F-02, F-04, F-05) */}
      <Text style={styles.sectionTitle}>Dados de Campo</Text>
      
      <Text style={styles.label}>Descrição da Cena (F-02)</Text>
      <TextInput 
        style={[styles.input, styles.textArea]} 
        value={description} 
        onChangeText={setDescription}
        multiline 
        numberOfLines={4}
      />

      {/* Botões placeholder para funcionalidades de Hardware (F-04 GPS e F-05 Foto) */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>📷 Adicionar Foto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>📍 Atualizar GPS</Text>
        </TouchableOpacity>
      </View>

      {/* Ação de Finalizar ou Salvar Localmente (F-03) */}
      <TouchableOpacity style={styles.saveButton} onPress={() => navigation.goBack()}>
        <Text style={styles.saveText}>SALVAR / SINCRONIZAR</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#d32f2f', marginVertical: 15 },
  section: { marginBottom: 10 },
  label: { fontSize: 14, color: '#666', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15, fontSize: 16 },
  disabledInput: { backgroundColor: '#f0f0f0', color: '#999' },
  textArea: { height: 100, textAlignVertical: 'top' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  actionButton: { flex: 1, backgroundColor: '#444', padding: 12, borderRadius: 8, marginHorizontal: 5, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#2e7d32', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});