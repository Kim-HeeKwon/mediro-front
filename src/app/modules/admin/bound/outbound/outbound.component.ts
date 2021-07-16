import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {fuseAnimations} from '../../../../../@teamplat/animations';
import {merge, Observable, Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {SelectionModel} from '@angular/cdk/collections';
import {OutBoundHeader, OutBoundHeaderPagenation} from './outbound.types';
import {TableConfig, TableStyle} from '../../../../../@teamplat/components/common-table/common-table.types';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {MatDialog} from '@angular/material/dialog';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {DeviceDetectorService} from 'ngx-device-detector';
import {OutboundService} from './outbound.service';
import {map, switchMap, takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-outbound',
    templateUrl: './outbound.component.html',
    styleUrls: ['./outbound.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class OutboundComponent implements OnInit, OnDestroy, AfterViewInit {
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

    outBoundHeaders$: Observable<OutBoundHeader[]>;
    outBoundHeaderPagenation: OutBoundHeaderPagenation | null = null;
    isLoading: boolean = false;
    outBoundHeadersCount: number = 0;
    outBoundHeadersTableStyle: TableStyle = new TableStyle();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    outBoundHeadersTable: TableConfig[] = [
        {headerText : '작성일' , dataField : 'obCreDate', display : false , disabled : true},
        {headerText : '출고일' , dataField : 'obDate', width: 80, display : true, disabled : true, type: 'text'},
        {headerText : '출고번호' , dataField : 'obNo', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '거래처' , dataField : 'account', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '거래처 명' , dataField : 'accountNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '주소' , dataField : 'address', width: 150, display : true, disabled : true, type: 'text'},
        {headerText : '유형' , dataField : 'type', width: 100, display : true, disabled : true, type: 'text',combo: true},
        {headerText : '상태' , dataField : 'status', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '배송처' , dataField : 'dlvAccount', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '배송주소' , dataField : 'dlvAddress', width: 150, display : true, disabled : true, type: 'text'},
        {headerText : '배송일' , dataField : 'dlvDate', width: 80, display : true, disabled : true, type: 'text'},
        {headerText : '비고' , dataField : 'remarkHeader', width: 100, display : false, disabled : true, type: 'text'}
    ];
    outBoundHeadersTableColumns: string[] = [
        'select',
        'details',
        'obCreDate',
        'obDate',
        'obNo',
        'account',
        'accountNm',
        'address',
        'type',
        'status',
        'dlvAccount',
        'dlvAddress',
        'dlvDate',
        'remarkHeader',
    ];
    searchForm: FormGroup;
    selectedOutboundHeader: OutBoundHeader | null = null;
    obType: CommonCode[] = null;
    obStatus: CommonCode[] = null;
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
        private _outboundService: OutboundService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _codeStore: CodeStore,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.navigationSubscription = this._router.events.subscribe((e: any) => {
            // RELOAD로 설정했기때문에 동일한 라우트로 요청이 되더라도
            // 네비게이션 이벤트가 발생한다. 우리는 이 네비게이션 이벤트를 구독하면 된다.
            if (e instanceof NavigationEnd) {
                if(e.url === '/bound/outbound'){
                    this._outboundService.getHeader(0,10,'obNo','desc',{});
                }
            }
        });
        this.obType = _utilService.commonValue(_codeStore.getValue().data,'OB_TYPE');
        this.obStatus = _utilService.commonValue(_codeStore.getValue().data,'OB_STATUS');
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
        this.outBoundHeaders$ = this._outboundService.outBoundHeaders$;

        this._outboundService.outBoundHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBoundHeader: any) => {
                if(outBoundHeader !== null){
                    this.outBoundHeadersCount = outBoundHeader.length;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._outboundService.outBoundHeaderPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBoundHeaderPagenation: OutBoundHeaderPagenation) => {
                this.outBoundHeaderPagenation = outBoundHeaderPagenation;
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
                    return this._outboundService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchForm.getRawValue());
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
    trackByFn(index: number, outBound: any): any {
        return outBound.id || index;
    }
    /**
     * Toggle product details
     *
     * @param account
     */
    toggleDetails(obNo: string): void
    {
        // If the Account is already selected...
        if ( this.selectedOutboundHeader && this.selectedOutboundHeader.obNo === obNo )
        {
            // Close the details
            this.closeDetails();
            return;
        }

        // Get the product by account
        this._outboundService.getOutBoundsById(obNo)
            .subscribe((outBound) => {
                // Set the selected Account
                this.selectedOutboundHeader = outBound;

                // Fill the form
                // @ts-ignore
                this._outboundService.getDetail(0,10,'obLineNo','asc', this.selectedOutboundHeader);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Close the details
     */
    closeDetails(): void
    {
        this.selectedOutboundHeader = null;
    }

    selectHeader(): void
    {
        if(this.searchForm.getRawValue().searchCondition === '100') {
            this.searchForm.patchValue({'account': ''});
            this.searchForm.patchValue({'accountNm': this.searchForm.getRawValue().searchText});
        }
        this._outboundService.getHeader(0,10,'obNo','desc',this.searchForm.getRawValue());
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): any {
        const numSelected = this.selection.selected.length;
        const numRows = this.outBoundHeadersCount;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): SelectionModel<any> {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }

        this.outBoundHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBoundHeader) => {
                this.selection.select(...outBoundHeader);
            });
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: any): string {
        if (!row) {
            return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
    }

    newOut(): void{
        this._router.navigate(['bound/outbound/outbound-new' , {}]);
    }

}
