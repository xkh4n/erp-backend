import bcrypt from 'bcryptjs';

const hashPassword = (password: string): string => {
    // Optimizar rounds según ambiente: desarrollo más rápido, producción más seguro
    const saltRounds = process.env.NODE_ENV === 'development' ? 8 : 12;
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(password, salt);
}
const comparePassword = (password: string, hash: string): boolean => {
    return bcrypt.compareSync(password, hash);
}


export {
    hashPassword,
    comparePassword
}