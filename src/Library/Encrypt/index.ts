import bcrypt from 'bcryptjs';


const hashPassword = (password: string): string => {
    const saltRounds = 10;
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