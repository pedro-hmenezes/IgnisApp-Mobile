import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

// Telas
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen'; // Tela com a lista de cards
import MapScreen from '../screens/MapScreen'; // Nossa nova tela de mapa
import ProfileScreen from '../screens/ProfileScreen'; // Nossa nova tela de menu
import AlertsScreen from '../screens/AlertsScreen'; // Tela vazia (placeholder)
import DetailsScreen from '../screens/DetailsScreen'; // Tela de detalhes da ocorrência
import ReportsScreen from '../screens/ReportsScreen'; // Tela de relatórios
import SettingsScreen from '../screens/SettingsScreen'; // Tela de configurações

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
        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="bell-outline" size={26} color={color} />
      }}
    />

    <Tab.Screen 
      name="Home" 
      component={HomeScreen} 
      options={{
        title: 'Ocorrências', 
        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="alert-circle-outline" size={26} color={color} />
      }}
    />

    <Tab.Screen 
      name="Map" 
      component={MapScreen} 
      options={{
        title: 'Mapa',
        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="map-marker-outline" size={26} color={color} />
      }}
    />

    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={{
        title: 'Perfil',
        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-circle-outline" size={26} color={color} />
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
      <Stack.Screen 
        name="Details" 
        component={DetailsScreen} 
        options={{ 
          headerShown: true, // Queremos mostrar o botão de voltar padrão
          title: 'Detalhes da Ocorrência',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: '#fff'
        }}
      />
      <Stack.Screen 
        name="Reports" 
        component={ReportsScreen} 
        options={{ 
          headerShown: true, 
          title: 'Histórico de Ocorrências',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: '#fff'
        }}
      />

      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ 
          headerShown: true, 
          title: 'Configurações',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: '#fff'
        }}
      />
    </Stack.Navigator>
  );
}