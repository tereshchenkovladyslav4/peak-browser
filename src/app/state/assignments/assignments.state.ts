import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Assignment, AssignmentEnrollmentStatus } from 'src/app/resources/models/assignment';
import { AssignmentsActions } from './assignments.actions';
import { AssignmentsService } from 'src/app/services/assignments/assignments.service';
import { Injectable } from '@angular/core';
import { HISTORICAL_STATUSES } from 'src/app/resources/models/assignment';

export interface AssignmentStateModel {
  assignments: Assignment[];
  isAssignmentsLoading: boolean;
}

const DEFAULT_STATE: AssignmentStateModel = {
  assignments: [],
  isAssignmentsLoading: true,
};

// All Assignments
@State<AssignmentStateModel>({
  name: 'CurrentAssignments',
  defaults: DEFAULT_STATE,
})
@Injectable()
export class AssignmentsState {
  
  constructor(private assignmentsService: AssignmentsService) {}

  // -- ACTIONS --  //
  @Action(AssignmentsActions.EditAssignment)
  editAssignments(
    assignmentsState: StateContext<AssignmentStateModel>,
    action: AssignmentsActions.EditAssignment
  ) {
    this.assignmentsService.updateAssignment(action.enrollmentId, action.assignors, action.dueDate).subscribe(() => {
      const state = assignmentsState.getState();
      const newAssignments = state.assignments?.map((assignment) => {
        if (assignment.enrollmentId === action.enrollmentId) {
          assignment.dueDate = action.dueDate?.toISOString() || '';
        }
        return assignment;
      });
      assignmentsState.patchState({assignments: newAssignments});
    })
  }

  @Action(AssignmentsActions.RemoveAssignment)
  removeAssignments(
    assignmentsState: StateContext<AssignmentStateModel>,
    action: AssignmentsActions.RemoveAssignment
  ) {
    this.assignmentsService.removeAssignments(action.enrollmentIds).subscribe( () => {
      const state = assignmentsState.getState();
      const newAssignments = state.assignments?.filter(function (el) {
        return action.enrollmentIds.indexOf(el.enrollmentId) < 0; 
      });
      assignmentsState.patchState({assignments: newAssignments});
    })
  }

  @Action(AssignmentsActions.CompleteAssignment)
  completeAssignments(
    assignmentsState: StateContext<AssignmentStateModel>,
    action: AssignmentsActions.CompleteAssignment
  ) {
    this.assignmentsService.markAssignmentAsCompleted(action.enrollmentId).subscribe(() => {
      const state = assignmentsState.getState();
      const newAssignments = state.assignments?.filter(function (el) {
        return el.enrollmentId !== action.enrollmentId; 
      });
      assignmentsState.patchState({assignments: newAssignments});
    })
  }

  @Action(AssignmentsActions.CurrentAssignmentsFromApi)
  setCurrentAssignments(assignmentsState: StateContext<AssignmentStateModel>) {
    assignmentsState.patchState({isAssignmentsLoading: true})
    return this.assignmentsService
      .fetchCurrentAssignments().subscribe(assignments => {
        assignmentsState.patchState({assignments, isAssignmentsLoading: false})
      })
  }

  // -- SELECTORS --  //

  @Selector()
  static getIsAssignmentsLoading(state: AssignmentStateModel) {
    return state.isAssignmentsLoading;
  }

  /**
   * Get a single assignment out of the list of assignments
   * @param state AssignmentStateModel
   * @param id assignment enrollment id
   */
  @Selector()
  static getAssignment(state: AssignmentStateModel, id: string) {
    return state.assignments?.find( assignment => assignment.enrollmentId === id);
  }

  /**
   * Get a list of all assignments where Learning Paths are stacked based on their first incomplete course.
   * Additional fields are mapped to this object to provide context around the Learning Path stacking
   * @param state AssignmentStateModel
   */
  @Selector()
  static getStackedActiveAssignments(state: AssignmentStateModel) {
    return this.mapStackedAssignments(state.assignments);
  }

  /**
   * Get a list of all active assignments
   * @param state AssignmentStateModel
   */
  @Selector()
  static getActiveAssignments(state: AssignmentStateModel) {
    return state.assignments?.filter(a => !HISTORICAL_STATUSES.includes(
      a.status as unknown as AssignmentEnrollmentStatus,
    ));
  }

 
  // -- FUNCTIONS -- //
  /**
   * Map assignments to an array of stacked assignments. Stacked assignments provide special behavior for Learning Paths as the main 
   * assignment object is the first incompleted course and holds additional properties related to stacking
   * @param unmappedAssignments assignments from state
   * @returns array of stacked assignments
   */
  private static mapStackedAssignments(unmappedAssignments: Assignment[]) {
    // Ugly refactoring to no longer user observable. Needs cleaned up.
    unmappedAssignments = unmappedAssignments.filter( assignment => assignment.learningPath?.courses?.length) // has LP with courses
    unmappedAssignments = unmappedAssignments.filter( assignment => !assignment.completedDate && !assignment.droppedDate) // isn't complete
    unmappedAssignments = unmappedAssignments.map( assignment => ({
      ...assignment,
      hasMultiple:
      unmappedAssignments.filter( innerAssignment => innerAssignment.learningPath.id === assignment.learningPath.id)
          ?.length > 1,
      siblings: unmappedAssignments.filter( innerAssignment => innerAssignment.learningPath.id === assignment.learningPath.id)
    })) // add hasMultiple property
    const mappedAssignments = unmappedAssignments.filter( assignment => !assignment.hasMultiple || this.getFirstIncompleteCourseFromLp(assignment, unmappedAssignments))
    return mappedAssignments;
  }

  private static getFirstIncompleteCourseFromLp(assignment: Assignment, assignments: Assignment[] ) {
    // these innerAssignments are not completed yet based on prev filter
    const allCourseIds = assignments.map( innerAssignment => innerAssignment.course.id);

    return (
      assignment.learningPath?.courses?.filter( course => allCourseIds.includes(course.id))?.[0]?.id ===
      assignment.course.id
    ); // first in LP courses list not yet complete, one per LP
  }
}
