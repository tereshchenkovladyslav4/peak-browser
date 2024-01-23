import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgClass, NgIf, NgStyle} from "@angular/common";
import {CONTENT_TYPE_DISPLAY_MAP, ContentTypeString} from "../../../../resources/models/filter/content-type-filter";


@Component({
  selector: 'ep-content-type-icon',
  templateUrl: './content-type-icon.component.html',
  styleUrls: ['./content-type-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    NgStyle,
    NgClass
  ]
})
export class ContentTypeIconComponent implements OnInit {

  @Input() contentType: ContentTypeString;
  @Input() isSelected = false;

  @Output() select: EventEmitter<any> = new EventEmitter<any>();

  displayType: {label: string, image: string};

  ngOnInit() {
    this.displayType = CONTENT_TYPE_DISPLAY_MAP[this.contentType];
  }

  onSelect() {
    this.isSelected = !this.isSelected;
    this.select.emit([this.contentType, this.isSelected]);
  }
}
