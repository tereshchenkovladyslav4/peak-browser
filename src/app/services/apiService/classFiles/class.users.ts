import { ContentType_T} from "./class.content"


export class User {
	public userId: string = "";
    public name: string = "";
    public email: string = "";
    public imageURL: string = "";
}

export class PinnacleLiteUser {
    public userId: string = "";
    public userName: string = "";
    public userEmail: string = "";
    public isAdmin: boolean = false;
}

export class PermissionUser {
    public userId: string = "";
    public name: string = "";
    public email: string = "";
    public imageURL: string = "";

    public permissions: UserPermissions;
}


export class Comment {
    public commentId: string = "";
    public contentId: string = "";
    public contentType: ContentType_T = ContentType_T.cheatsheet;
    public userId: string = "";
    public name: string = "";
    public commentText: string = "";
    public publishDate: Date = new Date();
}

export class UserFilter {
    public limit: number = -1;
    public offset: number = 0;
}

export class UserPermissions {
    public administrator: boolean = false;
    public administerContent: boolean = false;
    public publishContent: boolean = false;
    public authorContent: boolean = false;
    public enrollUsers: boolean = false;
    public viewReports: boolean = false;
    public signClientAccount: boolean = false;
    public canCreateExternalUsers: boolean = false;
    public canManageBranding: boolean = false;
    public disabledEPSupport: boolean = false;
    public workgroupAdmin: boolean = false;
    public workgroupCreate: boolean = false;
    public isAssignor: boolean = false;

}

export class UserHistoryPost {
    public contentId: string = "";
    public contentType: ContentType_T = ContentType_T.cheatsheet;
    public referrer: string = "";
}
export class UserHistory {
    public contentId: string = "";
    public contentType: ContentType_T = ContentType_T.cheatsheet;
    public referrer: string = "";
    public name: string = "";
    public userId: string = "";
    public histDate: Date = new Date();
}

export enum RoleColorFill_T {
    solid,
    vertical,
    verticalFull,
    horzizontal,
    horzizontalFull
}

export class Role {
    public roleId: string = "";
    public roleName: string = "";
    public fillColor1: number = 0;
    public fillcolor2: number = 0;
    public textColor: number = 0;
    public outlineColor: number = 0;
    public fillMode: RoleColorFill_T;
}

export class UserPasswordPost {
	public oldPassword: string = "";
	public newPassword: string = "";
}

export enum SettingType_T {
	string,
    number
}

export class UserSettingPut {
	public settingName: string = "";
	public settingType: SettingType_T;
	public settingValue: any;
}

export class UserPut {
    public email: string = "";
    public name: string = "";
}

export class UserSettingPost {
    public settingName: string = "";
    public settingType: SettingType_T;
    public settingValue: any;
    public isValid: boolean = false;
}

export class Playlist {
  public plid: string = "";
  public tenantid: string = "";
  public userid: string = "";
  public name: string = ""; 
    }

export class PlaylistContent {
  public plcontentid: string = "";
  public plid: string = "";
  public tenantid: string = "";
  public contentId: string = "";
  public contentType: ContentType_T = ContentType_T.cheatsheet;
  public addeddatetime: Date = new Date();
  public bisdownloadable: boolean = false;
  public contentname: string = "";
  public contentdesc: string = "";
    public biscustom: boolean = false;
    public docURL: string = "";
}

export class ExternalUserPost {
    public email: string = "";
    public displayName: string = "";
    public imageData: any;
}


export class WidgetPropertyOptions {
    public opName: string = "";
    public opValue: string = "";
}

export class WidgetProperties {
    public propID: string = "";
    public propName: string = "";
    public propType: string = "";
    public propValue: string = "";
    public propDefaultValue: string = "";
    public propOptions: Array<WidgetPropertyOptions> = new Array<WidgetPropertyOptions>();
}

export class WidgetLayoutPage {
    public pageName: string = "";
    public containerId: string = "";
}

export class WidgetLayoutInfo {
    public layoutId: string = "";
    public name: string = "";
    public isPublic: boolean = false;
}

export class WidgetContainerInfo {
    containerInstanceId: string = "";
    containerid: string = "";
    bindingType: string = "";
    bindingId: string = "";
    layout: string = "";
    edit_x: number = 0;
    edit_y: number = 0;
    widgets: Array<apiContainerWidgets> = new Array<apiContainerWidgets>();
    flyoutTitle: string = "";
    containerName: string = "";
}

export class WidgetContainerBasicInfo {
    containerInstanceId: string = "";
    containerId: string = "";
    bindingType: string = "";
    bindingId: string = "";
    containerName: string = "";
}

export class ContainerWidgets {
    id: string = "";
    component: string = "";
    width: number = 2;
    height: number = 2;
    x: number = 0;
    y: number = 0;

    xs_x: number = 0;
    xs_y: number = 0;
    sm_x: number = 0;
    sm_y: number = 0;
    md_x: number = 0;
    md_y: number = 0;
    lg_x: number = 0;
    lg_y: number = 0;

    xs_width: number = 0;
    xs_height: number = 0;
    sm_width: number = 0;
    sm_height: number = 0;
    md_width: number = 0;
    md_height: number = 0;
    lg_width: number = 0;
    lg_height: number = 0;

    //obj: WidgetComponent; CR - ADD Back in when WidgetComponent Available in this project
}

export class apiContainerWidgets {
    id: string = "";
    component: string = "";
    width: number = 2;
    height: number = 2;
    x: number = 0;
    y: number = 0;
}

export class ExternalUserData {

    userID: string = "";
    email: string = "";
    display: string = "";
    imageURL: string = "";
    organizationName: string = "";
    organizationRole: string = "";
    phone: string = "";
}

export class ExternalUserPut {
    organizationName: string = "";
    organizationRole: string = "";
    phone: string = "";
}

export class RoleLayoutAssignment {
    roleid: string = "";
    rolename: string = "";
    layoutid: string = "";
}

export class UserMultiSelect {
    id: string = "";
    itemName: string = "";
}
