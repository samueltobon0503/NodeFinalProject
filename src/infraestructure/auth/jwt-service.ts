import jwt, { SignOptions } from 'jsonwebtoken';

export interface JWTPayload {
    email: string,
    role: string,
    id: string,
}

const JWT_SECRET = process.env.JWT_SECRET as string
const JWT_EXPIRE_IN = process.env.JWT_EXPIRE_IN 

export const generateToken = (payload: JWTPayload): string => {

    try {
        const options: SignOptions = {
            algorithm: 'HS256',
            expiresIn: JWT_EXPIRE_IN as any
        };
        const token = jwt.sign(payload, JWT_SECRET, options);

        return token;
    } catch (error) {
        throw new Error('Error al crear el token')
    }
};

export const verifyToken = (token: string): JWTPayload => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            algorithms: ['HS256']
        }) as JWTPayload

        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Error al crear el token')
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Error al verificar el token')
        }
        throw new Error('Error al verificar el token')
    }
}