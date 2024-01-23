import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {mergeMap, Observable, tap, throwError} from 'rxjs';
import {AuthorizationService} from '../components/dev-authorization/authorization.service';
import {AppComponent} from '../app.component';
import {catchError, map} from 'rxjs/operators';
import {TranslationService} from 'src/app/services/translation.service';
import {
  ContentDetails,
  ContentSummary,
  DiagramView,
  GetContentDetailsResponse,
  GetContentSummaryResponse,
  GetDiagramViewResponse,
  GetTaskStepsResponse,
  getUserMicroResponse
} from "src/app/resources/models/content"
import {ALLOWABLE_CONTENT_TYPES} from "../resources/constants/allowable-types";
import {CONSTANTS} from "../config/constants";
import {ProdGenApi} from "./apiService/prodgen.api";
import {Apiv2Service} from "./apiService/apiv2.service";
import {CommentsStateService} from "../state/comments/comments-state.service";
import {Comment} from "./apiService/classFiles/class.content";
import {LearningPathUserAssignmentsResponse} from '../resources/models/assignment';
import {BookmarksStateService} from "../state/bookmarks/bookmarks-state.service";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
//Be sure to call Initialize()!!!
export class ContentService {

  private get apiUrl(): string {
    return AppComponent.apiUrl;
  }


  constructor(private httpClient: HttpClient,
    private authorizationService: AuthorizationService,
    private v1Service: ProdGenApi,
    private v2Service: Apiv2Service,
    private translationService: TranslationService,
    private commentsState: CommentsStateService,
    private bookmarksState: BookmarksStateService
  ) { }

  //EP
  getContentDetails(contentId: string): Observable<ContentDetails> {
    const headers = this.authorizationService.getHeaders();
    return this.httpClient
      .get<GetContentDetailsResponse<ContentDetails>>(`${this.apiUrl}/content/enduser/${contentId}`, { headers })
      .pipe(
        map(res => res.content),
        map(content => ({
            ...content,
            isBookmarked: this.bookmarksState.isContentBookmarked(contentId)
          })
        ),
        catchError(this.errorHandler.bind(this))
      );
  }

  //EP
  getContentComments(contentId: string): Observable<Comment[]> {
    const headersV1 = this.v1Service.getAuthHeaders();
    const headersV2 = this.v2Service.getv2AuthHeaders();
    const headers = headersV2.append('userAccessKey', headersV1.get('userAccessKey'))

    return this.httpClient
      .get<{ content: Comment[] }>(`${this.apiUrl}/content/${contentId}/comments`, { headers })
      .pipe(
        map(res => res.content?.map(c => ({
          ...c,
          publishDate: new Date(c?.publishDate)
        }))),
        tap(res => this.commentsState.updateComments(res)),
        mergeMap(() => this.commentsState.getComments()),
        catchError(this.errorHandler.bind(this))
      );
  }


  //EP
  deleteContentComment(contentId: string, commentId: string): Observable<any> {
    const headersV1 = this.v1Service.getAuthHeaders();
    const headersV2 = this.v2Service.getv2AuthHeaders();
    const headers = headersV2.append('userAccessKey', headersV1.get('userAccessKey'))
    const params = new HttpParams({
      fromObject: {
        commentId: commentId,
      }
    });

    return this.httpClient
      .delete<{ content: Comment }>(`${this.apiUrl}/content/${contentId}/comments`, { headers, params })
      .pipe(
        tap(() => this.commentsState.deleteComment(commentId)),
        catchError(this.errorHandler.bind(this))
      );
  }

  //EP
  createContentComment(contentId: string, contentType: string, comment: { commentText: string }): Observable<any> {
    const headersV1 = this.v1Service.getAuthHeaders();
    const headersV2 = this.v2Service.getv2AuthHeaders();
    const headers = headersV2.append('userAccessKey', headersV1.get('userAccessKey'))
    const params = new HttpParams({
      fromObject: {
        contentType: contentType,
      }
    });

    return this.httpClient
      .post<{ content: Comment }>(`${this.apiUrl}/content/${contentId}/comments`, comment, { headers, params })
      .pipe(
        map(res => ({
          ...res?.content,
          publishDate: new Date(res?.content?.publishDate)
        })),
        tap(res => this.commentsState.addComment(res)),
        catchError(this.errorHandler.bind(this))
      );
  }

  //EP
  getRelatedContents(contentId: string): Observable<ContentSummary[]> {
    const headers = this.authorizationService.getHeaders();
    const params = new HttpParams({
      fromObject: {
        contentId: contentId,
      }
    });

    return this.httpClient
      .get<GetContentSummaryResponse<any>>(`${this.apiUrl}/content/relatedItems`, { headers, params })
      .pipe(
        map(res => res.content),
        map(results => results.filter(r => ALLOWABLE_CONTENT_TYPES.includes(r.type))),
        catchError(this.errorHandler.bind(this))
      );
  }

  //EP
  getWorkflowDiagram(workflowId: string): Observable<DiagramView> {
    // using v1 since v2 has manage content permission check in endpoint
    const headers = this.v1Service.getAuthHeaders();
    return this.httpClient
      .get(`${environment.apiUrlV1}/content/workflows/${workflowId}/diagramview`, { headers })
      .pipe(catchError(this.errorHandler.bind(this)));
  }

  //EP
  getProcessDiagram(processId: string): Observable<GetDiagramViewResponse> {
    const headers = this.authorizationService.getHeaders();
    return this.httpClient
      .get<GetDiagramViewResponse>(`${this.apiUrl}/content/processes/diagram/${processId}`, { headers })
      .pipe(catchError(this.errorHandler.bind(this)));
  }

  getTaskSteps(taskId: string): Observable<GetTaskStepsResponse> {
    const headers = this.authorizationService.getHeaders();
    return this.httpClient
      .get(`${this.apiUrl}/content/tasks/${taskId}/steps/`, { headers })
      .pipe(catchError(this.errorHandler.bind(this)));
  }

  getContentExperts(topicNames: string[]): Observable<getUserMicroResponse> {
    const url = `${this.apiUrl}/content/experts`;
    const headers = this.authorizationService.getHeaders();
    return this.httpClient
      .post<getUserMicroResponse>(url, topicNames, { headers })
      .pipe(catchError(this.errorHandler.bind(this)));
  }

  getLearningPathUserAssignments(learningPathId: string): Observable<LearningPathUserAssignmentsResponse> {
    const headers = this.authorizationService.getHeaders();
    return this.httpClient
      .get<LearningPathUserAssignmentsResponse>(`${this.apiUrl}/assignments/${learningPathId}`, { headers })
      .pipe(catchError(this.errorHandler.bind(this)));
  }

  private errorHandler(response: any) {
    const error = response.error;
    const keys = Object.keys(error);
    const key = keys[0];
    let message = error[key];

    if (response.status === 0) {
      console.log(this.translationService.getTranslationFileData('general-toast-area.server-error-toast-message'));
    }

    if (error[key] instanceof Array) {
      message = error[key][0];
    }

    return throwError({ messages: message, error });
  }
}
