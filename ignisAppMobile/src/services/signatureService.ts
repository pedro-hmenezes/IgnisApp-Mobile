import api from './api';

export const createSignature = async (data: any) => {
  // CORREÇÃO: Adicionamos o '/sign' no final
  const response = await api.post('/signatures/sign', data); 
  return response.data;
};