import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { DialogBaseComponent, DialogConfig } from '../dialog-base/dialog-base.component';
import { DIALOG_DATA } from 'src/app/services/dialog/dialog-tokens';
import { DialogRef } from 'src/app/services/dialog/dialog-ref';
import { ExpandableImageComponent } from '../../expandable-image/expandable-image.component';
import { EnrollmentService } from 'src/app/services/enrollment.service';
import { Observable, Subject, map, tap } from 'rxjs';
import { Certificate } from 'src/app/resources/models/certificate';
import { AsyncPipe, I18nPluralPipe, NgIf } from '@angular/common';
import { LoadingComponent } from '../../loading/loading.component';
import { UserStateService } from 'src/app/state/user/user-state.service';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { TranslatePipe } from 'src/app/pipes/translate.pipe';
import { DownloadService } from '../../../services/download/download.service';

@Component({
  selector: 'ep-view-certificate',
  standalone: true,
  imports: [
    DialogBaseComponent,
    ExpandableImageComponent,
    LoadingComponent,
    SharedModule,
    NgIf,
    AsyncPipe,
    SharedModule,
  ],
  templateUrl: './view-certificate.component.html',
  styleUrls: ['./view-certificate.component.scss'],
})
export class ViewCertificateComponent extends DialogBaseComponent implements OnInit {
  certificate$: Observable<Certificate>;
  userDisplayName$: Observable<string>;
  isLoaded$ = new Subject<boolean>();

  constructor(
    protected override dialogRef: DialogRef,
    @Inject(DIALOG_DATA)
    public override data: {
      config?: DialogConfig;
      enrollId: string;
      courseId: string;
    } & any,
    private enrollmentService: EnrollmentService,
    private userState: UserStateService,
    private downloadService: DownloadService,
  ) {
    super(dialogRef, data);
  }

  ngOnInit(): void {
    this.certificate$ = this.enrollmentService
      .getCertificate(this.data.enrollId, this.data.courseId)
      .pipe(tap((_) => this.isLoaded$.next(true)));

    this.userDisplayName$ = this.userState.currentUser.pipe(map((user) => user?.displayName.split(' ')[0] ?? ''));
  }

  downloadCertificate(link: string) {
    this.downloadService.download(link).subscribe();
  }
}
