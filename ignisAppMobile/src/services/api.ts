// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANTE: Coloque a URL base do seu Render aqui (sem a barra / no final)
const BASE_URL = 'https://ignisappback.onrender.com/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  // timeout: 10000, // opcional
});

// Interceptador para adicionar o Token automaticamente em todas as requisições
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@ignis_token');
  if (config && token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.request.use(request => {
  const base = request?.baseURL ?? '';
  const url = request?.url ?? '';
  console.log('>>> TENTANDO CONECTAR EM:', base + url);
  return request;
});

export default api;