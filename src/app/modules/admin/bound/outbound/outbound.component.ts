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
import {OutBound, OutBoundHeader, OutBoundHeaderPagenation} from './outbound.types';
import {TableConfig, TableStyle} from '../../../../../@teamplat/components/common-table/common-table.types';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {MatDialog} from '@angular/material/dialog';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {DeviceDetectorService} from 'ngx-device-detector';
import {OutboundService} from './outbound.service';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {FunctionService} from '../../../../../@teamplat/services/function';
import {TeamPlatConfirmationService} from '../../../../../@teamplat/services/confirmation';
import {CommonScanComponent} from '../../../../../@teamplat/components/common-scan';
import * as moment from 'moment';

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
        {headerText : '????????????' , dataField : 'obNo', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '?????????' , dataField : 'obCreDate', display : false , disabled : true},
        {headerText : '?????????' , dataField : 'obDate', width: 80, display : true, disabled : true, type: 'text'},
        {headerText : '?????????' , dataField : 'account', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '????????? ???' , dataField : 'accountNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '??????' , dataField : 'address', width: 150, display : true, disabled : true, type: 'text'},
        {headerText : '??????' , dataField : 'type', width: 100, display : true, disabled : true, type: 'text',combo: true},
        {headerText : '??????' , dataField : 'status', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '?????????' , dataField : 'dlvAccount', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '?????????' , dataField : 'dlvAccountNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '????????????' , dataField : 'dlvAddress', width: 150, display : true, disabled : true, type: 'text'},
        {headerText : '????????????' , dataField : 'dlvDate', width: 80, display : true, disabled : true, type: 'text'},
        {headerText : '??????' , dataField : 'remarkHeader', width: 100, display : false, disabled : true, type: 'text'}
    ];
    outBoundHeadersTableColumns: string[] = [
        'select',
        'details',
        'obNo',
        'obCreDate',
        'obDate',
        'type',
        'status',
        /*'account',*/
        'accountNm',
        'address',
        /*'dlvAccount',
        'dlvAddress',
        'dlvDate',
        'remarkHeader',*/
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
            name: '????????? ???'
        }];

    constructor(
        private _matDialog: MatDialog,
        public _matDialogPopup: MatDialog,
        private _formBuilder: FormBuilder,
        private _outboundService: OutboundService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _codeStore: CodeStore,
        private _activatedRoute: ActivatedRoute,
        private _functionService: FunctionService,
        private _router: Router,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.navigationSubscription = this._router.events.subscribe((e: any) => {
            // RELOAD??? ????????????????????? ????????? ???????????? ????????? ????????????
            // ??????????????? ???????????? ????????????. ????????? ??? ??????????????? ???????????? ???????????? ??????.
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
        // ?????? Form ??????
        this.searchForm = this._formBuilder.group({
            type: ['ALL'],
            status: ['ALL'],
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
        this.searchForm.patchValue({'start': this.searchForm.get('range').value.start});
        this.searchForm.patchValue({'end': this.searchForm.get('range').value.end});
        this._outboundService.getHeader(0,10,'obNo','desc',this.searchForm.getRawValue());
        this.closeDetails();
        this.selectClear();
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

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    outBound() {
        if(this.selection.selected.length < 1){
            this._functionService.cfn_alert('?????? ????????? ??????????????????.');
            return;
        }else{
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for(let i=0; i<this.selection.selected.length; i++){
                if(this.selection.selected[i].status !== 'N' && this.selection.selected[i].status !== 'P'){
                    this._functionService.cfn_alert('????????? ??? ?????? ???????????????. ???????????? : ' + this.selection.selected[i].obNo);
                    check = false;
                    return false;
                }
            }

            if(check){
                const confirmation = this._teamPlatConfirmationService.open({
                    title  : '??????',
                    message: '?????????????????????????',
                    actions: {
                        confirm: {
                            label: '??????'
                        },
                        cancel: {
                            label: '??????'
                        }
                    }
                });

                confirmation.afterClosed()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result) => {
                        if(result){
                            this.outBoundConfirm(this.selection.selected);
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
    cancel() {
        if(this.selection.selected.length < 1){
            this._functionService.cfn_alert('?????? ????????? ??????????????????.');
            return;
        }else{
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for(let i=0; i<this.selection.selected.length; i++){
                if(this.selection.selected[i].status !== 'N'){
                    this._functionService.cfn_alert('????????? ??? ?????? ???????????????. ???????????? : ' + this.selection.selected[i].obNo);
                    check = false;
                    return false;
                }
            }

            if(check){
                const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
                    title      : '',
                    message    : '?????????????????????????',
                    icon       : this._formBuilder.group({
                        show : true,
                        name : 'heroicons_outline:exclamation',
                        color: 'warn'
                    }),
                    actions    : this._formBuilder.group({
                        confirm: this._formBuilder.group({
                            show : true,
                            label: '??????',
                            color: 'warn'
                        }),
                        cancel : this._formBuilder.group({
                            show : true,
                            label: '??????'
                        })
                    }),
                    dismissible: true
                }).value);
                confirmation.afterClosed()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result) => {
                        if (result) {
                            this.outBoundCancel(this.selection.selected);
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

    /* ??????
     *
     * @param sendData
     */
    outBoundCancel(sendData: OutBound[]): void{
        if(sendData){
            this._outboundService.outBoundCancel(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((outBound: any) => {
                    this._functionService.cfn_alertCheckMessage(outBound);
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
    /* ??????
     *
     * @param sendData
     */
    outBoundConfirm(sendData: OutBound[]): void{
        if(sendData){
            this._outboundService.outBoundConfirm(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((inBound: any) => {
                    this._functionService.cfn_alertCheckMessage(inBound);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    this.selectHeader();
                });
        }
    }

    openScanPopup(): void {
        if(!this.isMobile){
            this._matDialog.open(CommonScanComponent, {
                autoFocus: false,
                disableClose: true,
                data     : {
                    note: {}
                },
            });
        }else{
            const d = this._matDialog.open(CommonScanComponent, {
                data: {
                    confirmText : '??????',
                },
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
