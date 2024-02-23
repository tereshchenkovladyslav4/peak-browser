import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {SearchResult} from 'src/app/resources/models/search-result';
import {SearchService} from 'src/app/services/search/search.service';
import {BehaviorSubject, Observable, Subscription, tap} from "rxjs";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {NAVIGATION_ROUTES} from "../../../../resources/constants/app-routes";
import {Router} from "@angular/router";
import {filter} from "rxjs/operators";
import {FilterStateService} from "../../../../state/filter/filter-state";
import { Store } from '@ngxs/store';
import { AssignmentsActions } from '../../../../state/assignments/assignments.actions';

@Component({
  selector: 'ep-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  @Input() searchTerms: string;

  totalSearchResultsShowing = 0;
  searchResultsPageIndex = 0;
  searchResultsPageSize = 5;

  dropdownTop: number;
  dropdownLeft: number;
  searchResults$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  searchResults: SearchResult[] = [];
  subscription: Subscription = new Subscription();
  searchResultTrackBy = (index, searchResult) => searchResult.contentId;
  isNoDataResults$: Observable<boolean>;
  isNoFilteredDataResults$: Observable<boolean>;
  isLoaded$: Observable<boolean>;
  form: FormGroup = this.fb.group({
    search: new FormControl('', [Validators.required])
  });

  constructor(private searchService: SearchService,
              private router: Router,
              private fb: FormBuilder,
              private filterState: FilterStateService, private store: Store) {
  }

  ngOnInit() {
    this.store.dispatch(new AssignmentsActions.CurrentAssignmentsFromApi());
    this.isLoaded$ = this.searchService.isLoaded$;
    this.isNoFilteredDataResults$ = this.filterState.selectIsNoFilteredDataResults();
    this.isNoDataResults$ = this.filterState.selectIsNoDataResults();

    this.subscription.add(
      this.filterState.selectFilteredData().pipe(
        tap(searchResults => this.searchResults = searchResults)
      ).subscribe(() => {
        this.searchResultsPageIndex = 0;
        this.searchResults$.next(this.getPagedSearchResults())
      }));

    this.subscription.add(
      this.searchService.searchResultScroll$.subscribe(() => {
        if (this.totalSearchResultsShowing < this.searchResults?.length) {
          this.searchResults$.next(this.getPagedSearchResults());
        }
      }));

    this.subscription.add(
      this.searchService.reset$.pipe(
        filter((reset) => !!reset.appBarSearch),
      ).subscribe(() => this.clearSearch())
    );

    this.subscription.add(
      this.isLoaded$.pipe(
        filter((isLoaded) => !!isLoaded),
      ).subscribe(() => this.clearSearch())
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getPagedSearchResults(): SearchResult[] {
    const totalResults = (this.searchResultsPageIndex + 1) * this.searchResultsPageSize;
    const results = this.searchResults.slice(0, totalResults);
    if (this.searchResults?.length > totalResults) {
      this.searchResultsPageIndex++;
    }
    ;
    this.totalSearchResultsShowing = results?.length;
    return results;
  }

  onResetClick() {
    this.searchService.reset$.next({filters: true});
  }

  onSearch() {
    const search = this.form.getRawValue().search;
    this.router.navigate([NAVIGATION_ROUTES.search], {
      onSameUrlNavigation: 'reload',
      queryParams: {searchTerms: search}
    });
  }

  clearSearch() {
    this.form.reset({search: null});
  }
}
