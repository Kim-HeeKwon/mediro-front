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
import {FunctionService} from "../../../../../@teamplat/services/function";
import {ManagesDetailComponent} from "../../udi/manages/manages-detail/manages-detail.component";
import {BillTaxComponent} from "./bill-tax/bill-tax.component";

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
        {headerText : '생성일자' , dataField : 'billingCreDate', width: 110, display : true, disabled : true, type: 'text'},
        {headerText : '확정일자' , dataField : 'billingDate', width: 110, display : true, disabled : true, type: 'text'},
        {headerText : '청구번호' , dataField : 'billing', width: 120, display : true, disabled : true, type: 'text'},
        /*{headerText : '라인번호' , dataField : 'lineNo', width: 100, display : false, disabled : true, type: 'text'},*/
        /*{headerText : '거래처' , dataField : 'toAccount', width: 100, display : false, disabled : true, type: 'text'},*/
        {headerText : '문서번호' , dataField : 'invoice', width: 150, display : true, disabled : true, type: 'text'},
        {headerText : '공급자' , dataField : 'accountNm', width: 150, display : true, disabled : true, type: 'text'},
        {headerText : '공급받는 자' , dataField : 'toAccountNm', width: 150, display : true, disabled : true, type: 'text'},
        {headerText : '품목코드' , dataField : 'itemCd', width: 100, display : false, disabled : true, type: 'text'},
        {headerText : '품목명' , dataField : 'itemNm', width: 150, display : true, disabled : true, type: 'text'},
        {headerText : '유형' , dataField : 'type', width: 60, display : true, disabled : true, type: 'text',combo : true},
        /*{headerText : '상태' , dataField : 'status', width: 100, display : false, disabled : true, type: 'text'},*/
        {headerText : '거래유형' , dataField : 'taxGbn', width: 100, display : true, disabled : true, type: 'text',combo : true},
        {headerText : '수량' , dataField : 'billingQty', width: 80, display : true, disabled : true, type: 'number'},
        {headerText : '공급가액' , dataField : 'billingAmt', width: 80, display : true, disabled : true, type: 'number'},
        {headerText : '세액' , dataField : 'taxAmt', width: 80, display : true, disabled : true, type: 'number'},
        {headerText : '총 금액' , dataField : 'billingTotalAmt', width: 90, display : true, disabled : true, type: 'number'},
    ];

    billsTableColumns: string[] = [
        'select',
        'no',
        'billingCreDate',
        'billingDate',
        'billing',
        'invoice',
        'accountNm',
        'toAccountNm',
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
        private _functionService: FunctionService,
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
        this.selectClear();
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

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): SelectionModel<any> {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }
        this.bills$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((bill) =>{
                this.selection.select(...bill);
            });
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): any {
        const numSelected = this.selection.selected.length;
        const numRows = this.billsCount;
        return numSelected === numRows;
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: any): string {
        if (!row) {
            return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.no + 1}`;
    }


    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    selectClear() {
        this.selection.clear();
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    taxSave() {
        if(this.selection.selected.length < 1){
            this._functionService.cfn_alert('대상을 선택해주세요.');
            return;
        }else{
            const typeArr = [];
            const toAccountArr = [];
            const taxTypeArr = [];
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for(let i=0; i<this.selection.selected.length; i++){
                typeArr.push(this.selection.selected[i].type);
                toAccountArr.push(this.selection.selected[i].toAccount);
                taxTypeArr.push(this.selection.selected[i].taxGbn);
                if(this.selection.selected[i].invoice === '' && this.selection.selected[i].invoice === undefined
                    && this.selection.selected[i].invoice === null){
                    this._functionService.cfn_alert('발행할 수 없는 상태입니다. 청구번호 : ' + this.selection.selected[i].billing);
                    return false;

                }
            }

            const typeSet = new Set(typeArr);
            const toAccountSet = new Set(toAccountArr);
            const taxTypeSet = new Set(taxTypeArr);

            if(typeSet.size > 1){
                this._functionService.cfn_alert('매출, 매입은 따로 선택해야 합니다.');
                return false;
            }
            if(toAccountSet.size > 1){
                this._functionService.cfn_alert('다수 업체를 선택할 수 없습니다.');
                return false;
            }
            if(taxTypeSet.size > 1){
                this._functionService.cfn_alert('과세, 영세, 면세는 따로 선택해야 합니다.');
                return false;
            }

            if(!this.isMobile){
                const d = this._matDialog.open(BillTaxComponent, {
                    autoFocus: false,
                    maxHeight: '90vh',
                    disableClose: true,
                    data : {select : this.selection.selected, button : 'save'}
                });

                d.afterClosed().subscribe(() => {
                    this.selectHeader();
                });
            }else{
                const d = this._matDialog.open(BillTaxComponent, {
                    autoFocus: false,
                    width: 'calc(100% - 50px)',
                    maxWidth: '100vw',
                    maxHeight: '80vh',
                    disableClose: true,
                    data : {select : this.selection.selected, button : 'save'}
                });
                const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                    if (size.matches) {
                        d.updateSize('calc(100vw - 10px)','');
                    } else {
                        // d.updateSize('calc(100% - 50px)', '');
                    }
                });
                d.afterClosed().subscribe(() => {
                    this.selectHeader();
                    smallDialogSubscription.unsubscribe();
                });
            }
        }

        this._changeDetectorRef.markForCheck();
        this.selectHeader();
    }

    tax(): boolean {
        if(this.selection.selected.length < 1){
            this._functionService.cfn_alert('대상을 선택해주세요.');
            return;
        }else{
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for(let i=0; i<this.selection.selected.length; i++){
                if(this.selection.selected[i].invoice === '' && this.selection.selected[i].invoice === undefined
                    && this.selection.selected[i].invoice === null){
                    this._functionService.cfn_alert('발행할 수 없는 상태입니다. 청구번호 : ' + this.selection.selected[i].billing);
                    return false;

                }
            }

            if(!this.isMobile){
                const d = this._matDialog.open(BillTaxComponent, {
                    autoFocus: false,
                    maxHeight: '90vh',
                    disableClose: true,
                    data     : {select : this.selection.selected, button : 'invoice'}
                });

                d.afterClosed().subscribe(() => {
                    this.selectHeader();
                });
            }else{
                const d = this._matDialog.open(BillTaxComponent, {
                    autoFocus: false,
                    width: 'calc(100% - 50px)',
                    maxWidth: '100vw',
                    maxHeight: '80vh',
                    disableClose: true,
                    data     : {select : this.selection.selected, button : 'invoice'}
                });
                const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                    if (size.matches) {
                        d.updateSize('calc(100vw - 10px)','');
                    } else {
                        // d.updateSize('calc(100% - 50px)', '');
                    }
                });
                d.afterClosed().subscribe(() => {
                    this.selectHeader();
                    smallDialogSubscription.unsubscribe();
                });
            }
        }

        this._changeDetectorRef.markForCheck();
        this.selectHeader();
    }
}
