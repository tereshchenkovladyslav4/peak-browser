import {Constructor} from "@angular/cdk/table";
import { DropdownItem } from "../models/dropdown-item";
import { BehaviorSubject } from "rxjs";

interface DropdownItemsTempCache {
  dropdownItemsMap;
}

export interface DropdownCreationData {
  key: string;
  contentId?: string;
  isBookmarked?: boolean;
}

export function WithDropdownItemsTempCache<T extends Constructor<{}>>(Base: T = (class {} as any)) {
  return class extends Base implements DropdownItemsTempCache {
    dropdownItemsMap = {};

    private onItemsUpdatedSubject$ = new BehaviorSubject<{key: string, items: DropdownItem[]}>(null);

    onItemsUpdated$ = this.onItemsUpdatedSubject$.asObservable();

    protected getDropdownItems(data: DropdownCreationData) {
      return this.dropdownItemsMap[data?.key] || this.constructAndSaveDropdownItems(data);
    }

    private constructAndSaveDropdownItems(data: DropdownCreationData) {
      const items = this.constructDropdownItems(data);

      this.updateDropdownItems(data?.key, items);

      return items;
    }

    protected constructDropdownItems(data: DropdownCreationData): DropdownItem[] {
      console.error('Not yet implemented in base class');
      throw new Error('override this method');
    }

    protected updateDropdownItems(key: string, items: DropdownItem[]) {
      this.dropdownItemsMap[key] = items;
      this.onItemsUpdatedSubject$.next({key, items});
    }
  }
}
