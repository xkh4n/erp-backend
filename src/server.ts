/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Server File:');
logger.level = 'all';

/* EXPRESS */
import express from 'express';
import expressSession from 'express-session';
import MongoStore from 'connect-mongo';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { mongoSanitize as customMongoSanitize } from './Library/Security/mongoSanitize';

/* SERVER */
const app = express();

// Configurar trust proxy para reverso proxy (HAProxy/NGINX)
app.set('trust proxy', 1);

/* CORS */
import cors from 'cors';

/* SECURITY MIDDLEWARES */
import { securityHeaders } from './Library/Security/middleware';

/* SECURITY CONFIGURATION */
// Helmet para headers de seguridad
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// CORS Configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3010',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'UPDATE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Rate limiting global usando express-rate-limit
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requests por ventana
    message: {
        codigo: 429,
        mensaje: 'Demasiadas solicitudes desde esta IP. Intente nuevamente más tarde.',
        data: null
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api', globalLimiter);

// Rate limiting específico para autenticación
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        codigo: 429,
        mensaje: 'Demasiados intentos de login. Intente nuevamente en 15 minutos.',
        data: null
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Aplicar rate limiting a rutas de autenticación específicas - Comentado temporalmente
// app.use('/api/1.0/login', authLimiter);
// app.use('/api/1.0/refresh', authLimiter);

// Sanitización contra inyecciones NoSQL - Middleware personalizado compatible con Express v5
app.use(customMongoSanitize({
    replaceWith: '_',
    allowDots: false,
    onSanitize: ({ req, key }) => {
        console.warn(`[SECURITY] Sanitized MongoDB injection attempt: ${key} from IP: ${req.ip}`);
    }
}));

// Session Configuration - Se configurará después de establecer la conexión DB
// Ver index.ts para la configuración de sesiones

/* ENCODED */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Headers de seguridad adicionales
app.use(securityHeaders);

// Función para configurar sesiones después de la conexión DB
export const configureSession = (mongoUrl: string) => {
    try {
        // Validar variables de entorno requeridas
        const sessionSecret = process.env.SESSION_SECRET;
        const sessionTTL = process.env.SESSION_TTL_HOURS;
        
        if (!sessionSecret) {
            logger.error('SESSION_SECRET no está configurado en las variables de entorno');
            throw new Error('SESSION_SECRET is required');
        }
        
        if (!sessionTTL || isNaN(parseInt(sessionTTL))) {
            logger.warn('SESSION_TTL_HOURS no está configurado o es inválido, usando valor por defecto: 8 horas');
        }
        
        const ttlHours = parseInt(sessionTTL || '8');
        
        logger.info(`Configurando sesiones con TTL de ${ttlHours} horas`);
        
        app.use(expressSession({
            secret: sessionSecret,
            name: process.env.SESSION_NAME || 'sid',
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({
                mongoUrl: mongoUrl,
                touchAfter: 24 * 3600, // lazy session update
                ttl: ttlHours * 60 * 60 // TTL en segundos
            }),
            cookie: {
                secure: process.env.NODE_ENV === 'production', // HTTPS en producción
                httpOnly: true,
                maxAge: ttlHours * 60 * 60 * 1000, // TTL en ms
                sameSite: 'strict'
            }
        }));
        
        logger.info('Middleware de sesiones configurado correctamente');
        
    } catch (error) {
        logger.error('Error al configurar sesiones:', error);
        logger.warn('Continuando sin sesiones - solo se usarán JWT tokens');
    }
};

/* ROUTE CONFIGURATION */
import {
    login,
    paises,
    ciudad,
    gerencia,
    subgerencia,
    depto,
    servicio,
    proceso,
    vistas,
    producto,
    comuna,
    proveedor,
    health,
    categoria,
    estadoActivo,
    SubEstadosActivosRouter as subEstadoActivo,
    solicitud,
    kardex,
    inventory,
    permisos,
    role,
    persons,
    usuarios,
    passwordRoutes,
    centroCostos,
    asigna
} from './Routes/index';

/* ROUTE CONFIGURATION */
const base_path = '/api/' + process.env.API_VER + '/';
app.use(base_path, login);
app.use(base_path, paises);
app.use(base_path, ciudad);
app.use(base_path, gerencia);
app.use(base_path, subgerencia);
app.use(base_path, depto);
app.use(base_path, servicio);
app.use(base_path, proceso);
app.use(base_path, vistas);
app.use(base_path, producto);
app.use(base_path, comuna);
app.use(base_path, proveedor);
app.use(base_path, health);
app.use(base_path, categoria);
app.use(base_path, estadoActivo);
app.use(base_path, subEstadoActivo);
app.use(base_path, solicitud);
app.use(base_path, kardex);
app.use(base_path, inventory);
app.use(base_path, permisos);
app.use(base_path, role);
app.use(base_path, usuarios);
app.use(base_path, persons);
app.use(base_path, passwordRoutes);
app.use(base_path, centroCostos);
app.use(base_path, asigna);

/* HEALTH CHECK */
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

/* STATICS FOLDERS */
app.use(express.static("uploads"));
app.use(express.static("uploads/avatars"));
app.use(express.static("uploads/files"));


export default app;