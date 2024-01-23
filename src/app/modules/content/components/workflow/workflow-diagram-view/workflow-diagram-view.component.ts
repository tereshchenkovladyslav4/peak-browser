import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, first, map, tap } from 'rxjs';
import { DiagramPoint, DiagramViewExtended } from 'src/app/resources/models/content';
import { WorkflowStateService } from 'src/app/state/workflow/workflow-state.service';

const DEFAULT_VIEWBOXTEXT = "-300 -300 1800 1800"

@Component({
  selector: 'ep-workflow-diagram-view',
  templateUrl: './workflow-diagram-view.component.html',
  styleUrls: ['./workflow-diagram-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowDiagramViewComponent implements OnInit {
  @ViewChild('diagramSVG') diagramSVG: ElementRef;  

  diagramView$: Observable<DiagramViewExtended>;
  openProcessIndex$: Observable<number>;
  activeTaskIndex$: Observable<number>;

  isDiagramWorkflow$ = new BehaviorSubject<boolean>(true);
  selectProcessOverride: boolean = false; // indicates if a Process is selected (single clicked) in the workflow diagram

  // diagram modifiers
  viewBoxText: string = DEFAULT_VIEWBOXTEXT;
  extentsTL: DiagramPoint = new DiagramPoint();
  extentsBR: DiagramPoint = new DiagramPoint();
  panRate: number = 20;
  zoomRate: number = 1.1;
  mouseDown: boolean = false;
  mouseDownX: number = 0;
  mouseDownY: number = 0;
  touchDist: number = 1;
  isDragging: boolean = false;

  subscription = new Subscription();

  constructor(private workflowState: WorkflowStateService) {}

  ngOnInit(): void {
    this.setProcess();
    this.setTask();
    this.setDiagramView();
    this.setIsDiagramWorkflow();
  }

  private setDiagramView() {
    this.diagramView$ = this.isDiagramWorkflow$.pipe(
      map(isDiagramWorkflow => isDiagramWorkflow
      ? this.workflowState.snapshot.workflowDiagramData 
      : this.workflowState.snapshot.processDiagramData[this.workflowState.snapshot.openProcessIndex]),
      tap(diagramViewExtended => this.setZoomProperties(diagramViewExtended))
    )
  }

  private setIsDiagramWorkflow() {
    this.subscription.add(
      this.workflowState.openProcessIndex$.subscribe(openProcessIndex => {
        if (openProcessIndex === -1 || this.selectProcessOverride) {
          this.showWorkflowDiagram();
          this.selectProcessOverride = false;
          return;
        }

        // show process diagram when a process has been selected EXCEPT when the override is in effect
        this.showProcessDiagram();
      }));
  }

  private setProcess() {
    this.openProcessIndex$ = this.workflowState.openProcessIndex$;
  }

  private setTask() {
    this.activeTaskIndex$ = this.workflowState.activeTaskIndex$;
  }

  clearSelection() {
    // clear currently selected process OR task
    if (this.isDiagramWorkflow$.getValue()) {
      if (this.workflowState.snapshot.openProcessIndex !== -1) {
        this.workflowState.deselectProcess();
      }
      return;
    }

    if (this.workflowState.snapshot.activeTaskIndex !== -1) {
      this.workflowState.deselectTask();
    }
  }

  objectClick(index: number, event) {
    event.stopPropagation();
    if (this.isDragging) return;

    // clicked on a process
    if (this.isDiagramWorkflow$.getValue()) {
      // open process if it is not the open process
      if (this.workflowState.snapshot.openProcessIndex !== index) {
        this.selectProcessOverride = true;
        this.workflowState.openProcess(index);
      }
      return;
    }

    // open task if it is not the active task
    if (this.workflowState.snapshot.activeTaskIndex !== index) {
      this.workflowState.openTask(index);
    }
  }

  objectDblClick(event) {
    event.stopPropagation();
    if (this.isDragging) return;

    if (this.isDiagramWorkflow$.getValue()) {
      this.showProcessDiagram();
    }
  }

  private showWorkflowDiagram() {
    this.isDiagramWorkflow$.next(true);
  }

  private showProcessDiagram() {
    this.isDiagramWorkflow$.next(false);

  }

  private setZoomProperties(view: DiagramViewExtended) {
    for (var i = 0; i < view?.objects?.length; i++) {
      if (i === 0) {
        this.extentsTL.x = view.objects[i].basePtX;
        this.extentsTL.y = view.objects[i].basePtY;
        this.extentsBR.x = view.objects[i].basePtX + view.objects[i].sizeX;
        this.extentsBR.y = view.objects[i].basePtY + view.objects[i].sizeY;
      } else {
        if (view.objects[i].basePtX < this.extentsTL.x)
          this.extentsTL.x = view.objects[i].basePtX;
        if (view.objects[i].basePtY < this.extentsTL.y)
          this.extentsTL.y = view.objects[i].basePtY;
        if ((view.objects[i].basePtX + view.objects[i].sizeX) > this.extentsBR.x)
          this.extentsBR.x = view.objects[i].basePtX + view.objects[i].sizeX;
        if ((view.objects[i].basePtY + view.objects[i].sizeY) > this.extentsBR.y)
          this.extentsBR.y = view.objects[i].basePtY + view.objects[i].sizeY;
      }
    }

    this.recenter();
  }

  goBackToWorkflow() {
    this.workflowState.deselectProcess();
    this.isDiagramWorkflow$.next(true);
  }

  zoomIn() {
    this.zoom(true);
  }

  zoomOut() {
    this.zoom(false);
  }

  private zoom(zoomIn: boolean) {
    let parts: string[] = this.viewBoxText.split(" ");
    let numparts: number[] = [+parts[0], +parts[1], +parts[2], +parts[3]];

    let prevWidth: number = numparts[2];
    let prevHeight: number = numparts[3];
    if (zoomIn) {
      numparts[2] /= this.zoomRate;
      numparts[3] /= this.zoomRate;
    } else {
      numparts[2] *= this.zoomRate;
      numparts[3] *= this.zoomRate;
    }
    
    // since we want the zoom to happen from the center of the viewbox, change the x and y also
    numparts[0] += (prevWidth - numparts[2]) * .5;
    numparts[1] += (prevHeight - numparts[3]) * .5;
    this.setViewBox(numparts[0], numparts[1], numparts[2], numparts[3]);
  }

  recenter() {
    let sizeX: number = (this.extentsBR.x - this.extentsTL.x);
    let sizeY: number = (this.extentsBR.y - this.extentsTL.y);

    this.setViewBox((this.extentsTL.x - sizeX * .05), (this.extentsTL.y - sizeY * .05), sizeX * 1.1, sizeY * 1.1);
  }

  setViewBox(x: number, y: number, width: number, height: number) {
    if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
      this.viewBoxText = DEFAULT_VIEWBOXTEXT;
      return;
    }

    this.viewBoxText = x + " " + y + " " + width + " " + height;
  }

  @HostListener('touchstart', ['$event'])
  public handleTouchStartt(event_orig: any): void {
    let event: TouchEvent = event_orig as TouchEvent;
    if (event.touches != null && event.touches.length == 1) {
      this.mouseDown = true;
      this.mouseDownX = event.touches[0].clientX;
      this.mouseDownY = event.touches[0].clientY;
    } else if (event.touches != null && event.touches.length == 2) {
      this.mouseDown = false;
      this.touchDist = Math.sqrt((event.touches[0].clientX - event.touches[1].clientX) * (event.touches[0].clientX - event.touches[1].clientX) +
          (event.touches[0].clientY - event.touches[1].clientY) * (event.touches[0].clientY - event.touches[1].clientY));
    }
  }
  @HostListener('mousedown', ['$event'])
  public handleMouseDownEvent(event: MouseEvent): void {
    this.mouseDown = true;
    this.mouseDownX = event.clientX;
    this.mouseDownY = event.clientY;
  }

  @HostListener('mouseup', ['$event'])
  @HostListener('touchend', ['$event'])
  @HostListener('touchcancel', ['$event'])
  public handleMouseUpEvent(event: MouseEvent): void {
    this.mouseDown = false;
    this.isDragging = false;
  }

  @HostListener('mousewheel', ['$event'])
  @HostListener('DOMMouseScroll', ['$event'])
  public handleMousWheelEvent(event: WheelEvent): void {
    event.stopPropagation();
    event.preventDefault();

    if (event.deltaY > 0 || event.detail < 0) {
      this.zoomOut();
    } else if (event.deltaY < 0 || event.detail > 0) {
      this.zoomIn();
    }
  }

  @HostListener('touchmove', ['$event'])
  public handleTouchEvent(event_orig: any): void {
    let event: TouchEvent = event_orig as TouchEvent;
    if (event.touches != null && event.touches.length == 1) {
      if (this.mouseDown == true && ((this.mouseDownX != event.touches[0].clientX) || (this.mouseDownY != event.touches[0].clientY))) {
        event.stopPropagation();
        event.preventDefault();

        this.isDragging = true;
        let parts: string[] = this.viewBoxText.split(" ");
        let numparts: number[] = [+parts[0], +parts[1], +parts[2], +parts[3]];

        const svg = this.diagramSVG.nativeElement;
        let zoomLevel: number = svg.clientWidth / numparts[2];

        if (zoomLevel == 0) {
          zoomLevel = 1;
        }

        if (numparts[2] < numparts[3]) {
            zoomLevel = svg.clientHeight / numparts[3];
        }

        numparts[0] -= (event.touches[0].clientX - this.mouseDownX) / zoomLevel;
        numparts[1] -= (event.touches[0].clientY - this.mouseDownY) / zoomLevel;

        this.mouseDownX = event.touches[0].clientX;
        this.mouseDownY = event.touches[0].clientY;
        this.setViewBox(numparts[0], numparts[1], numparts[2], numparts[3]);
      }
    } else if (event.touches != null && event.touches.length == 2) {
        event.stopPropagation();
        event.preventDefault();

        let parts: string[] = this.viewBoxText.split(" ");
        let numparts: number[] = [+parts[0], +parts[1], +parts[2], +parts[3]];

        let prevWidth: number = numparts[2];
        let prevHeight: number = numparts[3];

        let dist: number = Math.sqrt((event.touches[0].clientX - event.touches[1].clientX) * (event.touches[0].clientX - event.touches[1].clientX) +
            (event.touches[0].clientY - event.touches[1].clientY) * (event.touches[0].clientY - event.touches[1].clientY));

        numparts[2] *= this.touchDist / dist;
        numparts[3] *= this.touchDist / dist;

        // since we want the zoom to happen from the center of the viewbox, change the x and y also
        numparts[0] += (prevWidth - numparts[2]) * .5;
        numparts[1] += (prevHeight - numparts[3]) * .5;

        this.touchDist = dist;
        this.setViewBox(numparts[0], numparts[1], numparts[2], numparts[3]);
    }
  }

  @HostListener('document:mousemove', ['$event'])
  public handleMouseMoveEvent(event: MouseEvent): void {
    if (this.mouseDown && ((this.mouseDownX != event.clientX) || (this.mouseDownY != event.clientY))) {
      event.stopPropagation();
      event.preventDefault();

      this.isDragging = true;
      let parts: string[] = this.viewBoxText.split(" ");
      let numparts: number[] = [+parts[0], +parts[1], +parts[2], +parts[3]];

      const svg = this.diagramSVG.nativeElement;
      let zoomLevel: number = svg.clientWidth / numparts[2];

      if (zoomLevel == 0) {
        zoomLevel = 1;
      }

      if (numparts[2] < numparts[3]) {
          zoomLevel = svg.clientHeight / numparts[3];
      }
      
      numparts[0] -= (event.clientX - this.mouseDownX) / zoomLevel;
      numparts[1] -= (event.clientY - this.mouseDownY) / zoomLevel;

      this.mouseDownX = event.clientX;
      this.mouseDownY = event.clientY;
      this.setViewBox(numparts[0], numparts[1], numparts[2], numparts[3]);
    }
  }
}