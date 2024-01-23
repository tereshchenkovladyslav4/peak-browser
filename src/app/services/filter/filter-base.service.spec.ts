import { TestBed } from '@angular/core/testing';

import { FilterBaseService } from './filter-base.service';

describe('FilterBaseService', () => {
  let service: FilterBaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilterBaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
