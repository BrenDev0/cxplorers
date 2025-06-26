import { Token, TokenData } from './tokens.interface'
import BaseRepository from "../../core/repository/BaseRepository";
import { handleServiceError } from '../../core/errors/error.service';
import Container from '../../core/dependencies/Container';
import EncryptionService from '../../core/services/EncryptionService';

export default class TokenService {
    private repository: BaseRepository<Token>;
    private block = "tokens.service"
    constructor(repository: BaseRepository<Token>) {
        this.repository = repository
    }

    async create(token: Omit<TokenData, "tokenId">): Promise<Token> {
        const mappedToken = this.mapToDb(token);
        try {
            return this.repository.create(mappedToken as Token);
        } catch (error) {
            handleServiceError(error as Error, this.block, "create", mappedToken)
            throw error;
        }
    }

    async resource(tokenId: string): Promise<TokenData | null> {
        try {
            const result = await this.repository.selectOne("token_id", tokenId);
            if(!result) {
                return null
            }
            return this.mapFromDb(result)
        } catch (error) {
            handleServiceError(error as Error, this.block, "resource", {tokenId})
            throw error;
        }
    }

    async collection(userId: string): Promise<TokenData[]> {
        try {
            const result = await this.repository.select("user_id", userId)

            const data = result.map((token) => this.mapFromDb(token));

            return data;
        } catch (error) {
             handleServiceError(error as Error, this.block, "update", {userId})
            throw error;
        }
    }

    async update(tokenId: string, changes: TokenData): Promise<Token> {
        const mappedChanges = this.mapToDb(changes);
        const cleanedChanges = Object.fromEntries(
            Object.entries(mappedChanges).filter(([_, value]) => value !== undefined)
        );
        try {
            return await this.repository.update("token_id", tokenId, cleanedChanges);
        } catch (error) {
            handleServiceError(error as Error, this.block, "update", {cleanedChanges, tokenId})
            throw error;
        }
    }

    async delete(tokenId: string): Promise<Token> {
        try {
            return await this.repository.delete("token_id", tokenId) as Token;
        } catch (error) {
            handleServiceError(error as Error, this.block, "delete", {tokenId})
            throw error;
        }
    }

    mapToDb(token: Omit<TokenData, "tokenId">): Omit<Token, "token_id"> {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
            token: token.token,
            user_id: token.userId,
            type: token.type,
            service: token.service
        }
    }

    mapFromDb(token: Token): TokenData {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
            tokenId: token.token_id,
            token: encryptionService.decryptData(token.token),
            userId: token.user_id,
            type: token.type,
            service: token.service
        }
    }
}
