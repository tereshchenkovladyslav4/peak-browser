import {NavigationImageType} from "../enums/navigation-image-type.enum";
import {NavigationMenuType} from "../enums/navigation-menu-type.enum";
import { AclRole } from '../enums/acl-role.enum';

export class NavigationMenuItem {
  public title: string = "";
  public navType: NavigationMenuType;
  public navValue?: string = "";
  public image?: NavigationImageType;
  public isManagement?: boolean = false;
  public children?: NavigationMenuItem[];
  isExpanded?: boolean;
  isActive?: boolean;
  abbreviation?: string = ''; // only temporary until we get working design for nav menu subitems complete
  /*
   The navigation menu will be concealed if there is no match with any role.
   */
  roles?: AclRole[]
  /*
   The navigation menu will be concealed if user doesn't have permission.
   */
  permission?: string
}
