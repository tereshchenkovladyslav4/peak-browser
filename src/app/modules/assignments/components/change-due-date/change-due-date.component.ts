import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { CalendarModule } from 'primeng/calendar';
import { DialogBaseComponent, DialogConfig } from '../../../../components/dialog/dialog-base/dialog-base.component';
import { DialogRef } from '../../../../services/dialog/dialog-ref';
import { DIALOG_DATA } from '../../../../services/dialog/dialog-tokens';
import { SharedModule } from '../../../shared/shared.module';
import {Assignment, AssignmentAssignor} from '../../../../resources/models/assignment';
import { TranslationService } from '../../../../services/translation.service';
import { AssignmentsActions } from '../../../../state/assignments/assignments.actions';

@Component({
  selector: 'ep-change-due-date',
  templateUrl: './change-due-date.component.html',
  styleUrls: ['./change-due-date.component.scss'],
  imports: [DialogBaseComponent, FormsModule, SharedModule, CalendarModule],
  standalone: true,
})
export class ChangeDueDateComponent extends DialogBaseComponent implements OnInit {
  dueDate: Date;
  subtitle: string;

  constructor(
    protected override dialogRef: DialogRef,
    @Inject(DIALOG_DATA)
    public override data: { config?: DialogConfig; assignment: Assignment } & any,
    private store: Store,
    private translationService: TranslationService,
  ) {
    super(dialogRef, data);
  }

  ngOnInit() {
    this.subtitle = this.translationService
      .getTranslationFileData('assignments.change-due-date-subtitle')
      ?.replace('[NAME]', this.data?.assignment?.learningPath?.name);

    this.dueDate = this.data?.assignment?.dueDate ? new Date(this.data.assignment.dueDate) : null;
    console.log(this.data.assignment);
  }

  save() {
    const assignors: string[] = (this.data.assignment?.assignors || []).map((item: AssignmentAssignor) => item.userId);
    this.store
      .dispatch(new AssignmentsActions.EditAssignment(this.data.assignment.enrollmentId, assignors, this.dueDate))
      .subscribe(() => {
        this.close(true);
      });
  }
}
