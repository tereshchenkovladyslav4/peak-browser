import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError, map, shareReplay, startWith, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LanguageSetResponse } from "../resources/models/language";
import { LocalStorageService } from './storage/services/local-storage.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  dataLoaded: boolean = false;
  data: Object;
  translationDataChangeTrigger$ = new Subject<void>()
  translationData$: Observable<Object> = this.translationDataChangeTrigger$.pipe(
    map(() => {
      if (!this.dataLoaded) {      
        let v_SessionData = this.localStorage.getItem<Object[]>("translationDataPeak");
        if (v_SessionData != null) {
          this.data = v_SessionData;
          this.dataLoaded = true;
        }
      }
      return this.data;
    }),
    shareReplay(1),
    startWith(this.localStorage.getItem<Object[]>("translationDataPeak"))
  )

  constructor(
      private http: HttpClient, 
      private router: Router,
      private localStorage: LocalStorageService
  ) { }

  // error handler
  private errorHandler(response: any) {
    const error = response.error;
    const keys = Object.keys(error);
    const key = keys[0];
    let message = error[key];
    if (response.status === 401) {
        this.router.navigate(['/login']);
    }
    if (error[key] instanceof Array) {
        message = error[key][0];
    }
    return throwError({ messages: message, error });
  }

  getTranslationFileData(key: string) {
    if (this.dataLoaded == true) {
      try {
        return this.data[key];
      } catch (err) {
        console.log(err);
        return "FAIL";
      }
    } else {
      let v_SessionData = this.localStorage.getItem<Object[]>("translationDataPeak");
      if (v_SessionData != null) {
        this.data = v_SessionData;
        this.dataLoaded = true;
        return this.data[key];
      }
    }
  }

  loadTranslationDataFromText(p_Text: string) {
      console.log("Translation Data");
      console.log(p_Text);

      var v_Data = JSON.parse(p_Text) as Object[];
      this.data = this.flattenJSONFile(v_Data);
      this.localStorage.setItem("translationDataPeak", this.data);
      this.dataLoaded = true;
  }

  loadTranslationFileData(languageCode:string) {
    this.loadTranslationFile(languageCode).subscribe({
      next: res => {
        if (res != null) {
          this.loadTranslationFileDataFromVariable(res);
        } else {
          this.loadTranslationFileLocal().subscribe(local => {
              this.loadTranslationFileDataFromVariable(local);
          }, localerr => {
              console.log(localerr);
          });
        }
      },
      error: err => {
        console.log(err);
        this.loadTranslationFileLocal().subscribe({
          next: local => this.loadTranslationFileDataFromVariable(local),
          error: localerr => console.log(localerr),
        });
      },
    });
  }

  loadTranslationFileDataFromVariable(passedData: Object[]) {
      if (passedData != null) {
        this.data = this.flattenJSONFile(passedData);
        this.dataLoaded = true;
        this.localStorage.setItem("translationDataPeak", this.data);
      } else {
        this.loadTranslationFileLocal().subscribe(res => this.loadTranslationFileDataFromVariable(res));
    }
    this.translationDataChangeTrigger$.next();
  }

  private loadTranslationFileLocal(): Observable<Array<Object>> {
      let v_Headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      let v_TranslationData = this.http.get("./assets/translate.en.json?" + Date.now().toString(), { headers: v_Headers })
        .pipe(catchError(this.errorHandler.bind(this)));
      return v_TranslationData;
  }

  loadTranslationFile(languageCode: string): Observable<Array<Object>> {
      if ((window.location.href.includes("prodgenbrowser-p1-2022") ||
        window.location.href.includes("portalbeta") ||
        window.location.href.includes("prodgenbrowser-pw") ||
        window.location.href.includes("localhost")) && languageCode == "en") {
        return this.loadTranslationFileLocal();
      }

      const headers = {
        apiKey: environment.apiKey,
        'Content-Type': 'application/json'
      };
      return this.http
        .get<any>(
        `${environment.apiUrlV2}/translation/browserFile?fileType=2&languageCode=${languageCode}`,
            { headers }
        )
        .pipe(catchError(this.errorHandler.bind(this)));
  }

  private flattenJSONFile(origin: Object[]): Object {
    let v_Array = {};
    for (let key of Object.keys(origin)) {
      var val = origin[key];
      var subKeys = Object.keys(val);
      if (subKeys.length > 0) {
        for (let subKey of subKeys) {
          let fullKey = `${key}.${subKey}`;
          v_Array[fullKey] = val[subKey];
        }
      }
      else {
        v_Array[key] = val;
      }
    }
    return v_Array;
  }


  getLanguages(): Observable<LanguageSetResponse> {
    const v_Headers = {
      apiKey: environment.apiKey,
      'Content-Type': 'application/json'
    };

    let v_Collection = this.http.get(`${environment.apiUrlV2}/translation/languages`, { headers: v_Headers })
      .pipe(catchError(this.errorHandler.bind(this)));
    return v_Collection;
  }

  getLanguagePreference(): Observable<string> {
    const v_Headers = {
        apiKey: environment.apiKey,
        'Content-Type': 'application/json'
    };

    let v_Language = this.http.get(`${environment.apiUrlV2}/users/languagePreference`, { headers: v_Headers }).pipe(catchError(this.errorHandler.bind(this)));
    return v_Language;
  }
}
