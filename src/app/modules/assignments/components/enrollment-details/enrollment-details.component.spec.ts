import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnrollmentDetailsComponent } from './enrollment-details.component';
import { DialogRef } from '../../../../services/dialog/dialog-ref';
import { DIALOG_DATA } from '../../../../services/dialog/dialog-tokens';
import { TranslationService } from '../../../../services/translation.service';
import { EnrollmentService } from '../../../../services/enrollment.service';
import { ContentService } from '../../../../services/content.service';
import { DownloadService } from '../../../../services/download/download.service';
import { Observable, of } from 'rxjs';
import { Certificate, CertificateUnavailableReason } from '../../../../resources/models/certificate';
import { ContentType, Course } from '../../../../resources/models/content';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { AssignmentEnrollmentStatus } from '../../../../resources/models/assignment';
import { QuizSession } from '../../../../resources/models/content/quiz';
import { DropdownMenuService } from '../../../../services/dropdown-menu.service';

describe('EnrollmentDetailsComponent', () => {
  let component: EnrollmentDetailsComponent;
  let fixture: ComponentFixture<EnrollmentDetailsComponent>;
  let dialogRefMock: jest.Mocked<DialogRef>;
  let enrollmentServiceMock: jest.Mocked<EnrollmentService>;
  let contentServiceMock: jest.Mocked<ContentService>;
  let downloadServiceMock: jest.Mocked<DownloadService>;
  let translationServiceMock: jest.Mocked<TranslationService>;
  let dropdownMenuServiceMock: jest.Mocked<DropdownMenuService>;

  beforeEach(async () => {
    dialogRefMock = {
      close: jest.fn(),
    } as unknown as jest.Mocked<DialogRef>;

    enrollmentServiceMock = {
      getCertificate: jest.fn().mockReturnValue(of({})),
      getQuizSessions: jest.fn().mockReturnValue(of({})),
      getCourseViewDuration: jest.fn().mockReturnValue(of({})),
    } as unknown as jest.Mocked<EnrollmentService>;

    contentServiceMock = {
      getContentDetails: jest.fn().mockReturnValue(of({})),
    } as unknown as jest.Mocked<ContentService>;

    downloadServiceMock = {
      download: jest.fn().mockReturnValue(of({})),
    } as unknown as jest.Mocked<DownloadService>;

    translationServiceMock = {
      getTranslationFileData: jest.fn().mockImplementation((key: string) => {
        return key;
      }),
    } as unknown as jest.Mocked<TranslationService>;

    dropdownMenuServiceMock = {
      addReviewQuizResults: jest.fn().mockReturnValue(dropdownMenuServiceMock),
      getItems: jest.fn(),
    } as unknown as jest.Mocked<DropdownMenuService>;

    await TestBed.configureTestingModule({
      declarations: [],
      imports: [CommonModule, SharedModule],
      providers: [
        {
          provide: DialogRef,
          useValue: dialogRefMock,
        },
        {
          provide: DIALOG_DATA,
          useValue: { config: {}, assignmentHistory: {}, enrollId: '', courseId: '' },
        },
        { provide: EnrollmentService, useValue: enrollmentServiceMock },
        { provide: ContentService, useValue: contentServiceMock },
        { provide: DownloadService, useValue: downloadServiceMock },
        { provide: TranslationService, useValue: translationServiceMock },
        { provide: DropdownMenuService, useValue: dropdownMenuServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EnrollmentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch certificate and quizzes on initialization', () => {
    const certificateData = new Certificate();
    const quizData = new Course();
    enrollmentServiceMock.getCertificate.mockReturnValue(of(certificateData));
    contentServiceMock.getContentDetails.mockReturnValue(of(quizData));

    component.ngOnInit();

    expect(enrollmentServiceMock.getCertificate).toHaveBeenCalled();
    expect(contentServiceMock.getContentDetails).toHaveBeenCalled();
    expect(component.certificate).toEqual(certificateData);
    expect(component.quizzes).toEqual([]);
  });

  it('should call download service on downloadCertificate method', () => {
    const certificateUrl = 'mock_certificate_url';
    const certificateData = new Certificate();
    certificateData.docUrl = certificateUrl;
    certificateData.useAsDefault = true;
    enrollmentServiceMock.getCertificate.mockReturnValue(of(certificateData));

    component.ngOnInit();
    fixture.detectChanges();

    const downloadButton = fixture.nativeElement.querySelector('[data-testid="download-button"]');
    downloadButton.click();

    expect(downloadServiceMock.download).toHaveBeenCalledWith(certificateUrl);
  });

  it('should display "assignments.certificates-available"', () => {
    const certificateUrl = 'mock_certificate_url';
    const certificateData = new Certificate();
    certificateData.docUrl = certificateUrl;
    certificateData.useAsDefault = true;
    enrollmentServiceMock.getCertificate.mockReturnValue(of(certificateData));

    component.ngOnInit();
    fixture.detectChanges();

    const certificateStatusElement = fixture.nativeElement.querySelector('[data-testid="certificate-status"]');
    const certificateStatusText = certificateStatusElement.textContent.trim();
    const downloadButton = fixture.nativeElement.querySelector('[data-testid="download-button"]');

    expect(certificateStatusText).toBe('assignments.certificate-status: assignments.certificates-available');
    expect(downloadButton.disabled).toBe(false);
  });

  it('should display "assignments.assignments.certificates-not-available-dropped"', () => {
    const certificateUrl = 'mock_certificate_url';
    const certificateData = new Certificate();
    certificateData.docUrl = certificateUrl;
    certificateData.useAsDefault = false;
    certificateData.reasonUnavailable = CertificateUnavailableReason.NOT_COMPLETE;
    enrollmentServiceMock.getCertificate.mockReturnValue(of(certificateData));

    component.data.assignmentHistory.status = AssignmentEnrollmentStatus.Dropped;

    component.ngOnInit();
    fixture.detectChanges();

    const certificateStatusElement = fixture.nativeElement.querySelector('[data-testid="certificate-status"]');
    const certificateStatusText = certificateStatusElement.textContent.trim();
    const downloadButton = fixture.nativeElement.querySelector('[data-testid="download-button"]');

    expect(certificateStatusText).toBe(
      'assignments.certificate-status: assignments.certificates-not-available-dropped',
    );
    expect(downloadButton.disabled).toBe(true);
  });

  it('should display "assignments.certificates-not-available-skipped"', () => {
    const certificateUrl = 'mock_certificate_url';
    const certificateData = new Certificate();
    certificateData.docUrl = certificateUrl;
    certificateData.useAsDefault = false;
    certificateData.reasonUnavailable = CertificateUnavailableReason.NOT_COMPLETE;
    enrollmentServiceMock.getCertificate.mockReturnValue(of(certificateData));

    component.ngOnInit();
    fixture.detectChanges();

    const certificateStatusElement = fixture.nativeElement.querySelector('[data-testid="certificate-status"]');
    const certificateStatusText = certificateStatusElement.textContent.trim();
    const downloadButton = fixture.nativeElement.querySelector('[data-testid="download-button"]');

    expect(certificateStatusText).toBe(
      'assignments.certificate-status: assignments.certificates-not-available-skipped',
    );
    expect(downloadButton.disabled).toBe(true);
  });

  it('should display "assignments.certificates-not-available-failed-quiz"', () => {
    const certificateUrl = 'mock_certificate_url';
    const certificateData = new Certificate();
    certificateData.docUrl = certificateUrl;
    certificateData.useAsDefault = false;
    certificateData.reasonUnavailable = CertificateUnavailableReason.FAILED_QUIZ;
    enrollmentServiceMock.getCertificate.mockReturnValue(of(certificateData));

    component.ngOnInit();
    fixture.detectChanges();

    const certificateStatusElement = fixture.nativeElement.querySelector('[data-testid="certificate-status"]');
    const certificateStatusText = certificateStatusElement.textContent.trim();
    const downloadButton = fixture.nativeElement.querySelector('[data-testid="download-button"]');

    expect(certificateStatusText).toBe(
      'assignments.certificate-status: assignments.certificates-not-available-failed-quiz',
    );
    expect(downloadButton.disabled).toBe(true);
  });

  it('should fetch quizzes on component initialization', () => {
    const courseDetails = new Course();
    courseDetails.content = [
      {
        id: '1',
        type: ContentType.Quiz,
        documentType: null,
        name: 'Quiz 1',
        plainDescription: '',
        created: null,
        imageUrl: '',
        duration: null,
        learningTags: [],
        sequence: null,
      },
      {
        id: '2',
        type: ContentType.Quiz,
        documentType: null,
        name: 'Quiz 2',
        plainDescription: '',
        created: null,
        imageUrl: '',
        duration: null,
        learningTags: [],
        sequence: null,
      },
      {
        id: '3',
        type: ContentType.Video,
        documentType: null,
        name: 'Not quiz',
        plainDescription: '',
        created: null,
        imageUrl: '',
        duration: null,
        learningTags: [],
        sequence: null,
      },
    ];

    const quizSessions = {
      '1': [new QuizSession()],
      '2': [new QuizSession()],
    };

    contentServiceMock.getContentDetails.mockReturnValue(of(courseDetails));
    enrollmentServiceMock.getQuizSessions.mockImplementation((_enrollId: string, quizId: string) => {
      return of(quizSessions[quizId]);
    });

    component.ngOnInit();
    fixture.detectChanges();

    const tableElement = fixture.nativeElement.querySelector('.quiz-table');
    expect(tableElement).toBeTruthy();

    const rows = tableElement.querySelectorAll('tr');
    expect(rows.length).toBe(3); // Expecting header row and two data rows

    // Checking each row for correct name
    const firstRowName = rows[1].querySelector('td').textContent.trim();
    expect(firstRowName).toBe('Quiz 1');

    const secondRowName = rows[2].querySelector('td').textContent.trim();
    expect(secondRowName).toBe('Quiz 2');
  });

  it('should handle error when fetching certificate', () => {
    contentServiceMock.getContentDetails.mockReturnValue(
      new Observable((observer) => {
        observer.error(new Error('Error message'));
      }),
    );

    component.ngOnInit();
    fixture.detectChanges();
  });
});
