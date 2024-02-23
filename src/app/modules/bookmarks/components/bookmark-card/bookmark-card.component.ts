import {ChangeDetectorRef, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {AsyncPipe, DatePipe, NgClass, NgIf, NgStyle} from "@angular/common";
import {WithDropdownItemsTempCache} from "../../../../resources/mixins/dropdown-items-temp-cache.mixin";
import {BehaviorSubject} from "rxjs";
import {Router} from "@angular/router";
import {ContentTypesService} from "../../../../services/content-types.service";
import {DropdownMenuService} from "../../../../services/dropdown-menu.service";
import {ContentType} from "../../../../resources/models/content";
import {NAVIGATION_ROUTES} from "../../../../resources/constants/app-routes";
import { BookmarkCardIconComponent } from '../bookmark-card-icon/bookmark-card-icon.component';
import { BookmarksStateService } from 'src/app/state/bookmarks/bookmarks-state.service';
import { Bookmark } from "../../../../resources/models/content/bookmarks";
import { TextTruncateDirective } from '../../../../directives/text-truncate.directive';
import { formatDurationLong} from 'src/app/resources/functions/content/content';
import { ContentDocumentType } from '../../../../resources/models/managed-content/content';
import { TranslationService } from '../../../../services/translation.service';
import { DropdownMenuComponent } from "src/app/components/dropdown-menu/dropdown-menu.component";
import { DropdownMenuContainerComponent } from "src/app/components/dropdown-menu-container/dropdown-menu-container.component";

@Component({
  selector: 'ep-bookmark-card',
  templateUrl: './bookmark-card.component.html',
  styleUrls: ['./bookmark-card.component.scss'],
  imports: [
    NgIf,
    NgClass,
    DropdownMenuComponent,
    DropdownMenuContainerComponent,
    DatePipe,
    NgStyle,
    AsyncPipe,
    TextTruncateDirective,
    BookmarkCardIconComponent
  ],
  standalone: true
})
export class BookmarkCardComponent extends WithDropdownItemsTempCache() {
  @Input() bookmark: Bookmark;
  dropdownItems: any = [];
  public showMenu = false;
  pastDue: any = false;
  contentTypeIconUrl: any;
  contentTypeName: any;
  image: string = '';
  contentSummary: string = '';
  @ViewChild('title') title;
  subtitleClass$: BehaviorSubject<string> = new BehaviorSubject<string>('')
  titleRows: number;
  isMenuOpened = false;


  constructor(
    private router: Router,
    private elRef: ElementRef,
    private cdRef: ChangeDetectorRef,
    private translationService: TranslationService,
    private contentTypesService: ContentTypesService,
    private bookmarksState: BookmarksStateService,
    private dropdownMenuService: DropdownMenuService
  ) {
    super();
  }

  ngOnInit() {
    this.elRef.nativeElement.addEventListener('pointerenter', (event) => {
      this.showMenu = true;
      this.cdRef.detectChanges();
    });

    this.elRef.nativeElement.addEventListener('pointerleave', (event) => {
      this.showMenu = false;
      this.cdRef.detectChanges();
    });

    this.dropdownItems = this.getDropdownItems({ key: this.bookmark?.content?.id });
    //
    //
    this.setContentTypes();
    this.setImage();
    this.setContentSummary();
  }

  onBookmarkClick() {
    this.resume();
  }

  protected override constructDropdownItems(data) {
    return this.dropdownMenuService
      .addView({ action: this.dropdownMenuService.getNavigateToContentAction(this.bookmark?.content?.id) })
      .addBookmarkItem(this.bookmarksState.isContentBookmarked(this.bookmark?.content?.id), this.bookmark?.content?.id)
      .addDivider()
      //.addShareNotification({})
      //.addShareWorkGroup({})
      .addCopyLinkFormatted({})
      .addCopyLinkUnformatted({})
      .getItems();
  }

  private setContentTypes() {
    const contentType = this.bookmark?.content?.type as unknown as ContentType;
    const documentType = this.bookmark?.content?.documentType;
    this.contentTypeIconUrl = this.contentTypesService.getContentInfoIconUrl(contentType, documentType);
    this.contentTypeName = this.contentTypesService.getContentInfoTranslationText(contentType, documentType);
  }

  private setImage() {
    this.image = this.bookmark?.content?.imageUrl;
  }

  setContentSummary() {
    const contentType = this.bookmark?.content?.type as unknown as ContentType;
    const documentType = this.bookmark?.content?.documentType;
    this.contentSummary = this.contentTypeName;

    switch (contentType) {
      case ContentType.Document:
        if (documentType == ContentDocumentType.Custom) {
          this.contentSummary = this.translationService.getTranslationFileData('bookmark-card.summary-document-native');
        }
        break;
      case ContentType.LearningPath:
        this.contentSummary = this.bookmark?.childCount.toString() + this.translationService.getTranslationFileData('bookmark-card.summary-courses');
        break;
      case ContentType.Course:
      case ContentType.ScormPackage:
        this.contentSummary = this.bookmark?.childCount.toString() + this.translationService.getTranslationFileData('bookmark-card.summary-content-items');
        break;
      case ContentType.Workflow:
        this.contentSummary = this.bookmark?.childCount.toString() + this.translationService.getTranslationFileData('bookmark-card.summary-processes');
        break;
      case ContentType.Process:
        this.contentSummary = this.bookmark?.childCount.toString() + this.translationService.getTranslationFileData('bookmark-card.summary-tasks');
        break;
      case ContentType.Video:
        this.contentSummary = formatDurationLong(this.bookmark?.durationInSeconds);
        break;
      case ContentType.LiveEvent:
        break;
    }
  }


  /***
   * sets subtitle class once element is ready to be evaluated
   */
  initSubtitleClass() {
    if (this.title?.nativeElement?.offsetHeight) {
      this.subtitleClass$.next(this.title.nativeElement.offsetHeight < 30 ? 'line-clamp-2' : 'line-clamp-1');
    }

    return null;
  }

  resume() {
    this.router.navigate([NAVIGATION_ROUTES.content, this.bookmark?.content?.id]);
  }

}
