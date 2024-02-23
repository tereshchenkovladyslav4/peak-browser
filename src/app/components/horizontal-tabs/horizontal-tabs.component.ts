import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LearningPathStateService } from 'src/app/state/learning-path/learning-path-state.service';
import { Subscription } from 'rxjs';

export interface Tab {
  key: string;
  label: string
}

@Component({
  selector: 'ep-horizontal-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './horizontal-tabs.component.html',
  styleUrls: ['./horizontal-tabs.component.scss']
})
export class HorizontalTabsComponent implements OnInit, OnDestroy {
  @Input() tabs: Tab[] = [];
  @Input() tabFontSize: string = '1rem';
  @Input() tabFontWeight: string = '';
  @Input() isSticky: boolean = false;
  @Input() tabBackgroundColor: string = '';
  @Input() activeTabKey: string = null;
  @Input() underlineAlways: boolean = false;
  @Input() pointerOnHover: boolean = false;
  @Output() onTabChange: EventEmitter<any> = new EventEmitter<any>();

  activeTabIndex: number = 0;

  private subscription = new Subscription();

  constructor(private learningPathState: LearningPathStateService) { }

  ngOnInit(): void {
    this.setActiveTabIndexOnLPContentChange();
    const index = this.tabs?.findIndex(t => t.key === this.activeTabKey)
    if (this.activeTabKey && index > -1) {
      this.setActiveTabIndex(index);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onTabClick(index: number) {
    this.updateIndexAndOutput(index);
  }

  private updateIndexAndOutput(index: number) {
    this.setActiveTabIndex(index);
    if (this.tabs?.length) {
      this.onTabChange?.emit(this.tabs[index]?.key);
    }
  }

  private setActiveTabIndex(index): void {
    this.activeTabIndex = index;
  }

  /**
   * Reset horizontal tabs index when switching between course content in LP
   */
  private setActiveTabIndexOnLPContentChange() {
    this.subscription.add(
      this.learningPathState.activeCourseContentDetails$.subscribe(_ => this.updateIndexAndOutput(0))
    );
  }
}
