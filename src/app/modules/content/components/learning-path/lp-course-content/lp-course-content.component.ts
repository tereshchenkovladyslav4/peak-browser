import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { ContentType, Video, Workflow, ContentDetails, Quiz } from 'src/app/resources/models/content';
import { EnrollmentVideoTracking, LearningPathStateService } from 'src/app/state/learning-path/learning-path-state.service';
import { VideoViewComponent } from '../../video-view/video-view.component';
import { LearningPathActionsService } from 'src/app/state/learning-path/actions/learning-path-actions.service';
import { QuizStateService } from 'src/app/state/quiz/quiz-state.service';

@Component({
  selector: 'ep-lp-course-content',
  templateUrl: './lp-course-content.component.html',
  styleUrls: ['./lp-course-content.component.scss']
})
export class LpCourseContentComponent implements OnInit {
  @ViewChild(VideoViewComponent) videoViewComponent: VideoViewComponent;

  readonly contentType = ContentType;
  protected readonly Video = Video;
  protected readonly Workflow = Workflow;
  protected readonly Quiz = Quiz;

  // observables
  courseContent$: Observable<ContentDetails>;
  isLoading$: Observable<boolean>;
  isQuizOpen$: Observable<boolean>;
  isCourseSummaryOpen$: Observable<boolean>;

  // tracking:
  videoTracking: EnrollmentVideoTracking;
  videoIsPlaying: boolean;

  constructor(
    private learningPathActions: LearningPathActionsService,
    private learningPathState: LearningPathStateService,
    private quizState: QuizStateService
  ) {

  }

  ngOnInit(): void {
    this.setCourseContent();
    this.setIsLoading();
    this.setIsQuizOpen();
    this.setIsFinishCourseSelected();
  }

  private setCourseContent() {
    this.courseContent$ = this.learningPathState.activeCourseContentDetails$;
  }

  private setIsLoading() {
    this.isLoading$ = this.learningPathState.isLoading$;
  }

  private setIsQuizOpen() {
    this.isQuizOpen$ = this.quizState.isQuizOpen$;
  }

  private setIsFinishCourseSelected() {
    this.isCourseSummaryOpen$ = this.learningPathState.isCourseSummaryOpen$;
  }

  /**
   * update video tracking when video loads
   * @param event ablePlayer object
   */
  onLoaded(event) {
    // External videos (YouTube & Vimeo) raise no events from able player so we have decided to mark them as complete
    // as soon as they are loaded as there are no other straightforward options.
    if (event && this.videoViewComponent.videoInfo.isExternalVideo) {
      this.videoTracking = new EnrollmentVideoTracking(
        this.videoViewComponent.videoContent.id,
        this.learningPathState.activeEnrolledCourse.courseId,
        this.learningPathState.activeEnrolledCourse.enrollmentId,
        this.videoViewComponent.videoInfo.isExternalVideo,
        this.learningPathState.activeEnrolledCourse.settings.overrideReqVidWatchPct,
        this.learningPathState.activeEnrolledCourse.settings.reqVidWatchPct,
        this.videoViewComponent.videoInfo.durationSeconds
      );

      this.videoTracking.isComplete = true;
      this.videoTracking.endTime = new Date();
      this.learningPathActions.postEnrollmentVideoTracking(this.videoTracking);
    }
  }

  onPlay(event) {
    const videoEl = (event.target as HTMLVideoElement);
    if (this.learningPathState.snapshot.isLearningPathOpen && videoEl) {

      // Restart the tracking whenever the video is played as we should only track 'play time'.
      this.videoTracking = new EnrollmentVideoTracking(
        this.videoViewComponent.videoContent.id,
        this.learningPathState.activeEnrolledCourse.courseId,
        this.learningPathState.activeEnrolledCourse.enrollmentId,
        this.videoViewComponent.videoInfo.isExternalVideo,
        this.learningPathState.activeEnrolledCourse.settings.overrideReqVidWatchPct,
        this.learningPathState.activeEnrolledCourse.settings.reqVidWatchPct,
        this.videoViewComponent.videoInfo.durationSeconds
      );

      // only mark videos complete onPlay when required watch length is NOT set
      if (!this.videoTracking.isRequiredToWatchVideo) {
        this.videoTracking.isComplete = true;
      }
    }

    this.videoIsPlaying = true;
  }

  onTimeUpdate(event) {
    const videoEl = (event.target as HTMLVideoElement);
    if (this.learningPathState.snapshot.isLearningPathOpen && videoEl) {
      // update this videos course/content progress when required vid watch length is set so ui progress bar is updated accordingly
      this.videoTracking.updateLastVideoPosition(videoEl.currentTime, this.learningPathState.activeEnrolledCourseContent.progress)
      this.learningPathActions.updateVideoTrackingAction(this.videoTracking);
    }

    this.videoIsPlaying = true;
  }

  onPause(event) {
    const videoEl = (event.target as HTMLVideoElement);
    // video currentTime compared to video duration cuz we don't want duplicate backend calls when onEnded is fired
    if (this.learningPathState.snapshot.isLearningPathOpen && videoEl && videoEl?.currentTime !== videoEl?.duration) {
      this.videoTracking.endTime = new Date();
      this.learningPathActions.postEnrollmentVideoTracking(this.videoTracking);
    }

    this.videoIsPlaying = false;
  }

  onEnded(event) {
    this.videoTracking.endTime = new Date();
    this.learningPathActions.postEnrollmentVideoTracking(this.videoTracking);
    this.videoIsPlaying = false;
  }

  onVideoDestroyed() {
    // Catch navigation when the video is still playing as we don't get any other events:
    if (this.videoIsPlaying) {
      this.videoTracking.endTime = new Date();
      this.learningPathActions.postEnrollmentVideoTracking(this.videoTracking);
    }
    this.videoIsPlaying = false;
  }
}
