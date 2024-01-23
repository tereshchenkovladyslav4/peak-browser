import {Component, Input, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'ep-content-footer-description',
  templateUrl: './content-footer-description.component.html',
  styleUrls: ['./content-footer-description.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ContentFooterDescriptionComponent {

  @Input() description: string;
}
