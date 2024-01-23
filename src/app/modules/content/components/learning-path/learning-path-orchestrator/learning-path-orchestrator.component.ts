import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, combineLatest, map, tap } from 'rxjs';
import { LayoutStateService } from 'src/app/state/layout/layout-state.service';
import { LearningPathStateService } from 'src/app/state/learning-path/learning-path-state.service';
import { ContentDetails } from 'src/app/resources/models/content';
import { Location } from '@angular/common';

@Component({
  selector: 'ep-learning-path-orchestrator',
  templateUrl: './learning-path-orchestrator.component.html',
  styleUrls: ['./learning-path-orchestrator.component.scss']
})
export class LearningPathOrchestratorComponent implements OnInit, OnDestroy {
  @Input() content: ContentDetails = null;

  // observables
  isFullScreen$: Observable<boolean>;
  isLearningPathOpen$: Observable<boolean>;

  private subscriptions = new Subscription();

  constructor(
    private layoutState: LayoutStateService,
    private learningPathState: LearningPathStateService,
    private location: Location
  ) { }
  

  ngOnInit(): void {
    this.manageLayout();
    this.setIsLearningPathOpen();
    this.setNoEnrolledCourses();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private manageLayout() {
    this.isFullScreen$ = this.layoutState.selectIsFullScreen$;
  }

  private setIsLearningPathOpen() {
    this.isLearningPathOpen$ = this.learningPathState.isLearningPathOpen$;
  }

  private setNoEnrolledCourses() {
    this.subscriptions.add(
      combineLatest([
        this.learningPathState.isLearningPathOpen$,
        this.learningPathState.enrolledCourses$
      ]).pipe(
          tap(([isLearningPathOpen, enrolledCourses]) => {
            if (isLearningPathOpen && enrolledCourses?.length === 0) {
              // this.layoutState.setLayout('default');
              this.learningPathState.reset();
              this.location.back();
            }
          })
        )
        .subscribe()
    )
  }
}
