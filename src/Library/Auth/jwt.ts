import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ulid } from 'ulid';
import RefreshToken from '../../Models/refreshTokenModel';
import { hashPassword, comparePassword } from '../Encrypt';

/**
 * Hash determinístico para refresh tokens (usando SHA256)
 * A diferencia de bcrypt, esto genera el mismo hash para el mismo input
 */
const hashRefreshToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

export interface TokenPayload {
    userId: string;
    username: string;
    nombre?: string;
    role: string;
    permissions: string[];
    sessionId?: string;
    iat?: number;
    exp?: number;
    iss?: string;
    aud?: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export class JWTService {
    private static ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
    private static REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
    private static ACCESS_TTL = parseInt(process.env.JWT_ACCESS_TTL!) || 7200; // 2 hours
    private static REFRESH_TTL = parseInt(process.env.JWT_REFRESH_TTL!) || 604800; // 7 days
    private static ISSUER = process.env.JWT_ISS || 'https://localhost:3010/auth';
    private static AUDIENCE = process.env.JWT_AUD || 'https://localhost:3010';

    /**
     * Genera un par de tokens (access + refresh)
     */
    static async generateTokenPair(payload: Omit<TokenPayload, 'iat' | 'exp' | 'iss' | 'aud'>, userAgent?: string, ipAddress?: string): Promise<TokenPair> {
        // Generar access token
        const accessToken = this.generateAccessToken(payload);
        
        // Generar refresh token
        const refreshTokenData = this.generateRefreshToken();
        const refreshToken = refreshTokenData.token;
        
        // Guardar refresh token hasheado en BD
        await this.storeRefreshToken({
            userId: payload.userId,
            tokenHash: hashRefreshToken(refreshToken),
            tokenFamily: refreshTokenData.family,
            userAgent,
            ipAddress
        });

        return {
            accessToken,
            refreshToken,
            expiresIn: this.ACCESS_TTL
        };
    }

    /**
     * Genera access token JWT
     */
    static generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp' | 'iss' | 'aud'>): string {
        return jwt.sign(
            payload,
            this.ACCESS_SECRET,
            {
                expiresIn: this.ACCESS_TTL,
                issuer: this.ISSUER,
                audience: this.AUDIENCE,
                algorithm: 'HS256'
            }
        );
    }

    /**
     * Genera refresh token
     */
    static generateRefreshToken(): { token: string; family: string } {
        const family = ulid();
        const token = crypto.randomBytes(64).toString('hex');
        return { token, family };
    }

    /**
     * Verifica access token
     */
    static verifyAccessToken(token: string): TokenPayload {
        try {
            return jwt.verify(token, this.ACCESS_SECRET, {
                issuer: this.ISSUER,
                audience: this.AUDIENCE
            }) as TokenPayload;
        } catch (error) {
            throw new Error('Token inválido o expirado');
        }
    }

    /**
     * Rota refresh token
     */
    static async rotateRefreshToken(oldToken: string, userAgent?: string, ipAddress?: string): Promise<TokenPair | null> {
        try {
            // Buscar token en BD usando hash determinístico
            const tokenDoc = await RefreshToken.findOne({
                tokenHash: hashRefreshToken(oldToken),
                isRevoked: false,
                expiresAt: { $gt: new Date() }
            }).populate({
                path: 'userId',
                populate: {
                    path: 'role',
                    populate: {
                        path: 'permissions'
                    }
                }
            });

            if (!tokenDoc) {
                // Si no encontramos el token, podría ser reutilización - revocar toda la familia
                console.log('Token no encontrado, revocando familia...');
                await this.revokeTokenFamily(oldToken);
                throw new Error('Refresh token inválido');
            }

            const user = tokenDoc.userId as any;
            
            // Revocar token actual
            tokenDoc.isRevoked = true;
            tokenDoc.revokedAt = new Date();
            await tokenDoc.save();

            // Crear payload para nuevo token
            const payload: Omit<TokenPayload, 'iat' | 'exp' | 'iss' | 'aud'> = {
                userId: user._id.toString(),
                username: user.username,
                role: user.role.name,
                permissions: user.role.permissions.map((p: any) => `${p.resource}:${p.action}`)
            };

            // Generar nuevo par de tokens
            return await this.generateTokenPair(payload, userAgent, ipAddress);

        } catch (error) {
            // En caso de error, revocar toda la familia por seguridad
            await this.revokeTokenFamily(oldToken);
            throw error;
        }
    }

    /**
     * Almacena refresh token en BD
     */
    private static async storeRefreshToken(data: {
        userId: string;
        tokenHash: string;
        tokenFamily: string;
        userAgent?: string;
        ipAddress?: string;
    }): Promise<void> {
        const expiresAt = new Date(Date.now() + (this.REFRESH_TTL * 1000));
        
        await RefreshToken.create({
            userId: data.userId,
            tokenHash: data.tokenHash,
            tokenFamily: data.tokenFamily,
            expiresAt,
            userAgent: data.userAgent,
            ipAddress: data.ipAddress
        });
    }

    /**
     * Revoca toda una familia de tokens (en caso de detección de reutilización)
     */
    static async revokeTokenFamily(suspiciousToken: string): Promise<void> {
        try {
            // Buscar cualquier token (incluso revocado) que coincida usando hash determinístico
            const tokenDoc = await RefreshToken.findOne({
                tokenHash: hashRefreshToken(suspiciousToken)
            });

            if (tokenDoc) {
                // Revocar toda la familia
                await RefreshToken.updateMany(
                    { tokenFamily: tokenDoc.tokenFamily },
                    { 
                        isRevoked: true, 
                        revokedAt: new Date() 
                    }
                );
            }
        } catch (error) {
            console.error('Error revocando familia de tokens:', error);
        }
    }

    /**
     * Revoca todos los tokens de un usuario
     */
    static async revokeAllUserTokens(userId: string): Promise<void> {
        await RefreshToken.updateMany(
            { userId, isRevoked: false },
            { 
                isRevoked: true, 
                revokedAt: new Date() 
            }
        );
    }

    /**
     * Limpia tokens expirados
     */
    static async cleanupExpiredTokens(): Promise<void> {
        await RefreshToken.deleteMany({
            $or: [
                { expiresAt: { $lt: new Date() } },
                { isRevoked: true, revokedAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } // 30 días
            ]
        });
    }
}