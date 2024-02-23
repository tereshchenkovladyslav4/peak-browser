import { Component, OnDestroy, OnInit } from '@angular/core';
import { Assignment } from '../../../../resources/models/assignment';
import { Library } from '../../../../resources/models/library';
import { HomeSection } from '../../../../resources/enums/home-section.enum';
import { APP_ROUTES } from '../../../../resources/constants/app-routes';
import { AssignmentsState } from 'src/app/state/assignments/assignments.state';
import { AssignmentsActions } from 'src/app/state/assignments/assignments.actions';
import { combineLatest, Observable, Subject } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { LibraryState } from '../../../../state/library/library.state';
import { LibraryActions } from '../../../../state/library/library.actions';

@Component({
  selector: 'ep-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  readonly HomeSection = HomeSection;
  readonly APP_ROUTES = APP_ROUTES;
  readonly unsubscribeAll$ = new Subject<void>();
  isLoading = false;
  @Select(AssignmentsState.getStackedActiveAssignments) stackedActiveAssignments$: Observable<Assignment[]>;
  @Select(LibraryState) libraryState$: Observable<LibraryState>;
  assignments: Assignment[];
  libraries: Library[];

  constructor(
    private store: Store,
  ) {}

  ngOnInit() {
    this.isLoading = true;

    //get assignments and libraries from store
    this.store.dispatch([new AssignmentsActions.CurrentAssignmentsFromApi,
      new LibraryActions.CurrentLibrariesFromApi])

    combineLatest([
      this.stackedActiveAssignments$,
      this.libraryState$
    ]).subscribe(([assignments, libraryState]: [Assignment[], LibraryState]) => {
        this.assignments = this.defaultSortAssignments(assignments);
      this.libraries = this.defaultSortLibraries(libraryState.libraries);
      if (libraryState.isLoaded) {
        this.isLoading = false;
      }
      })
  }
  
  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }

  defaultSortAssignments(assignments: Assignment[]){
    return assignments.sort((a, b) => 
      (a.dueDate || 'NA').localeCompare(b.dueDate || 'NA') 
      || (a.learningPath?.name || '').localeCompare(b.learningPath?.name || '')
    )        
  }

  defaultSortLibraries(libraries: Library[]){
    return libraries.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

}
