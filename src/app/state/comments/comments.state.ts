import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { CommentsActions } from "./comments.actions";
import { ContentService } from "src/app/services/content.service";
import { Comment } from "src/app/services/apiService/classFiles/class.content";
import { getEnrichedComments } from "./comments.utils";

export interface CommentsStateModel {
  comments: Comment[] | null;
  isCommentsLoading: boolean;
}

@State<CommentsStateModel>({
  name: 'comments',
  defaults: {
    comments: null,
    isCommentsLoading: true
  }
})
@Injectable()
export class CommentsState {

  constructor(private contentService: ContentService) {}

  @Selector()
  static comments(state: CommentsStateModel) {
    return state.comments;
  }

  @Selector()
  static isCommentsLoading(state: CommentsStateModel) {
    return state.isCommentsLoading;
  }

  static enrichedComments({ comments: commentsState }: { comments: CommentsStateModel }) {
    return (userId: string) => {
      return getEnrichedComments(commentsState.comments, userId);
    }
  }
  
  @Action(CommentsActions.GetComments, { cancelUncompleted: true })
  getComments(
    { patchState }: StateContext<CommentsStateModel>, 
    { contentId }: CommentsActions.GetComments
  ) {
    patchState({ isCommentsLoading: true })
    return this.contentService.getContentComments(contentId).pipe(
      tap((comments: Comment[]) => patchState({ 
        comments,
        isCommentsLoading: false
      }))
    )
  }
}
