import { DropdownMenuContainerComponent } from 'src/app/components/dropdown-menu-container/dropdown-menu-container.component';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { ToastrService } from 'ngx-toastr';
import { DialogConfig } from 'src/app/components/dialog/dialog-base/dialog-base.component';
import { NAVIGATION_ROUTES } from 'src/app/resources/constants/app-routes';
import { WithDropdownItemsTempCache } from 'src/app/resources/mixins/dropdown-items-temp-cache.mixin';
import { Assignment } from 'src/app/resources/models/assignment';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { DropdownMenuService } from 'src/app/services/dropdown-menu.service';
import { TranslationService } from 'src/app/services/translation.service';
import { AssignmentsActions } from 'src/app/state/assignments/assignments.actions';
import { BookmarksStateService } from 'src/app/state/bookmarks/bookmarks-state.service';
import { ConfirmDialogComponent } from 'src/app/components/dialog/confirm-dialog/confirm-dialog.component';
import { ChangeDueDateComponent } from '../change-due-date/change-due-date.component';

@Component({
  selector: 'ep-assignment-menu',
  templateUrl: './assignment-menu.component.html',
  styleUrls: ['./assignment-menu.component.scss'],
  standalone: true,
  imports: [DropdownMenuContainerComponent, ConfirmDialogComponent],
})
export class AssignmentMenuComponent extends WithDropdownItemsTempCache() implements OnInit {
  @Input() assignment: Assignment;
  @Input() isTransparent = false;
  @Output() statusEmitter: EventEmitter<any> = new EventEmitter<any>();
  dropdownItems: any = [];

  constructor(
    private router: Router,
    private dropdownMenuService: DropdownMenuService,
    private bookmarksStateService: BookmarksStateService,
    private dialogService: DialogService,
    private translationService: TranslationService,
    private toastr: ToastrService,
    private store: Store,
  ) {
    super();
  }

  ngOnInit() {
    this.dropdownItems = this.getDropdownItems(null);
  }

  protected override constructDropdownItems() {
    const { id } = this.assignment.learningPath;
    return this.dropdownMenuService
      .addResume({ action: () => this.resume() })
      .addViewDetails({ action: () => this.goToLearningPath() })
      .addMarkAsCompleted({ action: () => this.openCompleteDialog() })
      .addChangeDueDate({ action: () => this.openChangeDueDateDialog() })
      .addBookmarkItem(this.bookmarksStateService.isContentBookmarked(id), id)
      .addDivider()
      .addShareNotification({})
      .addShareWorkGroup({})
      .addCopyLinkFormatted({})
      .addCopyLinkUnformatted({})
      .addDivider()
      .addDropCourse({ action: () => this.openDropCourseDialog() })
      .addDropLearningPath({ action: () => this.openDropLPDialog() })
      .getItems();
  }

  resume() {
    this.router.navigate(['/content/learning-path', this.assignment.learningPath.id], {
      queryParams: {
        r: true,
      },
    });
  }

  goToLearningPath() {
    this.router.navigate([NAVIGATION_ROUTES.content, this.assignment.learningPath.id]);
  }

  openCompleteDialog() {
    const isDone = this.assignment.progress === 100;
    const dialogConfig: DialogConfig = {
      containerStyles: {
        width: '350px',
        height: 'unset',
      },
      title: this.translationService.getTranslationFileData(
        isDone ? 'assignments.mark-course-as-completed-title' : 'assignments.complete-without-certificate-title',
      ),
      content: this.translationService
        .getTranslationFileData(
          isDone
            ? 'assignments.mark-course-as-completed-description'
            : 'assignments.complete-without-certificate-description',
        )
        ?.replace('[COURSE_NAME]', this.assignment.course.name)
        ?.replace('[PROGRESS]', this.assignment.progress),
      buttonType: 'green',
      negativeButton: this.translationService.getTranslationFileData('common.cancel'),
      positiveButton: this.translationService.getTranslationFileData('common.complete'),
    };

    this.dialogService
      .open(ConfirmDialogComponent, {
        data: {
          config: dialogConfig,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.completeAssignment();
        }
      });
  }

  completeAssignment() {
    const isDone = this.assignment.progress === 100;
    const enrollmentId = this.assignment.enrollmentId;
    this.store.dispatch(new AssignmentsActions.CompleteAssignment(enrollmentId)).subscribe(() => {
      this.toastr.success(
        this.translationService
          .getTranslationFileData(
            isDone
              ? 'assignments.mark-course-as-completed-success'
              : 'assignments.complete-without-certificate-success',
          )
          ?.replace('[NAME]', this.assignment.course.name),
      );
    });
  }

  openChangeDueDateDialog() {
    this.dialogService
      .open(ChangeDueDateComponent, {
        data: {
          config: { width: '100%', height: '100%' },
          assignment: this.assignment,
        },
      })
      .afterClosed()
      .subscribe();
  }

  openDropLPDialog() {
    const dialogConfig: DialogConfig = {
      containerStyles: {
        width: '350px',
        height: 'unset',
      },
      title: this.translationService.getTranslationFileData('content-container.drop-lp-friction-title'),
      content: this.translationService
        .getTranslationFileData('content-container.drop-lp-friction-body')
        ?.replace('[LEARNING_PATH_NAME]', this.assignment.learningPath.name),
      buttonType: 'danger',
      negativeButton: this.translationService.getTranslationFileData('common.cancel'),
      positiveButton: this.translationService.getTranslationFileData('common.drop'),
    };

    this.dialogService
      .open(ConfirmDialogComponent, {
        data: {
          config: dialogConfig,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.dropLearningPath();
        }
      });
  }

  dropLearningPath() {
    const enrollmentIds = this.assignment.siblings.map((item) => item.enrollmentId);
    this.store.dispatch(new AssignmentsActions.RemoveAssignment(enrollmentIds)).subscribe(() => {
      this.toastr.success(
        this.translationService
          .getTranslationFileData('content-container.dropped-message')
          ?.replace('[NAME]', this.assignment.learningPath.name),
      );
    });
  }

  openDropCourseDialog() {
    const dialogConfig: DialogConfig = {
      containerStyles: {
        width: '350px',
        height: 'unset',
      },
      title: this.translationService.getTranslationFileData('content-container.drop-course-friction-title'),
      content: this.translationService
        .getTranslationFileData('content-container.drop-course-friction-body')
        ?.replace('[COURSE_NAME]', this.assignment.course.name),
      buttonType: 'danger',
      negativeButton: this.translationService.getTranslationFileData('common.cancel'),
      positiveButton: this.translationService.getTranslationFileData('common.drop'),
    };

    this.dialogService
      .open(ConfirmDialogComponent, {
        data: {
          config: dialogConfig,
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.dropCourse();
        }
      });
  }

  dropCourse() {
    const enrollmentId = this.assignment.enrollmentId;
    this.store.dispatch(new AssignmentsActions.RemoveAssignment([enrollmentId])).subscribe(() => {
      this.toastr.success(
        this.translationService
          .getTranslationFileData('content-container.dropped-message')
          ?.replace('[NAME]', this.assignment.course.name),
      );
    });
  }
}
