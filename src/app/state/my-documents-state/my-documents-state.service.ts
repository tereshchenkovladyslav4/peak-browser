import { Injectable } from '@angular/core';
import { FilterBaseService } from '../../services/filter/filter-base.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FilterStateService } from '../filter/filter-state';
import { Observable, tap } from 'rxjs';
import { Document } from '../../resources/models/content';
import { MyDocumentsService } from '../../services/my-documents/my-documents.service';

@Injectable({
  providedIn: 'root',
})
export class MyDocumentsStateService extends FilterBaseService {
  constructor(
    protected override route: ActivatedRoute,
    protected override router: Router,
    protected override location: Location,
    protected override filterState: FilterStateService,
    private myDocumentsService: MyDocumentsService,
  ) {
    super(route, router, location, filterState);
  }

  getMyDocuments(): Observable<Document[]> {
    this.filterState.updateIsLoaded(false);
    return this.myDocumentsService.fetchMyDocuments().pipe(
      tap((results) => this.filterState.updateData(results)),
      tap((results) => this.filterState.updateIsLoaded(true)),
    );
  }
}
