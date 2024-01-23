import { Component, OnInit, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';


@Component({
    selector: 'ep-number-input-field',
    templateUrl: './number-input-field.component.html',
    styleUrls: ['./number-input-field.component.scss'],
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: EpNumberInputField,
            multi: true
        }
    ]
})
export class EpNumberInputField implements OnInit, ControlValueAccessor {

    @Input() min: number = -2147483648;
    @Input() max: number = 2147483647;
    @Input() placeholder: string = '';

    @Input() disabled: boolean = false;

    val: number = null;
    set value(val) {
        this.val = val;
        this.onChange(val);
        this.onTouched();
    }

    onChange = (value) => { };
    onTouched = () => { };
    onValidatorChanged: any = () => { };

    constructor() {

    }

    ngOnInit() {

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
}
