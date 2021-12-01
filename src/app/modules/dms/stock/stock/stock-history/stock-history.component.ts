import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {merge, Observable, Subject} from 'rxjs';
import {StockHistory, StockHistoryPagenation} from '../stock.types';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {CommonCode, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {StockService} from '../stock.service';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {Columns} from '../../../../../../@teamplat/services/realgrid/realgrid.types';
import {FuseRealGridService} from '../../../../../../@teamplat/services/realgrid';

@Component({
    selector       : 'dms-stock-history',
    templateUrl    : 'stock-history.component.html',
    styleUrls      : ['stock-history.component.scss'],
})
export class StockHistoryComponent implements OnInit, OnDestroy, AfterViewInit
{
    stockHistoryPagenation: StockHistoryPagenation | null = null;
    isProgressSpinner: boolean = false;
    @ViewChild(MatPaginator) private _stockHistoryPagenator: MatPaginator;
    @ViewChild(MatSort) private _stockHistorySort: MatSort;
    orderBy: any = 'asc';
    isLoading: boolean = false;
    stockHistorysCount: number = 0;
    stockHistorys$ = new Observable<StockHistory[]>();
    chgType: CommonCode[] = null;
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
        private _realGridsService: FuseRealGridService,
        private _stockService: StockService,
        public matDialogRef: MatDialogRef<StockHistoryComponent>,
        private _codeStore: CodeStore,
        private _changeDetectorRef: ChangeDetectorRef,
        private _utilService: FuseUtilsService)
    {
        this.chgType = _utilService.commonValue(_codeStore.getValue().data,'INV_CHG_TYPE');
    }
    ngOnInit(): void {
        const values = [];
        const lables = [];
        this.chgType.forEach((param: any) => {
            values.push(param.id);
            lables.push(param.name);
        });
        //그리드 컬럼
        this.stockHistoryColumns = [
            {name: 'creDate', fieldName: 'creDate', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '일자', styleName: 'left-cell-text'}},
            {name: 'chgType', fieldName: 'chgType', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '유형' , styleName: 'left-cell-text'},
                values: values,
                labels: lables,
                lookupDisplay: true
            },
            {name: 'qty', fieldName: 'qty', type: 'data', width: '100', styleName: 'right-cell-text',
                header: {text: '수량', styleName: 'left-cell-text'},
            },
            {name: 'chgReason', fieldName: 'chgReason', type: 'data', width: '120', styleName: 'left-cell-text', header: {text: '사유' , styleName: 'left-cell-text'},
            },
            {name: 'creUser', fieldName: 'creUser', type: 'data', width: '160', styleName: 'left-cell-text', header: {text: '아이디' , styleName: 'left-cell-text'}},
        ];

        this.stockHistoryProvider =  this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const gridListOption = {
            stateBar : false,
            checkBar : false,
            footers : false,
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
                if(stockHistoryPagenation !== null){
                    this.stockHistoryPagenation = stockHistoryPagenation;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    ngAfterViewInit(): void {
        let stock = null;

        this._stockService.stock$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stocks: any) => {
                // Update the pagination
                if(stock !== null){
                    stock = stocks;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        if(stock === null){
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
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.stockHistoryProvider);
    }
    selectStockHistory(): void {
        this.stockHistorys$ = this._stockService.stockHistorys$;
        this._stockService.stockHistorys$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stockHistory: any) => {
                if(stockHistory !== null){
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.stockHistoryProvider, stockHistory);
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

    }
}
