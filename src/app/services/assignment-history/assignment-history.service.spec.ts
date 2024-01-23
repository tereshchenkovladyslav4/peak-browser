import { TestBed } from '@angular/core/testing';

import { AssignmentHistoryService } from './assignment-history.service';

describe('AssignmentHistoryService', () => {
  let service: AssignmentHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssignmentHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
