import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentFooterCommentsComponent } from './content-footer-comments.component';

describe('ContentFooterCommentsComponent', () => {
  let component: ContentFooterCommentsComponent;
  let fixture: ComponentFixture<ContentFooterCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContentFooterCommentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentFooterCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
