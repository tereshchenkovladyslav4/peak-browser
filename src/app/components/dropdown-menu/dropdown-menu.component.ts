import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownItem } from 'src/app/resources/models/dropdown-item';
import { DropdownMenuService } from '../../services/dropdown-menu.service';
import { UserProfileMenuComponent } from '../user-profile-menu/user-profile-menu.component';
import { MenuModule } from 'primeng/menu';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SharedModule } from 'primeng/api';

@Component({
  selector: 'ep-dropdown-menu',
  standalone: true,
  imports: [CommonModule, UserProfileMenuComponent, MenuModule, OverlayPanelModule, SharedModule],
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.scss'],
})
export class DropdownMenuComponent implements OnInit {
  @Input() dropdownItems: DropdownItem[];
  @Input() activationElement: ElementRef;
  @Input() isLegacy = true;
  @Output() onClickedOut: EventEmitter<any> = new EventEmitter();

  isOpen: boolean = false;
  initialOpen: boolean = false;
  isSubMenuOpen: boolean = false;

  constructor(
    private elRef: ElementRef,
    private dropdownService: DropdownMenuService,
  ) {}

  ngOnInit(): void {
    this.isOpen = true;
    this.initialOpen = true;
    this.elRef.nativeElement.addEventListener('pointerleave', (event) => {
      if (!this.isSubMenuOpen) {
        this.closeMenu();
      }
    });
  }

  closeMenu() {
    this.onClickedOut.emit();
    this.isOpen = false;
    this.dropdownService.updateDropdownOpenStatus(false);
  }

  @HostListener('document:click', ['$event'])
  clickOut(event) {
    // avoid running this function on the first clickOut as it will cancel the opening of the dropdown menu
    if (this.initialOpen && this.isLegacy) {
      this.initialOpen = false;
      return;
    }

    // close this dropdown menu if user clicked any element outside of this ep-dropdown-menu
    if (
      !this.elRef.nativeElement.contains(event.target) &&
      !this.activationElement?.nativeElement.contains(event.target) &&
      event.target.tagName.toLowerCase() !== 'body'
    ) {
      this.closeMenu();
    }
  }

  dropdownItemAction(action) {
    this.closeMenu();
    action();
  }

  handleShowSubmenu() {
    this.isSubMenuOpen = true;
  }

  subMenuAction(action) {
    this.closeMenu();
    action();
  }
}
