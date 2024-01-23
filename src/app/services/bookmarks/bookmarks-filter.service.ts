import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterStateService } from 'src/app/state/filter/filter-state';
import { FilterBaseService } from '../filter/filter-base.service';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class BookmarksFilterService extends FilterBaseService {

  constructor(
    protected override route: ActivatedRoute,
    protected override router: Router,
    protected override location: Location,
    protected override filterState: FilterStateService
  ) {
    super(route, router, location, filterState);
  }
}
