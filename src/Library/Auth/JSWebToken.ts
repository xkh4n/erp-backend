/* LOGGER */
import log4js, { Token } from 'log4js';
const logger = log4js.getLogger('JSWebToken Controllers:');
logger.level = 'all';

/** PERSONALIZED ERRORS */
import { createAuthorizationError} from "../../Library/Errors/index";

/* JSONWEBTOKEN */
import jwt from 'jsonwebtoken';

/* DEPENDENCIES */
import { getChileDateTime } from '../Utils/ManageDate';


const createAccessToken = (userId: string, username: string, role: string, permissions: string[], sessionId?: string): string => {
    const now = Math.floor(Date.now() / 1000); // Timestamp actual en segundos
    const payload = {
        token_type: 'access',
        userId,
        username,
        role,
        permissions,
        sessionId,
        iat: now, // Tiempo de emisión
        exp: now + (60 * 60 * 3) // Expira en 3 horas
    };
    
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!);
}

const createRefreshToken = (userId: string, username: string, role: string, permissions: string[], sessionId?: string): string => {
    const now = Math.floor(Date.now() / 1000); // Timestamp actual en segundos
    const payload = {
        token_type: 'refresh',
        userId,
        username,
        role,
        permissions,
        sessionId,
        iat: now, // Tiempo de emisión
        exp: now + (60 * 60 * 24 * 15) // Expira en 15 días
    };
    
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!);
}

const decodedToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
        return decoded;
    } catch (error) {
        logger.error('Error decoding token:', error);
        throw createAuthorizationError('Invalid token');
    }
}

const decodedRefreshToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
        return decoded;
    } catch (error) {
        logger.error('Error decoding refresh token:', error);
        throw createAuthorizationError('Invalid refresh token');
    }
}


export{
    createAccessToken,
    createRefreshToken,
    decodedToken,
    decodedRefreshToken
}