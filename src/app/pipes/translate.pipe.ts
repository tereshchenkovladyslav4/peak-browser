import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from 'src/app/services/translation.service';

@Pipe({
    name: 'Translate', pure: false
})
export class TranslatePipe implements PipeTransform {

    constructor(private translationService: TranslationService) { }

    transform(key: string): string {
        if (!this.translationService) { return key; }
        return this.translationService.getTranslationFileData(key) ?? key;
    }
}
