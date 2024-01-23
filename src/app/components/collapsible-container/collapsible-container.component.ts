import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'ep-collapsible-container',
  templateUrl: './collapsible-container.component.html',
  styleUrls: ['./collapsible-container.component.scss'],
  standalone: true,
  imports: [
    CommonModule
    ]
})
export class CollapsibleContainerComponent {
  isContainerExpanded: boolean = false;

  onChevronToggle(): void {
    this.isContainerExpanded = !this.isContainerExpanded;
  }
}
