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
import {SaveAlertComponent} from '../../../../../../@teamplat/components/common-alert/save-alert';
import {CommonPopupComponent} from '../../../../../../@teamplat/components/common-popup';

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
        {headerText : '라인번호' , dataField : 'soLineNo', display : false},
        {headerText : '품목코드' , dataField : 'itemCd', width: 80, display : true, type: 'text'},
        {headerText : '품목명' , dataField : 'itemNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '규격' , dataField : 'standard', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '단위' , dataField : 'unit', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '요청수량' , dataField : 'reqQty', width: 50, display : true, type: 'number', style: this.salesorderDetailsTableStyle.textAlign.right},
        {headerText : '확정수량' , dataField : 'qty', width: 50, display : true, type: 'number', style: this.salesorderDetailsTableStyle.textAlign.right},
        {headerText : '단가' , dataField : 'unitPrice', width: 50, display : true, type: 'number', style: this.salesorderDetailsTableStyle.textAlign.right},
        {headerText : '주문금액' , dataField : 'soAmt', width: 50, display : true, disabled : true, type: 'number', style: this.salesorderDetailsTableStyle.textAlign.right},
        {headerText : '비고' , dataField : 'remarkDetail', width: 100, display : true, type: 'text'},
    ];

    salesorderDetailsTableColumns: string[] = [
        'select',
        'no',
        'soLineNo',
        'itemCd',
        'itemNm',
        'standard',
        'unit',
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
        private _salesorderService: SalesorderService,
        private _utilService: FuseUtilsService)
    {
        this.filterList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data,'SO_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data,'SO_STATUS', this.filterList);
    }
    /**
     * On init
     */
    ngOnInit(): void {
        // Form 생성
        this.salesorderHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            soNo: [{value:'',disabled:true}],   // 주문번호
            account: [{value:''},[Validators.required]], // 거래처 코드
            accountNm: [{value:'',disabled:true}],   // 거래처 명
            type: [{value:''}, [Validators.required]],   // 유형
            status: [{value:'',disabled:true}, [Validators.required]],   // 상태
            soAmt: [{value:'',disabled:true}],   // 주문금액
            obNo: [{value:'',disabled:true}],   // 출고번호
            soCreDate: [{value:'',disabled:true}],//주문 생성일자
            soDate: [{value:'',disabled:true}], //주문일자
            remarkHeader: [''], //비고
            active: [false]  // cell상태
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

        this.salesorderHeaderForm.patchValue({'account': ''});
        this.salesorderHeaderForm.patchValue({'type': '1'});
        this.salesorderHeaderForm.patchValue({'status': 'N'});
        this.salesorderHeaderForm.patchValue({'obNo': ''});
        this.salesorderHeaderForm.patchValue({'remarkHeader': ''});
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
            this.alert = {
                type   : 'error',
                message: param.msg
            };
            // Show the alert
            this.showAlert = true;
        }else{
            this.alert = {
                type   : 'success',
                message: '등록완료 하였습니다.'
            };
            // Show the alert
            this.showAlert = true;
        }
    }
    /* 트랜잭션 전 data Set
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
    /* 저장
     *
     */
    saveSalesOrder(): void{

        if(!this.salesorderHeaderForm.invalid){
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
                        this.backPage();
                    }
                });

            this.alertMessage('');

            // Mark for check
            this._changeDetectorRef.markForCheck();

        }else{
            // Set the alert
            this.alert = {
                type   : 'error',
                message: '거래처를 선택해주세요.'
            };

            // Show the alert
            this.showAlert = true;
        }
    }
    /* 추가
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
    /* 금액 업데이트
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
                    this.salesorderHeaderForm.patchValue({'account': result.accountCd});
                    this.salesorderHeaderForm.patchValue({'accountNm': result.accountNm});
                }
            });
    }
}
