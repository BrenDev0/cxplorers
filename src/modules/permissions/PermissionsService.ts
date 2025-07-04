import { Permission, PermissionData } from './permissions.interface'
import { handleServiceError } from '../../core/errors/error.service';
import Container from '../../core/dependencies/Container';
import EncryptionService from '../../core/services/EncryptionService';
import PermissionsRepository from './PermissionsRepository';

export default class PermissionsService {
    private repository: PermissionsRepository;
    private block = "permissions.service"
    constructor(repository: PermissionsRepository) {
        this.repository = repository
    }

    async create(permission: PermissionData): Promise<Permission> {
        const mappedPermission = this.mapToDb(permission);
        try {
            return this.repository.create(mappedPermission as Permission);
        } catch (error) {
            handleServiceError(error as Error, this.block, "create", mappedPermission)
            throw error;
        }
    }

    async upsert(permissions: PermissionData[]): Promise<Permission[]> {
        const mappedPermissions = permissions.map((permission) => this.mapToDb(permission))
        const cols  =  Object.keys(mappedPermissions[0]);
        const values = mappedPermissions.flatMap(permission => cols.map(col => (permission as any)[col]))
        try {
            const  result = await this.repository.upsert(cols, values);

            return result;
        } catch (error) {
            handleServiceError(error as Error, this.block, "upsert", permissions)
            throw error;
        }
    }

    async resource(permissionId: string): Promise<PermissionData | null> {
        try {
            const result = await this.repository.selectOne("permission_id", permissionId);
            if(!result) {
                return null
            }
            return this.mapFromDb(result)
        } catch (error) {
            handleServiceError(error as Error, this.block, "resource", {permissionId})
            throw error;
        }
    }

    async collection(businessUserId: string): Promise<PermissionData[]> {
        try {
            const result = await this.repository.select("business_user_id", businessUserId);
           
            return result.map((permission) => this.mapFromDb(permission))
        } catch (error) {
            handleServiceError(error as Error, this.block, "resource", {businessUserId})
            throw error;
        }
    }

    async update(permissionId: string, changes: PermissionData): Promise<Permission> {
        const mappedChanges = this.mapToDb(changes);
        const cleanedChanges = Object.fromEntries(
            Object.entries(mappedChanges).filter(([_, value]) => value !== undefined)
        );
        try {
            return await this.repository.update("permission_id", permissionId, cleanedChanges);
        } catch (error) {
            handleServiceError(error as Error, this.block, "update", cleanedChanges)
            throw error;
        }
    }

    async delete(permissionId: string): Promise<Permission> {
        try {
            return await this.repository.delete("permission_id", permissionId) as Permission;
        } catch (error) {
            handleServiceError(error as Error, this.block, "delete", {permissionId})
            throw error;
        }
    }

    mapToDb(permission: PermissionData): Permission {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
            permission_id: permission.permissionId,
            business_user_id: permission.businessUserId,
            module_name: permission.moduleName,
            action: permission.action
        }
    }

    mapFromDb(permission: Permission): PermissionData {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
            permissionId: permission.permission_id,
            businessUserId: permission.business_user_id,
            moduleName: permission.module_name,
            action: permission.action
        }
    }
}
