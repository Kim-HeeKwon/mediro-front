import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {DeviceDetectorService} from 'ngx-device-detector';
import {merge, Observable, Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {SelectionModel} from '@angular/cdk/collections';
import {TableConfig, TableStyle} from '../../../../../@teamplat/components/common-table/common-table.types';
import {Stock, StockPagenation} from './stock.types';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {MatDialog} from '@angular/material/dialog';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {StockService} from './stock.service';
import {map, switchMap, takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-stock',
    templateUrl: './stock.component.html',
    styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit, OnDestroy, AfterViewInit  {

    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild(MatSort) private _sort: MatSort;
    isMobile: boolean = false;
    selection = new SelectionModel<any>(true, []);
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    stocks$: Observable<Stock[]>;
    stockPagenation: StockPagenation | null = null;
    isLoading: boolean = false;
    stocksCount: number = 0;
    stocksTableStyle: TableStyle = new TableStyle();

    stocksTable: TableConfig[] = [
        {headerText : '품목코드' , dataField : 'itemCd', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '품목명' , dataField : 'itemNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '규격' , dataField : 'standard', width: 100, display : false, disabled : true, type: 'text'},
        {headerText : '단위' , dataField : 'unit', width: 100, display : false, disabled : true, type: 'text'},
        {headerText : '품목등급' , dataField : 'itemGrade', width: 80, display : true, disabled : true, type: 'text',combo : true},
        {headerText : '발주' , dataField : 'poQty', width: 80, display : true, disabled : true, type: 'number'},
        {headerText : '보유' , dataField : 'availQty', width: 80, display : true, disabled : true, type: 'number'},
        /*{headerText : '현재고' , dataField : 'qty', width: 100, display : true, disabled : true, type: 'number'},*/
        {headerText : '가납' , dataField : 'acceptableQty', width: 80, display : true, disabled : true, type: 'number'},
        {headerText : '불용' , dataField : 'unusedQty', width: 80, display : true, disabled : true, type: 'number'},
        {headerText : '안전재고' , dataField : 'safetyQty', width: 80, display : true, disabled : true, type: 'number'},
        {headerText : '장기재고' , dataField : 'longtermQty', width: 80, display : true, disabled : true, type: 'number'},
        {headerText : '기간' , dataField : 'longterm', width: 100, display : true, disabled : true, type: 'text'},
        /*{headerText : '가용재고' , dataField : 'availQty', width: 100, display : true, disabled : true, type: 'number'},*/
    ];

    stocksTableColumns: string[] = [
        /*'no',*/
        /*'details',*/
        'itemCd',
        'itemNm',
        /*'standard',
        'unit',*/
        'itemGrade',
        'poQty',
        'availQty',
        /*'qty',*/
        'acceptableQty',
        'unusedQty',
        'safetyQty',
        'longtermQty',
        'longterm',
    ];

    searchForm: FormGroup;
    selectedStockHeader: Stock | null = null;
    filterList: string[];
    flashMessage: 'success' | 'error' | null = null;
    navigationSubscription: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    itemGrades: CommonCode[] = null;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    // eslint-disable-next-line @typescript-eslint/member-ordering
    searchCondition: CommonCode[] = [
        {
            id: '100',
            name: '품목 명'
        }];

    constructor(
        private _matDialog: MatDialog,
        public _matDialogPopup: MatDialog,
        private _formBuilder: FormBuilder,
        private _stockService: StockService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _codeStore: CodeStore,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data,'ITEM_GRADE');
        this.navigationSubscription = this._router.events.subscribe((e: any) => {
            // RELOAD로 설정했기때문에 동일한 라우트로 요청이 되더라도
            // 네비게이션 이벤트가 발생한다. 우리는 이 네비게이션 이벤트를 구독하면 된다.
            if (e instanceof NavigationEnd) {
            }
        });
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            type: ['ALL'],
            itemNm: [''],
            searchCondition: ['100'],
            searchText: [''],
        });

        this.stocks$ = this._stockService.stocks$;
        this._stockService.stocks$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stock: any) => {
                if(stock !== null){
                    this.stocksCount = stock.length;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._stockService.stockPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stockPagenation: StockPagenation) => {
                this.stockPagenation = stockPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
    /**
     * After view init
     */
    ngAfterViewInit(): void {
        if(this._sort !== undefined){
            // Get products if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._stockService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchForm.getRawValue());
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).subscribe();
        }
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param account
     */
    trackByFn(index: number, stock: any): any {
        return stock.id || index;
    }

    /**
     * Toggle product details
     *
     * @param account
     */
    toggleDetails(itemCd: string): void
    {
        //console.log(itemCd);
    }
    /**
     * Close the details
     */
    closeDetails(): void
    {
        this.selectedStockHeader = null;
    }

    selectHeader(): void
    {
        if(this.searchForm.getRawValue().searchCondition === '100') {
            this.searchForm.patchValue({'itemCd': ''});
            this.searchForm.patchValue({'itemNm': this.searchForm.getRawValue().searchText});
        }
        this._stockService.getHeader(0,10,'itemNm','desc',this.searchForm.getRawValue());
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getComboData(column: TableConfig) {
        let combo;
        if(column.dataField === 'itemGrade'){
            combo = this.itemGrades;
        }
        return combo;
    }
}
