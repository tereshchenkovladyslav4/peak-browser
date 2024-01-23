export interface TableColumn {
  columnDef: string;
  header?: string;
  cell: Function;
  clickable?: Function;
  isLink?: boolean;
  url?: string;
  sortable?: boolean;
}
