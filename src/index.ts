/* ENVIRONMENT */
import dotenv from 'dotenv';
dotenv.config();

/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Index File:');
logger.level = 'all';

/* API */
import app, { configureSession } from './server';
import { CleanupScheduler } from './Library/Utils/cleanup';
var SERVER = null;

/* PORT */
var PORT = undefined; 

/* URL */
var URI = '';

/* MONGOOSE */
import mongoose from 'mongoose';
const mongo = mongoose;

/* MONGOOSE CONFIGURE */
mongo.set('strictQuery', false);
mongo.set('bufferCommands', false);  // Deshabilitar buffering de comandos


/* VALIDATE THE AMBIENT RUNNING */
switch (process.env.NODE_ENV) {
    case 'production':
      PORT = 3030; //PUERTO DE LA API PARA PRODUCCION
      URI = `mongodb://prd_${process.env.DB_USER}:${process.env.DB_PASS}p@${process.env.DB_HOST}-PRD:${process.env.DB_PORT}/prd_${process.env.DB_NAME}?${process.env.DB_AUTH}`;
      SERVER = 'PRODUCTION';
      break;
    case 'development':
      PORT = 3040; //PUERTO DE LA API PARA DESARROLLO
      URI = `mongodb://dev_${process.env.DB_USER}:${process.env.DB_PASS}d@${process.env.DB_HOST}-DEV:${process.env.DB_PORT}/dev_${process.env.DB_NAME}?${process.env.DB_AUTH}&replicaSet=rs0`;
      SERVER = 'DEVELOPMENT';
      break;
    case 'testing':
      PORT = 3050; //PUERTO DE LA API PARA TESTING
      URI = `mongodb://tst_${process.env.DB_USER}:${process.env.DB_PASS}t@${process.env.DB_HOST}-TST:${process.env.DB_PORT}/tst_${process.env.DB_NAME}?${process.env.DB_AUTH}`;
  
      SERVER = 'TESTING';
      break;
  }
  
  (async () => {
      try {
          //logger.warn(`Connecting to ${SERVER}...`);
          
          // Opciones de configuración del pool de conexiones
          const connectionOptions = {
              maxPoolSize: parseInt(process.env.MAX_POOL) || 10,        // Máximo conexiones concurrentes
              minPoolSize: parseInt(process.env.MIN_POOL) || 2,         // Mínimo conexiones activas
              maxIdleTimeMS: 30000,   // Cerrar conexiones inactivas después de 30s
              serverSelectionTimeoutMS: 10000,  // Timeout para selección de servidor: 10s
              socketTimeoutMS: 45000,          // Timeout para operaciones: 45s
              retryWrites: true,               // Reintentar escrituras en caso de fallo
              retryReads: true                 // Reintentar lecturas en caso de fallo
          };
          await mongo.connect(URI, connectionOptions);
          logger.warn(`Connection to ${SERVER} it's Ok`);
          logger.info(`Pool de conexiones configurado: maxPool=${connectionOptions.maxPoolSize}, minPool=${connectionOptions.minPoolSize}`);
          
          // Monitor del pool de conexiones
          mongo.connection.on('connected', () => {
              logger.info('MongoDB: Conexión establecida');
          });
          
          mongo.connection.on('error', (err) => {
              logger.error('MongoDB: Error de conexión', err);
          });
          
          mongo.connection.on('disconnected', () => {
              logger.warn('MongoDB: Conexión perdida');
          });
          
          // Información del pool cada 30 segundos (solo en desarrollo)
          if (process.env.NODE_ENV === 'development') {
              setInterval(() => {
                  const db = mongo.connection.db;
                  if (db) {
                      logger.debug(`Pool Status - Activas: ${mongo.connection.readyState}`);
                  }
              }, 30000);
          }
          
          // Configurar sesiones después de la conexión DB
          configureSession(URI);
          logger.info('Sesiones configuradas correctamente');
          
          // Iniciar tareas de limpieza automática
          CleanupScheduler.start();
          
          await app.listen(PORT, () => {
              logger.debug(`Server of ${SERVER} is Running in: http://${SERVER}:${PORT}/api/${process.env.API_VER}/`);
          });
      } catch (error) {
          logger.error("Connection to BDD is Fail: ", error);
      }
  })();