import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
    selector: 'app-out',
    templateUrl: './out.component.html',
    styleUrls: ['./out.component.scss']
})
export class OutComponent implements OnInit {

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
