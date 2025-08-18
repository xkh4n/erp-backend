/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Server File:');
logger.level = 'all';

/* EXPRESS */
import express from 'express';
import cors from 'cors';

/* SERVER */
const app = express();

/* BASIC MIDDLEWARES */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* CORS Configuration */
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3010',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

/* ROUTES */
import {
    login,
    registro,
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
    users,
    passwordRoutes
} from './Routes/index';

/* ROUTE CONFIGURATION */
const base_path = '/api/' + process.env.API_VER + '/';

// Rutas básicas
app.use(base_path, login);
app.use(base_path, registro);
app.use(base_path, health);

// Rutas de gestión
app.use(base_path, users);
app.use(base_path, persons);
app.use(base_path, role);
app.use(base_path, permisos);
app.use(base_path, passwordRoutes);

// Rutas de datos maestros
app.use(base_path, paises);
app.use(base_path, ciudad);
app.use(base_path, comuna);
app.use(base_path, gerencia);
app.use(base_path, subgerencia);
app.use(base_path, depto);
app.use(base_path, servicio);
app.use(base_path, proceso);

// Rutas de inventario y productos
app.use(base_path, producto);
app.use(base_path, proveedor);
app.use(base_path, categoria);
app.use(base_path, estadoActivo);
app.use(base_path, subEstadoActivo);
app.use(base_path, inventory);
app.use(base_path, kardex);

// Rutas de solicitudes
app.use(base_path, solicitud);
app.use(base_path, vistas);

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
