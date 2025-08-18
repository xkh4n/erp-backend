import { JWTService } from '../Auth/jwt';
import { PasswordService } from '../Auth/password';

/**
 * Programador de tareas para limpieza automática
 */
export class CleanupScheduler {
    private static intervals: NodeJS.Timeout[] = [];
    
    /**
     * Iniciar todas las tareas programadas
     */
    static start(): void {
        // Limpiar tokens expirados cada hora (3600000 ms)
        const tokenCleanupInterval = setInterval(async () => {
            try {
                console.log('Iniciando limpieza de tokens expirados...');
                await JWTService.cleanupExpiredTokens();
                console.log('Limpieza de tokens completada');
            } catch (error) {
                console.error('Error en limpieza de tokens:', error);
            }
        }, 3600000); // 1 hora

        // Limpiar historial de contraseñas antiguas una vez al día (86400000 ms)
        const passwordCleanupInterval = setInterval(async () => {
            try {
                console.log('Iniciando limpieza de historial de contraseñas...');
                await PasswordService.cleanupOldPasswords();
                console.log('Limpieza de historial de contraseñas completada');
            } catch (error) {
                console.error('Error en limpieza de historial:', error);
            }
        }, 86400000); // 24 horas

        this.intervals.push(tokenCleanupInterval, passwordCleanupInterval);
        console.log('Tareas de limpieza programadas iniciadas');
    }

    /**
     * Detener todas las tareas programadas
     */
    static stop(): void {
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals = [];
        console.log('Tareas de limpieza detenidas');
    }

    /**
     * Ejecutar limpieza manual inmediata
     */
    static async runCleanup(): Promise<void> {
        try {
            console.log('Ejecutando limpieza manual...');
            
            await Promise.all([
                JWTService.cleanupExpiredTokens(),
                PasswordService.cleanupOldPasswords()
            ]);
            
            console.log('Limpieza manual completada');
        } catch (error) {
            console.error('Error en limpieza manual:', error);
            throw error;
        }
    }
}
