import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, concatMap, forkJoin, map, Observable, of, Subject, take, tap } from 'rxjs';
import { TenantSettingType } from '../../../../resources/enums/tenant-setting-type.enum';
import { Language } from '../../../../services/apiService/classFiles/class.authorization';
import { SettingType_T } from '../../../../services/apiService/classFiles/class.users';
import { TenantSetting } from '../../../../services/apiService/classFiles/v2-organizations';
import { ProdGenApi } from '../../../../services/apiService/prodgen.api';
import { LocalStorageService } from '../../../../services/storage/services/local-storage.service';
import { TranslationService } from '../../../../services/translation.service';

@Component({
  selector: 'ep-update-language-section',
  templateUrl: './update-language-section.component.html',
  styleUrls: ['./update-language-section.component.scss']
})
export class UpdateLanguageSectionComponent implements OnInit {  
  languageNames: Array<string> = [];
  languageMap: Map<string, string>;
  dropdownStyles: { [klass: string]: any };
  selectedLanguage: string;
  isLoading: boolean = false;

  constructor(private translate: TranslationService,
              private prodGenService: ProdGenApi) { }

  ngOnInit() {
    this.isLoading = true;
    const languages$: Observable<Language[]> = this.prodGenService.getLanguages();
    languages$.subscribe({
      next: (languages: Language[]) => {
        this.languageMap = new Map<string, string>(languages.map(language => ([language.languageName, language.languageCode])));
        this.selectedLanguage = languages.find(lang => lang.languageCode === this.prodGenService.getCurrentLanguage())?.languageName;
        this.languageNames = languages.map(language => language.languageName);
        this.dropdownStyles = {
          'width': '100%',
          'height': '58px'
        };

        this.isLoading = false;
      }
    })
  }

  applyLanguage() {
    //change language name back to language code
    const languageCode = this.languageMap.get(this.selectedLanguage);

    this.prodGenService.saveCurrentUserSetting("LanguagePreference", languageCode, SettingType_T.string)
      .subscribe(() => {
        this.prodGenService.setCurrentLanguage(languageCode);
        this.translate.loadTranslationFileData(languageCode);
      })

  }

}
