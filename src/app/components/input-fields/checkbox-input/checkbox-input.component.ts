import { Component, Input, Output, EventEmitter } from '@angular/core';
import {NgClass, NgIf} from "@angular/common";

@Component({
  selector: 'ep-checkbox-input',
  templateUrl: './checkbox-input.component.html',
  styleUrls: ['./checkbox-input.component.scss'],
  imports: [
    NgClass,
    NgIf
  ],
  standalone: true
})
export class EpCheckboxInputComponent {
    @Input() selected: boolean = false;
    @Input() disabled: boolean = false;

    @Output() selectedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor() { }

    clickedBox() {
        if (!this.disabled) {
            this.selected = !this.selected;
            this.selectedChange.emit(this.selected);
        }
    }
}
