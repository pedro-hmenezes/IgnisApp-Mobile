import api from './api';

export const uploadMedia = async (formData: FormData) => {
  try {
    console.log('📤 Iniciando upload de mídia...');
    
    // Rota: POST /api/media/upload
    const response = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
      timeout: 30000, // 30 segundos para upload
      transformRequest: (data) => data,
    });
    
    console.log('✅ Upload concluído:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erro no upload de mídia:', error);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
      throw new Error(error.response.data?.mensagem || `Erro ${error.response.status} no upload`);
    } else if (error.request) {
      console.error('Sem resposta do servidor no upload');
      throw new Error('Falha ao enviar foto. Verifique sua conexão.');
    } else {
      console.error('Erro:', error.message);
      throw error;
    }
  }
};