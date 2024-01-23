import { TestBed } from '@angular/core/testing';

import { LearningPathEffectsService } from './learning-path-effects.service';

describe('LearningPathEffectsService', () => {
  let service: LearningPathEffectsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LearningPathEffectsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
