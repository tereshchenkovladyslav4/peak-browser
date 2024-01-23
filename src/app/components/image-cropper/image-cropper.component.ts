import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TranslationService } from '../../services/translation.service';
import { StyleRenderer, WithStyles, lyl, ThemeRef, ThemeVariables } from '@alyle/ui';
import { LyDialog, LyDialogModule, LyDialogRef, LY_DIALOG_DATA } from '@alyle/ui/dialog';
import { LySliderChange, LySliderModule, STYLES as SLIDER_STYLES } from '@alyle/ui/slider';
import {
  STYLES as CROPPER_STYLES,
  LyImageCropper,
  ImgCropperConfig,
  ImgCropperEvent,
  ImgCropperErrorEvent,
  ImgCropperLoaderConfig,
  LyImageCropperModule,
} from '@alyle/ui/image-cropper';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../modules/shared/shared.module';
import { FormsModule } from '@angular/forms';

const STYLES = (_theme: ThemeVariables, ref: ThemeRef) => {
  ref.renderStyleSheet(SLIDER_STYLES);
  ref.renderStyleSheet(CROPPER_STYLES);
  const slider = ref.selectorsOf(SLIDER_STYLES);
  const cropper = ref.selectorsOf(CROPPER_STYLES);

  return {
    root: lyl`{
            ${cropper.root} {
                max-width: 565px
                height: 320px
            }
        }`,
    sliderContainer: lyl`{
            position: relative
            margin: 35px 0 60px 0 !important
            ${slider.root} {
                width: 80%
                position: absolute
                left: 0
                right: 0
                margin: 0px auto
                top: -32px
            }
        }`,
    slider: lyl`{
            // padding: 1em
        }`
  };
};

export class EpImageCropperConfig {

  // Only one image source should be selected: url or event
  url: string | null = null;
  event: Event | null = null;

  width: number;
  height: number;
  maxFileSize: number | null;
  showUploadButton: boolean = false;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  // Configuration

  setUrl(url: string): EpImageCropperConfig {
    this.url = url;
    this.event = null;
    return this;
  }

  setEvent(event: Event): EpImageCropperConfig {
    this.url = null;
    this.event = event;
    return this;
  }

  setMaxFileSize(maxFileSize: number): EpImageCropperConfig {
    this.maxFileSize = maxFileSize;
    return this;
  }

  setShowUploadButton(showUploadButton: boolean): EpImageCropperConfig {
    this.showUploadButton = showUploadButton;
    return this;
  }

  // Loader Helper

  loadIntoCropper(cropper: LyImageCropper): boolean {
    if (this.event !== null) {
      cropper.selectInputEvent(this.event);
      return true;
    } else if (this.url !== null && this.url.trim() !== '') {
      const config: ImgCropperLoaderConfig = {
        width: this.width,
        height: this.height,
        originalDataURL: this.url,
        name: this.url?.split('?')[0]
      };
      cropper.loadImage(config);
      return true;
    } else {
      return false;
    }
  }
}

export class EpImageCropperResult {
  newUrl: string;
  newFile: File;
  constructor(url: string, file: File) {
    this.newUrl = url;
    this.newFile = file;
  }
  fileExtensionIn(...extensions: Array<string>): boolean {
    return extensions.map(extension => extension.toLocaleLowerCase()).includes(this.newFile.name.split('.').pop().toString().toLocaleLowerCase());
  }
}


@Component({
  selector: 'ep-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    StyleRenderer
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    LyImageCropperModule,
    LySliderModule,
    LyDialogModule
    ]
  
})
export class ImageCropperComponent implements WithStyles, AfterViewInit {
  @ViewChild(LyImageCropper, { static: true }) cropper: LyImageCropper;
  @ViewChild('_fileInput') fileInput: ElementRef;
  
  readonly classes = this.sRenderer.renderSheet(STYLES, 'root');
  myConfig: ImgCropperConfig;
  ready: boolean = false;
  scale: number;
  minScale: number;
  maxScale: number;

  cropperConfig: EpImageCropperConfig;
  scaleChangeEnabled: boolean = true;

  constructor(
    @Inject(LY_DIALOG_DATA) public data: EpImageCropperConfig,
    readonly sRenderer: StyleRenderer,
    public dialogRef: LyDialogRef,
    private toastr: ToastrService,
    private translate: TranslationService
  ) {

    this.cropperConfig = data;
    this.myConfig = {
      width: data.width,
      height: data.height,
      keepAspectRatio: true,
      responsiveArea: true,
      maxFileSize: data.maxFileSize,
      output: {
        width: data.width,
        height: data.height
      }
    };
  }

  // Cropper Loading

  ngAfterViewInit(): void {
    this.dialogRef.afterOpened.subscribe(() => {
      if (!this.cropperConfig.loadIntoCropper(this.cropper)) { // Load the event or url that was passed in
        this.openFileChooser();  // If there was no event or url passed in, have the user choose a file
      }
    });
  }

  openFileChooser() {
    this.fileInput.nativeElement.click();
  }

  onNewFileChosen(e: Event) {
    this.cropperConfig.setEvent(e);
    this.cropperConfig.loadIntoCropper(this.cropper);
  }

  // Cropper Cropping and Zooming

  onLoaded(e: ImgCropperEvent) {
    this.scaleChangeEnabled = this.minScale < this.maxScale;
  }
  onCropped(e: ImgCropperEvent) { }

  onSliderInput(event: LySliderChange) {
    this.scale = event.value as number;
  }

  // Cropper Closing

  onError(e: ImgCropperErrorEvent) {
    if (e.size > this.cropperConfig.maxFileSize) {
      this.toastr.error(this.translate.getTranslationFileData('cropper-component.photo-too-large-error-message') + this.displayFileSize(this.cropperConfig.maxFileSize));
    }
    this.dialogRef.close();
  }

  displayFileSize(fileSizeInBytes: number) {
    const kb = 1024;
    const mb = 1024 * 1024;
    const gb = 1024 * 1024 * 1024;
    if (fileSizeInBytes < kb) {
      return `${fileSizeInBytes}b.`;
    } else if (fileSizeInBytes < mb) {
      return `${fileSizeInBytes / kb}kb.`;
    } else if (fileSizeInBytes < gb) {
      return `${fileSizeInBytes / mb}mb.`;
    } else {
      return `${fileSizeInBytes / gb}gb.`;
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    this.dialogRef.close(this.getResult());
  }

  getResult(): EpImageCropperResult {
    const imageCroppedEvent: ImgCropperEvent = this.cropper.crop();
    var arr = imageCroppedEvent.dataURL.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new EpImageCropperResult(imageCroppedEvent.dataURL, new File([u8arr], imageCroppedEvent.name.split('?')[0], { type: mime }));
  }

}
