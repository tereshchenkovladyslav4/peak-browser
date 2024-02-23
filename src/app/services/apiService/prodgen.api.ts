import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { APICacheService, CacheLocation, CacheOptions } from "./../../services/api-cache.service";

// CR - Add these lines back in if needed when these areas are added into the project
//import { WorkgroupAssetUsageData } from '../templates/widgets/workgroup-asset-usage-widget/workgroup-asset-usage-widget.component';
//import { WorkgroupLearningUsageData, WorkgroupLearningUsageData2, WorkgroupLearningUsageData3 } from '../templates/widgets/workgroup-course-completion-widget/workgroup-course-completion-widget.component';
//import { HierarchyContent } from '../templates/workflowtree/workflowtree.component';

import { AssetLibrary, AssetLibraryContentSummary, AssetLibraryProductVersion } from './classFiles/class.assetlibrary';
import { APIV2AccessKey, AuthorizationBody, FullAuthToken, Language, MarkPolicyAccepted, PasswordPolicies, Policy, PolicyAcceptBody, PWResetRequest, SecurityKey, SSO_Override, UserOrgInfoObject, UserToken } from './classFiles/class.authorization';
import { Category, CategoryFilter_T, CategoryOrderBy_T } from './classFiles/class.categories';
import { ChatMessage, ChatSession, ChatSettings, ChatStatus_T, SavedChatPost, SupportEmail } from './classFiles/class.chat';
import { Bookmark, ChatLog, CheatSheet, ClassContentItem, Comment, Content, ContentAuthoring, ContentPrerequisite, ContentPrerequisiteInfo, ContentProduct, ContentType_T, Course, DescriptionFilter_T, DiagramView, LearningPath, Process, Quiz, QuizAnswer, QuizQuestion, Step, Task, Tool, Video, WebVideoTextTracksCue, Workflow } from './classFiles/class.content';
import { AssignTrainingForAssessmentCompletionRequest, BulkNotEnrolled, ClassRegistrant, ClassRegistrantPost, ClassSession, CreateEnrollmentFromAssessmentRequest, CurrentEnrollment, Enrollment, EnrollmentFilter_T, EnrollmentInBulk, EnrollmentPost, EnrollmentQuizTrackingItemPost, EnrollmentTrackingItem, EnrollmentTrackingItemPost, EnrollmentVideoTrackingItemPost } from './classFiles/class.enrollments';
import { LiveEventProperty, LiveEventPropertyType, LiveEventRegistrant, LiveEventSurvey, LiveEventWrapper } from './classFiles/class.liveevents';
import { Notification, NotificationFilter_T, NotificationPost } from './classFiles/class.notifications';
import { CompanyNewsItem, Organization, PinnacleLiteSettings, Setting, Tenant, Theme } from './classFiles/class.organizations';
import { AccountPost, Partner, PartnerNewsItem, PartnerSupport, Subscription, SubscriptionPost, TenantPost, TenantPut, TenantSubscription, UpgradeOrderRequestPost } from './classFiles/class.partners';
import { TopSearchTermsData, UniqueUsersReportData } from './classFiles/class.reports';
import { ScormModel } from './classFiles/class.scorm';
import { SearchConnector, SearchFacet, SearchResults } from './classFiles/class.search';
import { BlobSecureAccessSignatureTree } from './classFiles/class.storage';
import { ExternalUserData, ExternalUserPost, ExternalUserPut, PermissionUser, PinnacleLiteUser, Playlist, PlaylistContent, Role, RoleLayoutAssignment, SettingType_T, User, UserHistoryPost, UserMultiSelect, UserPasswordPost, UserPermissions, UserPut, UserSettingPost, UserSettingPut, WidgetContainerBasicInfo, WidgetContainerInfo, WidgetLayoutInfo, WidgetLayoutPage, WidgetProperties } from './classFiles/class.users';
import { IndexType_T, PermissionLevel_T, WorkgroupShareContent, Workgroup, WorkgroupContentIndex, WorkgroupContentPost, WorkgroupExternalGroup, WorkgroupExternalGroupAndMemberPost, WorkgroupExternalGroupPost, WorkgroupExternalMemberPost, WorkgroupExternalMemberPut, WorkgroupExternalMembers, WorkgroupExternalSummary, WorkgroupListByPermission, WorkgroupMember, WorkgroupMemberPost, WorkgroupMemberPut, WorkgroupPost, WorkgroupPut, WorkgroupRole, WorkgroupRolePost, WorkgroupRolePut, WorkgroupExternalInviteAcceptance } from './classFiles/class.workgroups';
import { CONSTANTS } from "../../config/constants";
import { HierarchyContent } from 'src/app/resources/models/content';
import { QuizSession, GetEnrollmentQuizTrackingItemResponse, VideoTrackingItem } from 'src/app/resources/models/content/quiz';
import { environment } from 'src/environments/environment';


@Injectable({
    providedIn: 'root',
})
export class ProdGenApi {


    private m_BaseURL: String = environment.apiUrlV1;
    public static EMPTY_GUID = "00000000-0000-0000-0000-000000000000";
    private static userAccessKey: string = "";
    private static apiV2AccessKey: APIV2AccessKey = new APIV2AccessKey();
    private static APIKey: string = "";
    private static languageCode = "en";
    public static currentUser: User = null;
    private static currentTenantId: string = null;
    private static sessionUniqueImage: number = 0;
    public static isPinnacleLite = false;
    public static hasReadPinnacleLiteSettings = false;
    private static isExternal: boolean = false;
    //private static thisFromOutside: ProdGenApi = null;

    private static lastCacheCheck: Date = new Date(Date.now());
    private static cacheInvalidationTimer: NodeJS.Timer = null;

    private debugAPILogging: boolean = false;

    //Used for calls prior to user login, but need protected
    private static specialAccessKey: string = "427FF288-7B01-4307-84E2-889661C78C31"



    private data: Object = new Object();

    constructor(private http: HttpClient, private apiCache: APICacheService) {
        //ProdGenApi.thisFromOutside = this;
        ProdGenApi.lastCacheCheck.setMinutes(ProdGenApi.lastCacheCheck.getMinutes() - 60);//set the default date back 1 hr
        ProdGenApi.userAccessKey = sessionStorage.getItem("userAccessKey");
        ProdGenApi.apiV2AccessKey = JSON.parse(sessionStorage.getItem("apiV2AccessKey"));
        ProdGenApi.APIKey = sessionStorage.getItem("APIKey");

        if (!ProdGenApi.userAccessKey)
            ProdGenApi.userAccessKey = "";

        if (!ProdGenApi.apiV2AccessKey)
            ProdGenApi.apiV2AccessKey = new APIV2AccessKey();

        if (!ProdGenApi.APIKey)
            ProdGenApi.APIKey = "";

        //if (ProdGenApi.cacheInvalidationTimer == null) {
        //    ProdGenApi.cacheInvalidationTimer = setInterval(() => this.onGetCacheInvalidationsTimer(), 5 * 60 * 1000); // 5 min live interval
        //    this.onGetCacheInvalidationsTimer();
        //}

    }

    invlidateCacheStringContaining(cache: string) {
        this.apiCache.invalidateContaining(cache);
    }

    invlidateCacheAll() {
        this.apiCache.invalidateContaining(this.m_BaseURL as string);
    }

    onGetCacheInvalidationsTimer() {
        if (ProdGenApi.userAccessKey != null && ProdGenApi.userAccessKey.length > 0) {

            let newCacheTime = new Date(Date.now());


            this.getBrowserCacheInvalidationStrings(ProdGenApi.lastCacheCheck).subscribe(res => {
                if (res.length > 0) {
                    ProdGenApi.lastCacheCheck = newCacheTime;
                }
                for (let r of res) {
                    this.apiCache.invalidateContaining(r);
                }
            }
            );

        }
        else {
        }

    }

    static getSessionUnique(): number {
        if (ProdGenApi.sessionUniqueImage == 0) {
            ProdGenApi.sessionUniqueImage = Date.now();
        }

        return ProdGenApi.sessionUniqueImage;
    }

    getAuthHeaders(): HttpHeaders {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' })
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", ProdGenApi.userAccessKey);


        return headers;
    }

    getSpecialAccessHeaders(): HttpHeaders {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' })
            .append("specialAccessKey", ProdGenApi.specialAccessKey)
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", ProdGenApi.userAccessKey);

        return headers;
    }


    static GetUserIsExternal(): boolean {
        this.isExternal = JSON.parse(sessionStorage.getItem("externalTenant"));
        if (this.isExternal == null) {
            this.isExternal = false;
        }
        return this.isExternal;
    }

    //***************************authentication************************//
    static setIsImpersonating(value: boolean): void {
        sessionStorage.setItem('isImpersonating', value ? 'true' : 'false');
    }

    static isImpersonating(): boolean {
        const stored = sessionStorage.getItem('isImpersonating');
        return stored == 'true';
    }

    static setUserAccessKey(key: string): void {
        this.userAccessKey = key;
        sessionStorage.setItem("userAccessKey", key);
    }

    static setAPIV2BearerToken(key: APIV2AccessKey): void {
        this.apiV2AccessKey = key;
        sessionStorage.setItem("apiV2AccessKey", JSON.stringify(key));
    }

    static setAPIKey(key: string): void {
        this.APIKey = key;
        sessionStorage.setItem("APIKey", key);
    }

    static getAPIKey(): string {
        return this.APIKey;
    }

    static getUserAccessKey(): string {
        return this.userAccessKey;
    }

    static getAPIV2AccessKey(): APIV2AccessKey {
        return this.apiV2AccessKey;
    }

    static setCurrentTenantId(tenantId: string): void {
        this.currentTenantId = tenantId;
        APICacheService.putTenant(tenantId);
    }

    static getCurrentTenantId(): string {
        if (this.currentTenantId == null) {
            if (ProdGenApi.getSessionTenant() != null) {
                ProdGenApi.setCurrentTenantId(ProdGenApi.getSessionTenant() as string);
                return ProdGenApi.getSessionTenant() as string;
            }
        }
        return this.currentTenantId;
    }

    static setUserIsExternal(value: boolean): void {
        this.isExternal = value;
        sessionStorage.setItem("externalTenant", JSON.stringify(value));
    }

    //****************local storage stuff **********************//
    // this works faster that making a call on each page to get these
    static setSessionUser(user: User): void {
        sessionStorage.setItem("currentUser", JSON.stringify(user));
    }

    static setSessionTenant(tenant: Tenant): void {
        sessionStorage.setItem("currentTenant", JSON.stringify(tenant.tenantId.toString()));
    }

    static setSessionOrganization(org: Organization): void {
        sessionStorage.setItem("currentOrg", JSON.stringify(org));
    }


    static getSessionUser(): User {
        return JSON.parse(sessionStorage.getItem("currentUser"));
    }

    static getSessionTenant(): string {
        return sessionStorage.getItem("currentTenant");
    }

    static getSessionOrganization(): Organization {
        return JSON.parse(sessionStorage.getItem("currentOrg"));
    }

    getLanguages(): Observable<Array<Language>> {
        let v_Headers = this.getAuthHeaders();


        let v_Collection = this.http.get<Array<Language>>(`${this.m_BaseURL}authorization/translateLanguages`, { headers: v_Headers });

        this.debugLog();
        return v_Collection;
    }

    setCurrentLanguage(languageCode: string) {
        sessionStorage.setItem("currentLanguageCode", languageCode);
    }

    getCurrentLanguage(): string {
        let languageCode = ProdGenApi.languageCode;

        languageCode = sessionStorage.getItem("currentLanguageCode");
        if (languageCode == null || languageCode.length == 0) {
            languageCode = ProdGenApi.languageCode;
        }
        return languageCode;
    }

    sendForgotPassword(email: string): Observable<boolean> {
        let v_Result = this.http.get<boolean>(`${this.m_BaseURL}authorization/forgotPassword?email=${email}`);

        this.debugLog();
        return v_Result;
    }

    getPasswordPoliciesForUser(email: string, tenantid: string): Observable<PasswordPolicies> {
        let v_Headers = new HttpHeaders({ 'Content-Type': 'application/json' })
            .append("apiKey", ProdGenApi.APIKey);

        let v_Result = this.http.get<PasswordPolicies>(`${this.m_BaseURL}authorization/passwordPolicies/?email=${email}&tenantid=${tenantid}`, { headers: v_Headers });

        return v_Result;
    }

    getPoliciesForUser(email: string, tenantid: string): Observable<Array<Policy>> {
        let v_Headers = new HttpHeaders({ 'Content-Type': 'application/json' })
            .append("apiKey", ProdGenApi.APIKey);

        let v_Result = this.http.get<Array<Policy>>(`${this.m_BaseURL}authorization/policies/?email=${email}&tenantid=${tenantid}`, { headers: v_Headers });

        this.debugLog();
        return v_Result;
    }

    getHasPartnerSSO_Override(email: string): Observable<SSO_Override> {
        let v_Headers = new HttpHeaders({ 'Content-Type': 'application/json' });

        let v_Result = this.http.get<SSO_Override>(`${this.m_BaseURL}authorization/isPartnerOverride?email=${email}`, { headers: v_Headers });

        this.debugLog();
        return v_Result;
    }

    acceptPolicyForUser(email: string, tenantid: string, policyid: string): Observable<boolean> {
        let v_Headers = new HttpHeaders({ 'Content-Type': 'application/json' })
            .append("apiKey", ProdGenApi.APIKey);

        let v_Url = `${this.m_BaseURL}authorization/policies/`;

        let v_policy = new PolicyAcceptBody();
        v_policy.email = email;
        v_policy.policyID = policyid;
        v_policy.tenantID = tenantid;

        let v_Body: string = JSON.stringify(v_policy);

        let v_Result = this.http.post<boolean>(v_Url, v_Body, { headers: v_Headers });

        this.debugLog();
        return v_Result;
    }


    markPolicyAcceptedForUser(email: string, tenantid: string, policyid: string, timestamp: string): Observable<boolean> {
        let v_Headers = new HttpHeaders({ 'Content-Type': 'application/json' })
            .append("apiKey", ProdGenApi.APIKey);

        let v_Url = `${this.m_BaseURL}authorization/policiestimestamp/`;

        let v_policy = new MarkPolicyAccepted();
        v_policy.email = email;
        v_policy.policyID = policyid;
        v_policy.tenantID = tenantid;
        v_policy.timestamp = timestamp;

        let v_Body: string = JSON.stringify(v_policy);

        let v_Result = this.http.post<boolean>(v_Url, v_Body, { headers: v_Headers });

        this.debugLog();
        return v_Result;
    }

    sendSupportEmail(supportemail: SupportEmail): Observable<string> {
        //saveCurrentUserSetting(settingName: string, value: any, valueType: SettingType_T) {
        //  let v_Headers = this.getAuthHeaders();
        //  let put = new UserSettingPut();
        //  put.settingName = settingName;
        //  put.settingType = valueType;
        //  put.settingValue = value;

        //  let v_Url = `${this.m_BaseURL}users/current/settings/`;

        //  let v_Body = JSON.stringify(put);
        //  let v_ContentItem = this.http.put(v_Url, v_Body, { headers: v_Headers });
        //  return v_ContentItem;
        //}
        let v_Headers = this.getAuthHeaders();
        let v_Body = JSON.stringify(supportemail);
        let v_Result = this.http.post<string>(`${this.m_BaseURL}chat/sendSupportEmail`, v_Body, { headers: v_Headers });

        this.debugLog();
        return v_Result;
    }

    isChatAvailible(): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();
        let v_Result = this.http.get<boolean>(`${this.m_BaseURL}chat/isLiveSupportAvailable`, { headers: v_Headers });

