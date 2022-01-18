import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    ViewEncapsulation
} from '@angular/core';
import {fuseAnimations} from '../../../animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TradingHeaderData} from './common-trading.types';
import {Subject} from 'rxjs';
import {FuseUtilsService} from '../../../services/utils';
import {FormBuilder} from '@angular/forms';
import {CommonPopupService} from '../../common-popup/common-popup.service';
import {PopupStore} from '../../../../app/core/common-popup/state/popup.store';

@Component({
    selector: 'app-common-trading',
    templateUrl: 'common-trading.component.html',
    styleUrls: ['common-trading.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class CommonTradingComponent implements OnDestroy {
    isLoading: boolean = false;
    headerText: string = '';
    divisionText: string = '';
    detail: any;
    qty: number = 0;
    unitPrice: number = 0;
    totalAmt: number = 0;
    taxAmt: number = 0;
    tradingHeaderData: TradingHeaderData = new TradingHeaderData();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public _matDialogRef: MatDialogRef<CommonTradingComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _utilService: FuseUtilsService,
        private _formBuilder: FormBuilder,
        private _popupService: CommonPopupService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _popupStore: PopupStore) {
        if(data.divisionText){
            this.headerText = data.divisionText + '서';
            this.divisionText = data.divisionText;
        }else{
            this.headerText = '준 비 중';
            this.divisionText = '';
        }

        if(data.header){
            this.tradingHeaderData = data.header;
            this.tradingHeaderData.phoneNumber = this.tradingHeaderData.phoneNumber !== '00' ? this.tradingHeaderData.phoneNumber : '';
            this.tradingHeaderData.fax = this.tradingHeaderData.fax !== '00' ? this.tradingHeaderData.fax : '';
        }

        if(data.body){
            this.detail = data.body;
            this.detail.forEach((tradingDetail: any) => {
                this.qty += tradingDetail.qty;
                this.unitPrice += tradingDetail.unitPrice;
                this.totalAmt += tradingDetail.totalAmt;
                this.taxAmt += tradingDetail.taxAmt;
            });

            if(this.detail.length < 20){
                let idx = this.detail.length;
                const lastIdx = 20 - this.detail.length;
                for(let i=0; i<lastIdx; i++){
                    this.detail.push({
                        itemGrade: '',
                        itemNm: '',
                        no: idx+1,
                        qty: '',
                        remark: '',
                        standard: '',
                        taxAmt: '',
                        totalAmt: '',
                        unit: '',
                        unitPrice: '',
                    });
                    idx++;
                }


            }
        }
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
