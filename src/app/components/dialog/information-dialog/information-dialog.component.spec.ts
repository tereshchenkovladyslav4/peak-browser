import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InformationDialogComponent } from './information-dialog.component';
import { SharedModule } from '../../../modules/shared/shared.module';
import { DialogBaseComponent } from '../dialog-base/dialog-base.component';
import { DialogRef } from '../../../services/dialog/dialog-ref';
import { DIALOG_DATA } from '../../../services/dialog/dialog-tokens';

describe('InformationDialogComponent', () => {
  let dialogRefMock: jest.Mocked<DialogRef>; // Services must be mocked
  let component: InformationDialogComponent;
  let fixture: ComponentFixture<InformationDialogComponent>;

  // Runs before each it block
  beforeEach(async () => {
    // Define mocked service calls
    dialogRefMock = {
      close: jest.fn(),
    } as unknown as jest.Mocked<DialogRef>;

    await TestBed.configureTestingModule({
      declarations: [],
      imports: [InformationDialogComponent, DialogBaseComponent, SharedModule],
      // Provide mock service in place of actual service
      providers: [
        { provide: DialogRef, useValue: dialogRefMock },
        {
          provide: DIALOG_DATA,
          useValue: {
            config: {},
          },
        },
      ],
    }).compileComponents();

    // Initialize component for testing
    fixture = TestBed.createComponent(InformationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Default test
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title and content', () => {
    /* TEST SETUP */
    // Set the input data for the component
    component.data = {
      config: {
        title: 'Test Title',
        content: 'Test Content',
      },
    };

    // Trigger change detection
    fixture.detectChanges();

    // Get the elements containing the title and content
    const titleElement: HTMLElement = fixture.nativeElement.querySelector('.center-header');
    const contentElement: HTMLElement = fixture.nativeElement.querySelector('.content-body');

    /* TEST */
    // Assert that the displayed text matches the input data
    expect(titleElement.textContent).toContain('Test Title');
    expect(contentElement.textContent).toContain('Test Content');
  });

  it('should trigger close method with true on positive button click', () => {
    // Set the input data for the component
    component.data = {
      config: {
        positiveButton: 'Ok',
      },
    };

    // Trigger change detection
    fixture.detectChanges();

    // Get the positive button element and trigger a click event
    const positiveButton: HTMLButtonElement = fixture.nativeElement.querySelector('.action-button:last-child');
    positiveButton.click();

    // Assert that the close method was called with true
    expect(positiveButton.textContent.trim()).toBe('Ok');
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });
});
