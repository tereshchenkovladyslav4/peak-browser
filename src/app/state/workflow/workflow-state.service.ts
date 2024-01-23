import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, concatMap, forkJoin, map, mergeMap, of, tap, Subject, Subscription, distinctUntilChanged} from 'rxjs';
import { DiagramObjectExtended, DiagramView, DiagramViewExtended, HierarchyContent, TaskSteps } from 'src/app/resources/models/content';
import { ContentService } from 'src/app/services/content.service';
import { LayoutStateService } from '../layout/layout-state.service';
import { ProdGenApi } from 'src/app/services/apiService/prodgen.api';
import { mapDiagramViewToDiagramViewExtended, prepareView } from 'src/app/resources/functions/content/workflow';
import {DialogConfig} from "../../components/dialog/dialog-base/dialog-base.component";
import { selectFrom, nameof } from 'src/app/resources/functions/state/state-management';
import { LearningPathStateService } from '../learning-path/learning-path-state.service';
import { SettingsStateService } from '../settings/settings-state.service';
import { TenantSettingType } from 'src/app/resources/enums/tenant-setting-type.enum';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { LocalStorageService } from 'src/app/services/storage/services/local-storage.service';
import { SessionStorageService } from 'src/app/services/storage/services/session-storage.service';

export type WorkflowViewState = 'Tree Only' | 'Diagram Only' | 'Diagram and Tree'
type DBWorkflowView = 'workflow tree only' | 'diagram only' | 'workflow tree and diagram';
const WorkflowViewDbMap = {
  'workflow tree only': 'Tree Only',
  'diagram only': 'Diagram Only',
  'workflow tree and diagram': 'Diagram and Tree',
};
const WF_VIEW_DB_VALUES: DBWorkflowView[] = ['workflow tree only', 'diagram only', 'workflow tree and diagram'];
const DEFAULT_WORKFLOW_VIEW: WorkflowViewState = 'Tree Only';
export const WORKFLOW_OVERRIDE_KEY = 'userWorkflowViewOverride';
export const LP_WORKFLOW_OVERRIDE_KEY = 'userLPWorkflowViewOverride';
export const LP_WORKFLOW_ENROLL_ID_KEY = 'workflowLearningPathEnrollmentId';
export const LP_WORKFLOW_CONTENT_ID_KEY = 'workflowLearningPathContentId';

export interface ContentViewerData {
  contentType: string;
  contentId: string;
  dialogConfig: DialogConfig;
}

interface WorkflowState {
  workflowId: string;
  isWorkflowOpen: boolean;
  viewState: WorkflowViewState;
  workflowHierarchy: HierarchyContent;
  workflowDiagramData: DiagramViewExtended;
  processDiagramData: DiagramViewExtended[];
  steps: TaskSteps;
  openProcessIndex: number;
  activeTaskIndex: number;
  contentViewer: ContentViewerData;
}

const DEFAULT_STATE: WorkflowState = {
  workflowId: undefined,
  isWorkflowOpen: false,
  viewState: undefined,
  workflowHierarchy: undefined,
  workflowDiagramData: undefined,
  processDiagramData: [],
  steps: {},
  openProcessIndex: -1,
  activeTaskIndex: -1,
  contentViewer: {
    contentType: null,
    contentId: null,
    dialogConfig: null
  }
}

@Injectable({
  providedIn: 'root'
})
export class WorkflowStateService {

  private state$ = new BehaviorSubject<WorkflowState>(DEFAULT_STATE);

  // state selectors
  isWorkflowOpen$: Observable<boolean> = selectFrom(this.state$, nameof<WorkflowState>('isWorkflowOpen'));
  viewState$: Observable<WorkflowViewState> = selectFrom(this.state$, nameof<WorkflowState>('viewState'));
  workflowHierarchy$: Observable<HierarchyContent> = selectFrom(this.state$, nameof<WorkflowState>('workflowHierarchy'));
  workflowDiagramData$: Observable<DiagramViewExtended> = selectFrom(this.state$, nameof<WorkflowState>('workflowDiagramData'));
  processDiagramData$: Observable<DiagramViewExtended[]> = selectFrom(this.state$, nameof<WorkflowState>('processDiagramData'));
  steps$: Observable<TaskSteps> = selectFrom(this.state$, nameof<WorkflowState>('steps'));
  openProcessIndex$: Observable<number> = selectFrom(this.state$, nameof<WorkflowState>('openProcessIndex'));
  activeTaskIndex$: Observable<number> = selectFrom(this.state$, nameof<WorkflowState>('activeTaskIndex'));
  contentViewer$: Observable<ContentViewerData> = selectFrom(this.state$, nameof<WorkflowState>('contentViewer'));
  triggerOpenContentViewer$ = new Subject<boolean>();

