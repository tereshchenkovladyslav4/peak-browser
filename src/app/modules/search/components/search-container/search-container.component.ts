import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {SearchService} from "../../../../services/search/search.service";
import {Subject, Subscription, switchMap} from "rxjs";
import {tap} from "rxjs/operators";
import {FilterStateService} from "../../../../state/filter/filter-state";


@Component({
  selector: 'ep-search-container',
  templateUrl: './search-container.component.html',
  styleUrls: ['./search-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchContainerComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  searchTerms: string;

  constructor(private route: ActivatedRoute,
              private searchService: SearchService,
              private filterState: FilterStateService) {
  }

  ngOnInit(): void {
    this.subscription.add(
      this.route.queryParams.pipe(
        tap(() => this.searchService.reset$.next({filters: true})),
        switchMap(queryParams=> {
          this.searchTerms = queryParams['searchTerms'];
          return this.searchService.fetchSearchResults(this.searchTerms);
        }),
        ).subscribe(() => {
          this.searchService.applyFiltersFromUrlQueryParam();
      })
    );
  }

  ngOnDestroy(): void {
    this.filterState.resetState();
    this.subscription.unsubscribe();
  }

  onScroll(event) {
    // if we scroll within 1% of the bottom of the scroll bar, load more search results
    if (event.target.clientHeight + Math.round(event.target.scrollTop) >= (event.target.scrollHeight * 0.99)) {
      this.searchService.searchResultsScroll();
    }
  }
}
