import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {ContentDetails, ContentDifficulty, ContentType, LearningPath, Video} from '../../../../resources/models/content';
import {SafeUrl} from '@angular/platform-browser';
import {combineLatest, filter, map, mergeMap, Observable, Subject, take, takeUntil, tap} from 'rxjs';
import {TopicSubtopicPair} from 'src/app/resources/models/topic';
import {Tab} from "../../../../components/horizontal-tabs/horizontal-tabs.component";
import {UserMicro} from 'src/app/resources/models/user';
import {ContentService} from 'src/app/services/content.service';
import {LayoutStateService} from 'src/app/state/layout/layout-state.service';
import {VideoPlayerStateService} from 'src/app/state/video-player/video-player-state.service'
import {UserService} from 'src/app/services/user.service';
import {AuthenticationStateService} from 'src/app/state/authentication/authentication-state.service';
import {formatDurationLong} from 'src/app/resources/functions/content/content';
import {LearningPathStateService} from 'src/app/state/learning-path/learning-path-state.service';
import { Select } from '@ngxs/store';
import { ContentDetailsState } from 'src/app/state/content-details/content-details.state';

export class DetailAttribute {
  public label: string;
  public value: string;
  public imageUrl: SafeUrl;
  public isBold: boolean;
  public includeInfoIcon: boolean;
}

const DEFAULT_TABS = [{key: 'Details', label: 'Details'}];

