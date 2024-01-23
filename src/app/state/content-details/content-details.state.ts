import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext, Store } from "@ngxs/store";
import { ContentService } from "src/app/services/content.service";
import { map, tap } from "rxjs";
import { ContentDetails, ContentType } from "src/app/resources/models/content";
import { ContentTypesService } from "src/app/services/content-types.service";
import { ContentDetailsActions } from "./content-details.actions";
import { CommentsActions } from "../comments/comments.actions";
import { RelatedContentActions } from "../related-content/related-content.actions";
import { CourseActions } from "../courses/courses.actions";



export interface ContentDetailsStateModel {
  contentDetails: ContentDetails | null;
  isContentDetailsLoading: boolean;  
}

@State<ContentDetailsStateModel>({
  name: 'contentDetails',
  defaults: {
    contentDetails: null,
    isContentDetailsLoading: true,
  }
})
@Injectable()
export class ContentDetailsState {
  constructor(
    private contentService: ContentService,
    private contentTypesService: ContentTypesService,
    private store: Store
  ) {

  }

  @Selector()
  static contentDetails(state: ContentDetailsStateModel) {
    return state.contentDetails;
  }

  @Selector()
  static isContentDetailsLoading(state: ContentDetailsStateModel) {
    return state.isContentDetailsLoading;
  }
  

  // ACTIONS

  @Action(ContentDetailsActions.GetContentDetails, { cancelUncompleted: true })
  getContentDetails(
    { patchState }: StateContext<ContentDetailsStateModel>,
    { contentId }: ContentDetailsActions.GetContentDetails
  ) {
    patchState({ isContentDetailsLoading: true })
    return this.contentService
      .getContentDetails(contentId)
      .pipe(
        map((contentDetails: ContentDetails) => ({
          ...contentDetails,
          typeIcon: this.contentTypesService.getContentInfoIconUrl(contentDetails?.type, contentDetails?.documentType)
        })),
        tap((contentDetails: ContentDetails) => patchState({ 
          contentDetails,
          isContentDetailsLoading: false
        })),
        tap((contentDetails: ContentDetails) => {
          if (contentDetails?.type === ContentType.LearningPath) {
            this.store.dispatch(new CourseActions.GetCourses(contentDetails.id));
          }
        }),
        tap((contentDetails: ContentDetails) => {
          this.store.dispatch([
            new CommentsActions.GetComments(contentDetails?.id),
            new RelatedContentActions.GetRelatedContent(contentDetails?.id)
          ])
        }),
      )
  }
}