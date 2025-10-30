/* LOGGER */
import log4js from 'log4js';
const logger = log4js.getLogger('Database Indexes:');
logger.level = 'all';

/* MONGOOSE */
import mongoose from 'mongoose';

/**
 * Asegurar que todos los índices críticos estén creados
 * Esto mejora significativamente el rendimiento de las consultas
 */
export const ensureIndexes = async (): Promise<void> => {
    try {
        const db = mongoose.connection.db;
        if (!db) {
            logger.warn('No hay conexión a la base de datos disponible');
            return;
        }

        logger.info('Creando índices de optimización...');

        // Índices para Proveedores
        try {
            await db.collection('proveedors').createIndex(
                { fechaCreacion: -1 }, 
                { name: 'idx_proveedor_fecha', background: true }
            );
            await db.collection('proveedors').createIndex(
                { estado: 1 }, 
                { name: 'idx_proveedor_estado', background: true }
            );
            await db.collection('proveedors').createIndex(
                { razonSocial: 1 }, 
                { name: 'idx_proveedor_razon_social', background: true }
            );
            await db.collection('proveedors').createIndex(
                { tipoServicio: 1 }, 
                { name: 'idx_proveedor_tipo_servicio', background: true }
            );
            await db.collection('proveedors').createIndex(
                { pais: 1, ciudad: 1, comuna: 1 }, 
                { name: 'idx_proveedor_geografia', background: true }
            );
            
            // Índice de texto para búsquedas
            await db.collection('proveedors').createIndex(
                { 
                    razonSocial: 'text', 
                    giro: 'text', 
                    contacto: 'text' 
                },
                {
                    name: 'idx_proveedor_text_search',
                    background: true,
                    weights: {
                        razonSocial: 10,
                        giro: 5,
                        contacto: 3
                    }
                }
            );
            logger.info('Índices de Proveedores creados exitosamente');
        } catch (error: any) {
            if (error.code === 85) { // IndexOptionsConflict
                logger.info('Algunos índices de Proveedores ya existen');
            } else {
                logger.error('Error creando índices de Proveedores:', error.message);
            }
        }

        // Índices para otras colecciones críticas
        try {
            // Índices para Productos (si existe)
            await db.collection('productos').createIndex(
                { fechaCreacion: -1 }, 
                { name: 'idx_producto_fecha', background: true }
            );
            await db.collection('productos').createIndex(
                { estado: 1 }, 
                { name: 'idx_producto_estado', background: true }
            );
            await db.collection('productos').createIndex(
                { categoria: 1 }, 
                { name: 'idx_producto_categoria', background: true }
            );
            
            // Índices para Inventario (si existe)
            await db.collection('inventarios').createIndex(
                { fechaCreacion: -1 }, 
                { name: 'idx_inventario_fecha', background: true }
            );
            await db.collection('inventarios').createIndex(
                { producto: 1 }, 
                { name: 'idx_inventario_producto', background: true }
            );
            
            // Índices para Centro de Costos
            await db.collection('centrocostos').createIndex(
                { codigo: 1 }, 
                { name: 'idx_ccosto_codigo', background: true }
            );
            
            logger.info('Índices adicionales creados exitosamente');
        } catch (error: any) {
            if (error.code === 85) {
                logger.info('Algunos índices adicionales ya existen');
            } else {
                logger.warn('Error creando índices adicionales (colecciones pueden no existir):', error.message);
            }
        }

        // Mostrar estadísticas de índices
        try {
            const proveedorIndexes = await db.collection('proveedors').indexes();
            logger.info(`Proveedores tiene ${proveedorIndexes.length} índices configurados`);
        } catch (error) {
            logger.warn('No se pudieron obtener estadísticas de índices');
        }

        logger.info('Inicialización de índices completada');
    } catch (error) {
        logger.error('Error durante la inicialización de índices:', error);
    }
};

/**
 * Verificar el estado de los índices críticos
 */
export const checkIndexHealth = async (): Promise<void> => {
    try {
        const db = mongoose.connection.db;
        if (!db) return;

        const collections = ['proveedors', 'productos', 'inventarios'];
        
        for (const collectionName of collections) {
            try {
                const stats = await db.collection(collectionName).estimatedDocumentCount();
                const indexes = await db.collection(collectionName).indexes();

                logger.info(`${collectionName}: ${stats} documentos, ${indexes.length} índices`);
            } catch (error) {
                // Colección puede no existir, ignorar
            }
        }
    } catch (error) {
        logger.warn('No se pudo verificar el estado de los índices:', error);
    }
};