import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentTypeIconComponent } from './content-type-icon.component';

describe('ContentTypeIconComponent', () => {
  let component: ContentTypeIconComponent;
  let fixture: ComponentFixture<ContentTypeIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContentTypeIconComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentTypeIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
