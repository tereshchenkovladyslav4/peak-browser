import {Component, OnDestroy, OnInit} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ProdGenApi } from "../../../../services/apiService/prodgen.api";
import { AuthenticationStateService } from '../../../../state/authentication/authentication-state.service'

//import { TranslationService } from './../services/TranslationService';

var globalThis: ManagementPortalComponent;

@Component({
    selector: 'app-management-portal',
    templateUrl: './management-portal.component.html',
  styleUrls: ['./management-portal.component.scss'],
})

export class ManagementPortalComponent implements OnInit, OnDestroy {
  page: string
  adminPortalUrl: SafeResourceUrl;

  constructor(private authState: AuthenticationStateService, private apiV1Service: ProdGenApi, private route: ActivatedRoute, private sanitizer: DomSanitizer) {
    globalThis = this;
    // we will launch off the new window then waith for a notification that it is created (look in the app constructor for this callback)
      let url = window.location.protocol + "//" + window.location.host;      
      url = url.replace("4202", "4201");
    url += "/administration";
    this.adminPortalUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    ngOnInit() {
      window.scroll(0, 0);

      this.route.data.subscribe(data => {
        this.page = data['name']
        // console.log(this.page);
      });


      window.addEventListener("message", this.eventListener, false);
  }

  eventListener(event) {
    var eventData = event.data as string;
    // console.log(eventData);
    if (eventData) {
      let eventDataStr = eventData.toString();
      if (eventDataStr.indexOf("admin-resize|") == 0) {
        eventDataStr = eventDataStr.replace("admin-resize|", "");
        var elm = document.getElementById("managementFrame");
        if (elm) {
          globalThis.resizeIframe(elm, eventDataStr);
        }
      }
      else if (eventDataStr.indexOf("administration_opened") == 0) {
        // handshake from opening iframe view
        // console.log("iframe handshake");
        // console.log(this);
        var elm = document.getElementById("managementFrame");
        if (elm) {
          globalThis.openManagementPage(elm as HTMLIFrameElement);
        }
      }
    }
  }

  ngOnDestroy() {
    window.removeEventListener("message", this.eventListener);
  }

  openManagementPage(iframe: HTMLIFrameElement) {
    let token = "apiV2BearerToken:" + JSON.stringify(ProdGenApi.getAPIV2AccessKey());
    
    token += "|languageCode:" + this.apiV1Service.getCurrentLanguage();
    token += "|defaultPage:" + this.page;

    let w: Window = iframe.contentWindow;
    w.postMessage(token, "*");
  }


  resizeIframe(iframe: HTMLElement, height: string) {
    iframe.style.height = height;//iframe.contentWindow.document.body.scrollHeight + "px";
    //window.requestAnimationFrame(() => this.resizeIframe(iframe));
  }
}
