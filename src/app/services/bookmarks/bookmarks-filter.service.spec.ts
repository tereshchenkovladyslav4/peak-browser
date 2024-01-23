import { TestBed } from '@angular/core/testing';

import { BookmarksFilterService } from './bookmarks-filter.service';

describe('BookmarksFilterService', () => {
  let service: BookmarksFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookmarksFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
