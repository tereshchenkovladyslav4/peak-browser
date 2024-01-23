export interface PasswordSettings {
  requireComplexPasswords: boolean;
  requireUniquePassword: boolean;
  uniquePasswordCount: number;
}

export interface GetPasswordSettingsResponse {
  passwordSettings: PasswordSettings;
}
