/* ROUTER */
import express from 'express';
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
export default health;