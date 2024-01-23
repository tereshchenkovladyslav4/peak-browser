import { Tenant, Organization } from "./class.organizations"

export interface SecurityKey {
	orgid: number,
	user: string,
	userid: string,
	tenantid: string,
	partnerid: string,
	selling_partnerid: string,
	tenant_name: string,
	edition: string,
	is_trial: boolean,
	is_mobile: boolean,
	is_browser: boolean,
	is_description_html: boolean,
	time_offset: number,
	is_support_disabled: boolean,
	pinnacle_version: string,
	isExternal: boolean
}

export class UserOrgInfoObject {
	organizationId: string = "";
		//public String organizationName { get; set; }
  partnerId: string = "";
  partnerName: string = "";
  partnerSupportEmail: string = "";
  partnerSupportPhone: string = "";

  loginImageURL: string = "";
  splashImageURL: string = "";
  badgeImageURL: string = "";

  productName: string = "";
  supportURL: string = "";
	chatSupportAvailable: boolean = false;
	emailSupportAvailable: boolean = false;
	phoneSupportAvailable: boolean = false;
	runSearchAvailable: boolean = false;
	remoteAssistanceAvailable: boolean = false;
	supportMaxWaitCount: number = 0;
	supportMaxAgentsCount: number = 0;



	tenantList: Tenant[] = [];
}

export class Language {
  public languageName: string = "";
  public languageCode: string = "";
}

export class AuthorizationBody {
  email: string = "";
  password: string = "";
  tenantId: string = "";
  language: string = "";
    returnLongLivedToken: boolean = false;
    timeOffset: number = 0;
  timezoneName: string = "";
}

export class APIV2AccessKey {
  public bearerToken: string = "";
    public expiration: Date = new Date();
    public orgID: number = 0;
  public tenantid: string = "";
  public userId: string = "";
}
export class UserToken {
  userAccessKey: string = "";
    apiV2AccessKey: APIV2AccessKey;
  longLivedToken: string = "";
    isExternalUser: boolean = false;

  email: string = "";
  tenantid: string = "";
}

export class Policy {
  policyID: string = "";
  title: string = "";
  text: string = "";
}

export class PasswordPolicies {
	policyEnforced: boolean = false;
	requiresComplexPassword: boolean = false;
	passwordExpires: boolean = false;
	passwordChangeOnFirstLogIn: boolean = false;
	passwordMustBeDifferentFromPrev: boolean = false;
	disableWinAuth: boolean = false;
	useAutoDiscover: boolean = false;
	ssoURL :string
	autoLogInWithWindows: boolean = false;
	disableForgotPassword: boolean = false;
	enableHybridSSO: boolean = false;
	numDaysPasExpires: number = 0;
	numDiffPasCount: number = 0;
}



export class PolicyAcceptBody {
	policyID: string = "";
	tenantID: string = "";
	email: string = "";
}


export class MarkPolicyAccepted extends PolicyAcceptBody {

    timestamp: string = "";
}

export class PWResetRequest {
  requestID: string = "";
  userID: string = "";
  reqType: string = "";
  reqByID: string = "";
  reqDateTime: string = "";
  resetDateTime: string = "";
  reqCode: string = "";
  isPending: boolean = false;
  tenantID: string = "";
}

export class FullAuthToken {
    token: UserToken;
    policyList: Array<Policy> = [];
    languageFile: string = "";
    apiToken: string = "";
    languageSetting: string = "";
    orgData: Organization;
    isTest: boolean = false;
}

export class SSO_Override {

    partnerID: string = "";
    email: string = "";
    link: string = "";
}
