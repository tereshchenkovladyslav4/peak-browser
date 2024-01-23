import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DiagramView, HierarchyContent } from 'src/app/resources/models/content';
import { WorkflowStateService } from 'src/app/state/workflow/workflow-state.service';

@Component({
  selector: 'ep-workflow-tree',
  templateUrl: './workflow-tree.component.html',
  styleUrls: ['./workflow-tree.component.scss']
})
export class WorkflowTreeComponent implements OnInit {
  workflowTreeData$: Observable<HierarchyContent>;
  processDiagrams$: Observable<DiagramView[]>;
  openProcessIndex$: Observable<number>;
  activeTaskIndex$: Observable<number>;

  expandedProcessIndex: number = -1;
  isExpandedProcessOpen: boolean = false;

  constructor (private workflowState: WorkflowStateService) {}

  ngOnInit(): void {
    this.setWorkflow();
    this.setProcesses();
    this.setOpenProcessIndex();
    this.setActiveTaskIndex();
  }

  private setWorkflow() {
    this.workflowTreeData$ = this.workflowState.workflowHierarchy$;
  }

  private setProcesses() {
    this.processDiagrams$ = this.workflowState.processDiagramData$;
  }

  private setOpenProcessIndex() {
    this.openProcessIndex$ = this.workflowState.openProcessIndex$;
  }

  private setActiveTaskIndex() {
    this.activeTaskIndex$ = this.workflowState.activeTaskIndex$;
  }

  toggleProcess(processIndex: number) {
    if (processIndex === this.expandedProcessIndex) {
      this.isExpandedProcessOpen = !this.isExpandedProcessOpen;
    } else {
      this.setExpandedProcessIndex(processIndex);
    }
  }

  private setExpandedProcessIndex(processIndex: number) {
    this.expandedProcessIndex = processIndex;
    this.isExpandedProcessOpen = true;
  }

  openProcess(processIndex: number) {
    if (processIndex !== this.workflowState.snapshot.openProcessIndex) {
      // open new process
      this.workflowState.openProcess(processIndex);
    }

    this.workflowState.deselectTask();
    this.setExpandedProcessIndex(processIndex);
  }

  openTask(processIndex: number, taskIndex: number) {
    this.openProcess(processIndex);

    this.workflowState.openTask(taskIndex);
  }
}
