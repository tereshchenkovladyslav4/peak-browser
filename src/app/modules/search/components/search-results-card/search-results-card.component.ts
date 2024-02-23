import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, SecurityContext} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {ActivatedRoute, NavigationStart, Router} from '@angular/router';
import { take, Subscription, Observable, Subject } from 'rxjs';
import { ContentDifficulty } from 'src/app/resources/enums/content-difficulty.enum';
import { ContentType } from 'src/app/resources/models/content';
import { SearchResult } from 'src/app/resources/models/search-result';
import { TopicSubtopicPair } from 'src/app/resources/models/topic';
import { ContentTypesService } from 'src/app/services/content-types.service';
import { SearchService } from 'src/app/services/search/search.service';
import { TranslationService } from 'src/app/services/translation.service';
import { NAVIGATION_ROUTES} from "../../../../resources/constants/app-routes";
import {filter, takeUntil, tap} from "rxjs/operators";
import { DropdownItem } from 'src/app/resources/models/dropdown-item';
import { DropdownMenuService } from 'src/app/services/dropdown-menu.service';
import { formatDurationShort } from 'src/app/resources/functions/content/content';
import { BookmarksStateService } from 'src/app/state/bookmarks/bookmarks-state.service';
import { Select } from '@ngxs/store';
import { AssignmentsState } from '../../../../state/assignments/assignments.state';
import { Assignment, AssignmentEnrollmentStatus } from '../../../../resources/models/assignment';
import { navigateToLPConsumptionPage } from '../../../../resources/functions/routing/router';
const DURATION_CONTENT_TYPES: ContentType[] = [ContentType.LearningPath, ContentType.Video];
const DROPDOWN_MENU_HEIGHT = 280;

