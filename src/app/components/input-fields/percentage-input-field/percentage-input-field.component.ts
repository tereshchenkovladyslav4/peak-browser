import { Component, OnInit, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
    selector: 'ep-percentage-input-field',
    templateUrl: './percentage-input-field.component.html',
    styleUrls: ['./percentage-input-field.component.scss'],
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: EpPercentageInputFieldComponent,
            multi: true
        }
    ]
})
export class EpPercentageInputFieldComponent implements OnInit, ControlValueAccessor {

    @Input() min: number = 0;
    @Input() max: number = 100;
    @Input() placeholder: string = '';

    @Input() disabled: boolean = false;

    private val: number = null;
    set value(val: number) {
        this.val = val;
        this.onChange(val);
        this.onTouched();
    }
    get value(): number {
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
    writeValue(value: number): void {
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

    validatePercentageInput(event: KeyboardEvent) {
        let valueBeforeNewInput: number = this.val;

        if (this.isInvalidNumberInput(event.keyCode) ||
            this.isNegativeSymbol(event.keyCode)) {
            event.preventDefault();
        }

        //don't allow more than one *LEADING* zeros.
        if (String(valueBeforeNewInput) == '0' &&
            event.key == '0') {
            event.preventDefault();
        }

        //If they enter '0'. They can't enter anything else.
        if (String(valueBeforeNewInput) == '0' &&
            this.isNumber(event.key)) {
            event.preventDefault();
        }

        if (Number(String(valueBeforeNewInput ? valueBeforeNewInput : '') + event.key) > 100 ||
            Number(String(valueBeforeNewInput ? valueBeforeNewInput : '') + event.key) < 0) {
            event.preventDefault();
        }
    }

    onPaste(event: ClipboardEvent) {
        event.preventDefault();
    }

    private isInvalidNumberInput(keyCode: number): boolean {
        if (keyCode === 101 || // 'e'
            keyCode === 69 || // 'E'
            keyCode === 43 || // '+'
            keyCode === 187 || // '+' Plus Sign
            keyCode === 189 || // '-' Minus Sign
            keyCode === 109 || // '-' Minus Sign
            keyCode === 107 || // '+' Plus Sign
            keyCode === 110 || // '.' Period
            keyCode === 190) { // '.' Period
            return true;
        }

        return false;
    }

    private isNegativeSymbol(keyCode: number): boolean {
        if (keyCode == 189 || // '-' MINUS
            keyCode == 109 || // '-' NumpadSubtract
            keyCode == 45) { // '-' Hyphen
            return true;
        }

        return false;
    }

    private isNumber(value: string | number): boolean {
        return (value != null &&
                value !== '' &&
                !isNaN(Number(value)));
    }
}
