import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Workflow } from 'src/app/resources/models/content';
import { SessionStorageService } from 'src/app/services/storage/services/session-storage.service';
import { LayoutStateService } from 'src/app/state/layout/layout-state.service';
import { LearningPathActionsService } from 'src/app/state/learning-path/actions/learning-path-actions.service';
import { LearningPathStateService } from 'src/app/state/learning-path/learning-path-state.service';
import { WorkflowViewState, WorkflowStateService } from 'src/app/state/workflow/workflow-state.service';

@Component({
  selector: 'ep-workflow-view',
  templateUrl: './workflow-view.component.html',
  styleUrls: ['./workflow-view.component.scss']
})
export class WorkflowViewComponent implements OnInit {
  @Input() workflowContent: Workflow;

  isWorkflowOpen$: Observable<boolean>;
  isFullScreen$: Observable<boolean>;
  viewState$: Observable<WorkflowViewState>;

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
  }

  openWorkflow() {
    // need to store session var in case page is reloaded for a workflow that comes from an LP
    // so we can avoid the user access to content check as it is not relevant in this case
    if (this.learningPathState.snapshot.isLearningPathOpen) {
      this.sessionStorage.setItem('workflowLearningPathId', this.learningPathState.snapshot.learningPathId);
      this.sessionStorage.setItem('workflowLearningPathEnrollmentId', this.learningPathState?.activeEnrolledCourse?.enrollmentId);
      this.sessionStorage.setItem('workflowLearningPathContentId', this.workflowContent.id);
      this.learningPathActions.markWorkflowCompleteAction();
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
