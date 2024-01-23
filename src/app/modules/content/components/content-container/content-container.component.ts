import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationStart, Params, Router} from "@angular/router";
import {distinctUntilChanged, filter, map, take, takeUntil, tap} from "rxjs/operators";
import {BehaviorSubject, combineLatest, mergeMap, Observable, of, Subject} from "rxjs";
import {ContentDetails, ContentSummary, ContentType, Video, Workflow} from '../../../../resources/models/content';
import { UserService } from 'src/app/services/user.service';
import { LayoutStateService } from 'src/app/state/layout/layout-state.service';
import { WorkflowViewState, WorkflowStateService } from 'src/app/state/workflow/workflow-state.service';
import { TranslationService } from 'src/app/services/translation.service';
import { LearningPathStateService } from 'src/app/state/learning-path/learning-path-state.service';
import { SessionStorageService } from 'src/app/services/storage/services/session-storage.service';
import { LearningPathActionsService } from 'src/app/state/learning-path/actions/learning-path-actions.service';
import { QuizStateService } from 'src/app/state/quiz/quiz-state.service';
import { Select, Store } from '@ngxs/store';
import { ContentDetailsState } from 'src/app/state/content-details/content-details.state';
import { StateReset } from 'ngxs-reset-plugin';
import { ContentDetailsActions } from 'src/app/state/content-details/content-details.actions';
import { Comment } from 'src/app/services/apiService/classFiles/class.content';
import { RelatedContentState } from 'src/app/state/related-content/related-content.state';
import { CommentsState } from 'src/app/state/comments/comments.state';
import { CourseState } from 'src/app/state/courses/courses.state';

@Component({
  selector: 'ep-content-container',
  templateUrl: './content-container.component.html',
  styleUrls: ['./content-container.component.scss']
})
export class ContentContainerComponent implements OnInit, OnDestroy {

  readonly contentType = ContentType;
  protected readonly Video = Video;
  protected readonly Workflow = Workflow;

  id$: Observable<string>;
  @Select(ContentDetailsState.contentDetails) contentDetails$: Observable<ContentDetails>;
  @Select(ContentDetailsState.isContentDetailsLoading) isContentDetailsLoading$: Observable<boolean>;
  @Select(CommentsState.comments) comments$: Observable<Comment[]>;
  @Select(CommentsState.isCommentsLoading) isCommentsLoading$: Observable<boolean>;
  @Select(RelatedContentState.relatedContent) relatedContent$: Observable<ContentSummary[]>;
  @Select(RelatedContentState.isRelatedContentLoading) isRelatedContentLoading$: Observable<boolean>;
  @Select(CourseState.isCoursesLoading) isCoursesLoading$: Observable<boolean>;

  private isDetailsLoading = new BehaviorSubject<boolean>(true);
  isDetailsLoading$ = this.isDetailsLoading.asObservable().pipe(distinctUntilChanged());

  accessDenied$: Observable<any>;
  isFullScreen$: Observable<boolean>;

  // workflow
  isWorkflowOpen$: Observable<boolean>;
  workflowViewState$: Observable<WorkflowViewState>;

  // learning path
  isLearningPathOpen$: Observable<boolean>;
  isCourseContentQuiz$: Observable<boolean>;
  isCourseSummaryOpen$: Observable<boolean>;
  
  // quiz
  isQuizOpen$: Observable<boolean>;

