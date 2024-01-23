import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyDocumentsRoutingModule } from './my-documents-routing.module';
import { DocumentsListComponent } from './pages/documents-list/documents-list.component';
import { MyDocumentsComponent } from './my-documents.component';
import { LoadingComponent } from '../../components/loading/loading.component';
import { SharedModule } from '../shared/shared.module';
import { TableModule } from 'primeng/table';
import { DropdownMenuContainerComponent } from '../../components/dropdown-menu-container/dropdown-menu-container.component';
import { MyDocumentMenuComponent } from './components/my-document-menu/my-document-menu.component';

@NgModule({
  declarations: [DocumentsListComponent, MyDocumentsComponent, MyDocumentMenuComponent],
  imports: [
    CommonModule,
    MyDocumentsRoutingModule,
    LoadingComponent,
    SharedModule,
    TableModule,
    DropdownMenuContainerComponent,
  ],
})
export class MyDocumentsModule {}
