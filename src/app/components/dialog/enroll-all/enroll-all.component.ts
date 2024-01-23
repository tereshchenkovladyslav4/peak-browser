import { Component, Inject, OnInit } from '@angular/core';
import { DialogBaseComponent, DialogConfig } from '../dialog-base/dialog-base.component';
import { DialogRef } from '../../../services/dialog/dialog-ref';
import { DIALOG_DATA } from '../../../services/dialog/dialog-tokens';
import { LearningPath } from '../../../resources/models/content';
import { ToastrService } from 'ngx-toastr';
import { CourseViewData } from '../../../modules/content/components/learning-path/models/course-view-data';
import { SharedModule } from '../../../modules/shared/shared.module';
import { AssignmentsService } from '../../../services/assignments/assignments.service';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { CourseActions } from 'src/app/state/courses/courses.actions';

@Component({
  selector: 'ep-enroll-all',
  templateUrl: './enroll-all.component.html',
  styleUrls: ['./enroll-all.component.scss'],
  imports: [
    DialogBaseComponent,
    FormsModule,
    SharedModule,
    CheckboxModule,
    CalendarModule,
  ],
  standalone: true
})
export class EnrollAllComponent extends DialogBaseComponent implements OnInit {
  isAssignDueDate = false;
  isPersonalize = false;
  dueDate: Date

  constructor(
    protected override dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public override data: { config?: DialogConfig, courses: CourseViewData[], learningPath: LearningPath } & any,
    private store: Store
  ) {
    super(dialogRef, data);
  }

  ngOnInit() {
  }

  enroll() {
    const courseIds = this.data.courses.map(c => c.courseId);
    this.store.dispatch(new CourseActions.EnrollCourses(this.data.learningPath.id, courseIds, this.isAssignDueDate ? this.dueDate : null));
    this.close(true);
  }
}
