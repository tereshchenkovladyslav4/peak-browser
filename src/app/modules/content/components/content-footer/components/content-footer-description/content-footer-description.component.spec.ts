import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentFooterDescriptionComponent } from './content-footer-description.component';

describe('ContentFooterDescriptionComponent', () => {
  let component: ContentFooterDescriptionComponent;
  let fixture: ComponentFixture<ContentFooterDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContentFooterDescriptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentFooterDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
