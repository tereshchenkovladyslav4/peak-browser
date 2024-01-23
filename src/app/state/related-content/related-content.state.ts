import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { ContentSummary } from "src/app/resources/models/content";
import { RelatedContentActions } from "./related-content.actions";
import { ContentService } from "src/app/services/content.service";

export interface RelatedContentStateModel {
  relatedContent: ContentSummary[] | null;
  isRelatedContentLoading: boolean;
}

@State<RelatedContentStateModel>({
  name: 'relatedContent',
  defaults: {
    relatedContent: null,
    isRelatedContentLoading: true
  }
})
@Injectable()
export class RelatedContentState {
  constructor(private contentService: ContentService) {}

  @Selector()
  static relatedContent(state: RelatedContentStateModel) {
    return state.relatedContent;
  }

  @Selector()
  static isRelatedContentLoading(state: RelatedContentStateModel) {
    return state.isRelatedContentLoading;
  }

  @Action(RelatedContentActions.GetRelatedContent, { cancelUncompleted: true })
  getRelatedContent(
    { patchState }: StateContext<RelatedContentStateModel>, 
    { contentId }: RelatedContentActions.GetRelatedContent
  ) {
    patchState({ isRelatedContentLoading: true })
    return this.contentService.getRelatedContents(contentId).pipe(
      tap((relatedContent: ContentSummary[]) => patchState({ 
        relatedContent,
        isRelatedContentLoading: false
      }))
    )
  }
}