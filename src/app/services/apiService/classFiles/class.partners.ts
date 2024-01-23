export class Partner {
    public partnerId: string = "";
    public name: string = "";
    public logoURL: string = "";
    public partnerSupportEmail: string = "";
    public partnerSupportPhone: string = "";
    public supportURL: string = "";
    public chatSupportAvailable: boolean = false;
    public emailSupportAvailable: boolean = false; 
    public phoneSupportAvailable: boolean = false;
    public runSearchAvailable: boolean = false;
    public remoteAssistanceAvailable: boolean = false;
    public supportMaxWaitCount: number = 0;
    public supportMaxAgentsCount: number = 0;
    public partnerProductName: string = "";
}

export class PartnerNewsItem {
	public newsId: string = "";
	public partnerId: string = "";
	public name: string = "";
	public description: string = "";
	public linkUrl: string = "";
	public seq: number = 0;

}

export class PartnerSupport {
  public PartnerID: string = "";
  public SupportPhone: string = "";
  public SupportURL: string = "";
  public SupportEmail: string = "";
  public TimeZone: string = "";
  public GMTOffset: number = 0;
  public GMTOffsetDS: number = 0;
  public StartHour: any;
  public EndHour: any;
  public bMonday: boolean = false;
  public bTuesday: boolean = false;
  public bWednesday: boolean = false;
  public bThursday: boolean = false;
  public bFriday: boolean = false;
  public bSaturday: boolean = false;
  public bSunday: boolean = false;
  public OffHoursMsg: string = "";
  public bShutdownOverride: boolean = false;
  public OverrideMsg: string = "";
  public HasAdvancedInfo: boolean = false;
  public MaxClientWait: number = 0;
  public MaxAgentsNotify: number = 0;
  public RunSearch: boolean = false;
  public PingAllAgents: boolean = false;
  public MaxAgentChants: number = 0;
  public EvenlyDistributeChats: boolean = false;
  public PhoneSupportEnabled: boolean = false;
  public ChatSupportEnabled: boolean = false;
  public EmailSupportEnabled: boolean = false;
  public RemoteAssistanceEnabled: boolean = false;
  public AgentsUnavailableMsg: string = "";

}

export class AccountInformation {
    public accountTenantID: string = "";
    public accountTenantName: string = "";
    public accountOrgID: number = 0;
}
export class TenantSubscription {
    public subscriptionID: string = "";
    public tenantID: string = "";
    public name: string = "";
    public createDate: Date = new Date();
    public expirationDate: Date = new Date();
    public unlimitedExpirationDate: Date = new Date();
    public isTrial: boolean = false;
    public isPinnacleLite: boolean = false;
    public quantity: number = 0;
}

export class Subscription {
    public subscriptionID: string = "";
    public name: string = "";
    public isPinnacleLite: boolean = false;
    public partnerId: string = "";
}
export class AccountPost {
    public companyName: string = "";
    public userDisplayName: string = "";
    public userEmail: string = "";
    public isPinnacleLite: boolean = false;
    public maxPinnacleLiteUsers: number = 0;
}
export class AccountPut {
    public companyName: string = "";
    public userEmail: string = "";
}
export class SubscriptionPost {
    public partnerSubscriptionID: string = "";
    public liscenseCount: number = 0;
    public licenseCountCertifiedByEmail: string = "";
    public licenseCountCertifiedByName: string = "";
    public subscriptionExpiration: Date = new Date();
    public subscriptionUnlimitedUseExpiration: Date = new Date();
    public isTrial: boolean = false;
}
export class SubscriptionPut {
    public liscenseCount: number = 0;
    public licenseCountCertifiedByEmail: string = "";
    public licenseCountCertifiedByName: string = "";
    public subscriptionExpiration: Date = new Date();
    public subscriptionUnlimitedUseExpiration: Date = new Date();
    public isTrial: boolean = false;
}

export class TenantPost {
    public tenantName: string = "";
    public adminEmail: string = "";
    public isPinnacleLite: boolean = false;
}

export class TenantPut {
    tenantName: string = "";
    maxPinnacleLiteUsers: number = 0;
}

export class UpgradeOrderRequestPost {
    public orgId: number = 0;
    public tenantId: string = "";
    public upgradePlatform: boolean = false;
    public poNumber: string = "";
    public additionalSubscriptions: Array<SubscriptionPost> = [];
}
