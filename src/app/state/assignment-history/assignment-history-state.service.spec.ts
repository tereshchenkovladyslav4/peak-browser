import { TestBed } from '@angular/core/testing';

import { AssignmentHistoryStateService } from './assignment-history-state.service';

describe('AssignmentHistoryStateService', () => {
  let service: AssignmentHistoryStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssignmentHistoryStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
