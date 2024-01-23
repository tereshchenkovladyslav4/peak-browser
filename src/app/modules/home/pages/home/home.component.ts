import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Assignment } from '../../../../resources/models/assignment';
import { Library } from '../../../../resources/models/library';
import { LibrariesService } from '../../../../services/libraries/libraries.service';
import { HomeSection } from '../../../../resources/enums/home-section.enum';
import { APP_ROUTES } from '../../../../resources/constants/app-routes';
import { SessionStorageService } from '../../../../services/storage/services/session-storage.service';
import { TenantService } from '../../../../services/tenant/tenant.service';
import { APIV2AccessKey } from '../../../../services/apiService/classFiles/class.authorization';
import { AssignmentsState } from 'src/app/state/assignments/assignments.state';
import { AssignmentsActions } from 'src/app/state/assignments/assignments.actions';
import { catchError, combineLatest, debounceTime, defaultIfEmpty, forkJoin, map, Observable, of, skip, Subject, take, tap, timeout } from 'rxjs';
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
  @Select(AssignmentsState.getAssignmentsList) assignments$: Observable<Assignment[]>;
  @Select(LibraryState) libraryState$: Observable<LibraryState>;
  assignments: Assignment[];
  libraries: Library[];

  constructor(
    private store: Store,
    private sessionService: SessionStorageService,
    private tenantService: TenantService
  ) {}

  ngOnInit() {
    //If we haven't yet stored tenant details, do it here.
    //This prevents us from calling the api every time we go to the home page
    //*Do note that this is a workaround until the login page code is completed*
    if (!this.sessionService.getItem('tenantDetails')) {
      const tenantInfo: APIV2AccessKey = this.sessionService.getItem('tenantInformation');
      this.tenantService.getTenantDetails(tenantInfo.orgID, tenantInfo.tenantid).subscribe();
    }
    this.isLoading = true;

    //get assignments and libraries from store
    this.store.dispatch([new AssignmentsActions.CurrentAssignmentsFromApi,
      new LibraryActions.CurrentLibrariesFromApi])

    combineLatest([
      this.assignments$,
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
