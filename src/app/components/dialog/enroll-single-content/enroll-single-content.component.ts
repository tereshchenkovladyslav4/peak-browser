import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DialogBaseComponent, DialogConfig } from '../dialog-base/dialog-base.component';
import { ToastrService } from 'ngx-toastr';
import { CourseViewData } from 'src/app/modules/content/components/learning-path/models/course-view-data';
import { DialogRef } from 'src/app/services/dialog/dialog-ref';
import { DIALOG_DATA } from 'src/app/services/dialog/dialog-tokens';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, tap } from 'rxjs';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { AssignmentsService } from 'src/app/services/assignments/assignments.service';
import { LearningPathActionsService } from 'src/app/state/learning-path/actions/learning-path-actions.service';
import { Store } from '@ngxs/store';
import { CourseActions } from 'src/app/state/courses/courses.actions';

@Component({
  selector: 'ep-enroll-single-content',
  standalone: true,
  imports: [
    DialogBaseComponent,
    CheckboxModule,
    CalendarModule,
    FormsModule,
    SharedModule
  ],
  templateUrl: './enroll-single-content.component.html',
  styleUrls: ['./enroll-single-content.component.scss']
})
export class EnrollSingleContentComponent extends DialogBaseComponent implements OnInit, OnDestroy {
  contentName: string;
  isAssignDueDate = false;
  dueDate: Date;

  private unsubscribe$ = new Subject<void>();

  constructor(
    protected override dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public override data: { config?: DialogConfig, course: CourseViewData } & any,
    private store: Store
  ) {
    super(dialogRef, data);
  }

  ngOnInit(): void {
    this.contentName = this.data.course.name;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  enroll() {
    this.store.dispatch(new CourseActions.EnrollCourse(this.data.course, this.isAssignDueDate ? this.dueDate : null))
    this.close(true);
  }
}
