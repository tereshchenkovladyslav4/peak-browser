import {Component, Input} from '@angular/core';
import {Router} from "@angular/router";
import {NAVIGATION_ROUTES} from "../../../../../../resources/constants/app-routes";

@Component({
  selector: 'ep-content-footer-related-content',
  templateUrl: './content-footer-related-content.component.html',
  styleUrls: ['./content-footer-related-content.component.scss']
})
export class ContentFooterRelatedContentComponent {
  @Input() relatedContents: any[];

  cardData;

  constructor(private router: Router) {
  }

  ngOnInit() {
    this.cardData = this.relatedContents.map(r => ({data: r}));
  }


  onCardClick(relatedContent: any) {
    this.router.navigate([NAVIGATION_ROUTES.content, relatedContent.data?.id])
  }
}
