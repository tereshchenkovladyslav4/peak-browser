import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentStatusComponent } from './assignment-status.component';
import { TranslationService } from '../../../../services/translation.service';
import { Assignment } from '../../../../resources/models/assignment';

describe('AssignmentStatusComponent', () => {
  let component: AssignmentStatusComponent;
  let fixture: ComponentFixture<AssignmentStatusComponent>;
  let translationServiceMock: jest.Mocked<TranslationService>;

  beforeEach(async () => {
    translationServiceMock = {
      getTranslationFileData: jest.fn().mockImplementation((key: string) => {
        return key;
      }),
    } as unknown as jest.Mocked<TranslationService>;

    await TestBed.configureTestingModule({
      declarations: [],
      providers: [{ provide: TranslationService, useValue: translationServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignmentStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct progress label when assignment has progress', () => {
    const assignment: Assignment = { progress: 50 } as Assignment;
    component.assignment = assignment;
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.assignment-progress-pill-label').textContent).toContain(
      '50assignments.percent-course-completed',
    );
  });

  it('should display correct label when assignment has no progress', () => {
    const assignment: Assignment = { progress: null } as Assignment;
    component.assignment = assignment;
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.assignment-progress-pill-label').textContent).toContain('assignments.not-started');
  });

  it('should display status image when assignment has progress', () => {
    const assignment: Assignment = { progress: 50 } as Assignment;
    component.assignment = assignment;
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.status-icon')).toBeTruthy();
  });

  it('should not display status image when assignment has no progress', () => {
    const assignment: Assignment = { progress: null } as Assignment;
    component.assignment = assignment;
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.status-icon')).toBeFalsy();
  });
});
