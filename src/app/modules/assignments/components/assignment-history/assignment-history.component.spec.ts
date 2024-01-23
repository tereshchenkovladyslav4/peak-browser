import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentHistoryComponent } from './assignment-history.component';

describe('AssignmentHistoryComponent', () => {
  let component: AssignmentHistoryComponent;
  let fixture: ComponentFixture<AssignmentHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignmentHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignmentHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
