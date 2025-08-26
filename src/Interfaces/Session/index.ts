export default interface ISession {
    userId?: string;
    username?: string;
    role?: string;
    permissions?: string[];
}

// Extensión del módulo express-session
declare module 'express-session' {
    interface Session {
        userId?: string;
        username?: string;
        role?: string;
        permissions?: string[];
    }
}
