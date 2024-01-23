import { User_Mini, UserInterest, UserExpertise, Permission, User_Micro } from "./v2-users";
import { Content } from "./class.content";
import { ContentType, ContentDocumentType } from "src/app/resources/models/content";

export class Group_Micro {
    public groupId: string = "";
    public groupName: string = "";
    public groupType: GroupType;
}

export class Group_Mini extends Group_Micro {
    public imageUrl: string = "";
    public parentGroup: Group_Micro;
    public childGroups: Array<Group_Micro> = [];
    public properties: Array<GroupProperty> = [];
    public managers: Array<User_Micro> = [];
    public assistants: Array<User_Micro> = [];
}

export class Group extends Group_Mini
{
    public members: Array<User_Mini> = [];
    public interests: Array<UserInterest> = [];
    public areasOfExpertise: Array<UserExpertise> = [];
    public groupPermissions: Array<Permission> = [];
    //See UserUtilities > GetPermissionConfig
    public description: string = "";
    public previousJobRoles: Array<Group_Micro> = [];
    public nextJobRoles: Array<Group_Micro> = [];
    public associatedLearning: Array<AssociatedLearning> = [];
}

// If you add a type, be aware that the [sy_roles].[group_type]
// column is limited to 20 characters. You will need to
// increase that limit and change the value of
// GroupConstants.MAX_GROUP_TYPE_LENGTH.
export enum GroupType {
    General,
    JobRole
}

export class GroupProperty {
    public propertyId: string = "";
    public name: string = "";
    public propertyType: GroupPropertyType;
    public isSensitive: boolean = false;
    public isVisible: boolean = false;
    public sequence: number = 0;
    public value: GroupPropertyValue;
}

export class GroupPropertyValue {
    public propertyId: string = "";
    public groupId: string = "";
    public stringValue: string = "";
    public boolValue: boolean = null;
    public intValue: number = null;
    public guidValue:string = "";
    public dateTimeValue: string = "";
    public url: string = "";
}

export enum GroupPropertyType {
    Text,
    Number,
    TrueFalse,
    Date,
    Guid
}

export class AssociatedLearning {
    public groupId: string = "";
    public contentId: string = "";
    public contentType: ContentType;
    public contentName: string = "";
    public contentDescription: string = "";
    public subscriptionId: string = "";
    public publisher: string = "";
    public tenantId: string = "";
    public required: boolean = false;
    public lastModified: string = "";
    public modifiedBy: User_Micro;
}

export class AssociatedLearningWithProgress extends AssociatedLearning {
    public markCompleted: boolean = false;
    public currentProgress: number = 0;
    public completedDate: Date = new Date();
}


export class AssociatedLearningContent {
    public groupId: string = "";
    public content: Content;
}

export class FolderStructureContent {
    public id: string = "";
    public name: string = "";
    public type: ContentType;
    public contents: Array<FolderStructureContent> = [];
    public subscriptionId: string = "";
    public folderType: ContentFolderType;
    public restricted: boolean = false;
    public required: boolean = false;
    public lastModified :string = "";
    public publisher: string = "";
    public products: Array<string> = [];
    public searchScore: number = null;
    public searchPathstring: string = "";
    public documentType: ContentDocumentType = ContentDocumentType.Custom;
}


/// <summary>
/// Associated Learning
/// </summary>
export enum ContentFolderType {
    None,
    Document,
    LearningPath,
    Video,
    Workflow,
    LiveEvent,
    Quiz
}


export class GetUserAssociatedLearningResponse {
    public userAssociatedLearning: Array<AssociatedLearningWithProgress> = [];
}

export class GetGroupResponse {
    public group: any;
}

export class GetGroupAssociatedLearningUserProgressResponse {
}

export class ZendeskSupportResponse {
    public redirectURL: string = "";
}
