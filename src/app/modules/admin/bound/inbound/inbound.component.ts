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
import {TeamPlatConfirmationService} from '../../../../../@teamplat/services/confirmation';
import * as moment from 'moment';

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
        {headerText : '????????????' , dataField : 'ibNo', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '?????????' , dataField : 'ibCreDate', display : false , disabled : true},
        {headerText : '?????????' , dataField : 'ibDate', width: 80, display : true, disabled : true, type: 'text'},
        {headerText : '?????????' , dataField : 'account', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '????????? ???' , dataField : 'accountNm', width: 150, display : true, disabled : true, type: 'text'},
        {headerText : '??????' , dataField : 'type', width: 100, display : true, disabled : true, type: 'text',combo: true},
        {headerText : '??????' , dataField : 'status', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '?????????' , dataField : 'supplier', width: 100, display : false, disabled : true, type: 'text'},
        {headerText : '??????' , dataField : 'remarkHeader', width: 100, display : false, disabled : true, type: 'text'},
        {headerText : '????????????' , dataField : 'poNo', width: 100, display : false, disabled : true, type: 'text'}
    ];
    inboundHeadersTableColumns: string[] = [
        'select',
        /*'no',*/
        'details',
        'ibNo',
        'ibCreDate',
        /*'ibDate',*/
        'type',
        'status',
        /*'account',*/
        'accountNm',
        /*'supplier',*/
        /*'remarkHeader',*/
        'poNo',
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
            name: '????????? ???'
        }];
    constructor(
        private _matDialog: MatDialog,
        public _matDialogPopup: MatDialog,
        private _formBuilder: FormBuilder,
        private _inboundService: InboundService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _codeStore: CodeStore,
        private _activatedRoute: ActivatedRoute,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _router: Router,
        private _utilService: FuseUtilsService,
        private _functionService: FunctionService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.navigationSubscription = this._router.events.subscribe((e: any) => {
            // RELOAD??? ????????????????????? ????????? ???????????? ????????? ????????????
            // ??????????????? ???????????? ????????????. ????????? ??? ??????????????? ???????????? ???????????? ??????.
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
        this.searchForm.patchValue({'start': this.searchForm.get('range').value.start});
        this.searchForm.patchValue({'end': this.searchForm.get('range').value.end});
        this._inboundService.getHeader(0,10,'ibNo','desc',this.searchForm.getRawValue());
        this.closeDetails();
        this.selectClear();
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
            this._functionService.cfn_alert('?????? ????????? ??????????????????.');
            return;
        }else{
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for(let i=0; i<this.selection.selected.length; i++){
                if(this.selection.selected[i].status !== 'N' && this.selection.selected[i].status !== 'P'){
                    this._functionService.cfn_alert('????????? ??? ?????? ???????????????. ???????????? : ' + this.selection.selected[i].ibNo);
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
                this._functionService.cfn_alert('?????? ????????? ??????????????????.');
                return;
            }else{
                let check = true;
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for(let i=0; i<this.selection.selected.length; i++){
                    if(this.selection.selected[i].status !== 'N'){
                        this._functionService.cfn_alert('????????? ??? ?????? ???????????????. ???????????? : ' + this.selection.selected[i].ibNo);
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
            this._functionService.cfn_alert('?????? ????????? ??????????????????.');
            return;
        }else{
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for(let i=0; i<this.selection.selected.length; i++){
                if(this.selection.selected[i].status === 'N' || this.selection.selected[i].status === 'C' || this.selection.selected[i].status === 'F'){
                    this._functionService.cfn_alert('????????? ??? ?????? ???????????????. ???????????? : ' + this.selection.selected[i].ibNo);
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
                        color: 'warning'
                    }),
                    actions    : this._formBuilder.group({
                        confirm: this._formBuilder.group({
                            show : true,
                            label: '??????',
                            color: 'primary'
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

    /* ??????
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

    /* ??????
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

    /* ??????
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
