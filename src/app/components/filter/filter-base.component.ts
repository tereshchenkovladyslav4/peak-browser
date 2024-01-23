import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {PublisherFilterComponent} from "./publisher-filter/publisher-filter.component";
import {FilterType} from "../../resources/enums/filter-type";
import {debounceTime, Observable, Subscription, take, tap} from "rxjs";
import {filter} from "rxjs/operators";
import {FilterBaseService} from "../../services/filter/filter-base.service";
import {ActiveFiltersComponent} from "./active-filters/active-filters.component";
import {AsyncPipe, NgClass, NgForOf, NgIf, NgSwitch, NgSwitchCase, NgTemplateOutlet} from "@angular/common";
import {ContentTypeFilterComponent} from "./content-type/content-type-filter.component";
import {DifficultyFilterComponent} from "./difficulty-filter/difficulty-filter.component";
import {DurationFilterComponent} from "./duration-filter/duration-filter.component";
import {KeywordsFilterComponent} from "./keywords-filter/keywords-filter.component";
import {TopicsFilterComponent} from "./topics-filter/topics-filter.component";
import {SharedModule} from "../../modules/shared/shared.module";
import {DialogService} from "../../services/dialog/dialog.service";
import {DialogConfig} from "../dialog/dialog-base/dialog-base.component";
import {FlexibleFrictionComponent} from "../dialog/flexible-friction/flexible-friction.component";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {FilterStateService} from "../../state/filter/filter-state";


@Component({
  selector: 'ep-filter-base',
  templateUrl: './filter-base.component.html',
  styleUrls: ['./filter-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    PublisherFilterComponent,
    ActiveFiltersComponent,
    AsyncPipe,
    ContentTypeFilterComponent,
    DifficultyFilterComponent,
    DurationFilterComponent,
    KeywordsFilterComponent,
    NgForOf,
    NgIf,
    NgSwitchCase,
    NgTemplateOutlet,
    TopicsFilterComponent,
    NgClass,
    NgSwitch,
    SharedModule,
    FlexibleFrictionComponent,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class FilterBaseComponent implements OnInit, OnDestroy {
  @Input() isExtendedSearchAllowed: boolean = true;
  @Input() isBuiltInSearchBarVisible: boolean = false;
  @Input() builtInSearchBarTitle?: string;

  filters = [
    {filterType: FilterType.PUBLISHER, title: 'Publisher', data: {}, isExpanded: false},
    {filterType: FilterType.TOPICS, title: 'Topics', data: {}, isExpanded: false},
    {filterType: FilterType.CONTENT_TYPE, title: 'Content Type', data: {}, isExpanded: false},
    {filterType: FilterType.DURATION, title: 'Duration', data: {}, isExpanded: false},
    {filterType: FilterType.DIFFICULTY, title: 'Difficulty', data: {}, isExpanded: false},
    {filterType: FilterType.KEYWORDS, title: 'Keywords', data: {}, isExpanded: false},
  ]
  filterType = FilterType;
  data$: Observable<any>;
  activeFilters$: Observable<any[]>;
  publisherValues$: Observable<any>;
  topicsValues$: Observable<any>;
  contentTypeValues$: Observable<any>;
  durationValues$: Observable<any>;
  difficultyValues$: Observable<any>;
  keywordsValues$: Observable<any>;
  searchValues$: Observable<any>;
  topicsSearchFilterValue$: Observable<string>;
  keywordsSearchFilterValue$: Observable<string>;
  searchForm: FormGroup = new FormGroup({
    filter: new FormControl('', [Validators.required])
  })

  private subscriptions = new Subscription();
  noResults$: Observable<boolean>;

  constructor(protected service: FilterBaseService,
              protected dialog: DialogService,
              protected router: Router,
              protected route: ActivatedRoute,
              protected filterState: FilterStateService
              ) {
  }

  ngOnInit() {
    this.listenToSearchForm();
    this.data$ = this.filterState.selectData();
    this.activeFilters$ = this.filterState.selectActiveFilters();
    this.publisherValues$ = this.filterState.selectFilterPublisher();
    this.topicsValues$ = this.filterState.selectFilterTopics();
    this.contentTypeValues$ = this.filterState.selectFilterContentType();
    this.durationValues$ = this.filterState.selectFilterDuration();
    this.difficultyValues$ = this.filterState.selectFilterDifficulty();
    this.keywordsValues$ = this.filterState.selectFilterKeywords();
    this.searchValues$ = this.filterState.selectFilterSearch();
    this.topicsSearchFilterValue$ = this.filterState.selectSearchFilterTopics();
    this.keywordsSearchFilterValue$ = this.filterState.selectSearchFilterKeywords();
    this.noResults$ = this.service.isNoFilteredDataResults$;
    this.subscriptions.add(
      this.service.reset$.pipe(
        filter((r) => r?.filters)
      ).subscribe(() => this.clearFilters())
    );
    this.searchValues$.pipe(
      take(1)
    ).subscribe(value => {
      this.searchForm.get('filter').setValue(value.filter);
    })
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  clearFilters() {
    this.filters.forEach(f => f.isExpanded = false);
    this.service.removeAllFilters();
    this.clearBuiltInSearch();
  }

  onFilterPanelClick(filter: { isExpanded: boolean }) {
    filter.isExpanded = !filter.isExpanded || false;
  }

  onFilter(filterValues: any, filterType: FilterType) {
    this.service.onFilter(filterValues, filterType);
  }

  onSearch(filterValues: any, filterType: FilterType) {
    this.service.onSearch(filterValues, filterType);
  }

  onRemoveFilter(event: any) {
    this.service.removeFilter(event);
  }

  onExtendedSearch() {
    const dialogConfig: DialogConfig = {
      containerStyles: {
        width: '325px',
        height: 'unset',
      },
      title: 'Start Extended Search?',
      content: 'Do you want to leave this window and access your company\'s designated extended search?',
      buttonType: 'green',
      negativeButton: 'Cancel',
      positiveButton: 'Search'
    };
    const dialogRef = this.dialog.open(FlexibleFrictionComponent, {
      data: {
        config: dialogConfig
      }
    });

    dialogRef.afterClosed().pipe(
      tap((shouldSearch) => {
        if (shouldSearch) {
          window.open('https://www.google.com', "_blank"); // todo update with correct redirect url
        }
      }),
      take(1)
    ).subscribe();
  }

  listenToSearchForm() {
    this.subscriptions.add(
      this.searchForm.valueChanges.pipe(
        // debounceTime(300)
      ).subscribe(() => {
        this.onBuiltInSearch();
      })
    );
  }

  onBuiltInSearch() {
    const {filter} = this.searchForm.getRawValue();
    this.onFilter({name: filter || '', plainDescription: filter || ''}, FilterType.SEARCH);
  }

  clearBuiltInSearch() {
    this.searchForm.reset({filter: null});
  }
}

