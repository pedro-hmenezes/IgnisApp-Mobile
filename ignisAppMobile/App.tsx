import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/routes/AppNavigator';
import { StatusBar } from 'react-native';
import { COLORS } from './src/constants/themes';

export default function App() {
  return (
    <NavigationContainer>
      {/* Configura a barra de status do celular para combinar com o app */}
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <AppNavigator />
    </NavigationContainer>
  );
}