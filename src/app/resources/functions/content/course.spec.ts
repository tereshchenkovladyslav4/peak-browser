import { getCourseAssignmentStatusText } from './course'; // Replace 'yourFile' with the actual file path
import { AssignmentEnrollmentStatus } from '../../models/assignment';

describe('getCourseAssignmentStatusText function', () => {
  test('returns correct text for Not Started status', () => {
    const result = getCourseAssignmentStatusText(AssignmentEnrollmentStatus.Not_Started);
    expect(result).toBe('learning-path-view.start');
  });

  test('returns correct text for In Progress status', () => {
    const result = getCourseAssignmentStatusText(AssignmentEnrollmentStatus.In_Progress);
    expect(result).toBe('common.resume');
  });

  test('returns correct text for Completed status', () => {
    const result = getCourseAssignmentStatusText(AssignmentEnrollmentStatus.Completed);
    expect(result).toBe('learning-path-view.re-enroll');
  });

  test('returns correct text for Dropped status', () => {
    const result = getCourseAssignmentStatusText(AssignmentEnrollmentStatus.Dropped);
    expect(result).toBe('learning-path-view.re-enroll');
  });

  test('returns default text for unknown status', () => {
    const result = getCourseAssignmentStatusText(1001 as AssignmentEnrollmentStatus);
    expect(result).toBe('learning-path-view.enroll');
  });
});
