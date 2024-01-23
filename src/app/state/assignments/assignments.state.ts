import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Assignment } from 'src/app/resources/models/assignment';
import { AssignmentsActions } from './assignments.actions';
import { AssignmentsService } from 'src/app/services/assignments/assignments.service';
import { Injectable } from '@angular/core';


// All Assignments
@State<Assignment[]>({
  name: 'CurrentAssignments',
  defaults: [],
})
@Injectable()
export class AssignmentsState {
  
  constructor(private assignmentsService: AssignmentsService) {}

  // -- ACTIONS --  //
  @Action(AssignmentsActions.EditAssignment)
  editAssignments(
    assignmentsState: StateContext<Assignment[]>,
    action: AssignmentsActions.EditAssignment
  ) {
    this.assignmentsService.updateAssignment(action.enrollmentId, action.assignors, action.dueDate).subscribe(() => {
      const state = assignmentsState.getState();
      const newState = state.map((assignment) => {
        if (assignment.enrollmentId === action.enrollmentId) {
          assignment.dueDate = action.dueDate?.toISOString() || '';
        }
        return assignment;
      });
      assignmentsState.setState(newState);
    })
  }

  @Action(AssignmentsActions.RemoveAssignment)
  removeAssignments(
    assignmentsState: StateContext<Assignment[]>,
    action: AssignmentsActions.RemoveAssignment
  ) {
    this.assignmentsService.removeAssignments(action.enrollmentIds).subscribe( () => {
      const state = assignmentsState.getState();
      const newState = state.filter(function (el) {
        return action.enrollmentIds.indexOf(el.enrollmentId) < 0; 
      });
      assignmentsState.setState(newState); // Can't use patch state with arrays. Just set to new state with assignments removed
    })
  }

  @Action(AssignmentsActions.CompleteAssignment)
  completeAssignments(
    assignmentsState: StateContext<Assignment[]>,
    action: AssignmentsActions.CompleteAssignment
  ) {
    this.assignmentsService.markAssignmentAsCompleted(action.enrollmentId).subscribe(() => {
      const state = assignmentsState.getState();
      const newState = state.filter(function (el) {
        return el.enrollmentId !== action.enrollmentId; 
      });
      assignmentsState.setState(newState);
    })
  }

  @Action(AssignmentsActions.CurrentAssignmentsFromApi)
  setCurrentAssignments(assignmentsState: StateContext<Assignment[]>) {
    return this.assignmentsService
      .fetchCurrentAssignments().subscribe(assignments => {
        assignmentsState.setState(assignments)
      })
  }

  // -- SELECTORS --  //

  @Selector()
  static getAssignment(state: Assignment[], id: string) {
    return state.find( assignment => assignment.enrollmentId === id);
  }

  @Selector()
  static getAssignmentsList(state: Assignment[]) {
    return this.mapCurrentlyAssignedAssignments(state);
  }

 
  // -- FUNCTIONS -- //

  private static mapCurrentlyAssignedAssignments(unmappedAssignments: Assignment[]) {
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

  private static getFirstIncompleteCourseFromLp( assignment: Assignment, assignments: Assignment[] ) {
    // these innerAssignments are not completed yet based on prev filter
    const allCourseIds = assignments.map( innerAssignment => innerAssignment.course.id);

    return (
      assignment.learningPath?.courses?.filter( course => allCourseIds.includes(course.id))?.[0]?.id ===
      assignment.course.id
    ); // first in LP courses list not yet complete, one per LP
  }
}
