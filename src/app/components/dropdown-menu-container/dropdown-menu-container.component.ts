import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, Output } from '@angular/core';
import { DropdownItem } from '../../resources/models/dropdown-item';
import { ContentType } from '../../resources/models/content';
import { DropdownMenuComponent } from '../dropdown-menu/dropdown-menu.component';
import { AsyncPipe, DOCUMENT, NgIf, NgStyle } from '@angular/common';
import { DropdownMenuService } from '../../services/dropdown-menu.service';
import { takeWhile } from 'rxjs';
import { CONSTANTS } from '../../config/constants';
import { OverlayPanelModule } from 'primeng/overlaypanel';

@Component({
  selector: 'ep-dropdown-menu-container',
  templateUrl: './dropdown-menu-container.component.html',
  styleUrls: ['./dropdown-menu-container.component.scss'],
  imports: [DropdownMenuComponent, NgIf, NgStyle, AsyncPipe, OverlayPanelModule],
  standalone: true,
})
export class DropdownMenuContainerComponent {
  @Input() id: string;
  @Input() contentType: ContentType;
  @Input() dropdownItems: DropdownItem[];
  @Input() isTransparent = false;
  @Input() enableBoxShadow = true;
  @Input() enableBgColor = true;
  @Input() showCustomTrigger = false;

  @Output() statusEmitter: EventEmitter<any> = new EventEmitter<any>();

  isOpen = false;

  constructor(
    public elRef: ElementRef,
    private cdRef: ChangeDetectorRef,
    private dropdownService: DropdownMenuService,
    @Inject(DOCUMENT) private doc,
  ) {}

  dropdownMenuClick(event: MouseEvent) {
    // TODO - uncomment after intial release of peak
    // this allows ellipsis view action on courses to properly navigate user to the course's page as opposed to the LP's page
    // if (contentType === ContentType.LearningPath || contentType === ContentType.Course) {
    //   this.updateDropdownItem('View', () => this.navigateToContent(contentId));
    // }

    // this stops propogation to parent but still fires click event in document
    event.stopPropagation();
    // Close other dropdown menus
    this.doc.querySelector('body').click();

    if (this.isOpen) {
      setTimeout(() => {
        this.closeDropdownMenu();
      });
    } else {
      setTimeout(() => {
        // Should be called once another dropdown is closed
        this.openDropdownMenu(event);
      });
    }
  }

  openDropdownMenu(event: MouseEvent) {
    event.stopPropagation();

    this.statusEmitter.emit(true);

    this.dropdownService.updateDropdownOpenStatus(true);

    this.dropdownService.isOpen$.pipe(takeWhile((isOpen) => isOpen, true)).subscribe((isOpen) => {
      if (!isOpen) {
        this.closeDropdownMenu();
      }
    });

    this.isOpen = true;
    this.cdRef.detectChanges();
  }

  closeDropdownMenu() {
    this.doc.querySelector('body').click();
    this.statusEmitter.emit(false);
    this.isOpen = false;
  }
}
