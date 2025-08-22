import sanitizeHtml from 'sanitize-html';
import { body, param, validationResult, ValidationChain } from 'express-validator';
import mongoSanitize from 'mongo-sanitize';
import { Request, Response, NextFunction } from "express";
import {
  IsUsername, IsPassword, IsEmail, IsName, IsPhone, IsRut,
  IsObjectId, IsNumero, IsParagraph, IsBoolean, IsNameDepto
} from '../../Library/Validations';

// Middleware para manejar errores de validación
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ 
      message: 'Errores de validación',
      errors: errors.array()
    });
    return;
  }
  
  // Sanitizar todo el body contra inyecciones NoSQL
  req.body = mongoSanitize(req.body);
  next();
};

// Validaciones para Personas
export const validatePerson = [
  body('dni')
    .trim()
    .notEmpty().withMessage('El DNI es obligatorio')
    .custom((value) => {
      if (!IsRut(value)) {
        throw new Error('El DNI debe ser un RUT válido');
      }
      return true;
    }),
  
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .custom((value) => {
      if (!IsName(value)) {
        throw new Error('El nombre contiene caracteres no válidos');
      }
      return true;
    })
    .customSanitizer(value => sanitizeHtml(value)),
  
  body('age')
    .optional()
    .isInt({ min: 0, max: 150 }).withMessage('La edad debe ser un número entre 0 y 150'),
  
  body('birthdate')
    .optional()
    .isISO8601().withMessage('La fecha de nacimiento debe tener formato válido'),
  
  body('email01')
    .trim()
    .notEmpty().withMessage('El email principal es obligatorio')
    .custom((value) => {
      if (!IsEmail(value)) {
        throw new Error('El email principal no es válido');
      }
      return true;
    })
    .normalizeEmail(),
  
  body('email02')
    .optional()
    .custom((value) => {
      if (value && !IsEmail(value)) {
        throw new Error('El email secundario no es válido');
      }
      return true;
    })
    .normalizeEmail(),
  
  body('phone01')
    .optional()
    .custom((value) => {
      if (value && !IsPhone(value)) {
        throw new Error('El teléfono principal no es válido');
      }
      return true;
    }),
  
  body('phone02')
    .optional()
    .custom((value) => {
      if (value && !IsPhone(value)) {
        throw new Error('El teléfono secundario no es válido');
      }
      return true;
    }),
  
  body('address')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !IsParagraph(value)) {
        throw new Error('La dirección contiene caracteres no válidos');
      }
      return true;
    })
    .customSanitizer(value => value ? sanitizeHtml(value) : value),
  
  body('state')
    .notEmpty().withMessage('La comuna es obligatoria')
    .custom((value) => {
      if (!IsObjectId(value)) {
        throw new Error('ID de comuna no válido');
      }
      return true;
    }),
  
  body('country')
    .notEmpty().withMessage('El país es obligatorio')
    .custom((value) => {
      if (!IsObjectId(value)) {
        throw new Error('ID de país no válido');
      }
      return true;
    }),
  
  body('postalCode')
    .optional()
    .trim()
    .isLength({ min: 3, max: 10 }).withMessage('Código postal debe tener entre 3 y 10 caracteres'),
  
  handleValidationErrors
];

