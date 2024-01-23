import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageModuleConfig } from './interfaces/storage-module-config.interface';
import { STORAGE_KEY_PREFIX } from './tokens/storage-key-prefix.token';
import { WINDOW } from './tokens/window.token';

@NgModule({
  imports: [CommonModule],
})
export class StorageModule {
  static forRoot(
    config: StorageModuleConfig
  ): ModuleWithProviders<StorageModule> {
    return {
      ngModule: StorageModule,
      providers: [
        {
          provide: WINDOW,
          useFactory: () => window,
        },
        {
          provide: STORAGE_KEY_PREFIX,
          useValue: config.prefix || '',
        },
      ],
    };
  }
}