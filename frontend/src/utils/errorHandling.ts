import { toast } from 'sonner';
import { AxiosError } from 'axios';

/**
 * Error types for better error handling
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  statusCode?: number;
}

/**
 * Parse error from various sources
 */
export function parseError(error: any): AppError {
  // Axios error
  if (error.isAxiosError || error instanceof AxiosError) {
    const axiosError = error as AxiosError;
    
    if (!axiosError.response) {
      return {
        type: ErrorType.NETWORK,
        message: 'Erreur réseau - impossible de contacter le serveur',
        details: error.message,
      };
    }

    const status = axiosError.response.status;
    const data = axiosError.response.data as any;

    switch (status) {
      case 400:
        return {
          type: ErrorType.VALIDATION,
          message: data?.error?.message || 'Données invalides',
          details: data?.error?.details,
          statusCode: 400,
        };
      
      case 401:
        return {
          type: ErrorType.AUTHENTICATION,
          message: 'Session expirée - veuillez vous reconnecter',
          statusCode: 401,
        };
      
      case 403:
        return {
          type: ErrorType.AUTHORIZATION,
          message: 'Accès refusé - permissions insuffisantes',
          statusCode: 403,
        };
      
      case 404:
        return {
          type: ErrorType.NOT_FOUND,
          message: 'Ressource introuvable',
          statusCode: 404,
        };
      
      case 500:
      case 502:
      case 503:
        return {
          type: ErrorType.SERVER,
          message: 'Erreur serveur - veuillez réessayer plus tard',
          statusCode: status,
        };
      
      default:
        return {
          type: ErrorType.UNKNOWN,
          message: data?.error?.message || 'Une erreur est survenue',
          statusCode: status,
        };
    }
  }

  // Standard Error
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      message: error.message,
      details: error.stack,
    };
  }

  // Unknown error
  return {
    type: ErrorType.UNKNOWN,
    message: 'Une erreur inattendue est survenue',
    details: error,
  };
}

/**
 * Display error toast notification
 */
export function showError(error: any, customMessage?: string): void {
  const appError = parseError(error);
  
  toast.error(customMessage || appError.message, {
    description: appError.details ? String(appError.details) : undefined,
    duration: 5000,
  });
}

/**
 * Error boundary fallback component helper
 */
export function logError(error: Error, errorInfo: any): void {
  console.error('Error caught by boundary:', error);
  console.error('Error info:', errorInfo);
  
  // In production, send to error tracking service (e.g., Sentry)
  if (import.meta.env.PROD) {
    // window.Sentry?.captureException(error, { contexts: { react: errorInfo } });
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2,
    onRetry,
  } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxAttempts) {
        const waitTime = delay * Math.pow(backoff, attempt - 1);
        onRetry?.(attempt, error);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
}
