export class Organization{
	organizationId: string = "";
	name: string = "";
	sellingPartnerId: string = "";
}

export class Tenant {
	tenantId: string = "";
	organizationId: number = 0;
    public altOrganizationId: string = "";
    public name: string = "";
    public isPinnacleLite: boolean = false;
    public expiration: Date = new Date();
    public maxPinnacleLiteUsers: number = 0;
}

export class TenantWithLogo {
    tenantId: string = "";
    organizationId: number = 0;
    public altOrganizationId: string = "";
    public name: string = "";
    public isPinnacleLite: boolean = false;
    public expiration: Date = new Date();
    public maxPinnacleLiteUsers: number = 0;
    logo: string = "";
}


export class Setting {
    public settingId: string = "";
    public tenantId: string = "";
    public userId: string = "";
    public name: string = "";
    public settingType: string = "";
    public settingValue: Object;
}
export class CompanyNewsItem {
    public newsId: string = "";
    public tenantId: string = "";
    public name: string = "";
    public description: string = "";
    public linkUrl: string = "";
    public seq: number = 0;
    public updateMsg: string = "";
}

export class PinnacleLiteSettings {
    public isPinnacleLite: boolean = false;
    public createdAsPinnacleLite: boolean = false;
    public upgradeDate: Date = new Date();
}

export class ThemeItem {
    public itemName: string = "";
    public itemValue: string = "";
}

export class Theme {
    public themeID: string = "";
    public themeName: string = "";
    public themeproperties: Array<ThemeItem> = [];
}

