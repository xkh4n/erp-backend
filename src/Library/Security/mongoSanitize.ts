import { Request, Response, NextFunction } from 'express';

/**
 * Custom MongoDB sanitization middleware compatible with Express v5
 * Removes or replaces MongoDB operators from user input
 */

interface SanitizeOptions {
    replaceWith?: string;
    allowDots?: boolean;
    onSanitize?: (info: { req: Request; key: string; value: any }) => void;
}

const defaultOptions: SanitizeOptions = {
    replaceWith: '_',
    allowDots: false,
    onSanitize: undefined
};

/**
 * Recursively sanitize an object by removing MongoDB operators
 */
function sanitizeObject(obj: any, options: SanitizeOptions, req: Request, path = ''): any {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map((item, index) => 
            sanitizeObject(item, options, req, `${path}[${index}]`)
        );
    }

    const sanitized: any = {};

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            let sanitizedKey = key;
            let needsSanitization = false;

            // Check for MongoDB operators ($ prefix)
            if (key.startsWith('$')) {
                needsSanitization = true;
                sanitizedKey = options.replaceWith ? `${options.replaceWith}${key.slice(1)}` : key.slice(1);
            }

            // Check for dots in keys (unless allowed)
            if (!options.allowDots && key.includes('.')) {
                needsSanitization = true;
                sanitizedKey = key.replace(/\./g, options.replaceWith || '_');
            }

            if (needsSanitization && options.onSanitize) {
                options.onSanitize({
                    req,
                    key: `${path}${key}`,
                    value: obj[key]
                });
            }

            sanitized[sanitizedKey] = sanitizeObject(
                obj[key], 
                options, 
                req, 
                `${path}${sanitizedKey}.`
            );
        }
    }

    return sanitized;
}

/**
 * Express middleware for MongoDB injection protection
 */
export function mongoSanitize(options: SanitizeOptions = {}) {
    const opts = { ...defaultOptions, ...options };

    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Sanitize query parameters
            if (req.query && typeof req.query === 'object') {
                const sanitizedQuery = sanitizeObject(req.query, opts, req, 'query.');
                // Create a new object to avoid Express v5 readonly issues
                Object.keys(req.query).forEach(key => delete (req.query as any)[key]);
                Object.assign(req.query, sanitizedQuery);
            }

            // Sanitize request body
            if (req.body && typeof req.body === 'object') {
                req.body = sanitizeObject(req.body, opts, req, 'body.');
            }

            // Sanitize route parameters
            if (req.params && typeof req.params === 'object') {
                req.params = sanitizeObject(req.params, opts, req, 'params.');
            }

            next();
        } catch (error) {
            console.error('[MONGO-SANITIZE] Error during sanitization:', error);
            next(error);
        }
    };
}

export default mongoSanitize;