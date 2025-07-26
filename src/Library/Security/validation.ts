// Biblioteca de validaciones de seguridad para el backend
import { createValidationError } from '../../Library/Errors/index';

export interface SecurityValidationResult {
    isValid: boolean;
    sanitizedData?: any;
    errors: string[];
}

// Función para sanitizar strings y prevenir inyección
export const sanitizeInput = (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    
    return input
        .trim()
        .replace(/[<>'"&]/g, (char) => {
            const charMap: { [key: string]: string } = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '&': '&amp;'
            };
            return charMap[char] || char;
        });
};

// Validar y sanitizar email
export const validateAndSanitizeEmail = (email: string): SecurityValidationResult => {
    const errors: string[] = [];
    
    if (!email) {
        errors.push('El correo electrónico es requerido');
        return { isValid: false, errors };
    }
    
    const sanitizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(sanitizedEmail)) {
        errors.push('El formato del correo electrónico no es válido');
    }
    
    if (sanitizedEmail.length > 254) {
        errors.push('El correo electrónico es demasiado largo');
    }
    
    return {
        isValid: errors.length === 0,
        sanitizedData: sanitizedEmail,
        errors
    };
};

// Validar ObjectId de MongoDB
export const validateObjectId = (id: string, fieldName: string): SecurityValidationResult => {
    const errors: string[] = [];
    
    if (!id) {
        errors.push(`${fieldName} es requerido`);
        return { isValid: false, errors };
    }
    
    const objectIdRegex = /^[a-f\d]{24}$/i;
    if (!objectIdRegex.test(id)) {
        errors.push(`${fieldName} no tiene un formato válido`);
    }
    
    return {
        isValid: errors.length === 0,
        sanitizedData: id,
        errors
    };
};

// Validar teléfono
export const validatePhoneNumber = (phone: string, fieldName: string): SecurityValidationResult => {
    const errors: string[] = [];
    
    if (!phone) {
        errors.push(`${fieldName} es requerido`);
        return { isValid: false, errors };
    }
    
    const sanitizedPhone = phone.replace(/[^+\d\s()-]/g, ''); // Remover caracteres peligrosos
    const phoneRegex = /^[+]?[\d\s()-]{8,20}$/;
    
    if (!phoneRegex.test(sanitizedPhone)) {
        errors.push(`${fieldName} no tiene un formato válido`);
    }
    
    if (sanitizedPhone.length < 8 || sanitizedPhone.length > 20) {
        errors.push(`${fieldName} debe tener entre 8 y 20 caracteres`);
    }
    
    return {
        isValid: errors.length === 0,
        sanitizedData: sanitizedPhone,
        errors
    };
};

