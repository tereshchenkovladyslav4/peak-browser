import { Permission, UserInterest, UserMicro, UserMini } from './user';
import { GroupProperty } from './groupInfo';
import { UserExpertise } from './UserExpertise';
//import { AssociatedLearning } from '../admin/associated-learning/models/tree-content';

export class GroupMicro {
    public groupId: string;
    public groupName: string;
    public groupType: GroupType;
}

export class GroupSummary extends GroupMicro {
    public memberCount: number;
    public firstNUsers: Array<UserMicro>;
}

export class GroupMini extends GroupMicro {
    public imageUrl: string;
    public parentGroup: GroupMicro;
    public childGroups: Array<GroupMicro>;
    public properties: Array<GroupProperty>;
    public managers: Array<UserMicro>;
    public assistants: Array<UserMicro>;
}

export class Group extends GroupMini {
    public members: Array<UserMini>;
    public interests: Array<UserInterest>;
    public areasOfExpertise: Array<UserExpertise>;
    public groupPermissions: Array<Permission>;
    public description: string;
    public previousJobRoles: Array<GroupMicro>;
    public nextJobRoles: Array<GroupMicro>;
    //public associatedLearning: Array<AssociatedLearning>;
}

export enum GroupType {
    General,
    JobRole
}

export enum GroupStaffType {
    Owner,
    NotOwner
}

export class GroupPermission {
    public GroupId: string;
    public Permissions: Permission[];
}

export class GroupsPermissionsResponse {
    public GroupPermissions: GroupPermission[];
}

export class GetGroupResponse<T> {
    group: T;
}

export class GetAllGroupsResponse<T> {
    groups: Array<T>;
}
