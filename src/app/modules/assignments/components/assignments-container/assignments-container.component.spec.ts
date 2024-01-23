import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentsContainerComponent } from './assignments-container.component';

describe('AssignmentsContainerComponent', () => {
  let component: AssignmentsContainerComponent;
  let fixture: ComponentFixture<AssignmentsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignmentsContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignmentsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
