import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterableBaseComponent } from './filterable-base.component';

describe('FilterableBaseComponent', () => {
  let component: FilterableBaseComponent;
  let fixture: ComponentFixture<FilterableBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterableBaseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterableBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
