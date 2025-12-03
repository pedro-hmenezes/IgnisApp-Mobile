import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api'; // Importe o arquivo que criamos acima
import { COLORS } from '../constants/theme';
import { AuthResponse } from '../types/types'; // Importe a tipagem

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // 1. Validação básica
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha email e senha.');
      return;
    }

    setIsLoading(true);

    try {
      // 2. Chamada à API (Rota POST /login definida no userRoutes.ts)
      const response = await api.post<AuthResponse>('/users/login', {
        email: email,
        password: password
      });

      // 3. Se chegou aqui, deu sucesso (200 OK)
      const { token, user } = response.data;

      // 4. Salvar Token e Dados do Usuário no celular
      await AsyncStorage.setItem('@ignis_token', token);
      await AsyncStorage.setItem('@ignis_user', JSON.stringify(user));

      // 5. Navegar para a área logada
      setIsLoading(false);
      navigation.replace('MainTabs'); // Ou 'Home', dependendo da sua rota

    } catch (error: any) {
      setIsLoading(false);
      
      // Tratamento de erro
      if (error.response) {
        // O servidor respondeu com um status de erro (ex: 401 Credenciais inválidas)
        Alert.alert('Falha no Login', error.response.data.message || 'Verifique seus dados.');
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta (Erro de conexão/Render dormindo)
        Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique sua internet.');
      } else {
        Alert.alert('Erro', 'Ocorreu um erro inesperado.');
      }
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <MaterialCommunityIcons name="fire" size={60} color="#6A3A58" style={{alignSelf:'center'}} /> 
          <Text style={styles.appTitle}>Ignis Group</Text>
          <Text style={styles.subTitle}>Sistema de ocorrências - CBMPE</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput 
            style={styles.input}
            placeholder="Digite seu email corporativo"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none" // Importante para login
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput 
            style={styles.input}
            placeholder="Digite sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  headerContainer: { alignItems: 'center', marginBottom: 50 },
  appTitle: { fontSize: 28, fontWeight: 'bold', marginTop: 10 },
  subTitle: { fontSize: 14, color: '#666', marginTop: 5 },
  formContainer: { width: '100%' },
  label: { fontSize: 16, marginBottom: 8, marginTop: 15 },
  input: {
    height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    paddingHorizontal: 15, fontSize: 16, backgroundColor: '#FFF'
  },
  button: {
    backgroundColor: COLORS.primary, height: 55, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', marginTop: 40
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '500' },
});