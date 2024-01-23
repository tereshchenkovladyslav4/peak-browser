import {Component, Input, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {NAVIGATION_ROUTES} from "../../../../../../resources/constants/app-routes";

@Component({
  selector: 'ep-content-footer-prerequisites',
  templateUrl: './content-footer-prerequisites.component.html',
  styleUrls: ['./content-footer-prerequisites.component.scss']
})
export class ContentFooterPrerequisitesComponent implements OnInit {
  @Input() prerequisites: any[];

  cardData;

  constructor(private router: Router) {
  }

  ngOnInit() {
    this.cardData = this.prerequisites.map(p => ({data: p}));
  }


  onCardClick(prerequisite: any) {
    this.router.navigate([NAVIGATION_ROUTES.content, prerequisite.data?.id])
  }
}
