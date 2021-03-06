import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {fuseAnimations} from "../../../../../@teamplat/animations";
import {merge, Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {SelectionModel} from "@angular/cdk/collections";
import {Stock, StockHistory, StockPagenation} from "../../stock/stock/stock.types";
import {TableConfig, TableStyle} from "../../../../../@teamplat/components/common-table/common-table.types";
import {InvoiceDetail, InvoiceHeader, InvoiceHeaderPagenation} from "./tax.types";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CommonCode, FuseUtilsService} from "../../../../../@teamplat/services/utils";
import {MatDialog} from "@angular/material/dialog";
import {StockService} from "../../stock/stock/stock.service";
import {CodeStore} from "../../../../core/common-code/state/code.store";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {DeviceDetectorService} from "ngx-device-detector";
import {TaxService} from "./tax.service";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {TeamPlatConfirmationService} from "../../../../../@teamplat/services/confirmation";
import {SessionStore} from "../../../../core/session/state/session.store";
import {environment} from "../../../../../environments/environment";

@Component({
    selector: 'app-tax',
    templateUrl: './tax.component.html',
    styleUrls: ['./tax.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class TaxComponent implements OnInit, OnDestroy, AfterViewInit {

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

    invoiceHeaders$: Observable<InvoiceHeader[]>;
    invoiceDetails$: Observable<InvoiceDetail[]>;
    invoiceHeaderPagenation: InvoiceHeaderPagenation | null = null;
    isLoading: boolean = false;
    invoiceHeadersCount: number = 0;
    invoiceHeadersTableStyle: TableStyle = new TableStyle();

    invoiceHeadersTable: TableConfig[] = [
        {headerText: '????????????', dataField: 'invoice', width: 100, display: true, disabled: true, type: 'text'},
        // {headerText: '????????????', dataField: 'writeDate', width: 100, display: true, disabled: true, type: 'text'},
        //{headerText: '????????????', dataField: 'invoiceDate', width: 100, display: true, disabled: true, type: 'text'},
        {headerText: '????????? ????????????', dataField: 'taxBillNo', width: 100, display: true, disabled: true, type: 'text'},
        {headerText : '????????? ???????????????' , dataField : 'bisNo', width: 100, display : true, disabled : true, type: 'text'},
        {headerText: '?????????', dataField: 'accountNm', width: 100, display: true, disabled: true, type: 'text'},
        {headerText : '???????????? ??? ???????????????' , dataField : 'toBisNo', width: 100, display : true, disabled : true, type: 'text'},
        {headerText: '???????????? ???', dataField: 'toAccountNm', width: 100, display: true, disabled: true, type: 'text'},
        {headerText : '??????' , dataField : 'type', width: 100, display : true, disabled : true, type: 'text', combo: true},
        {headerText : '??????' , dataField : 'status', width: 100, display : true, disabled : true, type: 'text', combo: true},
        {headerText : '????????????' , dataField : 'issueType', width: 100, display : true, disabled : true, type: 'text', combo: true},
        {headerText : '????????????' , dataField : 'taxType', width: 100, display : true, disabled : true, type: 'text', combo: true},
        {headerText : '????????????' , dataField : 'chargeDirection', width: 100, display : true, disabled : true, type: 'text', combo: true},
        {headerText : '??????/??????' , dataField : 'purposeType', width: 100, display : true, disabled : true, type: 'text', combo: true},
        {headerText: '??? ????????????', dataField: 'supplyAmt', width: 80, display: true, disabled: true, type: 'number'},
        {headerText: '??? ??????', dataField: 'taxAmt', width: 80, display: true, disabled: true, type: 'number'},
        {headerText: '??? ??????', dataField: 'totalAmt', width: 80, display: true, disabled: true, type: 'number'},
        // {headerText : '??????' , dataField : 'remark', width: 100, display : true, disabled : true, type: 'text'},
    ];

    invoiceHeadersTableColumns: string[] = [
        'select',
        // 'no',
        'details',
        'invoice',
        'taxBillNo',
        // 'writeDate',
        //'invoiceDate',
        'bisNo',
        'accountNm',
        'toBisNo',
        'toAccountNm',
        'type',
        'status',
        'issueType',
        'taxType',
        'chargeDirection',
        'purposeType',
        'supplyAmt',
        'taxAmt',
        'totalAmt',
        // 'remark'
    ];

    searchForm: FormGroup;
    selectedinvoiceHeader: InvoiceHeader | null = null;
    filterList: string[];
    flashMessage: 'success' | 'error' | null = null;
    navigationSubscription: any;
    type: CommonCode[] = null;
    status: CommonCode[] = null;
    issueType: CommonCode[] = null;
    taxType: CommonCode[] = null;
    chargeDirection: CommonCode[] = null;
    purposeType: CommonCode[] = null;
    searchCondition: CommonCode[] = [
        {
            id: '100',
            name: '????????? ???'
        }];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _matDialog: MatDialog,
        public _matDialogPopup: MatDialog,
        private _formBuilder: FormBuilder,
        private _taxService: TaxService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _common: Common,
        private _codeStore: CodeStore,
        private _activatedRoute: ActivatedRoute,
        private _sessionStore: SessionStore,
        private _router: Router,
        private _functionService: FunctionService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver) {
        this.type = _utilService.commonValue(_codeStore.getValue().data, 'INVOICE_TYPE');
        this.status = _utilService.commonValue(_codeStore.getValue().data, 'INVOICE_STATUS');
        this.issueType = _utilService.commonValue(_codeStore.getValue().data, 'ISSUE_TYPE');
        this.taxType = _utilService.commonValue(_codeStore.getValue().data, 'TAX_TYPE');
        this.chargeDirection = _utilService.commonValue(_codeStore.getValue().data, 'CH_DIRECTION');
        this.purposeType = _utilService.commonValue(_codeStore.getValue().data, 'PURPOSE_TYPE');
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
            accountNm: [''],
            searchCondition: ['100'],
            searchText: [''],
        });

        this.invoiceHeaders$ = this._taxService.invoiceHeaders$;
        this._taxService.invoiceHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((invoiceHeader: any) => {
                if (invoiceHeader !== null) {
                    this.invoiceHeadersCount = invoiceHeader.length;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._taxService.invoiceHeaderPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((invoiceHeaderPagenation: InvoiceHeaderPagenation) => {
                this.invoiceHeaderPagenation = invoiceHeaderPagenation;
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
                    return this._taxService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchForm.getRawValue());
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
    trackByFn(index: number, invoice: any): any {
        return invoice.id || index;
    }

    /**
     * Toggle product details
     *
     * @param account
     */
    toggleDetails(invoice: string): void {
        if (this.selectedinvoiceHeader && this.selectedinvoiceHeader.invoice === invoice) {
            // Close the details
            this.closeDetails();
            return;
        }

        this._taxService.getInvoiceDetailById(invoice)
            .subscribe((invoiceHeader) => {
                this.selectedinvoiceHeader = invoiceHeader;
                this._taxService.getDetail(0, 10, 'lineNo', 'asc', this.selectedinvoiceHeader);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
    /**
     * Close the details
     */
    closeDetails(): void {
        this.selectedinvoiceHeader = null;
    }

    selectHeader(): void {
        if (this.searchForm.getRawValue().searchCondition === '100') {
            this.searchForm.patchValue({'accountNm': this.searchForm.getRawValue().searchText});
        }
        this._taxService.getHeader(0, 10, 'invoice', 'desc', this.searchForm.getRawValue());
        this.closeDetails();
        this.selectClear();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getComboData(column: TableConfig) {
        let combo;
        if (column.dataField === 'itemGrade') {
        }
        return combo;
    }

    //???????????? ??????
    selectClickRow(invoiceHeader: any): void {

        this._common.sendDataChgUrl(invoiceHeader,environment.serverTaxUrl + '/v1/api/calculate/tax/getPrintURL')
            .subscribe((param: any) => {
                if(param.status !== 'SUCCESS'){

                    const icon = 'information-circle';
                    // Setup config form
                    this._functionService.configForm = this._formBuilder.group({
                        title      : '',
                        message    : param.msg,
                        icon       : this._formBuilder.group({
                            show : true,
                            name : 'heroicons_outline:' + icon,
                            color: 'accent'
                        }),
                        actions    : this._formBuilder.group({
                            confirm: this._formBuilder.group({
                                show : false,
                                label: '',
                            }),
                            cancel : this._formBuilder.group({
                                show : true,
                                label: '??????'
                            })
                        }),
                        dismissible: true
                    });
                    const confirmation = this._teamPlatConfirmationService.open(this._functionService.configForm.value);
                }else{
                    window.open(param.data[0].url, '?????? ??????(' + invoiceHeader.invoice + ')','top=50,left=200,width=1100,height=700');
                }
            });
    }

    //??????
    invoice(): void {
        if(this.selection.selected.length < 1){
            this._functionService.cfn_alert('????????? ??????????????????.');
            return;
        }else{
            const confirmation = this._teamPlatConfirmationService.open({
                title  : '',
                message: '?????? ???????????????????',
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
                    if(result) {
                        if(this.selection.selected){
                            this._taxService.invoice(this.headerDataSet(this.selection.selected))
                                .pipe(takeUntil(this._unsubscribeAll))
                                .subscribe((bill: any) => {
                                    this.cfn_alertCheckMessage(bill);
                                    // Mark for check
                                    this._changeDetectorRef.markForCheck();
                                });
                        }
                    }
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    //?????? ??????
    invoiceCancel(): void {
        if(this.selection.selected.length < 1){
            this._functionService.cfn_alert('????????? ??????????????????.');
            return;
        }else{
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
                    if(result) {
                        if(this.selection.selected){
                            this._taxService.invoiceCancel(this.headerDataSet(this.selection.selected))
                                .pipe(takeUntil(this._unsubscribeAll))
                                .subscribe((bill: any) => {
                                    this.cfn_alertCheckMessage(bill);
                                    // Mark for check
                                    this._changeDetectorRef.markForCheck();
                                });
                        }
                    }
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    //??????
    invoiceDelete(): void {
        if(this.selection.selected.length < 1){
            this._functionService.cfn_alert('????????? ??????????????????.');
            return;
        }else{
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
                    if(result) {
                        if(this.selection.selected){
                            this._taxService.invoiceDelete(this.headerDataSet(this.selection.selected))
                                .pipe(takeUntil(this._unsubscribeAll))
                                .subscribe((bill: any) => {
                                    this.cfn_alertCheckMessage(bill);
                                    // Mark for check
                                    this._changeDetectorRef.markForCheck();
                                });
                        }
                    }
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): SelectionModel<any> {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }
        this.invoiceHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((invoiceHeader) =>{
                this.selection.select(...invoiceHeader);
            });
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): any {
        const numSelected = this.selection.selected.length;
        const numRows = this.invoiceHeadersCount;
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

    // eslint-disable-next-line @typescript-eslint/naming-convention
    cfn_alertCheckMessage(param: any, redirectUrl?: string): void
    {
        if(param.status !== 'SUCCESS'){

            const icon = 'information-circle';
            // Setup config form
            this._functionService.configForm = this._formBuilder.group({
                title      : '',
                message    : param.msg,
                icon       : this._formBuilder.group({
                    show : true,
                    name : 'heroicons_outline:' + icon,
                    color: 'accent'
                }),
                actions    : this._formBuilder.group({
                    confirm: this._formBuilder.group({
                        show : false,
                        label: '',
                    }),
                    cancel : this._formBuilder.group({
                        show : true,
                        label: '??????'
                    })
                }),
                dismissible: true
            });
            const confirmation = this._teamPlatConfirmationService.open(this._functionService.configForm.value);
        }else{
            this._functionService.cfn_alert('??????????????? ?????????????????????.','check-circle');
            this.selectHeader();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(selected: any[]) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i=0; i<selected.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            selected[i].popBillId = this._sessionStore.getValue().popBillId;
        }
        return selected;
    }
}
