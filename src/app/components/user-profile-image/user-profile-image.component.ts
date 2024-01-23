import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ep-user-profile-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile-image.component.html',
  styleUrls: ['./user-profile-image.component.scss']
})
export class UserProfileImageComponent implements OnChanges {
  @Input() userImageUrl: string;
  @Input() displayName: string;
  @Input() diameter: number;
  @Input() overlayActionImg: string;
  @Output() overlayActionFunc = new EventEmitter<any>();

  initials: string;
  
  ngOnChanges(changes: SimpleChanges): void {
    this.setInitials();
  }

  private setInitials() {
    const defaultUserInitial = 'U';

    this.initials = this.displayName?.replace(/[^a-zA-Z\s]/g, '')
      ?.match(/\b(\w)/g)
      ?.join('')
      ?.toUpperCase()
      ?.slice(0, 2) || defaultUserInitial;
  }

  executeOverlayAction(): void {
    this.overlayActionFunc.emit();
  }
}
