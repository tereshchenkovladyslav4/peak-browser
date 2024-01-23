import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CourseViewContent } from "../../models/course-view-content";
import { CourseViewData } from "../../models/course-view-data";
import { AssignmentEnrollmentStatus } from 'src/app/resources/models/assignment';
import { ContentType } from 'src/app/resources/models/content';
import { QuizStatus } from 'src/app/resources/models/content/quiz';

@Component({
  selector: 'ep-courses-list-view',
  templateUrl: './courses-list-view.component.html',
  styleUrls: ['./courses-list-view.component.scss']
})
export class CoursesListViewComponent implements OnChanges {
  @Input() activeCourseName: string;
  @Input() activeCourseProgress: number;
  @Input() enrolledCourses: CourseViewData[];
  @Input() activeCourseIndex: number;
  @Input() activeContentIndex: number;
  @Input() isCourseSummaryOpen: boolean;
  @Input() activeCourseDisabledContent: boolean[];
  @Input() responsiveMode: boolean;

  isMenuCollapsed: boolean = true;
  isCourseExpanded: boolean = true;

  @Output() onToggleCourse = new EventEmitter<number>();
  @Output() onOpenCourseDescModal = new EventEmitter<{ event: MouseEvent, course: CourseViewData }>();
  @Output() onOpenCourseContent = new EventEmitter<number>();
  @Output() onOpenFinishCourse = new EventEmitter<any>();

  readonly ContentType = ContentType;
  readonly QuizStatus = QuizStatus;
  readonly AssignmentEnrollmentStatus = AssignmentEnrollmentStatus;

  constructor(private hostRef: ElementRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    // collapse menu when we go from responsiveMode OFF -> ON
    const responsiveModeChanges = changes['responsiveMode'];
    const activeCourseIndexChanges = changes['activeCourseIndex'];
    const activeContentIndexChanges = changes['activeContentIndex'];
    if (responsiveModeChanges && !responsiveModeChanges.previousValue && responsiveModeChanges.currentValue 
      || activeCourseIndexChanges && activeCourseIndexChanges?.currentValue !== activeCourseIndexChanges?.previousValue
      || activeContentIndexChanges && activeContentIndexChanges?.currentValue !== activeContentIndexChanges?.previousValue) {
      this.closeMenu();
    }
  }

  toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  closeMenu() {
    this.isMenuCollapsed = true;
  }

  toggleCourse(courseIndex: number) {
    if (this.activeCourseIndex === courseIndex) {
      this.isCourseExpanded = !this.isCourseExpanded;
    }

    this.onToggleCourse.emit(courseIndex);
  }

  openCourseDescModal(event: MouseEvent, course: CourseViewData) {
    this.onOpenCourseDescModal.emit({ event: event, course: course})
  }

  openCourseContent(contentIndex: number) {
    // only emit when it is not a disabled content
    if (!this.activeCourseDisabledContent[contentIndex]) {
      this.onOpenCourseContent.emit(contentIndex);
    }
  }

  openFinishCourse(e: Event) {
    const el = (e.target as HTMLDivElement);
    if (el.classList.contains('disabled')) {
      return;
    }

    this.onOpenFinishCourse.emit();
  }

  identifyCourse(index: number, item: CourseViewData) {
    return item.courseId;
  }

  identifyCourseContent(index: number, item: CourseViewContent) {
    return item.contentId;
  }

  @HostListener('document:click', ['$event'])
  clickOut(event) {
    // close this menu if user clicked any element outside of this menu
    if (!this.hostRef.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }
}
