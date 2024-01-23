import { TestBed } from '@angular/core/testing';

import { LibraryContentService } from './library-content.service';

describe('LibraryContentService', () => {
  let service: LibraryContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LibraryContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