@Component({
  selector: 'ep-content-details-panel',
  templateUrl: './content-details-panel.component.html',
  styleUrls: ['./content-details-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentDetailsPanelComponent implements OnInit, OnDestroy {
  readonly ContentType = ContentType;
  protected readonly Video = Video;

  @Select(ContentDetailsState.contentDetails) private contentDetails$: Observable<ContentDetails>;

  // obs
  activeContentDetails$: Observable<ContentDetails>;
  isFullScreen$: Observable<boolean>;


  topicSubtopicPairs: TopicSubtopicPair[] = [];
  detailAttributes: DetailAttribute[] = [];
  tabs: Tab[] = [];
  currTabName: string = 'Details';
  experts: UserMicro[] = [];
  contentImage: SafeUrl;
  isDefaultImage: boolean;
  autoscrollTranscript: boolean = true;
  isMenuCollapsed: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private contentService: ContentService,
    private layoutState: LayoutStateService,
    private videoPlayerStateService: VideoPlayerStateService,
    private userService: UserService,
    private authState: AuthenticationStateService,
    private learningPathState: LearningPathStateService
  ) {

  }

  ngOnInit() {
    this.setActiveContentDetails();
    this.setExperts();
    this.setDetailAttributes();
    this.setTopicSubtopicPairs();
    this.setTabs();
    this.setAutoScrollTranscript();
    this.manageLayout();
    this.setDetailsCollapsed();
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setActiveContentDetails() {
    this.activeContentDetails$ = combineLatest([
      this.contentDetails$,
      this.learningPathState.activeCourseContentDetails$,
    ]).pipe(
      map(([contentDetails, courseContentDetails]: [ContentDetails, ContentDetails]) => 
        !!courseContentDetails ? courseContentDetails : contentDetails),
      takeUntil(this.destroy$)
    )
  }

  private setExperts() {
    this.activeContentDetails$.pipe(
      filter(contentDetails => !!contentDetails),
      tap(contentDetails => {
        // get all distinct topic names
        const topicNames = contentDetails?.associatedTopics
        ?.filter((val, index, arr) => arr.indexOf(val) === index)
        ?.map(topic => topic?.name);
  
        if (topicNames?.length) {
          this.contentService.getContentExperts(topicNames)
            .subscribe(res => {
              this.experts = res.users;
            })
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private setDetailAttributes() {
    this.activeContentDetails$.pipe(
      filter(contentDetails => !!contentDetails),
      tap(contentDetails => {
        if (contentDetails?.imageUrl != null && contentDetails?.imageUrl.length > 0) {
          this.isDefaultImage = false;
          this.contentImage = contentDetails.imageUrl;
    
        }
        else {
          this.isDefaultImage = true;
          this.contentImage = contentDetails?.typeIcon;
        }
    
        this.detailAttributes = this.createDetailAttributes(contentDetails);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private setTopicSubtopicPairs() {
    this.activeContentDetails$.pipe(
      filter(contentDetails => !!contentDetails),
      tap(contentDetails => {
        const pairs: TopicSubtopicPair[] = [];
        for (const topic of contentDetails?.associatedTopics) {
          if (topic?.subtopics?.length) {
            for (const subtopic of topic?.subtopics) {
              pairs.push({
                topicName: topic?.name,
                subtopicName: subtopic?.name,
                imageUrl: topic?.imageUrl
              })
            }
            continue;
          }
          pairs.push({
            topicName: topic?.name,
            subtopicName: '',
            imageUrl: topic?.imageUrl
          })
        }
    
        this.topicSubtopicPairs = pairs;
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private setTabs(): void {
    this.activeContentDetails$.pipe(
      filter(contentDetails => !!contentDetails),
      tap(contentDetails => {
        const additionalTabs = [];
        if (contentDetails?.type === ContentType.Video) {
          const contentAsVideo = contentDetails as Video;
          if (contentAsVideo?.chapters?.length) {
            additionalTabs.push({key: 'Chapters', label: "Chapters"});
          }
          if (contentAsVideo?.transcriptUrl?.length) {
            additionalTabs.push({key: 'Transcript', label: "Transcript"});
          }
        }
    
        this.tabs = [...DEFAULT_TABS, ...additionalTabs];
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private setAutoScrollTranscript(): void {
    this.videoPlayerStateService.getViewPagePlayer().pipe(takeUntil(this.destroy$)).subscribe(
        res => {
          this.autoscrollTranscript = res?.getTranscriptAutoScroll();
        }
      );
  }

  

  private createDetailAttributes(content: ContentDetails): DetailAttribute[] {
    const detailAttributes: DetailAttribute[] = [];

    if (content?.difficulty !== ContentDifficulty.None) {
      detailAttributes.push({
        label: "Difficulty",
        value: ContentDifficulty[content?.difficulty],
        isBold: true,
        includeInfoIcon: false,
        imageUrl: "assets/images/content/difficulty/advanced-grey.svg" });
    }

    // TODO - use after implementing Role Base Learning
    if (false && [ContentType.LearningPath].includes(content?.type)) {
      detailAttributes.push({
        label: "Required",
        value: 'TODO',
        isBold: false,
        includeInfoIcon: true,
        imageUrl: "assets/images/clipboard-check-grey.svg" });
    }
    if (false && [ContentType.LearningPath].includes(content?.type)) {
      detailAttributes.push({
        label: "Assigned By",
        value: 'TODO', // TODO - after assignments
        isBold: false,
        includeInfoIcon: false,
        imageUrl: "assets/images/user-circle-grey.svg" });
    }
    if (false && [ContentType.LearningPath].includes(content?.type)) {
      detailAttributes.push({
        label: "Due Date",
        value: 'TODO', // TODO - after assignments
        isBold: false,
        includeInfoIcon: false,
        imageUrl: "assets/images/calendar-grey.svg" });
    }
    if ([ContentType.LearningPath, ContentType.Video].includes(content?.type) && content?.duration > 0) {
      detailAttributes.push({
        label: "Duration",
        value: formatDurationLong(content?.type === ContentType.LearningPath ? content?.duration * 60 : content?.duration), // do this until we resolve duration issue on backend
        isBold: false,
        includeInfoIcon: false,
        imageUrl: "assets/images/clock-long-grey.svg" });
    }
    detailAttributes.push({
      label: "Modified",
      value: this.getModifiedFormatted(content),
      isBold: false,
      includeInfoIcon: false,
      imageUrl: "assets/images/modified-grey.svg" });
    detailAttributes.push({
      label: "Publisher",
      value: content?.publisher.name,
      isBold: false,
      includeInfoIcon: false,
      imageUrl: "assets/images/publisher-grey.svg" });

    if (content?.type === ContentType.LearningPath) {
      var learningPath = content as LearningPath;
      detailAttributes.push({
        label: "Certificate(s)",
        value: learningPath?.certificate?.useAsDefault ? "Available" : "Unavailable",
        isBold: false,
        includeInfoIcon: false,
        imageUrl: "assets/images/certifications.svg" });
    }
  
    return detailAttributes;
  }  

  private manageLayout() {
    this.isFullScreen$ = this.layoutState.selectIsFullScreen$.pipe(
      tap(isFullScreen => {
        if (isFullScreen) {
          this.isMenuCollapsed = true;
        }
      }),
      takeUntil(this.destroy$)
    );

    this.layoutState.selectFullScreenText$.pipe(
      take(1)
    ).subscribe(isFullScreen => {
      if (isFullScreen) {
        this.isMenuCollapsed = true;
      }
    })
  }

  private getModifiedFormatted(content: ContentDetails): string {
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "2-digit",
      year: "numeric"
    }

    // invalid datetime format on DB side causes us to use new Date() here
    return new Intl.DateTimeFormat('en-us', options).format(new Date(content?.lastModified)) +
      (content?.lastModifiedBy?.displayName ? ` by ${content?.lastModifiedBy?.displayName}` : '');
  }

  onTabChange(tabKey) {
    this.currTabName = tabKey;
  }

  onToggleAutoscroll() {
    this.autoscrollTranscript = !this.autoscrollTranscript;
    this.videoPlayerStateService.getViewPagePlayer().pipe(take(1)).subscribe(res => {
      res?.setTranscriptAutoScroll(this.autoscrollTranscript);
    });

  }

  toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;

    // update user setting
    this.userService.modifyUserSettings(this.authState.state$.getValue().currentUserId, { peakContentDetailsCollapsedNewValue: this.isMenuCollapsed })
      .pipe(take(1))
      .subscribe();
  }

  private setDetailsCollapsed() {
    this.userService.getUserSettings(this.authState.state$.getValue().currentUserId)
      .subscribe(res => {
        this.isMenuCollapsed = res?.userSettings?.peakContentDetailsCollapsed === 'True' ?? false;
      })
  }
}

