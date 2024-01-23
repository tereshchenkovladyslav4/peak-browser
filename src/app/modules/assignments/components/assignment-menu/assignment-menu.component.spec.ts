import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentMenuComponent } from './assignment-menu.component';

describe('AssignmentMenuComponent', () => {
  let component: AssignmentMenuComponent;
  let fixture: ComponentFixture<AssignmentMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignmentMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignmentMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
