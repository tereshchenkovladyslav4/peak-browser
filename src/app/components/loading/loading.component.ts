import {Component, Input} from '@angular/core';
import {AsyncPipe, CommonModule, NgIf} from "@angular/common";
import {SpinnerComponent} from "../spinner/spinner.component";

@Component({
  selector: 'ep-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  imports: [
    CommonModule,
    AsyncPipe,
    NgIf,
    SpinnerComponent
  ],
  standalone: true
})
export class LoadingComponent {
  @Input() isLoaded: boolean;
}
