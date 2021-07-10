import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {merge, Observable, Subject} from 'rxjs';
import {OrderHeader, OrderHeaderPagenation} from './order.types';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {SelectionModel} from '@angular/cdk/collections';
import {ActivatedRoute, Router} from '@angular/router';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {OrderService} from './order.service';
import {map, switchMap, takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-order',
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild(MatPaginator) private _orderHeaderPagenator: MatPaginator;
    @ViewChild(MatSort) private _orderHeaderSort: MatSort;
    orderHeaders$: Observable<OrderHeader[]>;
    orderHeaderPagenation: OrderHeaderPagenation | null = null;
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    orderHeadersCount: number = 0;
    orderHeadersTableColumns: string[] = [
        'select',
        'no',
        'poCreDate',
        'poDate',
        'poNo',
        'account',
        'accountNm',
        'accountType',
        'type',
        'status',
        'email',
        'poAmt',
        'remarkHeader',
        'ibNo',
    ];
    selectedOrderHeader: OrderHeader = new OrderHeader();
    searchForm: FormGroup;

    status: CommonCode[] = null;
    type: CommonCode[] = null;
    accountType: CommonCode[] = null;
    searchCondition: CommonCode[] = [
        {
            id: '100',
            name: '거래처 명'
        }];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    selection = new SelectionModel<any>(true, []);

    constructor(private _activatedRoute: ActivatedRoute,
                private _router: Router,
                private _formBuilder: FormBuilder,
                private _orderService: OrderService,
                private _changeDetectorRef: ChangeDetectorRef,
                private _codeStore: CodeStore,
                private _utilService: FuseUtilsService)
    {
        this.status = _utilService.commonValue(_codeStore.getValue().data,'PO_STATUS');
        this.type = _utilService.commonValue(_codeStore.getValue().data,'PO_TYPE');
        this.accountType = _utilService.commonValue(_codeStore.getValue().data,'ACCOUNT_TYPE');
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            status: ['ALL'],
            type: ['ALL'],
            account: [''],
            accountNm: [''],
            searchCondition: ['100'],
            searchText: [''],
        });

        this._orderService.getHeader();

        // getHeader
        this.orderHeaders$ = this._orderService.orderHeaders$;

        this._orderService.orderHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((orderHeaders: any) => {
                // Update the counts
                if(orderHeaders !== null){
                    this.orderHeadersCount = orderHeaders.length;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the pagenation
        this._orderService.orderHeaderPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((orderHeaderPagenation: OrderHeaderPagenation) => {
                // Update the pagination
                this.orderHeaderPagenation = orderHeaderPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
    /**
     * After view init
     */
    ngAfterViewInit(): void {

        if(this._orderHeaderSort !== undefined){
            // Get products if sort or page changes
            merge(this._orderHeaderSort.sortChange, this._orderHeaderPagenator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._orderService.getHeader(this._orderHeaderPagenator.pageIndex, this._orderHeaderPagenator.pageSize, this._orderHeaderSort.active, this._orderHeaderSort.direction, this.searchForm.getRawValue());
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
    trackByFn(index: number, orderHeader: any): any {
        return orderHeader.id || index;
    }

    selectHeader(): void
    {
        if(this.searchForm.getRawValue().searchCondition === '100') {
            this.searchForm.patchValue({'account': ''});
            this.searchForm.patchValue({'accountNm': this.searchForm.getRawValue().searchText});
        }
        this._orderService.getHeader(0,10,'accountNm','asc',this.searchForm.getRawValue());
    }
    selectDoubleClickRow(row: any): void {
        this._router.navigate(['estimate-order/order/order-detail' , row]);
    }

    selectClickRow(row: any): void{
        this._router.navigate(['estimate-order/order/order-detail' , row]);
    }

    newOrder(): void{
        this._router.navigate(['estimate-order/order/order-new' , {}]);
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): SelectionModel<any> {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }
        this.orderHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((orderHeader) =>{
                this.selection.select(...orderHeader);
            });
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): any {
        const numSelected = this.selection.selected.length;
        const numRows = this.orderHeadersCount;
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
    orderConfirm() {
        console.log(this.selection.selected);
    }
}
