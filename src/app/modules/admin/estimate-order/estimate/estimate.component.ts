import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";

@Component({
    selector: 'app-estimate',
    templateUrl: './estimate.component.html',
    styleUrls: ['./estimate.component.scss']
})
export class EstimateComponent implements OnInit {

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
