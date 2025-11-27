import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function SettingsScreen() {
  // Estados para os Switches (Interatividade)
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [biometrics, setBiometrics] = useState(false);

  const toggleOffline = (value: boolean) => {
    setIsOfflineMode(value);
    if (value) {
      Alert.alert("Modo Offline Ativado", "As ocorrências serão salvas localmente e sincronizadas quando houver conexão.");
    }
  };

  const handleSync = () => {
    Alert.alert("Sincronização", "Buscando dados atualizados do servidor...", [
        { text: "OK" }
    ]);
  };

  // Componente auxiliar para criar linhas de opção
  const SettingItem = ({ icon, label, value, onValueChange, isSwitch = true }: any) => (
    <View style={styles.itemRow}>
      <View style={styles.itemLeft}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name={icon} size={22} color="#555" />
        </View>
        <Text style={styles.itemText}>{label}</Text>
      </View>
      {isSwitch ? (
        <Switch 
          value={value} 
          onValueChange={onValueChange}
          trackColor={{ false: "#767577", true: COLORS.primary }}
          thumbColor={value ? "#fff" : "#f4f3f4"}
        />
      ) : (
        <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      
      {/* Seção 1: Operacional (Foco do App) */}
      <Text style={styles.sectionTitle}>OPERACIONAL</Text>
      <View style={styles.sectionBox}>
        <SettingItem 
          icon="wifi-off" 
          label="Modo Offline Forçado" 
          value={isOfflineMode} 
          onValueChange={toggleOffline}
        />
        <TouchableOpacity onPress={handleSync} style={styles.itemRow}>
            <View style={styles.itemLeft}>
                <View style={styles.iconBox}>
                    <MaterialCommunityIcons name="sync" size={22} color="#555" />
                </View>
                <Text style={styles.itemText}>Sincronizar Agora</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Seção 2: Preferências */}
      <Text style={styles.sectionTitle}>PREFERÊNCIAS</Text>
      <View style={styles.sectionBox}>
        <SettingItem 
          icon="bell-outline" 
          label="Notificações Push" 
          value={notifications} 
          onValueChange={setNotifications}
        />
        <SettingItem 
          icon="theme-light-dark" 
          label="Modo Escuro" 
          value={isDarkMode} 
          onValueChange={setIsDarkMode}
        />
        <SettingItem 
          icon="fingerprint" 
          label="Entrar com Biometria" 
          value={biometrics} 
          onValueChange={setBiometrics}
        />
      </View>

      {/* Seção 3: Informações */}
      <Text style={styles.sectionTitle}>SOBRE</Text>
      <View style={styles.sectionBox}>
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Versão do App</Text>
            <Text style={styles.infoValue}>1.0.0 (Beta M1)</Text>
        </View>
        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Desenvolvido por</Text>
            <Text style={styles.infoValue}>Ignis Group</Text>
        </View>
      </View>

      <Text style={styles.footerText}>ID do Dispositivo: 8823-AF99-B001</Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#888', marginBottom: 10, marginLeft: 5 },
  sectionBox: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 15, marginBottom: 25 },
  
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 35, alignItems: 'center', marginRight: 10 },
  itemText: { fontSize: 16, color: '#333' },
  
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  infoLabel: { color: '#666', fontSize: 15 },
  infoValue: { color: '#333', fontWeight: 'bold', fontSize: 15 },
  
  footerText: { textAlign: 'center', color: '#aaa', fontSize: 12, marginBottom: 30 }
});