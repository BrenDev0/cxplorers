import jwt, { SignOptions } from  'jsonwebtoken';
import { StringValue } from 'ms'


export default class WebTokenService {
    private tokenKey: string;
    constructor() {
        if(!process.env.TOKEN_KEY) {
            throw new Error("env variable not set");
        }

        this.tokenKey = process.env.TOKEN_KEY
    }

    generateToken(payload: Record<string, string | number>, expiration: string | number = '15m'): string {
        try {

            const options: SignOptions = {
                expiresIn: expiration as StringValue
            };
            
            return jwt.sign(payload, this.tokenKey, options)
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    decodeToken(token: string): Record<string, any> | null {
        try {
            const decoded = jwt.decode(token) as Record<string, any> | null;
    
            if (!decoded) return null;
    
            // Check if token is expired
            if (decoded.exp && Date.now() >= decoded.exp * 1000) {
                console.log("Token expired.");
                return null;
            }
    
            return decoded;
        } catch (error) {
            console.log("Error decoding token: ", error);
            return null;
        }
    }
}