// Validar texto general con longitud y caracteres permitidos
export const validateTextInput = (
    text: string, 
    fieldName: string, 
    minLength: number = 1, 
    maxLength: number = 100
): SecurityValidationResult => {
    const errors: string[] = [];
    
    if (!text) {
        errors.push(`${fieldName} es requerido`);
        return { isValid: false, errors };
    }
    
    const sanitizedText = sanitizeInput(text);
    
    if (sanitizedText.length < minLength) {
        errors.push(`${fieldName} debe tener al menos ${minLength} caracteres`);
    }
    
    if (sanitizedText.length > maxLength) {
        errors.push(`${fieldName} no puede exceder ${maxLength} caracteres`);
    }
    
    // Verificar caracteres peligrosos adicionales
    const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /vbscript:/i,
        /on\w+\s*=/i,
        /eval\s*\(/i,
        /expression\s*\(/i
    ];
    
    for (const pattern of dangerousPatterns) {
        if (pattern.test(sanitizedText)) {
            errors.push(`${fieldName} contiene contenido no permitido`);
            break;
        }
    }
    
    return {
        isValid: errors.length === 0,
        sanitizedData: sanitizedText,
        errors
    };
};

// Validar código/serie alfanumérico
export const validateSerialCode = (code: string): SecurityValidationResult => {
    const errors: string[] = [];
    
    if (!code) {
        errors.push('El código/serie es requerido');
        return { isValid: false, errors };
    }
    
    const sanitizedCode = code.toUpperCase().replace(/[^A-Z0-9\-_]/g, '');
    
    if (!/^[A-Z0-9\-_]{1,50}$/.test(sanitizedCode)) {
        errors.push('El código/serie solo puede contener letras, números, guiones y guiones bajos');
    }
    
    if (sanitizedCode.length < 1 || sanitizedCode.length > 50) {
        errors.push('El código/serie debe tener entre 1 y 50 caracteres');
    }
    
    return {
        isValid: errors.length === 0,
        sanitizedData: sanitizedCode,
        errors
    };
};

// Validar formulario completo de producto
export const validateProductInput = (data: any): SecurityValidationResult => {
    const errors: string[] = [];
    const sanitizedData: any = {};
    
    // Validar IDs obligatorios
    const solicitudValidation = validateObjectId(data.solicitudId, 'Solicitud');
    const proveedorValidation = validateObjectId(data.proveedorId, 'Proveedor');
    const productoValidation = validateObjectId(data.productoId, 'Producto');
    
    if (!solicitudValidation.isValid) errors.push(...solicitudValidation.errors);
    else sanitizedData.solicitudId = solicitudValidation.sanitizedData;
    
    if (!proveedorValidation.isValid) errors.push(...proveedorValidation.errors);
    else sanitizedData.proveedorId = proveedorValidation.sanitizedData;
    
    if (!productoValidation.isValid) errors.push(...productoValidation.errors);
    else sanitizedData.productoId = productoValidation.sanitizedData;
    
    // Validar código/serie
    const serieValidation = validateSerialCode(data.nroSerie);
    if (!serieValidation.isValid) errors.push(...serieValidation.errors);
    else sanitizedData.nroSerie = serieValidation.sanitizedData;
    
    // Validar email
    const emailValidation = validateAndSanitizeEmail(data.email);
    if (!emailValidation.isValid) errors.push(...emailValidation.errors);
    else sanitizedData.email = emailValidation.sanitizedData;
    
    // Validar teléfonos
    const telefonoValidation = validatePhoneNumber(data.telefono, 'Teléfono');
    const fonoContactoValidation = validatePhoneNumber(data.fonoContacto, 'Fono Contacto');
    
    if (!telefonoValidation.isValid) errors.push(...telefonoValidation.errors);
    else sanitizedData.telefono = telefonoValidation.sanitizedData;
    
    if (!fonoContactoValidation.isValid) errors.push(...fonoContactoValidation.errors);
    else sanitizedData.fonoContacto = fonoContactoValidation.sanitizedData;
    
    // Validar campos de texto
    const direccionValidation = validateTextInput(data.direccion, 'Dirección', 5, 200);
    const contactoValidation = validateTextInput(data.contacto, 'Contacto', 2, 100);
    const condicionesPagoValidation = validateTextInput(data.condicionesPago, 'Condiciones de Pago', 3, 150);
    const condicionesEntregaValidation = validateTextInput(data.condicionesEntrega, 'Condiciones de Entrega', 3, 150);
    const condicionesDespachoValidation = validateTextInput(data.condicionesDespacho, 'Condiciones de Despacho', 3, 150);
    
    if (!direccionValidation.isValid) errors.push(...direccionValidation.errors);
    else sanitizedData.direccion = direccionValidation.sanitizedData;
    
    if (!contactoValidation.isValid) errors.push(...contactoValidation.errors);
    else sanitizedData.contacto = contactoValidation.sanitizedData;
    
    if (!condicionesPagoValidation.isValid) errors.push(...condicionesPagoValidation.errors);
    else sanitizedData.condicionesPago = condicionesPagoValidation.sanitizedData;
    
    if (!condicionesEntregaValidation.isValid) errors.push(...condicionesEntregaValidation.errors);
    else sanitizedData.condicionesEntrega = condicionesEntregaValidation.sanitizedData;
    
    if (!condicionesDespachoValidation.isValid) errors.push(...condicionesDespachoValidation.errors);
    else sanitizedData.condicionesDespacho = condicionesDespachoValidation.sanitizedData;
    
    // Validar campos opcionales si están presentes
    if (data.paisId) {
        const paisValidation = validateObjectId(data.paisId, 'País');
        if (!paisValidation.isValid) errors.push(...paisValidation.errors);
        else sanitizedData.paisId = paisValidation.sanitizedData;
    }
    
    if (data.ciudadId) {
        const ciudadValidation = validateObjectId(data.ciudadId, 'Ciudad');
        if (!ciudadValidation.isValid) errors.push(...ciudadValidation.errors);
        else sanitizedData.ciudadId = ciudadValidation.sanitizedData;
    }
    
    if (data.comunaId) {
        const comunaValidation = validateObjectId(data.comunaId, 'Comuna');
        if (!comunaValidation.isValid) errors.push(...comunaValidation.errors);
        else sanitizedData.comunaId = comunaValidation.sanitizedData;
    }
    
    // Validar campos de selección
    if (data.tipoServicio) {
        const tiposValidos = ['compra', 'arriendo'];
        if (!tiposValidos.includes(data.tipoServicio)) {
            errors.push('Tipo de servicio no válido');
        } else {
            sanitizedData.tipoServicio = data.tipoServicio;
        }
    }
    
    if (data.estado !== undefined) {
        const estadosValidos = ['true', 'false', true, false];
        if (!estadosValidos.includes(data.estado)) {
            errors.push('Estado no válido');
        } else {
            sanitizedData.estado = data.estado === 'true' || data.estado === true;
        }
    }
    
    return {
        isValid: errors.length === 0,
        sanitizedData,
        errors
    };
};

// Rate limiting de IP para el backend
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (
    ip: string, 
    maxRequests: number = 10, 
    windowMs: number = 60000
): boolean => {
    const now = Date.now();
    const clientData = rateLimitStore.get(ip);
    
    if (!clientData || now > clientData.resetTime) {
        rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
        return true;
    }
    
    if (clientData.count >= maxRequests) {
        return false;
    }
    
    clientData.count++;
    return true;
};

// Limpiar rate limit store periódicamente
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimitStore.entries()) {
        if (now > data.resetTime) {
            rateLimitStore.delete(ip);
        }
    }
}, 60000); // Limpiar cada minuto
