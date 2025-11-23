import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/themes';

// Telas
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen'; // Tela com a lista de cards
import ProfileScreen from '../screens/ProfileScreen'; // Nossa nova tela de menu
import AlertsScreen from '../screens/AlertsScreen'; // Tela vazia (placeholder)

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Configuração das 3 Abas Inferiores ---
function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        // Estilo da Barra Inferior
        tabBarStyle: { 
          height: 65, 
          paddingBottom: 10, 
          paddingTop: 10,
          backgroundColor: '#fff',
          borderTopColor: 'transparent',
          elevation: 10 // Sombra no Android
        },
        tabBarActiveTintColor: COLORS.primary, // Cor Vinho quando ativo
        tabBarInactiveTintColor: '#999',       // Cor Cinza quando inativo
        tabBarShowLabel: false,                // Esconde o texto, mostra só ícone (Visual mais limpo)
        
        // Estilo do Topo (Header)
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      }}
    >
      {/* 1. Aba de Alertas */}
      <Tab.Screen 
        name="Alerts" 
        component={AlertsScreen} 
        options={{
          title: 'Alertas',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell-outline" size={28} color={color} />
          )
        }}
      />

      {/* 2. Aba Principal (Home/Ocorrências) */}
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          title: 'Ocorrências',
          tabBarIcon: ({ color }) => (
            // Ícone de Casa um pouco maior para destaque
            <MaterialCommunityIcons name="home" size={32} color={color} />
          )
        }}
      />

      {/* 3. Aba de Perfil/Menu */}
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          title: 'Meu Perfil',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-circle-outline" size={28} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
}

// --- Navegação Principal (Login -> App) ---
export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
}