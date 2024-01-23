import { Component, Input } from '@angular/core';

@Component({
  selector: 'ep-bookmark-card-icon',
  templateUrl: './bookmark-card-icon.component.html',
  styleUrls: ['./bookmark-card-icon.component.scss'],
  standalone: true
})
export class BookmarkCardIconComponent {
  @Input() isWhite = true;

}
