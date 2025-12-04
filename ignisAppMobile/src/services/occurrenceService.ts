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