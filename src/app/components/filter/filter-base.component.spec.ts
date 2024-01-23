import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterBaseComponent } from './filter-base.component';

describe('FilterComponent', () => {
  let component: FilterBaseComponent;
  let fixture: ComponentFixture<FilterBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterBaseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
