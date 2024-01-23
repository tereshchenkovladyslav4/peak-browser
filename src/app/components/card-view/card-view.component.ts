import { Component, EventEmitter, Input, OnDestroy, OnInit, Output}  from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {ContentTypesService} from "../../services/content-types.service";
import {ContentType} from "../../resources/models/content";
import {EpCheckboxInputComponent} from "../input-fields/checkbox-input/checkbox-input.component";
import { NavigateContentService } from "../../services/navigate-content.service";
import { BookmarksStateService } from "../../state/bookmarks/bookmarks-state.service";
import {DatePipe, NgClass, NgIf, NgStyle} from "@angular/common";
import {SharedModule} from "../../modules/shared/shared.module";
import {
  CONTENT_TYPE_DISPLAY_MAP,
  mapServerContentTypeToContentTypeString
} from "../../resources/models/filter/content-type-filter";
import {DropdownMenuComponent} from "../dropdown-menu/dropdown-menu.component";
import {DropdownMenuContainerComponent} from "../dropdown-menu-container/dropdown-menu-container.component";
import { BookmarkCardIconComponent } from '../../modules/bookmarks/components/bookmark-card-icon/bookmark-card-icon.component';

export class TableRow {
  constructor(
    public data: any,
    public disabled?: boolean,
    public selected?: boolean) {
  }
}

@Component({
  selector: 'ep-card-view',
  templateUrl: './card-view.component.html',
  styleUrls: ['./card-view.component.scss'],
  imports: [
    EpCheckboxInputComponent,
    NgClass,
    SharedModule,
    DatePipe,
    NgIf,
    DropdownMenuComponent,
    DropdownMenuContainerComponent,
    NgStyle,
    BookmarkCardIconComponent
  ],
  standalone: true
})
export class CardViewComponent implements OnInit, OnDestroy {

  @Input() content;
  @Input() checkbox: boolean = false;
  @Input() clickable: boolean = false;
  @Input() dropdownItems?: any;

  @Output()
  selectedSingle: EventEmitter<TableRow> = new EventEmitter<TableRow>();
  @Output()
  clicked: EventEmitter<TableRow> = new EventEmitter<TableRow>();

  contentImage;
  contentTypeImage;
  imageClass: string;
  isFolder;
  type: string;
  isMenuOpened = false;
  isBookmarked: boolean = false;

  bookmarksSubscription: Subscription;


  constructor(
    private cdr: ChangeDetectorRef,
    private contentTypeService: ContentTypesService,
    private router: Router,
    private navigateContent: NavigateContentService,
    private bookmarksStateService: BookmarksStateService,
  ) {
  }

  ngOnInit() {
    this.setContentIconType();
    this.setContentImage();
    this.setIsFolder();
    this.setImageClass();
    this.setType();
    this.setBookmarked();
  }

  ngOnDestroy() {
    if (this.bookmarksSubscription) {
      this.bookmarksSubscription.unsubscribe();
    }
  }

  selectEvent(item): void {
    item.selected = !item.selected;
    this.selectedSingle.emit(item)
  }

  clickEvent() {
    this.navigateContent.viewContent(this.content.data)
  }

  private setBookmarked(): void {
    this.bookmarksSubscription = this.bookmarksStateService.bookmarksMap$.subscribe(res => {
      this.isBookmarked = this.bookmarksStateService.isContentBookmarked(this.content.data.id);
      this.cdr.detectChanges();
    });
  }

  private setContentImage(): void {
    if (this.content.data.type == ContentType.Folder) {
      this.contentImage = this.content.data.restricted ? "assets/images/LockedFolderTv.svg" : "assets/images/OpenFolderTv.svg";
    } else {
      this.contentImage = this.content.data.imageUrl ? this.content.data.imageUrl : this.contentTypeImage;
    }
  }

  private setImageClass(): void {
    if (this.isFolder) {
      this.imageClass = "folder-image"
    } else if (this.content.data.imageUrl) {
      this.imageClass = "custom-image"
    } else {
      this.imageClass = "content-image";
    }
  }

  private setIsFolder(): void {
    this.isFolder = this.content.data.type === ContentType.Folder;
  }

  private setType(): void {
    this.type = this.contentTypeService.contentTypeNumberToString(this.content.data.type)
  }

  private redirectTo(uri: Array<string> | string) {
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() =>
      this.router.navigate([uri]));
  }

  protected readonly Date = Date;

  private setContentIconType() {
    const contentType = mapServerContentTypeToContentTypeString(this.content.data.type);
    this.content.data.contentTypeMeta = CONTENT_TYPE_DISPLAY_MAP[contentType];

    if (this.content.data.type === ContentType.Document) {
      this.content.data.contentTypeMeta.image = this.contentTypeService.getContentInfoIconUrl(this.content.data.type, this.content.data.documentType);
    }

    this.contentTypeImage = this.content.data.contentTypeMeta?.image
  }
}
