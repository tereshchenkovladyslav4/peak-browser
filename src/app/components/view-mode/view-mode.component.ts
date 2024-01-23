import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { TooltipModule } from 'src/app/modules/tooltip/tooltip.module';
import { ViewMode } from 'src/app/resources/enums/view-mode.enum';

@Component({
  selector: 'ep-view-mode',
  templateUrl: './view-mode.component.html',
  styleUrls: ['./view-mode.component.scss'],
  standalone: true,
  imports: [TooltipModule, SharedModule, SelectButtonModule, FormsModule],
})
export class ViewModeComponent {
  readonly ViewMode = ViewMode;
  @Input() viewMode: ViewMode;
  @Output() viewModeChanged = new EventEmitter<ViewMode>();
  options = [
    { icon: 'assets/images/TileViewmenu.svg', value: ViewMode.GRID },
    { icon: 'assets/images/list-view.svg', value: ViewMode.LIST },
  ];

  setView(viewMode: ViewMode) {
    this.viewModeChanged.emit(viewMode);
  }
}