@Component({
  selector: 'ep-search-results-card',
  templateUrl: './search-results-card.component.html',
  styleUrls: ['./search-results-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultsCardComponent implements OnInit, OnDestroy {
  @Input() searchResult: SearchResult;
  @Output() onDropdownOpen: EventEmitter<any> = new EventEmitter();
  @Select(AssignmentsState.getStackedActiveAssignments) stackedActiveAssignments$: Observable<Assignment[]>;
  bookmarksSubscription: Subscription;
  unsubscribe$ = new Subject<void>();

  contentType = ContentType;
  isExpandable: boolean;
  showDuration: boolean;

  searchTerm: string;

  isExpanded: boolean;
  contentImageUrl: string;
  contentName: string;
  contentDescription: string;
  contentTypeIconUrl: string;
  isDefaultIcon: boolean = true;
  isVideoType: boolean;
  isBookmarked: boolean = false;
  contentTypeName: string;
  difficultyName: string;
  difficultyIconUrl: string;
  duration: string;
  dropdownText: string;
  topicSubtopicPairs: TopicSubtopicPair[];
  progress: number;
  dropdownItems: DropdownItem[];
  openDropdownMenuContentId: string = '';
  dropdownTop: number;
  dropdownLeft: number;
  currentAssignment: Assignment = null; 
  status: AssignmentEnrollmentStatus = null;
  constructor(
    private cdr: ChangeDetectorRef,
    private searchService: SearchService,
    private contentTypesService: ContentTypesService,
    private translationService: TranslationService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private router: Router,
    private dropdownMenuService: DropdownMenuService,
    private bookmarksState: BookmarksStateService,
  ) { }

  ngOnInit() {
    this.stackedActiveAssignments$.pipe(
      filter(assignments => assignments?.length > 0),
      tap(assignments => {
        this.currentAssignment = assignments.find(assignment => assignment.learningPath.id === this.searchResult.contentId);
        if (this.currentAssignment) {
          this.status = AssignmentEnrollmentStatus.Enrolled;
        }
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe();

    this.isExpandable = this.searchResult?.contentType === ContentType.LearningPath && !!this.searchResult.children?.length;
    this.showDuration = DURATION_CONTENT_TYPES.includes(this.searchResult?.contentType) && this.searchResult.duration != 0;
    this.setSearchTerm();
    this.contentName = this.getContentName();
    this.contentDescription = this.sanitizer.sanitize(SecurityContext.HTML, this.searchResult?.description ?? '');
    this.contentTypeIconUrl = this.contentTypesService.getContentInfoIconUrl(this.searchResult?.contentType, this.searchResult?.documentType);
    this.contentImageUrl = this.getImageUrl();
    this.isVideoType = this.searchResult.contentType === ContentType.Video;
    this.contentTypeName = this.contentTypesService.getContentInfoTranslationText(this.searchResult?.contentType, this.searchResult?.documentType);
    this.difficultyName = this.getDifficultyName();
    this.difficultyIconUrl = this.getDifficultyIconUrl();
    this.duration = this.getDuration();
    this.setDropdownText();
    this.topicSubtopicPairs = this.getDisplayTopics();
    this.progress = this.getProgress();
    this.getIsBookmarked();

    this.router.events.pipe(
      filter(event => event instanceof NavigationStart),
      take(1),
    ).subscribe(() => this.searchService.removeAllFilters());

    this.buildDropdownMenu(this.searchResult, this.bookmarksState.isContentBookmarked(this.searchResult?.contentId) );
  }

  ngOnDestroy() {
    if (this.bookmarksSubscription) {
      this.bookmarksSubscription.unsubscribe();
    }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

  }

  private setSearchTerm() {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['searchTerms'];
    })
  }

  private getContentName(): string {
    // remove any html tags from name
    const sanitizedName = this.sanitizer.sanitize(SecurityContext.HTML, this.searchResult?.title ?? '');
    // convert escaped character entity names back to their symbol representation
    const unescapedName = new DOMParser().parseFromString(sanitizedName, 'text/html').documentElement.textContent;
    return unescapedName;
  }

  private getImageUrl(): string {
    if (!this.searchResult?.imageUrl) {
      // get defaults
      this.isDefaultIcon = true;
      return this.contentTypeIconUrl;
    }

    this.isDefaultIcon = false;
    return this.searchResult?.imageUrl;
  }

  private getDifficultyName(): string {
    return ContentDifficulty[this.searchResult?.difficulty];
  }

  private getDifficultyIconUrl(): string {
    const contentDifficultyIconUrlMap = {
      [ContentDifficulty.None]: 'assets/images/content/difficulty/beginner.svg',
      [ContentDifficulty.Beginner]: 'assets/images/content/difficulty/beginner.svg',
      [ContentDifficulty.Intermediate]: 'assets/images/content/difficulty/intermediate.svg',
      [ContentDifficulty.Advanced]: 'assets/images/content/difficulty/advanced.svg',
    };

    return contentDifficultyIconUrlMap[this.searchResult.difficulty];
  }

  private getDuration(): string {
    if (!this.searchResult) return '00:00';
    return formatDurationShort(this.searchResult?.duration);
  }

  private setDropdownText() {
    this.dropdownText = !this.isExpanded ?
      this.translationService.getTranslationFileData('common.view-more') :
      this.translationService.getTranslationFileData('common.view-less');
  }

  private getProgress(): number {
    if (!this.searchResult.progress || this.searchResult.progress < 0) {
      return 0;
    }

    if (this.searchResult.progress > 100) {
      return 100;
    }

    return this.searchResult.progress;
  }

  private getIsBookmarked(): void {
    this.bookmarksSubscription = this.bookmarksState.bookmarksMap$.subscribe(res => {
      this.isBookmarked = this.bookmarksState.isContentBookmarked(this.searchResult?.contentId);
      this.cdr.detectChanges();
    });
  }


  toggleDropdown() {
    this.isExpanded = !this.isExpanded;
    this.setDropdownText();
  }

  navigateToContent(contentId: string = this.searchResult?.contentId) {
    this.router.navigate([NAVIGATION_ROUTES.content, contentId]);
  }

  /**
   * Gets the 4 topics to display in the search results card
   * @returns array of 4 topics to display
   */
  private getDisplayTopics(): TopicSubtopicPair[] {
    if (!this.searchResult) return [];

    // sort topics by name
    this.searchResult.topics.sort((a,b) => {
      // Convert to uppercase so we don't have
      // to worry about case differences.
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      // names must be equal
      return 0;
    })

    // get first 4 topic + subtopic pairs from list of topics
    const topicSubtopicPairs: TopicSubtopicPair[] = [];
    let topicIndex = 0;
    let subtopicIndex = 0;
    while (topicSubtopicPairs?.length < 4) {
      if (topicIndex >= this.searchResult.topics?.length) {
        break;
      }

      const topic = this.searchResult.topics[topicIndex];
      const subtopic = topic.subtopics[subtopicIndex] ?? null;
      topicSubtopicPairs.push({
        imageUrl: topic?.imageUrl,
        topicName: topic?.name,
        subtopicName: subtopic?.name ?? ''
      });

      subtopicIndex++;
      if (subtopicIndex >= topic.subtopics?.length) {
        topicIndex++;
        subtopicIndex = 0;
      }
    }

    return topicSubtopicPairs;
  }

  private buildDropdownMenu(content: SearchResult, isBookmarked = false) {
    const contentId = content.contentId;
    const contentType = content.contentType;
    const isEnrolled = this.status === AssignmentEnrollmentStatus.Enrolled;
    const hasStartedAssignment = this.currentAssignment?.progress > 0;

    this.dropdownItems = this.dropdownMenuService
      .addEnroll({
        visible:
          !isEnrolled &&
          (contentType === ContentType.Course || contentType === ContentType.LearningPath),
      })
      .addResume({ action: () => this.resumeLPConsumption(), visible: isEnrolled && hasStartedAssignment })
      .addStart({ action: () => this.resumeLPConsumption(), visible: isEnrolled && !hasStartedAssignment })
      .addView({ action: () => this.navigateToContent(contentId) })
      .addBookmarkItem(isBookmarked, contentId)
      .addDivider()
      //.addShareNotification({})
      //.addShareWorkGroup({})
      .addCopyLinkFormatted({})
      .addCopyLinkUnformatted({})
      .getItems();
  }

  // TODO - will be used with code from dropdownMenuClick after intial release of peak
  private updateDropdownItem(text: string, action) {
    const foundDropdownItem = this.dropdownItems.find(i => i.text === text);
    if (foundDropdownItem) {
      foundDropdownItem.action = action;
    }
  }

  dropdownMenuClick(event: MouseEvent, contentId: string, contentType: ContentType) {
    // TODO - uncomment after intial release of peak
    // this allows ellipsis view action on courses to properly navigate user to the course's page as opposed to the LP's page
    // if (contentType === ContentType.LearningPath || contentType === ContentType.Course) {
    //   this.updateDropdownItem('View', () => this.navigateToContent(contentId));
    // }

    const ellipsisElRect = (event.target as HTMLElement).getBoundingClientRect();
    const adjWindowHeight = window.innerHeight * 1.149; // account for the global zoom style which will affect sizes of elements
    const dropdownTopOffset = ellipsisElRect.y + DROPDOWN_MENU_HEIGHT > adjWindowHeight ? -275 : 35;
    const dropdownLeftOffset = this.isExpandable ? -115 : -215;

    this.dropdownTop = dropdownTopOffset;
    this.dropdownLeft = dropdownLeftOffset;

    this.openDropdownMenuContentId = contentId;
  }

  closeDropdownMenu() {
    this.openDropdownMenuContentId = '';
  }

  private resumeLPConsumption() {
    navigateToLPConsumptionPage(this.router, this.currentAssignment.learningPath.id);
  }
}
