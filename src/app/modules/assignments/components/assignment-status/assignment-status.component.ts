import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { Assignment } from 'src/app/resources/models/assignment';

@Component({
  selector: 'ep-assignment-status',
  templateUrl: './assignment-status.component.html',
  styleUrls: ['./assignment-status.component.scss'],
  standalone: true,
  imports: [NgIf, SharedModule],
})
export class AssignmentStatusComponent {
  @Input() assignment: Assignment;
}
