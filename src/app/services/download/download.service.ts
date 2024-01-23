import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, distinctUntilChanged, Observable, of, scan } from 'rxjs';
import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpProgressEvent,
  HttpResponse,
} from '@angular/common/http';
import { Download } from '../../resources/models/download/download.model';
import { ToastrService } from 'ngx-toastr';
import { Saver, SAVER } from './saver.provider';
import { trackFileName } from '../../resources/functions/track-file-name/track-file-name.util';
import { trackContentType } from '../../resources/functions/track-content-type/track-content-type.util';
import { DownloadState } from '../../resources/enums/download-state/download-state.enum';
import { TranslationService } from '../translation.service';

@Injectable({
  providedIn: 'root',
})
export class DownloadService {
  private uuid = 1;
  private readonly processesSubject = new BehaviorSubject<Download[]>([]);

  // Will be used to display pending processes
  get processes$(): Observable<Download[]> {
    return this.processesSubject.asObservable();
  }

  constructor(
    private http: HttpClient,
    @Inject(SAVER) private save: Saver,
    private toastrService: ToastrService,
    private translationService: TranslationService,
  ) {}

  addProcess(name: string) {
    const newProcess: Download = {
      content: null,
      progress: 0,
      state: DownloadState.PENDING,
      uuid: this.uuid++,
      name,
    };
    this.processesSubject.next(this.processesSubject.getValue().concat(newProcess));
    return newProcess.uuid;
  }

  download(url: string, filename?: string, contentType?: string): Observable<Download> {
    filename = filename || trackFileName(url);
    contentType = contentType || trackContentType(filename);
    const processId = this.addProcess(filename);
    const headers = {
      'Content-Type': contentType,
      Accept: contentType,
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      'Access-Control-Allow-Origin': window.location.origin,
      'Access-Control-Allow-Methods': 'GET, HEAD',
      'Access-Control-Allow-credentials': 'true',
      pragma: 'no-cache',
      'cache-control': 'no-cache',
    };
    return this.http
      .get(url, {
        headers: new HttpHeaders(headers),
        reportProgress: true,
        observe: 'events',
        responseType: 'blob',
      })
      .pipe(this.downloadAll((blob) => this.save(blob, filename), processId));
  }

  private isHttpResponse<T>(event: HttpEvent<T>): event is HttpResponse<T> {
    return event.type === HttpEventType.Response;
  }

  private isHttpProgressEvent(event: HttpEvent<unknown>): event is HttpProgressEvent {
    return event.type === HttpEventType.DownloadProgress || event.type === HttpEventType.UploadProgress;
  }

  private downloadAll(
    saver?: (b: Blob) => void,
    processId?: number,
  ): (source: Observable<HttpEvent<Blob>>) => Observable<Download> {
    return (source: Observable<HttpEvent<Blob>>) =>
      source.pipe(
        scan(
          (res: Download, event): Download => {
            const processes = this.processesSubject.getValue();
            const idx = this.processesSubject.getValue().findIndex((element) => element.uuid === processId);
            if (this.isHttpProgressEvent(event)) {
              const progress = event.total ? Math.round((100 * event.loaded) / event.total) : res.progress;
              if (idx > -1) {
                processes[idx].progress = progress;
                this.processesSubject.next(processes);
              }
              return {
                progress,
                state: DownloadState.IN_PROGRESS,
                content: null,
              };
            }
            if (this.isHttpResponse(event)) {
              if (saver) {
                saver(event.body);
              }
              if (idx > -1) {
                processes.splice(idx, 1);
                this.processesSubject.next(processes);
              }
              return {
                progress: 100,
                state: DownloadState.DONE,
                content: event.body,
              };
            }
            return res;
          },
          { state: DownloadState.PENDING, progress: 0, content: null },
        ),
        distinctUntilChanged((a, b) => a.state === b.state && a.progress === b.progress && a.content === b.content),
        catchError((_) => {
          const idx = this.processesSubject.getValue().findIndex((element) => element.uuid === processId);
          const processes = this.processesSubject.getValue();
          if (idx > -1) {
            processes.splice(idx, 1);
            this.processesSubject.next(processes);
            this.toastrService.error(this.translationService.getTranslationFileData('common.cannot-download'));
          }
          const value: Download = { state: DownloadState.PENDING, progress: 0, content: null };
          return of(value);
        }),
      );
  }
}
