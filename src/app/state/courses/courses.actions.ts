import { CourseViewData } from 'src/app/modules/content/components/learning-path/models/course-view-data';

export namespace CourseActions {
  export class GetCourses {
    static readonly type = '[Learning Path View Component] Get courses';
    constructor(public learningPathId: string) {}
  }

  export class EnrollCourse {
    static readonly type = '[Enroll Single Content Component] Enroll in course';
    constructor(public learningPathId: string, public courseId: string, public dueDate: Date) {}
  }

  export class EnrollCourses {
    static readonly type = '[Enroll All Component] Enroll in all LP courses';
    constructor(public learningPathId: string, public courseIds: string[], public dueDate: Date) {}
  }

  export class DropCourse {
    static readonly type = '[Learning Path View Component] Drop course';
    constructor(public course: CourseViewData) {}
  }
}
