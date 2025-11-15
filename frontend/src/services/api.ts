import axios from 'axios';
import { Platform } from 'react-native';

// Configuração inteligente da URL base usando variáveis de ambiente
const getBaseURL = () => {
  if (__DEV__) {
    // Em desenvolvimento, usa URLs específicas para cada plataforma
    if (Platform.OS === 'android') {
      return process.env.EXPO_PUBLIC_API_URL_DEV_ANDROID || 'http://10.0.2.2:3000';
    } else if (Platform.OS === 'ios') {
      return process.env.EXPO_PUBLIC_API_URL_DEV_IOS || 'http://localhost:3000';
    }
    // Web e outras plataformas
    return process.env.EXPO_PUBLIC_API_URL_DEV_WEB || 'http://localhost:3000';
  }
  // Em produção, usa a URL do servidor real
  return process.env.EXPO_PUBLIC_API_URL_PRODUCTION || 'http://localhost:3000';
};

// Configuração base do Axios com variáveis de ambiente
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '10000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento global de erros
api.interceptors.response.use(
  (response) => {
    // Log para debug em desenvolvimento
    if (__DEV__ && process.env.EXPO_PUBLIC_DEBUG === 'true') {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Normaliza e anexa uma mensagem amigável ao erro para uso pela UI
    const responseData = error.response?.data;
    const messageData = responseData?.message;

    let userMessage = '';
    if (messageData) {
      userMessage = Array.isArray(messageData) ? messageData.join(', ') : String(messageData);
    } else if (error.response?.statusText) {
      userMessage = error.response.statusText;
    } else if (error.message) {
      userMessage = error.message;
    } else {
      userMessage = 'Erro desconhecido do servidor';
    }

    // Attach normalized message so callers can use error.userMessage or error.message
    try {
      error.userMessage = userMessage;
      // also set message so Error.message contains it
      error.message = userMessage;
    } catch {
      // ignore immutability issues
    }

    console.error('API Error:', responseData || error.message);
    
    // Log detalhado para debug em desenvolvimento
    if (__DEV__ && process.env.EXPO_PUBLIC_DEBUG === 'true') {
      console.error('🔴 Detalhes do erro:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
        code: error.code
      });
    }
    
    // Tratamento específico por status code
    if (error.response?.status === 401) {
      // Token expirado - redirecionar para login
      console.log('Token expirado - redirecionando para login');
      // Aqui você pode adicionar lógica de logout/redirecionamento
    } else if (error.response?.status === 500) {
      console.log('Erro interno do servidor');
    } else if (error.code === 'ECONNABORTED') {
      console.log('Timeout da requisição - servidor não respondeu a tempo');
    } else if (error.message === 'Network Error') {
      console.log('Erro de rede - verifique se o backend está rodando e acessível');
      console.log('URL tentada:', error.config?.baseURL + error.config?.url);
    }
    
    return Promise.reject(error);
  }
);

export default api;