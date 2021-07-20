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
import {Order, OrderDetail, OrderDetailPagenation} from '../order.types';
import {Observable, Subject} from 'rxjs';
import {SelectionModel} from '@angular/cdk/collections';
import {TableConfig, TableStyle} from '../../../../../../@teamplat/components/common-table/common-table.types';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {OrderService} from '../order.service';
import {takeUntil} from 'rxjs/operators';
import {SaveAlertComponent} from '../../../../../../@teamplat/components/common-alert/save-alert';
import {CommonPopupComponent} from '../../../../../../@teamplat/components/common-popup';
import {ErrorAlertComponent} from "../../../../../../@teamplat/components/common-alert/error-alert";

@Component({
    selector       : 'order-new',
    templateUrl    : './order-new.component.html',
    styleUrls: ['./order-new.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class OrderNewComponent implements OnInit, OnDestroy, AfterViewInit
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
    selection = new SelectionModel<any>(true, []);

    orderDetailsTableStyle: TableStyle = new TableStyle();
    orderDetailsTable: TableConfig[] = [
        {headerText : '라인번호' , dataField : 'poLineNo', display : false},
        {headerText : '품목코드' , dataField : 'itemCd', width: 80, display : true, type: 'text'},
        {headerText : '품목명' , dataField : 'itemNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '규격' , dataField : 'standard', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '단위' , dataField : 'unit', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '요청수량' , dataField : 'reqQty', width: 50, display : true, type: 'number', style: this.orderDetailsTableStyle.textAlign.right},
        {headerText : '확정수량' , dataField : 'qty', width: 50, display : true, type: 'number', style: this.orderDetailsTableStyle.textAlign.right},
        {headerText : '단가' , dataField : 'unitPrice', width: 50, display : true, type: 'number', style: this.orderDetailsTableStyle.textAlign.right},
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
        private _utilService: FuseUtilsService)
    {
        this.filterList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data,'PO_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data,'PO_STATUS', this.filterList);
    }

    /**
     * On init
     */
    ngOnInit(): void {
        // Form 생성
        this.orderHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            poNo: [{value:'',disabled:true}],   // 발주번호
            account: [{value:''},[Validators.required]], // 거래처 코드
            accountNm: [{value:'',disabled:true}],   // 거래처 명
            type: [{value:''}, [Validators.required]],   // 유형
            status: [{value:'',disabled:true}, [Validators.required]],   // 상태
            poAmt: [{value:'',disabled:true}],   // 발주금액
            ibNo: [{value:'',disabled:true}],   // 입고번호
            poCreDate: [{value:'',disabled:true}],//발주 생성일자
            poDate: [{value:'',disabled:true}], //발주일자
            remarkHeader: [''], //비고
            active: [false]  // cell상태
        });

        this._orderService.getNew(0,10,'','asc', {});

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
        this._orderService.orderDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((orderDetailPagenation: OrderDetailPagenation) => {
                // Update the pagination
                this.orderDetailPagenation = orderDetailPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.orderHeaderForm.patchValue({'account': ''});
        this.orderHeaderForm.patchValue({'type': '1'});
        this.orderHeaderForm.patchValue({'status': 'N'});
        this.orderHeaderForm.patchValue({'ibNo': ''});
        this.orderHeaderForm.patchValue({'remarkHeader': ''});
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
        this._router.navigate(['estimate-order/order']);
    }
    alertMessage(param: any): void
    {
        if(param.status !== 'SUCCESS'){
            const errorAlert =this._matDialog.open(ErrorAlertComponent, {
                data: {
                    msg: param.msg
                }
            });
            errorAlert.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                });
        }else{
            this.backPage();
        }
    }

    /* 저장
     *
     */
    saveOrder(): void{

        if(!this.orderHeaderForm.invalid){
            this.showAlert = false;

            const saveConfirm =this._matDialog.open(SaveAlertComponent, {
                data: {
                }
            });

            saveConfirm.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    let createList;
                    if (result.status) {
                        createList = [];
                        this.orderDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((orderDetail) => {
                                orderDetail.forEach((sendData: any) => {
                                    if (sendData.flag) {
                                        if (sendData.flag === 'C') {
                                            createList.push(sendData);
                                        }
                                    }
                                });
                            });
                        if (createList.length > 0) {
                            this.createOrder(createList);
                            //this.totalAmt();
                        }
                    }
                });

            // Mark for check
            this._changeDetectorRef.markForCheck();

        }else{
            const errorAlert =this._matDialog.open(ErrorAlertComponent, {
                data: {
                    msg: '필수값을 입력해주세요.'
                }
            });
            errorAlert.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                });
        }

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
            sendData[i].ibNo = '';
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
                    this.alertMessage(order);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        }

    }
    /* 금액 업데이트
     *
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    totalAmt() {
        this._orderService.totalAmt(this.orderHeaderForm.getRawValue())
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((order: any) => {
            });
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

    openAccountSearch(): void
    {
        const popup =this._matDialogPopup.open(CommonPopupComponent, {
            data: {
                popup : 'P$_ACCOUNT',
                headerText : '거래처 조회'
            },
            autoFocus: false,
            maxHeight: '90vh',
            disableClose: true
        });

        popup.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if(result){
                    this.orderHeaderForm.patchValue({'account': result.accountCd});
                    this.orderHeaderForm.patchValue({'accountNm': result.accountNm});
                }
            });
    }
}
