import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { COLORS } from '../constants/theme'; 

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        
        {/* 1. Logo e Título */}
        <View style={styles.headerContainer}>
          {/* Simulando o logo do Ignis Group */}
          <Image 
            source={require('../../assets/ignis-logo.png')}
            style={styles.logo}
            /> 
          
          <Text style={styles.appTitle}>Ignis</Text>
          <Text style={styles.subTitle}>Sistema de ocorrências - CBMPE</Text>
        </View>

        {/* 2. Formulário */}
        <View style={styles.formContainer}>
          
          <Text style={styles.label}>Email</Text>
          <TextInput 
            style={styles.input}
            placeholder="Digite seu email corporativo"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput 
            style={styles.input}
            placeholder="Digite sua senha"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.replace('MainTabs')}
          >
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

        </View>

        {/* 3. Rodapé */}
        <View style={styles.footer}>
            <Text style={styles.footerText}>
                Esqueceu o email ou senha? Entre em contato com o seu superior técnico. <Text style={styles.boldText}>Saiba Mais</Text>
            </Text>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
  },
  subTitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 5,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 55,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    marginTop: 60,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 10
  },
  boldText: {
    fontWeight: 'bold',
    color: '#000'
  },

  logo: {
  width: 90,
  height: 90,
  resizeMode: 'contain',
  alignSelf: 'center',
},

});