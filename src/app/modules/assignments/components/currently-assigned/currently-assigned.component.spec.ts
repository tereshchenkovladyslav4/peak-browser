import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentlyAssignedComponent } from './currently-assigned.component';

describe('CurrentlyAssignedComponent', () => {
  let component: CurrentlyAssignedComponent;
  let fixture: ComponentFixture<CurrentlyAssignedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CurrentlyAssignedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrentlyAssignedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
