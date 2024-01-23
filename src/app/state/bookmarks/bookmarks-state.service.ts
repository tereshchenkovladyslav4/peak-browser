import {Injectable} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { nameof, selectFrom } from 'src/app/resources/functions/state/state-management';
import { Bookmark } from '../../resources/models/content/bookmarks';

interface BookmarksState {
  bookmarkMap: Map<string, Bookmark>;
}

const DEFAULT_STATE: BookmarksState = {
  bookmarkMap: new Map<string, Bookmark>()
}

@Injectable({
  providedIn: 'root'
})
export class BookmarksStateService {
  private state$ = new BehaviorSubject<BookmarksState>(DEFAULT_STATE);
  
  // SELECTORS
  bookmarksMap$: Observable<Map<string, Bookmark>> = selectFrom(this.state$, nameof<BookmarksState>('bookmarkMap'));

  addBookmark(bookmark: Bookmark) {
    const map = this.snapshot.bookmarkMap;
    map.set(bookmark?.content?.id, bookmark);
    this.updateBookmarkMap(map);
  }

  removeBookmark(contentId: string) {
    const map = this.snapshot.bookmarkMap;
    map.delete(contentId);
    this.updateBookmarkMap(map);
  }

  get snapshot() {
    return this.state$.getValue();
  }

  isContentBookmarked(contentId: string): boolean {
    return !!this.snapshot.bookmarkMap.get(contentId);
  }

  private updateBookmarkMap(mutatedMap: Map<string, Bookmark>) {
    this.state$.next({
      ...this.snapshot,
      bookmarkMap: new Map(mutatedMap)
    })
  }
}