// Validaciones para Usuarios
export const validateUser = [
  body('username')
    .trim()
    .notEmpty().withMessage('El nombre de usuario es obligatorio')
    .custom((value) => {
      if (!IsUsername(value)) {
        throw new Error('El nombre de usuario no es válido (solo letras minúsculas, máximo 20 caracteres)');
      }
      return true;
    }),
  
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .custom((value) => {
      if (!IsEmail(value)) {
        throw new Error('El email no es válido');
      }
      return true;
    })
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .custom((value) => {
      if (!IsPassword(value)) {
        throw new Error('La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos');
      }
      return true;
    }),
  
  body('personId')
    .notEmpty().withMessage('El ID de persona es obligatorio')
    .custom((value) => {
      if (!IsObjectId(value)) {
        throw new Error('ID de persona no válido');
      }
      return true;
    }),
  
  body('roleId')
    .notEmpty().withMessage('El ID de rol es obligatorio')
    .custom((value) => {
      if (!IsObjectId(value)) {
        throw new Error('ID de rol no válido');
      }
      return true;
    }),
  
  body('isActive')
    .optional()
    .custom((value) => {
      if (value !== undefined && !IsBoolean(value)) {
        throw new Error('El estado activo debe ser un valor booleano válido');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Validaciones para Gerencias
export const validateGerencia = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre de la gerencia es obligatorio')
    .custom((value) => {
      if (!IsNameDepto(value)) {
        throw new Error('El nombre de la gerencia contiene caracteres no válidos');
      }
      return true;
    })
    .customSanitizer(value => sanitizeHtml(value)),
  
  body('codigo')
    .notEmpty().withMessage('El código es obligatorio')
    .custom((value) => {
      if (!IsNumero(value)) {
        throw new Error('El código debe ser un número válido');
      }
      return true;
    }),
  
  body('descripcion')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !IsParagraph(value)) {
        throw new Error('La descripción contiene caracteres no válidos');
      }
      return true;
    })
    .customSanitizer(value => value ? sanitizeHtml(value) : value),
  
  body('activo')
    .optional()
    .custom((value) => {
      if (value !== undefined && !IsBoolean(value)) {
        throw new Error('El estado activo debe ser un valor booleano válido');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Validaciones para Login
export const validateLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('El nombre de usuario o email es obligatorio')
    .customSanitizer(value => sanitizeHtml(value)),
  
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria'),
  
  handleValidationErrors
];

// Validaciones para parámetros de ID
export const validateObjectId = [
  param('id')
    .custom((value) => {
      if (!IsObjectId(value)) {
        throw new Error('ID no válido');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Validación para ID en el body
export const validateObjectIdInBody = [
  body('id')
    .notEmpty().withMessage('El ID es obligatorio')
    .custom((value) => {
      if (!IsObjectId(value)) {
        throw new Error('ID no válido');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Validación para códigos de gerencia
export const validateGerenciaCodigo = [
  body('codigo')
    .notEmpty().withMessage('El código es obligatorio')
    .custom((value) => {
      if (!IsNumero(value)) {
        throw new Error('El código debe ser un número válido');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Validación para nombres de gerencia en consultas
export const validateGerenciaName = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .custom((value) => {
      if (!IsNameDepto(value)) {
        throw new Error('El nombre contiene caracteres no válidos');
      }
      return true;
    })
    .customSanitizer(value => sanitizeHtml(value)),
  
  handleValidationErrors
];

// Validación genérica para campos comunes
export const validateCommonFields = [
  body('name')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !IsName(value)) {
        throw new Error('El nombre contiene caracteres no válidos');
      }
      return true;
    })
    .customSanitizer(value => value ? sanitizeHtml(value) : value),
  
  body('email')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !IsEmail(value)) {
        throw new Error('El email no es válido');
      }
      return true;
    })
    .normalizeEmail(),
  
  body('message')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !IsParagraph(value)) {
        throw new Error('El mensaje contiene caracteres no válidos');
      }
      return true;
    })
    .customSanitizer(value => value ? sanitizeHtml(value) : value),
  
  handleValidationErrors
];

// Validación para nombres de permisos
export const validatePermissionNames = [
  body('names')
    .notEmpty().withMessage('El campo names es obligatorio')
    .isArray({ min: 1 }).withMessage('Los nombres deben ser un array con al menos un elemento')
    .custom((names) => {
      if (!Array.isArray(names)) {
        throw new Error('Los nombres deben ser un array');
      }
      for (const name of names) {
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
          throw new Error('Todos los nombres deben ser strings no vacíos');
        }
        // Validación específica para nombres de permisos (permite letras, números y guiones bajos)
        const permissionNameRegex = /^[a-zA-Z0-9_]+$/;
        if (!permissionNameRegex.test(name.trim())) {
          throw new Error(`El nombre "${name}" contiene caracteres no válidos. Solo se permiten letras, números y guiones bajos`);
        }
      }
      return true;
    })
    .customSanitizer((names) => {
      // Verificar que names existe y es un array antes de usar map
      if (!names || !Array.isArray(names)) {
        return names;
      }
      return names.map((name: string) => {
        if (typeof name === 'string') {
          return sanitizeHtml(name.trim());
        }
        return name;
      });
    }),
  
  handleValidationErrors
];

export const validatePermissionById = [
  body('id')
    .notEmpty().withMessage('El ID es obligatorio')
    .custom((value) => {
      if (!IsObjectId(value)) {
        throw new Error('ID no válido');
      }
      return true;
    }),

  handleValidationErrors
];

// Middleware original mantenido para compatibilidad
const validateAndSanitize = [
  // Validar el campo 'name'
  body('name')
    .trim() // Eliminar espacios en blanco al inicio y al final
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres.')
    .customSanitizer(value => sanitizeHtml(value)), // Limpiar contenido HTML

  // Validar el campo 'email'
  body('email')
    .trim()
    .isEmail().withMessage('El correo electrónico no es válido.')
    .normalizeEmail(), // Normalizar el formato del correo

  // Validar el campo 'message' (limpiar contenido HTML)
  body('message')
    .trim()
    .notEmpty().withMessage('El mensaje es obligatorio.')
    .customSanitizer(value => sanitizeHtml(value)),

  // Middleware para manejar errores
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    next();
  }
];

// Validación para creación de roles
export const validateRole = [
  body('*.name')
    .trim()
    .notEmpty().withMessage('El nombre del rol es obligatorio')
    .custom((value) => {
      if (!IsNameDepto(value)) {
        throw new Error('El nombre del rol contiene caracteres no válidos');
      }
      return true;
    })
    .customSanitizer(value => sanitizeHtml(value)),
  
  body('*.description')
    .trim()
    .notEmpty().withMessage('La descripción del rol es obligatoria')
    .custom((value) => {
      if (!IsParagraph(value)) {
        throw new Error('La descripción contiene caracteres no válidos');
      }
      return true;
    })
    .customSanitizer(value => sanitizeHtml(value)),
  
  body('*.permissions')
    .notEmpty().withMessage('Los permisos son obligatorios')
    .isArray({ min: 1 }).withMessage('Los permisos deben ser un array con al menos un elemento')
    .custom((permissions) => {
      if (!Array.isArray(permissions)) {
        throw new Error('Los permisos deben ser un array');
      }
      for (const permissionId of permissions) {
        if (!permissionId || typeof permissionId !== 'string') {
          throw new Error('Todos los permisos deben ser IDs válidos (strings)');
        }
        if (!IsObjectId(permissionId)) {
          throw new Error(`El ID de permiso "${permissionId}" no es un ObjectId válido`);
        }
      }
      return true;
    }),
  
  handleValidationErrors
];

// Validación para obtener rol por ID
export const validateRoleById = [
  body('id')
    .trim()
    .notEmpty().withMessage('El ID del rol es obligatorio')
    .custom((value) => {
      if (!IsObjectId(value)) {
        throw new Error('El ID del rol debe ser un ObjectId válido');
      }
      return true;
    }),
  
  handleValidationErrors
];

export const validateRoleName = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre del rol es obligatorio')
    .custom((value) => {
      if (!IsName(value)) {
        throw new Error('El nombre del rol contiene caracteres no válidos');
      }
      return true;
    })
    .customSanitizer(value => sanitizeHtml(value))
];

// Validación para creación de persona con usuario
export const validateCreatePerson = [
  body('dni')
    .trim()
    .notEmpty().withMessage('El DNI es obligatorio')
    .custom((value) => {
      if (!IsRut(value)) {
        throw new Error('El DNI debe ser un RUT válido');
      }
      return true;
    }),
  
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .custom((value) => {
      if (!IsName(value)) {
        throw new Error('El nombre contiene caracteres no válidos');
      }
      return true;
    })
    .customSanitizer(value => sanitizeHtml(value)),
  
  body('age')
    .optional()
    .isInt({ min: 0, max: 150 }).withMessage('La edad debe ser un número entre 0 y 150'),
  
  body('birthdate')
    .optional()
    .custom((value) => {
      if (value) {
        // Validar formato DD/MM/YYYY
        const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        if (!dateRegex.test(value)) {
          throw new Error('La fecha de nacimiento debe tener formato DD/MM/YYYY');
        }
        
        const [, day, month, year] = value.match(dateRegex);
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        
        if (date.getDate() != day || date.getMonth() != month - 1 || date.getFullYear() != year) {
          throw new Error('La fecha de nacimiento no es válida');
        }
        
        if (date > new Date()) {
          throw new Error('La fecha de nacimiento no puede ser futura');
        }
      }
      return true;
    }),
  
  body('email01')
    .trim()
    .notEmpty().withMessage('El email principal es obligatorio')
    .custom((value) => {
      if (!IsEmail(value)) {
        throw new Error('El email principal no es válido');
      }
      return true;
    })
    .normalizeEmail(),
  
  body('email02')
    .optional()
    .custom((value) => {
      if (value && !IsEmail(value)) {
        throw new Error('El email secundario no es válido');
      }
      return true;
    })
    .normalizeEmail(),
  
  body('phone01')
    .optional()
    .custom((value) => {
      if (value && !IsPhone(value)) {
        throw new Error('El teléfono principal no es válido');
      }
      return true;
    }),
  
  body('phone02')
    .optional()
    .custom((value) => {
      if (value && !IsPhone(value)) {
        throw new Error('El teléfono secundario no es válido');
      }
      return true;
    }),
  
  body('address')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !IsParagraph(value)) {
        throw new Error('La dirección contiene caracteres no válidos');
      }
      return true;
    })
    .customSanitizer(value => value ? sanitizeHtml(value) : value),
  
  body('state')
    .notEmpty().withMessage('La comuna es obligatoria')
    .custom((value) => {
      if (!IsObjectId(value)) {
        throw new Error('ID de comuna no válido');
      }
      return true;
    }),
  
  body('country')
    .notEmpty().withMessage('El país es obligatorio')
    .custom((value) => {
      if (!IsObjectId(value)) {
        throw new Error('ID de país no válido');
      }
      return true;
    }),
  
  body('postalCode')
    .optional()
    .custom((value) => {
      if (value) {
        // Permitir tanto string como number para código postal
        const postalCodeStr = value.toString();
        if (!/^\d{7}$/.test(postalCodeStr)) {
          throw new Error('El código postal debe tener exactamente 7 dígitos');
        }
      }
      return true;
    }),
  
  // Validaciones para datos de usuario
  body('username')
    .trim()
    .notEmpty().withMessage('El nombre de usuario es obligatorio')
    .custom((value) => {
      if (!IsUsername(value)) {
        throw new Error('El nombre de usuario no es válido (solo letras minúsculas, máximo 20 caracteres)');
      }
      return true;
    }),
  
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .custom((value) => {
      if (!IsPassword(value)) {
        throw new Error('La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos');
      }
      return true;
    }),
  
  body('role')
    .notEmpty().withMessage('El ID de rol es obligatorio')
    .custom((value) => {
      if (!IsObjectId(value)) {
        throw new Error('ID de rol no válido');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Validaciones para Asignación
export const validateAsignacion = [
  body('dni')
    .trim()
    .notEmpty().withMessage('El DNI es obligatorio')
    .custom((value) => {
      if (!IsRut(value)) {
        throw new Error('El DNI debe ser un RUT válido');
      }
      return true;
    }),
  
  body('serie')
    .trim()
    .notEmpty().withMessage('La serie es obligatoria')
    .custom((value) => {
      if (!IsParagraph(value)) {
        throw new Error('La serie contiene caracteres no válidos');
      }
      return true;
    })
    .customSanitizer(value => sanitizeHtml(value)),
  
  body('centrocosto')
    .notEmpty().withMessage('El centro de costo es obligatorio')
    .custom((value) => {
      if (!IsNumero(value)) {
        throw new Error('El centro de costo debe ser un número válido');
      }
      return true;
    }),
  
  handleValidationErrors
];

export { validateAndSanitize };