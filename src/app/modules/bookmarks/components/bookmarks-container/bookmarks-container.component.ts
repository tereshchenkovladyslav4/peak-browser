import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {
  AssignmentHistoryComponent
} from "../../../assignments/components/assignment-history/assignment-history.component";
import {AsyncPipe, CommonModule, NgClass, NgForOf, NgIf, NgStyle, NgSwitch, NgSwitchCase} from "@angular/common";
import {
  CurrentlyAssignedComponent
} from "../../../assignments/components/currently-assigned/currently-assigned.component";
import {HorizontalTabsComponent} from "../../../../components/horizontal-tabs/horizontal-tabs.component";
import {LoadingComponent} from "../../../../components/loading/loading.component";
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {ActiveFiltersComponent} from "../../../../components/filter/active-filters/active-filters.component";
import {LibraryCardComponent} from "../../../library/components/library-card/library-card.component";
import {SharedModule} from "../../../shared/shared.module";
import {TopicsFilterComponent} from "../../../../components/filter/topics-filter/topics-filter.component";
import {CardViewComponent} from "../../../../components/card-view/card-view.component";
import {AssignmentCardComponent} from "../../../assignments/components/assignment-card/assignment-card.component";
import {WithIsLoaded} from "../../../../resources/mixins/is-loaded.mixin";
import {combineLatest, Observable, startWith, Subject} from "rxjs";
import {filter, last, map, takeUntil, tap} from "rxjs/operators";
import {FilterType} from "../../../../resources/enums/filter-type";
import {FilterStateService} from "../../../../state/filter/filter-state";
import {BookmarkCardComponent} from "../bookmark-card/bookmark-card.component";
import {ContentItem} from "../../../../resources/models/content";
import { BookmarksStateService } from 'src/app/state/bookmarks/bookmarks-state.service';
import { BookmarksFilterService } from 'src/app/services/bookmarks/bookmarks-filter.service';
import { Bookmark } from "../../../../resources/models/content/bookmarks";
import { RouterLink } from '@angular/router';
import { APP_ROUTES } from '../../../../resources/constants/app-routes';

@Component({
  selector: 'ep-bookmarks-container',
  templateUrl: './bookmarks-container.component.html',
  styleUrls: ['./bookmarks-container.component.scss'],
  imports: [
    HorizontalTabsComponent,
    ActiveFiltersComponent,
    AsyncPipe,
    LibraryCardComponent,
    LoadingComponent,
    NgForOf,
    NgIf,
    RouterLink,
    ReactiveFormsModule,
    SharedModule,
    TopicsFilterComponent,
    NgStyle,
    NgClass,
    NgSwitch,
    NgSwitchCase,
    CurrentlyAssignedComponent,
    AssignmentHistoryComponent,
    CommonModule,
    CardViewComponent,
    AssignmentCardComponent,
    BookmarkCardComponent
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookmarksContainerComponent extends WithIsLoaded() implements OnInit, OnDestroy {
  protected readonly APP_ROUTES = APP_ROUTES;
  bookmarks$: Observable<ContentItem[]>;
  form = new FormGroup({
    filter: new FormControl('', null)
  });
  formFilter$: Observable<string> = this.form.valueChanges.pipe(
    map(form => form.filter.toLowerCase()),
    startWith('')
  );
  protected readonly filterType = FilterType;
  filteredData$: Observable<Bookmark[]>;
  isNoDataResults$: Observable<boolean>;
  isNoFilteredDataResults$: Observable<boolean>;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private router : Router,
    private filterState: FilterStateService,
    private bookmarksFilterService: BookmarksFilterService,
    private bookmarksState: BookmarksStateService
  ) {
    super();
  }

  ngOnInit(): void {
    // get all bookmarks from state and populate into filter state
    this.filterState.updateIsLoaded(false);
    this.bookmarksState.bookmarksMap$.pipe(
      tap(bookmarksMap => {
        const bookmarksArr = Array.from(bookmarksMap.values()).sort((a, b) => { return a.content.name.localeCompare(b.content.name) });
        this.filterState.updateData(bookmarksArr);
      }),
      tap(_ => this.filterState.updateIsLoaded(true)),
      tap(_ => this.setIsLoaded(this.bookmarksFilterService)),
      takeUntil(this.unsubscribe$)
    )
    .subscribe();

    this.isNoFilteredDataResults$ = this.filterState.selectIsNoFilteredDataResults();
    this.isNoDataResults$ = this.filterState.selectIsNoDataResults();

    this.filteredData$ = combineLatest([
      this.filterState.selectFilteredData(),
      this.formFilter$,
    ]).pipe(
      map(([bookmarks, ...rest]) => bookmarks)
    );

    this.bookmarksFilterService.reset$
      .pipe(
        filter((r) => r?.filters),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => this.clearFilters())

    this.listenToSearchForm();
  }

  ngOnDestroy(): void {
    this.filterState.resetState();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // private setBookmarks() {
  //   this.bookmarksService
  //     .fetchBookmarks()
  //     .pipe(
  //       tap(bookmarks => this.filterState.updateData(bookmarks)),
  //       tap(_ => this.filterState.updateIsLoaded(true)),
  //       takeUntil(this.unsubscribe$)
  //     )
  //     .subscribe();
  // }

  clearFilters() {
    this.bookmarksFilterService.removeAllFilters();
    this.onBuiltInSearch();
  }

  listenToSearchForm() {
    this.form.valueChanges
      .pipe(
        // debounceTime(300)
        takeUntil(this.unsubscribe$)
      ).subscribe(() => {
        this.onBuiltInSearch();
      })
  }

  onBuiltInSearch() {
    const {filter} = this.form.getRawValue();
    this.onFilter({searchBy: filter || ''}, FilterType.SEARCH);
  }

  onFilter(filterValues: any, filterType: FilterType) {
    this.bookmarksFilterService.onFilter(filterValues, filterType);
  }
}
