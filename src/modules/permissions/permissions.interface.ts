import { IRepository } from "../../core/repository/repository.interface";

export interface Permission {
  permission_id?: string;
  business_user_id: string;
  module_name: string;
  action: string
}

export interface PermissionData {
  permissionId?: string;
  businessUserId: string;
  moduleName: string;
  action: string
}

export interface IPermissionsRepository extends IRepository<Permission> {
  upsert(cols: string[], values: Omit<Permission, "stage_id">[]): Promise<Permission[]>
}
