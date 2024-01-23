import { Component, OnInit, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { isNullOrUndefined } from 'util';

@Component({
    selector: 'ep-star-rating-input-field',
    templateUrl: './star-rating-input-field.component.html',
    styleUrls: ['./star-rating-input-field.component.scss'],
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: StarRatingInputFieldComponent,
            multi: true
        }
    ]
})
export class StarRatingInputFieldComponent implements OnInit, ControlValueAccessor {

    @Input() placeholder: string = '';

    @Input() disabled: boolean = false;

    private val: number = 0;
    set value(val: number) {
        if (isNullOrUndefined(val)) {
            val = 0;
        }

        //We do not allow zero as a valid rating.
        //Zero utltimately means "No rating selected".
        //So, we send null.
        if (val === 0) {
            this.onChange(null);
        } else {
            this.onChange(val);
        }

        this.val = val;
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

    onRatingChanged(newRatingValue: number): void {
        this.writeValue(newRatingValue);
    }
}
