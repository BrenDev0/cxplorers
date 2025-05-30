import bcrypt from 'bcrypt';

export default class PasswordService {
      async hashPassword(password: string): Promise<string> {
            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                return hashedPassword;
            } catch (error) {
                console.log(error);
                throw error;
            }
        }
        async comparePassword(password: string, hash: string): Promise<boolean> {
            const results = await bcrypt.compare(password, hash);
            
            return results;
        }
}