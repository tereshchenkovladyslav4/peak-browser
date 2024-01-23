import { TestBed } from '@angular/core/testing';

import { TemplateModalService } from './template-modal.service';

describe('TemplateModalService', () => {
  let service: TemplateModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TemplateModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
