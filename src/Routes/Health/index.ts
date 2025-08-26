/* ROUTER */
import express from 'express';
import mongoose from 'mongoose';
const health = express.Router();

health.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        message: 'ERP Backend is running smoothly'
    });
});
health.get('/health/ready', (req, res) => {
    res.status(200).json({
        status: 'READY',
        timestamp: new Date().toISOString(),
        message: 'ERP Backend is ready to serve requests'
    });
});
health.get('/health/live', (req, res) => {
    res.status(200).json({
        status: 'LIVE',
        timestamp: new Date().toISOString(),
        message: 'ERP Backend is live and operational'
    });
});
health.get('/health/healthcheck', (req, res) => {
    res.status(200).json({
        status: 'HEALTHY',
        timestamp: new Date().toISOString(),
        message: 'ERP Backend health check passed successfully'
    });
});

// Endpoint para monitorear el pool de conexiones MongoDB
health.get('/health/database', (req, res) => {
    const connection = mongoose.connection;
    const readyState = connection.readyState;
    
    let status = 'UNKNOWN';
    let message = '';
    
    switch (readyState) {
        case 0:
            status = 'DISCONNECTED';
            message = 'MongoDB está desconectado';
            break;
        case 1:
            status = 'CONNECTED';
            message = 'MongoDB está conectado correctamente';
            break;
        case 2:
            status = 'CONNECTING';
            message = 'MongoDB se está conectando';
            break;
        case 3:
            status = 'DISCONNECTING';
            message = 'MongoDB se está desconectando';
            break;
    }
    
    const dbStats = {
        status: status,
        readyState: readyState,
        host: connection.host,
        port: connection.port,
        name: connection.name,
        collections: Object.keys(connection.collections).length,
        timestamp: new Date().toISOString(),
        message: message
    };
    
    const httpStatus = readyState === 1 ? 200 : 503;
    res.status(httpStatus).json(dbStats);
});
export default health;