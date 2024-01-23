export class AuthorizationInfo {
    constructor(public sellingPartnerID: string,
                public sellingPartnerName: string,
                public orgID: string,
                public orgName: string,
                public tenantList: Array<AuthorizationTenant>) { }
}

export class AuthorizationTenant {
    constructor(public name: string,
                public tenantID: string,
                public subscriptionStatus: TenantSubscriptionStatus,
                public authType: TenantAuthorizationType,
                public defaultLanguageCode: string) { }
}

export enum TenantSubscriptionStatus {
    Full = 1,
    Lite = 2,
    Expired = 3
}

export enum TenantAuthorizationType {
    Pinnacle = 1,
    EWS = 2,
    SAML = 3,
    OpenID = 4,
    PartnerOverride = 5
}
