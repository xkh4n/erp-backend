// Middleware de seguridad para Express (versión sin dependencias externas)
import { Request, Response, NextFunction } from 'express';
import { checkRateLimit } from './validation';

// Implementación simple de rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const globalRateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();
        const clientData = rateLimitStore.get(clientIp);

        if (!clientData || now > clientData.resetTime) {
            rateLimitStore.set(clientIp, { count: 1, resetTime: now + windowMs });
            return next();
        }

        if (clientData.count >= maxRequests) {
            return res.status(429).json({
                codigo: 429,
                mensaje: 'Demasiadas solicitudes desde esta IP. Intente nuevamente más tarde.',
                data: null
            });
        }

        clientData.count++;
        next();
    };
};

// Rate limiting estricto para endpoints críticos
export const strictRateLimit = (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    
    if (!checkRateLimit(clientIp, 10, 15 * 60 * 1000)) { // 10 requests en 15 minutos
        return res.status(429).json({
            codigo: 429,
            mensaje: 'Demasiadas solicitudes para esta operación. Intente nuevamente más tarde.',
            data: null
        });
    }

    next();
};

// Headers de seguridad básicos
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
    // Configurar headers de seguridad
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Content Security Policy básico
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self'; " +
        "font-src 'self'; " +
        "object-src 'none'; " +
        "media-src 'self'; " +
        "frame-src 'none';"
    );

    // HSTS en producción
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    next();
};

// Middleware para validar headers de seguridad
export const validateSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
    // Verificar Content-Type para requests POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.get('Content-Type');
        if (!contentType || !contentType.includes('application/json')) {
            return res.status(400).json({
                codigo: 400,
                mensaje: 'Content-Type debe ser application/json',
                data: null
            });
        }
    }

    // Verificar header X-Requested-With para prevenir CSRF básico
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const xRequestedWith = req.get('X-Requested-With');
        if (!xRequestedWith || xRequestedWith !== 'XMLHttpRequest') {
            return res.status(400).json({
                codigo: 400,
                mensaje: 'Header X-Requested-With requerido',
                data: null
            });
        }
    }

    next();
};

// Middleware para sanitizar request body
export const sanitizeRequestBody = (req: Request, res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === 'object') {
        // Función recursiva para sanitizar objetos
        const sanitizeObject = (obj: any): any => {
            if (typeof obj === 'string') {
                // Remover caracteres peligrosos
                return obj
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/javascript:/gi, '')
                    .replace(/vbscript:/gi, '')
                    .replace(/on\w+\s*=/gi, '')
                    .trim();
            } else if (Array.isArray(obj)) {
                return obj.map(sanitizeObject);
            } else if (typeof obj === 'object' && obj !== null) {
                const sanitized: any = {};
                for (const key in obj) {
                    sanitized[key] = sanitizeObject(obj[key]);
                }
                return sanitized;
            }
            return obj;
        };

        req.body = sanitizeObject(req.body);
    }

    next();
};

// Middleware para validar tamaño del payload
export const validatePayloadSize = (maxSize: number = 1024 * 1024) => { // 1MB por defecto
    return (req: Request, res: Response, next: NextFunction) => {
        const contentLength = req.get('content-length');
        
        if (contentLength && parseInt(contentLength) > maxSize) {
            return res.status(413).json({
                codigo: 413,
                mensaje: 'Payload demasiado grande',
                data: null
            });
        }

        next();
    };
};

// Middleware personalizado de rate limiting
export const customRateLimit = (maxRequests: number = 10, windowMs: number = 60000) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
        
        if (!checkRateLimit(clientIp, maxRequests, windowMs)) {
            return res.status(429).json({
                codigo: 429,
                mensaje: 'Demasiadas solicitudes. Intente nuevamente más tarde.',
                data: null
            });
        }

        next();
    };
};

// Middleware para logging de seguridad
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    console.log(`[SECURITY] ${timestamp} - IP: ${ip} - Method: ${req.method} - URL: ${req.originalUrl} - UserAgent: ${userAgent}`);
    
    // Log de requests sospechosos
    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /vbscript:/i,
        /on\w+\s*=/i,
        /eval\s*\(/i,
        /expression\s*\(/i,
        /union\s+select/i,
        /drop\s+table/i,
        /insert\s+into/i,
        /delete\s+from/i
    ];

    const requestString = JSON.stringify(req.body) + req.originalUrl + JSON.stringify(req.query);
    
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(requestString)) {
            console.warn(`[SECURITY ALERT] ${timestamp} - Suspicious request detected from IP: ${ip} - Pattern: ${pattern} - URL: ${req.originalUrl}`);
            break;
        }
    }

    next();
};

export default {
    globalRateLimit,
    strictRateLimit,
    securityHeaders,
    validateSecurityHeaders,
    sanitizeRequestBody,
    validatePayloadSize,
    customRateLimit,
    securityLogger
};