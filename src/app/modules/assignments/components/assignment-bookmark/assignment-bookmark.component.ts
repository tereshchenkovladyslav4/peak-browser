import { NgIf } from '@angular/common';
import { Component, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { BookmarkCardIconComponent } from 'src/app/modules/bookmarks/components/bookmark-card-icon/bookmark-card-icon.component';
import { BookmarksStateService } from 'src/app/state/bookmarks/bookmarks-state.service';

@Component({
  selector: 'ep-assignment-bookmark',
  templateUrl: './assignment-bookmark.component.html',
  styleUrls: ['./assignment-bookmark.component.scss'],
  standalone: true,
  imports: [NgIf, BookmarkCardIconComponent],
})
export class AssignmentBookmarkComponent implements OnInit, OnDestroy {
  @Input() contentId: string | undefined;
  @Input() isWhite = true;
  readonly unsubscribeAll$ = new Subject<void>();

  constructor(
    private bookmarksState: BookmarksStateService,
    private renderer: Renderer2,
    private el: ElementRef,
  ) {}

  ngOnInit(): void {
    this.bookmarksState.bookmarksMap$.pipe(takeUntil(this.unsubscribeAll$)).subscribe(() => {
      // This style should be applied to the component wrapper to prevent gap style of the parent element.
      if (this.bookmarksState.isContentBookmarked(this.contentId)) {
        this.renderer.setStyle(this.el.nativeElement, 'display', 'block');
      } else {
        this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }
}
