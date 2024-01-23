import { Component, OnInit } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { DropdownItem } from 'src/app/resources/models/dropdown-item';
import { DropdownMenuService } from 'src/app/services/dropdown-menu.service';
import { TranslationService } from 'src/app/services/translation.service';
import { LearningPathStateService } from 'src/app/state/learning-path/learning-path-state.service';
import { WorkflowViewState, WorkflowStateService } from 'src/app/state/workflow/workflow-state.service';

@Component({
  selector: 'ep-workflow-view-selector',
  templateUrl: './workflow-view-selector.component.html',
  styleUrls: ['./workflow-view-selector.component.scss']
})
export class WorkflowViewSelectorComponent implements OnInit {
  viewState$: Observable<WorkflowViewState>;

  isSelectorDropdownOpen: boolean = false;
  dropdownItems: DropdownItem[];

  constructor (private workflowState: WorkflowStateService,
              private dropdownMenuService: DropdownMenuService,
              private translationService: TranslationService,
              private learningPathState: LearningPathStateService) {}

  ngOnInit(): void {
    this.setViewState();
  }

  private setViewState() {
    this.viewState$ = this.workflowState.viewState$.pipe(
      tap(viewState => this.buildDropdownMenu(viewState)) // re-build every time new view state is set
    );
  }

  private buildDropdownMenu(viewState: WorkflowViewState) {
    const checkmarkUrl = 'assets/images/check-dark.svg';
    this.dropdownItems = this.dropdownMenuService
      .addCustomItem({
        iconUrl: viewState === 'Tree Only' ? checkmarkUrl : '',
        text: this.translationService.getTranslationFileData('workflow-tree.tree-only'),
        visible: true,
        action: () => {
          this.workflowState.changeViewState('Tree Only');
          this.workflowState.setUserWorkflowOverride('Tree Only');
        }
      })
      .addCustomItem({
        iconUrl: viewState === 'Diagram Only' ? checkmarkUrl : '',
        text: this.translationService.getTranslationFileData('workflow-tree.diagram-only'),
        visible: true,
        action: () => { 
          this.workflowState.changeViewState('Diagram Only');
          this.workflowState.setUserWorkflowOverride('Diagram Only');
        }
      })
      .addCustomItem({
        iconUrl: viewState === 'Diagram and Tree' ? checkmarkUrl : '',
        text: this.translationService.getTranslationFileData('workflow-tree.diagram-tree'),
        visible: true,
        action: () => { 
          this.workflowState.changeViewState('Diagram and Tree');
          this.workflowState.setUserWorkflowOverride('Diagram and Tree');
        }
      })
      .getItems();
  }

  toggleSelectorDropdown() {
    this.isSelectorDropdownOpen = !this.isSelectorDropdownOpen;
  }

  closeDropdownMenu() {
    this.isSelectorDropdownOpen = false;
  }
}
