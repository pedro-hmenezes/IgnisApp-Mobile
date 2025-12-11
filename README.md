# 🚒 IgnisApp Mobile

<div align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" />
</div>

<br />

> 📱 Aplicativo mobile para gerenciamento de ocorrências do Corpo de Bombeiros, com captura de evidências, geolocalização e assinatura digital.

## 📋 Sobre o Projeto

O **IgnisApp Mobile** é uma solução completa para digitalização do atendimento de ocorrências do Corpo de Bombeiros. O aplicativo permite que as equipes em campo registrem todas as informações relevantes, capturem evidências fotográficas, obtenham coordenadas GPS precisas e validem o atendimento com assinatura digital.

### ✨ Principais Funcionalidades

- 🔔 **Gerenciamento de Ocorrências**
  - Visualização de chamados ativos
  - Busca e filtros (recentes/antigas)
  - Detalhes completos do despacho (COBOM)
  - Histórico de ocorrências finalizadas

- 📸 **Captura de Evidências**
  - Integração com câmera do dispositivo
  - Upload direto para Cloudinary (sem sobrecarregar backend)
  - Organização por ocorrência
  - Visualização de fotos enviadas

- 📍 **Geolocalização**
  - Captura de coordenadas GPS de alta precisão
  - Visualização em mapa integrado
  - Mapa com filtros (ativas/todas/finalizadas)
  - Tracking de localização inicial e final

- ✍️ **Assinatura Digital**
  - Canvas para assinatura touch
  - Upload como imagem PNG para Cloudinary
  - Validação do responsável pelo atendimento

- 📊 **Relatórios**
  - Descrição detalhada das ações realizadas
  - Registro de viatura empenhada
  - Composição da equipe
  - Finalização com todos os dados consolidados

## 🛠️ Tecnologias Utilizadas

### Frontend (Mobile)
- **React Native** - Framework mobile multiplataforma
- **Expo** - Toolchain e plataforma de desenvolvimento
- **TypeScript** - Superset JavaScript com tipagem estática
- **React Navigation** - Navegação entre telas
- **React Native Maps** - Integração com mapas nativos
- **Expo Location** - Acesso à geolocalização
- **Expo Image Picker** - Captura de fotos
- **AsyncStorage** - Armazenamento local
- **Axios** - Cliente HTTP

### Serviços Cloud
- **Cloudinary** - CDN e armazenamento de mídia
  - Upload direto do mobile (sem passar pelo backend)
  - Otimização automática de imagens
  - Organização por pastas (occurrence_id)
  - Tags para filtragem

### Backend
- **Node.js + Express** - API REST
- **MongoDB** - Banco de dados NoSQL
- **JWT** - Autenticação segura
- **Deploy:** Render.com

## 🏗️ Arquitetura

```
┌─────────────┐
│   Mobile    │ ──────┐
│  (Expo)     │       │
└─────────────┘       │
                      ▼
              ┌──────────────┐
              │  Cloudinary  │ (Fotos + Assinaturas)
              └──────────────┘
                      │
                      │ URLs
                      ▼
              ┌──────────────┐
              │   Backend    │
              │   (API)      │
              └──────────────┘
                      │
                      ▼
              ┌──────────────┐
              │   MongoDB    │ (Metadados)
              └──────────────┘
```

**Fluxo de Upload Otimizado:**
1. 📱 Mobile captura foto/assinatura
2. ☁️ Upload direto para Cloudinary (rápido)
3. 🔗 Cloudinary retorna URL segura
4. 📝 Mobile envia apenas URL para backend
5. 💾 Backend salva metadados no MongoDB

## 🚀 Instalação e Configuração

### Pré-requisitos

```bash
Node.js >= 18.x
npm ou yarn
Expo CLI
Conta no Cloudinary (gratuita)
```

### Passo 1: Clone o Repositório

```bash
git clone https://github.com/pedro-hmenezes/IgnisApp-Mobile.git
cd IgnisApp-Mobile/ignisAppMobile
```

### Passo 2: Instale as Dependências

```bash
npm install
# ou
yarn install
```

### Passo 3: Configure o Cloudinary

1. Acesse [console.cloudinary.com](https://console.cloudinary.com/)
2. Vá em **Settings → Upload**
3. Crie um **Upload Preset**:
   - Nome: `ignisapp`
   - Signing Mode: **Unsigned**
   - Folder: `ignisapp`

4. Atualize o arquivo [mediaService.ts](ignisAppMobile/src/services/mediaService.ts):

```typescript
const CLOUDINARY_CLOUD_NAME = 'seu_cloud_name'; // Dashboard
const CLOUDINARY_UPLOAD_PRESET = 'ignisapp';
```

### Passo 4: Configure a API Backend

No arquivo [api.ts](ignisAppMobile/src/services/api.ts):

```typescript
const BASE_URL = 'https://seu-backend.com/api'; // Produção
// ou
const BASE_URL = 'http://192.168.1.XX:3000/api'; // Desenvolvimento local
```

### Passo 5: Execute o Projeto

```bash
npx expo start
```

Escaneie o QR Code com o **Expo Go** (Android/iOS)

## 📁 Estrutura do Projeto

```
ignisAppMobile/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── SignaturePad.tsx
│   │   └── SignatureDisplay.tsx
│   ├── constants/           # Constantes e temas
│   │   └── theme.ts
│   ├── routes/              # Navegação
│   │   └── AppNavigator.tsx
│   ├── screens/             # Telas da aplicação
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── DetailsScreen.tsx
│   │   ├── MapScreen.tsx
│   │   ├── ReportsScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/            # Integração com APIs
│   │   ├── api.ts           # Cliente Axios
│   │   ├── mediaService.ts  # Upload Cloudinary
│   │   ├── occurrenceService.ts
│   │   └── signatureService.ts
│   └── types/               # TypeScript types
│       └── types.ts
├── assets/                  # Imagens e recursos
├── app.json                 # Configuração Expo
├── package.json
└── tsconfig.json
```

## 📱 Telas Principais

### 🏠 Home
- Lista de ocorrências ativas
- Busca por palavras-chave
- Filtros: Recentes / Antigas
- Cards com informações resumidas

### 📄 Detalhes da Ocorrência
- Dados completos do despacho (COBOM)
- Formulário de relatório operacional
- Captura de fotos (câmera)
- Captura de GPS
- Assinatura digital
- Finalização da ocorrência

### 🗺️ Mapa
- Visualização geográfica das ocorrências
- Marcadores coloridos por status
- Filtros: Ativas / Todas / Finalizadas
- Navegação para detalhes ao clicar

### 📊 Relatórios
- Histórico de ocorrências finalizadas
- Filtro por período
- Visualização somente leitura

## 🔐 Autenticação

O app utiliza **JWT (JSON Web Tokens)** para autenticação:

1. Login com credenciais
2. Token armazenado no AsyncStorage
3. Interceptor Axios adiciona token automaticamente
4. Renovação automática do token

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes E2E (em desenvolvimento)
npm run test:e2e
```

## 📦 Build de Produção

### Android (APK)

```bash
eas build --platform android --profile production
```

### iOS (IPA)

```bash
eas build --platform ios --profile production
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga os passos:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Pedro Menezes** - [@pedro-hmenezes](https://github.com/pedro-hmenezes)

## 🙏 Agradecimentos

- Corpo de Bombeiros pela parceria no desenvolvimento
- Comunidade React Native
- Cloudinary pelo serviço de CDN

---

<div align="center">
  Desenvolvido com ❤️ e ☕ para salvar vidas 🚒
</div>