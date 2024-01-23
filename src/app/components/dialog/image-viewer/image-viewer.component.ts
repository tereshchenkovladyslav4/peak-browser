import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogBaseComponent, DialogConfig } from '../dialog-base/dialog-base.component';
import { DialogRef } from 'src/app/services/dialog/dialog-ref';
import { DIALOG_DATA } from 'src/app/services/dialog/dialog-tokens';

@Component({
  selector: 'ep-image-viewer',
  standalone: true,
  imports: [CommonModule, DialogBaseComponent],
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent extends DialogBaseComponent {
  constructor(
    protected override dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public override data: { config?: DialogConfig } & any
  ) {
    super(dialogRef, data)
  }
}
