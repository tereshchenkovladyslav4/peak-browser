import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ContentService} from "../../../../../../services/content.service";
import {EMPTY, iif, map, mergeMap, Observable, take, tap} from "rxjs";
import {ContentType, SERVER_CONTENT_TYPE_MAP} from "../../../../../../resources/models/content";
import {Comment} from "../../../../../../services/apiService/classFiles/class.content";
import {AuthorizationService} from "../../../../../../components/dev-authorization/authorization.service";
import {ToastrService} from "ngx-toastr";
import {DialogService} from "../../../../../../services/dialog/dialog.service";
import { TranslationService } from '../../../../../../services/translation.service';
import { ConfirmDialogComponent } from '../../../../../../components/dialog/confirm-dialog/confirm-dialog.component';
import { DialogConfig } from '../../../../../../components/dialog/dialog-base/dialog-base.component';
import { Store } from '@ngxs/store';
import { CommentsState } from 'src/app/state/comments/comments.state';

@Component({
  selector: 'ep-content-footer-comments',
  templateUrl: './content-footer-comments.component.html',
  styleUrls: ['./content-footer-comments.component.scss']
})
export class ContentFooterCommentsComponent implements OnInit {

  @Input() contentId: string;
  @Input() contentType: ContentType;

  form: FormGroup;
  enrichedComments$: Observable<(Comment & { canDelete: boolean, localeDate: string })[]>;
  disablePost: boolean;

  constructor(
    private fb: FormBuilder,
    private contentService: ContentService,
    private authService: AuthorizationService,
    private toastr: ToastrService,
    private dialog: DialogService,
    private translationService: TranslationService,
    private store: Store
  ) {
  }

  ngOnInit() {
    this.initForm();
    this.setEnrichedComments();
  }

  onPostClick() {
    if (this.form.valid) {
      this.disablePost = true;

      const contentType = SERVER_CONTENT_TYPE_MAP[this.contentType];
      this.contentService.createContentComment(this.contentId, contentType, this.form.getRawValue()).pipe(
        take(1)
      ).subscribe(() => {
          this.toastr.success('Your comment has been posted.', '');
          this.form.reset()
        },
        () => null,
        () => this.disablePost = false
        );
    }
  }

  onDeleteClick(commentId: string) {
    const dialogConfig: DialogConfig = {
      containerStyles: {
        width: '350px',
        height: 'unset',
      },
      title: this.translationService.getTranslationFileData('content-container.delete-comment-confirm-title'),
      content: this.translationService.getTranslationFileData('content-container.delete-comment-confirm-body'),
      buttonType: 'danger',
      negativeButton: this.translationService.getTranslationFileData('common.cancel'),
      positiveButton: this.translationService.getTranslationFileData('common.delete'),
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        config: dialogConfig,
      },
    });

    const delete$ = this.contentService.deleteContentComment(this.contentId, commentId).pipe(
      tap(() => this.toastr.info('Your comment has been deleted.')),
      take(1)
    );

    dialogRef.afterClosed().pipe(
      mergeMap((shouldDelete) => {
        return iif(() => shouldDelete,
          delete$,
          EMPTY
        );
      }),
      take(1)
    ).subscribe();
  }

  private initForm() {
    this.form = this.fb.group({
      commentText: new FormControl('', [Validators.required])
    });
  }

  private setEnrichedComments() {
    const userId = this.authService.getUserId();

    this.enrichedComments$ = this.store
      .select(CommentsState.enrichedComments)
      .pipe(map(filterFn => filterFn(userId)));
  }
}
