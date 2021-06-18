import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";

@Component({
    selector: 'app-order',
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {

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
