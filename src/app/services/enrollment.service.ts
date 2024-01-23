import { Injectable } from '@angular/core';
import { AppComponent } from '../app.component';
import { AuthorizationService } from '../components/dev-authorization/authorization.service';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ContentDetails, GetContentDetailsResponse } from '../resources/models/content';
import { HttpClient } from '@angular/common/http';
import { TranslationService } from './translation.service';
import { QuizSession, TrackedQuestion } from '../resources/models/content/quiz';
import { PostEnrollmentTrackingItemRequest, PostEnrollmentTrackingItemResponse } from '../resources/models/enrollment';
import { Certificate } from '../resources/models/certificate';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {

  private get apiUrl(): string {
    return AppComponent.apiUrl;
  }

  constructor(
    private httpClient: HttpClient, 
    private authorizationService: AuthorizationService,
    private translationService: TranslationService
  ) {

  }

  getEnrollmentContentItem(enrollmentId: string, contentId: string): Observable<ContentDetails> {
    const headers = this.authorizationService.getHeaders();
    return this.httpClient
      .get<GetContentDetailsResponse<ContentDetails>>(`${this.apiUrl}/enrollments/enduser/${enrollmentId}/content/${contentId}`, { headers })
      .pipe(
        map(res => res.content),
        catchError(this.errorHandler.bind(this))
      );
  }

  getEnrollmentQuizTrackingItem(enrollId: string, quizId: string): Observable<QuizSession[]> {
    const headers = this.authorizationService.getHeaders();
    return this.httpClient
      .get<QuizSession[]>(`${this.apiUrl}/enrollments/enduser/${enrollId}/trackingItem/${quizId}`, { headers })
      .pipe(
        catchError(this.errorHandler.bind(this))
      );
  }

  postEnrollmentTrackingItem(enrollmentId: string, request: PostEnrollmentTrackingItemRequest): Observable<PostEnrollmentTrackingItemResponse> {
    const headers = this.authorizationService.getHeaders();
    return this.httpClient
      .post(`${this.apiUrl}/enrollments/enduser/${enrollmentId}/trackingItem`, request, { headers })
      .pipe(catchError(this.errorHandler.bind(this)))
  }

  getQuizSessions(enrollId: string, quizId: string): Observable<QuizSession[]> {
    const headers = this.authorizationService.getHeaders();
    return this.httpClient
      .get(`${this.apiUrl}/enrollments/enduser/${enrollId}/quizSession/${quizId}`, { headers })
      .pipe(catchError(this.errorHandler.bind(this)))
  }

  createQuizSession(enrollId: string, quizId: string): Observable<QuizSession> {
    const headers = this.authorizationService.getHeaders();
    return this.httpClient
      .post(`${this.apiUrl}/enrollments/enduser/${enrollId}/quizSession/${quizId}`, { }, { headers })
      .pipe(catchError(this.errorHandler.bind(this)))
  }

  updateQuizSession(quizSession: QuizSession) {
    const headers = this.authorizationService.getHeaders();
    return this.httpClient
      .put(`${this.apiUrl}/enrollments/enduser/quizSession`, quizSession, { headers })
      .pipe(catchError(this.errorHandler.bind(this)))
  }

  updateTrackedQuestion(trackedQuestion: TrackedQuestion) {
    const headers = this.authorizationService.getHeaders();
    return this.httpClient
      .put(`${this.apiUrl}/enrollments/enduser/trackedQuestion`, trackedQuestion, { headers })
      .pipe(catchError(this.errorHandler.bind(this)))
  }

  getCertificate(enrollId: string, courseId: string): Observable<Certificate> {
    const headers = this.authorizationService.getHeaders();
    const url = `${this.apiUrl}/enrollments/${enrollId}/${courseId}/certificate`;
    return this.httpClient
      .get<{ certificate: Certificate }>(url, { headers })
      .pipe(
        map(res => res.certificate),
        catchError(this.errorHandler.bind(this))
      )
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
