import { Component, Input, OnInit } from '@angular/core';
import { ContentDetails } from '../../../../resources/models/content';
import { SafeUrl } from '@angular/platform-browser';
import { DropdownItem } from '../../../../resources/models/dropdown-item';
import { CONSTANTS } from './../../../../config/constants';
import { DropdownMenuService } from 'src/app/services/dropdown-menu.service';
import { BookmarksService } from '../../../../services/bookmarks/bookmarks.service';
import { takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BookmarksStateService } from 'src/app/state/bookmarks/bookmarks-state.service';

@Component({
  selector: 'ep-content-header',
  templateUrl: './content-header.component.html',
  styleUrls: ['./content-header.component.scss'],
})
export class ContentHeaderComponent implements OnInit {
  @Input() content: ContentDetails = null;
  @Input() isLiked: boolean = false;
  @Input() likeCount: number = 23;

  isContentBookmarked: boolean;
  dropdownShareItems: DropdownItem[] = [];
  showDropdownShareMenu: boolean = false;
  dropdownTop: number = 0;
  dropdownRight: number = 0;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private dropdownMenuService: DropdownMenuService,
    private booksmarksService: BookmarksService,
    private bookmarksState: BookmarksStateService
  ) {}

  ngOnInit(): void {
    this.bookmarksState.bookmarksMap$
      .pipe(
        tap((bookmarksMap) => {
          this.isContentBookmarked = bookmarksMap.has(this.content.id);
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

  getBookmarkImageUrl(): SafeUrl {
    if (this.isContentBookmarked) {
      return 'assets/images/content/header/bookmark-filled.svg';
    }
    return 'assets/images/content/header/bookmark-unfilled.svg';
  }

  getLikeImageUrl(): SafeUrl {
    if (this.isLiked) {
      return 'assets/images/content/header/thumbs-up-filled.svg';
    }
    return 'assets/images/content/header/thumbs-up-unfilled.svg';
  }

  toggleBookmarked() {
    const observable = this.isContentBookmarked
      ? this.booksmarksService.removeBookmark(this.content.id)
      : this.booksmarksService.createBookmark(this.content.id);

    observable.pipe(takeUntil(this.unsubscribe$)).subscribe();
  }

  toggleLiked() {
    if (this.isLiked) {
      this.likeCount--;
    } else {
      this.likeCount++;
    }
    this.isLiked = !this.isLiked;
  }

  dropdownShareMenu(event) {
    this.setDropdownPosition(event.target);
    this.buildDropdownShareMenu();
    this.showDropdownShareMenu = true;
  }

  closeDropdownShareMenu() {
    this.showDropdownShareMenu = false;
  }

  setDropdownPosition(target: any) {
    const dropdownTopOffset = 0;
    const dropdownRightOffset = 0;
    let windowWidth = window.innerWidth;

    // we know for this one that the dropdown should be aligned with a button. In case they clicked on the image in the button, look for the outer button
    while (target != null && target.type != 'button') {
      target = target.parentNode;
    }

    // the dropdown should be right aligned with the button clicked
    let rect = target.getBoundingClientRect();
    this.dropdownTop = rect.bottom + 10;

    // determine the right side, not forgetting about any Zoom factor applied to the body element
    this.dropdownRight = window.innerWidth / CONSTANTS.BODY_ZOOM - rect.right;
  }

  private buildDropdownShareMenu() {
    this.dropdownShareItems = this.dropdownMenuService.buildShareMenu();
  }
}
