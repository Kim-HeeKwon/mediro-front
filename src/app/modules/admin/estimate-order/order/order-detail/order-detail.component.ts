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
import {merge, Observable, Subject} from 'rxjs';
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
    flashMessage: 'success' | 'error' | null = null;
    orderDetailsCount: number = 0;
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
        {headerText : '라인번호' , dataField : 'poLineNo', display : false},
        {headerText : '품목코드' , dataField : 'itemCd', width: 80, display : true, type: 'text',validators: true},
        {headerText : '품목명' , dataField : 'itemNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '규격' , dataField : 'standard', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '단위' , dataField : 'unit', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '요청수량' , dataField : 'reqQty', width: 70, display : true, type: 'number', style: this.orderDetailsTableStyle.textAlign.right,validators: true},
        {headerText : '수량' , dataField : 'qty', width: 50, display : true, type: 'number', style: this.orderDetailsTableStyle.textAlign.right},
        {headerText : '발주수량' , dataField : 'poQty', width: 60, display : true, disabled : true, type: 'number', style: this.orderDetailsTableStyle.textAlign.right},
        {headerText : '단가' , dataField : 'unitPrice', width: 50, display : true, type: 'number', style: this.orderDetailsTableStyle.textAlign.right,validators: true},
        {headerText : '발주금액' , dataField : 'poAmt', width: 50, display : true, disabled : true, type: 'number', style: this.orderDetailsTableStyle.textAlign.right},
        {headerText : '비고' , dataField : 'remarkDetail', width: 100, display : true, type: 'text'},
    ];
    orderDetailsTableColumns: string[] = [
        'select',
        'no',
        'poLineNo',
        'itemCd',
        'itemNm',
        'standard',
        'unit',
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
        private _utilService: FuseUtilsService)
    {
        this.filterList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data,'PO_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data,'PO_STATUS', this.filterList);
    }
    /**
     * On init
     */
    ngOnInit(): void
    {
        // Form 생성
        this.orderHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            poNo: [{value:'',disabled:true}],   // 발주번호
            account: [{value:'',disabled:true},[Validators.required]], // 거래처 코드
            accountNm: [{value:'',disabled:true}],   // 거래처 명
            type: [{value:'',disabled:true}, [Validators.required]],   // 유형
            status: [{value:'',disabled:true}, [Validators.required]],   // 상태
            poAmt: [{value:'',disabled:true}],   // 발주금액
            poCreDate: [{value:'',disabled:true}],//발주 생성일자
            poDate: [{value:'',disabled:true}], //발주일자
            email:[],//이메일
            remarkHeader: [''], //비고
            active: [false]  // cell상태
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

    /* 저장
     *
     */
    saveOrder(): void{

        const status = this.orderHeaderForm.controls['status'].value;

        //신규가 아니면 불가능
        if(status !== 'N'){
            this._functionService.cfn_alert('저장 할 수 없습니다.');
            return;
        }

        const validCheck = this._functionService.cfn_validator('상세정보',
            this.orderDetails$,
            this.orderDetailsTable);

        if(validCheck){
            return;
        }

        if(!this.orderHeaderForm.invalid){
            this.showAlert = false;

            const confirmation = this._teamPlatConfirmationService.open({
                title : '',
                message: '저장하시겠습니까?',
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
                    let createList;
                    let updateist;
                    let deleteList;
                    if (result) {
                        createList = [];
                        updateist = [];
                        deleteList = [];
                        this.orderDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((orderDetail) => {
                                orderDetail.forEach((sendData: any) => {
                                    if (sendData.flag) {
                                        if (sendData.flag === 'C') {
                                            createList.push(sendData);
                                        } else if (sendData.flag === 'U') {
                                            updateist.push(sendData);
                                        } else if (sendData.flag === 'D') {
                                            deleteList.push(sendData);
                                        }
                                    }
                                });
                            });
                        if (createList.length > 0) {
                            this.createOrder(createList);
                        }
                        if (updateist.length > 0) {
                            this.updateOrder(updateist);
                        }
                        if (deleteList.length > 0) {
                            this.deleteOrder(deleteList);
                        }
                        if(createList.length > 0 || updateist.length > 0 ||
                            deleteList.length > 0){
                            //this.totalAmt();
                        }
                        this.backPage();
                    }
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();

        }else{
            this._functionService.cfn_alert('필수값을 입력해주세요.');
        }

    }

    /*금액 업데이트
     *
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    totalAmt() {
        this._orderService.totalAmt(this.orderHeaderForm.getRawValue())
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((order: any) => {
            });
    }
    /* 트랜잭션 전 data Set
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

    /* 추가
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

    /* 수정
     *
     * @param sendData
     */
    updateOrder(sendData: Order[]): void{
        if(sendData){
            sendData = this.headerDataSet(sendData);

            this._orderService.updateOrder(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((order: any) => {
                });
        }

    }

    /* 삭제
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

    /* 그리드 컨트롤
     * @param action
     * @param row
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    transactionRow(action,row) {

        const status = this.orderHeaderForm.controls['status'].value;

        //신규가 아니면
        if(status !== 'N'){
            this._functionService.cfn_alert('추가나 삭제가 불가능합니다.');
            return false;
        }

        if(action === 'ADD'){

            this.addRowData(row);

        }else if(action === 'DELETE'){

            this.deleteRowData(row);

        }
        this.tableClear();
    }
    /* 그리드 추가
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
    /* 그리드 업데이트
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

    /* 그리드 삭제
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
    /* 그리드 셀 클릭(팝업)
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

        //신규만 가능
        if(status === 'N'){
            this._functionService.cfn_cellEnable(column,enableList);
        }

        //발주시
        if(status !== 'N'){
            this._functionService.cfn_cellEnable(column,enableListOrder);
        }

        if(element.flag !== undefined && element.flag === 'C'){
            if(column.dataField === 'itemCd'){

                const popup =this._matDialogPopup.open(CommonPopupComponent, {
                    data: {
                        popup : 'P$_ALL_ITEM',
                        headerText : '품목 조회',
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
                            this.tableClear();
                            this.isLoading = false;
                            this._changeDetectorRef.markForCheck();
                        }
                    });
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
    // 발주
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    orderConfirm() {
        const poStatus = this.orderHeaderForm.controls['status'].value;
        if(poStatus !== 'S' && poStatus !== 'P'){
            this._functionService.cfn_alert('발주할 수 없는 상태입니다.');
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
            this._functionService.cfn_alert('발주 수량이 존재하지 않습니다.');
            return false;
        }else{
            const confirmation = this._teamPlatConfirmationService.open({
                title  : '',
                message: '발주하시겠습니까?',
                actions: {
                    confirm: {
                        label: '발주'
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
                        this.orderDetailConfirm(orderData);
                    }
                });
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
    /* 발주 (상세)
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
                    this._functionService.cfn_alertCheckMessage(order);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        }
    }
}
