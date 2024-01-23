import { Injectable } from '@angular/core';
import { AclRole } from '../../resources/enums/acl-role.enum';
import { SessionStorageService } from '../storage/services/session-storage.service';
import { TenantMini } from '../../resources/models/tenant/tenant';
import { Permission } from '../../resources/models/user';

@Injectable({
  providedIn: 'root',
})
export class AclService {
  private permissions: { [key: string]: boolean } = {};

  constructor(private sessionStorage: SessionStorageService) {}

  /*
   Should return true if any role is matched to current account
   */
  checkRoles(roles: AclRole[]): boolean {
    if (!roles?.length) return true;

    return roles.some((role) => {
      switch (role) {
        case AclRole.NotPinnacleLite: {
          const currentTenantDetails: TenantMini = this.sessionStorage.getItem('tenantDetails');
          return !currentTenantDetails?.isPinnacleLite;
        }
        case AclRole.PinnacleLite: {
          const currentTenantDetails: TenantMini = this.sessionStorage.getItem('tenantDetails');
          return !!currentTenantDetails?.isPinnacleLite;
        }
      }
    });
  }

  /*
   Should return true if user has all permissions
   */

  checkPermission(permission: string) {
    if (!permission) {
      return true;
    }
    const multiPermissions = permission.split('|');
    for (const key in multiPermissions) {
      if (this.checkMultiPermission(multiPermissions[key].split('&'))) {
        return true;
      }
    }
    return false;
  }

  private checkMultiPermission(permissionArray: string[]): boolean {
    for (const key in permissionArray) {
      if (!this.permissions[permissionArray[key]]) {
        return false;
      }
    }
    return true;
  }

  loadPermission(permissionList: Permission[]) {
    this.permissions = {};
    permissionList.forEach((element) => {
      if (element.permissionValue) {
        this.permissions[element.permissionKey] = true;
      }
    });
  }
}
