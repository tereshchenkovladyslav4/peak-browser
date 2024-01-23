import { Injectable } from '@angular/core';
import { ProdGenApi } from './prodgen.api';
import { HttpClient, HttpHeaders, HttpResponseBase } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ZendeskSupportResponse,GetUserAssociatedLearningResponse, GetGroupResponse, GetGroupAssociatedLearningUserProgressResponse } from './classFiles/v2-groups';
import { GetUserResponse, User_Mini } from './classFiles/v2-users';
import { GetExpertiseResponse, ModifyUserExpertiseResponse, ModifyUserExpertiseRequest, GetKnowledgeSmartResponse, GetAllAssessmentsResponse, GetAssignmentResultsForUserResponse, GetAssignmentsInProgressForUserResponse, GetAssignmentsNotStartedForUserResponse, GetContentFromAssessmentResponse, KSUser, GetAssessmentsFromContentResponse, AssignAssessmentRequest, AssignAssessmentResponse, TermsAndConditionsAcceptedKSResponse, KS_UI_Options, GetAllTenantSettingsResponse } from './classFiles/v2-organizations'
//import { Guid } from '../templates/widget-container/widget-container.component';
import { EL_Record, EL_Attribute, GetAllAttributesResponse, EL_Activity, EL_RecordCandidate, EL_CreateLearningRecordsRequest, EL_AttributeDataType, EL_RecordStatus } from './classFiles/v2-externallearning';
import { map } from 'rxjs/operators';
import { TempFileResult } from './classFiles/v2-temp-file';
import { AuthorizationInfo } from './classFiles/v2-authorizationInfo';
import {CONSTANTS} from "../../config/constants";
import { environment } from 'src/environments/environment';


@Injectable()
export class Apiv2Service {
  private m_BaseURL: string = environment.apiUrlV2;

  constructor(private http: HttpClient) {

    }

    getv2AuthHeaders(): HttpHeaders {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' })
            .append("apiKey", "9D391065-2ABE-4681-9EA3-A78557A42A13")
            .append("Authorization", ProdGenApi.getAPIV2AccessKey().bearerToken);

        return headers;
    }

    getZendeskRedirectURL(): Observable<ZendeskSupportResponse> {
        let headers = this.getv2AuthHeaders();
        let v_Result = this.http.get<ZendeskSupportResponse>(`${this.m_BaseURL}/support/zendesk`, { headers: headers });

        return v_Result;

    }

    getAssociatedLearning(userId: string): Observable<GetUserAssociatedLearningResponse> {
        let headers = this.getv2AuthHeaders();
        let v_Result = this.http.get<GetUserAssociatedLearningResponse>(`${this.m_BaseURL}/users/${userId}/associatedLearning`, { headers: headers });

        return v_Result;

    }

  public getTenants(email: string): Observable<AuthorizationInfo> {
    const headers = this.getv2AuthHeaders();
    return this.http.get<AuthorizationInfo>(`${this.m_BaseURL}/authorization/authinfo`,
      { headers, params: { email } });
  }

    getV2User(userId: string, resultType: string): Observable<GetUserResponse> {
        let headers = this.getv2AuthHeaders();
        let v_Result = this.http.get<GetUserResponse>(`${this.m_BaseURL}/users/${userId}?resultType=${resultType}`, { headers: headers });

        return v_Result;

    }

    getV2Group(groupId: string, resultType: string): Observable<GetGroupResponse> {
        let headers = this.getv2AuthHeaders();
        let v_Result = this.http.get<GetGroupResponse>(`${this.m_BaseURL}/groups/${groupId}?resultType=${resultType}`, { headers: headers });

        return v_Result;
    }

    getTenantAreasOfExpertise(): Observable<GetExpertiseResponse> {
        let headers = this.getv2AuthHeaders();
        let tenantId = ProdGenApi.getAPIV2AccessKey().tenantid;
        let orgId = ProdGenApi.getAPIV2AccessKey().orgID;
        let v_Result = this.http.get<GetExpertiseResponse>(`${this.m_BaseURL}/organizations/${orgId}/tenant/${tenantId}/expertise`, { headers: headers });

        return v_Result;
    }

    modifyUserAreasOfExpertise(removeIds:string [], addIds:string[]): Observable<ModifyUserExpertiseResponse> {
        let headers = this.getv2AuthHeaders();
        let userId = ProdGenApi.getAPIV2AccessKey().userId;

        let body = new ModifyUserExpertiseRequest();
        body.expertiseIdsToAdd = addIds;
        body.expertiseIdsToRemove = removeIds;

        let v_Result = this.http.put<ModifyUserExpertiseResponse>(`${this.m_BaseURL}/users/${userId}/expertise`,body, { headers: headers });

        return v_Result;
    }


