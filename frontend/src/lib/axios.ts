import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { toast } from 'sonner';

// Configuration de base
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 90000; // 90 seconds for cold start

// Créer instance Axios
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure automatic retry for network errors and 5xx errors
axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: (retryCount) => {
    return retryCount * 2000; // 2s, 4s, 6s
  },
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           (error.response?.status ? error.response.status >= 500 : false);
  },
});

// Intercepteur de requête - Ajouter token JWT
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse - Gestion erreurs & refresh token
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Si erreur 401 et pas déjà tenté de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        
        // Tenter de rafraîchir le token
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        
        // Sauvegarder les nouveaux tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Réessayer la requête originale
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Échec du refresh - déconnecter l'utilisateur
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Rediriger vers login
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }
    
    // Gestion des autres erreurs
    handleApiError(error);
    
    return Promise.reject(error);
  }
);

// Fonction de gestion des erreurs
const handleApiError = (error: AxiosError) => {
  if (!error.response) {
    toast.error('Erreur réseau', {
      description: 'Impossible de contacter le serveur',
    });
    return;
  }
  
  const status = error.response.status;
  const data = error.response.data as any;
  
  switch (status) {
    case 400:
      toast.error('Requête invalide', {
        description: data?.error?.message || 'Vérifiez les données saisies',
      });
      break;
    
    case 401:
      // Déjà géré par l'intercepteur
      break;
    
    case 403:
      toast.error('Accès refusé', {
        description: data?.error?.message || 'Vous n\'avez pas les permissions nécessaires',
      });
      break;
    
    case 404:
      toast.error('Ressource introuvable', {
        description: data?.error?.message || 'La ressource demandée n\'existe pas',
      });
      break;
    
    case 409:
      toast.error('Conflit', {
        description: data?.error?.message || 'Cette action crée un conflit',
      });
      break;
    
    case 429:
      toast.error('Trop de requêtes', {
        description: 'Veuillez patienter avant de réessayer',
      });
      break;
    
    case 500:
    case 502:
    case 503:
      toast.error('Erreur serveur', {
        description: 'Une erreur est survenue, veuillez réessayer plus tard',
      });
      break;
    
    default:
      toast.error('Erreur', {
        description: data?.error?.message || 'Une erreur inattendue est survenue',
      });
  }
};

// Export instance configurée
export default axiosInstance;

// Helper functions pour les requêtes
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => 
    axiosInstance.get<T>(url, config).then(res => res.data),
  
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    axiosInstance.post<T>(url, data, config).then(res => res.data),
  
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    axiosInstance.put<T>(url, data, config).then(res => res.data),
  
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    axiosInstance.patch<T>(url, data, config).then(res => res.data),
  
  delete: <T>(url: string, config?: AxiosRequestConfig) => 
    axiosInstance.delete<T>(url, config).then(res => res.data),
};
