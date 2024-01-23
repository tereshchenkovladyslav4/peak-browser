import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { CdkPortal, PortalInjector } from '@angular/cdk/portal';
import { Injectable, Injector } from '@angular/core';


export class TemplateModalOverlayRef {

  constructor(private overlayRef: OverlayRef) { }

  close(): void {
    this.overlayRef.dispose();
  }
}

interface CustomOverlayConfig {
  hasBackdropClick?: boolean;
  isCentered?: boolean;
  size?: any;
  top?: string;
}

interface FormModalConfig {
  panelClass?: string;
  hasBackdrop?: boolean;
  backdropClass?: string;
}

const DEFAULT_CONFIG: FormModalConfig = {
  hasBackdrop: true,
  backdropClass: 'my-overlay-modal-template-backdrop',
  panelClass: 'my-modal-template-panel',

};
const DEFAULT_CUSTOM_CONFIG: CustomOverlayConfig = {
  hasBackdropClick: false,
  isCentered: true,
  size: null
};

@Injectable({
  providedIn: 'root'
})
export class TemplateModalService {
  public dialogRef: TemplateModalOverlayRef;
  public customConfig: CustomOverlayConfig;
  constructor(
    private injector: Injector,
    private overlay: Overlay
  ) { }

  open(templateRef: CdkPortal, config: FormModalConfig = {}, customConfig: CustomOverlayConfig = {}): TemplateModalOverlayRef {
    // Returns an OverlayRef (which is a PortalHost)
    this.customConfig = { ...DEFAULT_CUSTOM_CONFIG, ...customConfig };
    const modalConfig = { ...DEFAULT_CONFIG, ...config };
    const overlayRef = this.createOverlay(modalConfig);
    const dialogRef = new TemplateModalOverlayRef(overlayRef);

    const overlayComponent = this.attachModalContainer(overlayRef, modalConfig, dialogRef, templateRef);
    overlayRef.backdropClick().subscribe((_) => {
      if (this.customConfig.hasBackdropClick) {
        dialogRef.close();
      }
    });

    this.dialogRef = dialogRef;
    return dialogRef;
  }

  private attachModalContainer(
    overlayRef: OverlayRef,
    config: FormModalConfig,
    dialogRef: TemplateModalOverlayRef,
    templateRef: CdkPortal
  ) {
    const injector = this.createInjector(config, dialogRef);
    const containerRef = overlayRef.attach(templateRef);
    return containerRef;
  }

  private createInjector(config: FormModalConfig, dialogRef: TemplateModalOverlayRef): PortalInjector {
    const injectionTokens = new WeakMap();

    injectionTokens.set(TemplateModalOverlayRef, dialogRef);

    return new PortalInjector(this.injector, injectionTokens);
  }

  private getOverlayConfig(config: FormModalConfig): OverlayConfig {
    let positionStrategy = this.overlay.position()
      .global();

    if (this.customConfig.isCentered) {
      positionStrategy = positionStrategy
        .centerHorizontally()
        .centerVertically();
    }
    if (this.customConfig.size) {
      positionStrategy = positionStrategy
        .width(this.customConfig.size.width)
        .height(this.customConfig.size.height);
    }

    if (this.customConfig.top) {
      positionStrategy = positionStrategy
        .centerVertically('0px')
        .centerHorizontally('0px');
    }

    const overlayConfig = new OverlayConfig({
      hasBackdrop: config.hasBackdrop,
      backdropClass: config.backdropClass,
      panelClass: config.panelClass,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy
    });

    return overlayConfig;
  }

  private createOverlay(config: FormModalConfig) {
    // Returns an OverlayConfig
    const overlayConfig = this.getOverlayConfig(config);

    // Returns an OverlayRef
    return this.overlay.create(overlayConfig);
  }
}
