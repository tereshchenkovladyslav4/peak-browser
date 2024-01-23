import { TestBed } from '@angular/core/testing';

import { LearningPathActionsService } from './learning-path-actions.service';

describe('LearningPathActionsService', () => {
  let service: LearningPathActionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LearningPathActionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
