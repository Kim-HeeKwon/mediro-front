import {
    AfterViewInit, ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {DeviceDetectorService} from 'ngx-device-detector';
import {merge, Observable, range, Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {SelectionModel} from '@angular/cdk/collections';
import {TableConfig, TableStyle} from '../../../../../@teamplat/components/common-table/common-table.types';
import {Stock, StockHistory, StockPagenation} from './stock.types';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {MatDialog} from '@angular/material/dialog';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {StockService} from './stock.service';
import {filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {fuseAnimations} from '../../../../../@teamplat/animations';
import {StockDetailComponent} from "./stock-detail/stock-detail.component";




@Component({
    selector: 'app-stock',
    templateUrl: './stock.component.html',
    styleUrls: ['./stock.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class StockComponent implements OnInit, OnDestroy, AfterViewInit {

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
    stockHistorys$: Observable<StockHistory[]>;
    stockPagenation: StockPagenation | null = null;
    isLoading: boolean = false;
    stocksCount: number = 0;
    stocksTableStyle: TableStyle = new TableStyle();

    stocksTable: TableConfig[] = [
        {headerText: '????????????', dataField: 'itemCd', width: 100, display: true, disabled: true, type: 'text'},
        {headerText: '?????????', dataField: 'itemNm', width: 120, display: true, disabled: true, type: 'text'},
        {headerText: '??????', dataField: 'standard', width: 100, display: false, disabled: true, type: 'text'},
        {headerText: '??????', dataField: 'unit', width: 100, display: false, disabled: true, type: 'text'},
        {
            headerText: '????????????',
            dataField: 'itemGrade',
            width: 80,
            display: true,
            disabled: true,
            type: 'text',
            combo: true
        },
        {headerText: '??????', dataField: 'poQty', width: 80, display: true, disabled: true, type: 'number'},
        {headerText: '??????', dataField: 'availQty', width: 80, display: true, disabled: true, type: 'number'},
        /*{headerText : '?????????' , dataField : 'qty', width: 100, display : true, disabled : true, type: 'number'},*/
        {headerText: '??????', dataField: 'acceptableQty', width: 80, display: true, disabled: true, type: 'number'},
        {headerText: '??????', dataField: 'unusedQty', width: 80, display: true, disabled: true, type: 'number'},
        {headerText: '????????????', dataField: 'safetyQty', width: 80, display: true, disabled: true, type: 'number'},
        {headerText: '????????????', dataField: 'longtermQty', width: 80, display: true, disabled: true, type: 'number'},
        {headerText: '??????', dataField: 'longterm', width: 150, display: true, disabled: true, type: 'text'},
        /*{headerText : '????????????' , dataField : 'availQty', width: 100, display : true, disabled : true, type: 'number'},*/
    ];

    stocksTableColumns: string[] = [
        'details',
        /*'no',*/
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
    selectedStock: Stock | null = null;
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
            name: '?????? ???'
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
        private readonly breakpointObserver: BreakpointObserver) {
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_GRADE');
        this.navigationSubscription = this._router.events.subscribe((e: any) => {
            // RELOAD??? ????????????????????? ????????? ???????????? ????????? ????????????
            // ??????????????? ???????????? ????????????. ????????? ??? ??????????????? ???????????? ???????????? ??????.
            if (e instanceof NavigationEnd) {
            }
        });
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnInit(): void {
        // ?????? Form ??????
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
                if (stock !== null) {
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
        if (this._sort !== undefined) {
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
    toggleDetails(itemCd: string): void {
        if (this.selectedStock && this.selectedStock.itemCd === itemCd) {
            // Close the details
            this.closeDetails();
            return;
        }

        this._stockService.getStockHistoryById(itemCd)
            .subscribe((stock) => {
                this.selectedStock = stock;
                this._stockService.getStockHistory(0, 10, 'seq', 'desc', this.selectedStock);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Close the details
     */
    closeDetails(): void {
        this.selectedStock = null;
    }

    selectHeader(): void {
        // range(1,100)
        //     .pipe(
        //         filter(n => n % 2 === 0)
        //     )
        //     .subscribe((a: any) => {
        //         console.log(a);
        //     });
        if (this.searchForm.getRawValue().searchCondition === '100') {
            this.searchForm.patchValue({'itemCd': ''});
            this.searchForm.patchValue({'itemNm': this.searchForm.getRawValue().searchText});
        }
        this._stockService.getHeader(0, 10, 'itemNm', 'desc', this.searchForm.getRawValue());
        this.closeDetails();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getComboData(column: TableConfig) {
        let combo;
        if (column.dataField === 'itemGrade') {
            combo = this.itemGrades;
        }
        return combo;
    }

    selectClickRow(row: any): void
    {
        if(!this.isMobile){
            this._matDialog.open(StockDetailComponent, {
                autoFocus: false,
                disableClose: true,
                data     : {
                    detail: row
                },
            });
        }else{
            const d = this._matDialog.open(StockDetailComponent, {
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    d.updateSize('calc(100vw - 10px)','');
                } else {
                    // d.updateSize('calc(100% - 50px)', '');
                }
            });
            d.afterClosed().subscribe(() => {
                smallDialogSubscription.unsubscribe();
            });
        }
    }

}
