import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit} from '@angular/core';
import {Library} from "../../../../resources/models/library";
import {LibraryContent} from "../../../../resources/models/content";
import {LibraryContentService} from "../../../../services/library-content/library-content.service";
import {filter, map, takeUntil} from "rxjs/operators";
import {combineLatest, Observable, Subject, take} from "rxjs";
import {CardViewComponent, TableRow} from "../../../../components/card-view/card-view.component";
import {AsyncPipe, NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {SharedModule} from "../../../shared/shared.module";
import {NavigationStart, Router} from "@angular/router";
import {NAVIGATION_ROUTES} from "../../../../resources/constants/app-routes";
import {DropdownMenuService} from "../../../../services/dropdown-menu.service";
import {WithDropdownItemsTempCache} from "../../../../resources/mixins/dropdown-items-temp-cache.mixin";
import {SpinnerComponent} from "../../../../components/spinner/spinner.component";
import {FilterStateService} from "../../../../state/filter/filter-state";
import {ASC, SORT_BY_TOKEN, SortableService} from "../../../../services/sortable/sortable.service";
import { BookmarksStateService } from 'src/app/state/bookmarks/bookmarks-state.service';
import { Select } from '@ngxs/store';
import { ThemeState } from 'src/app/state/themes/themes.state';
const DEFAULT_SORT = {
  name: {
    order: ASC,
    isActive: true,
    path: 'tableRow.data.name'
  }
};

interface TableRowWithDropdownItems {
  tableRow: TableRow;
  dropdownItems: any;
}

@Component({
  selector: 'ep-library-contents',
  templateUrl: './library-contents.component.html',
  styleUrls: ['./library-contents.component.scss'],
  imports: [
    CardViewComponent,
    NgForOf,
    AsyncPipe,
    SharedModule,
    NgClass,
    NgStyle,
    SpinnerComponent,
    NgIf
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: SORT_BY_TOKEN, useValue: DEFAULT_SORT },
    SortableService
  ]
})
export class LibraryContentsComponent extends WithDropdownItemsTempCache() implements OnInit, OnChanges {
  @Input() library: Library;
  private destroy$ = new Subject<void>();
  filteredData$: Observable<TableRowWithDropdownItems[]>;
  libraryContentsCount$: Observable<number>;
  isNoDataResults$: Observable<boolean>;
  shouldShowSort$: Observable<boolean>;
  isNoFilteredDataResults$: Observable<boolean>;
  @Select(ThemeState.libraryImage) libraryImage$: Observable<string>;
  bannerStyle = this.getBannerStyle('assets/images/default-library-image-2.png');

  constructor(
    private libraryContentService: LibraryContentService,
    private dropdownMenuService: DropdownMenuService,
    private router: Router,
    private filterState: FilterStateService,
    protected sortable: SortableService<TableRowWithDropdownItems>,
    private bookmarksState: BookmarksStateService
  ) {
    super();
  }

  ngOnInit(): void {
    this.isNoDataResults$ = this.filterState.selectIsNoDataResults();
    this.isNoFilteredDataResults$ = this.filterState.selectIsNoFilteredDataResults();
    this.shouldShowSort$ = combineLatest([
      this.isNoDataResults$,
      this.isNoFilteredDataResults$
    ]).pipe(
      map(([isNoData, isNoFilteredData]) => !isNoData && !isNoFilteredData)
    );
    // map initial data with dropdown items
    const filteredData$: Observable<TableRowWithDropdownItems[]> = this.filterState.selectFilteredData().pipe(
      map(data => data as unknown as LibraryContent[]),
      map(data => data?.map(content => ({
        tableRow: {data: content} as TableRow,
        dropdownItems: this.getDropdownItems({ key: content.id, contentId: content.id})
      }) || [] as any))
    );

    // handle sort
    this.filteredData$ = combineLatest([
      filteredData$,
      this.sortable.triggerSort$
    ]).pipe(
      map(([libraryContents, sortBy]: [TableRowWithDropdownItems[], any]) => {
        libraryContents.sort(this.sortable.propertyCompareFn(sortBy.path, sortBy.order))
        return libraryContents;
      })
    );

    // set count
    this.libraryContentsCount$ = this.libraryContentService.libraryContentsCount$;

    this.libraryImage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(libraryImage => {
        if (libraryImage && libraryImage.toString().trim() != '') {
          this.bannerStyle = this.getBannerStyle(libraryImage);
        }
      });

    // reset filter on nav
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart),
      take(1),
    ).subscribe(() => this.libraryContentService.removeAllFilters());
  }

  ngOnChanges(changes) {
    if (changes.library) {
      if (this.library?.bannerImageUrl) {
        this.bannerStyle = this.getBannerStyle(this.library.bannerImageUrl);
      }
    }
  }

  onCardClick(content: TableRow) {
    this.router.navigate([NAVIGATION_ROUTES.content, content.data.id])
  }

  protected override constructDropdownItems(data) {
    return this.dropdownMenuService
      .addView({action: this.dropdownMenuService.getNavigateToContentAction(data?.contentId)})
      .addBookmarkItem(this.bookmarksState.isContentBookmarked(data?.contentId), data?.contentId)
      .addDivider()
      //.addShareNotification({})
      //.addShareWorkGroup({})
      .addCopyLinkFormatted({})
      .addCopyLinkUnformatted({})
      .getItems();
  }

  private getBannerStyle(img) {
    return `linear-gradient(45deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(${img})`;
  }

  onNavigateToLibraries() {
    this.router.navigate([NAVIGATION_ROUTES.libraries]);
  }
}
