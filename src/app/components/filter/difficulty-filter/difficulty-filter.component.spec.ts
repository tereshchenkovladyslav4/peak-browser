import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DifficultyFilterComponent } from './difficulty-filter.component';

describe('DifficultyFilterComponent', () => {
  let component: DifficultyFilterComponent;
  let fixture: ComponentFixture<DifficultyFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DifficultyFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DifficultyFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
