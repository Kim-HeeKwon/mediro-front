import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {merge, Observable, Subject} from 'rxjs';
import {Order, OrderHeader, OrderHeaderPagenation} from './order.types';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {SelectionModel} from '@angular/cdk/collections';
import {ActivatedRoute, Router} from '@angular/router';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {OrderService} from './order.service';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {DeviceDetectorService} from 'ngx-device-detector';
import {FunctionService} from '../../../../../@teamplat/services/function';
import {TeamPlatConfirmationService} from '../../../../../@teamplat/services/confirmation';
import {ShortcutsService} from '../../../../layout/common/shortcuts/shortcuts.service';
import {Shortcut} from '../../../../layout/common/shortcuts/shortcuts.types';
import * as moment from 'moment';

@Component({
    selector: 'app-order',
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild(MatPaginator) private _orderHeaderPagenator: MatPaginator;
    @ViewChild(MatSort) private _orderHeaderSort: MatSort;
    isMobile: boolean = false;
    isProgressSpinner: boolean = false;
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    orderHeaders$: Observable<OrderHeader[]>;
    orderHeaderPagenation: OrderHeaderPagenation | null = null;
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    orderHeadersCount: number = 0;
    orderHeadersTableColumns: string[] = [
        'select',
        'no',
        'poNo',
        'poCreDate',
        'poDate',
        'type',
        'status',
        /*'account',*/
        'accountNm',
        'email',
        /*'poAmt',
        'remarkHeader',*/
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
    shortCut: Shortcut = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    selection = new SelectionModel<any>(true, []);

    constructor(private _activatedRoute: ActivatedRoute,
                private _router: Router,
                private _formBuilder: FormBuilder,
                private _orderService: OrderService,
                private _changeDetectorRef: ChangeDetectorRef,
                private _codeStore: CodeStore,
                private _functionService: FunctionService,
                private _teamPlatConfirmationService: TeamPlatConfirmationService,
                private _utilService: FuseUtilsService,
                private _shortcutService: ShortcutsService,
                private _deviceService: DeviceDetectorService,)
    {
        this.status = _utilService.commonValue(_codeStore.getValue().data,'PO_STATUS');
        this.type = _utilService.commonValue(_codeStore.getValue().data,'PO_TYPE');
        this.accountType = _utilService.commonValue(_codeStore.getValue().data,'ACCOUNT_TYPE');
        this.isMobile = this._deviceService.isMobile();
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
            range: [{
                start: moment().utc(false).add(-7, 'day').endOf('day').toISOString(),
                end  : moment().utc(false).startOf('day').toISOString()
            }],
            start : [],
            end : []
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
        this.searchForm.patchValue({'start': this.searchForm.get('range').value.start});
        this.searchForm.patchValue({'end': this.searchForm.get('range').value.end});
        this._orderService.getHeader(0,10,'poNo','desc',this.searchForm.getRawValue());
        this.selectClear();
    }
    selectDoubleClickRow(row: any): void {
        this._router.navigate(['estimate-order/order/order-detail' , row]);
    }

    selectClickRow(row: any): void{
        //숏컷 생성

        this.shortCut = {
            id: '발주디테일',
            label: '발주디테일',
            icon: 'heroicons_outline:pencil-alt',
            link: 'estimate-order/order/order-detail',
            useRouter:true
        };
        this._shortcutService.create(this.shortCut).subscribe();
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
    // 발주
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    orderConfirm() {
        if(this.selection.selected.length < 1){
            this._functionService.cfn_alert('발주 대상을 선택해주세요.');
            return;
        }else{
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for(let i=0; i<this.selection.selected.length; i++){
                if(this.selection.selected[i].status !== 'S' && this.selection.selected[i].status !== 'P'){
                    this._functionService.cfn_alert('발주할 수 없는 상태입니다. 견적번호 : ' + this.selection.selected[i].poNo);
                    check = false;
                    return false;
                }
            }

            if(check){
                const confirmation = this._teamPlatConfirmationService.open({
                    title  : '',
                    message: '발주하시겠습니까?',
                    actions: {
                        confirm: {
                            label: '확인'
                        },
                        cancel: {
                            label: '닫기'
                        }
                    }
                });

                confirmation.afterClosed()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result) => {
                        if(result){
                            this.orderConfirmCall(this.selection.selected);
                        }else{
                            this.selectClear();
                        }
                    });
            }
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }
    orderConfirmCall(sendData: Order[]): void{
        if(sendData){
            this._orderService.orderConfirm(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((estimate: any) => {
                    this._functionService.cfn_alertCheckMessage(estimate);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    this.selectHeader();
                });
        }
    }
    // 발송
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    orderSend() {
        if(this.selection.selected.length < 1){
            this._functionService.cfn_alert('발송 대상을 선택해주세요.');
            return;
        }else{
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for(let i=0; i<this.selection.selected.length; i++){
                if(this.selection.selected[i].status === 'CF' || this.selection.selected[i].status === 'P' || this.selection.selected[i].status === 'C'){
                    this._functionService.cfn_alert('발송할 수 없는 상태입니다. 발주번호 : ' + this.selection.selected[i].poNo);
                    check = false;
                    return false;
                }
            }

            if(check){
                const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
                    title      : '',
                    message    : '발송하시겠습니까?',
                    icon       : this._formBuilder.group({
                        show : true,
                        name : 'heroicons_outline:mail',
                        color: 'primary'
                    }),
                    actions    : this._formBuilder.group({
                        confirm: this._formBuilder.group({
                            show : true,
                            label: '발송',
                            color: 'accent'
                        }),
                        cancel : this._formBuilder.group({
                            show : true,
                            label: '닫기'
                        })
                    }),
                    dismissible: true
                }).value);

                confirmation.afterClosed()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result) => {
                        if(result){
                            this.isProgressSpinner = true;
                            this.orderSendCall(this.selection.selected);
                        }else{
                            this.selectClear();
                        }
                    });
            }
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }
    orderSendCall(sendData: Order[]): void{
        if(sendData){
            this._orderService.orderSend(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((order: any) => {
                    this.isProgressSpinner = false;
                    this._functionService.cfn_alertCheckMessage(order);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    this.selectHeader();
                });
        }
    }
    // 취소
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    orderCancel() {
        if(this.selection.selected.length < 1){
            this._functionService.cfn_alert('취소 대상을 선택해주세요.');
            return;
        }else{
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for(let i=0; i<this.selection.selected.length; i++){
                if(this.selection.selected[i].status !== 'N'){
                    this._functionService.cfn_alert('취소할 수 없는 상태입니다. 발주번호 : ' + this.selection.selected[i].poNo);
                    check = false;
                    return false;
                }
            }

            if(check){
                const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
                    title      : '',
                    message    : '취소하시겠습니까?',
                    icon       : this._formBuilder.group({
                        show : true,
                        name : 'heroicons_outline:exclamation',
                        color: 'warn'
                    }),
                    actions    : this._formBuilder.group({
                        confirm: this._formBuilder.group({
                            show : true,
                            label: '취소',
                            color: 'warn'
                        }),
                        cancel : this._formBuilder.group({
                            show : true,
                            label: '닫기'
                        })
                    }),
                    dismissible: true
                }).value);

                confirmation.afterClosed()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result) => {
                        if (result) {
                            this.orderCancelCall(this.selection.selected);
                        }else{
                            this.selectClear();
                        }
                    });
            }
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }
    orderCancelCall(sendData: Order[]): void{
        if(sendData){
            this._orderService.orderCancel(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((order: any) => {
                    this._functionService.cfn_alertCheckMessage(order);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    this.selectHeader();
                });
        }
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    selectClear() {
        this.selection.clear();
        this._changeDetectorRef.markForCheck();
    }

}
