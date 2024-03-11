import { TestBed } from '@angular/core/testing';

import { MyDocumentsStateService } from './my-documents-state.service';

describe('MyDocumentsStateService', () => {
  let service: MyDocumentsStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyDocumentsStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
