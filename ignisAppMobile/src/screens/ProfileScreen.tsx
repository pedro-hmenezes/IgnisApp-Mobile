import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <--- Importante
import { COLORS } from '../constants/theme';

export default function ProfileScreen({ navigation }: any) {
  
  const menuOptions = [
    { 
      id: '2', 
      title: 'Meus Relatórios', 
      subtitle: 'Histórico de atividades',
      icon: 'file-document-outline',
      target: 'Reports' 
    },
    { 
      id: '3', 
      title: 'Configurações', 
      subtitle: 'Tema, notificações, dados',
      icon: 'cog-outline',
      target: 'Settings' 
    },
  ];

  // --- FUNÇÃO DE LOGOUT REAL ---
  const handleLogout = () => {
    Alert.alert(
      "Sair do Sistema",
      "Tem certeza que deseja desconectar?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sair", 
          onPress: async () => {
            try {
              // 1. Limpa o Token e os Dados do Usuário do celular
              await AsyncStorage.multiRemove(['@ignis_token', '@ignis_user']);
              
              // 2. Reseta a navegação para que o usuário não possa voltar
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              Alert.alert("Erro", "Não foi possível fazer logout.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho do Perfil */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons name="account" size={50} color="#fff" />
        </View>
        <Text style={styles.userName}>Usuário Conectado</Text>
        <Text style={styles.userRole}>Operador de Campo</Text>
      </View>

      {/* Lista de Opções */}
      <View style={styles.menuContainer}>
        {menuOptions.map((option) => (
          <TouchableOpacity 
            key={option.id} 
            style={styles.menuItem}
            onPress={() => option.target ? navigation.navigate(option.target) : null}
          >
            <View style={[styles.iconBox, { backgroundColor: '#f0f0f0' }]}>
              <MaterialCommunityIcons name={option.icon as any} size={24} color={COLORS.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>{option.title}</Text>
              <Text style={styles.menuSubtitle}>{option.subtitle}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        ))}

        {/* Botão de Sair com Lógica Real */}
        <TouchableOpacity style={[styles.menuItem, { marginTop: 20 }]} onPress={handleLogout}>
          <View style={[styles.iconBox, { backgroundColor: '#ffebee' }]}>
            <MaterialCommunityIcons name="logout" size={24} color="#d32f2f" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, { color: '#d32f2f' }]}>Sair do Sistema</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: COLORS.primary,
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  userRole: { fontSize: 14, color: '#e0e0e0' },
  
  menuContainer: { paddingHorizontal: 20 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 }
  },
  iconBox: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  menuSubtitle: { fontSize: 12, color: '#888' },
});