    getTermsAndConditionsAcceptedKS(email: string): Observable<TermsAndConditionsAcceptedKSResponse>{

        let headers = this.getv2AuthHeaders();
        let v_Result = this.http.get<TermsAndConditionsAcceptedKSResponse>(`${this.m_BaseURL}/users/termsandconditionsacceptedks?email=${email}`, { headers: headers });;
        return v_Result;
    }

    getV2GroupAssociatedLearningUserProgress(groupId: string, userId: string): Observable<GetGroupAssociatedLearningUserProgressResponse> {
        let headers = this.getv2AuthHeaders();
        let v_Result = this.http.get<GetGroupAssociatedLearningUserProgressResponse>(`${this.m_BaseURL}/associatedlearning/groups/${groupId}/progress/${userId}`, { headers: headers });

        return v_Result;

    }

    getAllTenantSettings(): Observable<GetAllTenantSettingsResponse> {
      let tenantId = ProdGenApi.getAPIV2AccessKey().tenantid;
      let orgId = ProdGenApi.getAPIV2AccessKey().orgID;
      const url = `${this.m_BaseURL}/organizations/${orgId}/tenant/${tenantId}/settings`;
      const headers = this.getv2AuthHeaders();

    return this.http.get<GetAllTenantSettingsResponse>(url, { headers: headers });
    }

    getGlobalSetting(settingName: string): Observable<{ name: string, stringValue: string, intValue: number, doubleValue: number }> {
        const url = `${this.m_BaseURL}/global/settings/${settingName}`;
        const headers = this.getv2AuthHeaders();

        return this.http.get<{ name: string, stringValue: string, intValue: number, doubleValue: number }>(url, { headers: headers });
    }
    getKSIntegrationConfigInfo(): Observable<GetKnowledgeSmartResponse> {
        let headers = this.getv2AuthHeaders();
        let tenantId = ProdGenApi.getAPIV2AccessKey().tenantid;
        let orgId = ProdGenApi.getAPIV2AccessKey().orgID;

        let v_Result = this.http.get<GetKnowledgeSmartResponse>(`${this.m_BaseURL}/organizations/${orgId}/tenant/${tenantId}/integrations/knowledgesmart`, { headers: headers });
        return v_Result;
    }

    getKSIntegrationUIOptions(): Observable<KS_UI_Options> {
        let headers = this.getv2AuthHeaders();
        let tenantId = ProdGenApi.getAPIV2AccessKey().tenantid;
        let orgId = ProdGenApi.getAPIV2AccessKey().orgID;

        return this.http.get<KS_UI_Options>(`${this.m_BaseURL}/organizations/${orgId}/tenant/${tenantId}/integrations/knowledgesmart/uioptions`, { headers: headers });
    }


    getKSAssessments(): Observable<GetAllAssessmentsResponse> {
        let headers = this.getv2AuthHeaders();
        let v_Result = this.http.get<GetAllAssessmentsResponse>(`${this.m_BaseURL}/assessments`, { headers: headers });
        return v_Result;
    }

    getKSResultsForUser(): Observable<GetAssignmentResultsForUserResponse> {
        let headers = this.getv2AuthHeaders();
        let v_Result = this.http.get<GetAssignmentResultsForUserResponse>(`${this.m_BaseURL}/assessments/resultsForUser`, { headers: headers });
        return v_Result;
    }

    getAssessmentsInProgressForUser(): Observable<GetAssignmentsInProgressForUserResponse> {
        let headers = this.getv2AuthHeaders();
        let v_Result = this.http.get<GetAssignmentsInProgressForUserResponse>(`${this.m_BaseURL}/assessments/assignmentsInProgressForUser`, { headers: headers });
        return v_Result;
    }
    getAssessmentsNotStartedForUser(): Observable<GetAssignmentsNotStartedForUserResponse> {
        let headers = this.getv2AuthHeaders();
        let v_Result = this.http.get<GetAssignmentsNotStartedForUserResponse>(`${this.m_BaseURL}/assessments/assignmentsNotStartedForUser`, { headers: headers });
        return v_Result;
    }

