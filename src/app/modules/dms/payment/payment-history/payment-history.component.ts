import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import * as moment from "moment";
import {Subject} from "rxjs";

@Component({
    selector: 'app-dms-payment',
    templateUrl: 'payment-history-component.html',
    styleUrls: ['payment-history.component.scss']
})
// eslint-disable-next-line @typescript-eslint/naming-convention
export class paymentHistoryComponent implements OnInit, OnDestroy{
    isLoading: boolean = false;
    isMobile: boolean = false;
    isProgressSpinner: boolean = false;
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    searchForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        private _formBuilder: FormBuilder,)
    {

    }

    ngOnInit(): void {
        this.searchForm = this._formBuilder.group({
        status: ['ALL'],
        type: ['ALL'],
        account: [''],
        accountNm: [''],
        qtNo: [''],
        range: [{
            start: moment().utc(false).add(-7, 'day').endOf('day').toISOString(),
            end: moment().utc(false).startOf('day').toISOString()
        }],
        start: [],
        end: [],

    });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
    selectHeader(): void {

    }
}
