import { CommonModule } from '@angular/common';
import { OnInit, Component, Input, EventEmitter, Output, HostListener, ViewChild, ElementRef, Renderer2, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SharedModule } from '../../modules/shared/shared.module';
import { TranslationService } from '../../services/translation.service';


@Component({
  selector: 'app-select-dropdown',
  templateUrl: './select-dropdown.component.html',
  styleUrls: ['./select-dropdown.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule
    ]
})
export class SelectDropdownComponent {
  @ViewChild('dropdownWrapper') dropdownWrapper: ElementRef;
  @Input() heading: string;
  @Input() options: Array<string>;
  @Input() dropdownStyles?: { [klass: string]: any };
  @Input() selectedOption: string;
  @Output() onOptionChange = new EventEmitter<string>();

  isMenuOpen: boolean = false;

  constructor() {
  }

  toggleOpenMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  selectOption(option: string) {
    this.selectedOption = option;
    this.toggleOpenMenu();
    this.onOptionChange.emit(option);
  }

  @HostListener('document:click', ['$event'])
  onClickEvent(event) {
    if (!this.dropdownWrapper?.nativeElement.contains(event.target)) {
      this.isMenuOpen = false;
    }
  }

}
