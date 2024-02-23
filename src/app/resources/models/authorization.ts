export interface LoggedInUserData {
  bearerToken: string;
  expiration: Date;
  orgID: number;
  tenantid: string;
  userId: string;
}
