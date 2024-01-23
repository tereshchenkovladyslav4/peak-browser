import { Injectable } from '@angular/core';
import {Comment} from "../../services/apiService/classFiles/class.content";
import {BehaviorSubject, Observable} from "rxjs";
import {map} from "rxjs/operators";
import { nameof, selectFrom } from 'src/app/resources/functions/state/state-management';

interface CommentsState {
  comments: Comment[];
}

const DEFAULT_STATE: CommentsState = {
  comments: []
}
@Injectable({
  providedIn: 'root'
})
export class CommentsStateService {

  state$: BehaviorSubject<CommentsState> = new BehaviorSubject<CommentsState>(DEFAULT_STATE);

  constructor() {
  }

  getComments(): Observable<Comment[]> {
    return this.state$.pipe(
      map(state => state.comments)
    );
  }

  addComment(comment: Comment): void {
    this.updateComments([...this._getComments(), comment])
  }


  deleteComment(commentId: string): void {
    this.updateComments([...this._getComments().filter(c => c.commentId !== commentId)])
  }

  updateComments(comments: Comment[]): void {
    this.state$.next({...this._getState(), comments: comments});
  }

  private _getComments(): Comment[] {
    return this._getState().comments;
  }

  private _getState(): CommentsState {
    return this.state$.getValue();
  }

  private updateState(state: CommentsState) {
    this.state$.next(state);
  }
}
