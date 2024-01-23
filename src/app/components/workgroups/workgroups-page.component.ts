import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProdGenApi } from './../../services/apiService/prodgen.api';
import { Setting } from './../../services/apiService/classFiles/class.organizations';
//import { TranslationService } from './../services/TranslationService';


@Component({
    selector: 'app-workgroups-page',
    templateUrl: './workgroups-page.component.html',
  styleUrls: ['./workgroups-page.component.scss'],
  providers: [ProdGenApi]
})

export class WorkGroupsPageComponent implements OnInit {

    constructor(private service: ProdGenApi,
        private route: ActivatedRoute) {

    }

    ngOnInit() {
        window.scroll(0, 0);

    }


}
