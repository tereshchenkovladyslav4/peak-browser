import { Component, Input } from '@angular/core';

@Component({
  selector: 'ep-no-result',
  templateUrl: './no-result.component.html',
  styleUrls: ['./no-result.component.scss'],
  standalone: true,
})
export class NoResultComponent {
  @Input() title: string;
  @Input() subTitle: string;
}
