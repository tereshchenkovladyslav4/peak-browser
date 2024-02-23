export interface PasswordSettings {
  requireComplexPasswords: boolean;
  requireUniquePassword: boolean;
  uniquePasswordCount: number;
}

export interface GetPasswordSettingsResponse {
  passwordSettings: PasswordSettings;
}

export interface OrganizationInfo {
  organizationId: number;
  sellingPartnerId: string;
  partnerId: string;
  organizationName: string;
  tenants: TenantMini[];
  expirationDate: string;
}

export interface TenantMini {
  tenantId: string;
  organizationId: number;
  tenantName: string;
  isPinnacleLite: boolean;
}
