import api from './api';
import { Occurrence } from '../types/types'; // Lembra da tipagem que criamos?

export const getOccurrences = async (): Promise<Occurrence[]> => {
  try {
    // Chama a rota GET /api/occurrences
    const response = await api.get('/occurrences');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar ocorrências:', error);
    throw error;
  }
};

export const updateOccurrence = async (id: string, data: Partial<Occurrence>) => {
  try {
    // Rota: /api/occurrences/:id
    const response = await api.patch(`/occurrences/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar ocorrência:', error);
    throw error;
  }
};

export const getOccurrenceById = async (id: string): Promise<Occurrence> => {
  try {
    // Rota GET para buscar uma ocorrência específica
    // Isso garante que receberemos o objeto completo (com solicitante, viatura, etc)
    const response = await api.get(`/occurrences/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar detalhes da ocorrência:', error);
    throw error;
  }
};

export const finalizeOccurrenceService = async (id: string, data: any) => {
  try {
    console.log(`🔄 Finalizando ocorrência ${id}...`);
    console.log('📦 Payload:', JSON.stringify(data, null, 2));
    
    // Rota: PATCH /api/occurrences/:id/finalize
    const response = await api.patch(`/occurrences/${id}/finalize`, data);
    
    console.log('✅ Resposta do servidor:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao finalizar ocorrência:', error);
    
    if (error.response) {
      // O servidor respondeu com um status de erro
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
      throw new Error(error.response.data?.mensagem || `Erro ${error.response.status}: ${error.response.statusText}`);
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('Sem resposta do servidor');
      throw new Error('Servidor não respondeu. Verifique sua conexão com a internet.');
    } else {
      // Erro ao configurar a requisição
      console.error('Erro:', error.message);
      throw error;
    }
  }
};