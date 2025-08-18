import PasswordHistory from '../../Models/passwordHistoryModel';
import { hashPassword, comparePassword } from '../Encrypt';
import { CustomError, createValidationError } from '../Errors';

export class PasswordService {
    private static HISTORY_LIMIT = parseInt(process.env.PASSWORD_HISTORY_LIMIT!) || 5;
    private static MIN_LENGTH = parseInt(process.env.PASSWORD_MIN_LENGTH!) || 12;

    /**
     * Valida si una nueva contraseña cumple con las políticas
     */
    static async validateNewPassword(userId: string, newPassword: string): Promise<void> {
        // Validar longitud mínima
        if (newPassword.length < this.MIN_LENGTH) {
            throw createValidationError(`La contraseña debe tener al menos ${this.MIN_LENGTH} caracteres`);
        }

        // Validar complejidad
        if (!this.validatePasswordComplexity(newPassword)) {
            throw createValidationError(
                'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial'
            );
        }

        // Verificar que no esté en el historial
        await this.checkPasswordHistory(userId, newPassword);
    }

    /**
     * Valida complejidad de contraseña
     */
    private static validatePasswordComplexity(password: string): boolean {
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return hasUppercase && hasLowercase && hasNumbers && hasSpecialChar;
    }

    /**
     * Verifica que la contraseña no esté en el historial
     */
    private static async checkPasswordHistory(userId: string, newPassword: string): Promise<void> {
        const history = await PasswordHistory
            .find({ userId })
            .sort({ createdAt: -1 })
            .limit(this.HISTORY_LIMIT)
            .select('passwordHash');

        for (const entry of history) {
            if (comparePassword(newPassword, entry.passwordHash)) {
                throw createValidationError(
                    `No puede reutilizar ninguna de sus últimas ${this.HISTORY_LIMIT} contraseñas`
                );
            }
        }
    }

    /**
     * Guarda contraseña en el historial
     */
    static async savePasswordToHistory(userId: string, passwordHash: string): Promise<void> {
        // Guardar nueva contraseña en historial
        await PasswordHistory.create({
            userId,
            passwordHash
        });

        // Limpiar entradas antiguas (mantener solo las últimas HISTORY_LIMIT)
        const allEntries = await PasswordHistory
            .find({ userId })
            .sort({ createdAt: -1 })
            .select('_id');

        if (allEntries.length > this.HISTORY_LIMIT) {
            const entriesToDelete = allEntries.slice(this.HISTORY_LIMIT);
            const idsToDelete = entriesToDelete.map(entry => entry._id);
            
            await PasswordHistory.deleteMany({
                _id: { $in: idsToDelete }
            });
        }
    }

    /**
     * Cambia contraseña de usuario
     */
    static async changePassword(userId: string, currentPassword: string, newPassword: string, currentPasswordHash: string): Promise<string> {
        // Verificar contraseña actual
        if (!comparePassword(currentPassword, currentPasswordHash)) {
            throw createValidationError('La contraseña actual no es correcta');
        }

        // Validar nueva contraseña
        await this.validateNewPassword(userId, newPassword);

        // Hash de nueva contraseña
        const newPasswordHash = hashPassword(newPassword);

        // Guardar en historial
        await this.savePasswordToHistory(userId, newPasswordHash);

        return newPasswordHash;
    }

    /**
     * Genera contraseña temporal (para reset)
     */
    static generateTemporaryPassword(): string {
        const length = Math.max(this.MIN_LENGTH, 16);
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';

        // Asegurar que tiene al menos uno de cada tipo
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
        password += '0123456789'[Math.floor(Math.random() * 10)];
        password += '!@#$%^&*'[Math.floor(Math.random() * 8)];

        // Completar con caracteres aleatorios
        for (let i = password.length; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }

        // Mezclar caracteres
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }

    /**
     * Limpia historial de contraseñas antiguo
     */
    static async cleanupOldPasswords(): Promise<void> {
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1); // 1 año

        await PasswordHistory.deleteMany({
            createdAt: { $lt: cutoffDate }
        });
    }
}
