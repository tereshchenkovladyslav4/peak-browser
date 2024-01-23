import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ContentContainerComponent} from './components/content-container/content-container.component';
import {RouterModule, Routes} from "@angular/router";
import {NAVIGATION_ROUTES, ROUTE_TITLES} from "../../resources/constants/app-routes";
import {SharedModule} from '../shared/shared.module';
import {ContentHeaderComponent} from './components/content-header/content-header.component';
import {DocumentViewComponent} from './components/document-view/document-view.component';
import {ContentDetailsPanelComponent} from './components/content-details-panel/content-details-panel.component';
import {TopicInfoComponent} from 'src/app/components/topic-info/topic-info.component';
import {TooltipModule} from '../tooltip/tooltip.module';
import {DropdownMenuComponent} from '../../components/dropdown-menu/dropdown-menu.component';
import {LearningPathViewComponent} from './components/learning-path/learning-path-view/learning-path-view.component';
import {ContentFooterComponent} from './components/content-footer/content-footer.component';
import {HorizontalTabsComponent} from 'src/app/components/horizontal-tabs/horizontal-tabs.component';
import {VideoViewComponent} from './components/video-view/video-view.component';
import {ContentProgressComponent} from 'src/app/components/content-progress/content-progress.component';
import {
  ContentFooterDescriptionComponent
} from './components/content-footer/components/content-footer-description/content-footer-description.component';
import {
  ContentFooterPrerequisitesComponent
} from './components/content-footer/components/content-footer-prerequisites/content-footer-prerequisites.component';
import {
  ContentFooterRelatedContentComponent
} from './components/content-footer/components/content-footer-related-content/content-footer-related-content.component';
import {
  ContentFooterCommentsComponent
} from './components/content-footer/components/content-footer-comments/content-footer-comments.component';
import {UserProfileImageComponent} from "../../components/user-profile-image/user-profile-image.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WorkflowViewComponent } from './components/workflow/workflow-view/workflow-view.component';
import { WorkflowTreeComponent } from './components/workflow/workflow-tree/workflow-tree.component';
import { WorkflowStepsComponent } from './components/workflow/workflow-steps/workflow-steps.component';
import { WorkflowViewSelectorComponent } from './components/workflow/workflow-view-selector/workflow-view-selector.component';
import {CardViewComponent} from "../../components/card-view/card-view.component";
import { WorkflowDiagramViewComponent } from './components/workflow/workflow-diagram-view/workflow-diagram-view.component';
import { SpinnerComponent } from 'src/app/components/spinner/spinner.component';
import { VideoChapterListComponent } from './components/video-chapter-list/video-chapter-list.component';
import { ModalHtmlDirective } from 'src/app/directives/modal-html.directive';
import { CoursesListComponent } from './components/learning-path/courses-list/feature/courses-list.component';
import { QuizViewComponent } from './components/quiz/features/quiz-view/quiz-view.component';
import { LearningPathOrchestratorComponent } from './components/learning-path/learning-path-orchestrator/learning-path-orchestrator.component';
import { LpCourseContentComponent } from './components/learning-path/lp-course-content/lp-course-content.component';
import { LoadingComponent } from 'src/app/components/loading/loading.component';
import { QuizResultsComponent } from './components/quiz/ui/quiz-results/quiz-results.component';
import { CourseNavButtonsComponent } from './components/learning-path/course-nav-buttons/feature/course-nav-buttons.component';
import { CourseNavButtonsViewComponent } from './components/learning-path/course-nav-buttons/ui/course-nav-buttons-view.component';
import { CoursesListViewComponent } from './components/learning-path/courses-list/ui/courses-list-view.component';
import { QuizImageComponent } from './components/quiz/ui/quiz-image/quiz-image.component';
import { CircleProgressComponent } from 'src/app/components/circle-progress/circle-progress.component';
import { CollapseButtonComponent } from 'src/app/components/collapse-button/collapse-button.component';
import { ExpandButtonComponent } from 'src/app/components/expand-button/expand-button.component';
import { DialogBaseComponent } from '../../components/dialog/dialog-base/dialog-base.component';
import { FinishCourseComponent } from './components/learning-path/finish-course/finish-course.component';
import { CourseDropdownMenuComponent } from './components/learning-path/course-dropdown-menu/course-dropdown-menu.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DropdownMenuContainerComponent } from '../../components/dropdown-menu-container/dropdown-menu-container.component';

const CONTENT_ROUTES: Routes = [
  {
    path: '',
    // todo redirect towards a 404 page or similar
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'workflow/:id',
    component: ContentContainerComponent,
    title: ROUTE_TITLES[NAVIGATION_ROUTES.content]
  },
  {
    path: 'learning-path/:id',
    component: ContentContainerComponent,
    title: ROUTE_TITLES[NAVIGATION_ROUTES.content]
  },
  {
    path: ':id',
    component: ContentContainerComponent,
    title: ROUTE_TITLES[NAVIGATION_ROUTES.content],
    children: [
      
    ]
  },
];

@NgModule({
  declarations: [
    ContentContainerComponent,
    ContentHeaderComponent,
    ContentDetailsPanelComponent,
    ContentFooterComponent,
    LearningPathViewComponent,
    ContentFooterDescriptionComponent,
    ContentFooterPrerequisitesComponent,
    ContentFooterRelatedContentComponent,
    ContentFooterCommentsComponent,
    WorkflowViewComponent,
    WorkflowTreeComponent,
    WorkflowStepsComponent,
    WorkflowViewSelectorComponent,
    WorkflowDiagramViewComponent,
    VideoChapterListComponent,
    CoursesListComponent,
    CourseNavButtonsComponent,
    FinishCourseComponent,
    QuizViewComponent,
    LearningPathOrchestratorComponent,
    LpCourseContentComponent,
    CourseNavButtonsViewComponent,
    QuizResultsComponent,
    CoursesListViewComponent,
    QuizImageComponent,
    CourseDropdownMenuComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    DropdownMenuComponent,
    TopicInfoComponent,
    TooltipModule,
    HorizontalTabsComponent,
    ContentProgressComponent,
    UserProfileImageComponent,
    RouterModule.forChild(CONTENT_ROUTES),
    CardViewComponent,
    ReactiveFormsModule,
    DocumentViewComponent,
    VideoViewComponent,
    SpinnerComponent,
    ModalHtmlDirective,
    LoadingComponent,
    CircleProgressComponent,
    CollapseButtonComponent,
    ExpandButtonComponent,
    DialogBaseComponent,
    OverlayPanelModule,
    DropdownMenuContainerComponent
  ],
})
export class ContentModule {}
