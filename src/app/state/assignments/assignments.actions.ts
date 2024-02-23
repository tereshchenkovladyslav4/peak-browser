
export namespace AssignmentsActions {

    export class EditAssignment {
        static readonly type = '[Assignment] Edit Assignment';
        constructor(public enrollmentId: string, public assignors: string[], public dueDate: Date | null){}
    }

    export class RemoveAssignment {
        static readonly type = '[Assignment] Remove Assignment';
        constructor(public enrollmentIds: string[]){}
    }

    export class CompleteAssignment {
        static readonly type = '[Assignment] Complete Assignment';
        constructor(public enrollmentId: string){}
    }

    export class CurrentAssignmentsFromApi {
        static readonly type = '[Assignments API] Currently assigned Assignments recieved from API'
    }

}
