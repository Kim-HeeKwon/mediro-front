import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {fuseAnimations} from '../../animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FuseUtilsService} from '../../services/utils';
import {FormBuilder} from '@angular/forms';
import {CommonPopupService} from '../common-popup/common-popup.service';
import {PopupStore} from '../../../app/core/common-popup/state/popup.store';
import {Subject} from 'rxjs';
import {ReportHeaderData} from './common-report.types';

@Component({
    selector: 'app-common-report',
    templateUrl: './common-report.component.html',
    styleUrls: ['./common-report.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class CommonReportComponent implements OnInit, OnDestroy, AfterViewInit {

    isLoading: boolean = false;
    headerText: string = '';
    divisionText: string = '';
    detail: any;
    qty: number = 0;
    unitPrice: number = 0;
    totalAmt: number = 0;
    taxAmt: number = 0;
    reportHeaderData: ReportHeaderData = new ReportHeaderData();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        public _matDialogRef: MatDialogRef<CommonReportComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _utilService: FuseUtilsService,
        private _formBuilder: FormBuilder,
        private _popupService: CommonPopupService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _popupStore: PopupStore) {
        //console.log(data.body);
        if(data.divisionText){
            this.headerText = data.divisionText + '서';
            this.divisionText = data.divisionText;
        }else{
            this.headerText = '준 비 중';
            this.divisionText = '';
        }

        if(data.header){
            this.reportHeaderData = data.header;
        }

        if(data.body){
            this.detail = data.body;

            this.detail.forEach((reportDetail: any) => {
                this.qty += reportDetail.qty;
                this.unitPrice += reportDetail.unitPrice;
                this.totalAmt += reportDetail.totalAmt;
                this.taxAmt += reportDetail.taxAmt;
            });
        }

    }
    ngOnInit(): void {
    }
    ngAfterViewInit(): void {

    }
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
