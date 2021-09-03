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
    priceToString(price): number {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    phoneFomatter(num,type?): string{
        let formatNum = '';
        if(num.length === 11){
            if(type===0){
                formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3');
            }else{
                formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
            }
        }else if(num.length===8){
            formatNum = num.replace(/(\d{4})(\d{4})/, '$1-$2');
        }else{
            if(num.indexOf('02') === 0){
                if(type === 0){
                    formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-****-$3');
                }else{
                    formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
                }
            }else{
                if(type === 0){
                    formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-***-$3');
                }else{
                    formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
                }
            }
        }
        return formatNum;
    }
    bizNoFormatter(num, type?): string {
        let formatNum = '';
        try{
            if (num.length === 10) {
                if (type === 0) {
                    formatNum = num.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-*****');
                } else {
                    formatNum = num.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3');
                }
            }
        } catch(e) {
            formatNum = num;
        }
        return formatNum;
    }
    print(elementId): void{
        const printContents = document.getElementById(elementId).innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
    }


}
