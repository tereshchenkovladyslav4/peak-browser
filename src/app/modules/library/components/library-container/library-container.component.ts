import {Component, OnDestroy, OnInit} from '@angular/core';
import {LibraryFiltersComponent} from "../library-filters/library-filters.component";
import {LibraryContentsComponent} from "../library-contents/library-contents.component";
import {filter, map, tap} from "rxjs/operators";
import {ActivatedRoute, Params} from "@angular/router";
import {mergeMap, Observable, Subscription, take} from "rxjs";
import {Library} from "../../../../resources/models/library";
import {LibraryContentService} from "../../../../services/library-content/library-content.service";
import {LibraryService} from "../../../../services/library/library.service";
import {AsyncPipe, NgIf, NgStyle} from "@angular/common";
import {WithIsLoaded} from "../../../../resources/mixins/is-loaded.mixin";
import {SpinnerComponent} from "../../../../components/spinner/spinner.component";
import {LibraryStateService} from "../../../../state/library/library-state.service";
import {LoadingComponent} from "../../../../components/loading/loading.component";
import {FilterStateService} from "../../../../state/filter/filter-state";
import {DropdownMenuComponent} from "../../../../components/dropdown-menu/dropdown-menu.component";

@Component({
  selector: 'ep-library-container',
  templateUrl: './library-container.component.html',
  styleUrls: ['./library-container.component.scss'],
  standalone: true,
  imports: [
    LibraryFiltersComponent,
    LibraryContentsComponent,
    AsyncPipe,
    NgIf,
    SpinnerComponent,
    LoadingComponent,
    DropdownMenuComponent,
    NgStyle
  ]
})
export class LibraryContainerComponent extends WithIsLoaded() implements OnInit, OnDestroy {

  id$: Observable<string>;
  library$: Observable<Library>;
  subscription: Subscription = new Subscription();


  constructor(private route: ActivatedRoute,
              private libraryService: LibraryService,
              private libraryContentService: LibraryContentService,
              private libraryState: LibraryStateService,
              private filterState: FilterStateService,
  ) {
    super();
  }

  ngOnInit() {
    this.setIsLoaded(this.libraryContentService);
    this.setId();
    this.setLibrary();
    this.initLibrary();
    this.initLibraryContents();
    this.listenForSearchTerms();
  }

  ngOnDestroy() {
    this.filterState.resetState();
    this.subscription.unsubscribe();
  }

  private setId() {
    this.id$ = this.route.paramMap.pipe(
      map((params: Params) => {
        return params['get']('id')
      }),
      filter(id => !!id)
    );
  }

  private setLibrary() {
    this.library$ = this.id$.pipe(mergeMap(id => this.libraryState.selectLibrary(id)));
  }

  private initLibrary() {
    this.id$.pipe(
      mergeMap((id) => {
        return this.libraryService.fetchLibrary(id)
      }),
      take(1)
    ).subscribe(() => {
    });
  }

  private initLibraryContents() {
    this.id$.pipe(
      mergeMap((id) => {
        return this.libraryContentService.fetchLibraryContents(id)
      }),
      take(1)
    ).subscribe(() => {
    });
  }

  private listenForSearchTerms() {
    this.subscription.add(
      this.route.queryParams.pipe(
        tap(() => this.libraryContentService.reset$.next({filters: true})),
      ).subscribe(() => {
        this.libraryContentService.applyFiltersFromUrlQueryParam();
      }));
  }
}
