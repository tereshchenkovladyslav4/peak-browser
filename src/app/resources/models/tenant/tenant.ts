export class TenantMini {
  public tenantId: string;
  public organizationId: number;
  public tenantName: string;
  public isPinnacleLite: boolean;
}

export class GetTenantResponse {
  public tenant: TenantMini;
}
