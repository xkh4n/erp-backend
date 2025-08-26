# API de Centros de Costo

Este documento describe los endpoints disponibles para la gestión de Centros de Costo.

## Autenticación

Todos los endpoints requieren autenticación JWT y permisos específicos:
- **Token**: Incluir en header `Authorization: Bearer <token>`
- **Permisos requeridos**: `centro_costo:create`, `centro_costo:read`, `centro_costo:update`, `centro_costo:delete`

## Endpoints

### 1. Crear Centro de Costo Individual

**POST** `/api/1.0/centro-costo`

**Permisos**: `centro_costo:create`

**Body**:
```json
{
  "codigo": "CC001",
  "nombre": "Centro de Administración",
  "descripcion": "Centro de costo para gastos administrativos generales"
}
```

**Validaciones**:
- `codigo`: Requerido, máximo 20 caracteres, solo letras mayúsculas, números y guiones
- `nombre`: Requerido, mínimo 3 caracteres, máximo 100 caracteres
- `descripcion`: Requerida, mínimo 10 caracteres, máximo 500 caracteres

**Respuesta exitosa (201)**:
```json
{
  "codigo": 201,
  "message": "1 centro(s) de costo creado(s) exitosamente",
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "codigo": "CC001",
    "nombre": "Centro de Administración",
    "descripcion": "Centro de costo para gastos administrativos generales",
    "fechaCreacion": "2025-08-19T10:30:00.000Z",
    "fechaModificacion": "2025-08-19T10:30:00.000Z"
  }
}
```

### 2. Crear Múltiples Centros de Costo

**POST** `/api/1.0/centro-costo/bulk`

**Permisos**: `centro_costo:create`

**Body**:
```json
[
  {
    "codigo": "CC001",
    "nombre": "Centro de Administración",
    "descripcion": "Centro de costo para gastos administrativos generales"
  },
  {
    "codigo": "CC002",
    "nombre": "Centro de Ventas",
    "descripcion": "Centro de costo para actividades comerciales y de ventas"
  }
]
```

**Validaciones**:
- Array de 1 a 100 elementos
- Cada elemento debe cumplir las validaciones individuales

### 3. Obtener Centros de Costo

**GET** `/api/1.0/centro-costo`

**Permisos**: `centro_costo:read`

**Query Parameters**:
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10, máximo: 100)
- `search`: Búsqueda en código, nombre o descripción
- `sortBy`: Campo para ordenar (default: 'nombre')
- `sortOrder`: Orden ascendente o descendente ('asc' | 'desc', default: 'asc')

**Ejemplo**:
```
GET /api/1.0/centro-costo?page=1&limit=10&search=admin&sortBy=nombre&sortOrder=asc
```

**Respuesta exitosa (200)**:
```json
{
  "codigo": 200,
  "message": "Centros de costo obtenidos exitosamente",
  "data": {
    "centros": [
      {
        "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
        "codigo": "CC001",
        "nombre": "Centro de Administración",
        "descripcion": "Centro de costo para gastos administrativos generales",
        "fechaCreacion": "2025-08-19T10:30:00.000Z",
        "fechaModificacion": "2025-08-19T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### 4. Obtener Centro de Costo por ID

**GET** `/api/1.0/centro-costo/:id`

**Permisos**: `centro_costo:read`

**Parámetros**:
- `id`: ObjectId válido de MongoDB

**Respuesta exitosa (200)**:
```json
{
  "codigo": 200,
  "message": "Centro de costo obtenido exitosamente",
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "codigo": "CC001",
    "nombre": "Centro de Administración",
    "descripcion": "Centro de costo para gastos administrativos generales",
    "fechaCreacion": "2025-08-19T10:30:00.000Z",
    "fechaModificacion": "2025-08-19T10:30:00.000Z"
  }
}
```

### 5. Actualizar Centro de Costo

**PUT** `/api/1.0/centro-costo/:id`

**Permisos**: `centro_costo:update`

**Body** (todos los campos son opcionales):
```json
{
  "codigo": "CC001-UPD",
  "nombre": "Centro de Administración Actualizado",
  "descripcion": "Descripción actualizada del centro de costo"
}
```

**Validaciones**:
- Al menos un campo debe ser proporcionado
- Mismas validaciones que en creación para campos proporcionados

**Respuesta exitosa (200)**:
```json
{
  "codigo": 200,
  "message": "Centro de costo actualizado exitosamente",
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "codigo": "CC001-UPD",
    "nombre": "Centro de Administración Actualizado",
    "descripcion": "Descripción actualizada del centro de costo",
    "fechaCreacion": "2025-08-19T10:30:00.000Z",
    "fechaModificacion": "2025-08-19T11:45:00.000Z"
  }
}
```

### 6. Eliminar Centro de Costo

**DELETE** `/api/1.0/centro-costo/:id`

**Permisos**: `centro_costo:delete`

**Parámetros**:
- `id`: ObjectId válido de MongoDB

**Respuesta exitosa (200)**:
```json
{
  "codigo": 200,
  "message": "Centro de costo eliminado exitosamente",
  "data": {
    "id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "codigo": "CC001",
    "nombre": "Centro de Administración"
  }
}
```

## Códigos de Error

### 400 - Errores de Validación
```json
{
  "type": "VALIDATION_ERROR",
  "message": "Errores de validación",
  "code": 400,
  "details": [
    {
      "field": "codigo",
      "message": "El código es requerido"
    }
  ]
}
```

### 401 - No Autenticado
```json
{
  "type": "AUTHORIZATION_ERROR",
  "message": "Token de acceso requerido",
  "code": 401
}
```

### 403 - Sin Permisos
```json
{
  "type": "AUTHORIZATION_ERROR",
  "message": "No tienes permisos para realizar esta acción",
  "code": 403
}
```

### 404 - No Encontrado
```json
{
  "type": "NOT_FOUND_ERROR",
  "message": "Centro de costo no encontrado",
  "code": 404
}
```

### 409 - Conflicto (Duplicado)
```json
{
  "type": "CONFLICT_ERROR",
  "message": "Ya existe un centro de costo con código: CC001",
  "code": 409
}
```

### 500 - Error del Servidor
```json
{
  "type": "SERVER_ERROR",
  "message": "Error interno del servidor",
  "code": 500
}
```

## Características Implementadas

✅ **Validación completa con Zod**
- Validación de tipos de datos
- Validación de longitudes
- Validación de formatos (regex)
- Sanitización automática (trim, uppercase para códigos)

✅ **Seguridad**
- Autenticación JWT requerida
- Control de permisos RBAC
- Sanitización contra inyecciones NoSQL
- Rate limiting aplicado

✅ **Funcionalidades avanzadas**
- Paginación configurable
- Búsqueda en múltiples campos
- Ordenamiento personalizable
- Creación individual y masiva
- Índices optimizados en base de datos

✅ **Manejo de errores robusto**
- Errores personalizados tipados
- Logs detallados para auditoría
- Validación de duplicados
- Mensajes de error descriptivos

✅ **Performance**
- Índices en campos críticos
- Consultas optimizadas con lean()
- Paginación eficiente
- Límites de consulta configurables
