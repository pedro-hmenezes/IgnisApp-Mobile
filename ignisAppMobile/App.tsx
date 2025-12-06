import React from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
// IMPORTAR O PROVIDER
import { SafeAreaProvider } from "react-native-safe-area-context";

import AppNavigator from "./src/routes/AppNavigator";
import { COLORS } from "./src/constants/theme";

export default function App() {
  return (
    // ENVOLVER TUDO COM SafeAreaProvider
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
