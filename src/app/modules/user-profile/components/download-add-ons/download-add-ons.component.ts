import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProdGenApi } from '../../../../services/apiService/prodgen.api';
import { DownloadService } from '../../../../services/download/download.service';
import { TranslationService } from '../../../../services/translation.service';

@Component({
  selector: 'ep-download-add-ons',
  templateUrl: './download-add-ons.component.html',
  styleUrls: ['./download-add-ons.component.scss'],
})
export class DownloadAddOnsComponent {
  recommendedAddons = [
    {
      name: 'add-ons.cmd-launcher-name',
      updateMsg: 'add-ons.cmd-launcher-update-msg',
      linkUrl: `https://pinnacle.blob.core.windows.net/web-portal/downloads/pinnacletools-pw.msi?${ProdGenApi.getSessionUnique()}`,
    },
  ];

  constructor(
    private downloadService: DownloadService,
    private toastr: ToastrService,
    private translationService: TranslationService,
  ) {}

  download(link: string) {
    this.downloadService.download(link).subscribe((res) => {
      if (res?.state === 'DONE') {
        this.toastr.success(this.translationService.getTranslationFileData('add-ons.cmd-launcher-downloaded'));
      }
    });
  }
}
