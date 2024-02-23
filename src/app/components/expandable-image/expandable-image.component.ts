import { Component, Input } from '@angular/core';
import { NgIf, NgStyle } from '@angular/common';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { ImageViewerComponent } from '../dialog/image-viewer/image-viewer.component';

@Component({
  selector: 'ep-expandable-image',
  standalone: true,
  imports: [NgIf, NgStyle],
  templateUrl: './expandable-image.component.html',
  styleUrls: ['./expandable-image.component.scss']
})
export class ExpandableImageComponent {
  @Input() name: string = '';
  @Input() url: string = '';
  @Input() imgStyles: { [klass: string]: any }

  imageLoaded: boolean = false;

  constructor(private dialogService: DialogService) {
  }

  openImageDialog() {
    event?.stopPropagation();

    this.dialogService
    .open(ImageViewerComponent, {
      data: {
        config: {
          width: 'fit-content',
          height: 'fit-content',
          title: this.name,
          content: this.url
        }
      }
    })
    .afterClosed()
    .subscribe();
  }

  onImageLoaded() {
    this.imageLoaded = true;
  }
}
