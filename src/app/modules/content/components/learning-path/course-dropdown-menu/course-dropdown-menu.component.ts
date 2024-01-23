import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CourseViewData } from '../models/course-view-data';
import { WithDropdownItemsTempCache } from '../../../../../resources/mixins/dropdown-items-temp-cache.mixin';
import { Router } from '@angular/router';
import { DropdownMenuService } from '../../../../../services/dropdown-menu.service';
import { AssignmentEnrollmentStatus } from '../../../../../resources/models/assignment';

@Component({
  selector: 'ep-course-dropdown-menu',
  templateUrl: './course-dropdown-menu.component.html',
  styleUrls: ['./course-dropdown-menu.component.scss'],
})
export class CourseDropdownMenuComponent extends WithDropdownItemsTempCache() implements OnInit {
  @Input() course: CourseViewData;
  @Output() courseActionButtonClicked = new EventEmitter<void>();
  @Output() courseDropButtonClicked = new EventEmitter<void>();
  dropdownItems: any = [];

  constructor(
    private router: Router,
    private dropdownMenuService: DropdownMenuService,
  ) {
    super();
  }

  ngOnInit() {
    this.dropdownItems = this.getDropdownItems(null);
  }

  protected override constructDropdownItems() {
    this.dropdownMenuService.addDropCourse({ action: () => this.courseDropButtonClicked.emit() });
    return this.dropdownMenuService.getItems();
  }
}
