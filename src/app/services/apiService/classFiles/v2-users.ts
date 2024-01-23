import { Group_Micro } from "./v2-groups";

export class User_Micro {
    public userId: string = "";
    public imageUrl: string = "";
    public displayName: string = "";
    public email: string = "";
}

export class User_Mini extends User_Micro {
    public groups: Array<Group_Micro> = [];
    public properties: Array<UserProperty> = [];
    public managers: Array<User_Micro> = [];
}


export class V2User extends User_Mini
{
    public interests: Array<UserInterest> = [];
    public areasOfExpertise: Array<UserExpertise> = [];
    public permissions: UserPermissions;
}


export class UserProperty {
    public propertyId: string = "";
    public propertyName: string = "";
    public isSensitive: boolean = false;
    public isVisible: boolean = false;
    public sequence: number = 0;

    public propertyType: UserPropertyType;


    public propertyValueText: string = "";
    public propertyValueBit: boolean = null;
    public propertyValueInt: number = null;
    public propertyValueGuid: string = "00000000-0000-0000-0000-000000000000";

}

export class UserInterest {
    public interestId: string = "";
    public interestName: string = "";
}

export class UserExpertise {
    public expertiseId: string = "";
    public expertiseName: string = "";
}


export class UserPermissions {
    public inheritPermissions: boolean = true; //inherit
    public permissionsList: Array<Permission> = [];

}

export class Permission {
    public permissionKey: string = "";
    public permissionDisplayName: string = "";
    public permissionValue: boolean = false;
}

export enum UserPropertyType {
    Text,
    Number,
    TrueFalse,
    Date,
    Guid

}

export class GetUserResponse {
    public user: any;

}
