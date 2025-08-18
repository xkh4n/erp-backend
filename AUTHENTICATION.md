# Sistema de Autenticación Completo - ERP Backend

## 🔐 Características Implementadas

### 1. **Autenticación JWT con Refresh Tokens**
- ✅ Access tokens JWT (15 minutos)
- ✅ Refresh tokens con rotación automática (7 días)
- ✅ Almacenamiento seguro hasheado en BD
- ✅ Detección y revocación automática por reutilización
- ✅ Familia de tokens para mejor seguridad

### 2. **Sesiones Server-Side**
- ✅ Configuración con connect-mongo
- ✅ Sistema híbrido JWT/Sesiones
- ✅ TTL configurable (8 horas por defecto)
- ✅ Almacenamiento en MongoDB

### 3. **Gestión de Contraseñas**
- ✅ Historial de contraseñas (5 últimas por defecto)
- ✅ Política de complejidad configurable
- ✅ Prevención de reutilización
- ✅ Longitud mínima configurable (12 caracteres)
- ✅ Reset de contraseñas con permisos

### 4. **Seguridad Avanzada**
- ✅ Account lockout tras intentos fallidos (5 intentos, 2 horas)
- ✅ Rate limiting diferenciado
- ✅ Headers de seguridad con Helmet
- ✅ Sanitización contra inyecciones NoSQL
- ✅ CORS configurado
- ✅ Validación con Zod
- ✅ Logging de seguridad

### 5. **RBAC (Role-Based Access Control)**
- ✅ Middlewares por permisos específicos
- ✅ Verificación de roles
- ✅ Permisos granulares (resource:action)
- ✅ Middleware para múltiples permisos (AND/OR)

## 📁 Estructura de Archivos Creados/Modificados

```
src/
├── Controllers/
│   ├── Login/index.ts          # ✅ Actualizado con JWT y sesiones
│   └── Password/index.ts       # 🆕 Gestión de contraseñas
├── Models/
│   ├── userModel.ts           # ✅ Actualizado con campos de seguridad
│   ├── passwordHistoryModel.ts # 🆕 Historial de contraseñas
│   └── refreshTokenModel.ts   # 🆕 Tokens de refresco
├── Interfaces/
│   ├── Users/index.ts         # ✅ Actualizado con nuevos campos
│   ├── PasswordHistory/       # 🆕 Interface para historial
│   └── RefreshToken/          # 🆕 Interface para tokens
├── Library/
│   ├── Auth/
│   │   ├── jwt.ts            # 🆕 Servicio JWT completo
│   │   └── password.ts       # 🆕 Servicio de contraseñas
│   └── Validations/
│       └── zod.ts            # 🆕 Validaciones con Zod
├── Middlewares/
│   └── Auth/index.ts         # 🆕 Middlewares de autenticación
├── Routes/
│   ├── Login/index.ts        # ✅ Actualizado con nuevas rutas
│   └── Password/index.ts     # 🆕 Rutas de contraseñas
├── types/
│   └── session.d.ts          # 🆕 Tipos para sesiones
└── server.ts                 # ✅ Configurado con seguridad completa
```

## 🚀 Endpoints Disponibles

### Autenticación
```
POST /api/1.0/login           # Login con JWT/Sesión
POST /api/1.0/refresh         # Renovar access token
POST /api/1.0/logout          # Logout individual
POST /api/1.0/logout-all      # Logout de todas las sesiones
```

### Gestión de Contraseñas
```
POST /api/1.0/change-password # Cambiar contraseña propia
POST /api/1.0/reset-password  # Reset de contraseña (admin)
```

## 🔧 Variables de Entorno

