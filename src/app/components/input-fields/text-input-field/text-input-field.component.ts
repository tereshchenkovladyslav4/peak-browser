import { Component, OnInit, Input } from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule} from '@angular/forms';
import {NgIf, NgStyle, NgSwitch, NgSwitchCase} from "@angular/common";

@Component({
  selector: 'ep-text-input-field',
  templateUrl: './text-input-field.component.html',
  styleUrls: ['./text-input-field.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    NgStyle,
    NgSwitchCase,
    NgSwitch,
    NgIf
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: EpTextInputFieldComponent,
      multi: true
    }
  ]
})
export class EpTextInputFieldComponent implements OnInit, ControlValueAccessor {

    @Input() placeholder: string = '';
    @Input() textInputType: 'ShortFormText' | 'LongFormText' = 'ShortFormText';
    @Input() disabled: boolean = false;

    private val: string = null;
    set value(val: string) {
        this.onChange(val);
        this.val = val;
        this.onTouched();
    }
    get value(): string {
        return this.val;
    }

    //These methods will notify the form control that
    //something has changed or happened internally here.
    onChange = (value) => { };
    onTouched = () => { };
    onValidatorChanged: any = () => { };

    constructor() {

    }

    ngOnInit(): void {

    }

    //ControlValueAccessor methods - start
    writeValue(value: string): void {
        this.value = value;
    }
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
    //ControlValueAccessor methods - end

    validatekeyDown(key: string) {
        if (!this.validCharacter(key)) {
            event.preventDefault();
        }
    }

    onPaste(event: ClipboardEvent, maxLength: number) {
        let clipboardData = event.clipboardData;
        let pastedText = clipboardData.getData('text');

        let pastedCharacters = Array.from(pastedText);

        if (pastedCharacters.length > 0) {
            for (var index = 0; index < pastedCharacters.length; index++) {
                if (!this.validCharacter(pastedCharacters[index])) {
                    event.preventDefault();
                }
            }

            if (pastedCharacters.length > maxLength) {
                event.preventDefault();
            }
        }
    }

    private validCharacter(char: string): boolean {
        //check for alphanumeric and special characters
        var regex = new RegExp(/[ A-Za-z0-9]/);
        let isAlphanumeric: boolean = regex.test(char);

        regex = new RegExp(/[`!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?~]/);
        let isSpecialCharacter: boolean = regex.test(char);

        return (isAlphanumeric || isSpecialCharacter);
    }
}
