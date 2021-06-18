import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";

@Component({
    selector: 'app-manages',
    templateUrl: './manages.component.html',
    styleUrls: ['./manages.component.scss']
})
export class ManagesComponent implements OnInit {

    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    itemsCount: number = 1;
    itemsTableColumns: string[] = ['name', 'sku', 'price'];
    selectedItemsForm: FormGroup;

    constructor() {
    }

    ngOnInit(): void {
    }

}
