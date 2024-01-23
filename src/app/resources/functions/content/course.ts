import { AssignmentEnrollmentStatus } from "../../models/assignment";

const assignmentStatusTextMap = {
  [AssignmentEnrollmentStatus.Not_Started]: 'learning-path-view.start',
  [AssignmentEnrollmentStatus.In_Progress]: 'common.resume',
  [AssignmentEnrollmentStatus.Completed]: 'learning-path-view.re-enroll',
  [AssignmentEnrollmentStatus.Dropped]: 'learning-path-view.re-enroll',
}

export function getCourseAssignmentStatusText(status: AssignmentEnrollmentStatus): string {
  const translationTextKey = assignmentStatusTextMap[status];
  return !!translationTextKey ? translationTextKey : 'learning-path-view.enroll';
}