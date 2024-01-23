import {Component, Inject, OnInit} from '@angular/core';
import {DialogBaseComponent, DialogConfig} from "../dialog-base/dialog-base.component";
import {SharedModule} from "../../../modules/shared/shared.module";
import {DialogRef} from "../../../services/dialog/dialog-ref";
import {DIALOG_DATA} from "../../../services/dialog/dialog-tokens";
import {ContentService} from "../../../services/content.service";
import {Observable, of} from "rxjs";
import {AsyncPipe, NgIf, NgStyle, NgSwitch, NgSwitchCase} from "@angular/common";
import {
  CONTENT_TYPE_DISPLAY_MAP,
  mapServerContentTypeToContentTypeString
} from "../../../resources/models/filter/content-type-filter";
import {ContentDetails, ContentType, Video} from "../../../resources/models/content";
import {ContentTypesService} from "../../../services/content-types.service";
import {map} from "rxjs/operators";
import {DocumentViewComponent} from "../../../modules/content/components/document-view/document-view.component";
import {VideoViewComponent} from "../../../modules/content/components/video-view/video-view.component";
import { ModalHtmlDirective } from 'src/app/directives/modal-html.directive';
import { SpinnerComponent } from '../../spinner/spinner.component';

@Component({
  selector: 'ep-content-viewer',
  templateUrl: './content-viewer.component.html',
  styleUrls: ['./content-viewer.component.scss'],
  imports: [
    AsyncPipe,
    DialogBaseComponent,
    DocumentViewComponent,
    ModalHtmlDirective,
    NgIf,
    NgStyle,
    NgSwitch,
    NgSwitchCase,
    SharedModule,
    SpinnerComponent,
    VideoViewComponent
  ],
  standalone: true
})
export class ContentViewerComponent extends DialogBaseComponent implements OnInit {
  constructor(
    protected override dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public override data: { config?: DialogConfig } & any,
    private contentService: ContentService,
    private contentTypesService: ContentTypesService
  ) {
    super(dialogRef, data);

    // todo remove log after imgs integrated
    // console.log(data);
  }

  content$: Observable<ContentDetails & {contentTypeImage: string}>;
  documentStyles = {
    height: '100%',
    ['margin-right']: '0',
    ['padding-right']: '0',
  };
  videoStyles = {
    height: '100%',
    ['padding-right']: '0',
  };
  imageStyles = {
    height: `${parseFloat(this.data.config.height) - 5}vh`,
    width: this.data.config.width,
  }
  contentType = ContentType;

  ngOnInit() {
    this.content$ = this.data.config.contentViewer.contentType !== 'Image'
      ? this.contentService.getContentDetails(this.data.config.contentViewer.contentId).pipe(
      map(content => {
        const contentType = mapServerContentTypeToContentTypeString(content.type);
        const contentTypeDisplay = CONTENT_TYPE_DISPLAY_MAP[contentType];

        if (content.type === ContentType.Document) {
          contentTypeDisplay.image = this.contentTypesService.getContentInfoIconUrl(content.type, content.documentType);
        }

        return {...content, contentTypeImage: contentTypeDisplay.image};
      })
    )
    : of(null);
  }

  protected readonly Video = Video;
}
