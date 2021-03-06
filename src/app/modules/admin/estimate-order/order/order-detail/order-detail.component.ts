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
import {BehaviorSubject, merge, Observable, Subject} from 'rxjs';
import {SelectionModel} from '@angular/cdk/collections';
import {TableConfig, TableStyle} from '../../../../../../@teamplat/components/common-table/common-table.types';
import {Order, OrderDetail, OrderDetailPagenation} from '../order.types';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {OrderService} from '../order.service';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {CommonPopupComponent} from '../../../../../../@teamplat/components/common-popup';
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import {FunctionService} from '../../../../../../@teamplat/services/function';
import {CommonReportComponent} from '../../../../../../@teamplat/components/common-report';
import {
    ReportHeaderData
} from '../../../../../../@teamplat/components/common-report/common-report.types';
import {DeviceDetectorService} from "ngx-device-detector";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";

@Component({
    selector       : 'order-detail',
    templateUrl    : './order-detail.component.html',
    styleUrls: ['./order-detail.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class OrderDetailComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatPaginator) private _orderDetailPagenator: MatPaginator;
    @ViewChild(MatSort) private _orderDetailSort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild(MatTable,{static:true}) _table: MatTable<any>;
    isLoading: boolean = false;
    orderHeaderForm: FormGroup;
    reportHeaderData: ReportHeaderData = new ReportHeaderData();
    flashMessage: 'success' | 'error' | null = null;
    orderDetailsCount: number = 0;
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

    orderDetailPagenation: OrderDetailPagenation | null = null;
    orderDetails$ = new Observable<OrderDetail[]>();
    orderDetail: OrderDetail = null;
    selection = new SelectionModel<any>(true, []);

    orderDetailsTableStyle: TableStyle = new TableStyle();
    orderDetailsTable: TableConfig[] = [
        {headerText : '????????????' , dataField : 'poLineNo', display : false},
        {headerText : '????????????' , dataField : 'itemCd', width: 80, display : true, type: 'text',validators: true},
        {headerText : '?????????' , dataField : 'itemNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '??????' , dataField : 'standard', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '??????' , dataField : 'unit', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '??????' , dataField : 'poReqQty', width: 50, display : true, type: 'number', style: this.orderDetailsTableStyle.textAlign.right},
        {headerText : '??????' , dataField : 'invQty', width: 50, display : true, type: 'number', style: this.orderDetailsTableStyle.textAlign.right},
        {headerText : '????????????' , dataField : 'reqQty', width: 70, display : true, type: 'number', style: this.orderDetailsTableStyle.textAlign.right,validators: true},
        {headerText : '??????' , dataField : 'qty', width: 50, display : true, type: 'number', style: this.orderDetailsTableStyle.textAlign.right},
        {headerText : '????????????' , dataField : 'poQty', width: 60, display : true, disabled : true, type: 'number', style: this.orderDetailsTableStyle.textAlign.right},
        {headerText : '??????' , dataField : 'unitPrice', width: 50, display : true, type: 'number', style: this.orderDetailsTableStyle.textAlign.right,validators: true},
        {headerText : '????????????' , dataField : 'poAmt', width: 50, display : true, disabled : true, type: 'number', style: this.orderDetailsTableStyle.textAlign.right},
        {headerText : '??????' , dataField : 'remarkDetail', width: 100, display : true, type: 'text'},
    ];
    orderDetailsTableColumns: string[] = [
        'select',
        'no',
        'poLineNo',
        'itemCd',
        'itemNm',
        'standard',
        'unit',
        'poReqQty',
        'invQty',
        'reqQty',
        'qty',
        'poQty',
        'unitPrice',
        'poAmt',
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
        private _orderService: OrderService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _functionService: FunctionService,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.filterList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data,'PO_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data,'PO_STATUS', this.filterList);
        this.isMobile = this._deviceService.isMobile();
    }
    /**
     * On init
     */
    ngOnInit(): void
    {
        // Form ??????
        this.orderHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // ?????????
            poNo: [{value:'',disabled:true}],   // ????????????
            account: [{value:'',disabled:true},[Validators.required]], // ????????? ??????
            accountNm: [{value:'',disabled:true}],   // ????????? ???
            type: [{value:'',disabled:true}, [Validators.required]],   // ??????
            status: [{value:'',disabled:true}, [Validators.required]],   // ??????
            poAmt: [{value:'',disabled:true}],   // ????????????
            poCreDate: [{value:'',disabled:true}],//?????? ????????????
            poDate: [{value:'',disabled:true}], //????????????
            email:[],//?????????
            remarkHeader: [''], //??????
            toAccountNm: [''],
            deliveryDate: [''],
            custBusinessNumber: [''],// ????????? ????????????
            custBusinessName: [''],//??????
            representName: [''],//??????
            address: [''],//??????
            businessCondition: [''],// ??????
            businessCategory: [''],// ??????
            phoneNumber: [''],// ????????????
            fax: [''],// ????????????
            active: [false]  // cell??????
        });

        if(this._activatedRoute.snapshot.paramMap['params'].length !== (null || undefined)){

            this.orderHeaderForm.patchValue(
                this._activatedRoute.snapshot.paramMap['params']
            );

            this._orderService.getDetail(0,10,'poLineNo','asc',this.orderHeaderForm.getRawValue());
        }
        this.orderDetails$ = this._orderService.orderDetails$;
        this._orderService.orderDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((orderDetail: any) => {
                // Update the counts
                if(orderDetail !== null){
                    this.orderDetailsCount = orderDetail.length;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        this.tableEditingEvent();

        this._orderService.orderDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((orderDetailPagenation: OrderDetailPagenation) => {
                // Update the pagination
                this.orderDetailPagenation = orderDetailPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
    /**
     * After view init
     */
    ngAfterViewInit(): void {

        if(this._orderDetailSort !== undefined){
            // Get products if sort or page changes
            merge(this._orderDetailSort.sortChange, this._orderDetailPagenator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._orderService.getDetail(this._orderDetailPagenator.pageIndex, this._orderDetailPagenator.pageSize, this._orderDetailSort.active, this._orderDetailSort.direction, this.orderHeaderForm.getRawValue());
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
        this._router.navigate(['estimate-order/order']);
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
    saveOrder(): void{

        const status = this.orderHeaderForm.controls['status'].value;

        //????????? ????????? ?????????
        if(status !== 'N'){
            this._functionService.cfn_alert('?????? ??? ??? ????????????.');
            return;
        }

        if(!this.orderHeaderForm.invalid){
            this.showAlert = false;

            let detailCheck = false;
            this.orderDetails$.pipe(takeUntil(this._unsubscribeAll))
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
                this.orderDetails$,
                this.orderDetailsTable);

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
                    let updateList;
                    let deleteList;
                    if (result) {
                        createList = [];
                        updateList = [];
                        deleteList = [];
                        this.orderDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((orderDetail) => {
                                orderDetail.forEach((sendData: any) => {
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
                            this.createOrder(createList);
                        }
                        if(!this.orderHeaderForm.untouched){
                            if (updateList.length > 0) {
                                this.updateOrder(updateList);
                            }else{
                                this.updateOrder([], this.orderHeaderForm);
                            }
                        }else{
                            if (updateList.length > 0) {
                                this.updateOrder(updateList);
                            }
                        }
                        if (deleteList.length > 0) {
                            this.deleteOrder(deleteList);
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
        this._orderService.totalAmt(this.orderHeaderForm.getRawValue())
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((order: any) => {
            });
    }
    /* ???????????? ??? data Set
     * @param sendData
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: Order[]) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i=0; i<sendData.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            sendData[i].account = this.orderHeaderForm.controls['account'].value;
            sendData[i].poNo = this.orderHeaderForm.controls['poNo'].value;
            sendData[i].type = this.orderHeaderForm.controls['type'].value;
            sendData[i].status = this.orderHeaderForm.controls['status'].value;
            sendData[i].email = this.orderHeaderForm.controls['email'].value;
            sendData[i].remarkHeader = this.orderHeaderForm.controls['remarkHeader'].value;
        }
        return sendData;
    }

    /* ??????
     *
     * @param sendData
     */
    createOrder(sendData: Order[]): void{
        if(sendData){
            sendData = this.headerDataSet(sendData);

            this._orderService.createOrder(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((order: any) => {
                });
        }

    }

    /* ??????
     *
     * @param sendData
     */
    updateOrder(sendData?: Order[], headerForm?: FormGroup): void{

        if(headerForm !== undefined){

            sendData.push(headerForm.getRawValue());

            this._orderService.updateOrder(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((order: any) => {
                });

        }else{
            if(sendData){
                sendData = this.headerDataSet(sendData);

                this._orderService.updateOrder(sendData)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((order: any) => {
                    });
            }
        }
    }

    /* ??????
     * @param sendData
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    deleteOrder(sendData: Order[]) {
        if(sendData){
            sendData = this.headerDataSet(sendData);

            this._orderService.deleteOrder(sendData)
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
    trackByFn(index: number, orderDetail: any): any {
        return orderDetail.id || index;
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

        const status = this.orderHeaderForm.controls['status'].value;

        //????????? ?????????
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

        this.orderDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((orderDetail) => {
                // @ts-ignore
                orderDetail.push({
                    no: orderDetail.length + 1,
                    flag: 'C',
                    itemCd: '',
                    itemNm: '',
                    poLineNo: 0,
                    unitPrice: 0,
                    reqQty: 0,
                    qty: 0,
                    remarkDetail: '',
                    standard: '',
                    unit: '',
                    poAmt:0});
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
                        this.orderDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((orderDetail) => {
                                // eslint-disable-next-line prefer-arrow/prefer-arrow-functions,@typescript-eslint/prefer-for-of
                                for(let e=0; e<orderDetail.length; e++){
                                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                                    if(row.selected[i].no === orderDetail[e].no){
                                        if(orderDetail[e].flag === 'D'){
                                            orderDetail[e].flag = '';
                                        }else{
                                            orderDetail[e].flag = 'D';
                                        }
                                    }
                                }
                            });
                    }else{
                        this.orderDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((orderDetail) => {
                                // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
                                for(let e=0; e<orderDetail.length; e++){
                                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                                    if(row.selected[i].no === orderDetail[e].no){
                                        orderDetail.splice(e,1);
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

        this.orderDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((orderDetail) =>{
                this.selection.select(...orderDetail);
            });
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): any {
        const numSelected = this.selection.selected.length;
        const numRows = this.orderDetailsCount;
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
            'poQty',
            'unitPrice',
            'poAmt',
            'remarkDetail',
        ];
        const enableList = [
            'reqQty',
            'unitPrice',
        ];
        const enableListOrder = [
            'qty',
        ];
        const status = this.orderHeaderForm.controls['status'].value;
        this._functionService.cfn_cellDisable(column,disableList);

        //????????? ??????
        if(status === 'N'){
            this._functionService.cfn_cellEnable(column,enableList);
        }

        //?????????
        if(status !== 'N'){
            this._functionService.cfn_cellEnable(column,enableListOrder);
        }

        if(element.flag !== undefined && element.flag === 'C'){
            if(column.dataField === 'itemCd'){
                if(!this.isMobile){
                    const popup =this._matDialogPopup.open(CommonPopupComponent, {
                        data: {
                            popup : 'P$_ALL_ITEM',
                            headerText : '?????? ??????',
                            where : 'account:=:' + this.orderHeaderForm.controls['account'].value
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
                                element.unitPrice = result.buyPrice;
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
                            where : 'account:=:' + this.orderHeaderForm.controls['account'].value
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
                                element.unitPrice = result.buyPrice;
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
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    tableEditingEvent(){
        this.orderDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((orderDetail) => {
                // @ts-ignore
                if(orderDetail !== null){
                    const poStatus = this.orderHeaderForm.controls['status'].value;
                    if(poStatus === 'N' || poStatus === 'P'){
                        orderDetail.forEach((detail: any) => {
                            detail.qty = detail.reqQty - detail.poQty;
                        });

                        this.orderDetailsTable.forEach((table: any) => {
                            if(table.dataField === 'itemCd'){
                                table.disabled = true;
                            }
                        });
                    }
                }
                this._changeDetectorRef.markForCheck();
            });
    }
    // ??????
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    orderConfirm() {
        const poStatus = this.orderHeaderForm.controls['status'].value;
        if(poStatus !== 'S' && poStatus !== 'P'){
            this._functionService.cfn_alert('????????? ??? ?????? ???????????????.');
            return false;
        }
        let orderData;
        this.orderDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((orderDetail) => {
                orderData = orderDetail.filter((detail: any) => detail.qty > 0)
                    .map((param: any) => {
                        return param;
                    });
            });

        if(orderData.length < 1) {
            this._functionService.cfn_alert('?????? ????????? ???????????? ????????????.');
            return false;
        }else{
            const confirmation = this._teamPlatConfirmationService.open({
                title  : '',
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
                        this.orderDetailConfirm(orderData);
                    }
                });
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
    /* ?????? (??????)
     *
     * @param sendData
     */
    orderDetailConfirm(sendData: Order[]): void{
        if(sendData){
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i=0; i<sendData.length; i++) {
                sendData[i].type = this.orderHeaderForm.controls['type'].value;
            }

            this._orderService.orderDetailConfirm(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((order: any) => {
                    this.alertMessage(order);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        }
    }

    reportOrder(): void {
        const orderDetailData = [];
        let index = 0;
        this.orderDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((orderDetail) => {
                if(orderDetail != null){
                    orderDetail.forEach((data: any) => {
                        index++;
                        orderDetailData.push({
                            no : index,
                            itemNm : data.itemNm,
                            standard : data.standard,
                            unit : data.unit,
                            qty : data.reqQty,
                            unitPrice : data.unitPrice,
                            totalAmt : data.poAmt,
                            taxAmt : 0,
                            remark : data.remarkDetail,
                        });
                    });
                }
            });
        this.reportHeaderData.no = this.orderHeaderForm.getRawValue().poNo;
        this.reportHeaderData.date = this.orderHeaderForm.getRawValue().poCreDate;
        this.reportHeaderData.remark = this.orderHeaderForm.getRawValue().remarkHeader;
        this.reportHeaderData.custBusinessNumber = this.orderHeaderForm.getRawValue().custBusinessNumber;// ????????? ????????????
        this.reportHeaderData.custBusinessName = this.orderHeaderForm.getRawValue().custBusinessName;//??????
        this.reportHeaderData.representName = this.orderHeaderForm.getRawValue().representName;//??????
        this.reportHeaderData.address = this.orderHeaderForm.getRawValue().address;//??????
        this.reportHeaderData.businessCondition = this.orderHeaderForm.getRawValue().businessCondition;// ??????
        this.reportHeaderData.businessCategory = this.orderHeaderForm.getRawValue().businessCategory;// ??????
        this.reportHeaderData.phoneNumber = '0' + this.orderHeaderForm.getRawValue().phoneNumber;// ????????????
        this.reportHeaderData.fax = '0' + this.orderHeaderForm.getRawValue().fax;// ????????????
        this.reportHeaderData.toAccountNm = this.orderHeaderForm.getRawValue().toAccountNm;
        this.reportHeaderData.deliveryDate = this.orderHeaderForm.getRawValue().deliveryDate;
        this.reportHeaderData.deliveryAddress = '?????? ?????????';

        const popup =this._matDialogPopup.open(CommonReportComponent, {
            data: {
                divisionText : '??????',
                division : 'ORDER',
                header : this.reportHeaderData,
                body : orderDetailData,
                tail : ''
            },
            autoFocus: false,
            maxHeight: '100vh',
            disableClose: true
        });
    }
}
