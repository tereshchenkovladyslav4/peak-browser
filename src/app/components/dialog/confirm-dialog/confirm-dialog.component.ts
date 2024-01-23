import { Component } from '@angular/core';
import { DialogBaseComponent } from '../dialog-base/dialog-base.component';
import { SharedModule } from 'src/app/modules/shared/shared.module';

@Component({
  selector: 'ep-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  standalone: true,
  imports: [DialogBaseComponent, SharedModule],
})
export class ConfirmDialogComponent extends DialogBaseComponent {}
