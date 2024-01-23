import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyDocumentsComponent } from './my-documents.component';
import { DocumentsListComponent } from './pages/documents-list/documents-list.component';
import { NAVIGATION_ROUTES, ROUTE_TITLES } from '../../resources/constants/app-routes';

const routes: Routes = [
  {
    path: '',
    component: MyDocumentsComponent,
    children: [
      {
        path: '',
        component: DocumentsListComponent,
        pathMatch: 'full',
        title: ROUTE_TITLES[NAVIGATION_ROUTES.myDocuments],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyDocumentsRoutingModule {}
