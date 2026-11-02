import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'default_secret';
const ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION || '15m'; 

export interface AccessTokenPayload {
    userId: number | string;
    email: string,
    jti: string;
}

export const generateAccessToken = (user: { id: number , email:string}):{accessToken:string, jti:string}=>{
 const jti = crypto.randomUUID();
const payload:AccessTokenPayload ={
    userId: user.id,
    email: user.email,
    jti,
}
const accessToken= jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRATION,
})
return {accessToken, jti}
}

export const hashToken= (token:string):string => {
    return crypto.createHash('sha256').update(token).digest('hex');
}