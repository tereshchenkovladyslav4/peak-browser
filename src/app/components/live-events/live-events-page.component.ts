import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProdGenApi } from './../../services/apiService/prodgen.api';
import { Setting } from './../../services/apiService/classFiles/class.organizations';
//import { TranslationService } from './../services/TranslationService';


@Component({
    selector: 'app-liveevents-page',
    templateUrl: './live-events-page.component.html',
  styleUrls: ['./live-events-page.component.scss'],
  providers: [ProdGenApi]
})

export class LiveEventsPageComponent implements OnInit {

    constructor(private service: ProdGenApi,
        private route: ActivatedRoute) {

    }

    ngOnInit() {
        window.scroll(0, 0);

    }


}
