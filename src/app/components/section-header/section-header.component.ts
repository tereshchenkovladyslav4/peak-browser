import { Component, Input } from '@angular/core';
import { map, Observable } from 'rxjs';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'ep-section-header',
  templateUrl: './section-header.component.html',
  styleUrls: ['./section-header.component.scss']
})
export class SectionHeaderComponent {
  @Input() sectionTitle: string = "";
  @Input() fontSize: number = 20;
  @Input() hasBorderBottom: boolean = true;
  @Input() borderColor: string = "D7DADF";

  //padding between sectionTitle and border bottom
  @Input() paddingBetween: number = 15;

  constructor() { }

}
