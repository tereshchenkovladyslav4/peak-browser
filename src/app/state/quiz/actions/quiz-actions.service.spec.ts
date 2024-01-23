import { TestBed } from '@angular/core/testing';

import { QuizActionsService } from './quiz-actions.service';

describe('QuizActionsService', () => {
  let service: QuizActionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuizActionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
