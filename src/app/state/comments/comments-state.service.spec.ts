import { TestBed } from '@angular/core/testing';

import { CommentsStateService } from './comments-state.service';

describe('CommentsStateService', () => {
  let service: CommentsStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommentsStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
