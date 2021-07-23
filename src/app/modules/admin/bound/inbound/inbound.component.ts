import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component, ElementRef,
    OnDestroy,
    OnInit, Renderer2,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {fuseAnimations} from '../../../../../@teamplat/animations';
import {merge, Observable, Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {InBound, InBoundHeader, InBoundHeaderPagenation} from './inbound.types';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {MatDialog} from '@angular/material/dialog';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {DeviceDetectorService} from 'ngx-device-detector';
import {InboundService} from './inbound.service';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {TableConfig, TableStyle} from '../../../../../@teamplat/components/common-table/common-table.types';
import {SelectionModel} from '@angular/cdk/collections';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {FunctionService} from '../../../../../@teamplat/services/function';
import {TransactionAlertComponent} from '../../../../../@teamplat/components/common-alert/transaction-alert';

@Component({
    selector: 'app-inbound',
    templateUrl: './inbound.component.html',
    styleUrls: ['./inbound.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class InboundComponent implements OnInit, OnDestroy, AfterViewInit {

    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild(MatSort) private _sort: MatSort;
    isMobile: boolean = false;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    selection = new SelectionModel<any>(true, []);

    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;

    inBoundHeaders$: Observable<InBoundHeader[]>;
    inBoundHeaderPagenation: InBoundHeaderPagenation | null = null;

    isLoading: boolean = false;
    inboundHeadersCount: number = 0;
    inBoundHeadersTableStyle: TableStyle = new TableStyle();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    inBoundHeadersTable: TableConfig[] = [
        {headerText : '작성일' , dataField : 'ibCreDate', display : false , disabled : true},
        {headerText : '입고일' , dataField : 'ibDate', width: 80, display : true, disabled : true, type: 'text'},
        {headerText : '입고번호' , dataField : 'ibNo', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '거래처' , dataField : 'account', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '거래처 명' , dataField : 'accountNm', width: 150, display : true, disabled : true, type: 'text'},
        {headerText : '유형' , dataField : 'type', width: 100, display : true, disabled : true, type: 'text',combo: true},
        {headerText : '상태' , dataField : 'status', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '공급사' , dataField : 'supplier', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '비고' , dataField : 'remarkHeader', width: 100, display : false, disabled : true, type: 'text'}
    ];
    inboundHeadersTableColumns: string[] = [
        'select',
        /*'no',*/
        'details',
        'ibCreDate',
        'ibDate',
        'ibNo',
        'account',
        'accountNm',
        'type',
        'status',
        'supplier',
        'remarkHeader',
    ];
    searchForm: FormGroup;
    selectedInboundHeader: InBoundHeader | null = null;
    ibType: CommonCode[] = null;
    ibStatus: CommonCode[] = null;
    filterList: string[];
    flashMessage: 'success' | 'error' | null = null;
    navigationSubscription: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();


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
        private _inboundService: InboundService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _codeStore: CodeStore,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _utilService: FuseUtilsService,
        private _functionService: FunctionService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.navigationSubscription = this._router.events.subscribe((e: any) => {
            // RELOAD로 설정했기때문에 동일한 라우트로 요청이 되더라도
            // 네비게이션 이벤트가 발생한다. 우리는 이 네비게이션 이벤트를 구독하면 된다.
            if (e instanceof NavigationEnd) {
                if(e.url === '/bound/inbound'){
                    this._inboundService.getHeader(0,10,'ibNo','desc',{});
                }
            }
        });
        this.ibType = _utilService.commonValue(_codeStore.getValue().data,'IB_TYPE');
        this.ibStatus = _utilService.commonValue(_codeStore.getValue().data,'IB_STATUS');
        this.isMobile = this._deviceService.isMobile();
    }
    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            type: ['ALL'],
            status: ['ALL'],
            accountNm: [''],
            searchCondition: ['100'],
            searchText: [''],
        });

        this.inBoundHeaders$ = this._inboundService.inBoundHeaders$;
        this._inboundService.inBoundHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inboundHeader: any) => {
                if(inboundHeader !== null){
                    this.inboundHeadersCount = inboundHeader.length;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._inboundService.inBoundHeaderPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inboundHeaderPagenation: InBoundHeaderPagenation) => {
                this.inBoundHeaderPagenation = inboundHeaderPagenation;
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
                    // console.log('change paginator!!');
                    // console.log(this._paginator.pageIndex);
                    // console.log(this._paginator.pageSize);
                    // console.log(this._sort.active);
                    // console.log(this._sort);
                    // this.closeDetails();
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._inboundService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchForm.getRawValue());
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
    trackByFn(index: number, inBound: any): any {
        return inBound.id || index;
    }
    /**
     * Toggle product details
     *
     * @param account
     */
    toggleDetails(ibNo: string): void
    {
        // If the Account is already selected...
        if ( this.selectedInboundHeader && this.selectedInboundHeader.ibNo === ibNo )
        {
            // Close the details
            this.closeDetails();
            return;
        }

        // Get the product by account
        this._inboundService.getInBoundsById(ibNo)
            .subscribe((inbound) => {
                // Set the selected Account
                this.selectedInboundHeader = inbound;

                // Fill the form
                // @ts-ignore
                this._inboundService.getDetail(0,10,'ibLineNo','asc', this.selectedInboundHeader);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Close the details
     */
    closeDetails(): void
    {
        this.selectedInboundHeader = null;
    }

    selectHeader(): void
    {
        if(this.searchForm.getRawValue().searchCondition === '100') {
            this.searchForm.patchValue({'account': ''});
            this.searchForm.patchValue({'accountNm': this.searchForm.getRawValue().searchText});
        }
        this._inboundService.getHeader(0,10,'ibNo','desc',this.searchForm.getRawValue());
        this.closeDetails();
    }
    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): any {
        const numSelected = this.selection.selected.length;
        const numRows = this.inboundHeadersCount;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): SelectionModel<any> {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }

        this.inBoundHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBoundHeader) => {
                this.selection.select(...inBoundHeader);
            });
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: any): string {
        if (!row) {
            return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
    }

    newIn(): void{
        this._router.navigate(['bound/inbound/inbound-new' , {}]);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    inBound(){
        if(this.selection.selected.length < 1){
            this._functionService.cfn_alert('입고 대상을 선택해주세요.');
            return;
        }else{
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for(let i=0; i<this.selection.selected.length; i++){
                if(this.selection.selected[i].status !== 'N' && this.selection.selected[i].status !== 'P'){
                    this._functionService.cfn_alert('입고할 수 없는 상태입니다. 입고번호 : ' + this.selection.selected[i].ibNo);
                    check = false;
                    return false;
                }
            }

            if(check){
                const transactionConfirm =this._matDialog.open(TransactionAlertComponent, {
                    data: {
                        msg: '입고하시겠습니까?'
                    }
                });
                transactionConfirm.afterClosed()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result) => {
                        if(result.status){
                            this.inBoundConfirm(this.selection.selected);
                        }else{
                            this.closeDetails();
                            this.selectClear();
                        }
                    });
            }

            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    cancel(){
        if(this.selection.selected.length < 1){
            this._functionService.cfn_alert('취소 대상을 선택해주세요.');
            return;
        }else{
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for(let i=0; i<this.selection.selected.length; i++){
                if(this.selection.selected[i].status !== 'N'){
                    this._functionService.cfn_alert('취소할 수 없는 상태입니다. 입고번호 : ' + this.selection.selected[i].ibNo);
                    check = false;
                    return false;
                }
            }

            if(check){
                const transactionConfirm =this._matDialog.open(TransactionAlertComponent, {
                    data: {
                        msg: '취소하시겠습니까?'
                    }
                });
                transactionConfirm.afterClosed()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result) => {
                        if(result.status){
                            this.inBoundCancel(this.selection.selected);
                        }else{
                            this.closeDetails();
                            this.selectClear();
                        }
                    });
            }

            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    close(){
        if(this.selection.selected.length < 1){
            this._functionService.cfn_alert('마감 대상을 선택해주세요.');
            return;
        }else{
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for(let i=0; i<this.selection.selected.length; i++){
                if(this.selection.selected[i].status === 'N' || this.selection.selected[i].status === 'C' || this.selection.selected[i].status === 'F'){
                    this._functionService.cfn_alert('마감할 수 없는 상태입니다. 입고번호 : ' + this.selection.selected[i].ibNo);
                    check = false;
                    return false;
                }
            }

            if(check){
                const transactionConfirm =this._matDialog.open(TransactionAlertComponent, {
                    data: {
                        msg: '마감하시겠습니까?'
                    }
                });
                transactionConfirm.afterClosed()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result) => {
                        if(result.status){
                            this.inBoundClose(this.selection.selected);
                        }else{
                            this.closeDetails();
                            this.selectClear();
                        }
                    });
            }
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    /* 입고
     *
     * @param sendData
     */
    inBoundConfirm(sendData: InBound[]): void{
        if(sendData){
            this._inboundService.inBoundConfirm(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((inBound: any) => {
                    this._functionService.cfn_alertCheckMessage(inBound);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    this.selectHeader();
                });
        }
    }

    /* 취소
     *
     * @param sendData
     */
    inBoundCancel(sendData: InBound[]): void{
        if(sendData){
            this._inboundService.inBoundCancel(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((inBound: any) => {
                    this._functionService.cfn_alertCheckMessage(inBound);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    this.selectHeader();
                });
        }
    }

    /* 마감
     *
     * @param sendData
     */
    inBoundClose(sendData: InBound[]): void{
        if(sendData){
            this._inboundService.inBoundClose(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((inBound: any) => {
                    this._functionService.cfn_alertCheckMessage(inBound);
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
