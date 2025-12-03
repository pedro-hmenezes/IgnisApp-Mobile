// src/types/types.ts

// --- TIPAGEM DE USUÁRIO E LOGIN ---

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'operador' | 'major' | 'administrador';
}

// O que o Back-end devolve quando o login dá certo (res.json(result))
// Geralmente o "result" do Service contém o token e os dados do usuário
export interface AuthResponse {
  token: string;
  user: User; 
}

// --- TIPAGEM DE OCORRÊNCIA (Baseado no OccurrenceInterfaces.ts) ---

export interface Endereco {
  rua: string;
  numero: string;
  bairro: string;
  municipio: string;
  referencia?: string;
}

export interface Solicitante {
  nome: string;
  telefone: string;
  relacao: string;
}

export interface Occurrence {
  _id: string; // MongoDB sempre manda _id
  numAviso: string;
  tipoOcorrencia: string;
  // Datas vêm como string ISO via JSON (ex: "2025-12-03T10:00:00Z")
  timestampRecebimento: string; 
  formaAcionamento: string;
  situacaoOcorrencia: string;
  naturezaInicial: string;
  endereco: Endereco;
  solicitante: Solicitante;
  criadoPor: string; // ID do usuário que criou
  statusGeral: 'em andamento' | 'finalizada' | 'cancelada';
  createdAt?: string;
  updatedAt?: string;
}