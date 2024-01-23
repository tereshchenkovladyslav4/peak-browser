import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { ChangeDueDateComponent } from './change-due-date.component';
import { SharedModule } from '../../../shared/shared.module';
import { DialogRef } from '../../../../services/dialog/dialog-ref';
import { DIALOG_DATA } from '../../../../services/dialog/dialog-tokens';
import { TranslationService } from '../../../../services/translation.service';
import { Store } from '@ngxs/store';
import { AssignmentsActions } from '../../../../state/assignments/assignments.actions';
import { of } from 'rxjs';

describe('ChangeDueDateComponent', () => {
  let dialogRefMock: jest.Mocked<DialogRef>; // Services must be mocked
  let component: ChangeDueDateComponent;
  let fixture: ComponentFixture<ChangeDueDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [],
      imports: [FormsModule, SharedModule, CalendarModule],
      providers: [
        TranslationService,
        Store,
        {
          provide: DialogRef,
          useValue: dialogRefMock,
        },
        {
          provide: DIALOG_DATA,
          useValue: { config: {}, assignment: {} },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeDueDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize subtitle and dueDate on ngOnInit', () => {
    // Mock data for assignment
    const assignment = {
      learningPath: {
        name: 'Learning Path Name',
      },
      dueDate: '2024-01-30T12:00:00', // Assuming a specific due date for testing
      assignors: [],
      enrollmentId: '123',
    };

    // Provide the mock data to the component
    component.data = { assignment };

    // Trigger ngOnInit
    component.ngOnInit();

    // Assertion
    expect(component.subtitle).toContain('Learning Path Name');
    expect(component.dueDate).toEqual(new Date(assignment.dueDate));
  });

  it('should dispatch EditAssignment action on save', () => {
    // Mock data for assignment
    const assignment = {
      learningPath: {
        name: 'Learning Path Name',
      },
      dueDate: '2024-01-30T12:00:00', // Assuming a specific due date for testing
      assignors: [],
      enrollmentId: '123',
    };

    // Provide the mock data to the component
    component.data = { assignment };

    // Spy on the store.dispatch method
    const dispatchSpy = spyOn(TestBed.inject(Store), 'dispatch').and.returnValue(of({}));

    // Trigger ngOnInit
    component.ngOnInit();

    // Trigger save method
    component.save();

    // Assertion
    expect(dispatchSpy).toHaveBeenCalledWith(
      new AssignmentsActions.EditAssignment('123', [], new Date(assignment.dueDate)),
    );
  });
});
