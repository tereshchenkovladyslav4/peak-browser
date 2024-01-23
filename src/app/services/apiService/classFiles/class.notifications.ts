export enum NotificationFilter_T {
	all = 0,
	new = 1,
	read = 2
}

export enum NotificationStatus_T {
	new = 0,
	read = 1
}


export class Notification {
    public notificationId: string = "";
    public title: string = "";
    public description: string = "";
    public imageUrl: string = "";
    public linkUrl: string = "";
    public publishDate: Date = new Date();
    public tenantId: string = "";
    public userId: string = "";
    public createdByUserId: string = "";
    public notificationStatus: NotificationStatus_T;
}

export class NotificationPost {
	title: string = "";
	text: string = "";
    imageUrl: string = "";
    linkUrl: string = "";
    users: Array<string> = new Array<string>();
    useGroups: boolean = false;
}

