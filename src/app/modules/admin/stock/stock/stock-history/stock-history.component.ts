import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatTable} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {SelectionModel} from '@angular/cdk/collections';
import {FormBuilder, FormGroup} from '@angular/forms';
import {merge, Observable, Subject} from 'rxjs';
import {TableConfig, TableStyle} from '../../../../../../@teamplat/components/common-table/common-table.types';
import {StockHistory, StockHistoryPagenation} from '../stock.types';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {FunctionService} from '../../../../../../@teamplat/services/function';
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import {CommonCode, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {StockService} from '../stock.service';

@Component({
    selector       : 'stock-history',
    templateUrl    : './stock-history.component.html',
    styleUrls: ['./stock-history.component.scss'],
})
export class StockHistoryComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatTable,{static:true}) _table: MatTable<any>;
    @ViewChild(MatPaginator) private _stockHistoryPagenator: MatPaginator;
    @ViewChild(MatSort) private _stockHistorySort: MatSort;
    isLoading: boolean = false;
    selection = new SelectionModel<any>(true, []);
    stockHistorysCount: number = 0;
    stockHistorys$ = new Observable<StockHistory[]>();

    stockHistorysTable: TableConfig[] = [
        {headerText : '품목코드' , dataField : 'itemCd', width: 100, display : false, disabled : true, type: 'text'},
        {headerText : '품목명' , dataField : 'itemNm', width: 120, display : false, disabled : true, type: 'text'},
        {headerText : '일자' , dataField : 'creDate', width: 120, display : true, disabled : true, type: 'text'},
        {headerText : '유형' , dataField : 'chgType', width: 120, display : true, disabled : true, type: 'text', combo: true},
        {headerText : '수량' , dataField : 'qty', width: 100, display : true, disabled : true, type: 'number'},
        {headerText : '사유' , dataField : 'chgReason', width: 120, display : true, disabled : true, type: 'text'},
        {headerText : '아이디' , dataField : 'creUser', width: 120, display : true, disabled : true, type: 'text'},
    ];

    stockHistorysTableColumns: string[] = [
        /*'itemCd',
        'itemNm',*/
        'creDate',
        'chgType',
        'qty',
        'chgReason',
        'creUser'
    ];
    chgType: CommonCode[] = null;

    stockHistoryPagenation: StockHistoryPagenation | null = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _stockService: StockService,
        private _matDialog: MatDialog,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _formBuilder: FormBuilder,
        public _matDialogPopup: MatDialog,
        private _codeStore: CodeStore,
        private _functionService: FunctionService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _utilService: FuseUtilsService
    )
    {
        this.chgType = _utilService.commonValue(_codeStore.getValue().data,'INV_CHG_TYPE');

        this.stockHistorys$ = this._stockService.stockHistorys$;
        this._stockService.stockHistorys$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stockHistory: any) => {
                // Update the counts
                if(stockHistory !== null){
                    this.stockHistorysCount = stockHistory.length;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
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

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    /**
     * After view init
     */
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

        if(this._stockHistorySort !== undefined){
            // Get products if sort or page changes
            merge(this._stockHistorySort.sortChange, this._stockHistoryPagenator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._stockService.getStockHistory(this._stockHistoryPagenator.pageIndex, this._stockHistoryPagenator.pageSize, this._stockHistorySort.active, this._stockHistorySort.direction, stock);
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).pipe(takeUntil(this._unsubscribeAll)).subscribe();
        }
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param account
     */
    trackByFn(index: number, history: any): any {
        return history.id || index;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getComboData(column: TableConfig) {
        let combo;
        if(column.dataField === 'chgType'){
            combo = this.chgType;
        }
        return combo;
    }
}
