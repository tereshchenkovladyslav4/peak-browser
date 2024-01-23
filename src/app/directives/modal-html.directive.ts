import { AfterViewInit, Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import {stringifySelectedFiltersQueryParam} from "../resources/functions/filter/filter";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {WorkflowStateService} from "../state/workflow/workflow-state.service";

declare function doesFontExist(fontName: string): boolean;

@Directive({
    selector: '[modalHTML]',
    standalone: true
})
// This file originated in the ProdGenBrowser project and is being brought into this project to corerctly render HTML and a basis for handling tool links.
export class ModalHtmlDirective implements AfterViewInit, OnChanges {
    private htmlLoaded: boolean;
    private htmlUrl: String;

    listenClickFunc: Function;
    appControlSubscription: Subscription;

    @Input() modalHTML: any;

    constructor(
        private el: ElementRef,
        private renderer: Renderer2,
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private state: WorkflowStateService
    ) {
        this.htmlLoaded = false;
    }

    ngAfterViewInit() {
        if (this.modalHTML != null) {
            this.el.nativeElement.innerHTML = this.modalHTML;
        }
        this.htmlUrl = window.location.href;
        this.createLinkListeners();
    }

    ngOnChanges(changes) {
        if (!changes.modalHTML || changes.modalHTML.firstChange) return;
        if (changes.modalHTML.currentValue == changes.modalHTML.previousValue) return;
        try {
            this.el.nativeElement.innerHTML = this.modalHTML;
            this.htmlLoaded = true;
            this.createLinkListeners();
        }
        catch (err) {
            console.log(err);
        }
    }

    createLinkListeners() {
        const navigationElements = Array.prototype.slice.call(this.el.nativeElement.querySelectorAll('a[href]'));
        navigationElements.forEach(elem => {
            this.listenClickFunc = this.renderer.listen(elem, 'click', (event) => {
                if (elem.getAttribute('href').toLowerCase().startsWith('pinnaclecommand:')) {

                    // check to see if they are on Windows. If not, give them the not supported message and stop processing
                    if (window.navigator.userAgent.indexOf("Windows ") == -1) {
                        //not supported

                        // TODO - Hook up standard popup
                        //var v_Msg = new MsgBxStringVals();
                        //v_Msg.body = "The selected tool link is not supported on this device.";
                        //v_Msg.title = ``;
                        //this.controlService.openMessageBoxPopUp(v_Msg);

                        event.preventDefault();
                        return;
                    }

                    // check to see if they have installed protocol already. Done by checking if font exists that is installed with it
                    if (doesFontExist("Xenotron") == false) {
                        // if they have not, give them a message showing the download link
                        // TODO - Hook up standard popup
                        //var v_Msg = new MsgBxStringVals();
                        //v_Msg.body = 'toolModal';
                        //v_Msg.title = ``;
                        //this.controlService.openMessageBoxPopUp(v_Msg);

                        event.preventDefault();
                        return;
                    }

                    // if they have installed the plugin, let it go through
                }

                let v_Href = elem.getAttribute('href');

                if (v_Href.toLowerCase().startsWith('pinnacle:')) {
                    let href_url = v_Href.replace('pinnacle://', '');
                    let url_array = href_url.split(':');
                    let url = "#";

                    if (url_array[0] == "PS_Cheat") {
                      this.state.openContentViewer(url_array[0], url_array[1]);
                    }
                    else if (url_array[0] == "PS_VidTutorial" || url_array[0] == "PS_VidArchive" || url_array[0] == "PS_VidUser") {
                      this.state.openContentViewer(url_array[0], url_array[1]);
                    }
                    else if (url_array[0] == "PS_LearningPath") {
                        //this.controlService.closePopUps();
                        //window.location.href = url += "/learningcenter/series?learningPathId=" + url_array[1];
                    }
                    else if (url_array[0] == "PS_Course") {
                        //this.controlService.closePopUps();
                        //window.location.href = url += "/learningcenter/series?courseId=" + url_array[1];
                    }
                    else if (url_array[0] == "PS_Workflow" || url_array[0] == "PS_Process" || url_array[0] == "PS_Task" || url_array[0] == "PS_Step" || url_array[0] == "PS_Milestone") {
                        let contentType = "";
                        if (url_array[0] == "PS_Workflow") {
                            contentType = "workflow";
                        }
                        else if (url_array[0] == "PS_Process") {
                            contentType = "process";
                        }
                        else if (url_array[0] == "PS_Task" || url_array[0] == "PS_Milestone") {
                            contentType = "task";
                        }
                        else if (url_array[0] == "PS_Step") {
                            contentType = "step";
                        }
                        //this.router.navigate([url += "/workflowviewer?id=" + url_array[1] + "&contentType=" + contentType]);
                        let full_url = url += "/workflowviewer?id=" + url_array[1] + "&contentType=" + contentType;
                        //this.controlService.closePopUps();
                        window.location.href = full_url;
                    }

                    event.preventDefault();
                }
                else if (v_Href.toLowerCase().startsWith('https://portal.pinnacleseries.com')) {
                    event.preventDefault();
                    window.location.href = elem.getAttribute('href');
                } else if (v_Href.toLowerCase().startsWith('https://pinnaclebetastorage.blob')) {
                    event.preventDefault();
                    const regexWidth = /width="(\d+px)"/;
                    const regexHeight = /height="(\d+px)"/;
                    const imageDimensions = {
                      width: elem.innerHTML.match(regexWidth)?.[1] || null,
                      height: elem.innerHTML.match(regexHeight)?.[1] || null
                    }

                    this.state.openContentViewerForImage(v_Href, imageDimensions);
                }
            });
        });
    }

    ngOnDestroy() {
        this.listenClickFunc;
    }
}
