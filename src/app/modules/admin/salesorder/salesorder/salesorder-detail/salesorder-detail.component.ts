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
import {SalesOrder, SalesOrderDetail, SalesOrderDetailPagenation} from '../salesorder.types';
import {merge, Observable, Subject} from 'rxjs';
import {SelectionModel} from '@angular/cdk/collections';
import {TableConfig, TableStyle} from '../../../../../../@teamplat/components/common-table/common-table.types';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {SalesorderService} from '../salesorder.service';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {CommonPopupComponent} from '../../../../../../@teamplat/components/common-popup';
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import {FunctionService} from '../../../../../../@teamplat/services/function';
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {DeviceDetectorService} from "ngx-device-detector";

@Component({
    selector       : 'salesorder-detail',
    templateUrl    : './salesorder-detail.component.html',
    styleUrls: ['./salesorder-detail.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class SalesorderDetailComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatPaginator) private _salesorderDetailPagenator: MatPaginator;
    @ViewChild(MatSort) private _salesorderDetailSort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild(MatTable,{static:true}) _table: MatTable<any>;
    isLoading: boolean = false;
    salesorderHeaderForm: FormGroup;
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    isMobile: boolean = false;
    flashMessage: 'success' | 'error' | null = null;
    salesorderDetailsCount: number = 0;
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
        {headerText : '????????????' , dataField : 'qty', width: 50, display : true, type: 'number', style: this.salesorderDetailsTableStyle.textAlign.right},
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
        'qty',
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
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _functionService: FunctionService,
        private _salesorderService: SalesorderService,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.filterList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data,'SO_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data,'SO_STATUS', this.filterList);
        this.isMobile = this._deviceService.isMobile();
    }
    /**
     * On init
     */
    ngOnInit(): void {
        // Form ??????
        this.salesorderHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // ?????????
            soNo: [{value: '', disabled: true}],   // ????????????
            account: [{value: '', disabled: true}, [Validators.required]], // ????????? ??????
            accountNm: [{value: '', disabled: true}],   // ????????? ???
            type: [{value: '', disabled: true}, [Validators.required]],   // ??????
            status: [{value: '', disabled: true}, [Validators.required]],   // ??????
            soAmt: [{value: '', disabled: true}],   // ????????????
            obNo: [{value: '', disabled: true}],   // ????????????
            soCreDate: [{value: '', disabled: true}],//?????? ????????????
            soDate: [{value: '', disabled: true}], //????????????
            remarkHeader: [''], //??????
            active: [false]  // cell??????
        });
        if (this._activatedRoute.snapshot.paramMap['params'].length !== (null || undefined)) {
            this.salesorderHeaderForm.patchValue(
                this._activatedRoute.snapshot.paramMap['params']
            );

            this._salesorderService.getDetail(0, 10, 'soLineNo', 'asc', this.salesorderHeaderForm.getRawValue());
        }
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
    }
    /**
     * After view init
     */
    ngAfterViewInit(): void {
        if(this._salesorderDetailSort !== undefined){
            // Get products if sort or page changes
            merge(this._salesorderDetailSort.sortChange, this._salesorderDetailPagenator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._salesorderService.getDetail(this._salesorderDetailPagenator.pageIndex, this._salesorderDetailPagenator.pageSize, this._salesorderDetailSort.active, this._salesorderDetailSort.direction, this.salesorderHeaderForm.getRawValue());
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).pipe(takeUntil(this._unsubscribeAll)).subscribe();
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

    /* ??????
     *
     */
    saveSalesOrder(): void{

        const status = this.salesorderHeaderForm.controls['status'].value;

        //????????? ????????? ?????????
        if(status !== 'N'){
            this._functionService.cfn_alert('?????? ??? ??? ????????????.');
            return;
        }

        const validCheck = this._functionService.cfn_validator('????????????',
            this.salesorderDetails$,
            this.salesorderDetailsTable);

        if(validCheck){
            return;
        }

        if(!this.salesorderHeaderForm.invalid){
            this.showAlert = false;

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
                    let updateList;
                    let deleteList;
                    if (result) {
                        createList = [];
                        updateList = [];
                        deleteList = [];
                        this.salesorderDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((salesorderDetail) => {
                                salesorderDetail.forEach((sendData: any) => {
                                    if (sendData.flag) {
                                        if (sendData.flag === 'C') {
                                            createList.push(sendData);
                                        } else if (sendData.flag === 'U') {
                                            updateList.push(sendData);
                                        } else if (sendData.flag === 'D') {
                                            deleteList.push(sendData);
                                        }
                                    }
                                });
                            });
                        if (createList.length > 0) {
                            this.createSalesOrder(createList);
                        }
                        if(!this.salesorderHeaderForm.untouched){
                            if (updateList.length > 0) {
                                this.updateSalesOrder(updateList);
                            }else{
                                this.updateSalesOrder([], this.salesorderHeaderForm);
                            }
                        }else{
                            if (updateList.length > 0) {
                                this.updateSalesOrder(updateList);
                            }
                        }
                        if (deleteList.length > 0) {
                            this.deleteSalesOrder(deleteList);
                        }
                        this.backPage();
                    }
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();

        }else{
            this._functionService.cfn_alert('???????????? ??????????????????.');
        }
    }
    /*?????? ????????????
     *
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    totalAmt() {
        this._salesorderService.totalAmt(this.salesorderHeaderForm.getRawValue())
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((salesorder: any) => {
            });
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
            sendData[i].remarkHeader = this.salesorderHeaderForm.controls['remarkHeader'].value;
        }
        return sendData;
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
                });
        }
    }

    /* ??????
     *
     * @param sendData
     */
    updateSalesOrder(sendData: SalesOrder[], headerForm?: FormGroup): void{

        if(headerForm !== undefined){

            sendData.push(headerForm.getRawValue());

            this._salesorderService.updateSalesOrder(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((salesorder: any) => {
                });

        }else{
            if(sendData){
                sendData = this.headerDataSet(sendData);

                this._salesorderService.updateSalesOrder(sendData)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((salesorder: any) => {
                    });
            }
        }


    }

    /* ??????
     * @param sendData
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    deleteSalesOrder(sendData: SalesOrder[]) {
        if(sendData){
            sendData = this.headerDataSet(sendData);

            this._salesorderService.deleteSalesOrder(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(
                    (order: any) => {
                    },(response) => {});
        }
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
        const status = this.salesorderHeaderForm.controls['status'].value;

        //????????? ????????? ?????????
        if(status !== 'N'){
            this._functionService.cfn_alert('????????? ????????? ??????????????????.');
            return false;
        }

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
    /* ????????? ????????????
     * @param element
     * @param column
     * @param i
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    updateRowData(element, column: TableConfig, i) {

        if(element.flag !== 'C' || !element.flag){
            element.flag = 'U';
        }
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
        const disableList = [
            'itemCd',
            'itemNm',
            'standard',
            'unit',
            'poReqQty',
            'invQty',
            'reqQty',
            'qty',
            'unitPrice',
            'soAmt',
            'remarkDetail',
        ];
        const enableList = [
            'reqQty',
            'unitPrice',
        ];
        const enableListSalesOrder = [
            'qty',
        ];
        const status = this.salesorderHeaderForm.controls['status'].value;
        this._functionService.cfn_cellDisable(column,disableList);

        //????????? ??????
        if(status === 'N'){
            this._functionService.cfn_cellEnable(column,enableList);
        }

        if(status !== 'N'){
            //this._functionService.cfn_cellEnable(column,enableListSalesOrder);
        }

        if(element.flag !== undefined && element.flag === 'C'){
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

    }

    inBound() {
        const status = this.salesorderHeaderForm.controls['status'].value;

        if(status !== 'S'){
            this._functionService.cfn_alert('?????????????????? ???????????????. ??????(??????) ??? ??? ????????????.');
            return;
        }

        const confirmation = this._teamPlatConfirmationService.open({
            title  : '',
            message: '??????(??????)??? ?????????????????????????',
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
                if (result) {
                    this._salesorderService.getDetail(0,10,'soLineNo','asc',this.salesorderHeaderForm.getRawValue());

                    this.salesorderDetails$ = this._salesorderService.salesorderDetails$;
                    this._salesorderService.salesorderDetails$
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((salesorderDetail: any) => {
                            if(salesorderDetail != null){
                                const row = {header : this.salesorderHeaderForm.getRawValue() , detail : salesorderDetail};
                                // eslint-disable-next-line max-len
                                this._router.navigate(['bound/inbound/inbound-new'],{state : {'header' :this.salesorderHeaderForm.getRawValue() , 'detail' : salesorderDetail}});
                            }
                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        });
                }else{

                }
            });
    }
}
