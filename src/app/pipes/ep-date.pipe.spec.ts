import { TestBed } from '@angular/core/testing';
import { EpDatePipe } from './ep-date.pipe';

describe('EpDatePipe', () => {
  let pipe: EpDatePipe;

  // Runs before each it block
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EpDatePipe],
    });

    // Initialize pipe for testing
    pipe = TestBed.inject(EpDatePipe);
  });

  // Default test
  it('should create the pipe', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform a Date object to a formatted date string', () => {
    const date = new Date('2023-01-01T12:34:56');
    const formattedDate = pipe.transform(date, 'medium', 'short');

    // Assert that the formattedDate is not null or undefined
    expect(formattedDate).toBeDefined();
    expect(formattedDate).not.toBeNull();

    // You can also assert the specific format if needed
    // Ex: if 'medium' and 'short' are set, you can assert the format contains both date and time
    expect(formattedDate).toContain('Jan 1, 2023');
    expect(formattedDate).toContain('12:34 PM');
  });

  it('should return the original value for invalid dates', () => {
    const invalidValue = 'invalid date';
    const result = pipe.transform(invalidValue, 'medium', 'short');

    // Assert that the result is the same as the original value
    expect(result).toEqual(invalidValue);
  });
});
