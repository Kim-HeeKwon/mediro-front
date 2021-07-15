import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {DeviceDetectorService} from "ngx-device-detector";

@Component({
    selector: 'app-manages',
    templateUrl: './manages.component.html',
    styleUrls: ['./manages.component.scss']
})
export class ManagesComponent implements OnInit {

    isMobile: boolean = false;

    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;

    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    itemsCount: number = 1;
    itemsTableColumns: string[] = ['name', 'sku', 'price'];
    selectedItemsForm: FormGroup;

    constructor(
        private _deviceService: DeviceDetectorService,
    ) {
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnInit(): void {
    }

}
