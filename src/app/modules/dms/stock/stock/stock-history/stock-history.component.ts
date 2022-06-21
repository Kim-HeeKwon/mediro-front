import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {merge, Observable, Subject} from 'rxjs';
import {StockHistory, StockHistoryPagenation, StockPagenation} from '../stock.types';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {CommonCode, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {StockService} from '../stock.service';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {Columns} from '../../../../../../@teamplat/services/realgrid/realgrid.types';
import {FuseRealGridService} from '../../../../../../@teamplat/services/realgrid';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {FunctionService} from "../../../../../../@teamplat/services/function";

@Component({
    selector: 'dms-stock-history',
    templateUrl: 'stock-history.component.html',
    styleUrls: ['stock-history.component.scss'],
})
export class StockHistoryComponent implements OnInit, OnDestroy, AfterViewInit {
    stockHistoryPagenation: StockHistoryPagenation | null = null;
    @ViewChild(MatPaginator) private _stockHistoryPagenator: MatPaginator;
    @ViewChild(MatSort) private _stockHistorySort: MatSort;
    orderBy: any = 'asc';
    isLoading: boolean = false;
    stockHistorysCount: number = 0;
    stockHistorys$ = new Observable<StockHistory[]>();
    chgType: CommonCode[] = null;
    itemGrade: CommonCode[] = null;
    dataForm: any;
    stockHistoryForm: FormGroup;
    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    stockHistoryProvider: RealGrid.LocalDataProvider;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    stockHistoryColumns: Columns[];
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    stockHistoryFields: DataFieldObject[] = [
        {fieldName: 'creDate', dataType: ValueType.TEXT},
        {fieldName: 'chgType', dataType: ValueType.TEXT},
        {fieldName: 'qty', dataType: ValueType.TEXT},
        {fieldName: 'chgReason', dataType: ValueType.TEXT},
        {fieldName: 'creUser', dataType: ValueType.TEXT}
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _realGridsService: FuseRealGridService,
        private _stockService: StockService,
        public matDialogRef: MatDialogRef<StockHistoryComponent>,
        private _functionService: FunctionService,
        private _codeStore: CodeStore,
        private _formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _utilService: FuseUtilsService) {
        this.chgType = _utilService.commonValue(_codeStore.getValue().data, 'INV_CHG_TYPE');
        this.itemGrade = _utilService.commonValueFilter(_codeStore.getValue().data, 'ITEM_GRADE', ['ALL']);
        this.dataForm = data;
    }

    ngOnInit(): void {
        // Form 생성
        this.stockHistoryForm = this._formBuilder.group({
            itemCd: [{value: ''}], // 품목코드
            itemNm: [{value: ''}], // 품목명
            fomlInfo: [{value: ''}], // 모델명
            standard: [{value: ''}], // 규격
            unit: [{value: ''}], // 단위
            itemGrade: [{value: ''}], // 품목등급
            supplier: [{value: ''}], // 공급처
            active: [false]  // cell상태
        });
        if (this.dataForm.selectedStock) {
            this.stockHistoryForm.patchValue(this.dataForm.selectedStock);
        }

        const values = [];
        const lables = [];
        this.chgType.forEach((param: any) => {
            values.push(param.id);
            lables.push(param.name);
        });
        //그리드 컬럼
        this.stockHistoryColumns = [
            {
                name: 'creDate', fieldName: 'creDate', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '일자', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'chgType', fieldName: 'chgType', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '유형', styleName: 'center-cell-text'},
                values: values,
                labels: lables,
                lookupDisplay: true,
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'qty', fieldName: 'qty', type: 'data', width: '100', styleName: 'right-cell-text',
                header: {text: '수량', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'chgReason',
                fieldName: 'chgReason',
                type: 'data',
                width: '120',
                styleName: 'left-cell-text',
                header: {text: '사유', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'creUser',
                fieldName: 'creUser',
                type: 'data',
                width: '160',
                styleName: 'left-cell-text',
                header: {text: '아이디', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
        ];

        this.stockHistoryProvider = this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const gridListOption = {
            stateBar: false,
            checkBar: false,
            footers: false,
        };

        this.stockHistoryProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.stockHistoryProvider,
            'stockHistory',
            this.stockHistoryColumns,
            this.stockHistoryFields,
            gridListOption);

        //그리드 옵션
        this.gridList.setEditOptions({
            readOnly: true,
            insertable: false,
            appendable: false,
            editable: false,
            deletable: false,
            checkable: true,
            softDeleting: false,
        });
        this.gridList.deleteSelection(true);
        this.gridList.setDisplayOptions({liveScroll: false,});
        this.gridList.setPasteOptions({enabled: false,});
        this._stockService.stockHistoryPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stockHistoryPagenation: StockHistoryPagenation) => {
                // Update the pagination
                if (stockHistoryPagenation !== null) {
                    this.stockHistoryPagenation = stockHistoryPagenation;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.stockHistoryForm.controls['itemCd'].disable();
        this.stockHistoryForm.controls['itemNm'].disable();
        this.stockHistoryForm.controls['fomlInfo'].disable();
        this.stockHistoryForm.controls['standard'].disable();
        this.stockHistoryForm.controls['unit'].disable();
        this.stockHistoryForm.controls['itemGrade'].disable();
        this.stockHistoryForm.controls['supplier'].disable();

    }

    ngAfterViewInit(): void {
        let stock = null;

        this._stockService.stock$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stocks: any) => {
                // Update the pagination
                if (stock !== null) {
                    stock = stocks;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        if (stock === null) {
            stock = {};
        }
        merge(this._stockHistoryPagenator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._stockService.getStockHistory(this._stockHistoryPagenator.pageIndex, this._stockHistoryPagenator.pageSize, 'seq', this.orderBy, stock);
            }),
            map(() => {
                this.isLoading = false;
            })
        ).pipe(takeUntil(this._unsubscribeAll)).subscribe();
    }

    ngOnDestroy(): void {
        this._stockService.stockHistoryDestory();
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.stockHistoryProvider);
    }

    selectStockHistory(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.stockHistoryProvider, true);
        const rtn = this._stockService.getStockHistory(0, 40, 'seq', 'desc', this.stockHistoryForm.getRawValue());
        this.selectCallBack(rtn);

    }

    //페이징
    pageEvent($event: PageEvent): void {
        // eslint-disable-next-line max-len
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.stockHistoryProvider, true);
        const rtn = this._stockService.getStockHistory(this._stockHistoryPagenator.pageIndex, this._stockHistoryPagenator.pageSize, 'seq', this.orderBy, this.stockHistoryForm.getRawValue());
        this.selectCallBack(rtn);
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {
            this._realGridsService.gfn_DataSetGrid(this.gridList, this.stockHistoryProvider, ex.stockHistory);
            this._stockService.stockHistoryPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((stockHistoryPagenation: StockHistoryPagenation) => {
                    // Update the pagination
                    this.stockHistoryPagenation = stockHistoryPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if(ex.stockHistory.length < 1){
                this._functionService.cfn_alert('검색된 정보가 없습니다.');
            }
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.stockHistoryProvider, false);
        });
    }
}
