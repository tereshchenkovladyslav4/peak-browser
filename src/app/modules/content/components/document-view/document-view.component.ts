import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { ContentDetails, ContentType, Document } from '../../../../resources/models/content';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ModalHtmlDirective } from "../../../../directives/modal-html.directive";
import { NgIf, NgStyle } from "@angular/common";
import { EnrollmentContentTracking, LearningPathStateService } from 'src/app/state/learning-path/learning-path-state.service';
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
export class DocumentViewComponent implements OnInit, OnDestroy {
  @Input() content: ContentDetails = null;
  @Input() customStyles?: any;
  @Input() enableEnrollmentTracking: boolean;

  documentContent: Document;
  externalSourceUrl: SafeResourceUrl;
  externalO365Viewer: string = "https://view.officeapps.live.com/op/embed.aspx?src=";
  isExternalDocument = false;
  tracking: EnrollmentContentTracking;

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

    if (this.enableEnrollmentTracking) {
      // Initialise the tracking state for this new content item but don't save it till we're destroyed:
      this.tracking = new EnrollmentContentTracking(
        this.documentContent.id,
        ContentType.Document,
        this.learningPathState.activeEnrolledCourse.courseId,
        this.learningPathState.activeEnrolledCourse.enrollmentId
      );

      this.tracking.isComplete = true; // Time spent on documents is not tracked, they are instantly completed.
    }
  }

  @HostListener('window:beforeunload', ['$event']) // Ensure this runs in all situations: https://wesleygrimes.com/angular/2019/03/29/making-upgrades-to-angular-ngondestroy
  ngOnDestroy() {
    // Record the time spent on this document:
    if (this.tracking) {
      this.tracking.endTime = new Date();
      this.learningPathActions.postEnrollmentContentTracking(this.tracking);
    }
  }

  setExternalDocumentUrl() {
    let docExtension = '';
    try {
      docExtension = this.documentContent?.documentUrl?.split("?")[0].split(".").pop();
    } catch (error) {
      // Ignore this.
    }

    switch (docExtension) {
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
}
