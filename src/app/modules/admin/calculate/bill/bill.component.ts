import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {SelectionModel} from '@angular/cdk/collections';
import {TableConfig, TableStyle} from '../../../../../@teamplat/components/common-table/common-table.types';
import {Bill, BillPagenation} from './bill.types';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {MatDialog} from '@angular/material/dialog';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {DeviceDetectorService} from 'ngx-device-detector';
import {BillService} from './bill.service';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import * as moment from 'moment';

@Component({
    selector: 'app-bill',
    templateUrl: './bill.component.html',
    styleUrls: ['./bill.component.scss']
})
export class BillComponent implements OnInit, OnDestroy, AfterViewInit {

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
    bills$: Observable<Bill[]>;
    billPagenation: BillPagenation | null = null;
    isLoading: boolean = false;
    billsCount: number = 0;
    billsTableStyle: TableStyle = new TableStyle();

    billsTable: TableConfig[] = [
        {headerText : '생성일자' , dataField : 'billingCreDate', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '청구번호' , dataField : 'billing', width: 100, display : true, disabled : true, type: 'text'},
        /*{headerText : '라인번호' , dataField : 'lineNo', width: 100, display : false, disabled : true, type: 'text'},*/
        /*{headerText : '거래처' , dataField : 'toAccount', width: 100, display : false, disabled : true, type: 'text'},*/
        {headerText : '공급받는자' , dataField : 'toAccountNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '품목코드' , dataField : 'itemCd', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '품목명' , dataField : 'itemNm', width: 150, display : true, disabled : true, type: 'text'},
        {headerText : '유형' , dataField : 'type', width: 60, display : true, disabled : true, type: 'text',combo : true},
        /*{headerText : '상태' , dataField : 'status', width: 100, display : false, disabled : true, type: 'text'},*/
        {headerText : '거래유형' , dataField : 'taxGbn', width: 100, display : true, disabled : true, type: 'text',combo : true},
        {headerText : '수량' , dataField : 'billingQty', width: 60, display : true, disabled : true, type: 'number'},
        {headerText : '공급가액' , dataField : 'billingAmt', width: 60, display : true, disabled : true, type: 'number'},
        {headerText : '세액' , dataField : 'taxAmt', width: 60, display : true, disabled : true, type: 'number'},
        {headerText : '총 금액' , dataField : 'billingTotalAmt', width: 70, display : true, disabled : true, type: 'number'},
    ];

    billsTableColumns: string[] = [
        /*'no',*/
        /*'bills',*/
        /*'status',*/
        'billingCreDate',
        'billing',
        'toAccountNm',
        'itemCd',
        'itemNm',
        'type',
        'taxGbn',
        'billingQty',
        'billingAmt',
        'taxAmt',
        'billingTotalAmt',
    ];

    searchForm: FormGroup;
    selectedBillHeader: Bill | null = null;
    filterList: string[];
    flashMessage: 'success' | 'error' | null = null;
    navigationSubscription: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    taxGbn: CommonCode[] = null;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    type: CommonCode[] = null;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    searchCondition: CommonCode[] = [
        {
            id: '100',
            name: '거래처 명'
        }];

    constructor(
        private _matDialog: MatDialog,
        public _matDialogPopup: MatDialog,
        private _formBuilder: FormBuilder,
        private _billService: BillService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _codeStore: CodeStore,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.type = _utilService.commonValue(_codeStore.getValue().data,'BL_TYPE');
        this.taxGbn = _utilService.commonValue(_codeStore.getValue().data,'TAX_GBN');
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            type: ['ALL'],
            toAccountNm: [''],
            searchCondition: ['100'],
            searchText: [''],
            range: [{
                start: moment().utc(false).add(-7, 'day').endOf('day').toISOString(),
                end  : moment().utc(false).startOf('day').toISOString()
            }],
            start : [],
            end : []
        });

        this.bills$ = this._billService.bills$;
        this._billService.bills$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((bill: any) => {
                if(bill !== null){
                    this.billsCount = bill.length;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._billService.billPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((billPagenation: BillPagenation) => {
                this.billPagenation = billPagenation;
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
                    return this._billService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchForm.getRawValue());
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
    trackByFn(index: number, validity: any): any {
        return validity.id || index;
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
        this.selectedBillHeader = null;
    }

    selectHeader(): void
    {
        if(this.searchForm.getRawValue().searchCondition === '100') {
            this.searchForm.patchValue({'toAccount': ''});
            this.searchForm.patchValue({'toAccountNm': this.searchForm.getRawValue().searchText});
        }
        this.searchForm.patchValue({'start': this.searchForm.get('range').value.start});
        this.searchForm.patchValue({'end': this.searchForm.get('range').value.end});
        this._billService.getHeader(0,10,'billing','desc',this.searchForm.getRawValue());
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getComboData(column: TableConfig) {
        let combo;
        if(column.dataField === 'type'){
            combo = this.type;
        }else if(column.dataField === 'taxGbn'){
            combo = this.taxGbn;
        }
        return combo;
    }
}
