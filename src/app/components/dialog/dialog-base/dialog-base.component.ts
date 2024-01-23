import { Component, Inject } from '@angular/core';
import {DialogRef} from "../../../services/dialog/dialog-ref";
import {DIALOG_DATA} from "../../../services/dialog/dialog-tokens";
import {NgStyle} from "@angular/common";

export interface DialogConfig {
  containerStyles?: { [klass: string]: any },
  titleStyles?: { [klass: string]: any },
  contentStyles?: { [klass: string]: any },
  actionsStyles?: { [klass: string]: any },
  title?: string;
  content?: string;
  buttonType?: "normal" | "danger" | "primary" | "secondary" | "green";
  negativeButton?: string;
  positiveButton?: string;
  contentViewer?: {
    contentType?: string;
    contentId?: string;
  };
}

@Component({
  selector: 'ep-dialog-base',
  templateUrl: './dialog-base.component.html',
  styleUrls: ['./dialog-base.component.scss'],
  imports: [
    NgStyle
  ],
  standalone: true
})
export class DialogBaseComponent {

  constructor(
    protected dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: { config?: DialogConfig } & any
  ) {
  }

  close($event?: any) {
    const result = $event || null;
    this.dialogRef.close(result);
  }
}
