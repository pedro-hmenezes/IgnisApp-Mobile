import api from './api';
import axios from 'axios';

// ⚙️ CONFIGURAÇÕES DO CLOUDINARY
// IMPORTANTE: Pegue essas credenciais no dashboard do Cloudinary
const CLOUDINARY_CLOUD_NAME = 'dx9welyij'; // Seu cloud name
const CLOUDINARY_UPLOAD_PRESET = 'ignisapp'; // Criar um unsigned upload preset
const CLOUDINARY_FOLDER = 'ignisapp'; // Pasta para organizar as imagens

// Upload DIRETO para Cloudinary (sem passar pelo backend)
export const uploadMedia = async (photoUri: string, occurrenceId?: string) => {
  try {
    console.log('📤 Upload DIRETO para Cloudinary iniciado...');
    console.log('📷 URI da foto:', photoUri);
    console.log('🆔 Occurrence ID:', occurrenceId);
    
    const formData = new FormData();
    
    // Prepara o arquivo
    const fileName = `${occurrenceId || 'temp'}-${Date.now()}.jpg`;
    const file = {
      uri: photoUri,
      type: 'image/jpeg',
      name: fileName,
    };
    
    formData.append('file', file as any);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', `${CLOUDINARY_FOLDER}/${occurrenceId || 'temp'}`);
    
    // Tags para organização
    if (occurrenceId) {
      formData.append('tags', `occurrence_${occurrenceId}`);
    }
    
    const startTime = Date.now();
    console.log('☁️ Enviando para Cloudinary...');
    
    // Upload DIRETO para Cloudinary (não passa pelo backend!)
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    const response = await axios.post(cloudinaryUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 segundos
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Upload Cloudinary concluído em ${duration}s`);
    console.log('📸 URL:', response.data.secure_url);
    
    // Retorna no formato esperado pelo backend
    return {
      sucesso: true,
      dados: {
        fileUrl: response.data.secure_url,
        publicId: response.data.public_id,
        format: response.data.format,
        width: response.data.width,
        height: response.data.height,
        bytes: response.data.bytes,
      }
    };
  } catch (error: any) {
    console.error('❌ ERRO no upload Cloudinary:');
    
    if (error.response) {
      console.error('📡 Resposta Cloudinary:', error.response.data);
      throw new Error(error.response.data?.error?.message || 'Erro no upload para Cloudinary');
    } else if (error.request) {
      console.error('📡 Sem resposta do Cloudinary');
      throw new Error('Cloudinary não respondeu. Verifique sua conexão.');
    } else {
      console.error('⚙️ Erro:', error.message);
      throw error;
    }
  }
};

// Upload de assinatura (base64) para Cloudinary como PNG
export const uploadSignature = async (signatureBase64: string, occurrenceId: string) => {
  try {
    console.log('✍️ Upload de assinatura para Cloudinary iniciado...');
    
    const formData = new FormData();
    
    // Cloudinary aceita base64 direto no campo 'file'
    // Formato: data:image/png;base64,iVBORw0KG...
    formData.append('file', signatureBase64);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', `${CLOUDINARY_FOLDER}/${occurrenceId}/signatures`);
    formData.append('tags', `occurrence_${occurrenceId},signature`);
    
    const startTime = Date.now();
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    const response = await axios.post(cloudinaryUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 segundos
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Assinatura enviada em ${duration}s`);
    console.log('🔗 URL:', response.data.secure_url);
    
    return {
      sucesso: true,
      dados: {
        fileUrl: response.data.secure_url,
        publicId: response.data.public_id,
      }
    };
  } catch (error: any) {
    console.error('❌ ERRO no upload da assinatura:', error);
    
    if (error.response) {
      console.error('📡 Resposta Cloudinary:', error.response.data);
      throw new Error('Erro ao enviar assinatura para Cloudinary');
    } else {
      throw new Error('Falha ao enviar assinatura. Verifique sua conexão.');
    }
  }
};

// Upload múltiplo para Cloudinary (estratégia: uploads individuais em paralelo)
export const uploadMultipleMedia = async (photoUris: string[], occurrenceId?: string) => {
  try {
    console.log(`📤 Iniciando upload de ${photoUris.length} fotos para Cloudinary (DIRETO)...`);
    
    // Faz upload de cada foto individualmente em paralelo
    const uploadPromises = photoUris.map(async (uri, index) => {
      console.log(`📸 Enviando foto ${index + 1}/${photoUris.length}...`);
      
      try {
        const response = await uploadMedia(uri, occurrenceId);
        console.log(`✅ Foto ${index + 1} enviada com sucesso`);
        return response.dados;
      } catch (error) {
        console.error(`❌ Erro na foto ${index + 1}:`, error);
        throw error;
      }
    });

    // Aguarda todos os uploads
    const uploadedPhotos = await Promise.all(uploadPromises);
    
    console.log(`✅ ${uploadedPhotos.length} fotos enviadas para Cloudinary`);
    
    // Agora registra as URLs no backend (apenas metadados, sem arquivos)
    let registeredPhotos = uploadedPhotos; // Por padrão, retorna os dados do Cloudinary
    
    if (occurrenceId && uploadedPhotos.length > 0) {
      console.log('📝 Registrando URLs no backend...');
      
      try {
        const registerResponse = await api.post('/media/register', {
          occurrenceId,
          photos: uploadedPhotos.map(photo => ({
            fileUrl: photo.fileUrl,
            publicId: photo.publicId,
            format: photo.format,
            width: photo.width,
            height: photo.height,
            bytes: photo.bytes,
          }))
        });
        
        console.log('✅ URLs registradas no backend');
        console.log('📦 Resposta do backend:', registerResponse.data);
        
        // Se o backend retornou os registros com _id, usa eles
        if (registerResponse.data?.dados && Array.isArray(registerResponse.data.dados)) {
          registeredPhotos = registerResponse.data.dados;
          console.log('✅ IDs das fotos registradas:', registeredPhotos.map((p: any) => p._id));
        }
      } catch (error: any) {
        console.warn('⚠️ Fotos enviadas mas não registradas no backend:', error.message);
        console.warn('⚠️ As fotos estão no Cloudinary mas podem não aparecer vinculadas à ocorrência');
        // Não falha aqui - fotos já estão no Cloudinary
      }
    }
    
    // Retorna no mesmo formato que a API esperaria
    return {
      sucesso: true,
      mensagem: `${uploadedPhotos.length} foto(s) enviada(s) com sucesso!`,
      dados: registeredPhotos, // Retorna os dados do backend (com _id) ou do Cloudinary
    };
  } catch (error: any) {
    console.error('❌ Erro no upload múltiplo:', error);
    throw new Error(error.message || 'Falha ao enviar fotos. Verifique sua conexão.');
  }
};