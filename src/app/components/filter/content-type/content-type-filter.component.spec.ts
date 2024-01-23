import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentTypeFilterComponent } from './content-type-filter.component';

describe('ContentTypeFilterComponent', () => {
  let component: ContentTypeFilterComponent;
  let fixture: ComponentFixture<ContentTypeFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContentTypeFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentTypeFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
