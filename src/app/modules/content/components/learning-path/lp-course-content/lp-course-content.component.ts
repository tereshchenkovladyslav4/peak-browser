import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { ContentType, Video, Workflow, ContentDetails, Quiz } from 'src/app/resources/models/content';
import { LearningPathStateService } from 'src/app/state/learning-path/learning-path-state.service';
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
    if (event) {
      this.learningPathActions.onVideoLoadedTrackingAction(event?.duration, this.videoViewComponent.videoInfo.isExternalVideo)
    }
  }

  onPlay(event) {
    const videoEl = (event.target as HTMLVideoElement);
    if (this.learningPathState.snapshot.isLearningPathOpen && videoEl) {
      this.learningPathActions.onVideoPlayTrackingAction();
    }
  }

  onTimeUpdate(event) {
    const videoEl = (event.target as HTMLVideoElement);
    if (this.learningPathState.snapshot.isLearningPathOpen && videoEl) {
      this.learningPathActions.updateVideoTrackingAction(videoEl?.currentTime, videoEl?.duration);
    }
  }

  onPause(event) {
    const videoEl = (event.target as HTMLVideoElement);
    // video currentTime compared to video duration cuz we don't want duplicate backend calls when onEnded is fired
    if (this.learningPathState.snapshot.isLearningPathOpen && videoEl && videoEl?.currentTime !== videoEl?.duration) {
      this.learningPathActions.markVideoCompleteAction();
    }
  }

  onEnded(event) {
    this.learningPathActions.markVideoCompleteAction();
  }
}
