import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {fuseAnimations} from '../../../../../../@teamplat/animations';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTable} from '@angular/material/table';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FuseAlertType} from '../../../../../../@teamplat/components/alert';
import {CommonCode, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {Observable, Subject} from 'rxjs';
import {SelectionModel} from '@angular/cdk/collections';
import {SalesOrder, SalesOrderDetail, SalesOrderDetailPagenation} from '../salesorder.types';
import {TableConfig, TableStyle} from '../../../../../../@teamplat/components/common-table/common-table.types';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {SalesorderService} from '../salesorder.service';
import {takeUntil} from 'rxjs/operators';
import {CommonPopupComponent} from '../../../../../../@teamplat/components/common-popup';
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import {FunctionService} from '../../../../../../@teamplat/services/function';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {DeviceDetectorService} from 'ngx-device-detector';

@Component({
    selector       : 'salesorder-new',
    templateUrl    : './salesorder-new.component.html',
    styleUrls: ['./salesorder-new.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class SalesorderNewComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatPaginator) private _salesorderDetailPagenator: MatPaginator;
    @ViewChild(MatSort) private _salesorderDetailSort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild(MatTable,{static:true}) _table: MatTable<any>;
    isLoading: boolean = false;
    salesorderHeaderForm: FormGroup;
    flashMessage: 'success' | 'error' | null = null;
    salesorderDetailsCount: number = 0;
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    isMobile: boolean = false;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    // eslint-disable-next-line @typescript-eslint/member-ordering
    showAlert: boolean = false;

    type: CommonCode[] = null;
    status: CommonCode[] = null;
    filterList: string[];
    estimateHeader: any;
    estimateDetail: any;

    salesorderDetailPagenation: SalesOrderDetailPagenation | null = null;
    salesorderDetails$ = new Observable<SalesOrderDetail[]>();
    selection = new SelectionModel<any>(true, []);
    salesorderDetailsTableStyle: TableStyle = new TableStyle();

    salesorderDetailsTable: TableConfig[] = [
        {headerText : '????????????' , dataField : 'soLineNo', display : false},
        {headerText : '????????????' , dataField : 'itemCd', width: 80, display : true, type: 'text',validators: true},
        {headerText : '?????????' , dataField : 'itemNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '??????' , dataField : 'standard', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '??????' , dataField : 'unit', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '??????' , dataField : 'poReqQty', width: 50, display : true, type: 'number', style: this.salesorderDetailsTableStyle.textAlign.right},
        {headerText : '??????' , dataField : 'invQty', width: 50, display : true, type: 'number', style: this.salesorderDetailsTableStyle.textAlign.right},
        {headerText : '????????????' , dataField : 'reqQty', width: 70, display : true, type: 'number', style: this.salesorderDetailsTableStyle.textAlign.right,validators: true},
        /*{headerText : '????????????' , dataField : 'qty', width: 50, display : true, type: 'number', style: this.salesorderDetailsTableStyle.textAlign.right},*/
        {headerText : '??????' , dataField : 'unitPrice', width: 50, display : true, type: 'number', style: this.salesorderDetailsTableStyle.textAlign.right,validators: true},
        {headerText : '????????????' , dataField : 'soAmt', width: 50, display : true, disabled : true, type: 'number', style: this.salesorderDetailsTableStyle.textAlign.right},
        {headerText : '??????' , dataField : 'remarkDetail', width: 100, display : true, type: 'text'},
    ];

    salesorderDetailsTableColumns: string[] = [
        'select',
        'no',
        'soLineNo',
        'itemCd',
        'itemNm',
        'standard',
        'unit',
        'poReqQty',
        'invQty',
        'reqQty',
        /*'qty',*/
        'unitPrice',
        'soAmt',
        'remarkDetail',
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _matDialog: MatDialog,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _formBuilder: FormBuilder,
        public _matDialogPopup: MatDialog,
        private _codeStore: CodeStore,
        private _changeDetectorRef: ChangeDetectorRef,
        private _salesorderService: SalesorderService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _functionService: FunctionService,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.filterList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data,'SO_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data,'SO_STATUS', this.filterList);

        if(this._router.getCurrentNavigation() !== (null && undefined)){

            if(this._router.getCurrentNavigation().extras.state !== undefined){
                if(this._router.getCurrentNavigation().extras.state.header !== undefined
                    && this._router.getCurrentNavigation().extras.state.detail !== undefined){
                    //console.log(this._router.getCurrentNavigation().extras.state.header);
                    const header = this._router.getCurrentNavigation().extras.state.header;
                    const detail = this._router.getCurrentNavigation().extras.state.detail;
                    this.estimateHeader = header;
                    this.estimateDetail = detail;
                }
            }

            this._changeDetectorRef.markForCheck();
        }
        this.isMobile = this._deviceService.isMobile();
    }
    /**
     * On init
     */
    ngOnInit(): void {
        // Form ??????
        this.salesorderHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // ?????????
            soNo: [{value:'',disabled:true}],   // ????????????
            account: [{value:''},[Validators.required]], // ????????? ??????
            accountNm: [{value:'',disabled:true}],   // ????????? ???
            type: [{value:''}, [Validators.required]],   // ??????
            status: [{value:'',disabled:true}, [Validators.required]],   // ??????
            soAmt: [{value:'',disabled:true}],   // ????????????
            obNo: [{value:'',disabled:true}],   // ????????????
            soCreDate: [{value:'',disabled:true}],//?????? ????????????
            soDate: [{value:'',disabled:true}], //????????????
            remarkHeader: [''], //??????
            active: [false]  // cell??????
        });

        this._salesorderService.getNew(0,10,'','asc', {});
        this.salesorderDetails$ = this._salesorderService.salesorderDetails$;
        this._salesorderService.salesorderDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((salesorderDetail: any) => {
                // Update the counts
                if(salesorderDetail !== null){
                    this.salesorderDetailsCount = salesorderDetail.length;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        this._salesorderService.salesorderDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((salesorderDetailPagenation: SalesOrderDetailPagenation) => {
                // Update the pagination
                this.salesorderDetailPagenation = salesorderDetailPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        if(this.estimateHeader !== undefined){
            this.salesorderHeaderForm.patchValue({'account': this.estimateHeader.account});
            this.salesorderHeaderForm.patchValue({'accountNm': this.estimateHeader.accountNm});
            this.salesorderHeaderForm.patchValue({'type': '1'});
            this.salesorderHeaderForm.patchValue({'status': 'N'});
            this.salesorderHeaderForm.patchValue({'obNo': ''});
            this.salesorderHeaderForm.patchValue({'remarkHeader': this.estimateHeader.remarkHeader});
        }else{
            this.salesorderHeaderForm.patchValue({'account': ''});
            this.salesorderHeaderForm.patchValue({'type': '1'});
            this.salesorderHeaderForm.patchValue({'status': 'N'});
            this.salesorderHeaderForm.patchValue({'obNo': ''});
            this.salesorderHeaderForm.patchValue({'remarkHeader': ''});
        }

        if(this.estimateDetail !== undefined){
            this.salesorderDetails$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((salesorderDetail) => {
                    this.estimateDetail.forEach((estimateDetail: any) => {
                        salesorderDetail.push({
                            itemGrade: '',
                            no: estimateDetail.length + 1,
                            flag: 'C',
                            itemCd: estimateDetail.itemCd,
                            itemNm: estimateDetail.itemNm,
                            standard: estimateDetail.standard,
                            unit: estimateDetail.unit,
                            soLineNo: estimateDetail.qtLineNo,
                            unitPrice: estimateDetail.qtPrice,
                            reqQty: estimateDetail.qty,
                            qty: 0,
                            poReqQty: estimateDetail.poReqQty,
                            invQty: estimateDetail.invQty,
                            soAmt:estimateDetail.qtAmt,
                            remarkDetail: estimateDetail.remarkDetail
                        });
                    });
                    this._changeDetectorRef.markForCheck();
                });
        }
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {

    }
    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    backPage(): void{
        this._router.navigate(['salesorder/salesorder']);
    }

    alertMessage(param: any): void
    {
        if(param.status !== 'SUCCESS'){
            this._functionService.cfn_alert(param.msg);
        }else{
            this.backPage();
        }
    }

    /* ???????????? ??? data Set
     * @param sendData
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: SalesOrder[]) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i=0; i<sendData.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            sendData[i].account = this.salesorderHeaderForm.controls['account'].value;
            sendData[i].soNo = this.salesorderHeaderForm.controls['soNo'].value;
            sendData[i].type = this.salesorderHeaderForm.controls['type'].value;
            sendData[i].status = this.salesorderHeaderForm.controls['status'].value;
            sendData[i].obNo = '';
            sendData[i].remarkHeader = this.salesorderHeaderForm.controls['remarkHeader'].value;
        }
        return sendData;
    }
    /* ??????
     *
     */
    saveSalesOrder(): void{

        if(!this.salesorderHeaderForm.invalid){
            this.showAlert = false;

            let detailCheck = false;
            this.salesorderDetails$.pipe(takeUntil(this._unsubscribeAll))
                .subscribe((data) => {

                    if(data.length === 0){
                        this._functionService.cfn_alert('??????????????? ?????? ????????????.');
                        detailCheck = true;
                    }
                });

            if(detailCheck){
                return;
            }
            const validCheck = this._functionService.cfn_validator('????????????',
                this.salesorderDetails$,
                this.salesorderDetailsTable);

            if(validCheck){
                return;
            }

            const confirmation = this._teamPlatConfirmationService.open({
                title : '',
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
                    let createList;
                    if (result) {
                        createList = [];
                        this.salesorderDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((salesorderDetail) => {
                                salesorderDetail.forEach((sendData: any) => {
                                    if (sendData.flag) {
                                        if (sendData.flag === 'C') {
                                            createList.push(sendData);
                                        }
                                    }
                                });
                            });
                        if (createList.length > 0) {
                            this.createSalesOrder(createList);
                            //this.totalAmt();
                        }
                    }
                });

            // Mark for check
            this._changeDetectorRef.markForCheck();

        }else{
            this._functionService.cfn_alert('???????????? ??????????????????.');
        }
    }
    /* ??????
     *
     * @param sendData
     */
    createSalesOrder(sendData: SalesOrder[]): void{
        if(sendData){
            sendData = this.headerDataSet(sendData);

            this._salesorderService.createSalesOrder(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((salesorder: any) => {
                    this.alertMessage(salesorder);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        }
    }
    /* ?????? ????????????
     *
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    totalAmt() {
        this._salesorderService.totalAmt(this.salesorderHeaderForm.getRawValue())
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((salesorder: any) => {
            });
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param account
     */
    trackByFn(index: number, salesorderDetail: any): any {
        return salesorderDetail.id || index;
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    tableClear(){
        this._table.renderRows();
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    tableStatusChange(){
        console.log('change');
    }

    /* ????????? ?????????
     * @param action
     * @param row
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    transactionRow(action,row) {
        if(action === 'ADD'){

            this.addRowData(row);

        }else if(action === 'DELETE'){

            this.deleteRowData(row);

        }
        this.tableClear();
    }
    /* ????????? ??????
     * @param row
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/explicit-function-return-type
    addRowData(row: any){
        this.salesorderDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((salesorderDetail) => {
                // @ts-ignore
                salesorderDetail.push({
                    no: salesorderDetail.length + 1,
                    flag: 'C',
                    itemCd: '',
                    itemNm: '',
                    soLineNo: 0,
                    unitPrice: 0,
                    reqQty: 0,
                    qty: 0,
                    remarkDetail: '',
                    standard: '',
                    unit: '',
                    soAmt:0});
            });
    }

    /* ????????? ??????
     * @param row
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    deleteRowData(row: any) {

        if(this.selection.hasValue()){
            if(row.selected.length > 0){
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for(let i=0; i<row.selected.length; i++){
                    if(row.selected[i].length){
                        this.salesorderDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((salesorderDetail) => {
                                // eslint-disable-next-line prefer-arrow/prefer-arrow-functions,@typescript-eslint/prefer-for-of
                                for(let e=0; e<salesorderDetail.length; e++){
                                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                                    if(row.selected[i].no === salesorderDetail[e].no){
                                        if(salesorderDetail[e].flag === 'D'){
                                            salesorderDetail[e].flag = '';
                                        }else{
                                            salesorderDetail[e].flag = 'D';
                                        }
                                    }
                                }
                            });
                    }else{
                        this.salesorderDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((salesorderDetail) => {
                                // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
                                for(let e=0; e<salesorderDetail.length; e++){
                                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                                    if(row.selected[i].no === salesorderDetail[e].no){
                                        salesorderDetail.splice(e,1);
                                    }
                                }
                            });
                    }
                }
            }
        }
    }
    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): SelectionModel<any> {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }

        this.salesorderDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((salesorderDetail) =>{
                this.selection.select(...salesorderDetail);
            });
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): any {
        const numSelected = this.selection.selected.length;
        const numRows = this.salesorderDetailsCount;
        return numSelected === numRows;
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: any): string {
        if (!row) {
            return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.no + 1}`;
    }

    /* ????????? ??? ??????(??????)
     * @param element
     * @param column
     * @param i
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    cellClick(element, column: TableConfig, i) {

        if(column.dataField === 'itemCd'){

            if(!this.isMobile){
                const popup =this._matDialogPopup.open(CommonPopupComponent, {
                    data: {
                        popup : 'P$_ALL_ITEM',
                        headerText : '?????? ??????',
                        where : 'account:=:' + this.salesorderHeaderForm.controls['account'].value
                    },
                    autoFocus: false,
                    maxHeight: '90vh',
                    disableClose: true
                });

                popup.afterClosed()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result) => {
                        if(result){
                            this.isLoading = true;
                            element.itemCd = result.itemCd;
                            element.itemNm = result.itemNm;
                            element.standard = result.standard;
                            element.unit = result.unit;
                            element.unitPrice = result.salesPrice;
                            element.poReqQty = result.poQty;
                            element.invQty = result.availQty;
                            this.tableClear();
                            this.isLoading = false;
                            this._changeDetectorRef.markForCheck();
                        }
                    });
            }else{
                const popup =this._matDialogPopup.open(CommonPopupComponent, {
                    data: {
                        popup : 'P$_ALL_ITEM',
                        headerText : '?????? ??????',
                        where : 'account:=:' + this.salesorderHeaderForm.controls['account'].value
                    },
                    autoFocus: false,
                    width: 'calc(100% - 50px)',
                    maxWidth: '100vw',
                    maxHeight: '80vh',
                    disableClose: true
                });
                const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                    if (size.matches) {
                        popup.updateSize('calc(100vw - 10px)','');
                    } else {
                        // d.updateSize('calc(100% - 50px)', '');
                    }
                });
                popup.afterClosed()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result) => {
                        if(result){
                            smallDialogSubscription.unsubscribe();
                            this.isLoading = true;
                            element.itemCd = result.itemCd;
                            element.itemNm = result.itemNm;
                            element.standard = result.standard;
                            element.unit = result.unit;
                            element.unitPrice = result.salesPrice;
                            element.poReqQty = result.poQty;
                            element.invQty = result.availQty;
                            this.tableClear();
                            this.isLoading = false;
                            this._changeDetectorRef.markForCheck();
                        }
                    });
            }

        }
    }
    openAccountSearch(): void
    {

        if(!this.isMobile){
            const popup =this._matDialogPopup.open(CommonPopupComponent, {
                data: {
                    popup : 'P$_ACCOUNT',
                    headerText : '????????? ??????'
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });

            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if(result){
                        this.salesorderHeaderForm.patchValue({'account': result.accountCd});
                        this.salesorderHeaderForm.patchValue({'accountNm': result.accountNm});
                    }
                });
        }else{
            const popup =this._matDialogPopup.open(CommonPopupComponent, {
                data: {
                    popup : 'P$_ACCOUNT',
                    headerText : '????????? ??????'
                },
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });

            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    popup.updateSize('calc(100vw - 10px)','');
                } else {
                    // d.updateSize('calc(100% - 50px)', '');
                }
            });

            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if(result){
                        smallDialogSubscription.unsubscribe();
                        this.salesorderHeaderForm.patchValue({'account': result.accountCd});
                        this.salesorderHeaderForm.patchValue({'accountNm': result.accountNm});
                    }
                });
        }

    }
}
