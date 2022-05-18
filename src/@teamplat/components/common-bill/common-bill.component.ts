import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from "@angular/core";
import {fuseAnimations} from "../../animations";
import {ReportHeaderData} from "./common-bill.types";
import {Subject} from "rxjs";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FuseUtilsService} from "../../services/utils";
import {FormBuilder} from "@angular/forms";
import {CommonPopupService} from "../common-popup/common-popup.service";
import {PopupStore} from "../../../app/core/common-popup/state/popup.store";

@Component({
    selector: 'app-common-bill',
    templateUrl: './common-bill.component.html',
    styleUrls: ['./common-bill.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class CommonBillComponent implements OnInit, OnDestroy, AfterViewInit {
    isLoading: boolean = false;
    headerText: string = '';
    divisionText: string = '';
    detail: any;
    shipmentDetail: any;
    qty: number = 0;
    unitPrice: number = 0;
    totalAmt: number = 0;
    taxAmt: number = 0;
    totalTax: number = 0;
    totalPrice: number = 0;
    shipment: boolean;
    shipmentAccountNm: any;
    shipmentAddress: any;
    reportHeaderData: ReportHeaderData = new ReportHeaderData();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public _matDialogRef: MatDialogRef<CommonBillComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _utilService: FuseUtilsService,
        private _formBuilder: FormBuilder,
        private _popupService: CommonPopupService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _popupStore: PopupStore) {
        //console.log(data.body);
        if (data.divisionText) {
            this.headerText = data.divisionText + '서';
            this.divisionText = data.divisionText;
        } else {
            this.headerText = '준 비 중';
            this.divisionText = '';
        }

        if (data.header) {
            this.reportHeaderData = data.header;
            if (this.reportHeaderData.dlvAccountNm === '') {
                this.shipmentAccountNm = this.reportHeaderData.toAccountNm;
            } else {
                this.shipmentAccountNm = this.reportHeaderData.dlvAccountNm;
            }
            if (this.reportHeaderData.deliveryAddress === '') {
                this.shipmentAddress = this.reportHeaderData.dlvAddress;
            } else {
                this.shipmentAddress = this.reportHeaderData.deliveryAddress;
            }

            this.reportHeaderData.phoneNumber = this.reportHeaderData.phoneNumber !== '00' ? this.reportHeaderData.phoneNumber : '';
            this.reportHeaderData.fax = this.reportHeaderData.fax !== '00' ? this.reportHeaderData.fax : '';
        }

        if (data.body) {
            this.detail = data.body;
            this.shipmentDetail = data.body;
            this.detail.forEach((reportDetail: any) => {
                this.qty += reportDetail.qty;
                this.unitPrice += reportDetail.unitPrice;
                this.totalAmt += reportDetail.totalAmt;
                this.taxAmt += reportDetail.taxAmt;
                // this.totalTax += reportDetail.tax;
            });
            this.totalPrice = this.totalAmt + this.totalTax;
            if (data.shipment) {
                this.shipment = data.shipment;
            } else {
                this.shipment = false;
            }
            if (this.shipmentDetail.length < 20) {
                let idx = this.shipmentDetail.length;
                const lastIdx = 20 - this.shipmentDetail.length;
                for (let i = 0; i < lastIdx; i++) {
                    this.shipmentDetail.push({
                        itemGrade: '',
                        itemNm: '',
                        fomlInfo: '',
                        no: idx + 1,
                        qty: '',
                        tax: '',
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
            if (this.detail.length < 20) {
                let idx = this.detail.length;
                const lastIdx = 20 - this.detail.length;
                for (let i = 0; i < lastIdx; i++) {
                    this.detail.push({
                        itemGrade: '',
                        itemNm: '',
                        fomlInfo: '',
                        no: idx + 1,
                        qty: '',
                        tax: '',
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

    phoneFomatter(num, type?): string {
        let formatNum = '';
        if (num.length === 11) {
            if (type === 0) {
                formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
            } else {
                formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
            }
        } else if (num.length === 8) {
            formatNum = num.replace(/(\d{4})(\d{4})/, '$1-$2');
        } else {
            if (num.indexOf('02') === 0) {
                if (type === 0) {
                    formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
                } else {
                    formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
                }
            } else {
                if (type === 0) {
                    formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
                } else {
                    formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
                }
            }
        }
        return formatNum;
    }

    bizNoFormatter(num, type?): string {
        let formatNum = '';
        try {
            if (num.length === 10) {
                if (type === 0) {
                    formatNum = num.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3');
                } else {
                    formatNum = num.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3');
                }
            }
        } catch (e) {
            formatNum = num;
        }
        return formatNum;
    }

    print(elementId): void {
        const printContents = document.getElementById(elementId).innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
    }

}
