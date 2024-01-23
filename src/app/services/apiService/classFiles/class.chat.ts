export enum ChatStatus_T {
    agentsBusy,
    completed,
    cancelled
}
export class ChatSession {
    public sessionId: string = "";
    public errorMessage: string = "";
}

export class ChatProduct {
    public productId: string = "";
    public name: string = "";
    public versions: ChatProductVersion[] = new Array<ChatProductVersion>();
}
export class ChatProductVersion {
    public versionId: string = "";
    public productId: string = "";
    public name: string = "";
}

export class ChatSettings {
    public useZendeskSupport: boolean = false;
    public supportPartnerId: string = "";
    public supportPartnerName: string = "";
    public pollingInterval: number = 4;
    public searchFirst: boolean = true;
    public chatOffered: boolean = true;
    public maxConnectWaitTime: number = 10;
    public maxAgentsToPing: number = 4;
    public supportPartnerThumbnail: string = "";
    public products: ChatProduct[] = new Array<ChatProduct>();
}

export class ChatUser {
    public userId: string = "";
    public orgId: number = 0;
    public displayName: string = "";
    public orgName: string = "";
    public email: string = "";
    public isExpert: boolean = false;
    public tenantId: string = "";
    public sellingPartnerId: string = "";
}
export class ChatMessage {
    public to: ChatUser = new ChatUser();
    public from: ChatUser = new ChatUser();
    public conversationId: string = "";
    public sessionId: string = "";
    public title: string = "";
    public body: string = "";
  public timestamp: Date = new Date();

}

export class SavedChatPost {
	public name: string = "";
	public messages: ChatMessage[];
}

export class SupportEmail {
  public userID: any;
  public useremail: string = "";
  public emailbody: string = "";
  public emailSubject: string = "";
}