    getContentFromAssessment(assessmentId: number, assignmentId: number): Observable<GetContentFromAssessmentResponse> {
        let headers = this.getv2AuthHeaders();
        let v_Result = this.http.get<GetContentFromAssessmentResponse>(`${this.m_BaseURL}/assessments/getContentFromAssessment?assessmentId=${assessmentId}&assignmentId=${assignmentId}`, { headers: headers });
        return v_Result;
    }


    // Get a KS User from an email address
    //It will be null if it doesn't exist
    getAssessmentUserFromEmail(email: string): Observable<KSUser> {


        let headers = this.getv2AuthHeaders();
        let v_Result = this.http.get<KSUser>(`${this.m_BaseURL}/assessments/assessmentUserFromEmail?email=${email}`, { headers: headers });
        return v_Result;
    }

    //using the UserID from the 'getAssessmentUserFromEmail'
    //get a loginToken for SSO
    //INFORMATION FOR THE URL THIS IS USED IN:
            // 1.Use / Users / RequestLoginToken
            // 2.PS SecretKey is 505CA6CAAF644645A6FD2FF63EB9020F440651A702CC2B72DD4D1B8F16E373F32CF09B(can be easily changed!)
            // 3.Use the returned LoginToken to build a URL with the new trafficcop.aspx page � it�s valid for 10 mins
            // 4.E.g.https://online.knowledgesmart.net/trafficcop.aspx?userid=fc9ed007-af04-4e40-917d-3276844b8b93&logintoken=7d97ed66-a480-4e5a-bc78-f4d79a37c704&destination=userarea
            // 5.userID and logintoken you already have


            // 6.destination string can be one of the following:
            // userarea � for a non-admin user to access their assessments page in the user area
            // userlist � for an admin user to access the userlist page
            // auto � for an admin user to go to their default landing page(according to their admin type)
            // testreport. Same process as steps 1-6 above, slight difference in that you also need to include the resultID of the result you would like to view in the querystring, like this:
            //            e.g.https://online.knowledgesmart.net/trafficcop.aspx?userid=8B7AD52C-439C-42EA-88E7-D07AF60FF174&logintoken=5db1a9f2-7377-4611-b8a7-77687effd3ed&destination=testreport&resultID=157996
            //This allows the user to view a testreport, the task: KS Task:  Allow access into �Report summary for xxx� page from PS:
    requestLoginToken(ksUserId: string): Observable<string> {
        const secretKey = "505CA6CAAF644645A6FD2FF63EB9020F440651A702CC2B72DD4D1B8F16E373F32CF09B";

        let headers = this.getv2AuthHeaders();
        let v_Result = this.http.get<string>(`${this.m_BaseURL}/assessments/requestLoginToken?AssessmentUserID=${ksUserId}&SecretKey=${secretKey}`, { headers: headers });;
        return v_Result;
    }



    getAssessmentsFromContent(contentId: string): Observable<GetAssessmentsFromContentResponse> {
        let headers = this.getv2AuthHeaders();
        let v_Result = this.http.get<GetAssessmentsFromContentResponse>(`${this.m_BaseURL}/assessments/getAssessmentsFromContent?contentId=${contentId}`, { headers: headers });
        return v_Result;
    }

    assignAssessment(assignRequest: AssignAssessmentRequest): Observable<AssignAssessmentResponse> {
        let headers = this.getv2AuthHeaders();
        let v_body = JSON.stringify(assignRequest);
        let v_Result = this.http.post<AssignAssessmentResponse>(`${this.m_BaseURL}/assessments/assignAssessment`,v_body, { headers: headers });
        return v_Result;
    }


    getExternalLearningUserRecords(userId: string): Observable<EL_Record[]> {
        let headers = this.getv2AuthHeaders();
        let v_Result = this.http.get<EL_Record[]>(`${this.m_BaseURL}/externallearning/Records/${userId}`, { headers: headers });
        return v_Result;
    }

    getExternalLearningSelectableAssignors(): Observable<User_Mini[]> {
        let headers = this.getv2AuthHeaders();
        let v_Result = this.http.get<User_Mini[]>(`${this.m_BaseURL}/externallearning/Records/selectableassignors`, { headers: headers });
        return v_Result;
    }


    getExternalLearningAttributes(): Observable<Array<EL_Attribute>> {
        let headers = this.getv2AuthHeaders();
        let v_Result = this.http.get<GetAllAttributesResponse>(`${this.m_BaseURL}/externallearning/Attributes`, { headers: headers }).pipe(map(x => x.attributes));
        return v_Result;
    }

