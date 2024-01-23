import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Library} from "../../../../resources/models/library";
import {NgIf} from "@angular/common";
import {Router} from "@angular/router";
import {NAVIGATION_ROUTES} from "../../../../resources/constants/app-routes";
import { TextTruncateDirective } from 'src/app/directives/text-truncate.directive';

@Component({
  selector: 'ep-library-card',
  templateUrl: './library-card.component.html',
  styleUrls: ['./library-card.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    TextTruncateDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibraryCardComponent implements OnInit {
  @Input() library: Library;
  isNew = false;

  constructor(private router: Router) {
  }

  ngOnInit() {
    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));
    this.isNew = new Date(this.library.publishDate) > thirtyDaysAgo;
  }

  onLibraryClick() {
    this.router.navigate([NAVIGATION_ROUTES.libraries, this.library.libraryId]);
  }
}
