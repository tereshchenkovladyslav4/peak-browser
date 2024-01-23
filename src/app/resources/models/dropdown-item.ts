export interface DropdownItem {
  iconUrl: string;
  text: string;
  visible: boolean;
  action(): void;
  children?: DropdownItem[]
}
