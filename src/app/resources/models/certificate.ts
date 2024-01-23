
/// A certificate presented to the user
/// for completing an action.
export class Certificate {
    public certificateId: string;
    public docUrl: string;
    public docPreviewUrl: string;
    public useAsDefault: boolean = false;
    public hasDocUrl: boolean = false;
    public foundAtLevel: CertificateLevel;
    public reasonUnavailable: CertificateUnavailableReason;
}

export enum CertificateLevel {
    None,
    Tenant,
    Subscription,
    LearningPath
}

export enum CertificateUnavailableReason {
  NOT_COMPLETE = 'Not Complete',
  FAILED_QUIZ = 'Failed Quiz'
}
