import {Injectable} from "@angular/core";
import {DropdownItem} from "../resources/models/dropdown-item";
import {TranslationService} from "./translation.service";
import {Router} from "@angular/router";
import {NAVIGATION_ROUTES} from "../resources/constants/app-routes";
import {BehaviorSubject, take} from "rxjs";
import { BookmarksService } from "./bookmarks/bookmarks.service";


export interface DropdownConfig {
  items: any;
  styles: {
    top: string;
    left?: string;
    right?: string;
  };
}

/**
 * Class/Service that
 */
@Injectable({
  providedIn: 'root'
})
export class DropdownMenuService {
  menuItems: DropdownItem[] = []
  isOpen$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private translationService: TranslationService,
    private router: Router,
    private bookmarksService: BookmarksService
  ) { }

  updateDropdownOpenStatus(isOpen: boolean) {
    this.isOpen$.next(isOpen)
  }

  // -- Utility functions

  /**
   * Function to be called at the end of every building chain
   * @returns the crafted array of DropdownItems
   */
  getItems(): DropdownItem[] {
    // since DropdownMenuService is a singleton registered to Angulars DI system...we want to return a copy of the
    // menuItems and clear the array since it will used every time the service is called
    const copy = [...this.menuItems];
    this.menuItems = [];
    return copy;
  }

  addCustomItem(item: DropdownItem): DropdownMenuService {
    this.menuItems.push(item);
    return this;
  }

  addDivider(): DropdownMenuService {
    this.menuItems.push({
      iconUrl: 'hr',
      text: '',
      visible: true,
      action: () => { }
    });
    return this;
  }

  // -- Preset menus

  buildShareMenu(): DropdownItem[] {
    //return this.addShareNotification({})
    //  .addShareWorkGroup({})
      return this.addCopyLinkFormatted({})
      .addCopyLinkUnformatted({})
      .getItems();
  }

  // -- Main builder functions

  addEnroll({visible = true, action = () => console.log('Enroll')}): DropdownMenuService {
    this.menuItems.push({
      iconUrl: 'assets/images/clipboard-check-grey.svg',
      text: this.translationService.getTranslationFileData('learning-path-view.enroll'),
      visible: visible,
      action: action
    });
    return this;
  }

  addStart({visible = true, action = () => console.log('Start')}): DropdownMenuService {
    this.menuItems.push({
      iconUrl: 'assets/images/dropdown-menu-icons/start.svg',
      text: this.translationService.getTranslationFileData('learning-path-view.start'),
      visible: visible,
      action: action
    });
    return this;
  }

  addResume({visible = true, action = () => console.log('Resume')}): DropdownMenuService {
    this.menuItems.push({
      iconUrl: 'assets/images/dropdown-menu-icons/refresh.svg',
      text: this.translationService.getTranslationFileData('common.resume'),
      visible: visible,
      action: action
    });
    return this;
  }

  addMarkAsCompleted({visible = true, action = () => console.log('Mark as Completed')}): DropdownMenuService {
    this.menuItems.push({
      iconUrl: 'assets/images/circle-check.svg',
      text: 'Mark as Completed',
      visible: visible,
      action: action
    });
    return this;
  }

  addChangeDueDate({visible = true, action = () => console.log('Change Due Date')}): DropdownMenuService {
    this.menuItems.push({
      iconUrl: 'assets/images/calendar-dark.svg',
      text: this.translationService.getTranslationFileData('assignments.change-due-date'),
      visible: visible,
      action: action
    });
    return this;
  }

  addView({visible = true, action = () => console.log('View')}): DropdownMenuService {
    this.menuItems.push({
      iconUrl: 'assets/images/dropdown-menu-icons/view-eye.svg',
      text: this.translationService.getTranslationFileData('common.view'),
      visible: visible,
      action: action
    });
    return this;
  }

  addBookmarkItem(isBookmarked: boolean, contentId: string) {
    const menuItem: DropdownItem = {
      iconUrl: 'assets/images/dropdown-menu-icons/bookmark-hollow.svg',
      text: this.translationService.getTranslationFileData('dropdown-menu.add-to-bookmarks'),
      visible: true,
      action: () => {
        let currentlyBookmarked = false;
        // this isn't great, but we will use the image to determine current bookmark status
        if (menuItem.iconUrl.indexOf("filled") > 0) {
          currentlyBookmarked = true;
        }
        if (currentlyBookmarked) {
          // removing the bookmark
          menuItem.iconUrl = 'assets/images/dropdown-menu-icons/bookmark-hollow.svg';
          menuItem.text = this.translationService.getTranslationFileData('dropdown-menu.add-to-bookmarks');

          this.bookmarksService
            .removeBookmark(contentId)
            .pipe(
              take(1)
            )
            .subscribe();
        }
        else {
          // creating the bookmark
          menuItem.iconUrl = 'assets/images/dropdown-menu-icons/bookmark-filled.svg';
          menuItem.text = this.translationService.getTranslationFileData('dropdown-menu.remove-from-bookmarks');

          this.bookmarksService
            .createBookmark(contentId)
            .pipe(
              take(1)
            )
            .subscribe();


        }

      }
    }

    if (isBookmarked) {
      menuItem.iconUrl = 'assets/images/dropdown-menu-icons/bookmark-filled.svg';
      menuItem.text = this.translationService.getTranslationFileData('dropdown-menu.remove-from-bookmarks');
    }

    this.menuItems.push(menuItem);

    return this;
  }


  //addShareNotification({visible = true, action = () => console.log('Share via Notification')}): DropdownMenuService {
  //  this.menuItems.push({
  //    iconUrl: 'assets/images/dropdown-menu-icons/bell-hollow.svg',
  //    text: 'Share via Notification',
  //    visible: visible,
  //    action: action
  //  });
  //  return this;
  //}

  //addShareWorkGroup({visible = true, action = () => console.log('Share to Work Group')}): DropdownMenuService {
  //  this.menuItems.push({
  //    iconUrl: 'assets/images/dropdown-menu-icons/work-group-silhouette.svg',
  //    text: 'Share to Work Group',
  //    visible: visible,
  //    action: action
  //  });
  //  return this;
  //}

  addCopyLinkFormatted({visible = true, action = () => console.log('Copy Link (Formatted)')}): DropdownMenuService {
    this.menuItems.push({
      iconUrl: 'assets/images/dropdown-menu-icons/copy.svg',
      text: 'Copy Link (Formatted)',
      visible: visible,
      action: action
    });
    return this;
  }

  addCopyLinkUnformatted({visible = true, action = () => console.log('Copy Link (Unformatted)')}): DropdownMenuService {
    this.menuItems.push({
      iconUrl: 'assets/images/dropdown-menu-icons/copy.svg',
      text: 'Copy Link (Unformatted)',
      visible: visible,
      action: action
    });
    return this;
  }

  addDropCourse({visible = true, action = () => console.log('Drop Course')}): DropdownMenuService {
    this.menuItems.push({
      iconUrl: 'assets/images/remove.svg',
      text: 'Drop Course',
      visible: visible,
      action: action
    });
    return this;
  }

  addDropLearningPath({visible = true, action = () => console.log('Drop Learning Path')}): DropdownMenuService {
    this.menuItems.push({
      iconUrl: 'assets/images/remove.svg',
      text: 'Drop Learning Path',
      visible: visible,
      action: action
    });
    return this;
  }

  addViewDetails({visible = true, action = () => console.log('View Details')}): DropdownMenuService {
    this.menuItems.push({
      iconUrl: 'assets/images/dropdown-menu-icons/view-eye.svg',
      text: 'View',
      visible: visible,
      action: action
    });
    return this;
  }

  addViewEnrollmentDetails({visible = true, action = () => console.log('View Enrollment Details')}): DropdownMenuService {
    this.menuItems.push({
      iconUrl: 'assets/images/dropdown-menu-icons/view-eye.svg',
      text: 'View Enrollment Details',
      visible: visible,
      action: action
    });
    return this;
  }

  addViewContentDetails({visible = true, action = () => console.log('View Content Details')}): DropdownMenuService {
    this.menuItems.push({
      iconUrl: 'assets/images/dropdown-menu-icons/view-eye.svg',
      text: 'View Content Details',
      visible: visible,
      action: action
    });
    return this;
  }

  addReEnroll({visible = true, action = () => console.log('Re-Enroll')}): DropdownMenuService {
    this.menuItems.push({
      iconUrl: 'assets/images/clipboard-check-grey.svg',
      text: 'Re-Enroll',
      visible: visible,
      action: action
    });
    return this;
  }

  addViewCertificate({visible = true, action = () => console.log('View Certificate')}): DropdownMenuService {
    this.menuItems.push({
      iconUrl: 'assets/images/certifications.svg',
      text: 'View Certificate',
      visible: visible,
      action: action
    });
    return this;
  }

  getNavigateToContentAction(contentId) {
    return () => this.router.navigate([NAVIGATION_ROUTES.content, contentId]).then();
  }

  addReviewQuizResults({visible = true, action = () => console.log('Review Quiz Results')}): DropdownMenuService {
    this.menuItems.push({
      iconUrl: 'assets/images/dropdown-menu-icons/view-eye.svg',
      text: this.translationService.getTranslationFileData('assignments.review-quiz-results'),
      visible: visible,
      action: action
    });
    return this;
  }
}
