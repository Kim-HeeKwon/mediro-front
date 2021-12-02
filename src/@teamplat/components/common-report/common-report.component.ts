import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {fuseAnimations} from '../../animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CommonCode, FuseUtilsService} from '../../services/utils';
import {FormBuilder} from '@angular/forms';
import {CommonPopupService} from '../common-popup/common-popup.service';
import {PopupStore} from '../../../app/core/common-popup/state/popup.store';
import {Observable, Subject} from 'rxjs';
import {ReportHeaderData} from './common-report.types';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {Columns} from '../../services/realgrid/realgrid.types';
import {FuseRealGridService} from '../../services/realgrid';
import {takeUntil} from 'rxjs/operators';
import {
    EstimateDetail,
    EstimateDetailPagenation
} from '../../../app/modules/dms/estimate-order/estimate/estimate.types';
import {EstimateService} from '../../../app/modules/dms/estimate-order/estimate/estimate.service';
import {CodeStore} from '../../../app/core/common-code/state/code.store';
import {MatPaginator} from '@angular/material/paginator';
import {OrderDetail} from "../../../app/modules/dms/estimate-order/order/order.types";
import {OrderService} from "../../../app/modules/dms/estimate-order/order/order.service";

@Component({
    selector: 'app-common-report',
    templateUrl: './common-report.component.html',
    styleUrls: ['./common-report.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class CommonReportComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild(MatPaginator, {static: true}) private _estimateDetailPagenator: MatPaginator;
    isLoading: boolean = false;
    order: boolean = false;
    estimate: boolean = false;
    headerText: string = '';
    divisionText: string = '';
    detail: any;
    qty: number = 0;
    unitPrice: number = 0;
    totalAmt: number = 0;
    taxAmt: number = 0;
    type: CommonCode[] = null;
    status: CommonCode[] = null;
    filterList: string[];
    orderBy: any = 'asc';
    reportHeaderData: ReportHeaderData = new ReportHeaderData();
    estimateDetailPagenation: EstimateDetailPagenation | null = null;
    commonReports$ = new Observable<EstimateDetail[]>();
    orderDetails$ = new Observable<OrderDetail[]>();
    // @ts-ignore
    gridList: RealGrid.GridView;
    estimateCommonReportColumns: Columns[];
    orderCommonReportColumns: Columns[];
    // @ts-ignore
    commonReportDataProvider: RealGrid.LocalDataProvider;
    estimateCommonReportFields: DataFieldObject[] = [
        {fieldName: 'number', dataType: ValueType.NUMBER},
        {fieldName: 'qtLineNo', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'qty', dataType: ValueType.NUMBER},
        {fieldName: 'qtPrice', dataType: ValueType.NUMBER},
        {fieldName: 'qtAmt', dataType: ValueType.NUMBER},
        {fieldName: 'remarkDetail', dataType: ValueType.TEXT},
    ];
    orderCommonReportFields: DataFieldObject[] = [
        {fieldName: 'number', dataType: ValueType.NUMBER},
        {fieldName: 'poLineNo', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'poReqQty', dataType: ValueType.NUMBER},
        {fieldName: 'invQty', dataType: ValueType.NUMBER},
        {fieldName: 'qty', dataType: ValueType.NUMBER},
        {fieldName: 'poQty', dataType: ValueType.NUMBER},
        {fieldName: 'reqQty', dataType: ValueType.NUMBER},
        {fieldName: 'unitPrice', dataType: ValueType.NUMBER},
        {fieldName: 'poAmt', dataType: ValueType.NUMBER},
        {fieldName: 'remarkDetail', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _realGridsService: FuseRealGridService,
        private _estimateService: EstimateService,
        private _orderService: OrderService,
        public _matDialogRef: MatDialogRef<CommonReportComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _utilService: FuseUtilsService,
        private _formBuilder: FormBuilder,
        private _codeStore: CodeStore,
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
            this.reportHeaderData.phoneNumber = this.reportHeaderData.phoneNumber !== '00' ? this.reportHeaderData.phoneNumber : '';
            this.reportHeaderData.fax = this.reportHeaderData.fax !== '00' ? this.reportHeaderData.fax : '';
        }

        if (data.body) {
            this.detail = data.body;

            this.detail.forEach((reportDetail: any) => {
                this.qty += reportDetail.qty;
                this.unitPrice += reportDetail.unitPrice;
                this.totalAmt += reportDetail.totalAmt;
                this.taxAmt += reportDetail.taxAmt;
            });
        }
        if (data.estimate === true) {
            this.estimate = true;
        } else {
            this.estimate = false;
        }
        if (data.order === true) {
            this.order = true;
        } else {
            this.order = false;
        }

    }

    ngOnInit(): void {
        this.estimateCommonReportColumns = [
            {
                name: 'qtLineNo', fieldName: 'qtLineNo', type: 'data', width: '50', styleName: 'left-cell-text'
                , header: {text: '순번', styleName: 'left-cell-text'}
            },
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '180', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'left-cell-text'}
            },
            {
                name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '180', styleName: 'left-cell-text'
                , header: {text: '품목명', styleName: 'left-cell-text'}
            },
            {
                name: 'standard', fieldName: 'standard', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '규격', styleName: 'left-cell-text'}
            },
            {
                name: 'unit', fieldName: 'unit', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '단위', styleName: 'left-cell-text'}
            },
            {
                name: 'qty', fieldName: 'qty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '수량', styleName: 'left-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'qtPrice', fieldName: 'qtPrice', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '단가', styleName: 'left-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'qtAmt', fieldName: 'qtAmt', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '견적금액', styleName: 'left-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'remarkDetail', fieldName: 'remarkDetail', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '비고', styleName: 'left-cell-text'}
            },
        ];

        this.orderCommonReportColumns = [
            {
            name: 'poLineNo', fieldName: 'poLineNo', type: 'data', width: '50', styleName: 'left-cell-text'
            , header: {text: '순번', styleName: 'left-cell-text'}
                , numberFormat : '#,##0',
            },
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'left-cell-text'}
            },
            {
                name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '180', styleName: 'left-cell-text'
                , header: {text: '품목명', styleName: 'left-cell-text'}
            },
            {
                name: 'standard', fieldName: 'standard', type: 'data', width: '70', styleName: 'left-cell-text'
                , header: {text: '규격', styleName: 'left-cell-text'}
            },
            {
                name: 'unit', fieldName: 'unit', type: 'data', width: '70', styleName: 'left-cell-text'
                , header: {text: '단위', styleName: 'left-cell-text'}
            },
            {
                name: 'poReqQty', fieldName: 'poReqQty', type: 'data', width: '70', styleName: 'right-cell-text'
                , header: {text: '발주', styleName: 'left-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'invQty', fieldName: 'invQty', type: 'data', width: '70', styleName: 'right-cell-text'
                , header: {text: '보유', styleName: 'left-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'reqQty', fieldName: 'reqQty', type: 'data', width: '70', styleName: 'right-cell-text'
                , header: {text: '요청수량', styleName: 'left-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'qty', fieldName: 'qty', type: 'data', width: '70', styleName: 'right-cell-text'
                , header: {text: '수량', styleName: 'left-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'poQty', fieldName: 'poQty', type: 'data', width: '70', styleName: 'right-cell-text'
                , header: {text: '발주수량', styleName: 'left-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'unitPrice', fieldName: 'unitPrice', type: 'data', width: '70', styleName: 'right-cell-text'
                , header: {text: '단가', styleName: 'left-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'poAmt', fieldName: 'poAmt', type: 'data', width: '70', styleName: 'right-cell-text'
                , header: {text: '발주금액', styleName: 'left-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'remarkDetail', fieldName: 'remarkDetail', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '비고', styleName: 'left-cell-text'}
            },
        ];

        this.commonReportDataProvider = this._realGridsService.gfn_CreateDataProvider(true);
        //그리드 옵션
        const gridListOption = {
            stateBar: false,
            checkBar: false,
            footers: false,
        };
        if(this.estimate === true) {
            // 견적 그리드
            this.gridList = this._realGridsService.gfn_CreateGrid(
                this.commonReportDataProvider,
                'estimateCommonReportGrid',
                this.estimateCommonReportColumns,
                this.estimateCommonReportFields,
                gridListOption);

            this.estimateReport();
        }

        if(this.order === true) {
            // 발주 그리드
            this.gridList = this._realGridsService.gfn_CreateGrid(
                this.commonReportDataProvider,
                'estimateCommonReportGrid',
                this.orderCommonReportColumns,
                this.orderCommonReportFields,
                gridListOption);

            this.orderReport();
        }

        this.gridList.setRowIndicator({
            visible: false
        });
        this.gridList.sortingOptions.enabled = false;
        this.gridList.setEditOptions({
            readOnly: true,
            editable: true,
            updatable: true,
            appendable: false,
            inserta1ble: false,
            deletable: false,
            editWhenFocused: false
        });
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.commonReportDataProvider);
    }

    estimateReport(): void {
        this.commonReports$ = this._estimateService.estimateDetails$;
        this._estimateService.estimateDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((commonReport: any) => {
                if (commonReport !== null) {
                    console.log(commonReport);
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.commonReportDataProvider, commonReport);
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    orderReport(): void {
        this.orderDetails$ = this._orderService.orderDetails$;
        this._orderService.orderDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((orderDetail: any) => {
                // Update the counts
                if (orderDetail !== null) {
                    console.log(orderDetail);
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.commonReportDataProvider, orderDetail);
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    priceToString(price): number {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    phoneFomatter(num, type?): string {
        let formatNum = '';
        if (num.length === 11) {
            if (type === 0) {
                formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3');
            } else {
                formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
            }
        } else if (num.length === 8) {
            formatNum = num.replace(/(\d{4})(\d{4})/, '$1-$2');
        } else {
            if (num.indexOf('02') === 0) {
                if (type === 0) {
                    formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-****-$3');
                } else {
                    formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
                }
            } else {
                if (type === 0) {
                    formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-***-$3');
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
                    formatNum = num.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-*****');
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

        console.log(printContents);
        console.log(originalContents);
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
    }


}
