import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";

@Component({
    selector: 'app-in',
    templateUrl: './in.component.html',
    styleUrls: ['./in.component.scss']
})
export class InComponent implements OnInit {

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
