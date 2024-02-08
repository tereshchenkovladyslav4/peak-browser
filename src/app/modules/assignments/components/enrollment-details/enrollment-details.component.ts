import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, tap, map, concatMap, forkJoin, combineLatest, of } from 'rxjs';
import { TableModule } from 'primeng/table';
import { DialogBaseComponent, DialogConfig } from '../../../../components/dialog/dialog-base/dialog-base.component';
import { DialogRef } from '../../../../services/dialog/dialog-ref';
import { DIALOG_DATA } from '../../../../services/dialog/dialog-tokens';
import { SharedModule } from '../../../shared/shared.module';
import { Certificate, CertificateUnavailableReason } from '../../../../resources/models/certificate';
import { EnrollmentService } from '../../../../services/enrollment.service';
import { AssignmentEnrollmentStatus, AssignmentHistory } from '../../../../resources/models/assignment';
import { ContentType, Course } from '../../../../resources/models/content';
import { ContentService } from '../../../../services/content.service';
import { QuizMenuComponent } from '../quiz-menu/quiz-menu.component';
import { QuizSummary } from '../../../../resources/models/content/quiz';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { DownloadService } from '../../../../services/download/download.service';
import { AssignmentBookmarkComponent } from '../assignment-bookmark/assignment-bookmark.component';

@Component({
  selector: 'ep-enrollment-details',
  templateUrl: './enrollment-details.component.html',
  styleUrls: ['./enrollment-details.component.scss'],
  standalone: true,
  imports: [
    DialogBaseComponent,
    QuizMenuComponent,
    SharedModule,
    CommonModule,
    TableModule,
    LoadingComponent,
    AssignmentBookmarkComponent,
  ],
})
export class EnrollmentDetailsComponent extends DialogBaseComponent implements OnInit {
  certificate: Certificate;
  certificateUnavailableReason = '';
  quizzes: QuizSummary[];
  isLoaded$ = new Subject<boolean>();

  constructor(
    protected override dialogRef: DialogRef,
    @Inject(DIALOG_DATA)
    public override data: {
      config?: DialogConfig;
      assignmentHistory: AssignmentHistory;
      enrollId: string;
      courseId: string;
    },
    private enrollmentService: EnrollmentService,
    private contentService: ContentService,
    private downloadService: DownloadService,
  ) {
    super(dialogRef, data);
  }

  ngOnInit() {
    const certificate$ = this.enrollmentService.getCertificate(this.data.enrollId, this.data.courseId).pipe(
      tap((res) => {
        this.certificate = res;
        if (this.certificate?.useAsDefault) {
          this.certificateUnavailableReason = 'assignments.certificates-available';
        } else if (this.certificate?.reasonUnavailable === CertificateUnavailableReason.NOT_COMPLETE) {
          if (this.data.assignmentHistory.status === AssignmentEnrollmentStatus.Dropped) {
            this.certificateUnavailableReason = 'assignments.certificates-not-available-dropped';
          } else {
            this.certificateUnavailableReason = 'assignments.certificates-not-available-skipped';
          }
        } else if (this.certificate?.reasonUnavailable === CertificateUnavailableReason.FAILED_QUIZ) {
          this.certificateUnavailableReason = 'assignments.certificates-not-available-failed-quiz';
        } else {
          this.certificateUnavailableReason = 'assignments.certificates-not-available';
        }
      }),
    );

    const quizzes$ = this.contentService.getContentDetails(this.data.courseId).pipe(
      map((res: Course) => {
        return res.content?.filter((item) => item.type === ContentType.Quiz) || [];
      }),
      concatMap((quizzes) => {
        if (!quizzes.length) {
          return of([]);
        }

        return forkJoin(
          quizzes.map((quiz) =>
            this.enrollmentService.getQuizSessions(this.data.enrollId, quiz.id).pipe(
              map((quizSessions) => {
                const scores = quizSessions.map(
                  (session) => session.quizAnswersCorrect / (session.quizAnswersPossible || 1),
                );
                const highestScoreIndex = scores.indexOf(Math.max(...scores));
                const highestSession = quizSessions[highestScoreIndex];

                const lastCompletionSession = quizSessions
                  .filter((item) => item.isComplete)
                  .sort((a, b) => b.endDatetime.toString().localeCompare(a.endDatetime.toString()))[0];

                const result: QuizSummary = {
                  id: quiz.id,
                  courseName: this.data.assignmentHistory.name,
                  name: quiz.name,
                  attempts: quizSessions.length,
                  quizAnswersPossible: highestSession.quizAnswersPossible,
                  quizAnswersCorrect: highestSession.quizAnswersCorrect,
                  lastCompletionDate: lastCompletionSession?.endDatetime,
                  sessions: quizSessions,
                };
                return result;
              }),
            ),
          ),
        );
      }),
      tap((quizzes) => (this.quizzes = quizzes)),
    );

    combineLatest([certificate$, quizzes$]).subscribe(
      () => {
        this.isLoaded$.next(true);
      },
      () => {
        this.isLoaded$.next(true);
      },
    );
  }

  downloadCertificate(link: string) {
    this.downloadService.download(link).subscribe();
  }
}
