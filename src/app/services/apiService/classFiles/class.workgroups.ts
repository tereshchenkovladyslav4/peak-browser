import { ContentType_T, DescriptionFilter_T } from "./class.content"
import { Role } from "./class.users"

export enum PermissionLevel_T {
    owner =0,
    editor =1,
    user =2
}

export enum IndexType_T {
    defaultIndex =0,
    frequentlyUsedIndex =1
}

export class Workgroup {
    public workgroupId: string = "";
    public name: string = "";
    public imageURL: string = "";
    public description: string = "";
    public createdById: string = "";
    public createdDatetime: Date = new Date();
    public archivedById: string = "";
    public archivedDatetime: Date = new Date();
    public archivedNotes: string = "";
    public isArchived: boolean = false;
    public tenantid: string = "";
    public tenantName: string = "";
    public assetCount: number = 0;
    public memberCount: number = 0;
    public externalMemberCount: number = 0;
    public ownerDisplay: string = "";
    public isPublic: boolean = false;
    public ownerTenantName: string = "";
    public isExternal: boolean = false;
    public membersTabEditorsAllowed: boolean = false;
    public membersTabMembersAllowed: boolean = false;
    public membersTabExternMembersAllowed: boolean = false;
    public discussionEditorsAllowed: boolean = false;
    public discussionMembersAllowed: boolean = false;
    public discussionExternMembersAllowed: boolean = false;
    public editorsDashboardAllowed: boolean = false;
    public membersDashboardAllowed: boolean = false;
    public externalMembersDashboardAllowed: boolean = false;
    public notifyContentAdded: boolean = false;
    public notifyContentRemoved: boolean = false;
    public notifyContentModified: boolean = false;
    public notifyUserAdded: boolean = false;
    public notifyUserRemoved: boolean = false;
    public notifyUserExpiring: boolean = false;
    public notifyCommentPosted: boolean = false;
    public notifyArchivedRestored: boolean = false;
}

export class WorkgroupPost {
    public name: string = "";
    public unformattedDescription: string = "";
    public formattedDescription: string = "";
    public imageURL: string = "";
    public isPublic: boolean = false;
    public membersTabEditorsAllowed: boolean = false;
    public membersTabMembersAllowed: boolean = false;
    public membersTabExternMembersAllowed: boolean = false;
    public discussionEditorsAllowed: boolean = false;
    public discussionMembersAllowed: boolean = false;
    public discussionExternMembersAllowed: boolean = false;
    public editorsDashboardAllowed: boolean = false;
    public membersDashboardAllowed: boolean = false;
    public externalMembersDashboardAllowed: boolean = false;
    public notifyContentAdded: boolean = false;
    public notifyContentRemoved: boolean = false;
    public notifyContentModified: boolean = false;
    public notifyUserAdded: boolean = false;
    public notifyUserRemoved: boolean = false;
    public notifyUserExpiring: boolean = false;
    public notifyCommentPosted: boolean = false;
    public notifyArchivedRestored: boolean = false;
}
export class WorkgroupPut {
	public name: string = "";
	public description: string = "";
    public imageURL: string = "";
    public isPublic: boolean = false;
    public membersTabEditorsAllowed: boolean = false;
    public membersTabMembersAllowed: boolean = false;
    public membersTabExternMembersAllowed: boolean = false;
    public discussionEditorsAllowed: boolean = false;
    public discussionMembersAllowed: boolean = false;
    public discussionExternMembersAllowed: boolean = false;
    public editorsDashboardAllowed: boolean = false;
    public membersDashboardAllowed: boolean = false;
    public externalMembersDashboardAllowed: boolean = false;
    public notifyContentAdded: boolean = false;
    public notifyContentRemoved: boolean = false;
    public notifyContentModified: boolean = false;
    public notifyUserAdded: boolean = false;
    public notifyUserRemoved: boolean = false;
    public notifyUserExpiring: boolean = false;
    public notifyCommentPosted: boolean = false;
    public notifyArchivedRestored: boolean = false;
}
export class WorkgroupMember {
    public workgroupId: string = "";
    public userId: string = "";
    public name: string = "";
    public email: string = "";
    public permissionLevel: string = "";
    public imageURL: string = "";
    public isExplicitMember: boolean = false;
    public inheritedRoles: Role[];
    public isSelfInvited: boolean = false;
}
export class WorkgroupRole {
    public workgroupId: string = "";
    public roleId: string = "";
    public name: string = "";
    public permissionLevel: string = "";
} 

