import { Component } from '@angular/core';
import { DialogBaseComponent } from '../dialog-base/dialog-base.component';
import { SharedModule } from 'src/app/modules/shared/shared.module';

@Component({
  selector: 'ep-information-dialog',
  templateUrl: './information-dialog.component.html',
  styleUrls: ['./information-dialog.component.scss'],
  standalone: true,
  imports: [DialogBaseComponent, SharedModule],
})
export class InformationDialogComponent extends DialogBaseComponent {}