  constructor(private contentService: ContentService,
              private v1Service: ProdGenApi,
              private layoutState: LayoutStateService,
              private learningPathState: LearningPathStateService,
              private settingsState: SettingsStateService,
              private organizationService: OrganizationService,
              private localStorage: LocalStorageService,
              private sessionStorage: SessionStorageService
  ) {
    this.handleLayoutChanged();
    this.handleOrgWorkflowViewSettingChanged();
    this.handleOrgLPWorkflowViewSettingChanged();
  }

  private handleLayoutChanged() {
    this.layoutState.selectLayout$.subscribe(layout => {
      // set is workflow open to false when not in full-screen mode
      if (layout !== undefined && layout !== 'full-screen') {
        this.updateIsWorkflowOpen(false);
      }
    })
  }

  /**
   * Override the workflow user override in local storage ONLY WHEN the setting value in the DB has changed
   * This is the 'Default Workflow Display' setting found in General > Settings in Admin
   */
  private handleOrgWorkflowViewSettingChanged() {
    const key = TenantSettingType.WFTreeDisplay;
    this.settingsState.workflowDisplaySetting$.subscribe(newVal => {
      const currVal = this.localStorage.getItem<string>(key);
      if (newVal !== currVal) {
        this.localStorage.setItem(key, newVal);
        this.removeUserWorkflowOverride();
      }
    });
  }

  /**
   * Override the lp workflow user override in local storage ONLY WHEN the setting value in the DB has changed
   * This is the 'Default Learning Path Workflow Display' setting found in General > Settings in Admin
   */
  private handleOrgLPWorkflowViewSettingChanged() {
    const key = TenantSettingType.WFTreeLPDisplay;
    this.settingsState.lpWorkflowDisplaySetting$.subscribe(newVal => {
      const currVal = this.localStorage.getItem<string>(key);
      if (newVal !== currVal) {
        this.localStorage.setItem(key, newVal);
        this.removeUserLPWorkflowOverride();
      }
    });
  }

  reset() {
    this.clearStateInSession();
    this.state$.next(DEFAULT_STATE);
  }

  private clearStateInSession() {
    this.sessionStorage.removeItem(LP_WORKFLOW_ENROLL_ID_KEY);
    this.sessionStorage.removeItem(LP_WORKFLOW_CONTENT_ID_KEY);
  }

  getInitialWorkflowData(workflowId: string) {
    // get updated org settings
    this.organizationService.getAllTenantSettings()
    .subscribe(res => {
      this.settingsState.updateTenantSettings(res.settings);
      this.updateViewState(this.defaultWorkflowViewState);
    });

    // no need to get data that is already in state
    if (this.snapshot.workflowId === workflowId) {
      this.updateIsWorkflowOpen(true);
      return;
    }

    // new workflow data being retrieved, update some data
    this.updateWorkflowId(workflowId);

    forkJoin([
      this.v1Service.getWorkflowHierarchy(workflowId),
      this.contentService.getWorkflowDiagram(workflowId)
    ]).pipe(
      tap(([workflowHierarchyRes, _]) => this.updateWorkflowHierarchy(workflowHierarchyRes)),
      tap(([_, workflowDiagramRes]) => this.mapWorkflowDiagramData(workflowDiagramRes)),
      tap(_ => this.updateIsWorkflowOpen(true)),
      concatMap(([workflowHierarchyRes, _]) => {
        if (!workflowHierarchyRes?.Children?.length) {
          return of([]);
        }
        return forkJoin(workflowHierarchyRes?.Children.map(process => this.contentService.getProcessDiagram(process?.ContentId)))
      }),
      tap(allProcessDiagramRes => this.updateProcessDiagramData(allProcessDiagramRes.map(p => this.preprocessDiagramView(p.diagram)))),
    ).subscribe({
      error: err => console.error(err)
    });
  }

