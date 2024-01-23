import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {LibraryService} from "../../../../services/library/library.service";
import {combineLatest, Observable, startWith, Subject, Subscription} from "rxjs";
import {Library} from "../../../../resources/models/library";
import {AsyncPipe, NgClass, NgForOf, NgIf, NgStyle, NgSwitchCase} from "@angular/common";
import {LibraryCardComponent} from "../library-card/library-card.component";
import {filter, map, take, takeUntil, tap} from "rxjs/operators";
import {
  EpTextInputFieldComponent
} from "../../../../components/input-fields/text-input-field/text-input-field.component";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SpinnerComponent} from "../../../../components/spinner/spinner.component";
import {WithIsLoaded} from "../../../../resources/mixins/is-loaded.mixin";
import {LibraryStateService} from "../../../../state/library/library-state.service";
import {LoadingComponent} from "../../../../components/loading/loading.component";
import {ASC, SORT_BY_TOKEN, SortableService} from "../../../../services/sortable/sortable.service";
import {TopicsFilterComponent} from "../../../../components/filter/topics-filter/topics-filter.component";
import {DropdownConfig} from "../../../../services/dropdown-menu.service";
import {DropdownMenuComponent} from "../../../../components/dropdown-menu/dropdown-menu.component";
import {FilterStateService} from "../../../../state/filter/filter-state";
import {LibrariesService} from "../../../../services/libraries/libraries.service";
import {FilterType} from "../../../../resources/enums/filter-type";
import {ActiveFiltersComponent} from "../../../../components/filter/active-filters/active-filters.component";
import {SharedModule} from "../../../shared/shared.module";
import {deepEquals} from "../../../../resources/functions/object/deep-equals";
import {UserService} from "../../../../services/user.service";
import { Select, Store } from '@ngxs/store';
import { LibraryState } from '../../../../state/library/library.state';
import { FilterState } from '../../../../state/filter/filter.state';
import { LibraryActions } from '../../../../state/library/library.actions';
import { FilterActions } from '../../../../state/filter/filter.actions';

const DEFAULT_SORT = {
  name: {
    order: ASC,
    isActive: true,
    path: 'name'
  }
};

@Component({
  selector: 'ep-libraries-container',
  templateUrl: './libraries-container.component.html',
  styleUrls: ['./libraries-container.component.scss'],
  standalone: true,
  imports: [
    NgForOf,
    AsyncPipe,
    LibraryCardComponent,
    NgClass,
    EpTextInputFieldComponent,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    SpinnerComponent,
    LoadingComponent,
    TopicsFilterComponent,
    DropdownMenuComponent,
    NgStyle,
    NgSwitchCase,
    ActiveFiltersComponent,
    SharedModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {provide: SORT_BY_TOKEN, useValue: DEFAULT_SORT},
    SortableService
  ]
})
export class LibrariesContainerComponent implements OnInit, OnDestroy {
  @Select(LibraryState.getIsLoaded) isLoaded$: Observable<boolean>;
  @Select(FilterState.selectFilteredData) selectFilteredData$: Observable<any>;
  @Select(FilterState.getFilterOptionByType(FilterType.TOPICS)) topicsValues$: Observable<any>;
  @Select(FilterState.getSearchFilterOptionByType(FilterType.TOPICS)) topicsSearchFilterValue$: Observable<any>;
  @Select(state => state.Filter.activeFilters) activeFilters$: Observable<any>;
  @Select(state => state.Filter.data && !state.Filter.data.length) isNoDataResults$: Observable<boolean>;
  isNoFilteredDataResults$: Observable<boolean>;
  @Select(FilterState.getData) data$: any;
  @Select(LibraryState.getLibraries) libraries$: Observable<Library[]>;
  filteredData$: Observable<Library[]>;
  form = new FormGroup({
    filter: new FormControl('', null)
  });
  formFilter$: Observable<string> = this.form.valueChanges.pipe(
    map(form => form.filter.toLowerCase()),
    startWith('')
  );
  protected readonly filterType = FilterType;
  shouldShowSort$: Observable<boolean>;
  topicsFilterConfig: { isOpen: boolean } & DropdownConfig = {
    isOpen: false,
    items: [],
    styles: {
      left: 0 + 'px',
      top: 0 + 'px'
    }
  };
 
  private unsubscribe$ = new Subject<void>();
  @ViewChild('searchContainer', {read: ElementRef}) searchContainer: ElementRef;
  @ViewChild('topicsFilter', {read: ElementRef}) topicsFilter: ElementRef;
  selectedTopicsValues: [any, FilterType] = [null, null];
  isApplyFiltersActive: boolean = false;

  constructor(private librariesService: LibrariesService,
              protected sortable: SortableService<Library>,
              private store: Store,
              private elRef: ElementRef  ) {
  }

