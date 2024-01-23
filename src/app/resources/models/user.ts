import { HttpStatusCode } from '@angular/common/http';
import { GroupMicro } from './group';
import { UserExpertise } from './UserExpertise';
import { PermissionKey } from '../enums/permission-key.enum';

// export class User {

//     userId: string;
//     displayName: string;
//     email: string;
//     imageUrl: string;

//     constructor(public UserEmail: string, public UserName: string) {

//     }
// }


export class User {

    userId: string;
  user: any;
    constructor(public DisplayName: string, public Username: string, public Email: string , public ImageURL: string) {

    }
}

export class CreateUserRequest {

    public DisplayName: string = "";
    public Username: string = "";
    public Email: string = "";
    public ImageURL: string = "";
}

export class DeleteBulkUserRequest {
    public UserIDSetToBeDeleted: Array<string> = [];
}

export class ModifyUserRequest {
    public UpdatedDisplayName: string = "";
    public UpdatedEmail: string = "";
    public UpdatedImageUrl: string = "";
    public ManagersIdsToRemove:Array<string> = new Array<string>();
    public ManagersIdsToAdd: Array<string> = new Array<string>();
    public ExpertiseIdsToRemove: Array<string> = new Array<string>();
    public ExpertiseIdsToAdd: Array<string> = new Array<string>();
    public InterestIdsToRemove: Array<string> = new Array<string>();
    public InterestIdsToAdd: Array<string> = new Array<string>();
    public UpdatedPermissions: UserPermissions = new UserPermissions();
    public UpdatePropertyValues: Array<ModifyUserPropertyValue> = new Array<ModifyUserPropertyValue>();
    public GroupIdsToRemove: Array<string> = new Array<string>();
    public GroupIdsToAdd : Array<string> = new Array<string>();
}

export interface EndUserModifyUserRequest {
  updatedImageUrl: string;
}

export interface EndUserModifyUserResponse {
  imageUploaded: string;
}

export class UserPermissions {
    public inheritPermissions: boolean= true; //inherit
    public permissionsList: Array<Permission>= new Array<Permission>();
}

export class Permission {
    public permissionKey: PermissionKey;
    public permissionDisplayName: string;
    public permissionValue:boolean = false;
}

export class ModifyUserPropertyValue {
    public PropertyId: string;
    public TextValue: string;
    public TrueFalseValue:boolean;
    public NumberValue:number;
    public GuidValue: string;
}

export class ModifyPropertiesSeqRequest {
    /*[Required]*/
    public PropertyIds: string[];
}

export class ImportUsersRequest {
    public UsersToDelete: DeleteBulkUserRequest = new DeleteBulkUserRequest();

    public UsersToCreate: Array<CreateUserRequest> = new Array<CreateUserRequest>();

    public UsersToModify: Array<ModifyUserRequest> = new Array<ModifyUserRequest>();
}

export class GetUserResponse {
    user: any;
}

export class GetUserAccessToContentResponse {
    hasAccess: boolean;
}

export class UserInterest {
    public interestId: string;
    public interestName: string;
    public Inherited: boolean = false;
    public InheritedFrom: Array<GroupMicro> = new Array<GroupMicro>();
}

export class UserProperty {
    public propertyID: string;
    public propertyName: string;
    public isSensitive: boolean;
    public isVisible: boolean;
    public sequence: number;
    public propertyType: UserPropertyType;
    public propertyValueText: string;
    public propertyValueBit: boolean | null;
    public propertyValueInt: number | null;
    public propertyValueGuid: string | null;
    public propertyValueDateTime: string | null;
}

export enum UserPropertyType {
    Text,
    Number,
    TrueFalse,
    Date,
    Guid
}

export class UserMicro {
    public userId: string;
    public imageUrl: string = "";
    public displayName: string = "";
    public email: string = "";
}

export class UserMicroInitals extends UserMicro {
    public initials?: string;
}

export class UserMicroPlusGroup extends UserMicro {
    public userGroupNamesCSV: string = "";
}

export class UserMini extends UserMicro {
    public groups: Array<GroupMicro>;
    public properties: Array<UserProperty>;
    public managers: Array<UserMicro>;
}

export class UserFull extends UserMini {
    public interests: Array<UserInterest>;
    public areasOfExpertise: Array<UserExpertise>;
  public permissions: UserPermissions;

    constructor(userFull?: UserFull) {
        super();

        if (!(userFull==null)) {
            this.interests = userFull.interests;
            this.areasOfExpertise = userFull.areasOfExpertise;
            this.permissions = userFull.permissions;
            this.displayName = userFull.displayName;
            this.email = userFull.email;
            this.groups = userFull.groups;
            this.imageUrl = userFull.imageUrl;
            this.managers = userFull.managers;
            this.properties = userFull.properties;
            this.userId = userFull.userId;
        }
    }
}

export class GetAllUserSettingsResponse {
    public userSettings: UserSettings;
}

export class UserSettings {
    public emailNotifications: string;
    public languagePreference: string;
    public playlistLastDated: string;
    public roleLayoutPreference: string;
    public globalSupportPartner: string;
    public companyLogoNavigateURL: string;
    public excludeUserFromActiveDirectorySync: boolean;
    public excludeUserFromSSO: boolean;
    public excludeUserFromADGroups: boolean;
    public userMustChangePassword: boolean
    public peakSidebarCollapsed: string;
    public peakContentDetailsCollapsed: string;
}

export class ModifiedSetting {
    public name: string;
    public value: string;
}

export class ModifyUserSettingsRequest {
    public emailNotificationsNewValue?: boolean;
    public languagePreferenceNewValue?: string;
    public playlistLastDatedNewValue?: Date;
    public roleLayoutPreferenceNewValue?: string;
    public globalSupportPartnerNewValue?: string;
    public companyLogoNavigateURLNewValue?: string;
    public peakSidebarCollapsedNewValue?: boolean;
    public peakContentDetailsCollapsedNewValue?: boolean;
}

export class ModifiedUserSettingsResponse {
    public updatedSettings: ModifiedSetting[];
    public newUserSettings: UserSettings;
}

export class UserFolders {
    public userId: string;
    public folderId: string;
}

export class ChangePasswordRequest {
  public currentPassword: string;
  public newPassword: string;
  public confirmNewPassword: string;
}

export class UpdatePasswordResponse {
  public httpStatus: HttpStatusCode;
}

export class UpdateDisplayNameResponse {
  public httpStatus: HttpStatusCode;
}

export class UpdateUserDisplayNameRequest {
  public displayName: string;
}