        this.debugLog();
        return v_Result;
    }

    isWithinPartnerSupportHours(sPartnerID: string): Observable<string> {
        let v_Headers = this.getAuthHeaders();
        let v_Result = this.http.get<string>(`${this.m_BaseURL}chat/isWithinPartnerSupportHours?sPartnerID=${sPartnerID}`, { headers: v_Headers });

        this.debugLog();
        return v_Result;
    }

    getEmailLanguagePreference(email: string, tenantid: string): Observable<string> {
        // console.log(ProdGenApi.APIKey);
        let v_Headers = this.getAuthHeaders();
        let v_Result = this.http.get<string>(`${this.m_BaseURL}authorization/languagePreference?email=${email}&tenantid=${tenantid}`, { headers: v_Headers });

        this.debugLog();
        return v_Result;
    }

    //****************************JOB ROLES ***************************//
    getJobRoles(p_Limit: number = -1, p_Offset: number = 0): Observable<Array<Role>> {
        let v_Headers = this.getAuthHeaders();


        let v_Collection = this.http.get<Array<Role>>(`${this.m_BaseURL}roles/`, { headers: v_Headers });

        this.debugLog();
        return v_Collection;
    }

    getJobRole(p_RoleID: String): Observable<User> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}roles/${p_RoleID}`;
        let v_User = this.http.get<User>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_User;
    }

    saveLayoutAssignments(p_LayoutAssignments: Array<RoleLayoutAssignment>): Observable<boolean> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}roles/layouts`;
        let v_Body = JSON.stringify(p_LayoutAssignments);

        let v_res = this.http.post<boolean>(v_url, v_Body, { headers: v_headers });
        this.apiCache.invalidateContaining("roles/layouts");
        this.apiCache.invalidateContaining("users/uiLayout/current/");
        return v_res;

    }

    getUserLayoutAssignments(): Observable<Array<RoleLayoutAssignment>> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}roles/layouts`;

        let v_res = this.http.get<Array<RoleLayoutAssignment>>(v_url, { headers: v_headers });
        return v_res;

    }

    getTenantLayoutAssignments(): Observable<Array<RoleLayoutAssignment>> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}roles/layouts/tenant`;

        let v_res = this.http.get<Array<RoleLayoutAssignment>>(v_url, { headers: v_headers });
        return v_res;

    }

    //**************************** USERS *******************************//


    getUsers(p_Limit: number = -1, p_Offset: number = 0): Observable<Array<User>> {
        let v_Headers = this.getAuthHeaders();


        let v_Collection = this.http.get<Array<User>>(`${this.m_BaseURL}users/`, { headers: v_Headers });

        this.debugLog();
        return v_Collection;
    }

    getUsersWithPermissions(p_Limit: number = -1, p_Offset: number = 0): Observable<Array<PermissionUser>> {
        let v_Headers = this.getAuthHeaders();


        let v_Collection = this.http.get<Array<PermissionUser>>(`${this.m_BaseURL}users/permissions`, { headers: v_Headers });

        this.debugLog();
        return v_Collection;
    }

    getUser(p_UserID: String): Observable<User> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}users/${p_UserID}`;
        let v_User = this.http.get<User>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_User;
    }

    getCurrentUser(forceReload: boolean = false): Observable<User> {

        if (forceReload == false && ProdGenApi.currentUser != null && ProdGenApi.currentUser.userId != "") {
            APICacheService.putUserId(ProdGenApi.currentUser.userId);
            return of(ProdGenApi.currentUser);
        }


        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}users/current/`;
        let v_User = this.http.get<User>(v_Url, { headers: v_Headers });
        v_User.subscribe(res => {
            ProdGenApi.currentUser = res;
            APICacheService.putUserId(ProdGenApi.currentUser.userId);
        });

        this.debugLog();
        return v_User;
    }

    saveCurrentUserData(p_Email: string, p_Name: string): Observable<User> {

        // Invalidate the UserDataGridService.getUserDataGridInfo() cache when a display name changes.
        this.apiCache.invalidateContaining("users/info");

        let v_Headers = this.getAuthHeaders();

        let put = new UserPut();
        put.email = p_Email;
        put.name = p_Name;


        let v_Body = JSON.stringify(put);

        let v_Url = `${this.m_BaseURL}users/current/`;
        let v_User = this.http.put<User>(v_Url, v_Body, { headers: v_Headers });
        return v_User;
    }

    getAccessKeyUser(accessKey: string): Observable<User> {



        let headers = new HttpHeaders({ 'Content-Type': 'application/json' })
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", accessKey);

        let v_Url = `${this.m_BaseURL}users/current/`;
        let v_User = this.http.get<User>(v_Url, { headers: headers });
        //v_User.subscribe(res => ProdGenApi.currentUser = res);

        this.debugLog();
        return v_User;
    }

    getCurrentUserSettings(): Observable<Array<Setting>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}users/current/settings/`;
        let cacheOptions: CacheOptions = new CacheOptions();
        cacheOptions.cacheLocation = CacheLocation.sessionStorage;
        cacheOptions.maxAge = 5;


        let v_Response = this.apiCache.httpGetCacheableResponse<Array<Setting>>(v_Url, { headers: v_Headers }, cacheOptions);
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }

    getCurrentUserSetting(settingName: string): Observable<Setting> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}users/current/settings/${settingName}`;
        let cacheOptions: CacheOptions = new CacheOptions();
        cacheOptions.cacheLocation = CacheLocation.sessionStorage;
        cacheOptions.maxAge = 60;


        let v_Response = this.apiCache.httpGetCacheableResponse<Setting>(v_Url, { headers: v_Headers }, cacheOptions);
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }

    getCurrentUserSettingWithTempUserKey(settingName: string, userAccessKey: string): Observable<Setting> {
        let v_Headers = new HttpHeaders({ 'Content-Type': 'application/json' })
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", userAccessKey);

        let v_Url = `${this.m_BaseURL}users/current/settings/${settingName}`;
        let v_Setting = this.http.get<Setting>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Setting;
    }

    saveCurrentUserSetting(settingName: string, value: any, valueType: SettingType_T): Observable<Setting> {
        if (settingName == "LanguagePreference") {
            this.invlidateCacheAll();
        }

        let v_Headers = this.getAuthHeaders();
        let put = new UserSettingPut();
        put.settingName = settingName;
        put.settingType = valueType;
        put.settingValue = value;

        let v_Url = `${this.m_BaseURL}users/current/settings/`;

        let v_Body = JSON.stringify(put);

        this.apiCache.invalidateContaining("/settings");
        if (settingName.toLowerCase() == "role_layout_preference") {
            this.apiCache.invalidateContaining("/users/uiLayout/current");
        }
        let v_ContentItem = this.http.put<Setting>(v_Url, v_Body, { headers: v_Headers });
        this.debugLog();
        return v_ContentItem;
    }

    saveCurrentUserSettingTempKeys(settingName: string, value: any, valueType: SettingType_T, userAccessKey: string): Observable<Setting> {
        let v_Headers = new HttpHeaders({ 'Content-Type': 'application/json' })
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", userAccessKey);

        let put = new UserSettingPut();
        put.settingName = settingName;
        put.settingType = valueType;
        put.settingValue = value;

        let v_Url = `${this.m_BaseURL}users/current/settings/`;

        let v_Body = JSON.stringify(put);


        this.apiCache.invalidateContaining("settings/");
        let v_ContentItem = this.http.put<Setting>(v_Url, v_Body, { headers: v_Headers });
        this.debugLog();
        return v_ContentItem;
    }


    getBrowserCacheInvalidationStrings(lastDateTime: Date): Observable<Array<string>> {
        let v_Headers = this.getAuthHeaders();
        let checkDate = lastDateTime.toUTCString();
        let v_Result = this.http.get<Array<string>>(`${this.m_BaseURL}users/current/cache/invalidations?checkFromDateTime=${checkDate}`, { headers: v_Headers });

        this.debugLog();
        return v_Result;
    }


    addNewExternalUser(p_Email: string, p_DisplayName: string, p_ImageData: any): Observable<User> {
        let v_Headers = this.getAuthHeaders();
        let body = new ExternalUserPost();
        body.email = p_Email;
        body.displayName = p_DisplayName;
        body.imageData = p_ImageData;

        let v_Url = `${this.m_BaseURL}users/external/`;

        let v_Body = JSON.stringify(body);
        let v_ContentItem = this.http.post<User>(v_Url, v_Body, { headers: v_Headers });
        this.debugLog();
        return v_ContentItem;
    }

    addUserHistory(p_ContentId: string, p_ContentType: ContentType_T, referrer: string = ""
    ): Observable<Comment> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}users/current/history/`;

        let post = new UserHistoryPost();
        post.contentId = p_ContentId;
        post.contentType = p_ContentType;
        post.referrer = referrer;

        if (post.referrer == null || post.referrer.length == 0) {
            if (p_ContentType == ContentType_T.learningpath || (p_ContentType == ContentType_T.course)) {
                post.referrer = "Learning Center";
            }
            else {
                post.referrer = "Work Center";
            }
        }

        let v_Body = JSON.stringify(post);
        let v_ContentItem = this.http.post<Comment>(v_Url, v_Body, { headers: v_Headers });
        this.debugLog();
        return v_ContentItem;
    }

    getCurrentUserFrequentContent(
        p_Limit: number = -1,
        p_Offset: number = 0): Observable<Array<Content>> {
        let v_Headers = this.getAuthHeaders();

        let v_FilterText = "";
        let i = 0;

        let v_Url = `${this.m_BaseURL}users/current/frequentcontent/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}${v_FilterText}`;

        let cacheOptions: CacheOptions = new CacheOptions();
        cacheOptions.cacheLocation = CacheLocation.localStorage;
        cacheOptions.maxAge = 20;

        let v_Response = this.apiCache.httpGetCacheableResponse<Array<Content>>(v_Url, { headers: v_Headers }, cacheOptions);
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }

    getCurrentUserPermissions(forceRefresh: boolean = false): Observable<UserPermissions> {
        var v_Key = "getCurrentUserPermissions";

        if (!forceRefresh && this.data[v_Key]) {
            // console.log("mem data");
            return this.data[v_Key];

        }
        else {
            //console.log("Data undefined, checking api******")
            let v_Headers = this.getAuthHeaders();

            let v_FilterText = "";
            let i = 0;

            let v_Url = `${this.m_BaseURL}users/current/permissions/`;

            let cacheOptions = new CacheOptions();
            cacheOptions.cacheLocation = CacheLocation.sessionStorage;
            cacheOptions.maxAge = 30;
            cacheOptions.useCache = false;

            let v_Response = this.apiCache.httpGetCacheableResponse<UserPermissions>(v_Url, { headers: v_Headers }, cacheOptions);
            if (v_Response.retrievedFromCache == false) {
                this.debugLog();
            }
            return v_Response.data;
            //return v_Permissions;
        }
    }

    getCurrentUserExternalData(): Observable<ExternalUserData> {
        let v_Headers = this.getAuthHeaders();



        let v_Url = `${this.m_BaseURL}users/current/externalData/`;

        let v_ExternalData = this.http.get<ExternalUserData>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_ExternalData;
    }

    updateCurrentUserExternalData(organizationName: string, organizationRole: string, phone: string): Observable<ExternalUserData> {
        let v_Headers = this.getAuthHeaders();
        let v_PutObj: ExternalUserPut = new ExternalUserPut();
        v_PutObj.organizationName = organizationName;
        v_PutObj.organizationRole = organizationRole;
        v_PutObj.phone = phone;

        let v_PutText = JSON.stringify(v_PutObj);

        let v_Url = `${this.m_BaseURL}users/current/externalData/`;
        let v_Enrollments = this.http.put<ExternalUserData>(v_Url, v_PutText, { headers: v_Headers });

        this.debugLog();
        return v_Enrollments;
    }

    getCurrentUserExternalInvitesRemainingByWorkGroup(workgroupID: string): Observable<number> {
        let v_Headers = this.getAuthHeaders();



        let v_Url = `${this.m_BaseURL}users/current/workgroups/${workgroupID}/externalInvitationsRemaining/`;

        let v_Value = this.http.get<number>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Value;
    }



    getCurrentUserExternalGroupsWithAddPermission(p_Workgroupid: string): Observable<Array<WorkgroupExternalGroup>> {
        let v_Headers = this.getAuthHeaders();



        let v_Url = `${this.m_BaseURL}users/current/workgroups/${p_Workgroupid}/externalgroups/groupsWithAddRights`;
        //let v_Url = `${this.m_BaseURL}users/${p_UserID}/enrollments/?enrollmentFilter=${p_EnrollmentFilter.join()}&limit=${p_Limit.toString()}&offset=${p_Offset.toString()}`;
        //let v_Url = `${this.m_BaseURL}users/${p_UserID}/enrollments/`;
        let v_ExternalGroups = this.http.get<Array<WorkgroupExternalGroup>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_ExternalGroups;
    }

    getCurrentUserEnrollments(p_EnrollmentFilter: EnrollmentFilter_T[] = [EnrollmentFilter_T.assigned, EnrollmentFilter_T.inProgress],
        p_DescFilter = DescriptionFilter_T.none,
        p_Limit: number = -1,
        p_Offset: number = 0): Observable<Array<Enrollment>> {



        let v_Headers = this.getAuthHeaders();

        let v_FilterText = "";
        let i = 0;
        for (i = 0; i < p_EnrollmentFilter.length; i++) {
            v_FilterText += `&enrollmentFilter=${p_EnrollmentFilter[i].toString()}`
        }

        let v_Url = `${this.m_BaseURL}users/current/enrollments/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}${v_FilterText}&descFilter=${p_DescFilter.toString()}`;

        let v_Response = this.apiCache.httpGetCacheableResponse<Array<Enrollment>>(v_Url, { headers: v_Headers });
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }

    getLearningPathUserEnrollments(p_EnrollmentFilter: EnrollmentFilter_T[] = [EnrollmentFilter_T.assigned, EnrollmentFilter_T.inProgress],
        p_LearningPathID: string,
        p_Limit: number = -1,
        p_Offset: number = 0
    ): Observable<Array<Enrollment>> {
        let v_Headers = this.getAuthHeaders();

        let v_FilterText = "";
        let i = 0;
        for (i = 0; i < p_EnrollmentFilter.length; i++) {
            v_FilterText += `&enrollmentFilter=${p_EnrollmentFilter[i].toString()}`
        }

        let v_Url = `${this.m_BaseURL}enrollments/lpenrollments/${p_LearningPathID}/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}${v_FilterText}`;
        let v_Response = this.apiCache.httpGetCacheableResponse<Array<Enrollment>>(v_Url, { headers: v_Headers });
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }

    /*GetPrerequisitesForContent(p_ContentId: String): Observable<ContentPrerequisiteInfo> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/${p_ContentId}/prereqs`;

        let v_contentPrerequisiteInfo = this.http.get(v_Url, { headers: v_Headers });

        return v_contentPrerequisiteInfo;
    }*/

    GetPrerequisitesForContentNotCompleted(p_ContentId: String, p_UserId: String, p_Course: number): Observable<ContentPrerequisiteInfo> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/${p_ContentId}/prereqs/${p_UserId}/${p_Course}`;

        let v_contentPrerequisiteInfo = this.http.get<ContentPrerequisiteInfo>(v_Url, { headers: v_Headers });

        return v_contentPrerequisiteInfo;
    }

    getCurrentUserNotifications(p_NotificationFilter: NotificationFilter_T = NotificationFilter_T.new,
        p_Limit: number = -1,
        p_Offset: number = 0): Observable<Array<Notification>> {
        let v_Headers = this.getAuthHeaders();
        let v_FilterText = "";
        let i = 0;

        v_FilterText += `&notificationFilter=${p_NotificationFilter.toString()}`

        let v_Url = `${this.m_BaseURL}users/current/notifications/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}${v_FilterText}`;

        let v_Notifications = this.http.get<Array<Notification>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Notifications;
    }

    getCurrentUserWorkgroups(p_PermissionFilter: PermissionLevel_T[] = [PermissionLevel_T.editor, PermissionLevel_T.owner, PermissionLevel_T.user],
        p_Limit: number = 0,
        p_Offset: number = 0,
        p_Search: string = ""): Observable<Array<Workgroup>> {

        // Invalidate the UserDataGridService.getUserDataGridInfo() cache when the user navigates to the workcenter.
        this.apiCache.invalidateContaining("users/info");

        let v_Headers = this.getAuthHeaders();
        let v_FilterText = "";

        for (var i = 0; i < p_PermissionFilter.length; i++) {
            v_FilterText += `&permissionFilter=${p_PermissionFilter[i].toString()}`
        }

        let v_Url = `${this.m_BaseURL}users/current/workgroups/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}&search=${p_Search}${v_FilterText}`;

        let v_Response = this.apiCache.httpGetCacheableResponse<Array<Workgroup>>(v_Url, { headers: v_Headers });
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }

    getCurrentUserWorkgroupIdsWithOwnerEditorRights(): Observable<WorkgroupListByPermission> {

        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}users/current/workgroups/ownereditortights`;

        let v_Response = this.apiCache.httpGetCacheableResponse<WorkgroupListByPermission>(v_Url, { headers: v_Headers });
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }

    updateCurrentUserPassword(p_OldPassword: String, p_NewPassword: String): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();
        let put = new UserPasswordPost();
        put.oldPassword = p_OldPassword as string;
        put.newPassword = p_NewPassword as string;

        let v_Url = `${this.m_BaseURL}users/current/password/`;

        let v_Body = JSON.stringify(put);
        let v_ContentItem = this.http.put<boolean>(v_Url, v_Body, { headers: v_Headers });
        this.debugLog();
        return v_ContentItem;
    }

    updateCurrentUserPasswordWithGivenKey(p_OldPassword: String, p_NewPassword: String, p_AccessKey: string): Observable<boolean> {


        let v_Headers = new HttpHeaders({ 'Content-Type': 'application/json' })
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", p_AccessKey);

        let put = new UserPasswordPost();
        put.oldPassword = p_OldPassword as string;
        put.newPassword = p_NewPassword as string;

        let v_Url = `${this.m_BaseURL}users/current/password/`;

        let v_Body = JSON.stringify(put);
        let v_ContentItem = this.http.put<boolean>(v_Url, v_Body, { headers: v_Headers });
        this.debugLog();
        return v_ContentItem;
    }

    updateCurrentUserImage(p_ImageArray: any): Observable<String> {
        let v_headers = new HttpHeaders()
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", ProdGenApi.userAccessKey);
        let v_Url = `${this.m_BaseURL}users/current/image/`;
        let v_Body = p_ImageArray;

        //const v_Test = new FormData();
        //v_Test.append("file", p_ImageArray, 'Test');

        let v_ContentItem = this.http.put<String>(v_Url, v_Body, { headers: v_headers });
        this.debugLog();
        return v_ContentItem;
    }

    isNewPasswordValid(p_Password: string): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();


        let v_Url = `${this.m_BaseURL}users/current/password/valid`;

        let v_IsValid = this.http.post<boolean>(v_Url, `"${p_Password}"`, { headers: v_Headers });

        this.debugLog();
        return v_IsValid;
    }

    isNewPasswordValidWithGivenKey(p_Password: string, p_AccessKey: string): Observable<boolean> {
        let v_Headers = new HttpHeaders({ 'Content-Type': 'application/json' })
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", p_AccessKey);


        let v_Url = `${this.m_BaseURL}users/current/password/valid`;

        let v_IsValid = this.http.post<boolean>(v_Url, `"${p_Password}"`, { headers: v_Headers });

        this.debugLog();
        return v_IsValid;
    }



    isCurrentPasswordExpired(): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();


        let v_Url = `${this.m_BaseURL}users/current/password/isPasswordExpired`;

        let v_IsValid = this.http.get<boolean>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_IsValid;
    }

    /*
    getUserOrganizations(p_EmailAddress: string): Observable<Array<Organization>> {
        let v_Headers = this.getAuthHeaders();
        v_Headers.append("emailAddress", p_EmailAddress);
        let v_Url = `${this.m_BaseURL}users/organizations/`;

        let v_Organizations = this.http.get(v_Url, { headers: v_Headers });

        return v_Organizations;
    }
    */

    GetContentItems(p_Limit: number = -1,
        p_Offset: number = 0,
        p_ContentFilter: ContentType_T[] = [ContentType_T.cheatsheet, ContentType_T.course, ContentType_T.learningpath, ContentType_T.process, ContentType_T.quiz, ContentType_T.step, ContentType_T.task, ContentType_T.video, ContentType_T.workflow],
        p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.unformatted,
        p_Search: string = ""): Observable<Array<Content>> {
        let v_Headers = this.getAuthHeaders();
        let v_FilterText = "";
        let i = 0;
        for (i = 0; i < p_ContentFilter.length; i++) {
            v_FilterText += `&enrollmentFilter=${p_ContentFilter[i].toString()}`
        }
        let v_Url = `${this.m_BaseURL}content/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}&search=${p_Search}&descriptionFilter=${p_DescriptionFilter.toString()}${v_FilterText}`;

        let v_Content = this.http.get<Array<Content>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Content;
    }

    GetContentItem(p_ContentId: String, p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.formatted): Observable<Content> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/${p_ContentId}?descriptionFilter=${p_DescriptionFilter.toString()}`;
        let v_Process = this.http.get<Content>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Process;
    }

    getEnrollmentContentItem(p_EnrollmentId: String, p_ContentId: String, p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.formatted): Observable<Content> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}/enrollments/${p_EnrollmentId}/content/${p_ContentId}?descriptionFilter=${p_DescriptionFilter.toString()}`;
        let v_Process = this.http.get<Content>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Process;
    }

    getEnrollmentCertificate(p_EnrollmentId: String): Observable<string> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}enrollments/${p_EnrollmentId}/certificate/`;
        let v_Cert = this.http.get<string>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Cert;
    }

    getUserTranscript(): Observable<string> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}/users/current/transcript/`;
        let v_Cert = this.http.get<string>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Cert;
    }

    GetContentExperts(p_ContentId: String,
        p_Limit: number = -1,
        p_Offset: number = 0): Observable<Array<User>> {
        let v_Headers = this.getAuthHeaders();
        if (p_ContentId == null) {
            return of(new Array<User>());
        }

        let v_Url = `${this.m_BaseURL}content/${p_ContentId}/experts/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}`;
        let v_ContentItem = this.http.get<Array<User>>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_ContentItem;
    }

    GetContentComments(p_ContentId: String,
        p_Limit: number = -1,
        p_Offset: number = 0): Observable<Array<Comment>> {
        let v_Headers = this.getAuthHeaders();

        if (p_ContentId == null) {
            return of(new Array<Comment>());
        }

        let v_Url = `${this.m_BaseURL}content/${p_ContentId}/comments/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}`;
        let v_ContentItem = this.http.get<Array<Comment>>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_ContentItem;
    }

    deleteContentComment(p_ContentId: String,
        p_CommentId: String): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/${p_ContentId}/comments/${p_CommentId}`;

        let result = this.http.delete<boolean>(v_Url, { headers: v_Headers });

        return result;
    }


    EndSession() {
        let v_Headers = this.getAuthHeaders();

        ProdGenApi.currentUser = null;

        let v_Url = `${this.m_BaseURL}authorization/endSession/`;
        //let v_ContentItem = this.http.post(v_Url, ``, { headers: v_Headers });
        //return v_ContentItem;

        let xhr = new XMLHttpRequest();
        xhr.open("POST", v_Url, false);
        xhr.setRequestHeader("apiKey", ProdGenApi.APIKey);
        xhr.setRequestHeader("userAccessKey", ProdGenApi.userAccessKey);

        xhr.send();
    }

    SetContentComment(p_ContentId: String, p_ContentType: String,
        p_CommentText: string): Observable<Comment> {
        p_CommentText = p_CommentText.replace(/\"/g, "\\\"");
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/${p_ContentId}/comments/?contentType=${p_ContentType}`;
        let v_ContentItem = this.http.post<Comment>(v_Url, `"${p_CommentText}"`, { headers: v_Headers });
        this.debugLog();
        return v_ContentItem;
    }

    addContentSuggestion(p_contentId: String, p_contentType: String,
        p_suggestionText: string): Observable<Boolean> {
        let v_headers = this.getAuthHeaders();

        let v_url = `${this.m_BaseURL}content/${p_contentId}/suggestions/?contentType=${p_contentType}`;
        let v_result = this.http.post<Boolean>(v_url, `"${p_suggestionText}"`, { headers: v_headers });
        return v_result;
    }


    GetContentUserRecommendations(p_ContentId: String,
        p_Limit: number = -1,
        p_Offset: number = 0): Observable<Array<User>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/${p_ContentId}/userRecommendations/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}`;

        let v_Users = this.http.get<Array<User>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Users;
    }

    SetContentUserRecommendation(p_ContentId: String): Observable<User> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}content/${p_ContentId}/userRecommendations/`;

        let v_Users = this.http.post<User>(v_Url, "", { headers: v_Headers });

        this.debugLog();
        return v_Users;
    }

    GetContentRelatedItems(p_ContentId: String,
        p_ContentType: String,
        p_Limit: number = -1,
        p_Offset: number = 0,
        p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.unformatted
    ): Observable<Array<Content>> {
        let v_Headers = this.getAuthHeaders();

        if (p_ContentId == null) {
            return of(new Array<Content>());
        }

        let v_Url = `${this.m_BaseURL}content/${p_ContentId}/relatedItems/?contentType=${p_ContentType}&limit=${p_Limit.toString()}&offset=${p_Offset.toString()}&descriptionFilter=${p_DescriptionFilter.toString()}`;

        let v_Response = this.apiCache.httpGetCacheableResponse<Array<Content>>(v_Url, { headers: v_Headers });
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }

    GetWorkflows(p_Limit: number = -1,
        p_Offset: number = 0,
        p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.unformatted,
        p_Search: string = ""): Observable<Array<Workflow>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/workflows/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}&search=${p_Search}&descriptionFilter=${p_DescriptionFilter.toString()}`;

        let v_Workflows = this.http.get<Array<Workflow>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Workflows;
    }

    GetWorkflow(p_WorkflowId: String, p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.unformatted): Observable<Workflow> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/workflows/${p_WorkflowId}?descriptionFilter=${p_DescriptionFilter.toString()}`;
        let v_Workflow = this.http.get<Workflow>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Workflow;
    }

    getEnrollmentWorkflow(p_EnrollmentId: String, p_WorkflowId: String, p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.unformatted): Observable<Workflow> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}enrollments/${p_EnrollmentId}/content/workflows/${p_WorkflowId}?descriptionFilter=${p_DescriptionFilter.toString()}`;
        let v_Workflow = this.http.get<Workflow>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Workflow;
    }

    GetWorkflowProcesses(p_WorkflowId: String,
        p_Limit: number = -1,
        p_Offset: number = 0,
        p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.unformatted,
        p_Search: string = ""): Observable<Array<Process>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/workflows/${p_WorkflowId}/processes/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}&search=${p_Search}&descriptionFilter=${p_DescriptionFilter.toString()}`;

        let v_Processes = this.http.get<Array<Process>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Processes;
    }

    getWorkflowHierarchy(p_WorkflowId: String): Observable<HierarchyContent> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}content/workflows/${p_WorkflowId}/hierarchy`;
        let v_hierarchy = this.http.get<HierarchyContent>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_hierarchy;
    }

    getEnrollmentWorkflowProcesses(p_EnrollmentId: String, p_WorkflowId: String,
        p_Limit: number = -1,
        p_Offset: number = 0,
        p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.unformatted,
        p_Search: string = ""): Observable<Array<Process>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}enrollments/${p_EnrollmentId}/content/workflows/${p_WorkflowId}/processes/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}&search=${p_Search}&descriptionFilter=${p_DescriptionFilter.toString()}`;

        let v_Processes = this.http.get<Array<Process>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Processes;
    }

    GetWorkflowDiagram(p_WorkflowId: String): Observable<DiagramView> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/workflows/${p_WorkflowId}/diagramview/`;

        let v_Diagram = this.http.get<DiagramView>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Diagram;
    }

    GetWorkflowTools(p_WorkflowId: String): Observable<Array<Tool>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/workflows/${p_WorkflowId}/tools/`;
        let v_Tools = this.http.get<Array<Tool>>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Tools;
    }

    GetProcesses(p_Limit: number = -1,
        p_Offset: number = 0,
        p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.unformatted,
        p_Search: string = ""): Observable<Array<Process>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/processes/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}&search=${p_Search}&descriptionFilter=${p_DescriptionFilter.toString()}`;

        let v_Processes = this.http.get<Array<Process>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Processes;
    }

    GetProcess(p_ProcessId: String, p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.formatted): Observable<Process> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/processes/${p_ProcessId}?descriptionFilter=${p_DescriptionFilter.toString()}`;
        let v_Process = this.http.get<Process>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Process;
    }

    getEnrollmentProcess(p_EnrollmentId: String, p_ProcessId: String, p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.formatted): Observable<Process> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}enrollments/${p_EnrollmentId}/content/processes/${p_ProcessId}?descriptionFilter=${p_DescriptionFilter.toString()}`;
        let v_Process = this.http.get<Process>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Process;
    }

    GetProcessDiagram(p_ProcessId: String): Observable<DiagramView> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/processes/${p_ProcessId}/diagramview/`;

        let v_Diagram = this.http.get<DiagramView>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Diagram;
    }

    GetProcessTasks(p_ProcessId: String,
        p_Limit: number = -1,
        p_Offset: number = 0,
        p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.unformatted,
        p_Search: string = ""): Observable<Array<Task>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/processes/${p_ProcessId}/tasks/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}&search=${p_Search}&descriptionFilter=${p_DescriptionFilter.toString()}`;

        let v_Tasks = this.http.get<Array<Task>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Tasks;
    }

    GetProcessTools(p_ProcessId: String): Observable<Array<Tool>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/processes/${p_ProcessId}/tools/`;
        let v_Tools = this.http.get<Array<Tool>>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Tools;
    }

    GetTasks(p_Limit: number = -1,
        p_Offset: number = 0,
        p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.unformatted,
        p_Search: string = ""): Observable<Array<Task>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/tasks/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}&search=${p_Search}&descriptionFilter=${p_DescriptionFilter.toString()}`;

        let v_Tasks = this.http.get<Array<Task>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Tasks;
    }

    GetTask(p_TaskId: String, p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.formatted): Observable<Task> {
        let v_Headers = this.getAuthHeaders()
            .append("descriptionFilter", p_DescriptionFilter.toString());
        let v_Url = `${this.m_BaseURL}content/tasks/${p_TaskId}?descriptionFilter=${p_DescriptionFilter.toString()}`;
        let v_Task = this.http.get<Task>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Task;
    }

    GetEnrollmentTask(p_EnrollmentId: String, p_TaskId: String, p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.formatted): Observable<Task> {
        let v_Headers = this.getAuthHeaders()
            .append("descriptionFilter", p_DescriptionFilter.toString());
        let v_Url = `${this.m_BaseURL}enrollments/${p_EnrollmentId}/content/tasks/${p_TaskId}?descriptionFilter=${p_DescriptionFilter.toString()}`;
        let v_Task = this.http.get<Task>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Task;
    }


    GetTaskSteps(p_TaskId: String,
        p_Limit: number = -1,
        p_Offset: number = 0,
        p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.unformatted,
        p_Search: string = ""): Observable<Array<Step>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/tasks/${p_TaskId}/steps/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}&search=${p_Search}&descriptionFilter=${p_DescriptionFilter.toString()}`;

        let v_Steps = this.http.get<Array<Step>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Steps;
    }

    getEnrollmentTaskSteps(p_EnrollmentId: String, p_TaskId: String,
        p_Limit: number = -1,
        p_Offset: number = 0,
        p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.unformatted,
        p_Search: string = ""): Observable<Array<Step>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}enrollments/${p_EnrollmentId}/content/tasks/${p_TaskId}/steps/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}&search=${p_Search}&descriptionFilter=${p_DescriptionFilter.toString()}`;

        let v_Steps = this.http.get<Array<Step>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Steps;
    }

    GetTaskTools(p_TaskId: String): Observable<Array<Tool>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/tasks/${p_TaskId}/tools/`;
        let v_Tools = this.http.get<Array<Tool>>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Tools;
    }

    GetSteps(p_Limit: number = -1,
        p_Offset: number = 0,
        p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.unformatted,
        p_Search: string = ""): Observable<Array<Step>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/steps/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}&search=${p_Search}&descriptionFilter=${p_DescriptionFilter.toString()}`;

        let v_Steps = this.http.get<Array<Step>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Steps;
    }

    GetStep(p_StepId: String, p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.formatted): Observable<Step> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/steps/${p_StepId}?descriptionFilter=${p_DescriptionFilter.toString()}`;
        let v_Task = this.http.get<Step>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Task;
    }

    GetEnrollmentStep(p_EnrollmentId: String, p_StepId: String, p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.formatted): Observable<Step> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}enrollments/${p_EnrollmentId}/content/steps/${p_StepId}?descriptionFilter=${p_DescriptionFilter.toString()}`;
        //let v_Url = `${this.m_BaseURL}enrollments/${p_EnrollmentId}/content/steps/${p_StepId}`;
        let v_Task = this.http.get<Step>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Task;
    }

    GetStepTools(p_StepId: String): Observable<Array<Tool>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/steps/${p_StepId}/tools/`;
        let v_Tools = this.http.get<Array<Tool>>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Tools;
    }

    GetCheatSheets(p_Limit: number = -1,
        p_Offset: number = 0,
        p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.unformatted,
        p_Search: string = ""): Observable<Array<CheatSheet>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/cheatsheets/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}&search=${p_Search}&descriptionFilter=${p_DescriptionFilter.toString()}`;

        let v_CheatSheets = this.http.get<Array<CheatSheet>>(v_Url, { headers: v_Headers });
        this.debugLog();

        return v_CheatSheets;
    }

    GetCheatSheet(p_CheatSheetId: String, p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.formatted): Observable<CheatSheet> {
        let v_Headers = this.getAuthHeaders()
            .append("descriptionFilter", p_DescriptionFilter.toString());
        let v_Url = `${this.m_BaseURL}content/cheatsheets/${p_CheatSheetId}?descriptionFilter=${p_DescriptionFilter.toString()}&noheaderImage=false`;
        let v_CheatSheet = this.http.get<CheatSheet>(v_Url, { headers: v_Headers });
        return v_CheatSheet;
    }

    GetCheatSheetWithoutImageHeader(p_CheatSheetId: String, p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.formatted): Observable<CheatSheet> {
        let v_Headers = this.getAuthHeaders()
            .append("descriptionFilter", p_DescriptionFilter.toString());
        let v_Url = `${this.m_BaseURL}content/cheatsheets/${p_CheatSheetId}?descriptionFilter=${p_DescriptionFilter.toString()}&noheaderImage=true`;
        let v_CheatSheet = this.http.get<CheatSheet>(v_Url, { headers: v_Headers });
        return v_CheatSheet;
    }

    getEnrollmentCheatSheet(p_EnrollmentId: String, p_CheatSheetId: String, p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.formatted): Observable<CheatSheet> {
        let v_Headers = this.getAuthHeaders()
            .append("descriptionFilter", p_DescriptionFilter.toString());
        let v_Url = `${this.m_BaseURL}enrollments/${p_EnrollmentId}/content/cheatsheets/${p_CheatSheetId}?descriptionFilter=${p_DescriptionFilter.toString()}`;
        let v_CheatSheet = this.http.get<CheatSheet>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_CheatSheet;
    }

    GetCheatSheetTools(p_CheatSheetId: String): Observable<Array<Tool>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/cheatsheets/${p_CheatSheetId}/tools/`;
        let v_Tools = this.http.get<Array<Tool>>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Tools;
    }

    GetVideos(p_Limit: number = -1,
        p_Offset: number = 0,
        p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.unformatted,
        p_Search: string = ""): Observable<Array<Video>> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}content/videos/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}&search=${p_Search}&descriptionFilter=${p_DescriptionFilter.toString()}`;

        let v_Videos = this.http.get<Array<Video>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Videos;
    }

    GetVideo(p_VideoId: String, p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.formatted): Observable<Video> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/videos/${p_VideoId}?descriptionFilter=${p_DescriptionFilter.toString()}`;
        let v_Video = this.http.get<Video>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Video;
    }

    getEnrollmentVideo(p_EnrollmentId: String, p_VideoId: String, p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.formatted): Observable<Video> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}enrollments/${p_EnrollmentId}/content/videos/${p_VideoId}?descriptionFilter=${p_DescriptionFilter.toString()}`;
        let v_Video = this.http.get<Video>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Video;
    }

    getEnrollmentClass(p_EnrollmentId: String, p_ClassId: String, p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.formatted): Observable<ClassContentItem> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}enrollments/${p_EnrollmentId}/content/classes/${p_ClassId}?descriptionFilter=${p_DescriptionFilter.toString()}`;
        let v_Video = this.http.get<ClassContentItem>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Video;
    }

    getClassSession(p_ClassId: String, p_SessionId: String): Observable<ClassSession> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/classes/${p_ClassId}/sessions/${p_SessionId}`;
        let v_Session = this.http.get<ClassSession>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Session;
    }

    getClassSessions(p_ClassId: String): Observable<Array<ClassSession>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/classes/${p_ClassId}/sessions`;
        let v_Session = this.http.get<Array<ClassSession>>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Session;
    }

    setClassRegistration(p_ClassId: String, p_SessionId: String, attended: boolean = false): Observable<ClassRegistrant> {
        let v_Headers = this.getAuthHeaders();
        let post = new ClassRegistrantPost();
        post.attended = attended;
        post.sessionId = p_SessionId as string;

        let v_Body = JSON.stringify(post);

        let v_Url = `${this.m_BaseURL}content/classes/${p_ClassId}/sessions/${p_SessionId}/registrations`;

        let v_Registrant = this.http.post<ClassRegistrant>(v_Url, v_Body, { headers: v_Headers });

        this.debugLog();
        return v_Registrant;
    }

    GetVideoBookmarks(p_VideoId: String): Observable<Array<Bookmark>> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}content/videos/${p_VideoId}/bookmarks/`;
        let v_Bookmarks = this.http.get<Array<Bookmark>>(v_Url, { headers: v_Headers });
        return v_Bookmarks;
    }

    GetVideoTranscript(p_VideoId: String): Observable<String> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}content/videos/${p_VideoId}/transcription/`;
        let v_Transcript = this.http.get<String>(v_Url, { headers: v_Headers });
        return v_Transcript;
    }

    GetWebVideoTextTracksFile(p_VideoId: String): Observable<Array<WebVideoTextTracksCue>> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}content/videos/${p_VideoId}/webvideotexttracks/`;
        let v_WebVideoTextTracksFile = this.http.get<Array<WebVideoTextTracksCue>>(v_Url, { headers: v_Headers });
        return v_WebVideoTextTracksFile;
    }

    UpdateWebVideoTextTracksFile(p_VideoId: String, p_WebWebVideoTextTracks: Array<WebVideoTextTracksCue>): Observable<void> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}content/videos/${p_VideoId}/updatewebvideotexttracks/`;
        let v_Response = this.http.put<void>(v_Url, p_WebWebVideoTextTracks, { headers: v_Headers });
        return v_Response;
    }

    DeleteWebVideoTextTracksFile(p_VideoId: String): Observable<void> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}content/videos/${p_VideoId}/deletewebvideotexttracks/`;
        let v_Response = this.http.delete<void>(v_Url, { headers: v_Headers });
        return v_Response;
    }

    GetVideoTools(p_VideoId: String): Observable<Array<Tool>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/videos/${p_VideoId}/tools/`;
        let v_Tools = this.http.get<Array<Tool>>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Tools;
    }

    getChatLog(p_ChatId: String): Observable<ChatLog> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/chatlogs/${p_ChatId}`;
        let v_ChatLog = this.http.get<ChatLog>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_ChatLog;
    }


    GetQuizzes(p_Limit: number = -1,
        p_Offset: number = 0,
        p_Search: string = "",
        p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.formatted): Observable<Array<Quiz>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/quizzes/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}&search=${p_Search}&descriptionFilter=${p_DescriptionFilter.toString()}`;

        let v_Quizzes = this.http.get<Array<Quiz>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Quizzes;
    }

    GetQuiz(p_QuizId: String, p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.formatted): Observable<Quiz> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/quizzes/${p_QuizId}?descriptionFilter=${p_DescriptionFilter.toString()}`;
        let v_Video = this.http.get<Quiz>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Video;
    }

    getEnrollmentQuiz(p_EnrollmentId: String, p_QuizId: String, p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.formatted): Observable<Quiz> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}/enrollments/${p_EnrollmentId}/content/quizzes/${p_QuizId}?descriptionFilter=${p_DescriptionFilter.toString()}`;
        let v_Video = this.http.get<Quiz>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Video;
    }


    GetQuizQuestions(p_QuizId: String, randOrd: boolean,
        p_Limit: number = -1,
        p_Offset: number = 0): Observable<Array<QuizQuestion>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/quizzes/${p_QuizId}/quizQuestions?randOrd=${randOrd}`;

        let v_QuizQuestions = this.http.get<Array<QuizQuestion>>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_QuizQuestions;
    }

    GetQuizAnswers(p_QuizId: String,
        p_Limit: number = -1,
        p_Offset: number = 0): Observable<Array<QuizAnswer>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/quizzes/${p_QuizId}/quizAnswers/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}`;

        let v_QuizQuestions = this.http.get<Array<QuizAnswer>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_QuizQuestions;
    }

    GetLearningPaths(p_Limit: number = -1,
        p_Offset: number = 0,
        p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.unformatted,
        p_Search: string = ""): Observable<Array<LearningPath>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/learningpaths/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}&search=${p_Search}&descriptionFilter=${p_DescriptionFilter.toString()}`;

        let v_LearningPaths = this.http.get<Array<LearningPath>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_LearningPaths;
    }

    GetLearningPath(p_LearningPathId: String, p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.formatted): Observable<LearningPath> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/learningpaths/${p_LearningPathId}?descriptionFilter=${p_DescriptionFilter.toString()}`;
        let v_LearningPath = this.http.get<LearningPath>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_LearningPath;
    }

    GetLearningPathCourses(p_LearningPathId: String,
        p_Limit: number = -1,
        p_Offset: number = 0,
        p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.unformatted
    ): Observable<Array<Course>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/learningpaths/${p_LearningPathId}/courses/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}&descriptionFilter=${p_DescriptionFilter.toString()}`;

        let v_Courses = this.http.get<Array<Course>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Courses;
    }

    SetLearningPathEnrollment(p_LearningPathId: String): Observable<Enrollment> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}content/learningpaths/${p_LearningPathId}/enrollments/`;

        let v_Enrollment = this.http.post<Enrollment>(v_Url, "", { headers: v_Headers });
        this.apiCache.invalidateContaining("/enrollments");

        this.debugLog();
        return v_Enrollment;
    }

    GetLearningPathExperts(p_LearningPathId: String,
        p_Limit: number = -1,
        p_Offset: number = 0): Observable<Array<User>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/learningpaths/${p_LearningPathId}/experts/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}`;

        let v_Experts = this.http.get<Array<User>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Experts;
    }

    GetLearningPathTools(p_LearningPathId: String): Observable<Array<Tool>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/learningpaths/${p_LearningPathId}/tools/`;
        let v_Tools = this.http.get<Array<Tool>>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Tools;
    }

    GetCourses(p_Limit: number = -1,
        p_Offset: number = 0,
        p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.unformatted,
        p_Search: string = ""): Observable<Array<Course>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/courses/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}&search=${p_Search}&descriptionFilter=${p_DescriptionFilter.toString()}`;

        let v_Courses = this.http.get<Array<Course>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Courses;
    }

    GetCourse(p_CourseId: String, p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.formatted): Observable<Course> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/courses/${p_CourseId}?descriptionFilter=${p_DescriptionFilter.toString()}`;
        let v_LearningPath = this.http.get<Course>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_LearningPath;
    }

    GetCourseContentItems(p_CourseId: String,
        p_Limit: number = -1,
        p_Offset: number = 0,
        p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.unformatted): Observable<Array<Content>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/courses/${p_CourseId}/contentItems/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}&descriptionFilter=${p_DescriptionFilter.toString()}`;

        let v_ContentItems = this.http.get<Array<Content>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_ContentItems;
    }

    SetCourseEnrollment(p_CourseId: String, hasDueDate: boolean, dueDate: Date = new Date()): Observable<Enrollment> {
        let v_Headers = this.getAuthHeaders();
        let post = new EnrollmentPost();
        post.hasDueDate = hasDueDate;
        post.dueDate = dueDate;
        post.courseId = p_CourseId as string;
        post.userId = "1";

        let v_Body = JSON.stringify(post);

        let v_Url = `${this.m_BaseURL}content/courses/${p_CourseId}/enrollments/`;

        this.apiCache.invalidateContaining("/enrollments");
        let v_Enrollment = this.http.post<Enrollment>(v_Url, v_Body, { headers: v_Headers });

        return v_Enrollment;
    }

    setEnrollmentDueDate(p_EnrollmentId: String, hasDueDate: boolean, dueDate: Date = new Date()): Observable<Enrollment> {
        let v_Headers = this.getAuthHeaders();
        let post = new EnrollmentPost();
        post.hasDueDate = hasDueDate;
        post.dueDate = dueDate;
        post.courseId = "00000000-0000-0000-0000-000000000000";
        post.userId = "00000000-0000-0000-0000-000000000000";

        let v_Body = JSON.stringify(post);

        let v_Url = `${this.m_BaseURL}enrollments/${p_EnrollmentId}/dueDate/`;

        this.apiCache.invalidateContaining(`enrollments`);
        let v_Enrollment = this.http.put<Enrollment>(v_Url, v_Body, { headers: v_Headers });

        this.debugLog();
        return v_Enrollment;
    }

    DeleteCourseEnrollment(p_EnrollmentId: String): Observable<Enrollment> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}enrollments/${p_EnrollmentId}`;

        this.apiCache.invalidateContaining(`enrollments`);

        let v_Enrollment = this.http.delete<Enrollment>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Enrollment;
    }

    DropLPEnrollment(p_EnrollmentId: String, p_LearningPathId: String, p_EnrollIds: String): Observable<Enrollment> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}enrollments/${p_EnrollmentId}/${p_LearningPathId}`;
        let v_Body = JSON.stringify(p_EnrollIds);

        this.apiCache.invalidateContaining(`enrollments`);
        let v_Enrollment = this.http.put<Enrollment>(v_Url, v_Body, { headers: v_Headers });

        return v_Enrollment;
    }

    SetBulkEnrollments(p_Content: Array<Content>, p_Users: Array<UserMultiSelect>, p_UserId: String, p_DueDate: String, p_HasDueDate: boolean): Observable<Array<BulkNotEnrolled>> {
        let v_Headers = this.getAuthHeaders();
        let post = new EnrollmentInBulk();
        post.bulkContent = p_Content;
        post.bulkUsers = p_Users;
        post.dueDateStr = p_DueDate;
        post.hasDueDate = p_HasDueDate;
        let v_Body = JSON.stringify(post);
        let v_Url = `${this.m_BaseURL}enrollments/content/bulk/${p_UserId}`;

        this.apiCache.invalidateContaining(`enrollments`);

        let v_result = this.http.post<Array<BulkNotEnrolled>>(v_Url, v_Body, { headers: v_Headers });
        return v_result;
    }

    GetCourseExperts(p_CourseId: String,
        p_Limit: number = -1,
        p_Offset: number = 0): Observable<Array<User>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/courses/${p_CourseId}/experts/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}`;

        let v_Experts = this.http.get<Array<User>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Experts;
    }

    GetCourseTools(p_CourseId: String): Observable<Array<Tool>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/courses/${p_CourseId}/tools/`;
        let v_Tools = this.http.get<Array<Tool>>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Tools;
    }

    GetCategories(limit: number = 0,
        offset: number = 0,
        catFilter: CategoryFilter_T = CategoryFilter_T.tenantAndSubscription,
        orderBy: CategoryOrderBy_T = CategoryOrderBy_T.alphabetical): Observable<Array<Category>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}categories/?limit=${limit.toString()}&offset=${offset.toString()}&catFilter=${catFilter}&orderBy=${orderBy}`;

        let v_Categories = this.http.get<Array<Category>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Categories;
    }

    GetCategoryContentItems(p_CategoryId: String,
        p_Limit: number = 0,
        p_Offset: number = 0,
        p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.unformatted,
        p_Search: string = ""): Observable<Array<Content>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}categories/${p_CategoryId}/content/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}&search=${p_Search}&descriptionFilter=${p_DescriptionFilter.toString()}`;

        let v_ContentItems = this.http.get<Array<Content>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_ContentItems;
    }

    GetWorkgroups(p_PermissionFilter: PermissionLevel_T[] = [PermissionLevel_T.editor, PermissionLevel_T.owner, PermissionLevel_T.user],
        p_Limit: number = 0,
        p_Offset: number = 0,
        p_Search: string = "",
        p_ArchiveIncluded = false): Observable<Array<Workgroup>> {
        let v_Headers = this.getAuthHeaders();
        let v_FilterText = "";

        for (var i = 0; i < p_PermissionFilter.length; i++) {
            v_FilterText += `&permissionFilter=${p_PermissionFilter[i].toString()}`
        }

        let v_Url = `${this.m_BaseURL}workgroups/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}&search=${p_Search}&archiveIncluded=${p_ArchiveIncluded}${v_FilterText}`;

        let v_Response = this.apiCache.httpGetCacheableResponse<Array<Workgroup>>(v_Url, { headers: v_Headers });
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }

    getPublicWorkgroups(
        p_Limit: number = 0,
        p_Offset: number = 0): Observable<Array<Workgroup>> {
        let v_Headers = this.getAuthHeaders();


        let v_Url = `${this.m_BaseURL}users/current/workgroups/public/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}&filter=${DescriptionFilter_T.formatted.toString()}`;

        let v_Response = this.apiCache.httpGetCacheableResponse<Array<Workgroup>>(v_Url, { headers: v_Headers });
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }

    updateWorkgroupImage(p_WorkgroupId: string, p_ImageArray: any): Observable<String> {
        let v_headers = new HttpHeaders()
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", ProdGenApi.userAccessKey);

        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkgroupId}/image/`;
        //let v_Body = JSON.stringify(p_ImageArray);
        let v_Body = p_ImageArray;

        this.apiCache.invalidateContaining(`workgroups`);
        let v_ContentItem = this.http.put<String>(v_Url, v_Body, { headers: v_headers });
        this.debugLog();
        return v_ContentItem;
    }

    SetWorkgroup(p_workgroup: Workgroup): Observable<Workgroup> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}workgroups/`;

        let v_workgroup = new WorkgroupPost();
        v_workgroup.name = p_workgroup.name as string;
        v_workgroup.formattedDescription = p_workgroup.description as string;
        v_workgroup.unformattedDescription = p_workgroup.description as string;
        v_workgroup.imageURL = p_workgroup.imageURL as string;
        v_workgroup.isPublic = p_workgroup.isPublic;
        v_workgroup.editorsDashboardAllowed = p_workgroup.editorsDashboardAllowed;
        v_workgroup.membersDashboardAllowed = p_workgroup.membersDashboardAllowed;
        v_workgroup.externalMembersDashboardAllowed = p_workgroup.externalMembersDashboardAllowed;
        v_workgroup.notifyContentAdded = p_workgroup.notifyContentAdded;
        v_workgroup.notifyContentRemoved = p_workgroup.notifyContentRemoved;
        v_workgroup.notifyContentModified = p_workgroup.notifyContentModified;
        v_workgroup.notifyUserAdded = p_workgroup.notifyUserAdded;
        v_workgroup.notifyUserRemoved = p_workgroup.notifyUserRemoved;
        v_workgroup.notifyUserExpiring = p_workgroup.notifyUserExpiring;
        v_workgroup.notifyCommentPosted = p_workgroup.notifyCommentPosted;
        v_workgroup.notifyArchivedRestored = p_workgroup.notifyArchivedRestored;
        let v_Body = JSON.stringify(v_workgroup);

        this.apiCache.invalidateContaining(`workgroups/`);

        let v_Workgroup = this.http.post<Workgroup>(v_Url, v_Body, { headers: v_Headers });

        this.debugLog();
        return v_Workgroup;
    }

    copyWorkgroup(p_WorkGroupID: string, p_Name: string): Observable<Workgroup> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkGroupID}`;

        this.apiCache.invalidateContaining(`workgroups/`);
        let v_Workgroup = this.http.post<Workgroup>(v_Url, `"${p_Name}"`, { headers: v_Headers });

        this.debugLog();
        return v_Workgroup;
    }

    GetWorkgroup(p_WorkgroupId: string,
        p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.none): Observable<Workgroup> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkgroupId}?descriptionFilter=${p_DescriptionFilter.toString()}`;

        let cacheOptions = new CacheOptions();
        // for now, this call will not be cached
        cacheOptions.useCache = false;

        let v_Response = this.apiCache.httpGetCacheableResponse<Workgroup>(v_Url, { headers: v_Headers }, cacheOptions);
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }

    UpdateWorkgroup(p_ID: string, p_Name: string, p_Description: string, p_ImageURL: string, p_IsPublic: boolean, p_EditorDashboardAllowed: boolean, p_MemberDashboardAllowed: boolean, p_ExternalDashboardAllowed: boolean, p_notifyContentAdded: boolean, p_notifyContentRemoved: boolean, p_notifyContentModified: boolean, p_notifyUserAdded: boolean, p_notifyUserRemoved: boolean, p_notifyUserExpiring: boolean, p_notifyCommentPosted: boolean, p_notifyArchivedRestored: boolean, p_membersTabEditorsAllowed: boolean, p_membersTabMembersAllowed: boolean, p_membersTabExternMembersAllowed: boolean, p_discussionEditorsAllowed: boolean, p_discussionMembersAllowed: boolean, p_discussionExternMembersAllowed: boolean): Observable<Workgroup> {
        let v_Headers = this.getAuthHeaders();

        var v_WorkgroupPut = new WorkgroupPut();
        v_WorkgroupPut.imageURL = p_ImageURL;
        v_WorkgroupPut.name = p_Name;
        v_WorkgroupPut.description = p_Description;
        v_WorkgroupPut.isPublic = p_IsPublic;
        v_WorkgroupPut.editorsDashboardAllowed = p_EditorDashboardAllowed;
        v_WorkgroupPut.membersDashboardAllowed = p_MemberDashboardAllowed;
        v_WorkgroupPut.externalMembersDashboardAllowed = p_ExternalDashboardAllowed;

        v_WorkgroupPut.membersTabEditorsAllowed = p_membersTabEditorsAllowed;
        v_WorkgroupPut.membersTabMembersAllowed = p_membersTabMembersAllowed;
        v_WorkgroupPut.membersTabExternMembersAllowed = p_membersTabExternMembersAllowed;
        v_WorkgroupPut.discussionEditorsAllowed = p_discussionEditorsAllowed;
        v_WorkgroupPut.discussionMembersAllowed = p_discussionMembersAllowed;
        v_WorkgroupPut.discussionExternMembersAllowed = p_discussionExternMembersAllowed;

        v_WorkgroupPut.notifyContentAdded = p_notifyContentAdded;
        v_WorkgroupPut.notifyContentRemoved = p_notifyContentRemoved;
        v_WorkgroupPut.notifyContentModified = p_notifyContentModified;
        v_WorkgroupPut.notifyUserAdded = p_notifyUserAdded;
        v_WorkgroupPut.notifyUserRemoved = p_notifyUserRemoved;
        v_WorkgroupPut.notifyUserExpiring = p_notifyUserExpiring;
        v_WorkgroupPut.notifyCommentPosted = p_notifyCommentPosted;
        v_WorkgroupPut.notifyArchivedRestored = p_notifyArchivedRestored;


        let v_Url = `${this.m_BaseURL}workgroups/${p_ID}`;

        this.apiCache.invalidateContaining("workgroups");

        let v_Workgroup = this.http.put<Workgroup>(v_Url, v_WorkgroupPut, { headers: v_Headers });

        this.debugLog();
        return v_Workgroup;
    }

    DeleteWorkgroup(p_WorkgroupId: String, archiveNotes: string): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkgroupId}/?notes=${archiveNotes}`;

        this.apiCache.invalidateContaining("workgroups");

        let response = this.http.delete<boolean>(v_Url, { headers: v_Headers });
        this.debugLog();
        return response;
    }

    RestoreWorkgroup(p_WorkgroupId: String): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkgroupId}/restore`;

        this.apiCache.invalidateContaining("workgroups");

        console.log("Sending it over...");
        let response = this.http.post<boolean>(v_Url, "", { headers: v_Headers });
        //this.http.put(v_Url, "", { headers: v_Headers });
        this.debugLog();
        console.log("response - " + response);
        return response;
    }

    getWorkgroupContentIndices(p_workgroupID: String, p_IndexType: IndexType_T = IndexType_T.defaultIndex): Observable<Array<WorkgroupContentIndex>> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}workgroups/${p_workgroupID}/content/index?indexType=${p_IndexType.toString()}`;
        let v_contentIndices = this.http.get<Array<WorkgroupContentIndex>>(v_url, { headers: v_headers });

        return v_contentIndices;
    }

    modifyWorkgroupContentIndices(p_workgroupID: String, p_newIndices: Array<WorkgroupContentIndex>): Observable<boolean> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}workgroups/${p_workgroupID}/content/index`;

        let v_body = JSON.stringify(p_newIndices);

        let result = this.http.put<boolean>(v_url, v_body, { headers: v_headers });
        return result;
    }

    GetWorkgroupContentItems(p_WorkgroupId: String,
        p_Limit: number = -1,
        p_Offset: number = 0,
        p_DescriptionFilter: DescriptionFilter_T = DescriptionFilter_T.unformatted,
        p_Search: string = ""): Observable<Array<Content>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkgroupId}/content/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}&search=${p_Search}&descriptionFilter=${p_DescriptionFilter.toString()}`;

        let v_ContentItems = this.http.get<Array<Content>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_ContentItems;
    }

    SetWorkgoupContentItem(p_WorkgroupId: String,
        p_ContentId: String,
        p_ContentType: ContentType_T): Observable<WorkgroupShareContent> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkgroupId}/content/`;

        let v_workgroupContentItem = new WorkgroupContentPost();
        v_workgroupContentItem.contentId = p_ContentId as string;
        v_workgroupContentItem.contentType = p_ContentType;

        let v_Body = JSON.stringify(v_workgroupContentItem);

        let v_ContentItems = this.http.post<WorkgroupShareContent>(v_Url, v_Body, { headers: v_Headers });

        this.debugLog();
        return v_ContentItems;
    }

    DeleteWorkgoupContentItem(p_WorkgroupId: String,
        p_ContentId: String): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkgroupId}/content/${p_ContentId}`;

        let v_ContentItems = this.http.delete<boolean>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_ContentItems;
    }

    GetWorkgroupMembers(p_WorkgroupId: String,
        p_Limit: number = -1,
        p_Offset: number = 0): Observable<Array<WorkgroupMember>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkgroupId}/members/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}`;

        let v_Users = this.http.get<Array<WorkgroupMember>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Users;
    }

    getWorkgroupRoles(p_WorkgroupId: String,
        p_Limit: number = -1,
        p_Offset: number = 0): Observable<Array<WorkgroupRole>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkgroupId}/roles/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}`;

        let v_Users = this.http.get<Array<WorkgroupRole>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Users;
    }

    SetWorkgoupMember(p_WorkgroupId: String,
        p_UserId: String,
        p_PermissionLevel: PermissionLevel_T): Observable<WorkgroupMember[]> {
        let v_Headers = this.getAuthHeaders();

        let users: Array<WorkgroupMemberPost> = new Array<WorkgroupMemberPost>();

        users.push({ id: p_UserId as string, permissionLevel: p_PermissionLevel });

        let body: string = JSON.stringify(users);

        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkgroupId}/members/`;
        this.apiCache.invalidateContaining("workgroups/");

        let v_User = this.http.post<WorkgroupMember[]>(v_Url, body, { headers: v_Headers });

        this.debugLog();
        return v_User;
    }

    setWorkgoupMembers(p_WorkgroupId: String,
        p_UserIds: Array<String>,
        p_PermissionLevel: PermissionLevel_T): Observable<WorkgroupMember[]> {
        let v_Headers = this.getAuthHeaders();

        let users: Array<WorkgroupMemberPost> = new Array<WorkgroupMemberPost>();

        for (var i = 0; i < p_UserIds.length; i++) {
            users.push({ id: p_UserIds[i] as string, permissionLevel: p_PermissionLevel });
        }

        let body: string = JSON.stringify(users);

        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkgroupId}/members/`;
        this.apiCache.invalidateContaining("workgroups/");

        let v_User = this.http.post<WorkgroupMember[]>(v_Url, body, { headers: v_Headers });

        this.debugLog();
        return v_User;
    }

    updateWorkgoupMembers(p_WorkgroupId: String,
        p_UserId: String,
        p_PermissionLevel: PermissionLevel_T): Observable<boolean> {

        let v_Headers = this.getAuthHeaders();

        let user: WorkgroupMemberPut = new WorkgroupMemberPut();

        user.permissionLevel = p_PermissionLevel;

        let body: string = JSON.stringify(user);

        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkgroupId}/members/${p_UserId}`;

        let v_User = this.http.put<boolean>(v_Url, body, { headers: v_Headers });

        this.debugLog();
        return v_User;
    }

    setWorkgoupRoles(p_WorkgroupId: String,
        p_RoleIds: Array<String>,
        p_PermissionLevel: PermissionLevel_T): Observable<WorkgroupMember[]> {
        let v_Headers = this.getAuthHeaders();

        let roles: Array<WorkgroupRolePost> = new Array<WorkgroupRolePost>();

        for (var i = 0; i < p_RoleIds.length; i++) {
            roles.push({ id: p_RoleIds[i] as string, permissionLevel: p_PermissionLevel });
        }

        let body: string = JSON.stringify(roles);

        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkgroupId}/roles/`;
        this.apiCache.invalidateContaining("workgroups/");

        let v_User = this.http.post<WorkgroupMember[]>(v_Url, body, { headers: v_Headers });

        this.debugLog();
        return v_User;
    }

    updateWorkgroupRole(p_WorkgroupId: String,
        p_RoleId: String,
        p_PermissionLevel: PermissionLevel_T): Observable<boolean> {

        let v_Headers = this.getAuthHeaders();

        let role: WorkgroupRolePut = new WorkgroupRolePut();

        role.permissionLevel = p_PermissionLevel;

        let body: string = JSON.stringify(role);

        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkgroupId}/roles/${p_RoleId}`;

        let v_User = this.http.put<boolean>(v_Url, body, { headers: v_Headers });

        this.debugLog();
        return v_User;
    }

    DeleteWorkgoupMember(p_WorkgroupId: String,
        p_UserId: String): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkgroupId}/members/${p_UserId}`;

        this.apiCache.invalidateContaining("workgroups/");
        let v_ContentItems = this.http.delete<boolean>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_ContentItems;
    }

    DeleteWorkgoupRole(p_WorkgroupId: String,
        p_RoleId: String): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkgroupId}/roles/${p_RoleId}`;

        let v_ContentItems = this.http.delete<boolean>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_ContentItems;
    }

    GetWorkgroupExternalGroups(p_WorkgroupId: string): Observable<Array<WorkgroupExternalGroup>> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkgroupId}/externalGroups/`;

        let v_Users = this.http.get<Array<WorkgroupExternalGroup>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Users;
    }

    DeleteExternalWorkgroup(p_WorkgroupId: string, p_ExternalGroupId: string): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkgroupId}/externalGroups/${p_ExternalGroupId}`;

        this.apiCache.invalidateContaining("workgroups/");

        let v_ContentItems = this.http.delete<boolean>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_ContentItems;
    }


    DeleteExternalWorkgroupMember(p_WorkgroupId: string, p_ExternalGroupId: string, p_UserID: string): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkgroupId}/externalGroups/${p_ExternalGroupId}/members/${p_UserID}`;

        let v_ContentItems = this.http.delete<boolean>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_ContentItems;
    }

    SetExternalWorkgoupAndMember(p_WorkgroupId: String,
        p_Email: string,
        p_DisplayName: string, p_IsManager: boolean, p_ExternalGroupName: string, p_InvitesAllowed: number,
        p_MembershipExpires: boolean, p_ExpirationDate: string): Observable<WorkgroupExternalMembers[]> {
        let v_Headers = this.getAuthHeaders();

        let users: Array<WorkgroupExternalGroupAndMemberPost> = new Array<WorkgroupExternalGroupAndMemberPost>();

        users.push({ email: p_Email, isManager: p_IsManager, displayName: p_DisplayName, groupName: p_ExternalGroupName, imageURL: "", invitesAllowed: p_InvitesAllowed, membershipExpires: p_MembershipExpires, expirationDate: p_ExpirationDate });

        let body: string = JSON.stringify(users);

        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkgroupId}/externalGroups/members/`;

        let v_User = this.http.post<WorkgroupExternalMembers[]>(v_Url, body, { headers: v_Headers });

        this.debugLog();
        return v_User;
    }

    SetExternalWorkgoupMember(p_WorkgroupId: String,
        p_Email: String,
        p_ExternalGroupID: string, p_IsManager: boolean): Observable<WorkgroupExternalMembers[]> {
        let v_Headers = this.getAuthHeaders();

        let users: Array<WorkgroupExternalMemberPost> = new Array<WorkgroupExternalMemberPost>();

        users.push({ email: p_Email as string, isManager: p_IsManager });

        let body: string = JSON.stringify(users);

        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkgroupId}/externalGroups/${p_ExternalGroupID}/members/`;

        let v_User = this.http.post<WorkgroupExternalMembers[]>(v_Url, body, { headers: v_Headers });

        this.debugLog();
        return v_User;
    }

    UpdateExternalWorkgoupMember(p_WorkgroupId: String,
        p_UserID: string,
        p_ExternalGroupID: string, p_IsManager: boolean, p_InvitesAllowed: number,
        p_membershipExpires: boolean, p_expirationDate: string): Observable<WorkgroupExternalMembers[]> {
        let v_Headers = this.getAuthHeaders();

        let user: WorkgroupExternalMemberPut = new WorkgroupExternalMemberPut();

        user.invitesAllowed = p_InvitesAllowed;
        user.isManager = p_IsManager
        user.membershipExpires = p_membershipExpires;
        user.expirationDate = p_expirationDate;

        let body: string = JSON.stringify(user);

        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkgroupId}/externalGroups/${p_ExternalGroupID}/members/${p_UserID}`;

        let v_User = this.http.put<WorkgroupExternalMembers[]>(v_Url, body, { headers: v_Headers });

        this.debugLog();
        return v_User;
    }

    ResendExternalWorkgoupMemberInvite(p_WorkgroupId: String,
        p_UserID: string,
        p_ExternalGroupID: string): Observable<WorkgroupExternalMembers[]> {
        let v_Headers = this.getAuthHeaders();




        let body: string = "";

        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkgroupId}/externalGroups/${p_ExternalGroupID}/members/${p_UserID}/resendInvite`;

        let v_User = this.http.put<WorkgroupExternalMembers[]>(v_Url, body, { headers: v_Headers });

        this.debugLog();
        return v_User;
    }

    SetExternalWorkgoup(p_WorkgroupId: String,
        p_Name: string,
        p_Multimember: boolean): Observable<WorkgroupExternalGroup> {
        let v_Headers = this.getAuthHeaders();

        let group: WorkgroupExternalGroupPost = new WorkgroupExternalGroupPost();

        group.name = p_Name;
        group.multimember = p_Multimember;

        let body: string = JSON.stringify(group);

        let v_Url = `${this.m_BaseURL}workgroups/${p_WorkgroupId}/externalGroups/`;

        let v_Group = this.http.post<WorkgroupExternalGroup>(v_Url, body, { headers: v_Headers });

        this.debugLog();
        return v_Group;
    }

    GetExternalWorkgroupSummary(): Observable<WorkgroupExternalSummary> {
        let v_Headers = this.getAuthHeaders();



        let v_Url = `${this.m_BaseURL}workgroups/externalGroups/summary`;

        let v_Summary = this.http.get<WorkgroupExternalSummary>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Summary;
    }

    GetWorkgroupExternalinvite(p_workgroupID: string): Observable<Workgroup> {

        let v_Headers = this.getSpecialAccessHeaders();

        let v_res = this.http.get<Workgroup>(`${this.m_BaseURL}workgroups/${p_workgroupID}/externalinvite`, { headers: v_Headers });
        this.debugLog();
        return v_res;
    }

    AcceptWorkgroupExternalinvite(p_workgroupID: string, email: string): Observable<WorkgroupExternalInviteAcceptance> {
        let v_Headers = this.getSpecialAccessHeaders();

        let v_Url = `${this.m_BaseURL}workgroups/${p_workgroupID}/externalinvite/accept?email=${email}`;

        let v_res = this.http.put<WorkgroupExternalInviteAcceptance>(v_Url, "", { headers: v_Headers });
        this.debugLog();
        return v_res;
    }


    IsExistingUser(p_Email: string): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();



        let v_Url = `${this.m_BaseURL}users/userExists?email=${p_Email}`;

        let v_User = this.http.get<boolean>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_User;
    }


    SetNotification(
        p_NotificationTitle: string,
        p_NotificationText: string,
        p_ImageURL: string,
        p_LinkURL: string,
        p_UserIDs: Array<string>,
        p_useGroups: boolean = false): Observable<Notification> {
        let v_Headers = this.getAuthHeaders();

        let v_PostObj = new NotificationPost();
        v_PostObj.text = p_NotificationText;
        v_PostObj.title = p_NotificationTitle;
        v_PostObj.imageUrl = p_ImageURL;
        v_PostObj.linkUrl = p_LinkURL;
        v_PostObj.users = p_UserIDs;
        v_PostObj.useGroups = p_useGroups;

        let v_PostText = JSON.stringify(v_PostObj);

        let v_Url = `${this.m_BaseURL}notifications/`;

        let v_Notifications = this.http.post<Notification>(v_Url, v_PostText, { headers: v_Headers });

        this.debugLog();
        return v_Notifications;
    }


    //

    markNotificationsAsRead(notifications: Array<string>): Observable<void> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}notifications/markAsRead`;
        let body: string = JSON.stringify(notifications);

        let v_Notifications = this.http.put<void>(v_Url, body, { headers: v_Headers });

        this.debugLog();
        return v_Notifications;
    }


    GetEnrollments(p_Limit: number = -1,
        p_Offset: number = 0,
        p_EnrollmentFilter: EnrollmentFilter_T[] = [EnrollmentFilter_T.assigned, EnrollmentFilter_T.inProgress]): Observable<Array<Enrollment>> {
        let v_Headers = this.getAuthHeaders();

        let v_FilterText = "";
        let i = 0;
        for (i = 0; i < p_EnrollmentFilter.length; i++) {
            v_FilterText += `&enrollmentFilter=${p_EnrollmentFilter[i].toString()}`
        }

        let v_Url = `${this.m_BaseURL}users/current/enrollments/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}${v_FilterText}`;

        let v_Response = this.apiCache.httpGetCacheableResponse<Array<Enrollment>>(v_Url, { headers: v_Headers });
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }

    GetSkillsGapItems(enrollmentId: string): Observable<Array<string>> {
        let v_Headers = this.getAuthHeaders();


        let v_Url = `${this.m_BaseURL}enrollments/${enrollmentId}/skillsGapItems`;

        let v_Gaps = this.http.get<Array<string>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Gaps;
    }

    SetEnrollments(p_CourseId: string,
        p_UserId: string,
        p_HasDueDate: boolean,
        p_DueDate: Date): Observable<Array<Enrollment>> {

        let v_PostObj: EnrollmentPost = new EnrollmentPost();
        v_PostObj.courseId = p_CourseId;
        v_PostObj.userId = p_UserId;
        v_PostObj.hasDueDate = p_HasDueDate;
        v_PostObj.dueDate = p_DueDate;

        let v_PostText = JSON.stringify(v_PostObj);

        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}enrollments/`;

        this.apiCache.invalidateContaining("enrollments");

        let v_Enrollments = this.http.post<Array<Enrollment>>(v_Url, v_PostText, { headers: v_Headers });

        this.debugLog();
        return v_Enrollments;
    }

    GetEnrollment(p_EnrollmentId: string): Observable<Enrollment> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}enrollments/${p_EnrollmentId}`;
        let v_Enrollment = this.http.get<Enrollment>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Enrollment;
    }

    completeEnrollment(p_EnrollmentId: string): Observable<Enrollment> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}enrollments/${p_EnrollmentId}`;
        this.apiCache.invalidateContaining("enrollments");
        let v_Enrollment = this.http.put<Enrollment>(v_Url, "", { headers: v_Headers });

        this.debugLog();
        return v_Enrollment;
    }

    GetEnrollmentTrackingItems(p_EnrollmentId: string): Observable<Array<EnrollmentTrackingItem>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}enrollments/${p_EnrollmentId}/trackingItems`;
        let v_EnrollmentItems = this.http.get<Array<EnrollmentTrackingItem>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_EnrollmentItems;
    }

    SetEnrollmentTracking(p_EnrollmentId: string,
        p_ContentId: string,
        p_ContentType: ContentType_T,
        p_IsComplete: boolean,
        p_StartTime: Date,
        p_EndTime: Date): Observable<EnrollmentTrackingItem> {
        let v_Headers = this.getAuthHeaders();
        let v_PostObj: EnrollmentTrackingItemPost = new EnrollmentTrackingItemPost();
        v_PostObj.contentId = p_ContentId;
        v_PostObj.contentType = p_ContentType;
        v_PostObj.isComplete = p_IsComplete;
        v_PostObj.startDate = p_StartTime;
        v_PostObj.endDate = p_EndTime;

        let v_PostText = JSON.stringify(v_PostObj);

        let v_Url = `${this.m_BaseURL}enrollments/${p_EnrollmentId}/trackingItems/`;

        this.apiCache.invalidateContaining(`${this.m_BaseURL}enrollments/${p_EnrollmentId}`);

        let v_Enrollments = this.http.post<EnrollmentTrackingItem>(v_Url, v_PostText, { headers: v_Headers });

        this.debugLog();
        return v_Enrollments;
    }

    //Adding QuizSessionItem for new Quiz enhancement tracking. But, since there's multiple
    //QuizTrackingItem data in this method, the object itself, QuizTrackingItem, could be sent instead
    //possibly moving forward...
    SetQuizEnrollmentTracking(p_EnrollmentId: string,
        p_ContentId: string,
        p_QuizAnswersCorrect: number,
        p_StartTime: Date,
        p_EndTime: Date,
        p_QTItem: QuizSession): Observable<GetEnrollmentQuizTrackingItemResponse> {
        let v_Headers = this.getAuthHeaders();

        let v_PostObj: EnrollmentQuizTrackingItemPost = new EnrollmentQuizTrackingItemPost();
        v_PostObj.contentId = p_ContentId;
        v_PostObj.quizAnswersCorrect = p_QuizAnswersCorrect;
        v_PostObj.isComplete = true;
        v_PostObj.startDate = p_StartTime;
        v_PostObj.endDate = p_EndTime;
        v_PostObj.quizSessionItem = p_QTItem;

        let v_PostText = JSON.stringify(v_PostObj);


        let v_Url = `${this.m_BaseURL}enrollments/${p_EnrollmentId}/quizTrackingItems/`;

        this.apiCache.invalidateContaining(`${this.m_BaseURL}enrollments/${p_EnrollmentId}`);

        let v_QuizTrackingItem = this.http.post<GetEnrollmentQuizTrackingItemResponse>(v_Url, v_PostText, { headers: v_Headers });

        this.debugLog();
        return v_QuizTrackingItem;
    }

    GetQuizEnrollmentTracking(p_EnrollmentId: string,
        p_QuizID: string): Observable<GetEnrollmentQuizTrackingItemResponse> {
        let v_Headers = this.getAuthHeaders()
            .append("quizID", p_QuizID);

        let v_Url = `${this.m_BaseURL}enrollments/${p_EnrollmentId}/quizTrackingItems/${p_QuizID}`;
        let v_QuizTrackingItem = this.http.get<GetEnrollmentQuizTrackingItemResponse>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_QuizTrackingItem;
    }

    getAllQuizEnrollmentTracking(p_enrollmentID: string): Observable<Array<GetEnrollmentQuizTrackingItemResponse>> {
        let v_headers = this.getAuthHeaders();

        let v_url = `${this.m_BaseURL}enrollments/${p_enrollmentID}/quizTrackingItems`;
        let v_result = this.http.get<Array<GetEnrollmentQuizTrackingItemResponse>>(v_url, { headers: v_headers });

        return v_result;
    }

    SetVideoEnrollmentTracking(p_EnrollmentId: string,
        p_ContentId: string,
        p_LastVideoPosition: number,
        p_StartTime: Date,
        p_EndTime: Date,
        p_markcompleted: boolean,
        p_VideoLength): Observable<VideoTrackingItem> {

        let v_Headers = this.getAuthHeaders();
        let v_PostObj: EnrollmentVideoTrackingItemPost = new EnrollmentVideoTrackingItemPost();
        v_PostObj.contentId = p_ContentId;
        v_PostObj.lastVideoPosition = Math.floor(p_LastVideoPosition);
        v_PostObj.isComplete = p_markcompleted;
        v_PostObj.startDate = p_StartTime;
        v_PostObj.endDate = p_EndTime;
        v_PostObj.vidLength = Math.floor(p_VideoLength);

        let v_PostText = JSON.stringify(v_PostObj);

        let v_Url = `${this.m_BaseURL}enrollments/${p_EnrollmentId}/videoTrackingItems/`;

        this.apiCache.invalidateContaining(`${this.m_BaseURL}enrollments/${p_EnrollmentId}`);
        let v_VideoTrackingItem = this.http.post<VideoTrackingItem>(v_Url, v_PostText, { headers: v_Headers });

        this.debugLog();
        return v_VideoTrackingItem;
    }

    SetQuizSessionData(p_SesItm: QuizSession): Observable<string> {
        let v_Headers = this.getAuthHeaders();
        let v_Post = p_SesItm;
        let v_PostData = JSON.stringify(v_Post);

        let v_Url = `${this.m_BaseURL}enrollments/history/quizSessionData/`;

        let v_sesId = this.http.post<string>(v_Url, v_PostData, { headers: v_Headers });
        return v_sesId;
    }

    SetQuizSessionAnswer(qidx: number, p_SesItem: QuizSession): Observable<string> {
        let v_Headers = this.getAuthHeaders();
        let v_Post = p_SesItem;
        let v_PostData = JSON.stringify(v_Post);

        let v_Url = `${this.m_BaseURL}enrollments/history/quizSessionData/answer/${qidx}`;

        let v_Qsi = this.http.post<string>(v_Url, v_PostData, { headers: v_Headers });
        return v_Qsi;
    }

    GetVideoEnrollmentTracking(p_EnrollmentId: string,
        p_VideoID: string): Observable<VideoTrackingItem> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}enrollments/${p_EnrollmentId}/videoTrackingItems/${p_VideoID}`;
        let v_QuizTrackingItem = this.http.get<VideoTrackingItem>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_QuizTrackingItem;
    }



    GetCurrentOrganization(): Observable<Organization> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}organizations/current/`;
        let v_Organization = this.http.get<Organization>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Organization;
    }

    GetCurrentOrganizationTenants(): Observable<Array<Tenant>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}organizations/current/tenants/`;
        let v_Tenants = this.http.get<Array<Tenant>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Tenants;
    }

    GetCurrentTenant(): Observable<Tenant> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}organizations/current/tenants/current/`;

        let cacheOptions = new CacheOptions();
        cacheOptions.cacheLocation = CacheLocation.sessionStorage;
        cacheOptions.maxAge = 60;

        let v_Response = this.apiCache.httpGetCacheableResponse<Tenant>(v_Url, { headers: v_Headers }, cacheOptions);
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }

    GetTenantFromAccessKey(accessKey: string): Observable<Tenant> {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' })
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", accessKey);

        let v_Url = `${this.m_BaseURL}organizations/current/tenants/current/`;
        let v_Tenants = this.http.get<Tenant>(v_Url, { headers: headers });

        this.debugLog();
        return v_Tenants;
    }

    getCurrentTenantTrendingContent(
        p_Limit: number = -1,
        p_Offset: number = 0): Observable<Array<Content>> {
        let v_Headers = this.getAuthHeaders();

        let v_FilterText = "";
        let i = 0;

        let v_Url = `${this.m_BaseURL}organizations/current/tenants/current/trendingcontent/?limit=${p_Limit.toString()}&offset=${p_Offset.toString()}${v_FilterText}`;

        let cacheOptions: CacheOptions = new CacheOptions();
        cacheOptions.cacheLocation = CacheLocation.localStorage;
        cacheOptions.maxAge = 60;


        let v_Response = this.apiCache.httpGetCacheableResponse<Array<Content>>(v_Url, { headers: v_Headers }, cacheOptions);
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }
    GetCurrentTenantCategories(
        p_Limit: number = -1,
        p_Offset: number = 0,
        p_Search: string): Observable<Array<Category>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}organizations/current/tenants/current/categories/`;
        let v_Categories = this.http.get<Array<Category>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Categories;
    }

    GetCurrentTenantSettings(): Observable<Array<Setting>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}organizations/current/tenants/current/settings`;
        let cacheOptions: CacheOptions = new CacheOptions();
        cacheOptions.cacheLocation = CacheLocation.sessionStorage;
        cacheOptions.maxAge = 60;


        let v_Response = this.apiCache.httpGetCacheableResponse<Array<Setting>>(v_Url, { headers: v_Headers }, cacheOptions);
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }
    GetCurrentTenantThemeSettingAtLogin(p_TenantID: string, userEmail: string): Observable<Theme> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}organizations/current/tenants/current/settings/login?tenantid=${p_TenantID.toString()}&userEmail=${userEmail}`;
        let v_Settings = this.http.get<Theme>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Settings;
    }

    GetCurrentTenantSettingsWithKey(p_AccessKey: string): Observable<Array<Setting>> {
        //let v_Headers = this.getAuthHeaders();

        let v_Headers = new HttpHeaders({ 'Content-Type': 'application/json' })
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", p_AccessKey);

        let v_Url = `${this.m_BaseURL}organizations/current/tenants/current/settings`;
        let v_Settings = this.http.get<Array<Setting>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Settings;
    }

    SetCurrentTenantSettingsWithKey(p_AccessKey: string, setting: UserSettingPost): Observable<Array<Setting>> {
        //let v_Headers = this.getAuthHeaders();

        let v_Headers = new HttpHeaders({ 'Content-Type': 'application/json' })
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", p_AccessKey);

        let v_Url = `${this.m_BaseURL}organizations/current/tenants/current/settings`;

        this.apiCache.invalidateContaining("/settings");
        if (setting.settingName.toLowerCase().indexOf('_layout') != -1) {
            this.apiCache.invalidateContaining("/users/uiLayout/current");
        }
        let v_Settings = this.http.post<Array<Setting>>(v_Url, setting, { headers: v_Headers });

        return v_Settings;
    }

    GetCurrentTenantNews(): Observable<Array<CompanyNewsItem>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}organizations/current/tenants/current/companynews`;
        let cacheOptions: CacheOptions = new CacheOptions();
        cacheOptions.cacheLocation = CacheLocation.sessionStorage;
        cacheOptions.maxAge = 60;


        let v_Response = this.apiCache.httpGetCacheableResponse<Array<CompanyNewsItem>>(v_Url, { headers: v_Headers }, cacheOptions);
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }
    AddEditCurrentTenantNews(newsitem: CompanyNewsItem): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();
        let v_Body = newsitem;
        let v_Url = `${this.m_BaseURL}organizations/current/tenants/current/companynews`;
        this.apiCache.invalidateContaining("/companynews");
        let v_News = this.http.post<boolean>(v_Url, v_Body, { headers: v_Headers });

        return v_News;
    }

    DeleteNewsItem(newsitemid: string, type: string): Observable<void> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = "";
        if (type == "company") {
            v_Url = `${this.m_BaseURL}organizations/current/tenants/current/companynews/delete/${newsitemid.toString()}`;
            this.apiCache.invalidateContaining("/companynews");
        }
        else if (type == "partner" || type == "lite") {
            v_Url = `${this.m_BaseURL}partners/news/delete/${newsitemid.toString()}`;
            this.apiCache.invalidateContaining("partners/news");

        }

        let v_News = this.http.delete<void>(v_Url, { headers: v_Headers });

        return v_News;
    }

    GetCurrentTenantPinnacleLiteSetting(): Observable<PinnacleLiteSettings> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}organizations/current/tenants/current/pinnaclelite`;
        let v_Settings = this.http.get<PinnacleLiteSettings>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Settings;
    }


    GetCanPartnerSellPinnacleLite(): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}partners/partnerOnly/pinnacleLiteReseller`;
        let v_CanSell = this.http.get<boolean>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_CanSell;
    }

    GetPartner(p_PartnerId: String): Observable<Partner> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}partners/${p_PartnerId}`;
        let v_Partner = this.http.get<Partner>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Partner;
    }

    GetCurrentPartner(): Observable<Partner> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}partners/current`;
        let v_Partner = this.http.get<Partner>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Partner;
    }

    GetPartnerSettings(): Observable<Array<Setting>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}partners/settings/`;
        let v_PartnerSettings = this.http.get<Array<Setting>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_PartnerSettings;
    }

    SetCurrentPartnerSettingsWithKey(p_AccessKey: string, setting: UserSettingPost): Observable<Array<Setting>> {
        //let v_Headers = this.getAuthHeaders();

        let v_Headers = new HttpHeaders({ 'Content-Type': 'application/json' })
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", p_AccessKey);

        let v_Url = `${this.m_BaseURL}partners/set/settings`;
        let v_Settings = this.http.post<Array<Setting>>(v_Url, setting, { headers: v_Headers });

        return v_Settings;
    }

    GetPartnerNewsItems(): Observable<Array<PartnerNewsItem>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}partners/news/`;

        let cacheOptions: CacheOptions = new CacheOptions();
        cacheOptions.cacheLocation = CacheLocation.sessionStorage;
        cacheOptions.maxAge = 60;


        let v_Response = this.apiCache.httpGetCacheableResponse<Array<PartnerNewsItem>>(v_Url, { headers: v_Headers }, cacheOptions);
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }

    GetLiteNewsItems(): Observable<Array<PartnerNewsItem>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}partners/newslite/`;
        let cacheOptions: CacheOptions = new CacheOptions();
        cacheOptions.cacheLocation = CacheLocation.sessionStorage;
        cacheOptions.maxAge = 60;


        let v_Response = this.apiCache.httpGetCacheableResponse<Array<PartnerNewsItem>>(v_Url, { headers: v_Headers }, cacheOptions);
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }

    addPinnacleLiteUser(userName: string, userEmail: string, isAdmin: boolean): Observable<PinnacleLiteUser> {
        let v_Headers = this.getAuthHeaders();
        let v_PostObj: PinnacleLiteUser = new PinnacleLiteUser();
        v_PostObj.userId = ProdGenApi.EMPTY_GUID;
        v_PostObj.userName = userName;
        v_PostObj.userEmail = userEmail;
        v_PostObj.isAdmin = isAdmin;

        let v_PostText = JSON.stringify(v_PostObj);

        let v_Url = `${this.m_BaseURL}users/pinnacleliteuser/`;
        let v_ReturnItem = this.http.post<PinnacleLiteUser>(v_Url, v_PostText, { headers: v_Headers });

        this.debugLog();
        return v_ReturnItem;

    }

    modifyPinnacleLiteUser(userId: string, userName: string, userEmail: string, isAdmin: boolean): Observable<PinnacleLiteUser> {
        let v_Headers = this.getAuthHeaders();
        let v_PutObj: PinnacleLiteUser = new PinnacleLiteUser();
        v_PutObj.userId = userId;
        v_PutObj.userName = userName;
        v_PutObj.userEmail = userEmail;
        v_PutObj.isAdmin = isAdmin;

        let v_PutText = JSON.stringify(v_PutObj);

        let v_Url = `${this.m_BaseURL}users/pinnacleliteuser/`;
        let v_ReturnItem = this.http.put<PinnacleLiteUser>(v_Url, v_PutText, { headers: v_Headers });

        this.debugLog();
        return v_ReturnItem;

    }

    deletePinnacleLiteUser(userId: string): Observable<void> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}users/pinnacleliteuser/${userId}`;
        let v_Response = this.http.delete<void>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_Response;

    }

    sendEmailToPinnacleLiteUser(userId: string): Observable<void> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}users/pinnacleliteuser/${userId}/sendemail`;
        let v_ReturnItem = this.http.post<void>(v_Url, "", { headers: v_Headers });

        this.debugLog();
        return v_ReturnItem;

    }

    AddEditCurrentPartnerNews(newsitem: PartnerNewsItem): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();
        let v_Body = newsitem;
        let v_Url = `${this.m_BaseURL}partners/news/add`;

        this.apiCache.invalidateContaining("partners/news");
        let v_News = this.http.post<boolean>(v_Url, v_Body, { headers: v_Headers });

        return v_News;
    }

    AddEditCurrentLiteNews(newsitem: PartnerNewsItem): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();
        let v_Body = newsitem;
        let v_Url = `${this.m_BaseURL}partners/litenews/add`;

        this.apiCache.invalidateContaining("partners/litenews");
        let v_News = this.http.post<boolean>(v_Url, v_Body, { headers: v_Headers });

        return v_News;
    }

    // requires that caller is a valid user of the partner
    // creates org, tenant and user
    addCustomerAccount(accountName: string, adminName: string, adminEmail: string, isPinnacleLite: boolean, maxPinnacleLiteUsers: number): Observable<Organization> {
        let v_Headers = this.getAuthHeaders();

        let v_PostObj: AccountPost = new AccountPost();
        v_PostObj.companyName = accountName;
        v_PostObj.userDisplayName = adminName;
        v_PostObj.userEmail = adminEmail;
        v_PostObj.isPinnacleLite = isPinnacleLite;
        v_PostObj.maxPinnacleLiteUsers = maxPinnacleLiteUsers;

        let v_PostText = JSON.stringify(v_PostObj);

        let v_Url = `${this.m_BaseURL}partners/accounts/`;
        let v_ReturnItem = this.http.post<Organization>(v_Url, v_PostText, { headers: v_Headers });

        this.debugLog();
        return v_ReturnItem;
    }

    addCustomerTenant(orgId: number, tenantName: string, adminEmail: string, isPinnacleLite: boolean): Observable<Tenant> {
        let v_Headers = this.getAuthHeaders();

        let v_PostObj: TenantPost = new TenantPost();
        v_PostObj.adminEmail = adminEmail;
        v_PostObj.isPinnacleLite = isPinnacleLite;
        v_PostObj.tenantName = tenantName;

        let v_PostText = JSON.stringify(v_PostObj);

        let v_Url = `${this.m_BaseURL}partners/accounts/${orgId}/tenants/`;
        let v_ReturnItem = this.http.post<Tenant>(v_Url, v_PostText, { headers: v_Headers });

        this.debugLog();
        return v_ReturnItem;
    }


    // create an order request for the partner
    // requires that caller is a valid user of the partner
    createUpgradeOrderRequest(orgId: number,
        tenantId: string,
        upgradePlatform: boolean,
        poNumber: string,
        subToAdd: Array<TenantSubscription>
    ): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();

        let v_PostObj: UpgradeOrderRequestPost = new UpgradeOrderRequestPost();

        v_PostObj.orgId = orgId;
        v_PostObj.tenantId = tenantId;
        v_PostObj.upgradePlatform = upgradePlatform;
        v_PostObj.poNumber = poNumber;
        v_PostObj.additionalSubscriptions = new Array<SubscriptionPost>();

        for (let s of subToAdd) {
            let s1 = new SubscriptionPost();
            s1.isTrial = false;
            s1.licenseCountCertifiedByEmail = "";
            s1.licenseCountCertifiedByName = "";
            s1.liscenseCount = s.quantity;
            s1.partnerSubscriptionID = s.subscriptionID;
            s1.subscriptionExpiration = s.expirationDate;
            s1.subscriptionUnlimitedUseExpiration = s.unlimitedExpirationDate;

            v_PostObj.additionalSubscriptions.push(s1);

        }

        let v_PostText = JSON.stringify(v_PostObj);

        let v_Url = `${this.m_BaseURL}partners/accounts/${orgId}/tenants/${tenantId}/upgradeRequest/`;
        let v_ReturnItem = this.http.post<boolean>(v_Url, v_PostText, { headers: v_Headers });

        this.debugLog();
        return v_ReturnItem;


    }

    // requires that caller is a valid user of the partner
    addCustomerTenantSubscription(orgId: number,
        tenantId: string,
        subId: string,
        licenseCount: number,
        licenseCertEmail: string,
        licenseCertName: string,
        expiration: Date): Observable<TenantSubscription> {

        let v_Headers = this.getAuthHeaders();

        let v_PostObj: SubscriptionPost = new SubscriptionPost();
        v_PostObj.isTrial = false;
        v_PostObj.licenseCountCertifiedByEmail = licenseCertEmail;
        v_PostObj.licenseCountCertifiedByName = licenseCertName;
        v_PostObj.liscenseCount = licenseCount;
        v_PostObj.partnerSubscriptionID = subId;
        v_PostObj.subscriptionExpiration = expiration;
        v_PostObj.subscriptionUnlimitedUseExpiration = expiration;

        let v_PostText = JSON.stringify(v_PostObj);

        let v_Url = `${this.m_BaseURL}partners/accounts/${orgId}/tenants/${tenantId}/subscriptions/`;
        let v_ReturnItem = this.http.post<TenantSubscription>(v_Url, v_PostText, { headers: v_Headers });

        this.debugLog();
        return v_ReturnItem;
    }

    // requires that caller is a valid user of the partner
    updateCustomerAltId(orgId: number, altId: string): Observable<void> {
        let v_Headers = this.getAuthHeaders();
        let v_PostText = JSON.stringify(altId);
        let v_Url = `${this.m_BaseURL}partners/accounts/${orgId}/AltID/`;
        let v_ReturnItem = this.http.put<void>(v_Url, v_PostText, { headers: v_Headers });

        this.debugLog();
        return v_ReturnItem;
    }

    getMaxTenantPinnacleLiteUsersAllowed(): Observable<number> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}users/pinnacleliteuser/maxallowed`;
        let allowed = this.http.get<number>(v_Url, { headers: v_Headers });

        this.debugLog();
        return allowed;

    }

    // requires that caller is a valid user of the partner
    getPartnerSubscriptions(): Observable<Array<Subscription>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}partners/subscriptions/`;
        let v_Subscriptions = this.http.get<Array<Subscription>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Subscriptions;
    }

    // requires that caller is a valid user of the partner
    getPartnerAccountTenants(accountOrgID: string): Observable<Array<Tenant>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}partners/accounts/${accountOrgID}/tenants/`;
        let v_Tenants = this.http.get<Array<Tenant>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Tenants;
    }

    updatePartnerAccountTenant(accountOrgID: string, tenantID: string, name: string, maxPinnacleLiteUsers: number): Observable<Tenant> {
        let v_Headers = this.getAuthHeaders();
        let v_PostObj = new TenantPut();
        v_PostObj.tenantName = name;
        v_PostObj.maxPinnacleLiteUsers = maxPinnacleLiteUsers;
        let v_PostText = JSON.stringify(v_PostObj);
        let v_Url = `${this.m_BaseURL}partners/accounts/${accountOrgID}/tenants/${tenantID}`;
        let v_Tenants = this.http.put<Tenant>(v_Url, v_PostText, { headers: v_Headers });

        this.debugLog();
        return v_Tenants;
    }



    // requires that caller is a valid user of the partner
    getPartnerAccountSubscriptions(accountOrgID: string, tenantID: string): Observable<Array<TenantSubscription>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}partners/accounts/${accountOrgID}/tenants/${tenantID}/subscriptions/`;
        let v_Subscriptions = this.http.get<Array<TenantSubscription>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Subscriptions;
    }

    GetApiToken(p_ApplicationId: string): Observable<String> {

        let v_Url = `${this.m_BaseURL}authorization/apiToken/?applicationId=${p_ApplicationId}`;
        let v_Token = this.http.get<String>(v_Url);

        this.debugLog();
        return v_Token;
    }

    GetUserAccessKeyFromLongLivedToken(p_Token: string): Observable<UserToken> {
        let v_Headers = new HttpHeaders({ 'Content-Type': 'application/json' })
            .append("apiKey", "9d391065-2abe-4681-9ea3-a78557a42a13")
            .append("longLivedToken", p_Token);


        let v_Url = `${this.m_BaseURL}authorization/userToken/?timezoneOffset=${(new Date().getTimezoneOffset() / 60) * -1}&timezoneName=${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
        let v_AccessKey = this.http.get<UserToken>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_AccessKey;

    }

    GetUserAccessKey(p_Email: string,
        p_Password: string,
        p_TenantId: string,
        p_LanguageCode: string = "en",
        p_GetLongLivedToken: boolean = false): Observable<UserToken> {
        let v_Headers = new HttpHeaders({ 'Content-Type': 'application/json' })
            .append("apiKey", "9d391065-2abe-4681-9ea3-a78557a42a13");

        this.setCurrentLanguage(p_LanguageCode);

        let v_AuthBody = new AuthorizationBody();
        v_AuthBody.email = p_Email;
        v_AuthBody.language = p_LanguageCode;
        v_AuthBody.password = p_Password;
        v_AuthBody.tenantId = p_TenantId;
        v_AuthBody.returnLongLivedToken = p_GetLongLivedToken;

        v_AuthBody.timeOffset = (new Date().getTimezoneOffset() / 60) * -1;
        v_AuthBody.timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (v_AuthBody.timezoneName == undefined)
            try { v_AuthBody.timezoneName = /\([a-zA-Z ]+\)/.exec(new Date().toString())[0].replace("(", "").replace(")", ""); }
            catch (e) { }

        //console.log("GetAccessKeyVals");
        //console.log(v_AuthBody);


        let v_Body: string = JSON.stringify(v_AuthBody);

        //let v_Url = `${this.m_BaseURL}authorization/userToken/?email=${p_Email}&tenantid=${p_TenantId}&language=${p_LanguageCode}`;
        let v_Url = `${this.m_BaseURL}authorization/userToken/`;
        let v_AccessKey = this.http.post<UserToken>(v_Url, v_Body, { headers: v_Headers });

        this.debugLog();
        return v_AccessKey;
    }

    GetSSOFullLoginData(p_ApiKey: string, p_LanguageCode: string): Observable<FullAuthToken> {
        let v_Headers = new HttpHeaders({ 'Content-Type': 'application/json' })
            .append("userAccessKey", ProdGenApi.userAccessKey);

        let v_Url = `${this.m_BaseURL}authorization/userToken/fullService?applicationId=${p_ApiKey}&languageCode=${p_LanguageCode}`;
        let v_AccessKey = this.http.get<FullAuthToken>(v_Url, { headers: v_Headers });
        this.setCurrentLanguage(p_LanguageCode);
        this.debugLog();
        return v_AccessKey;
    }

    UpdateUserAccessKey(p_LanguageCode): Observable<UserToken> {
        let v_Headers = this.getAuthHeaders();
        //let v_Body: string = p_LanguageCode;

        //let v_Url = `${this.m_BaseURL}authorization/userToken/?email=${p_Email}&tenantid=${p_TenantId}&language=${p_LanguageCode}`;
        let v_Url = `${this.m_BaseURL}authorization/userToken/`;
        let v_AccessKey = this.http.put<UserToken>(v_Url, `"${p_LanguageCode}"`, { headers: v_Headers });
        this.setCurrentLanguage(p_LanguageCode);

        this.debugLog();
        return v_AccessKey;
    }

    UpdateUserAccessKeyWithTempKey(p_LanguageCode, p_UserAccessKey: string): Observable<UserToken> {
        let v_Headers = new HttpHeaders({ 'Content-Type': 'application/json' })
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", p_UserAccessKey);

        //let v_Body: string = p_LanguageCode;

        //let v_Url = `${this.m_BaseURL}authorization/userToken/?email=${p_Email}&tenantid=${p_TenantId}&language=${p_LanguageCode}`;
        let v_Url = `${this.m_BaseURL}authorization/userToken/`;
        let v_AccessKey = this.http.put<UserToken>(v_Url, `"${p_LanguageCode}"`, { headers: v_Headers });
        this.setCurrentLanguage(p_LanguageCode);

        this.debugLog();
        return v_AccessKey;
    }

    IsSSOCompliantUser(p_TenantId: string): Observable<{ [id: string]: string }> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}authorization/${p_TenantId}/ssoSetting`;
        let v_IsSamlUser = this.http.get<{ [id: string]: string }>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_IsSamlUser;
    }

    GetSamlRequestURL(p_TenantId: string, p_Email: string): Observable<string> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}authorization/${p_TenantId}/samlRequestURL/?email=${p_Email}&applicationId=278CCDBD-01B2-4D48-B723-5F5F8F65E31B`;
        let v_IsSamlRequestURL = this.http.get<string>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_IsSamlRequestURL;
    }

    GetOpenIdRequestURL(p_TenantId: string, p_Email: string): Observable<string> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}authorization/${p_TenantId}/openIdRequestURL/?email=${p_Email}&applicationId=278CCDBD-01B2-4D48-B723-5F5F8F65E31B`;
        let v_IsOpenIdRequestURL = this.http.get<string>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_IsOpenIdRequestURL;
    }

    GetSamlAuthenticateSamlAssertion(p_TenantId: string, p_Assertion): Observable<SecurityKey> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}authorization/${p_TenantId}/authenticateSamlAssertion/?assertion=${p_Assertion}`;
        let v_IsSamlRequestURL = this.http.get<SecurityKey>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_IsSamlRequestURL;
    }

    GetSamlResponse(): Observable<string> {
        let v_Headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        let v_Body: string = "";
        let v_Url = `${this.m_BaseURL}/#/samlResponse/`;
        let v_IsSamlUser = this.http.post<string>(v_Url, v_Body, { headers: v_Headers });

        this.debugLog();
        return v_IsSamlUser;
    }

    GetUserExcludedFromSSO(p_TenantID: string, p_Email: string): Observable<boolean> {
        let v_Headers = new HttpHeaders({ 'Content-Type': 'application/json' })
            .append("apiKey", "9d391065-2abe-4681-9ea3-a78557a42a13");

        let v_Url = `${this.m_BaseURL}users/${p_TenantID}?email=${p_Email}`;

        let v_UserExcluded = this.http.get<boolean>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_UserExcluded;
    }

    GetUserOrgInfo(p_Email: string): Observable<UserOrgInfoObject> {
        let v_Headers = new HttpHeaders()
            .append("apiKey", "9d391065-2abe-4681-9ea3-a78557a42a13");

        let v_Url = `${this.m_BaseURL}authorization/userOrgInfo/?email=${p_Email}`;

        let v_AccessKey = this.http.get<UserOrgInfoObject>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_AccessKey;
    }

    getPartnerAccounts(): Observable<Array<Organization>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}partners/accounts`;
        let v_Orgs = this.http.get<Array<Organization>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Orgs;
    }

    getPartnerTenants(): Observable<Array<Tenant>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}partners/tenants`;
        let v_Orgs = this.http.get<Array<Tenant>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Orgs;
    }

    getSearchConnectors(): Observable<Array<SearchConnector>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}search/searchconnector`;

        let v_Content = this.http.get<Array<SearchConnector>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Content;

    }

    searchContent(search_terms: string, facetFilter: SearchFacet[] = null): Observable<SearchResults> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}search`;
        if (search_terms == null) {
            search_terms = "";
        }

        search_terms = search_terms.split("&").join("%26");
        search_terms = search_terms.split("|").join("%7C");
        search_terms = search_terms.split("+").join("%2B");


        v_Url += '?searchTerms=' + search_terms;

        let v_Body: string = "";
        if (facetFilter != null) {
            v_Body = JSON.stringify(facetFilter);
        }

        let v_Search = this.http.post<SearchResults>(v_Url, v_Body, { headers: v_Headers });

        this.debugLog();
        return v_Search;


    }

    getChatSettings(): Observable<ChatSettings> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}chat/chatSettings`;

        let v_Content = this.http.get<ChatSettings>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Content;
    }

    requestExpertChat(subject: string, product: string): Observable<ChatSession> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}chat/requestExpertChat`;

        v_Url += '?subject=' + subject;
        v_Url += '&product=' + product;

        let v_Body: string = "";

        let v_Search = this.http.post<ChatSession>(v_Url, v_Body, { headers: v_Headers });

        this.debugLog();
        return v_Search;
    }

    getNewChatMessages(): Observable<Array<ChatMessage>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}chat/getNewMessages`;

        let v_Content = this.http.get<Array<ChatMessage>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_Content;
    }


    updateChatSessionStatus(sessionId: string, status: ChatStatus_T): Observable<string> {
        if (!sessionId) return of('');

        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}chat/updateSessionStatus`;

        v_Url += '?sessionId=' + sessionId;
        v_Url += '&status=' + status.toString();

        let v_Body: string = "";

        let v_Search = this.http.post<string>(v_Url, v_Body, { headers: v_Headers });

        this.debugLog();
        return v_Search;
    }

    updateChatRequestStage(sessionId: string, stage: number): Observable<string> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}chat/updateRequestStage`;

        v_Url += '?sessionId=' + sessionId;
        v_Url += '&stage=' + stage.toString();

        let v_Body: string = "";

        let v_Search = this.http.post<string>(v_Url, v_Body, { headers: v_Headers });

        this.debugLog();
        return v_Search;
    }

    sendChatMessage(message: ChatMessage): Observable<string> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}chat/sendMessage`;

        let v_Body: string = JSON.stringify(message);

        let v_Search = this.http.post<string>(v_Url, v_Body, { headers: v_Headers });

        this.debugLog();
        return v_Search;
    }

    saveChatMessage(chatName: string, messages: ChatMessage[]): Observable<ChatLog> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/chatlogs/`;

        var v_chatPostObj = new SavedChatPost();
        v_chatPostObj.name = chatName;
        v_chatPostObj.messages = messages;

        let v_Body: string = JSON.stringify(v_chatPostObj);


        let v_Search = this.http.post<ChatLog>(v_Url, v_Body, { headers: v_Headers });

        this.debugLog();
        return v_Search;
    }

    // There are no references to this method.
    // Keeping it for now, will probably remove on another
    // refactoring pass.
    //   downloadPDF(url: string): any {
    //       this.http.get(url, { responseType: ResponseContentType.Blob })
    //           .map((res: any) => { return res; })
    //       .subscribe(
    //                   data => {
    //                       var mediaType = 'application/pdf';
    //                       var blob = new Blob([data], { type: mediaType });
    //                       var filename = `certificate.pdf`;
    //                       //saveAs(blob, filename);
    //                       var fileURL = URL.createObjectURL(blob);
    //                       window.open(fileURL); // if you want to open it in new tab
    //                   },
    //                   error => {
    //                       console.log(error);
    //                   });
    //       this.debugLog();
    //}

    getCurrentEnrollmentsReport(): Observable<Array<CurrentEnrollment>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}reports/currentEnrollments`;

        let v_ReportData = this.http.get<Array<CurrentEnrollment>>(v_Url, { headers: v_Headers }).pipe(
            map((enrollments: any[]) => {
                enrollments.forEach(e => {
                    // This field is returned from the API as a string, so
                    // we need to parse it as a Date to allow downstream
                    // consumers to use it as expected.
                    const enrollmentDueDate = new Date(e.enrollmentDueDate);
                    return { ...e, enrollmentDueDate } as CurrentEnrollment;
                });
                return enrollments as Array<CurrentEnrollment>;
            }));

        this.debugLog();
        return v_ReportData;
    }

    getAssetLibraries(getTenantData: boolean, getSubscriptionData: boolean, forceProductRetrieval: boolean = false): Observable<Array<AssetLibrary>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}assetLibraries/?getTenantData=${getTenantData}&getSubscriptionData=${getSubscriptionData}&forceProductRetrieval=${forceProductRetrieval}`;

        let cacheOptions = new CacheOptions();

        cacheOptions.maxAge = 60 * 10;
        cacheOptions.cacheLocation = CacheLocation.localStorage;

        let v_Response = this.apiCache.httpGetCacheableResponse<Array<AssetLibrary>>(v_Url, { headers: v_Headers }, cacheOptions);
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }

    getAssetLibraryAssetSummary(assetLibraryId: string, productId: string, versionId: string): Observable<AssetLibraryContentSummary> {
        let v_Headers = this.getAuthHeaders();


        let v_Url = `${this.m_BaseURL}assetLibraries/${assetLibraryId}/products/${productId}/assetsummary?versionId=${versionId}`;

        let cacheOptions = new CacheOptions();

        cacheOptions.maxAge = 60 * 10;
        cacheOptions.cacheLocation = CacheLocation.localStorage;

        let v_Response = this.apiCache.httpGetCacheableResponse<AssetLibraryContentSummary>(v_Url, { headers: v_Headers }, cacheOptions);
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }

    getAssetLibraryProductVersion(assetLibraryId: string, productId: string): Observable<Array<AssetLibraryProductVersion>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}assetLibraries/${assetLibraryId}/products/${productId}/versions`;

        let cacheOptions = new CacheOptions();

        cacheOptions.maxAge = 60 * 10;
        cacheOptions.cacheLocation = CacheLocation.localStorage;

        let v_Response = this.apiCache.httpGetCacheableResponse<Array<AssetLibraryProductVersion>>(v_Url, { headers: v_Headers }, cacheOptions);
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }

    getTranslatedFile(): Observable<Array<Object>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}translations/files/`;

        let v_TranslationData = this.http.get<Array<Object>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_TranslationData;
    }

    getTranslatedFileFromKey(accessKey: string): Observable<Array<Object>> {
        let v_Headers = new HttpHeaders({ 'Content-Type': 'application/json' })
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", accessKey);

        let v_Url = `${this.m_BaseURL}translations/files/`;

        let v_TranslationData = this.http.get<Array<Object>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_TranslationData;
    }

    getTranslatedFileFromLanguageCode(languageCode: string): Observable<Array<Object>> {
        let v_Headers = this.getAuthHeaders();
        //console.log(v_Headers);

        let v_Url = `${this.m_BaseURL}translations/files/${languageCode}`;

        let v_TranslationData = this.http.get<Array<Object>>(v_Url, { headers: v_Headers });
        this.setCurrentLanguage(languageCode);

        this.debugLog();
        return v_TranslationData;
    }

    GetPartnerSupportInfo(PartnerID: string): Observable<PartnerSupport> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}partners/support/${PartnerID}`;

        let v_PartnerSupportInfo = this.http.get<PartnerSupport>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_PartnerSupportInfo;
    }

    IsPartner(): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}partners/current/tenants/ispartner`;

        let v_isPartner = this.http.get<boolean>(v_Url, { headers: v_Headers });

        return v_isPartner;
    }

    static getLargeDefaultImageFromType(contentType: ContentType_T): string {
        let image = "";

        switch (contentType) {
            case ContentType_T.workflow:
                try {
                    image = localStorage.getItem(this.currentTenantId + "_WFImage");
                } catch (e) {

                }

                if (image == "" || image == null) {
                    image = "default_workflow.jpg";
                }
                break;

            case ContentType_T.process:
                try {
                    image = localStorage.getItem(this.currentTenantId + "_ProcessImage");
                } catch (e) {

                }

                if (image == "" || image == null) {
                    image = "default_process.jpg";
                }

                break;
            case ContentType_T.cheatsheet:
                try {
                    image = localStorage.getItem(this.currentTenantId + "_DocsImage");
                } catch (e) {

                }

                if (image == "" || image == null) {
                    image = "default_cheatsheet.jpg";
                }


                break;
            case ContentType_T.chatLog:
                image = "chat_saved.jpg";
                break;
            case ContentType_T.video:
                try {
                    image = localStorage.getItem(this.currentTenantId + "_VidsImage");
                } catch (e) {

                }

                if (image == "" || image == null) {
                    image = "default_video.jpg";
                }

                break;
            case ContentType_T.course:
                try {
                    image = localStorage.getItem(this.currentTenantId + "_CourseImage");
                } catch (e) {

                }

                if (image == "" || image == null) {
                    image = "default_course.jpg";
                }

                break;

            case ContentType_T.workgroup:
                try {
                    image = localStorage.getItem(this.currentTenantId + "_defWorkgroupImage");
                } catch (e) {

                }

                if (image == "" || image == null) {
                    image = "default_project.jpg";
                }

                break;
            case ContentType_T.trainingclass:
                image = "default_course.jpg";
                break;
            case ContentType_T.learningpath:
                try {
                    image = localStorage.getItem(this.currentTenantId + "_LPImage");
                } catch (e) {

                }

                if (image == "" || image == null) {
                    image = "default_learningpath.jpg";
                }

                break;
            case ContentType_T.extendedSearch:
                image = "extended_search.jpg";
                break;
        }
        image = image + "?" + ProdGenApi.getSessionUnique();

        return image;

    }


    static getIconImageFromType(contentType: ContentType_T): string {
        let image = "";
        switch (contentType) {
            case ContentType_T.workflow:
            case ContentType_T.process:
            case ContentType_T.task:
            case ContentType_T.step:
                image += "fas fa-sitemap";
                break;
            case ContentType_T.cheatsheet:
                image += "fas fa-file-alt";
                break;
            case ContentType_T.video:
                image += "fas fa-play-circle";
                break;
            case ContentType_T.course:
                image += "fas fa-book";
                break;
            case ContentType_T.trainingclass:
                image += "fas fa-book-reader";
                break;
            case ContentType_T.learningpath:
                image += "fas fa-graduation-cap ";
                break;
            case ContentType_T.quiz:
                image += "fas fa-clipboard-check";
                break;
            case ContentType_T.scormcourse:
                image += "fas fa-play-circle";
                break;
        }
        return image;

    }

    CreatePlaylist(): Observable<string> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}users/current/playlist`;

        this.apiCache.invalidateContaining("playlist");
        let v_PlaylistGuid = this.http.post<string>(v_Url, "", { headers: v_Headers });

        this.debugLog();
        return v_PlaylistGuid;
    }

    updatePlaylistName(newText: string, plid: string): Observable<string> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}users/current/playlist/${plid}`;

        let v_Body = JSON.stringify(newText);

        this.apiCache.invalidateContaining("playlist");
        let v_PlaylistGuid = this.http.put<string>(v_Url, v_Body, { headers: v_Headers });

        this.debugLog();
        return v_PlaylistGuid;
    }

    GetPlaylist(userID: string): Observable<Playlist> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}users/current/playlist/${userID}`;

        let cacheOptions: CacheOptions = new CacheOptions;
        cacheOptions.cacheLocation = CacheLocation.sessionStorage;
        cacheOptions.maxAge = 30;

        let v_Response = this.apiCache.httpGetCacheableResponse<Playlist>(v_Url, { headers: v_Headers }, cacheOptions);
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }

    AddtoPlaylist(playlistID: string, contentID: string, content: PlaylistContent, enrollmentID: string = "00000000-0000-0000-0000-000000000000"): Observable<string> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}users/current/playlist/${playlistID}/content/${contentID}/enrollment/${enrollmentID}`;

        let v_Body = JSON.stringify(content);

        this.apiCache.invalidateContaining("playlist");
        let v_Playlist = this.http.post<string>(v_Url, v_Body, { headers: v_Headers });

        this.debugLog();
        return v_Playlist;
    }

    GetPlaylistContent(plID: string, plcontentID: string = ""): Observable<Array<PlaylistContent>> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = ``;
        if (plcontentID == "") {
            v_Url = `${this.m_BaseURL}users/current/playlist/${plID}/content`;
        }
        else {
            v_Url = `${this.m_BaseURL}users/current/playlist/${plID}/content/${plcontentID}`;
        }


        let cacheOptions: CacheOptions = new CacheOptions;
        cacheOptions.cacheLocation = CacheLocation.sessionStorage;
        cacheOptions.maxAge = 30;

        let v_Response = this.apiCache.httpGetCacheableResponse<Array<PlaylistContent>>(v_Url, { headers: v_Headers }, cacheOptions);
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }

    RemovePlaylistContent(plID: string, contentID: string): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}users/current/playlist/${plID}/content/${contentID}`;

        this.apiCache.invalidateContaining("playlist");
        let v_result = this.http.delete<boolean>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_result;
    }

    DeletePlaylist(plID: string): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}users/current/playlist/${plID}`;

        this.apiCache.invalidateContaining("playlist");
        let v_result = this.http.delete<boolean>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_result;
    }

    EmptyPlaylist(plID: string): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}users/current/playlist/${plID}/content`;

        this.apiCache.invalidateContaining("playlist");
        let v_result = this.http.delete<boolean>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_result;
    }

    AddtoDownloadQueue(content: Array<PlaylistContent>): Observable<string> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}users/current/playlist/content/download`;

        let v_Body = JSON.stringify(content);

        let v_Batch = this.http.post<string>(v_Url, v_Body, { headers: v_Headers });

        this.debugLog();
        return v_Batch;
    }

    GetDownloadExpirationDays(): Observable<number> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}users/current/playlist/content/download`;

        let r_days = this.http.get<number>(v_Url, { headers: v_Headers });

        this.debugLog();
        return r_days;
    }

    GetEnrollmentIDFromCourse(courseID: string): Observable<string> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}users/current/playlist/content/${courseID}`;

        let r_id = this.http.get<string>(v_Url, { headers: v_Headers });

        this.debugLog();
        return r_id;
    }


    AddMyCheatSheet(cheatsheetID: string, cheatsheetTitle: string, cheatsheetDescription: SafeHtml, selectedProducts: Array<ContentProduct>): Observable<string> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}users/current/content/cheatsheets/addedit`;

        if (cheatsheetID == "new") {
            cheatsheetID = ProdGenApi.EMPTY_GUID;
        }

        var obj = {
            csid: cheatsheetID,
            cstitle: cheatsheetTitle,
            csdesc: cheatsheetDescription,
            prods: selectedProducts
        };

        let v_Body = JSON.stringify(obj);

        this.apiCache.invalidateContaining("playlist");

        let v_Batch = this.http.post<string>(v_Url, v_Body, { headers: v_Headers });

        this.debugLog();
        return v_Batch;
    }

    GetContentProducts(): Observable<Array<ContentProduct>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/contentproducts`;

        let r_res = this.http.get<Array<ContentProduct>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return r_res;
    }

    DeleteCheat(cheatID: string): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}users/current/content/cheatsheets/addedit/${cheatID}`;

        this.apiCache.invalidateContaining("playlist");
        let v_result = this.http.delete<boolean>(v_Url, { headers: v_Headers });

        this.debugLog();
        return v_result;
    }

    GetContentUsedProducts(p_ContentId: String, p_ContentType: String): Observable<ContentProduct[]> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}content/${p_ContentId}/usedProducts/?contentType=${p_ContentType}`;
        let v_ContentItem = this.http.get<ContentProduct[]>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_ContentItem;
    }


    GetPasswordResetRequest(requestid: string): Observable<PWResetRequest> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}authorization/resetPassword/authorize/${requestid}`;

        let r_authorized = this.http.get<PWResetRequest>(v_Url, { headers: v_Headers });

        this.debugLog();
        return r_authorized;
    }

    PasswordReset(requestid: string, userid: string, newPW: string): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}authorization/resetPassword/authorize/${requestid}/${userid}`;
        let v_Body = JSON.stringify(newPW);

        let r_updated = this.http.put<boolean>(v_Url, v_Body, { headers: v_Headers });

        this.debugLog();
        return r_updated;
    }

    ResendPWResetEmail(requestid: string): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}authorization/resetPassword/resend/${requestid}`;

        let r_authorized = this.http.get<boolean>(v_Url, { headers: v_Headers });

        this.debugLog();
        return r_authorized;
    }

    SubmitResetRequest(tenantID: string, byUser: string, user: string, type: string, email: string): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}authorization/resetPassword/tenant/${tenantID}/byuser/${byUser}/user/${user}/type/${type}/email/${email}`;

        let r_authorized = this.http.post<boolean>(v_Url, "", { headers: v_Headers });

        this.debugLog();
        return r_authorized;
    }



    getAccountTenants(orgID: string): Observable<Array<Tenant>> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}partners/accounts/${orgID}/tenants/`;

        let tenants = this.http.get<Array<Tenant>>(v_Url, { headers: v_Headers });

        this.debugLog();
        return tenants;
    }


    getAccountAccessKey(p_OrgID: string, p_TenantID: string): Observable<string> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}partners/accounts/${p_OrgID.toString()}/tenants/${p_TenantID}/accessToken?timezoneOffset=${(new Date().getTimezoneOffset() / 60) * -1}&timezoneName=${Intl.DateTimeFormat().resolvedOptions().timeZone}`;

        let accessKey = this.http.get<string>(v_Url, { headers: v_Headers });

        this.debugLog();
        return accessKey;
    }

    getAccountAccessKeyV2(p_OrgID: string, p_TenantID: string): Observable<APIV2AccessKey> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}partners/accounts/${p_OrgID.toString()}/tenants/${p_TenantID}/accessTokenV2?timezoneOffset=${(new Date().getTimezoneOffset() / 60) * -1}&timezoneName=${Intl.DateTimeFormat().resolvedOptions().timeZone}`;

        let accessKey = this.http.get<APIV2AccessKey>(v_Url, { headers: v_Headers });

        this.debugLog();
        return accessKey;
    }

    MarkResetRequestsComplete(userID: string): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();

        let v_Url = `${this.m_BaseURL}authorization/resetPassword/complete/${userID}`;

        let r_marked = this.http.put<boolean>(v_Url, "", { headers: v_Headers });

        this.debugLog();
        return r_marked;
    }

    StorageBlobSecureAccessSignature(containerName: string, blobName: string): Observable<string> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}storage/blobsecureaccesssignature?containerName=${containerName}&blobName=${blobName}`;
        let blobSecureAccessSignature = this.http.get<string>(v_Url, { headers: v_Headers });
        this.debugLog();
        return blobSecureAccessSignature;
    }

    StorageBlobSecureAccessSignaturesTree(containerName: string, blobName: string, relativeAddress: string): Observable<Array<BlobSecureAccessSignatureTree>> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}storage/blobsecureaccesssignaturestree?containerName=${containerName}&blobName=${blobName}&relativeAddress=${relativeAddress}`;
        let blobSecureAccessSignatures = this.http.get<Array<BlobSecureAccessSignatureTree>>(v_Url, { headers: v_Headers });
        this.debugLog();
        return blobSecureAccessSignatures;
    }

    updateCurrentTenantLogo(p_ImageArray: any, filename: string, type: string): Observable<String> {
        let v_Headers = new HttpHeaders()
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", ProdGenApi.userAccessKey);
        let v_Url = `${this.m_BaseURL}organizations/current/image/logo?filename=${filename}&type=${type}`;
        let v_Body = p_ImageArray;

        //const v_Test = new FormData();
        //v_Test.append("file", p_ImageArray, 'Test');

        let v_ContentItem = this.http.put<String>(v_Url, v_Body, { headers: v_Headers });
        this.debugLog();
        return v_ContentItem;
    }

    updateCurrentTenantNewsImage(p_ImageArray: any, filename: string, type: string): Observable<String> {
        let v_Headers = new HttpHeaders()
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", ProdGenApi.userAccessKey);
        let v_Url = `${this.m_BaseURL}organizations/current/image/news?filename=${filename}&type=${type}`;
        let v_Body = p_ImageArray;

        //const v_Test = new FormData();
        //v_Test.append("file", p_ImageArray, 'Test');

        let v_ContentItem = this.http.put<String>(v_Url, v_Body, { headers: v_Headers });
        this.debugLog();
        return v_ContentItem;
    }

    setTheme(themeid: string, themename: string, values: Theme, type: string): Observable<String> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}organizations/current/tenants/current/themes?p_themeid=${themeid}&p_themename=${themename}&p_type=${type}`;
        let v_Body = JSON.stringify(values);
        let v_ThemeResponse = this.http.post<String>(v_Url, v_Body, { headers: v_Headers });
        this.debugLog();
        return v_ThemeResponse;
    }

    getCurrentTenantThemes(p_type: string): Observable<Array<Theme>> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}organizations/current/tenants/current/themes?p_type=${p_type}`;
        let v_ThemeResponse = this.http.get<Array<Theme>>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_ThemeResponse;
    }

    deleteCurrentTenantTheme(themeid: string): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}organizations/current/tenants/current/themes?themeid=${themeid}`;
        let v_ThemeResponse = this.http.delete<boolean>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_ThemeResponse;
    }
    ////
    updateCurrentDocumentImage(p_ImageArray: any, filename: string, p_type: string): Observable<String> {
        let v_Headers = new HttpHeaders()
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", ProdGenApi.userAccessKey);
        let v_Url = `${this.m_BaseURL}organizations/current/image/docs?filename=${filename}&p_type=${p_type}`;
        let v_Body = p_ImageArray;

        //const v_Test = new FormData();
        //v_Test.append("file", p_ImageArray, 'Test');

        let v_ContentItem = this.http.put<String>(v_Url, v_Body, { headers: v_Headers });
        this.debugLog();
        return v_ContentItem;
    }

    updateCurrentMyDocumentImage(p_ImageArray: any, filename: string, p_type: string): Observable<String> {
        let v_Headers = new HttpHeaders()
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", ProdGenApi.userAccessKey);
        let v_Url = `${this.m_BaseURL}organizations/current/image/mydocs?filename=${filename}&p_type=${p_type}`;
        let v_Body = p_ImageArray;

        //const v_Test = new FormData();
        //v_Test.append("file", p_ImageArray, 'Test');

        let v_ContentItem = this.http.put<String>(v_Url, v_Body, { headers: v_Headers });
        this.debugLog();
        return v_ContentItem;
    }

    updateCurrentVideoImage(p_ImageArray: any, filename: string, p_type: string): Observable<String> {
        let v_Headers = new HttpHeaders()
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", ProdGenApi.userAccessKey);
        let v_Url = `${this.m_BaseURL}organizations/current/image/video?filename=${filename}&p_type=${p_type}`;
        let v_Body = p_ImageArray;

        //const v_Test = new FormData();
        //v_Test.append("file", p_ImageArray, 'Test');

        let v_ContentItem = this.http.put<String>(v_Url, v_Body, { headers: v_Headers });
        this.debugLog();
        return v_ContentItem;
    }

    updateCurrentLearningPathImage(p_ImageArray: any, filename: string, p_type: string): Observable<String> {
        let v_Headers = new HttpHeaders()
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", ProdGenApi.userAccessKey);
        let v_Url = `${this.m_BaseURL}organizations/current/image/lps?filename=${filename}&p_type=${p_type}`;
        let v_Body = p_ImageArray;

        //const v_Test = new FormData();
        //v_Test.append("file", p_ImageArray, 'Test');

        let v_ContentItem = this.http.put<String>(v_Url, v_Body, { headers: v_Headers });
        this.debugLog();
        return v_ContentItem;
    }

    updateCurrentCourseImage(p_ImageArray: any, filename: string, p_type: string): Observable<String> {
        let v_Headers = new HttpHeaders()
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", ProdGenApi.userAccessKey);
        let v_Url = `${this.m_BaseURL}organizations/current/image/course?filename=${filename}&p_type=${p_type}`;
        let v_Body = p_ImageArray;

        //const v_Test = new FormData();
        //v_Test.append("file", p_ImageArray, 'Test');

        let v_ContentItem = this.http.put<String>(v_Url, v_Body, { headers: v_Headers });
        this.debugLog();
        return v_ContentItem;
    }

    updateCurrentQuizImage(p_ImageArray: any, filename: string, p_type: string): Observable<String> {
        let v_Headers = new HttpHeaders()
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", ProdGenApi.userAccessKey);
        let v_Url = `${this.m_BaseURL}organizations/current/image/quiz?filename=${filename}&p_type=${p_type}`;
        let v_Body = p_ImageArray;

        //const v_Test = new FormData();
        //v_Test.append("file", p_ImageArray, 'Test');

        let v_ContentItem = this.http.put<String>(v_Url, v_Body, { headers: v_Headers });
        this.debugLog();
        return v_ContentItem;
    }

    updateCurrentWorkflowImage(p_ImageArray: any, filename: string, p_type: string): Observable<String> {
        let v_Headers = new HttpHeaders()
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", ProdGenApi.userAccessKey);
        let v_Url = `${this.m_BaseURL}organizations/current/image/wfs?filename=${filename}&p_type=${p_type}`;
        let v_Body = p_ImageArray;

        //const v_Test = new FormData();
        //v_Test.append("file", p_ImageArray, 'Test');

        let v_ContentItem = this.http.put<String>(v_Url, v_Body, { headers: v_Headers });
        this.debugLog();
        return v_ContentItem;
    }

    updateCurrentProcessImage(p_ImageArray: any, filename: string, p_type: string): Observable<String> {
        let v_Headers = new HttpHeaders()
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", ProdGenApi.userAccessKey);
        let v_Url = `${this.m_BaseURL}organizations/current/image/process?filename=${filename}&p_type=${p_type}`;
        let v_Body = p_ImageArray;

        //const v_Test = new FormData();
        //v_Test.append("file", p_ImageArray, 'Test');

        let v_ContentItem = this.http.put<String>(v_Url, v_Body, { headers: v_Headers });
        this.debugLog();
        return v_ContentItem;
    }

    updateCurrentdefWorkgroupImage(p_ImageArray: any, filename: string, p_type: string): Observable<String> {
        let v_Headers = new HttpHeaders()
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", ProdGenApi.userAccessKey);
        let v_Url = `${this.m_BaseURL}organizations/current/image/defworkgroup?filename=${filename}&p_type=${p_type}`;
        let v_Body = p_ImageArray;

        //const v_Test = new FormData();
        //v_Test.append("file", p_ImageArray, 'Test');

        let v_ContentItem = this.http.put<String>(v_Url, v_Body, { headers: v_Headers });
        this.debugLog();
        return v_ContentItem;
    }

    updateCurrentEnrollmentImage(p_ImageArray: any, filename: string, p_type: string): Observable<String> {
        let v_Headers = new HttpHeaders()
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", ProdGenApi.userAccessKey);
        let v_Url = `${this.m_BaseURL}organizations/current/image/enrollment?filename=${filename}&p_type=${p_type}`;
        let v_Body = p_ImageArray;

        //const v_Test = new FormData();
        //v_Test.append("file", p_ImageArray, 'Test');

        let v_ContentItem = this.http.put<String>(v_Url, v_Body, { headers: v_Headers });
        this.debugLog();
        return v_ContentItem;
    }

    updateWidgetPropertyImage(p_propwidgetId: string, p_ImageArray: any): Observable<String> {
        let v_headers = new HttpHeaders()
            .append("apiKey", ProdGenApi.APIKey)
            .append("userAccessKey", ProdGenApi.userAccessKey);

        let v_Url = `${this.m_BaseURL}users/uiLayout/widget/image/${p_propwidgetId}`;
        let v_Body = p_ImageArray;

        let v_ContentItem = this.http.put<String>(v_Url, v_Body, { headers: v_headers });
        this.apiCache.invalidateContaining("/uiLayout/widget");
        this.debugLog();
        return v_ContentItem;
    }

    MoveImagesToThemeLocation(themeid: string, filelocations: string[], type: string): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}organizations/current/image/themeimages/${themeid}/${type}`;
        let v_Body = filelocations;
        let returnval = this.http.put<boolean>(v_Url, v_Body, { headers: v_Headers });
        this.debugLog();
        return returnval;
    }

    getCurrentPartnerThemeID(): Observable<string> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}organizations/current/partner/theme`;
        let v_ThemeResponse = this.http.get<string>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_ThemeResponse;
    }
    getCurrentLiteThemeID(): Observable<string> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}organizations/current/lite/theme`;
        let v_ThemeResponse = this.http.get<string>(v_Url, { headers: v_Headers });
        this.debugLog();
        return v_ThemeResponse;
    }

    getLPImageURL(p_lpID: String): Observable<string> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}content/learningpaths/${p_lpID}/image`;
        let v_result = this.http.get<string>(v_url, { headers: v_headers });
        this.debugLog();
        return v_result;
    }

    lpGetFailedQuizzes(enrollID: string): Observable<Array<string>> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}/enrollments/${enrollID}/content/quizzes`;
        let v_res = this.http.get<Array<string>>(v_url, { headers: v_headers });
        this.debugLog();
        return v_res;
    }

    translateText(p_text: string, p_fromLang: string, p_isHTML: boolean): Observable<string> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}/translations/text?fromLanguage=${p_fromLang}&isHTML=${p_isHTML}&text=${p_text}`;
        let v_res = this.http.get<string>(v_url, { headers: v_headers });
        this.debugLog();
        return v_res;
    }

    lpAreAnyRequiredQuizzesNotAttempted(p_enrollID: string): Observable<Array<string>> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}/enrollments/${p_enrollID}/content/quizzes/notattempted`;
        let v_res = this.http.get<Array<string>>(v_url, { headers: v_headers });
        this.debugLog();
        return v_res;
    }


    debugLog() {

        if (this.debugAPILogging == true) {
            //chrome, firefox, and edge
            let e = new Error("Debug Log");
            let stack = e.stack;
            if (stack != null) {
                stack = stack.split('at ')[2] + stack.split('at ')[3];
                console.log(stack);
            }

            //Internet Explorer
            //console.trace();
        }
    }

    getWidgetLayoutPages(): Observable<Array<WidgetLayoutPage>> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}/users/uiLayout/layoutPages`;

        let cacheOptions: CacheOptions = new CacheOptions();
        cacheOptions.cacheLocation = CacheLocation.sessionStorage;
        cacheOptions.maxAge = 120;


        let v_Response = this.apiCache.httpGetCacheableResponse<Array<WidgetLayoutPage>>(v_Url, { headers: v_Headers }, cacheOptions);
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }



    getContainerInfo(instanceId: string, containerId: string, bindingType: string, bindingId: string): Observable<WidgetContainerInfo> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}/users/uiLayout/${containerId}?instanceId=${instanceId}&bindingType=${bindingType}&bindingId=${bindingId}`;

        //let cacheOptions: CacheOptions = new CacheOptions();
        //cacheOptions.cacheLocation = CacheLocation.sessionStorage;
        //cacheOptions.maxAge = 120;

        //let v_Response = this.apiCache.httpGetCacheableResponse(v_Url, { headers: v_Headers }, cacheOptions);
        let v_Response = this.http.get<WidgetContainerInfo>(v_Url, { headers: v_Headers });

        this.debugLog();

        return v_Response;
    }

    getWidgetProperties(widgetID: string): Observable<Array<WidgetProperties>> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}/users/uiLayout/widget/${widgetID}`;
        let cacheOptions: CacheOptions = new CacheOptions();
        cacheOptions.cacheLocation = CacheLocation.sessionStorage;
        cacheOptions.maxAge = 50;


        let v_Response = this.apiCache.httpGetCacheableResponse<Array<WidgetProperties>>(v_Url, { headers: v_Headers }, cacheOptions);
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }
    setWidgetProperties(containerID: string, widgetID: string, widgetprops: Array<WidgetProperties>, component: string): Observable<boolean> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}/users/uiLayout/widget/${widgetID}/${containerID}/${component}`;
        let v_Body = JSON.stringify(widgetprops);
        let v_res = this.http.post<boolean>(v_url, v_Body, { headers: v_headers });
        this.apiCache.invalidateContaining("/uiLayout/widget");
        this.debugLog();
        return v_res;
    }
    setContainerInfo(containerInfo: WidgetContainerInfo): Observable<string> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}/users/uiLayout/container`;
        let v_Body = JSON.stringify(containerInfo);

        let v_res = this.http.post<string>(v_url, v_Body, { headers: v_headers });
        this.apiCache.invalidateContaining("/uiLayout");
        this.debugLog();
        return v_res;
    }
    createWidgetContainer(containerInfo: WidgetContainerInfo): Observable<string> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}/users/uiLayout/container`;
        let v_Body = JSON.stringify(containerInfo);

        let v_res = this.http.put<string>(v_url, v_Body, { headers: v_headers });
        this.apiCache.invalidateContaining("/uiLayout");
        this.debugLog();
        return v_res;
    }

    createWidgetLayout(layoutInfo: WidgetLayoutInfo): Observable<string> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}/users/uiLayout/layout`;
        let v_Body = JSON.stringify(layoutInfo);

        let v_res = this.http.post<string>(v_url, v_Body, { headers: v_headers });
        this.apiCache.invalidateContaining("/uiLayout");
        this.debugLog();
        return v_res;
    }

    modifyWidgetLayout(layoutInfo: WidgetLayoutInfo): Observable<void> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}/users/uiLayout/layout`;
        let v_Body = JSON.stringify(layoutInfo);

        let v_res = this.http.put<void>(v_url, v_Body, { headers: v_headers });
        this.apiCache.invalidateContaining("/uiLayout");
        this.debugLog();
        return v_res;
    }

    getWidgetLayouts(): Observable<Array<WidgetLayoutInfo>> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}/users/uiLayout/layout`;

        let cacheOptions: CacheOptions = new CacheOptions();
        cacheOptions.cacheLocation = CacheLocation.sessionStorage;
        cacheOptions.maxAge = 120;


        let v_Response = this.apiCache.httpGetCacheableResponse<Array<WidgetLayoutInfo>>(v_Url, { headers: v_Headers }, cacheOptions);
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }

    deleteWidgetLayout(layoutID: string): Observable<boolean> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}/users/uiLayout/layout?layoutID=${layoutID}`;

        let v_res = this.http.delete<boolean>(v_url, { headers: v_headers });
        this.apiCache.invalidateContaining("/uiLayout");
        this.debugLog();
        return v_res;
    }

    removeWidgetFromContainer(widgetID: string): Observable<boolean> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}/users/uiLayout/widget/${widgetID}`;
        let v_res = this.http.delete<boolean>(v_url, { headers: v_headers });
        this.apiCache.invalidateContaining("/uiLayout");
        this.debugLog();
        return v_res;
    }
    getWidgetContainerForUser(containerID: string): Observable<WidgetContainerInfo> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}/users/uiLayout/current/${containerID}`;

        let cacheOptions: CacheOptions = new CacheOptions();
        cacheOptions.cacheLocation = CacheLocation.sessionStorage;
        cacheOptions.maxAge = 120;


        let v_Response = this.apiCache.httpGetCacheableResponse<WidgetContainerInfo>(v_Url, { headers: v_Headers }, cacheOptions);
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }

    getLandingPageContainers(): Observable<Array<WidgetContainerBasicInfo>> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}organizations/current/tenants/landingPages`;

        let v_Response = this.http.get<Array<WidgetContainerBasicInfo>>(v_Url, { headers: v_Headers });

        this.debugLog();

        return v_Response;
    }

    deleteLandingPageContainer(containerId: string): Observable<Array<WidgetContainerBasicInfo>> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}organizations/current/tenants/landingPages?containerID=${containerId}`;

        let v_Response = this.http.delete<Array<WidgetContainerBasicInfo>>(v_Url, { headers: v_Headers });

        this.debugLog();

        return v_Response;
    }

    copyWidgetContainer(containerId: string): Observable<string> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}organizations/current/tenants/landingPages/copy?containerID=${containerId}`;

        let v_Response = this.http.put<string>(v_Url, "", { headers: v_Headers });

        this.debugLog();

        return v_Response;
    }

    //getWidgetsInfo(containerID: string, widgetsArray: Array<string>): Observable<Array<ContainerWidgets>> {
    //    let v_headers = this.getAuthHeaders();
    //    let v_url = `${this.m_BaseURL}/users/dashboard/${containerID}/widgets?`;
    //    for (var i = 0; i < widgetsArray.length; i++) {
    //        if (i == 0) {
    //            v_url = v_url + "widgetsArray=" + widgetsArray[i]
    //        }
    //        else {
    //            v_url = v_url + "&widgetsArray=" + widgetsArray[i]
    //        }
    //    }
    //    let v_res = this.http.get(v_url, { headers: v_headers });
    //    return v_res;
    //}

    leGetSurveyLink(p_userID: string, p_sessionID: string, p_tenantID: string): Observable<string> {
        let v_url = `${this.m_BaseURL}liveevents/links/surveys?p_tenantID=${p_tenantID}&p_sessionID=${p_sessionID}&p_userID=${p_userID}`;
        let v_res = this.http.get<string>(v_url);
        this.debugLog();
        return v_res;
    }

    leGetSurvey(p_encryptedLinkInfo: string): Observable<LiveEventSurvey> {
        let v_encodedLinkInfo = encodeURIComponent(p_encryptedLinkInfo);
        let v_url = `${this.m_BaseURL}liveevents/surveys?p_linkInfo=${v_encodedLinkInfo}`;
        let v_res = this.http.get<LiveEventSurvey>(v_url);
        this.debugLog();
        return v_res;
    }

    leGetRegistrationLink(p_userID: string, p_sessionID: string, p_tenantID: string): Observable<string> {
        let v_url = `${this.m_BaseURL}liveevents/links/registrationinfo?p_tenantID=${p_tenantID}&p_sessionID=${p_sessionID}&p_userID=${p_userID}`;
        let v_res = this.http.get<string>(v_url);
        this.debugLog();
        return v_res;
    }

    leGetTenantIDFromLiveEventLink(p_encryptedLinkInfo: string): Observable<string> {
        let v_encodedLinkInfo = encodeURIComponent(p_encryptedLinkInfo);
        let v_url = `${this.m_BaseURL}liveevents/links/tenant?p_linkInfo=${v_encodedLinkInfo}`;
        let v_res = this.http.get<string>(v_url);
        this.debugLog();
        return v_res;
    }

    leGetRegistrationInfo(p_encryptedLinkInfo: string): Observable<LiveEventWrapper> {
        let v_headers = this.getAuthHeaders();
        let v_encodedLinkInfo = encodeURIComponent(p_encryptedLinkInfo);
        let v_url = `${this.m_BaseURL}liveevents/registrationInfo?p_linkInfo=${v_encodedLinkInfo}`;
        let v_res = this.http.get<LiveEventWrapper>(v_url, { headers: v_headers });
        this.debugLog();
        return v_res;
    }

    leGetSurveyInfo(p_encryptedLinkInfo: string): Observable<LiveEventWrapper> {
        let v_headers = this.getAuthHeaders();
        let v_encodedLinkInfo = encodeURIComponent(p_encryptedLinkInfo);
        let v_url = `${this.m_BaseURL}liveevents/surveyInfo?p_linkInfo=${v_encodedLinkInfo}`;
        let v_res = this.http.get<LiveEventWrapper>(v_url, { headers: v_headers });
        this.debugLog();
        return v_res;
    }

    leGetLiveEventSessionWrapper(p_sessionID: string, p_propertyTypeWhitelist: Array<LiveEventPropertyType>): Observable<LiveEventWrapper> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}liveevents/sessions/${p_sessionID}`;
        if (p_propertyTypeWhitelist.length > 0) {
            v_url += "?p_propertyTypeWhitelist=" + LiveEventPropertyType[p_propertyTypeWhitelist[0]];
        }
        for (let i: number = 1; i < p_propertyTypeWhitelist.length; i++) {
            v_url += "&p_propertyTypeWhitelist=" + LiveEventPropertyType[p_propertyTypeWhitelist[i]];
        }
        let v_res = this.http.get<LiveEventWrapper>(v_url, { headers: v_headers });
        this.debugLog();
        return v_res;
    }

    leGetLiveEventSessionWrappersInRange(p_startDate: Date, p_endDate: Date, p_excludeSessions: Array<string>, p_propertyTypeWhitelist: Array<LiveEventPropertyType>): Observable<Array<LiveEventWrapper>> {
        let v_startDate = p_startDate.toUTCString();
        let v_endDate = p_endDate.toUTCString();
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}liveevents/sessions?p_startDate=${v_startDate}&p_endDate=${v_endDate}`;
        for (let i: number = 0; i < p_propertyTypeWhitelist.length; i++) {
            v_url += "&p_propertyTypeWhitelist=" + LiveEventPropertyType[p_propertyTypeWhitelist[i]];
        }
        for (let i: number = 0; i < p_excludeSessions.length; i++) {
            v_url += "&p_excludeSessions=" + p_excludeSessions[i];
        }
        let v_body = JSON.stringify(p_propertyTypeWhitelist);
        let v_res = this.http.get<Array<LiveEventWrapper>>(v_url, { headers: v_headers });
        this.debugLog();
        return v_res;
    }

    leRegisterForEvent(p_sessionID: string, p_responses: Array<LiveEventProperty>): Observable<LiveEventWrapper> {
        let v_headers = this.getAuthHeaders();
        let v_body = JSON.stringify(p_responses);
        let v_url = `${this.m_BaseURL}liveevents/sessions/${p_sessionID}/registrants`;
        let v_res = this.http.post<LiveEventWrapper>(v_url, v_body, { headers: v_headers });
        this.debugLog();
        return v_res;
    }

    // DEPRECATED - use leRegisterForEvent
    //
    //leCompleteExternalRegistration(p_linkInfo: string, p_userIDOverride: string, p_responses: Array<LiveEventProperty>): Observable<string> {
    //    let v_linkInfo = encodeURIComponent(p_linkInfo);
    //    let v_headers = this.getAuthHeaders();
    //    let v_body = JSON.stringify(p_responses);
    //    let v_url = `${this.m_BaseURL}liveevents/sessions/registrationTokens?p_linkInfo=${v_linkInfo}&p_userIDOverride=${p_userIDOverride}`;
    //    let v_res = this.http.post(v_url, v_body, { headers: v_headers });
    //    this.debugLog();
    //    return v_res;
    //}

    leRemoveRegistration(p_sessionID: string, p_userID: string): Observable<boolean> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}liveevents/sessions/${p_sessionID}/registrants/${p_userID}/remove`;
        let v_res = this.http.get<boolean>(v_url, { headers: v_headers });
        this.debugLog();
        return v_res;
    }

    leSumbitSurvey(p_sessionID: string, p_responses: Array<LiveEventProperty>): Observable<boolean> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}liveevents/sessions/${p_sessionID}/surveys`;
        let v_body = JSON.stringify(p_responses);
        let v_res = this.http.post<boolean>(v_url, v_body, { headers: v_headers });
        this.debugLog();
        return v_res;
    }

    leGetUserProperties(p_liveEventID: string, p_sessionID: string, p_propertyType: string): Observable<Array<LiveEventProperty>> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}liveevents/${p_liveEventID}/sessions/${p_sessionID}/registrants/properties/${p_propertyType}`;
        let v_res = this.http.get<Array<LiveEventProperty>>(v_url, { headers: v_headers });
        this.debugLog();
        return v_res;
    }

    leShareEventICS(p_sessionID: string, p_userID: string): Observable<boolean> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}liveevents/sessions/${p_sessionID}/share/${p_userID}`;
        let v_res = this.http.get<boolean>(v_url, { headers: v_headers });
        this.debugLog();
        return v_res;
    }

    leGetUserRegistrationInfo(p_sessionID: string, p_userID: string, p_propertyTypeWhitelist: Array<LiveEventPropertyType>, p_onlyFullyRegistered: boolean): Observable<LiveEventRegistrant> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}liveevents/sessions/${p_sessionID}/registrants/${p_userID}?p_onlyFullyRegistered=${p_onlyFullyRegistered}`;
        for (let i = 0; i < p_propertyTypeWhitelist.length; i++) {
            v_url += "&p_propertyTypeWhitelist=" + LiveEventPropertyType[p_propertyTypeWhitelist[i]];
        }
        let v_res = this.http.get<LiveEventRegistrant>(v_url, { headers: v_headers });
        this.debugLog();
        return v_res;
    }

    leGetIncompletePrerequisites(p_liveEventID: string): Observable<Array<ContentPrerequisite>> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}liveevents/${p_liveEventID}/prerequisites`;
        let v_res = this.http.get<Array<ContentPrerequisite>>(v_url, { headers: v_headers });
        this.debugLog();
        return v_res;
    }

    getContentAuthoringData(p_contentId: String, p_contentType: String): Observable<ContentAuthoring> {
        let v_headers = this.getAuthHeaders();

        let v_url = `${this.m_BaseURL}content/${p_contentId}/authoring/?contentType=${p_contentType}`;
        let v_result = this.http.get<ContentAuthoring>(v_url, { headers: v_headers });
        this.debugLog();
        return v_result;
    }

    getUniqueUsersReport(): Observable<UniqueUsersReportData> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}/reports/uniqueUsers`;
        let v_res = this.http.get<UniqueUsersReportData>(v_url, { headers: v_headers });
        this.debugLog();
        return v_res;
    }
    getTopSearchesReport(): Observable<TopSearchTermsData> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}/reports/topSearches`;
        let v_res = this.http.get<TopSearchTermsData>(v_url, { headers: v_headers });
        this.debugLog();
        return v_res;
    }

    // CR - Add following methods into project later

    //wgGetAssetUsage(p_workgroupID: string, p_daysBeforeNow: number): Observable<Array<WorkgroupAssetUsageData>> {
    //    let v_headers = this.getAuthHeaders();
    //    let v_url = `${this.m_BaseURL}workgroups/${p_workgroupID}/assetUsage?p_daysBeforeNow=${p_daysBeforeNow}`;
    //    let v_res = this.http.get<Array<WorkgroupAssetUsageData>>(v_url, { headers: v_headers });
    //    this.debugLog();
    //    return v_res;
    //}

    //wgGetLearningUsage(p_workgroupID: string, p_daysBeforeNow: number): Observable<Array<WorkgroupLearningUsageData>> {
    //    let v_headers = this.getAuthHeaders();
    //    let v_url = `${this.m_BaseURL}workgroups/${p_workgroupID}/learningUsage?p_daysBeforeNow=${p_daysBeforeNow}`;
    //    let v_res = this.http.get<Array<WorkgroupLearningUsageData>>(v_url, { headers: v_headers });
    //    this.debugLog();
    //    return v_res;
    //}

    //wgGetLearningChartUsage(p_workgroupID: string, p_daysBeforeNow: number): Observable<Array<WorkgroupLearningUsageData2>> {
    //    let v_headers = this.getAuthHeaders();
    //    let v_url = `${this.m_BaseURL}workgroups/${p_workgroupID}/learningChartUsage?p_daysBeforeNow=${p_daysBeforeNow}`;
    //    let v_res = this.http.get<Array<WorkgroupLearningUsageData2>>(v_url, { headers: v_headers });
    //    this.debugLog();
    //    return v_res;
    //}

    //wgGetLearningPieUsage(p_workgroupID: string, p_daysBeforeNow: number): Observable<Array<WorkgroupLearningUsageData3>> {
    //    let v_headers = this.getAuthHeaders();
    //    let v_url = `${this.m_BaseURL}workgroups/${p_workgroupID}/learningPieUsage?p_daysBeforeNow=${p_daysBeforeNow}`;
    //    let v_res = this.http.get<Array<WorkgroupLearningUsageData3>>(v_url, { headers: v_headers });
    //    this.debugLog();
    //    return v_res;
    //}

    CopyWidgetLayout(ispublic: boolean, widgetLayout: WidgetLayoutInfo): Observable<WidgetLayoutInfo> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}users/uiLayout/copy/${ispublic}`;
        let v_body = JSON.stringify(widgetLayout);
        let v_res = this.http.put<WidgetLayoutInfo>(v_url, v_body, { headers: v_headers });
        this.debugLog();
        return v_res;
    }
    getSettingByName(settingName: string): Observable<Setting> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}organizations/current/tenants/current/settings/name/${settingName}`;

        let cacheOptions: CacheOptions = new CacheOptions();
        cacheOptions.cacheLocation = CacheLocation.sessionStorage;
        cacheOptions.maxAge = 60;


        let v_Response = this.apiCache.httpGetCacheableResponse<Setting>(v_Url, { headers: v_Headers }, cacheOptions);
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }
    getSettingByNameAndTenant(settingName: string, tenantId): Observable<Setting> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}organizations/tenants/${tenantId}/settings/name/${settingName}`;

        let cacheOptions: CacheOptions = new CacheOptions();
        cacheOptions.cacheLocation = CacheLocation.sessionStorage;
        cacheOptions.maxAge = 60;


        let v_Response = this.apiCache.httpGetCacheableResponse<Setting>(v_Url, { headers: v_Headers }, cacheOptions);
        if (v_Response.retrievedFromCache == false) {
            this.debugLog();
        }
        return v_Response.data;
    }

    UpdateCurrentUserToolDownloadDate(): Observable<boolean> {
        let v_Headers = this.getAuthHeaders();
        let v_Url = `${this.m_BaseURL}users/current/userToolDownloaded/`;

        let v_Response = this.http.put<boolean>(v_Url, "", { headers: v_Headers });

        return v_Response;
    }

    lpGetScormModel(enrollmentId: string): Observable<ScormModel> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}scorm/tracking?p_enrollmentId=${enrollmentId}`;
        let v_res = this.http.get<ScormModel>(v_url, { headers: v_headers });
        this.debugLog();
        return v_res;
    }

    lpSetScormModel(enrollmentId: string, sourceModel: any): Observable<ScormModel> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}/scorm/tracking?p_enrollmentId=${enrollmentId}`;
        let v_body = JSON.stringify(sourceModel);
        let v_res = this.http.post<ScormModel>(v_url, v_body, { headers: v_headers });
        this.debugLog();
        return v_res;
    }

    lpGetScormModel2004(enrollmentId: string): Observable<ScormModel> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}scorm/tracking2004?p_enrollmentId=${enrollmentId}`;
        let v_res = this.http.get<ScormModel>(v_url, { headers: v_headers });
        this.debugLog();
        return v_res;
    }

    lpSetScormModel2004(enrollmentId: string, sourceModel: any): Observable<ScormModel> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}/scorm/tracking2004?p_enrollmentId=${enrollmentId}`;
        let v_body = JSON.stringify(sourceModel);
        let v_res = this.http.post<ScormModel>(v_url, v_body, { headers: v_headers });
        this.debugLog();
        return v_res;
    }

    getBaseUrl(): string {
        return this.m_BaseURL.toString();
    }

    createEnrollmentFromAssessment(requestObj: CreateEnrollmentFromAssessmentRequest): Observable<string> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}enrollments/createEnrollmentFromAssessment`;
        let v_body = JSON.stringify(requestObj);
        let v_res = this.http.put<string>(v_url, v_body, { headers: v_headers });
        this.debugLog();
        return v_res;
    }


    assignTrainingForAssessmentCompletion(requestObj: AssignTrainingForAssessmentCompletionRequest): Observable<string> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}enrollments/assignTrainingForAssessmentCompletion`;
        let v_body = JSON.stringify(requestObj);
        let v_res = this.http.put<string>(v_url, v_body, { headers: v_headers });
        this.debugLog();
        return v_res;
    }

    switchTenant(accountOrgID: number, tenantID: string): Observable<string> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}organizations/${accountOrgID}/tenants/${tenantID}/accessToken/switch`;
        let v_res = this.http.get<string>(v_url, { headers: v_headers });
        this.debugLog();
        return v_res;
    }
    switchTenantV2(accountOrgID: number, tenantID: string): Observable<APIV2AccessKey> {
        let v_headers = this.getAuthHeaders();
        let v_url = `${this.m_BaseURL}organizations/${accountOrgID}/tenants/${tenantID}/accessTokenV2/switch`;
        let v_res = this.http.get<APIV2AccessKey>(v_url, { headers: v_headers });
        this.debugLog();
        return v_res;
    }
}
