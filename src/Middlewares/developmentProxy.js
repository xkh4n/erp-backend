// middleware/developmentProxy.js
// Middleware para simular headers de NGINX/HAProxy en desarrollo

export const developmentProxyHeaders = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    // Simular headers que normalmente agrega NGINX
    req.headers['x-real-ip'] = req.ip || '127.0.0.1';
    req.headers['x-forwarded-for'] = req.ip || '127.0.0.1';
    req.headers['x-forwarded-proto'] = 'http';
    req.headers['x-forwarded-host'] = 'localhost:3000';
    req.headers['x-forwarded-port'] = '3000';
    
    // Headers de seguridad que normalmente agrega NGINX
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
  }
  
  next();
};
