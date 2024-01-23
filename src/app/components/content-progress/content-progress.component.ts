import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { TranslationService } from 'src/app/services/translation.service';
import { AssignmentEnrollmentStatus } from '../../resources/models/assignment';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'ep-content-progress',
  templateUrl: './content-progress.component.html',
  styleUrls: ['./content-progress.component.scss']
})
export class ContentProgressComponent implements OnInit {
  readonly AssignmentEnrollmentStatus = AssignmentEnrollmentStatus;

  @Input() progress: number = 0;
  @Input() status?: AssignmentEnrollmentStatus;

  statusIconUrl: string = '';
  statusText: string = '';
  containerBgClass: string = '';
  textColorClass: string = '';

  constructor(private translationService: TranslationService) { }

  ngOnInit(): void {
    this.setStatusIconUrl();
    this.setStatusText();
    this.setContainerBgClass();
    this.setTextColorClass();
  }

  private setStatusIconUrl(): void {
    const iconStates = {
      [AssignmentEnrollmentStatus.In_Progress]: 'assets/images/search-results/content-status.svg',
      [AssignmentEnrollmentStatus.Completed]: 'assets/images/search-results/check-green.svg',
      [AssignmentEnrollmentStatus.Dropped]: 'assets/images/remove-red.svg'
    }

    this.statusIconUrl = iconStates[this.status] || '';
  }

  private setStatusText(): void {
    if (this.status === undefined) {
      this.statusText = this.translationService.getTranslationFileData('ep-content-progress.not-enrolled');
      return;
    }

    switch(this.status) {
      case AssignmentEnrollmentStatus.Not_Started:
        this.statusText = this.translationService.getTranslationFileData('ep-content-progress.not-started');
        break;
      case AssignmentEnrollmentStatus.In_Progress:
      case AssignmentEnrollmentStatus.Completed:
        const completedText = this.translationService.getTranslationFileData('ep-content-progress.completed');
        this.statusText = `${this.status === AssignmentEnrollmentStatus.In_Progress ? this.progress + '% ' : ''}${completedText}`;
        break;
      case AssignmentEnrollmentStatus.Dropped:
        this.statusText = this.translationService.getTranslationFileData('ep-content-progress.dropped')
        break;
      default:
        break;
    }
  }

  private setContainerBgClass() {
    const bgClasses = {
      [AssignmentEnrollmentStatus.Completed]: 'completed-bg-green',
      [AssignmentEnrollmentStatus.Dropped]: 'dropped-bg-red'
    }

    this.containerBgClass = bgClasses[this.status] || 'bg-grey';
  }

  private setTextColorClass() {
    const bgClasses = {
      [AssignmentEnrollmentStatus.Completed]: 'completed-text-green',
      [AssignmentEnrollmentStatus.Dropped]: 'dropped-text-red'
    }

    this.textColorClass = bgClasses[this.status] || 'text-grey';
  }
}
