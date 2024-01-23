import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProdGenApi } from './../../services/apiService/prodgen.api';
import { Setting } from './../../services/apiService/classFiles/class.organizations';
//import { TranslationService } from './../services/TranslationService';


@Component({
    selector: 'app-libraries-page',
    templateUrl: './libraries-page.component.html',
    styleUrls: ['./libraries-page.component.scss'],
  providers: [ProdGenApi]
})

export class LibrariesPageComponent implements OnInit {

    constructor(private service: ProdGenApi,
        private route: ActivatedRoute) {

    }

    ngOnInit() {
        window.scroll(0, 0);

    }


}
