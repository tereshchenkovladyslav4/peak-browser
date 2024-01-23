import { TestBed } from '@angular/core/testing';

import { BookmarksStateService } from './bookmarks-state.service';

describe('BookmarksStateService', () => {
  let service: BookmarksStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookmarksStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
