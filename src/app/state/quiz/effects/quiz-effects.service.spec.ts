import { TestBed } from '@angular/core/testing';

import { QuizEffectsService } from './quiz-effects.service';

describe('QuizEffectsService', () => {
  let service: QuizEffectsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuizEffectsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