export class WorkgroupFilter {
    public limit: number = 0;
    public offset: number = 0;
    public search: string = "";

    public archiveIncluded: boolean ;
    public descriptionFilter: DescriptionFilter_T;
    public permissionFilter: Array<PermissionLevel_T> = []; 
}

export class WorkgroupContentPost {
    public contentId: string = "";
    public contentType: ContentType_T = ContentType_T.cheatsheet;
    public isValid: boolean ;
}

export class WorkgroupContentIndex {
    public workgroupID: string = "";
    public wgcontentID: string = "";
    public contentID: string = "";
    public dateTimeAdded: Date = new Date();
    public index: number = 0;
}

export class WorkgroupMemberPost {
    public id: string = "";
    public permissionLevel: PermissionLevel_T;
}

export class WorkgroupMemberPut {
    public permissionLevel: PermissionLevel_T;    
}

export class WorkgroupRolePost {
    public id: string = "";
    public permissionLevel: PermissionLevel_T;
}

export class WorkgroupRolePut {
    public permissionLevel: PermissionLevel_T;
}

export class WorkgroupExternalGroup {
    public id: string = "";
    public name: string = "";
    public members: WorkgroupExternalMembers[];
    public multimember: boolean = false;
}

export class WorkgroupExternalMembers {
    public id: string = "";
    public name: string = "";
    public email: string = "";
    public imageURL: string = "";
    public isManager: boolean = false;
    public status: boolean = false;
    public organizationName: string = "";
    public phone: string = "";
    public organizationRole: string = "";

    public maxInvites: number = 0;
    public inviteFromDisplayName: string = "";
    public inviteFromEmail: string = "";
    public inviteDate: string = "";
    public membershipExpires: boolean = false;
    public expirationDate: string = "";
}

export class WorkgroupExternalMemberPost {
    public email: string = "";
    public isManager: boolean = false;
}

export class WorkgroupExternalGroupPost {
    public name: string = "";
    public multimember: boolean = false;
}

export class WorkgroupExternalGroupAndMemberPost {
    public email: string = "";
    public isManager: boolean = false;
    public displayName: string = "";
    public imageURL: string = "";
    public groupName: string = "";
    public invitesAllowed: number = 0;
    public membershipExpires: boolean = false;
    public expirationDate: string = "";
}

export class WorkgroupExternalSummary {
    public tenantid: string = "";
    public externalMembersMax: number = 0;
    public externalMembersUsed: number = 0;

    public externalMemberInvitesAvailable: number = 0;

    public summaryRecords: Array<WorkgroupExternalSummaryRecord> = [];
}

export class WorkgroupExternalSummaryRecord {
    public workgroupID: string = "";
    public name: string = "";
    public externalMemberCount: number = 0;
    public owners: string = "";
}

export class WorkgroupExternalMemberPut {
    public isManager: boolean = false;
    public invitesAllowed: number = 0;
    public membershipExpires: boolean = false;
    public expirationDate: string = "";
}


export class WorkgroupListByPermission {
    public editorPermissionWorkgroups: Array<String> = [];
    public ownerPermissionWorkgroups: Array<String> = [];
}

export class WorkgroupExternalInviteAcceptance {
    public inviteFound: boolean = false;
    public newExternalUser: boolean = false;
    public inviteAccepted: boolean = false;
    public sentUserSetupEmail: boolean = false;
    
}

export enum WorkgroupSharContentStatusEnum {
    AlreadyExist,
    Success,
    Fail
}

export class WorkgroupShareContent {
    public Status: WorkgroupSharContentStatusEnum;
}