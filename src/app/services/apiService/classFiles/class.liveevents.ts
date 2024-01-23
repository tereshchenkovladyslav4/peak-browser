import { ContentPrerequisite } from "./class.content";

export class LiveEventWrapper {

    constructor(
        p_eventID: string,
        p_name: string,
        p_simpleDescription: string,
        p_formattedDescription: string,
        p_keywords: string,
        p_previousRecordingDate: Date,
        p_previousRecordingVideoID: string,
        p_folderID: string,
        p_isDeleted: boolean,
        p_providedBy: string,
        p_duration: number,
        p_prerequisites: Array<ContentPrerequisite>,
        p_properties: Array<LiveEventProperty>,
        p_sessionID: string,
        p_presenterID: string,
        p_presenterDisplayName: string,
        p_scheduledBy: string,
        p_sessionDateTime: Date,
        p_sessionURL: string,
        p_sessionLocation: string,
        p_sessionStatus: LiveEventBrowserCalendarStatus,
        p_startDate: Date,
        p_endDate: Date,
        p_allDay: boolean,
        p_useRegistrationDates: boolean,
        p_registrationStartDate: Date,
        p_registrationEndDate: Date,
        p_recurrenceID: string
    ) {
        this.eventID = p_eventID;
        this.name = p_name;
        this.simpleDescription = p_simpleDescription;
        this.formattedDescription = p_formattedDescription;
        this.keywords = p_keywords;
        this.previousRecordingDate = p_previousRecordingDate = new Date();
        this.previousRecordingVideoID = p_previousRecordingVideoID;
        this.folderID = p_folderID;
        this.isDeleted = p_isDeleted;
        this.providedBy = p_providedBy;
        this.duration = p_duration;
        this.prerequisites = p_prerequisites;
        this.properties = p_properties;
        this.sessionID = p_sessionID;
        this.presenterID = p_presenterID;
        this.presenterDisplayName = p_presenterDisplayName;
        this.scheduledBy = p_scheduledBy;
        this.sessionDateTime = p_sessionDateTime;
        this.sessionURL = p_sessionURL;
        this.sessionLocation = p_sessionLocation;
        this.sessionStatus = p_sessionStatus;
        this.startDate = p_startDate = new Date();
        this.endDate = p_endDate = new Date();
        this.allDay = p_allDay;
        this.useRegistrationDates = p_useRegistrationDates;
        this.registrationStartDate = p_registrationStartDate = new Date();
        this.registrationEndDate = p_registrationEndDate = new Date();
        this.recurrenceID = p_recurrenceID;
    }

    // Information from LiveEvent
    eventID: string = ""; // Guid
    name: string = "";
    simpleDescription: string = "";
    formattedDescription: string = "";
    keywords: string = "";
    previousRecordingDate: Date = new Date();
    previousRecordingVideoID: string = ""; // Guid
    folderID: string = ""; // Guid
    isDeleted: boolean = false;
    providedBy: string = ""; // Origin tenant guid

    // Information from LiveEventSession
    duration: number = 0; // Number of seconds
    prerequisites: Array<ContentPrerequisite> = [];
    properties: Array<LiveEventProperty> = [];
    sessionID: string = ""; // Guid
    presenterID: string = ""; // Guid
    presenterDisplayName: string = "";
    scheduledBy: string = ""; // Guid
    sessionDateTime: Date = new Date();
    sessionURL: string = "";
    sessionLocation: string = "";
    useRegistrationDates: boolean = false;
    registrationStartDate: Date = new Date();
    registrationEndDate: Date = new Date();
    recurrenceID: string = "";

    // Information generated for calendar
    sessionStatus: number = 0;
    startDate: Date = new Date();
    endDate: Date = new Date();
    allDay?: boolean = false;
}

export class LiveEventProperty {

