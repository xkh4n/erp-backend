import { initializePermissionsCache } from '../Middlewares/Auth/permissions';
import log4js from 'log4js';

const logger = log4js.getLogger('Permissions Service:');
logger.level = 'all';

/**
 * Servicio para inicializar el sistema de permisos
 * Debe ser llamado al arrancar la aplicación
 */
export class PermissionsService {
    
    /**
     * Inicializa el sistema de permisos cargando desde la base de datos
     */
    static async initialize(): Promise<void> {
        try {
            logger.info('🔒 Inicializando sistema de permisos...');
            
            // Cargar permisos desde la base de datos
            await initializePermissionsCache();
            
            logger.info('✅ Sistema de permisos inicializado correctamente');
        } catch (error) {
            logger.error('❌ Error inicializando sistema de permisos:', error);
            throw error;
        }
    }
}

export default PermissionsService;