  getTaskStepInfo(taskId: string): Observable<TaskSteps> {
    return this.contentService.getTaskSteps(taskId).pipe(map(res => ({[taskId]: res.steps})));
  }

  openProcess(processIndex: number) {
    if (processIndex < 0) return;

    this.updateOpenProcessIndex(processIndex);
  }

  openTask(taskIndex: number) {
    // if task steps are already stored, just emit active task index so steps subscribers can pull the active step data
    // else, fetch task's steps data from backend
    this.openTaskObserver(taskIndex)?.subscribe({
      next: this.handleTaskStepsResponse,
      error: err => console.error(err)
    });
  }

  private openTaskObserver(taskIndex: number): Observable<TaskSteps> {
    this.updateActiveTaskIndex(taskIndex);
    try {
      const taskId = this.snapshot.processDiagramData[this.snapshot.openProcessIndex].objects[taskIndex]?.contentId;
      if (!(taskId in this.snapshot.steps) && taskIndex > -1) {
        return this.getTaskStepInfo(taskId);
      }
      return undefined;
    } catch (error) {
      console.error(error);
    }

    return of(null);
  }

  deselectProcess() {
    // set process index & task index to -1
    this.updateOpenProcessIndex(-1);
    this.updateActiveTaskIndex(-1);
  }

  deselectTask() {
    // set task index to -1
    this.updateActiveTaskIndex(-1);
  }

  changeViewState(viewState: WorkflowViewState) {
    if (this.snapshot.viewState !== viewState) {
      this.updateViewState(viewState);
    }
  }

  openContentViewer(contentType: string, contentId: string) {
    this.updateContentViewer(contentType, contentId);
    this.triggerOpenContentViewer$.next(true);
  }

  openContentViewerForImage(contentId: string, imageDimensions: { width: any; height: any }) {
    this.updateContentViewer('Image', contentId, imageDimensions);
    this.triggerOpenContentViewer$.next(true);
  }

  resetContentViewer() {
    this.updateContentViewer(null, null);
  }

  private handleTaskStepsResponse = (taskSteps: TaskSteps) => {
    if (taskSteps) {
      this.updateSteps({
        ...this.snapshot.steps,
        ...taskSteps
      });
    }

    if (taskSteps === null) {
      this.updateSteps(null);
    }
  };

  private preprocessDiagramView(diagramView: DiagramView): DiagramViewExtended {
    const updatedDiagram = prepareView(diagramView);
    return mapDiagramViewToDiagramViewExtended(updatedDiagram);
  }

  private mapWorkflowDiagramData(workflowDiagram: DiagramView) {
    const diagramViewExtended = this.preprocessDiagramView(workflowDiagram);
    this.updateWorkflowDiagramData(diagramViewExtended);
  }

  isWorkflowFromLearningPath(): boolean {
    return this.learningPathState.snapshot.isLearningPathOpen || this.sessionStorage.getItem<string>('workflowLearningPathId')?.length > 0;
  }

  getWorkflowLearningPathId(): string {
    return this.sessionStorage.getItem('workflowLearningPathId');
  }

  removeUserWorkflowOverride() {
    this.localStorage.removeItem(WORKFLOW_OVERRIDE_KEY);
  }

  removeUserLPWorkflowOverride() {
    this.localStorage.removeItem(LP_WORKFLOW_OVERRIDE_KEY);
  }

  setUserWorkflowOverride(viewState: WorkflowViewState) {
    this.localStorage.setItem(this.learningPathState.snapshot.isLearningPathOpen ? LP_WORKFLOW_OVERRIDE_KEY : WORKFLOW_OVERRIDE_KEY, viewState);
  }

  private get defaultWorkflowViewState(): WorkflowViewState {
    // check local storage
    let userOverrideViewState: WorkflowViewState = this.isWorkflowFromLearningPath()
      ? this.localStorage.getItem(LP_WORKFLOW_OVERRIDE_KEY)
      : this.localStorage.getItem(WORKFLOW_OVERRIDE_KEY);

    if (userOverrideViewState) {
      return userOverrideViewState
    }

    // then check org defaults (Default Workflow vs Default LP Workflow)
    let defaultOrgViewState: string = this.learningPathState.snapshot.isLearningPathOpen
      ? this.localStorage.getItem(TenantSettingType.WFTreeLPDisplay)
      : this.localStorage.getItem(TenantSettingType.WFTreeDisplay);

    const dbWorkflowViewVal = defaultOrgViewState?.toLocaleLowerCase() as DBWorkflowView;
    if (defaultOrgViewState && WF_VIEW_DB_VALUES.includes(dbWorkflowViewVal)) {
      return WorkflowViewDbMap[dbWorkflowViewVal] as WorkflowViewState;
    }

    // return ultimate default
    return DEFAULT_WORKFLOW_VIEW;
  }

