/* MINIMAL SERVER FOR DEBUGGING */
import express from 'express';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Solo ruta de health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running'
    });
});

// Test básico
app.get('/test', (req, res) => {
    res.json({ message: 'Test route working' });
});

export default app;
