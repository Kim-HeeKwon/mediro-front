import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {InService} from "../in.service";


@Component({
    selector     : 'in-detail',
    templateUrl  : './in-detail.component.html',
    styleUrls    : ['./in-detail.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class InDetailComponent implements OnInit, OnDestroy
{
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    itemsCount: number = 0;
    itemsTableColumns: string[] = ['name', 'sku', 'price'];
    selectedItemsForm: FormGroup;
    /**
     * Constructor
     */
    constructor(
        private _inService: InService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {

    }

    ngOnDestroy(): void {

    }

    isBack(): void{
        this._inService.setShowMobile(false);
    }
}
