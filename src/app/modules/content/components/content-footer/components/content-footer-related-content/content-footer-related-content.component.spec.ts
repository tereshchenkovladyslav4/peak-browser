import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentFooterRelatedContentComponent } from './content-footer-related-content.component';

describe('ContentFooterRelatedContentComponent', () => {
  let component: ContentFooterRelatedContentComponent;
  let fixture: ComponentFixture<ContentFooterRelatedContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContentFooterRelatedContentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentFooterRelatedContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
