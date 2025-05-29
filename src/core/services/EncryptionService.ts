import crypto from 'crypto';

export default class EncryptionService {
    private encryptionKey: string;
    private iv: Buffer;
    
    constructor() {
        if (!process.env.ENCRYPTION_KEY) {
            throw new Error('ENCRYPTION_KEY environment variable is not set');
        }
        this.encryptionKey = process.env.ENCRYPTION_KEY;

        // Use a fixed IV to ensure the same result every time for the same data
        this.iv = Buffer.from('1234567890abcdef1234567890abcdef', 'hex'); 
    }

    encryptData(data: string | number): string {
        try {
            const dataStr = String(data);
            
            
            // Use the fixed IV for encryption
            const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey, 'utf-8'), this.iv);
            let encrypted = cipher.update(dataStr, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return encrypted; 
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    
    decryptData(encryptedData: string): string  {
        try {
            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey, 'utf-8'), this.iv);
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted; 
        } catch (error) {
            console.log(error);
            throw error; 
        }
    }
}

