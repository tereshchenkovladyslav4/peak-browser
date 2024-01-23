import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ContentDetails, ContentSummary, ContentType, LearningPath} from 'src/app/resources/models/content';
import {Tab} from "../../../../components/horizontal-tabs/horizontal-tabs.component";
import { combineLatest, map, Observable, tap, takeUntil, Subject, filter, of } from 'rxjs';
import { LearningPathStateService } from 'src/app/state/learning-path/learning-path-state.service';
import { WorkflowStateService } from 'src/app/state/workflow/workflow-state.service';
import { Store } from '@ngxs/store';
import { Comment } from 'src/app/services/apiService/classFiles/class.content';

export interface ContentFooterData {
  comments: Comment[],
  relatedContent: ContentSummary[]
}

enum FooterTab {
  DESCRIPTION = 'DESCRIPTION',
  PREREQUISITES = 'PREREQUISITES',
  RELATED_CONTENT = 'RELATED_CONTENT',
  COMMENTS = 'COMMENTS',
}

const footerTabMap = {
  [ContentType.Document]: [FooterTab.RELATED_CONTENT, FooterTab.COMMENTS],
  [ContentType.LearningPath]: [FooterTab.DESCRIPTION, FooterTab.PREREQUISITES, FooterTab.RELATED_CONTENT, FooterTab.COMMENTS],
  [ContentType.Video]: [FooterTab.DESCRIPTION, FooterTab.RELATED_CONTENT, FooterTab.COMMENTS],
  [ContentType.Workflow]: [FooterTab.DESCRIPTION, FooterTab.RELATED_CONTENT, FooterTab.COMMENTS]
}

@Component({
  selector: 'ep-content-footer',
  templateUrl: './content-footer.component.html',
  styleUrls: ['./content-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentFooterComponent implements OnInit, OnDestroy {

  @Input() contentDetails: ContentDetails;
  @Input() comments: Comment[];
  @Input() relatedContent: ContentSummary[];

  protected readonly LearningPath = LearningPath;
  protected readonly Array = Array;
  readonly footerTab = FooterTab;

  // obs
  activeContentDetails$: Observable<ContentDetails>;
  isLoading$: Observable<boolean>;

  tabs$: Observable<Tab[]>;
  currentTabKey: string = null;
  lastContentId: string = null;

  private destroy$ = new Subject<void>;

  constructor(
    private learningPathState: LearningPathStateService,
    private workflowState: WorkflowStateService,
    private store: Store
  ) { }

  ngOnInit(): void {
    this.setActiveContentDetails();
    this.setTabs();
    this.resetTabWhileInLearnignPath();
    this.setIsLoadingLPCourseContent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setActiveContentDetails() {
    this.activeContentDetails$ = combineLatest([
      of(this.contentDetails),
      this.learningPathState.activeCourseContentDetails$,
      this.workflowState.isWorkflowOpen$,
      this.workflowState.openProcessIndex$
    ]).pipe(
      map(([contentDetails, courseContentDetails, isWorkflowOpen, _]: [ContentDetails, ContentDetails, boolean, number]) => {
        const activeContentDetails = !!courseContentDetails ? courseContentDetails : contentDetails;

        if (isWorkflowOpen) {
          const process = this.workflowState.getOpenProcessInfo();
          if (process) {
            return {
              ...activeContentDetails,
              plainDescription: process?.description,
              description: process?.description,
            };
          }
        }

        return activeContentDetails;
      })
    )
  }

  private setTabs(): void {
    this.tabs$ = combineLatest([
      this.activeContentDetails$.pipe(filter(x => !!x)),
      of(this.relatedContent),
      of(this.comments)
    ]).pipe(
      map(([contentDetails, relatedContent, comments]: [ContentDetails, ContentSummary[], Comment[]]) => 
        this.filterTabs(contentDetails, relatedContent, footerTabMap?.[contentDetails?.type] || [])
          .map(tab => ({
            key: tab, 
            label: this.getTabName(tab, comments)
          }))
      )
    )
  }

  /**
   * set selected tab to first one when switching between content in LP
   */
  private resetTabWhileInLearnignPath() {
    combineLatest([
      this.activeContentDetails$.pipe(filter(x => !!x)),
      this.tabs$.pipe(filter(x => !!x))
    ]).pipe(
      tap(([activeContentDetails, tabs]) => {
        if (activeContentDetails.id !== this.lastContentId) {
          this.setCurrentTabKey(tabs[0]?.key);
          this.lastContentId = activeContentDetails.id;
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe()
  }

  private setIsLoadingLPCourseContent() {
    this.isLoading$ = this.learningPathState.isLoading$;
  }

  setCurrentTabKey(tabKey: string) {
    this.currentTabKey = tabKey;
  }

  private filterTabs(contentDetails: ContentDetails, relatedContent: ContentSummary[], tabs: FooterTab[]): FooterTab[] {
    const eligibleTabs = [FooterTab.COMMENTS];

    if (!!contentDetails?.plainDescription) {
      eligibleTabs.push(FooterTab.DESCRIPTION);
    }

    if (!!contentDetails?.prerequisites?.length) {
      eligibleTabs.push(FooterTab.PREREQUISITES);
    }

    if (!!relatedContent?.length) {
      eligibleTabs.push(FooterTab.RELATED_CONTENT);
    }

    return tabs.filter(tab => eligibleTabs.includes(tab));
  }

  private getTabName(tab: FooterTab, comments: Comment[]): string {
    const tabLabelMap = {
      [FooterTab.COMMENTS]: `Comments (${comments?.length ?? 0})`,
      [FooterTab.RELATED_CONTENT]: 'Related Content',
      [FooterTab.DESCRIPTION]: 'Description',
      [FooterTab.PREREQUISITES]: 'Prerequisites'
    }

    return tabLabelMap[tab];
  }
}
