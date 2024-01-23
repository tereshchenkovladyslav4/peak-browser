import { Component } from '@angular/core';
import {DialogBaseComponent} from "../dialog-base/dialog-base.component";
import {SharedModule} from "../../../modules/shared/shared.module";

@Component({
  selector: 'ep-flexible-friction',
  templateUrl: './flexible-friction.component.html',
  styleUrls: ['./flexible-friction.component.scss'],
  imports: [
    DialogBaseComponent,
    SharedModule
  ],
  standalone: true
})
export class FlexibleFrictionComponent extends DialogBaseComponent {
}
