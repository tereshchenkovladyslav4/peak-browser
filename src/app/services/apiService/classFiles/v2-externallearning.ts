import { User_Micro, User_Mini } from "./v2-users";
import { TempFileResult } from './v2-temp-file';

export const GuidEmpty: string = '00000000-0000-0000-0000-000000000000';


//ORDER OF THESE LIST ARE IMPORTANT!!! Check all references if ever changed.
export enum EL_AttributeDataType {
    Text = 0,
    Number = 1,
    Date = 2,
    Percentage = 3,
    OneToFiveRating = 4,
    LongFormText = 5,
    Minutes = 6,
    YesNo = 7,
    SelectionSet = 8,
    Decimal = 9,
}

//ORDER OF THESE LIST ARE IMPORTANT!!! Check all references if ever changed.
export const YesNoSelectionList: Array<string> = ['No Selection', 'Yes', 'No'];
export const RequiredYesNoSelectionList: Array<string> = ['Yes', 'No'];


export class EL_Attribute {
    public attributeId: string = "";
    public attributeName: string = "";
    public attributeDataType: EL_AttributeDataType = EL_AttributeDataType.Text;
    public isRequired: boolean = false;
    public isActivityDefinition: boolean = false;
    public isRequiredByPinnacle: boolean = false;
    public sequenceNumber: number = 0;
    public selectionSet: Array<string> = new Array<string>();

    constructor(attribute?: EL_Attribute) {
        if (attribute != null) {
            this.attributeId = attribute.attributeId;
            this.attributeName = attribute.attributeName;
            this.attributeDataType = attribute.attributeDataType;
            this.isRequired = attribute.isRequired;
            this.isActivityDefinition = attribute.isActivityDefinition;
            this.isRequiredByPinnacle = attribute.isRequiredByPinnacle;
            this.sequenceNumber = attribute.sequenceNumber = 0;
            this.selectionSet = attribute.selectionSet;
        }
    }
}

export class GetAllAttributesResponse {
    public attributes: Array<EL_Attribute> = new Array<EL_Attribute>();

}

export class EL_ActivityAttribute {

    constructor(attribute: EL_Attribute) {
        this.attribute = new EL_Attribute(attribute);
    }

    public readonly attribute: EL_Attribute;
    public attributeStringValue: string | null = null;
    public attributeIntValue: number | null = null;
    public attributeGuidValue: string = GuidEmpty;
    public attributeBitValue: boolean | null = null;
    public attributeDateValue: Date | null = null;
    public attributeFloatValue: number | null = null;
    
}


export class EL_Record {
    public recordId: string = "";
    public status: EL_RecordStatus = EL_RecordStatus.Pending;
    public statusDate: Date = new Date();
    public statusUser: User_Micro = new User_Micro();
    public recordUser: User_Micro = new User_Micro();
    public fileUrl: string = "";
    public attributes: Array<EL_ActivityAttribute> = new Array<EL_ActivityAttribute>();
    public activityId: string = GuidEmpty;
    public fileUploadDate: Date = null;
    public statusDeniedReason: string = "";
}


export enum EL_RecordStatus {
    Pending = 0,
    Denied = 1,
    Approved = 2,
}

export enum EL_RecordCreateType {
    Manual = 0,
}

export class EL_Activity {
    public isActive: boolean = false;
    public activityId: string = "00000000-0000-0000-0000-000000000000";
    public attributes: EL_ActivityAttribute[] = [];

    public get trainingTitle(): string {
        if (!this.attributes) return '';
        const attribute = this.attributes.find(a => a.attribute.attributeName === 'Training Title');
        if (!attribute) return '';
        return attribute.attributeStringValue;
    }
}

export class EL_RecordCandidate {
    public attributes: { [key: string]: string } = {};
}

export class EL_CreateLearningRecordsRequest {
    public newRecords: Array<EL_RecordCandidate> = new Array<EL_RecordCandidate>();

    //Default to pending.
    public recordStatus: EL_RecordStatus = EL_RecordStatus.Pending;

    public tempFile: TempFileResult = new TempFileResult();

    public overrideIsRequiredInValidation: boolean = false;
    public assignorList: Array<User_Mini> = new Array <User_Mini>();
}
