import {Component, Input, OnInit} from '@angular/core';
import { ContentDetails, Document } from '../../../../resources/models/content';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {ModalHtmlDirective} from "../../../../directives/modal-html.directive";
import {NgIf, NgStyle} from "@angular/common";
import { LearningPathStateService } from 'src/app/state/learning-path/learning-path-state.service';
import { LearningPathActionsService } from 'src/app/state/learning-path/actions/learning-path-actions.service';

@Component({
  selector: 'ep-document-view',
  templateUrl: './document-view.component.html',
  styleUrls: ['./document-view.component.scss'],
  imports: [
    ModalHtmlDirective,
    NgIf,
    NgStyle
  ],
  standalone: true
})
export class DocumentViewComponent implements OnInit {
  @Input() content: ContentDetails = null;
  @Input() customStyles?: any;

  documentContent: Document;
  externalSourceUrl: SafeResourceUrl;
  externalO365Viewer: string = "https://view.officeapps.live.com/op/embed.aspx?src=";
  isExternalDocument = false;

  constructor(
    private sanitizer: DomSanitizer,
    private learningPathState: LearningPathStateService,
    private learningPathActions: LearningPathActionsService
  ) {

  }

  ngOnInit(): void {
    this.documentContent = this.content as Document;
    this.isExternalDocument = this.documentContent?.isExternal;
    this.setExternalDocumentUrl();
    this.markDocumentComplete();
  }

  setExternalDocumentUrl() {
    let docExtension = '';
    try {
      docExtension = this.documentContent?.documentUrl?.split("?")[0].split(".").pop();
    } catch (error) { }

    switch(docExtension) {
      case "pdf":
      case "html":
      case "htm":
          this.externalSourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.documentContent?.documentUrl);
          break;
      case "doc":
      case "docx":
      case "dotx":
      case "xlsx":
      case "xlsb":
      case "xls":
      case "xlsm":
      case "ppt":
      case "pptx":
      case "ppsx":
      case "pps":
      case "potx":
      case "ppsm":
        let sourceUrl = this.externalO365Viewer + encodeURIComponent(this.documentContent?.documentUrl);
        sourceUrl += "&wdallowinteractivity=true&wddownloadbutton=true";
        this.externalSourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(sourceUrl);
        break;
      default:
        break;
    }
  }

  private markDocumentComplete() {
    if (this.learningPathState.snapshot.isLearningPathOpen) {
      this.learningPathActions.markDocumentCompleteAction();
    }
  }
}
