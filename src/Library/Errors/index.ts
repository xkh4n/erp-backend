/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Login Controllers:');
logger.level = 'all';

export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  DATABASE = 'DATABASE_ERROR',
  SERVER = 'SERVER_ERROR'
}

export interface ErrorResponse {
  type: ErrorType;
  message: string;
  code: number;
  details?: any;
}

export class CustomError extends Error {
  public type: ErrorType;
  public code: number;
  public details?: any;

  constructor(type: ErrorType, message: string, code: number = 500, details?: any) {
    super(message);
    this.type = type;
    this.code = code;
    this.details = details;
    this.name = 'CustomError';

    // Log the error
    logger.error(`${this.type}: ${this.message}`, {
      code: this.code,
      details: this.details
    });
  }

  public toJSON(): ErrorResponse {
    return {
      type: this.type,
      message: this.message,
      code: this.code,
      details: this.details
    };
  }
}

// Helper methods to create specific error types
export const createValidationError = (message: string, details?: any) => {
  return new CustomError(ErrorType.VALIDATION, message, 400, details);
};

export const createAuthenticationError = (message: string, details?: any) => {
  return new CustomError(ErrorType.AUTHENTICATION, message, 401, details);
};

export const createAuthorizationError = (message: string, details?: any) => {
  return new CustomError(ErrorType.AUTHORIZATION, message, 403, details);
};

export const createNotFoundError = (message: string, details?: any) => {
  return new CustomError(ErrorType.NOT_FOUND, message, 404, details);
};

export const createDatabaseError = (message: string, details?: any) => {
  return new CustomError(ErrorType.DATABASE, message, 500, details);
};

export const createServerError = (message: string, details?: any) => {
  return new CustomError(ErrorType.SERVER, message, 500, details);
};