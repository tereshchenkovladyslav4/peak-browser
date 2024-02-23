import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentType, Workflow } from 'src/app/resources/models/content';
import { SessionStorageService } from 'src/app/services/storage/services/session-storage.service';
import { LayoutStateService } from 'src/app/state/layout/layout-state.service';
import { LearningPathActionsService } from 'src/app/state/learning-path/actions/learning-path-actions.service';
import { EnrollmentContentTracking, LearningPathStateService } from 'src/app/state/learning-path/learning-path-state.service';
import { WorkflowViewState, WorkflowStateService } from 'src/app/state/workflow/workflow-state.service';

@Component({
  selector: 'ep-workflow-view',
  templateUrl: './workflow-view.component.html',
  styleUrls: ['./workflow-view.component.scss']
})
export class WorkflowViewComponent implements OnInit, OnDestroy {
  @Input() workflowContent: Workflow;
  @Input() enableEnrollmentTracking: boolean;

  isWorkflowOpen$: Observable<boolean>;
  isFullScreen$: Observable<boolean>;
  viewState$: Observable<WorkflowViewState>;

  tracking: EnrollmentContentTracking;

  constructor(
    private layoutState: LayoutStateService,
    private workflowState: WorkflowStateService,
    private learningPathActions: LearningPathActionsService,
    private learningPathState: LearningPathStateService,
    private router: Router,
    private sessionStorage: SessionStorageService
  ) {}

  ngOnInit(): void {
    this.setIsWorkflowOpen();
    this.manageLayout();
    this.manageWorkflowState();

    if (this.enableEnrollmentTracking &&
        this.workflowState.snapshot.isWorkflowOpen &&
        !this.tracking) {

      // Initialise the tracking state for this new content item but don't save it till we're destroyed:
      this.tracking = new EnrollmentContentTracking(
        this.workflowContent.id,
        ContentType.Workflow,
        this.learningPathState.activeEnrolledCourse.courseId,
        this.learningPathState.activeEnrolledCourse.enrollmentId
      );

      this.tracking.isComplete = true; // Time spent on workflows is tracked but they are instantly completed.
    }
  }

  @HostListener('window:beforeunload', ['$event']) // Ensure this runs in all situations: https://wesleygrimes.com/angular/2019/03/29/making-upgrades-to-angular-ngondestroy
  ngOnDestroy() {
    // Record the time spent on this workflow:
    if (this.enableEnrollmentTracking &&
        this.workflowState.snapshot.isWorkflowOpen &&
        this.tracking) {

      this.tracking.endTime = new Date();
      this.learningPathActions.postEnrollmentContentTracking(this.tracking);
    }
  }

  openWorkflow() {
    // need to store session var in case page is reloaded for a workflow that comes from an LP
    // so we can avoid the user access to content check as it is not relevant in this case
    if (this.learningPathState.snapshot.isLearningPathOpen) {
      this.sessionStorage.setItem('workflowLearningPathId', this.learningPathState.snapshot.learningPathId);
      this.sessionStorage.setItem('workflowLearningPathEnrollmentId', this.learningPathState?.activeEnrolledCourse?.enrollmentId);
      this.sessionStorage.setItem('workflowLearningPathContentId', this.workflowContent.id);
    }
    this.router.navigate(['/content/workflow', this.workflowContent.id])
  }

  private setIsWorkflowOpen() {
    this.isWorkflowOpen$ = this.workflowState.isWorkflowOpen$;
  }

  private manageLayout() {
    this.isFullScreen$ = this.layoutState.selectIsFullScreen$;
  }

  private manageWorkflowState() {
    this.viewState$ = this.workflowState.viewState$.pipe();
  }
}
