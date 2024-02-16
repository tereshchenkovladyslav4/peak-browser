import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Assignment } from '../../../../resources/models/assignment';
import { AsyncPipe, DatePipe, NgClass, NgIf, NgStyle } from '@angular/common';
import { DropdownMenuContainerComponent } from '../../../../components/dropdown-menu-container/dropdown-menu-container.component';
import { TextTruncateDirective } from '../../../../directives/text-truncate.directive';
import { AssignmentStatusComponent } from '../assignment-status/assignment-status.component';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { AssignmentMenuComponent } from '../assignment-menu/assignment-menu.component';
import { AssignmentBookmarkComponent } from '../assignment-bookmark/assignment-bookmark.component';

@Component({
  selector: 'ep-assignment-card',
  templateUrl: './assignment-card.component.html',
  styleUrls: ['./assignment-card.component.scss'],
  imports: [
    NgIf,
    NgClass,
    DropdownMenuContainerComponent,
    DatePipe,
    NgStyle,
    AsyncPipe,
    SharedModule,
    TextTruncateDirective,
    AssignmentStatusComponent,
    AssignmentMenuComponent,
    AssignmentBookmarkComponent,
  ],
  standalone: true,
})
export class AssignmentCardComponent implements OnInit {
  @Input() assignment: Assignment;
  isMenuOpened = false;
  pastDue = false;
  image = '';
  titleRows: number;

  constructor(private router: Router) {}

  ngOnInit() {
    this.setPastDue();
    this.setImage();
  }

  onAssignmentClick() {
    this.resume();
  }

  private setPastDue() {
    const today = new Date();
    const due = new Date(this.assignment?.dueDate);

    this.pastDue = this.assignment?.dueDate && due < today;
  }

  private setImage() {
    this.image = this.assignment?.course?.imageUrl || this.assignment?.learningPath?.imageUrl;
  }

  resume() {
    this.router.navigate(['/content/learning-path', this.assignment?.learningPath?.id], {
      queryParams: {
        r: true,
      },
    });
  }
}
