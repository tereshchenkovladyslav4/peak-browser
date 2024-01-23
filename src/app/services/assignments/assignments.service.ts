import { Injectable } from '@angular/core';
import { FilterBaseService } from '../filter/filter-base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ProdGenApi } from '../apiService/prodgen.api';
import { Apiv2Service } from '../apiService/apiv2.service';
import { ActivatedRoute, Router } from '@angular/router';
import { formatDate, Location } from '@angular/common';
import { FilterStateService } from '../../state/filter/filter-state';
import { Observable, tap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthorizationService } from '../../components/dev-authorization/authorization.service';
import {
  Assignment,
  AssignmentEnrollment,
  CreateAssignmentOfContentResponse,
  LearningPathUserAssignmentsResponse,
  AssignmentStatusFilter,
} from '../../resources/models/assignment';
import { TranslationService } from '../translation.service';
import { environment } from 'src/environments/environment';
import { ContentTypesService } from '../content-types.service';

@Injectable({
  providedIn: 'root',
})
export class AssignmentsService extends FilterBaseService {

  constructor(
    private http: HttpClient,
    private v1Service: ProdGenApi,
    private v2Service: Apiv2Service,
    private authorizationService: AuthorizationService,
    protected override route: ActivatedRoute,
    protected override router: Router,
    protected override location: Location,
    protected override filterState: FilterStateService,
    private translationService: TranslationService,
    private contentTypesService: ContentTypesService,
  ) {
    super(route, router, location, filterState);
  }

  createAssignment(contentIds: string[], dueDate: Date | null): Observable<CreateAssignmentOfContentResponse> {
    const headers = this.authorizationService.getHeaders();
    return this.http.post<CreateAssignmentOfContentResponse>(
      `${environment.apiUrlV2}/assignments/enduser/CreateAssignment`,
      {
        ContentAssignments: [
          {
            ContentIds: contentIds,
          },
        ],
        DueDate: dueDate?.toISOString() || '',
      },
      { headers },
    );
  }

  getLearningPathUserAssignments(learningPathId: string): Observable<LearningPathUserAssignmentsResponse> {
    const headers = this.v2Service.getv2AuthHeaders();
    return this.http
      .get<LearningPathUserAssignmentsResponse>(`${environment.apiUrlV2}/assignments/${learningPathId}`, {
        headers,
      })
      .pipe(catchError(this.errorHandler.bind(this)));
  }

  markAssignmentAsCompleted(enrollId: string): Observable<{ assignment: AssignmentEnrollment }> {
    const headersV2 = this.v2Service.getv2AuthHeaders();
    const url = environment.apiUrlV2 + '/assignments/enduser/MarkAssignmentAsCompleted';
    return this.http
      .put(url, { AssignmentId: enrollId }, { headers: headersV2 })
      .pipe(catchError(this.errorHandler.bind(this)));
  }

  removeAssignments(enrollIds: string[]): Observable<{ succeeded: string[]; failed: string[] }> {
    const headersV2 = this.v2Service.getv2AuthHeaders();
    const url = environment.apiUrlV2 + '/assignments/enduser/enrollments/drop';
    return this.http
      .post(url, { EnrollmentIds: enrollIds }, { headers: headersV2 })
      .pipe(catchError(this.errorHandler.bind(this)));
  }

  updateAssignment(enrollId: string, assignors: string[], dueDate: Date): Observable<{ succeeded: string[]; failed: string[] }> {
    const headersV2 = this.v2Service.getv2AuthHeaders();
    const url = environment.apiUrlV2 + '/assignments/enduser/UpdateAssignmentDueDate';
    return this.http
      .put(url, { EnrollmentId: enrollId, DueDate: dueDate?.toISOString() || '' }, { headers: headersV2 })
      .pipe(catchError(this.errorHandler.bind(this)));
  }

  fetchCurrentAssignments(): Observable<Assignment[]> {
    const headersV1 = this.v1Service.getAuthHeaders();
    const headersV2 = this.v2Service.getv2AuthHeaders();
    const url = environment.apiUrlV2 + '/assignments/enduser';
    const headers = headersV2.append('userAccessKey', headersV1.get('userAccessKey'));
    const params = new HttpParams({
      fromObject: { assignmentStatusType: AssignmentStatusFilter.CurrentlyEnrolled },
    });

    return this.http.get<Assignment[]>(url, { headers: headers, params: params }).pipe(
      map(
        (results: Assignment[]) =>
          results?.map((assignment: Assignment) => ({
            ...assignment,
            contentType: this.contentTypesService.getContentInfoTranslationText(assignment.learningPath?.type, null),
            // this magic allows the typeahead search to look for matches within any of these properties
            searchBy:
              assignment.course?.name +
              assignment?.course?.description +
              assignment.learningPath?.name +
              assignment.learningPath?.description +
              assignment.assessment?.testName +
              this.formatDate(assignment.assessment?.expiryDate) +
              this.formatDate(assignment.dueDate),
          })),
      ),
    );
  }

  private formatDate(date: string): string {
    if (!date) {
      return '';
    }

    return formatDate(date, 'shortDate', 'en-US');
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
