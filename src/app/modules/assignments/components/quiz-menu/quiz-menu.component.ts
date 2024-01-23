import { Component, Input, OnInit } from '@angular/core';
import { WithDropdownItemsTempCache } from '../../../../resources/mixins/dropdown-items-temp-cache.mixin';
import { DropdownMenuService } from '../../../../services/dropdown-menu.service';
import { DropdownMenuContainerComponent } from '../../../../components/dropdown-menu-container/dropdown-menu-container.component';
import { DialogConfig } from '../../../../components/dialog/dialog-base/dialog-base.component';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { QuizSummary } from '../../../../resources/models/content/quiz';
import { QuizResultsComponent } from '../quiz-results/quiz-results.component';

@Component({
  selector: 'ep-quiz-menu',
  templateUrl: './quiz-menu.component.html',
  styleUrls: ['./quiz-menu.component.scss'],
  standalone: true,
  imports: [DropdownMenuContainerComponent],
})
export class QuizMenuComponent extends WithDropdownItemsTempCache() implements OnInit {
  @Input() quizSummary: QuizSummary;
  @Input() enrollId: string;
  @Input() courseId: string;
  dropdownItems: any = [];

  constructor(
    private dropdownMenuService: DropdownMenuService,
    private dialogService: DialogService,
  ) {
    super();
  }

  ngOnInit() {
    this.dropdownItems = this.getDropdownItems(null);
  }

  protected override constructDropdownItems() {
    return this.dropdownMenuService
      .addReviewQuizResults({
        action: () => {
          this.openQuizResults();
        },
      })
      .getItems();
  }

  private openQuizResults() {
    const enrollmentDetailsConfig: DialogConfig = {
      containerStyles: {
        width: '1100px',
      },
    };

    this.dialogService.open(QuizResultsComponent, {
      data: {
        config: enrollmentDetailsConfig,
        quizSummary: this.quizSummary,
        enrollId: this.enrollId,
        courseId: this.courseId,
      },
    });
  }
}