### Configuradas en tu .env.development:
```bash
# Sesiones
SESSION_SECRET=iSGpzOE9FiOVCm6yXDUR8jaB+IYDkf+jX39ebIBH2BWklFVgf55/eeD2MMV/w3Jv
SESSION_NAME=sid
SESSION_TTL_HOURS=8

# JWT
JWT_ACCESS_SECRET=WBcDV+XsUG6lFtR5T3b1lJb86I+B9kM89/oQV1+hj1PFdQ/k/3E8iOoRHHN98teL
JWT_REFRESH_SECRET=I3H20jufo12SNf86VkvEN/aJf0JUihlt78lldDBIRdkr15FuXXagfKb0HVe0lHsq
JWT_ISS=https://localhost:3010/auth
JWT_AUD=https://localhost:3010
JWT_ACCESS_TTL=900           # 15 minutos
JWT_REFRESH_TTL=604800       # 7 días

# Seguridad de contraseñas
PASSWORD_HISTORY_LIMIT=5
PASSWORD_MIN_LENGTH=12

# CORS
CORS_ORIGIN=http://localhost:3010
```

## 📋 Middlewares de Autenticación

### Uso en Rutas:
```typescript
import { 
    requireAuth,           // Requiere JWT válido
    requireSession,        // Requiere sesión válida
    requireAuthOrSession,  // JWT o sesión
    requirePermission,     // Permiso específico
    requireRole,          // Rol específico
    optionalAuth          // Autenticación opcional
} from '../Middlewares/Auth';

// Ejemplos:
router.get('/protected', requireAuth, controller);
router.get('/admin', requireRole('admin'), controller);
router.post('/create', requirePermission('users', 'create'), controller);
```

## 🔄 Flujo de Autenticación

### 1. Login
```json
POST /api/1.0/login
{
    "username": "usuario",
    "password": "contraseña"
}

Response:
{
    "message": "Login successful",
    "data": {
        "user": {...},
        "tokens": {
            "accessToken": "jwt...",
            "refreshToken": "token...",
            "expiresIn": 900
        }
    }
}
```

### 2. Usar Access Token
```
Authorization: Bearer <accessToken>
```

### 3. Renovar Token
```json
POST /api/1.0/refresh
{
    "refreshToken": "token..."
}
```

## 🛡️ Características de Seguridad

### Account Lockout
- 5 intentos fallidos = 2 horas de bloqueo
- Reset automático tras login exitoso

### Rate Limiting
- Global: 100 requests/15min
- Auth endpoints: 5 requests/15min

### Password Policy
- Mínimo 12 caracteres
- 1 mayúscula, 1 minúscula, 1 número, 1 especial
- No reutilización de últimas 5 contraseñas

### Refresh Token Security
- Rotación automática
- Detección de reutilización
- Revocación de familia completa

## 🔧 Limpieza Automática

### Tareas Programadas:
- **Cada hora**: Limpia tokens expirados
- **Diario**: Limpia historial de contraseñas antiguo (>1 año)

## 📦 Migración Gradual

### Compatibilidad:
- ✅ Sistema actual sigue funcionando
- ✅ Nuevas funciones son opcionales
- ✅ Endpoints existentes mantienen funcionamiento
- ✅ Base de datos compatible (campos opcionales)

### Para activar completamente:
1. Actualizar rutas para usar nuevos middlewares
2. Migrar frontend para usar refresh tokens
3. Configurar headers de seguridad en cliente

## 🧪 Testing

### Comandos útiles:
```bash
# Desarrollo
npm run dev

# Producción
npm run build && npm start

# Testing
npm run test
```

### Health Check:
```
GET /health
```

## 🔍 Monitoring y Logs

### Eventos loggeados:
- Login exitoso/fallido
- Cambios de contraseña
- Detección de tokens reutilizados
- Account lockouts
- Refresh token rotations

## 🚨 Próximos Pasos Recomendados

1. **Migrar rutas existentes** para usar nuevos middlewares
2. **Configurar notificaciones** por email para eventos de seguridad
3. **Implementar 2FA** (opcional)
4. **Configurar SSL/TLS** en producción
5. **Monitoring avanzado** con métricas de seguridad
6. **Backup de tokens** para recuperación de desastres

## 📞 Soporte

Para dudas sobre implementación o configuración, revisar:
- Logs del servidor
- Variables de entorno
- Modelos de base de datos
- Middlewares de autenticación
