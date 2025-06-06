/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Server File:');
logger.level = 'all';

/* EXPRESS */
import express from 'express';

/* SERVER */
const app = express();

/* CORS */
import cors from 'cors';

/* ENCODED */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* PORTS */
const PORT = process.env.API_PORT || 3030;

/* ROUTES */
import {login, registro, paises, ciudad, gerencia, subgerencia, depto, servicio, proceso, vistas, producto, comuna } from './Routes/index';

/* CORS CONFIGURE */
app.use(cors());

/* ROUTE CONFIGURATION */
const base_path = '/api/' + process.env.API_VER + '/';
app.use(base_path, login);
app.use(base_path, registro);
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



/* STATICS FOLDERS */
app.use(express.static("uploads"));
app.use(express.static("uploads/avatars"));
app.use(express.static("uploads/files"));


export default app;