  private isDBWorkflowViewState(value: string): boolean {
    const updatedVal = value.toLocaleLowerCase();
    return WF_VIEW_DB_VALUES.includes(updatedVal as DBWorkflowView);
  }

  // STATE FUNCS
  get snapshot(): WorkflowState {
    return this.state$.getValue();
  }

  public getOpenProcessInfo(): DiagramObjectExtended {
    return this.snapshot.workflowDiagramData?.objects[this.snapshot.openProcessIndex];
  }

  private updateWorkflowId(workflowId: string) {
    this.state$.next({
      ...this.state$.getValue(),
      workflowId: workflowId
    })
  }

  private updateIsWorkflowOpen(isWorkflowOpen: boolean) {
    this.state$.next({
      ...this.state$.getValue(),
      isWorkflowOpen: isWorkflowOpen
    })
  }

  private updateViewState(viewState: WorkflowViewState) {
    this.state$.next({
      ...this.state$.getValue(),
      viewState: viewState
    })
  }

  private updateWorkflowHierarchy(workflowHierarchy: HierarchyContent) {
    this.state$.next({
      ...this.state$.getValue(),
      workflowHierarchy: workflowHierarchy
    })
  }

  private updateWorkflowDiagramData(workflowDiagramData: DiagramViewExtended) {
    this.state$.next({
      ...this.state$.getValue(),
      workflowDiagramData: workflowDiagramData
    })
  }

  private updateProcessDiagramData(processDiagramaData: DiagramViewExtended[]) {
    this.state$.next({
      ...this.state$.getValue(),
      processDiagramData: processDiagramaData
    })
  }

  private updateSteps(steps: TaskSteps) {
    this.state$.next({
      ...this.state$.getValue(),
      steps: steps
    })
  }

  private updateOpenProcessIndex(openProcessIndex: number) {
    this.state$.next({
      ...this.state$.getValue(),
      openProcessIndex: openProcessIndex
    })
  }

  private updateActiveTaskIndex(activeTaskIndex: number) {
    this.state$.next({
      ...this.state$.getValue(),
      activeTaskIndex: activeTaskIndex
    })
  }

  private updateContentViewer(contentType: string, contentId: string, imageDimensions?) {
    this.state$.next({
      ...this.state$.getValue(),
      contentViewer: {
        contentType: contentType,
        contentId: contentId,
        dialogConfig: getContentViewerDialogConfig(contentType, imageDimensions)
      }
    })
  }
}

// todo move to own file in resources > utils once imgs integrated
function getContentViewerDialogConfig(contentType, imageDimensions?: {width: string, height: string}): any {
  const defaultVideoConfig = {
    height: '40rem',
    width: '60rem'
  };
  const configMap = {
    ['PS_Cheat']: () => ({
      height: '57rem',
      width: '53rem'
    }),
    ['PS_VidTutorial']: () => defaultVideoConfig,
    ['PS_VidArchive']: () => defaultVideoConfig,
    ['PS_VidUser']: () => defaultVideoConfig,
    ['Image']: (dimensions) => getIncreaseDimensionAspect(dimensions),
    ['Course']: () =>({
      height: '880px',
      width: '1160px'
    })
  };

  return configMap[contentType](imageDimensions) || {};

  function getIncreaseDimensionAspect({height, width}: {height: string, width: string}): {height: string, width: string} {
    const paddingAndMargin = 5; // vh
    const largestDimension = 95; // vh
    const startingWidth = parseInt(width, 10);
    const startingHeight = parseInt(height, 10);
    const aspectRatio = startingWidth / startingHeight;
    const returnWidth = aspectRatio > 1.0 ? largestDimension : largestDimension * aspectRatio;
    const returnHeight = (aspectRatio < 1.0 ? largestDimension : largestDimension / aspectRatio);

    return {
      height: `${returnHeight + paddingAndMargin}vh`,
      width: `${returnWidth}vh`
    };
  }
}