    getAllExternalLearningActivities(): Observable<EL_Activity[]> {
        const headers = this.getv2AuthHeaders();
        return this.http.get<{ activities: EL_Activity[] }>(`${this.m_BaseURL}/externallearning/activities`, { headers }).pipe(
            map(res => res.activities.map(a => {
                const act = new EL_Activity();
                act.activityId = a.activityId;
                act.isActive = a.isActive;
                act.attributes = a.attributes;
                return act;
            }))
        );
    }

    uploadFiles(files: FileList): Observable<TempFileResult[]> {
        const getHeaders = function (): {Authorization: any} {
            const token = ProdGenApi.getAPIV2AccessKey().bearerToken;

            // This request should use the
            // 'Content-Type': 'multipart/form-data'
            // header since it contains multiple files, but
            // if we set it ourselves, the request isn't partitioned
            // correctly and ASP.NET/WebAPI won't register that
            // files are attached to the request.
            // If we leave it undefined, the browser does the
            // work of correctly partitioning the request for us.
            return { Authorization: token };
        }

        const url = `${this.m_BaseURL}/storage/temp/upload`;
        const headers = getHeaders();

        const body = new FormData();
        for (let i = 0; i < files.length; i++) {
            body.append(files.item(i).name, files.item(i));
        }

        return this.http
            .put<{ results: TempFileResult[] }>(url, body, { headers: headers })
            .pipe(map(response => response.results));
    }

    public CreateLearningRecords(records: Array<EL_Record>, tempFile: TempFileResult = null, status: EL_RecordStatus = EL_RecordStatus.Pending, OverrideIsRequiredInValidation: boolean = false, assignorList: Array<User_Mini> = null): Observable<HttpResponseBase> {
        //convert records to RecordCanidates
        let candidates: Array<EL_RecordCandidate> = new Array<EL_RecordCandidate>();

        records.forEach(record => {
            let candidate = new EL_RecordCandidate();
            record.attributes.forEach(attr => {
                switch (attr.attribute.attributeDataType) {
                    case EL_AttributeDataType.Text:
                    case EL_AttributeDataType.LongFormText:
                    case EL_AttributeDataType.YesNo:
                    case EL_AttributeDataType.SelectionSet:
                        candidate.attributes[attr.attribute.attributeId] = attr.attributeStringValue
                        break;
                    case EL_AttributeDataType.Date:
                        let dateValue: Date = attr.attributeDateValue;
                        let dateString: string;
                        if (dateValue) {
                            dateString = dateValue.toString();
                        }
                        else {
                            dateString = null
                        }
                        candidate.attributes[attr.attribute.attributeId] = dateString;
                        break;
                    case EL_AttributeDataType.Minutes:
                    case EL_AttributeDataType.Number:
                    case EL_AttributeDataType.OneToFiveRating:
                    case EL_AttributeDataType.Percentage:
                        let percentageValue: number = attr.attributeIntValue;
                        let percentageString: string;
                        if (percentageValue || percentageValue == 0) {
                            percentageString = percentageValue.toString();
                        }
                        else {
                            percentageString = null
                        }
                        candidate.attributes[attr.attribute.attributeId] = percentageString;
                        break;
                    case EL_AttributeDataType.Decimal:
                        let floatValue: number = attr.attributeFloatValue;
                        let floatString: string;
                        if (floatValue || floatValue == 0) {
                            floatString = floatValue.toString();
                        }
                        else {
                            floatString = null
                        }
                        candidate.attributes[attr.attribute.attributeId] = floatString;
                        break;
                }
            });

            candidates.push(candidate);
        });

        return this.CreateRecords(candidates, tempFile, status, OverrideIsRequiredInValidation, assignorList);
    }

    public CreateRecords(records: Array<EL_RecordCandidate>, tempFile: TempFileResult = null, status: EL_RecordStatus = EL_RecordStatus.Pending, OverrideIsRequiredInValidation: boolean = false, assignorList: Array<User_Mini> = null): Observable<HttpResponseBase> {
        const headers = this.getv2AuthHeaders();
        const url = `${this.m_BaseURL}/externallearning/Records`;

        let request = new EL_CreateLearningRecordsRequest();
        request.newRecords = records;
        request.recordStatus = status;
        request.overrideIsRequiredInValidation = OverrideIsRequiredInValidation;
        request.tempFile = tempFile || new TempFileResult();
        request.assignorList = assignorList || new Array<User_Mini>();

        return this.http.post<HttpResponseBase>(url, request, { headers: headers });
    }

}
