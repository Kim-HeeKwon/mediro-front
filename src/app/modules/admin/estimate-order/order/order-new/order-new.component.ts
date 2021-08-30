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
import {CommonPopupComponent} from '../../../../../../@teamplat/components/common-popup';
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import {FunctionService} from '../../../../../../@teamplat/services/function';

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
    filterTypeList: string[];
    filterStatusList: string[];
    estimateHeader: any;
    estimateDetail: any;

    orderDetailPagenation: OrderDetailPagenation | null = null;
    orderDetails$ = new Observable<OrderDetail[]>();
    selection = new SelectionModel<any>(true, []);

    orderDetailsTableStyle: TableStyle = new TableStyle();
    orderDetailsTable: TableConfig[] = [
        {headerText : '라인번호' , dataField : 'poLineNo', display : false},
        {headerText : '품목코드' , dataField : 'itemCd', width: 80, display : true, type: 'text',validators: true},
        {headerText : '품목명' , dataField : 'itemNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '규격' , dataField : 'standard', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '단위' , dataField : 'unit', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '발주' , dataField : 'poReqQty', width: 50, display : true, type: 'number', style: this.orderDetailsTableStyle.textAlign.right},
        {headerText : '보유' , dataField : 'invQty', width: 50, display : true, type: 'number', style: this.orderDetailsTableStyle.textAlign.right},
        {headerText : '요청수량' , dataField : 'reqQty', width: 70, display : true, type: 'number', style: this.orderDetailsTableStyle.textAlign.right,validators: true},
        /*{headerText : '수량' , dataField : 'qty', width: 50, display : true, type: 'number', style: this.orderDetailsTableStyle.textAlign.right},*/
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
        'poReqQty',
        'invQty',
        'reqQty',
        /*'qty',*/
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
        this.filterTypeList = ['ALL', '2'];
        this.filterStatusList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data,'PO_TYPE', this.filterTypeList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data,'PO_STATUS', this.filterStatusList);
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
            poCreDate: [{value:'',disabled:true}],//발주 생성일자
            poDate: [{value:'',disabled:true}], //발주일자
            email : [], //이메일
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

        if(this.estimateHeader !== undefined){

            this.orderHeaderForm.patchValue({'account': this.estimateHeader.account});
            this.orderHeaderForm.patchValue({'accountNm': this.estimateHeader.accountNm});
            this.orderHeaderForm.patchValue({'email': this.estimateHeader.email});
            this.orderHeaderForm.patchValue({'type': '1'});
            this.orderHeaderForm.patchValue({'status': 'N'});
            this.orderHeaderForm.patchValue({'remarkHeader': this.estimateHeader.remarkHeader});

        }else{

            this.orderHeaderForm.patchValue({'account': ''});
            this.orderHeaderForm.patchValue({'type': '1'});
            this.orderHeaderForm.patchValue({'status': 'N'});
            this.orderHeaderForm.patchValue({'remarkHeader': ''});
        }

        if(this.estimateDetail !== undefined){
            this.orderDetails$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((orderDetail) => {
                    this.estimateDetail.forEach((estimateDetail: any) => {
                        orderDetail.push({
                            no: estimateDetail.length + 1,
                            flag: 'C',
                            itemCd: estimateDetail.itemCd,
                            itemNm: estimateDetail.itemNm,
                            standard: estimateDetail.standard,
                            unit: estimateDetail.unit,
                            poLineNo: estimateDetail.qtLineNo,
                            unitPrice: estimateDetail.qtPrice,
                            poReqQty: estimateDetail.poReqQty,
                            invQty: estimateDetail.invQty,
                            reqQty: estimateDetail.qty,
                            qty: 0,
                            poQty: 0,
                            poAmt:estimateDetail.qtAmt,
                            remarkDetail: estimateDetail.remarkDetail,
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

        if(!this.orderHeaderForm.invalid){
            this.showAlert = false;

            let detailCheck = false;
            this.orderDetails$.pipe(takeUntil(this._unsubscribeAll))
                .subscribe((data) => {

                    if(data.length === 0){
                        this._functionService.cfn_alert('상세정보에 값이 없습니다.');
                        detailCheck = true;
                    }
                });

            if(detailCheck){
                return;
            }
            const validCheck = this._functionService.cfn_validator('상세정보',
                this.orderDetails$,
                this.orderDetailsTable);

            if(validCheck){
                return;
            }

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
                    if (result) {
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
            this._functionService.cfn_alert('필수값을 입력해주세요.');
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
                    this.orderHeaderForm.patchValue({'email': result.email});
                }
            });
    }
}
