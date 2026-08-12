/**
 * Illustrative only — i18n catalog keyed by EErrorCode.
 */
import { EErrorCode } from '../../domain/common/errors/enums/EErrorCode';

export const ErrorCatalog: Record<
  EErrorCode,
  { 'pt-BR': string; en: string; es: string }
> = {
  [EErrorCode.RESOURCE_NOT_FOUND]: {
    'pt-BR': 'Recurso não encontrado',
    en: 'Resource not found',
    es: 'Recurso no encontrado',
  },
  [EErrorCode.RESOURCE_CONFLICT]: {
    'pt-BR': 'Conflito de recurso',
    en: 'Resource conflict',
    es: 'Conflicto de recurso',
  },
  [EErrorCode.DATABASE_ERROR]: {
    'pt-BR': 'Erro de banco de dados',
    en: 'Database error',
    es: 'Error de base de datos',
  },
  [EErrorCode.VALIDATION_ERROR]: {
    'pt-BR': 'Erro de validação',
    en: 'Validation error',
    es: 'Error de validación',
  },
  [EErrorCode.UNAUTHORIZED]: {
    'pt-BR': 'Não autenticado',
    en: 'Unauthorized',
    es: 'No autenticado',
  },
  [EErrorCode.FORBIDDEN]: {
    'pt-BR': 'Acesso negado',
    en: 'Forbidden',
    es: 'Acceso denegado',
  },
};