    constructor(
        p_propertyID: string,
        p_liveEventID: string,
        p_liveEventSessionID: string,
        p_propertyName: string,
        p_propertyType: LiveEventPropertyType,
        p_valueType: LiveEventPropertyValueType,
        p_isVisibleInBrowser: boolean,
        p_valueID: string,
        p_mcChoices: Array<LiveEventPropertyMCChoice>,
        p_stringValue: string,
        p_boolValue: boolean,
        p_numberValue: number,
        p_guidValue: string,
        p_propertySequence: number
    ) {
        this.propertyID = p_propertyID;
        this.liveEventID = p_liveEventID;
        this.liveEventSessionID = p_liveEventSessionID;
        this.propertyName = p_propertyName;
        this.propertyType = p_propertyType;
        this.valueType = p_valueType;
        this.isVisibleInBrowser = p_isVisibleInBrowser;
        this.valueID = p_valueID;
        this.mcChoices = p_mcChoices;
        this.stringValue = p_stringValue;
        this.boolValue = p_boolValue;
        this.numberValue = p_numberValue;
        this.guidValue = p_guidValue;
        this.propertySequence = p_propertySequence;
    }

    propertyID: string = ""; // Guid
    liveEventID: string = ""; // Guid
    liveEventSessionID: string = ""; // Guid
    propertyName: string = "";
    propertyType: LiveEventPropertyType;
    valueType: LiveEventPropertyValueType;
    isVisibleInBrowser: boolean = false;
    valueID: string = ""; // Guid
    mcChoices: Array<LiveEventPropertyMCChoice> = [];
    stringValue: string = "";
    boolValue: boolean = false;
    numberValue: number = 0;
    guidValue: string = ""; // Guid
    userID: string = "";
    propertySequence: number = 0;
}

export class LiveEventPropertyMCChoice {

    constructor(
        p_choiceID: string,
        p_choiceText: string,
        p_choiceSequence: number,
        p_isSelected: boolean
    ) {
        this.choiceID = p_choiceID;
        this.choiceText = p_choiceText;
        this.choiceSequence = p_choiceSequence;
        this.isSelected = p_isSelected;
    }

    choiceID: string = ""; // Guid
    choiceText: string = "";
    choiceSequence: number = 0;
    isSelected: boolean = false;
}

export enum LiveEventPropertyType {
    RegistrationField,
    EventSessionProperty,
    InstructorEntry,
    SurveyField,
}

export enum LiveEventPropertyValueType {
    YesNo,
    Text,
    Number,
    Rating,
    User,
    Content,
    MultipleChoice
}

export enum LiveEventBrowserCalendarStatus {
    Registered,
    Invited,
    Required,
    External,
    Internal,
    Waitlisted
}

export enum LiveEventRegistrationType {
    None,
    Registered,
    Invited,
    Assigned,
    Waitlisted
}

export class LiveEventSurvey {

    userDisplayName: string = "";
    eventTitle: string = "";
    eventStartDateTime: Date = new Date();
    eventEndDateTime: Date = new Date();
    eventQuestions: Array<LiveEventProperty> = [];
    tenantID: string = "";

    constructor(p_userDisplayName: string,
                p_eventTitle: string,
                p_eventStartDateTime: Date,
                p_eventEndDateTime: Date,
                p_eventQuestions: Array<LiveEventProperty>,
                p_tenantID: string) {
        this.userDisplayName = p_userDisplayName;
        this.eventTitle = p_eventTitle;
        this.eventStartDateTime = p_eventStartDateTime;
        this.eventEndDateTime = p_eventEndDateTime;
        this.eventQuestions = p_eventQuestions;
        this.tenantID = p_tenantID;
    }
}

export class LiveEventRegistrant {
    // displayName field is used to transmit errors when registration/invitation/assignment fails:
    // 'ACCESS_DENIED' => SecurityKey rejected or invalid session/userid
    // 'ALREADY_REGISTERED' => user is already registered/invited/assigned to this session
    // 'SESSION_RESTRICTED' => user not on session whitelist
    // 'SESSION_FULL_NO_WAITLIST' => no space in session, no waitlist
    // 'SESSION_FULL_BUT_WAITLIST' => no space in session, user can be placed on waitlist
    // 'ALREADY_ON_WAITLIST' => no space in session, user is on waitlist and will be added when possible
    // 'PREREQUISITES_NOT_MET' => user has not completed all prerequisites of the session's live event
    displayName: string = "";
    userID: string = ""; // Guid
    userEmail: string = "";
    userTenant: string = ""; // Guid
    sessionID: string = ""; // Guid
    registrationComplete: boolean = false;
    registrationType: LiveEventRegistrationType;
    registrationStatus: LiveEventRegistrationType;
    attendedSession: boolean = false;
    surveyComplete: boolean = false;
    prerequisitesMet: boolean = false;
    properties: Array<LiveEventProperty> = [];
    registeredDate: Date = new Date();
    }