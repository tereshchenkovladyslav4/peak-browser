import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NAVIGATION_ROUTES } from '../../../../resources/constants/app-routes';
import { DropdownMenuService } from '../../../../services/dropdown-menu.service';
import { Document } from '../../../../resources/models/content';
import { WithDropdownItemsTempCache } from '../../../../resources/mixins/dropdown-items-temp-cache.mixin';

@Component({
  selector: 'ep-my-document-menu',
  templateUrl: './my-document-menu.component.html',
  styleUrls: ['./my-document-menu.component.scss'],
})
export class MyDocumentMenuComponent extends WithDropdownItemsTempCache() implements OnInit {
  @Input() document: Document;
  dropdownItems: any = [];

  constructor(
    private router: Router,
    private dropdownMenuService: DropdownMenuService,
  ) {
    super();
  }

  ngOnInit() {
    this.dropdownItems = this.getDropdownItems(null);
  }

  protected override constructDropdownItems() {
    return this.dropdownMenuService.addView({ action: () => this.goToDocumentView() }).getItems();
  }

  goToDocumentView() {
    this.router.navigate([NAVIGATION_ROUTES.content, this.document.id]);
  }
}
