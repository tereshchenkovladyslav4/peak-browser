export class GroupInfo {

    constructor (
    public NewName : string ,
    public NewType: string ,
    public NewPermissionValues: Array<GroupPermissions>,
    public ExpertiseIdsToRemove: Array<string>, 
    public ExpertiseIdsToAdd: Array<string>,
    public InterestIdsToRemove: Array<string>,
    public InterestIdsToAdd: Array<string>,
    public NewPropertyValues: Array<GroupProperty>,
    public  ReturnType: string 
    )  {}
}

    export class GroupPermissions {
        constructor(
            public CanAdministerUsers:boolean,
            public CanManageContent:boolean,
            public CanViewReports:boolean, 
            public IsSupportDisabled:boolean,
            public CanManageSubscriptionContent:boolean,
            public CanAssignLearning:boolean,
            public CanImpersonateClients:boolean,
            public CanInviteExternalUsers:boolean,
            public CanManageBranding:boolean,
            public CanAdministerWorkGroups:boolean,
            public CanCreateWorkGroups: boolean,
            public IsAssignor: boolean
        ) {}
    }
  
    export class GroupProperty {
        constructor(
            public PropertyId : string,
            public PropertyName :string,
            public PropertyValue: object,
            public IsSensitive :boolean,
            public IsVisible :boolean,
            public Sequence : number
        ) {}
    }
       