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