  // conditional template vars
  showWorkflowTree$: Observable<boolean>;
  showCoursesList$: Observable<boolean>;
  showContentFooter$: Observable<boolean>;
  showCourseNavButtons$: Observable<boolean>;
  showWorkflowSteps$: Observable<boolean>;
  showContentDetailsPanel$: Observable<boolean>;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private layoutState: LayoutStateService,
    private workflowState: WorkflowStateService,
    private learningPathActions: LearningPathActionsService,
    private learningPathState: LearningPathStateService,
    private translationService: TranslationService,
    private sessionStorage: SessionStorageService,
    private quizState: QuizStateService,
    private store: Store
  ) {
    this.router.canceledNavigationResolution = 'computed';
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.handleContentRouting();
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.setId();
    this.setIsWorkflowOpen();
    this.setIsLearningPathOpen();
    this.setIsCourseContentQuiz();
    this.setIsCourseSummaryOpen();
    this.setIsQuizOpen();
    this.setAccessDenied();
    this.dispatchContentDetails();
    this.manageLayout();
    this.manageWorkflowState();
    this.resetContentStates();
    this.setTemplateConditionalValues();
    this.setIsDetailsLoading();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleContentRouting() {
    if (this.route.snapshot.url.find(seg => seg.path === 'workflow')) {
      const layoutMsg = this.translationService.getTranslationFileData('content-container.exit-workflow');
      this.layoutState.setLayout('full-screen', layoutMsg);

      // need to reload LP state due to browser page refresh AND this workflow comes from an LP
      if (this.workflowState.isWorkflowFromLearningPath()) {
        this.learningPathActions.openLearningPathWorkflowAfterPageLoad();
      }

      this.workflowState.getInitialWorkflowData(this.route.snapshot.params["id"]);
    } else if (this.route.snapshot.url.find(seg => seg.path === 'learning-path')) {
      this.workflowState.reset();

      const layoutMsg = this.translationService.getTranslationFileData('content-container.exit-learning-path');
      this.layoutState.setLayout('full-screen', layoutMsg);
      this.learningPathActions.openLearningPathAfterPageLoad(this.route.snapshot.params["id"]);
    } else {
      this.layoutState.setLayout('default');
    }
  }

  onBrowseLibraries(): void {
    this.router.navigate(['libraries']);
  }

  private setId() {
    this.id$ = this.route.paramMap.pipe(
      map((params: Params) => {
        return params['get']('id')
      }),
      tap(_ => this.isDetailsLoading.next(true)),
      takeUntil(this.destroy$)
    );
  }

  private setAccessDenied() {
    this.accessDenied$ = combineLatest([
      this.id$,
      this.isLearningPathOpen$,
      of(this.sessionStorage.getItem<string>('workflowLearningPathId'))
    ]).pipe(
      take(1),
      filter(([id, _]) => !!id),
      mergeMap(([id, isLearningPathOpen, workflowLearningPathId]) => {
        if (isLearningPathOpen || workflowLearningPathId) {
          return of({hasAccess: true});
        }
        return this.userService.getUserAccessToContent(id);
      }),
      map(res => !res?.hasAccess)
    );
  }

  private dispatchContentDetails() {
    combineLatest([
      this.id$,
      this.accessDenied$,
    ]).pipe(
      filter(([id, isAccessDenied]) => !!id && !isAccessDenied),
      tap(([id, _]) => {
        const workflowLearningPathId = this.sessionStorage.getItem<string>('workflowLearningPathId');
        const contentId = this.learningPathState.snapshot.isLearningPathOpen && workflowLearningPathId
          ? workflowLearningPathId
          : id;
        this.store.dispatch(new ContentDetailsActions.GetContentDetails(contentId))
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private manageLayout() {
    this.isFullScreen$ = this.layoutState.selectIsFullScreen$;
  }

  private manageWorkflowState() {
    this.workflowViewState$ = this.workflowState.viewState$;
  }

  private setIsWorkflowOpen() {
    this.isWorkflowOpen$ = this.workflowState.isWorkflowOpen$;
  }

  private setIsLearningPathOpen() {
    this.isLearningPathOpen$ = this.learningPathState.isLearningPathOpen$;
  }

  private setIsQuizOpen() {
    this.isQuizOpen$ = this.quizState.isQuizOpen$;
  }

  private setIsCourseContentQuiz() {
    this.isCourseContentQuiz$ = this.learningPathState.activeCourseContentDetails$.pipe(
      map(contentDetails => contentDetails?.type === ContentType.Quiz)
    )
  }

  private setIsCourseSummaryOpen() {
    this.isCourseSummaryOpen$ = this.learningPathState.isCourseSummaryOpen$;
  }

  private resetContentStates() {
    this.router.events.pipe(
      takeUntil(this.destroy$)
    ).subscribe(e => {
      if (e instanceof NavigationStart && !e?.url?.includes('content')) {
        // perform cleanup when navigating away from any urls with /content in it
        this.workflowState.reset();
        this.learningPathActions.reset();
        this.layoutState.reset();
        this.sessionStorage.removeItem('workflowLearningPathId')
        this.store.dispatch(new StateReset(ContentDetailsState))
      }
    });
  }

  private setTemplateConditionalValues() {
    this.showWorkflowTree$ = combineLatest([
      this.isFullScreen$,
      this.isWorkflowOpen$,
      this.workflowViewState$
    ]).pipe(
      map(([isFullScreen, isWorkflowOpen, workflowViewState]) => !!isFullScreen && !!isWorkflowOpen && workflowViewState !== 'Diagram Only'),
      takeUntil(this.destroy$)
    );

    this.showCoursesList$ = combineLatest([
      this.isFullScreen$,
      this.isLearningPathOpen$,
      this.isWorkflowOpen$
    ]).pipe(
      map(([isFullScreen, isLearningPathOpen, isWorkflowOpen]) => !!isFullScreen && !!isLearningPathOpen && !isWorkflowOpen),
      takeUntil(this.destroy$)
    );

    this.showContentFooter$ = combineLatest([
      this.isCourseContentQuiz$,
      this.isCourseSummaryOpen$
    ]).pipe(
      map(([isCourseContentQuiz, isCourseSummaryOpen]) => !isCourseContentQuiz && !isCourseSummaryOpen),
      takeUntil(this.destroy$)
    );

    this.showCourseNavButtons$ = combineLatest([
      this.isFullScreen$,
      this.isLearningPathOpen$,
      this.isWorkflowOpen$
    ]).pipe(
      map(([isFullScreen, isLearningPathOpen, isWorkflowOpen]) => !!isFullScreen && !!isLearningPathOpen && !isWorkflowOpen),
      takeUntil(this.destroy$)
    );

    this.showWorkflowSteps$ = combineLatest([
      this.isFullScreen$,
      this.isWorkflowOpen$,
      this.workflowViewState$
    ]).pipe(
      map(([isFullScreen, isWorkflowOpen, workflowViewState]) => !!isFullScreen && !!isWorkflowOpen && workflowViewState !== 'Tree Only'),
      takeUntil(this.destroy$)
    );

    this.showContentDetailsPanel$ = combineLatest([
      this.isWorkflowOpen$,
      this.isQuizOpen$,
      this.isCourseSummaryOpen$
    ]).pipe(
      map(([isWorkflowOpen, isQuizOpen, isCourseSummaryOpen]) => !isWorkflowOpen && !isQuizOpen && !isCourseSummaryOpen),
      takeUntil(this.destroy$)
    );
  }

  private setIsDetailsLoading() {
    combineLatest([
      this.contentDetails$,
      this.isContentDetailsLoading$,
      this.isRelatedContentLoading$,
      this.isCommentsLoading$,
      this.isCoursesLoading$
    ]).pipe(
      tap(([contentDetails, isContentDetailsLoading, isRelatedContentLoading, isCommentsLoading, isCoursesLoading]) => {
        if (isContentDetailsLoading || isRelatedContentLoading || isCommentsLoading) {
          this.isDetailsLoading.next(true);
        } else if (contentDetails?.type === ContentType.LearningPath && isCoursesLoading) {
          this.isDetailsLoading.next(true);
        } else {
          this.isDetailsLoading.next(false);
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }
}
