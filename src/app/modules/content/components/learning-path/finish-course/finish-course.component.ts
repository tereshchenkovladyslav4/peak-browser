import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest, filter, map } from 'rxjs';
import { FinishCourseState, LearningPathStateService } from 'src/app/state/learning-path/learning-path-state.service';



@Component({
  selector: 'ep-finish-course',
  templateUrl: './finish-course.component.html',
  styleUrls: ['./finish-course.component.scss']
})
export class FinishCourseComponent implements OnInit {
  isLoaded$: Observable<boolean>;
  activeCourseProgress$: Observable<number>;
  finishCourseState$: Observable<FinishCourseState>;

  courseCertificateUrl: string = null;

  readonly FinishCourseState = FinishCourseState;

  constructor(
    private learningPathState: LearningPathStateService
  ) { }

  ngOnInit(): void {
    this.setCourseProgress();
    this.setFinishCourseState();
    this.setCourseCertificate();
    this.setIsLoaded();
  }

  private setFinishCourseState() {
    this.finishCourseState$ = this.learningPathState.finishCourseState$;
  }

  private setCourseProgress() {
    this.activeCourseProgress$ = this.learningPathState.activeCourseProgress$;
  }

  private setCourseCertificate() {
    this.courseCertificateUrl = '';
  }

  private setIsLoaded() {
    this.isLoaded$ = combineLatest([
      this.finishCourseState$,
      this.activeCourseProgress$
    ]).pipe(
      filter(([finishCourseState, activeCourseProgress]) => !!finishCourseState && activeCourseProgress >= 0),
      map(_ => true)
    )
  }

  downloadCertificate() {
    if (!this.courseCertificateUrl) return;

    // TODO - implement after AU
    // window.location.href = this.courseCertificateUrl;
  }

  shareFeedback() {
    alert('Share Feedback not implemented yet');
  }

  navigateToEnrollmentHistory() {
    alert('Enrollment History not implemented yet')
  }
}
