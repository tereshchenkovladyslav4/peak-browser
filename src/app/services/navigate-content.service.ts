import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { ContentTypesService } from './content-types.service';

@Injectable({
    providedIn: "root",
})

export class NavigateContentService {
    constructor(
        private router: Router,
        private contentTypesService: ContentTypesService

    ) { }

    viewContent(element: any) {
        // let url = this.contentTypesService.getContentTypeManageContentViewURL(element.type) todo update this
      let url;
        this.redirectTo(url, element.id)
    }

    private redirectTo(uri: string, id: string) {
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
            this.router.navigate([uri, id]));
    }
}
