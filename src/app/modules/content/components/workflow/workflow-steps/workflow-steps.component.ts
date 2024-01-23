import {Component, OnDestroy, OnInit} from '@angular/core';
import {combineLatest, map, mergeMap, Observable, Subscription, switchMap, take, tap} from 'rxjs';
import {ContentDetails, DiagramObject} from 'src/app/resources/models/content';
import {WorkflowStateService, WorkflowViewState} from 'src/app/state/workflow/workflow-state.service';
import {ActivatedRoute, Router} from "@angular/router";
import {DialogService} from "../../../../../services/dialog/dialog.service";
import {ContentViewerComponent} from "../../../../../components/dialog/content-viewer/content-viewer.component";
import {NAVIGATION_ROUTES} from "../../../../../resources/constants/app-routes";
import {filter} from "rxjs/operators";

@Component({
  selector: 'ep-workflow-steps',
  templateUrl: './workflow-steps.component.html',
  styleUrls: ['./workflow-steps.component.scss']
})
export class WorkflowStepsComponent implements OnInit, OnDestroy {
  openProcessIndex$: Observable<number>;
  activeTaskIndex$: Observable<number>;
  task$: Observable<DiagramObject>;
  steps$: Observable<ContentDetails[]>;
  viewState$: Observable<WorkflowViewState>;
  private subscription: Subscription = new Subscription();

  activeStepIndex = -1;

  constructor(private workflowState: WorkflowStateService,
              private route: ActivatedRoute,
              private dialogService: DialogService,
              private router: Router) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit(): void {
    this.setOpenProcessIndex();
    this.setActiveTaskIndex();
    this.setTask();
    this.setSteps();
    this.setViewState();
    this.setActiveStepIndex();
    this.listenForOpenContentViewer();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private setOpenProcessIndex() {
    this.openProcessIndex$ = this.workflowState.openProcessIndex$;
  }

  private setActiveTaskIndex() {
    this.activeTaskIndex$ = this.workflowState.activeTaskIndex$;
  }

  private setTask() {
    this.task$ = this.workflowState.activeTaskIndex$.pipe(
      map(activeTaskIndex => this.workflowState.snapshot.processDiagramData[this.workflowState.snapshot.openProcessIndex]?.objects[activeTaskIndex])
    )
  }

  private setSteps() {
    this.steps$ = combineLatest([
      this.workflowState.activeTaskIndex$,
      this.workflowState.steps$
    ]).pipe(
      map(([activeTaskIndex, steps]) => {
        if (!steps) return [];

        const openProcessIndex = this.workflowState.snapshot.openProcessIndex;
        const processDiagramData = this.workflowState.snapshot.processDiagramData;
        const task = processDiagramData[openProcessIndex]?.objects[activeTaskIndex];
        return steps ? steps[task?.contentId] : [];
      })
    );
  }

  private setViewState() {
    this.viewState$ = this.workflowState.viewState$;
  }

  private setActiveStepIndex() {
    this.subscription.add(
      combineLatest([
        this.workflowState.openProcessIndex$,
        this.workflowState.activeTaskIndex$
      ]).subscribe(([openProcessIndex, activeTaskIndex]) => {
        const pIndexChange = this.workflowState.snapshot.openProcessIndex - openProcessIndex;
        const tIndexChange = this.workflowState.snapshot.activeTaskIndex - activeTaskIndex;

        // reset active step index if the process or task changes
        if (pIndexChange !== 0 || tIndexChange !== 0) {
          this.activeStepIndex = -1;
        }
      })
    );
  }

  toggleDropdown(stepIndex: number) {
    if (this.activeStepIndex === stepIndex) {
      this.activeStepIndex = -1;
    } else {
      this.activeStepIndex = stepIndex;
    }
  }

  // todo fix how an image opens two models if opened more than once in a row
  private listenForOpenContentViewer() {
    this.subscription.add(
      this.workflowState.triggerOpenContentViewer$.pipe(
        filter((open) => !!open),
        switchMap(() => this.workflowState.contentViewer$.pipe(
          filter(({contentId, ...rest}) => !!contentId))
        ),
        mergeMap(({dialogConfig, contentId, contentType}) => {
          return this.dialogService.open(ContentViewerComponent, {
            data: {
              config: {
                ...dialogConfig,
                contentViewer: {
                  contentId: contentId,
                  contentType: contentType
                }
              }
            }
          }).afterClosed().pipe(
            tap((data) => {
              if (data?.id) {
                this.router.navigate([NAVIGATION_ROUTES.content, data.id])
              }
            }),
            take(1)
          );
        })
      ).subscribe());
  }
}