  ngOnInit() {
    this.store.dispatch(new LibraryActions.CurrentLibrariesFromApi);
    window.scroll(0, 0);
    this.isNoFilteredDataResults$ = this.selectFilteredData$.pipe(map(filteredData => filteredData && !filteredData.length));
    this.shouldShowSort$ = combineLatest([
      this.isNoDataResults$,
      this.isNoFilteredDataResults$
    ]).pipe(
      map(([isNoData, isNoFilteredData]) => !isNoData && !isNoFilteredData)
    );

    this.filteredData$ = combineLatest([
      this.selectFilteredData$,
      this.formFilter$,
      this.sortable.triggerSort$
    ]).pipe(
      map(([libraries, formFilter, sortBy]) => {
        if (libraries?.length) {
          libraries.sort(this.sortable.propertyCompareFn(sortBy.path, sortBy.order))
        }
        return libraries;
      })
    );

    this.librariesService.reset$.pipe(
      filter((r) => r?.filters),
      takeUntil(this.unsubscribe$)
      ).subscribe(() => this.clearFilters())

    this.listenToSearchForm();
  }

  ngOnDestroy() {
    this.store.dispatch(new FilterActions.ResetFilterState);
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  //Acts on changes to search input field
  listenToSearchForm() {
    this.form.valueChanges.pipe(
        takeUntil(this.unsubscribe$)
        ).subscribe(() => {
        this.onBuiltInSearch();
      })
  }

  onBuiltInSearch() {
    const {filter} = this.form.getRawValue();
    this.onFilter({name: filter || '', description: filter || ''}, FilterType.SEARCH);
  }

  onTopicsClick(event: MouseEvent) {
    const nativeEl = this.searchContainer?.nativeElement;
    const [right, bottom]: [number, number] = [
      nativeEl.offsetLeft + nativeEl.offsetWidth,
      nativeEl.offsetTop + nativeEl.offsetHeight,
    ];
    const offset = 450;

    this.topicsFilterConfig = {
      ...this.topicsFilterConfig,
      styles: {
        top: bottom + 'px',
        left: (right - offset) + 'px'
      }
    }

    // this stops propagation to parent but still fires click event in document
    event.stopPropagation();
    this.topicsFilterConfig.isOpen = !this.topicsFilterConfig.isOpen;
  }

  @HostListener('document:click', ['$event'])
  closeTopicsFilter(event) {
    if (!this.topicsFilter?.nativeElement) {
      return;
    }

    // close this dropdown menu if user clicked any element outside of filter dropdown
    if (
      this.elRef.nativeElement.contains(this.topicsFilter?.nativeElement) &&
      !this.topicsFilter?.nativeElement.contains(event.target) &&
      event.target.tagName.toLowerCase() !== 'body'
    ) {
      this.topicsFilterConfig.isOpen = false;
    }
  }

  //Searches within topics filter dropdown
  onSearch(filterValues: any, filterType: FilterType) {
    this.store.dispatch(new FilterActions.SearchFilterDropdown(filterValues, filterType));
  }

  onTopicsFilter(filterValues: any, filterType: FilterType) {
    this.selectedTopicsValues = [filterValues, filterType];

    this.topicsValues$.pipe(
      take(1)
    ).subscribe(currentTopics => {
      const allFalse = (obj) => {
        return Object.values(obj).every(value => value instanceof Object ? allFalse(value) : value === false);
      }
      //Ensures there's at least one change to filters before enabling 'apply' btn
      this.isApplyFiltersActive = (
        !deepEquals(filterValues, currentTopics) &&
        !(allFalse(filterValues) && deepEquals(currentTopics, {}))
      );
    });
  }

  onFilter(filterValues: any, filterType: FilterType) {
    this.store.dispatch(new FilterActions.UpdateFilterStates(filterValues, filterType));
  }

  clearFilters() {
    this.closeTopicsFilter('close');
    this.selectedTopicsValues = [null, null];
    this.isApplyFiltersActive = false;
    this.store.dispatch(new FilterActions.ResetFilterState);
    this.onBuiltInSearch();
  }

  onRemoveFilter(event: any) {
    this.store.dispatch(new FilterActions.RemoveFilter(event))

    this.topicsValues$.pipe(
      take(1)
    ).subscribe(currentTopics => {
      this.selectedTopicsValues = [currentTopics, FilterType.TOPICS];
      this.isApplyFiltersActive = !deepEquals(this.selectedTopicsValues[0], currentTopics);
    });
  }

  onContactSupport() {
    const url = 'https://support.eaglepoint.com/hc/en-us';
    window.open(url, '_blank');
  }

  applyFilters() {
    this.onFilter(...this.selectedTopicsValues);
    this.topicsFilterConfig.isOpen = false;
  }
}
