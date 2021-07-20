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
import {OutBound, OutBoundDetail, OutBoundDetailPagenation} from '../outbound.types';
import {TableConfig, TableStyle} from '../../../../../../@teamplat/components/common-table/common-table.types';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {OutboundService} from '../outbound.service';
import {takeUntil} from 'rxjs/operators';
import {SaveAlertComponent} from '../../../../../../@teamplat/components/common-alert/save-alert';
import {CommonPopupComponent} from '../../../../../../@teamplat/components/common-popup';
import {ErrorAlertComponent} from "../../../../../../@teamplat/components/common-alert/error-alert";

@Component({
    selector       : 'outbound-new',
    templateUrl    : './outbound-new.component.html',
    styleUrls: ['./outbound-new.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class OutboundNewComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatPaginator) private _outBoundDetailPagenator: MatPaginator;
    @ViewChild(MatSort) private _outBoundDetailSort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild(MatTable,{static:true}) _table: MatTable<any>;
    isLoading: boolean = false;
    outBoundHeaderForm: FormGroup;
    flashMessage: 'success' | 'error' | null = null;
    outBoundDetailsCount: number = 0;

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

    outBoundDetailPagenation: OutBoundDetailPagenation | null = null;
    outBoundDetails$ = new Observable<OutBoundDetail[]>();
    outBoundDetail: OutBoundDetail = null;
    selection = new SelectionModel<any>(true, []);

    outBoundDetailsTableStyle: TableStyle = new TableStyle();
    outBoundDetailsTable: TableConfig[] = [
        {headerText : '라인번호' , dataField : 'obLineNo', display : false},
        {headerText : '품목코드' , dataField : 'itemCd', width: 80, display : true, type: 'text'},
        {headerText : '품목명' , dataField : 'itemNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '출고 예정 수량' , dataField : 'obExpQty', width: 50, display : true, type: 'number', style: this.outBoundDetailsTableStyle.textAlign.right},
        {headerText : '수량' , dataField : 'qty', width: 50, display : true, type: 'number', style: this.outBoundDetailsTableStyle.textAlign.right},
        {headerText : '비고' , dataField : 'remarkDetail', width: 100, display : true, type: 'text'},
    ];
    outBoundDetailsTableColumns: string[] = [
        'select',
        'no',
        'obLineNo',
        'itemCd',
        'itemNm',
        'obExpQty',
        'qty',
        'remarkDetail',
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _outboundService: OutboundService,
        private _matDialog: MatDialog,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _formBuilder: FormBuilder,
        public _matDialogPopup: MatDialog,
        private _codeStore: CodeStore,
        private _changeDetectorRef: ChangeDetectorRef,
        private _utilService: FuseUtilsService
    )
    {
        this.filterList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data,'OB_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data,'OB_STATUS', this.filterList);
    }
    /**
     * On init
     */
    ngOnInit(): void
    {
        // Form 생성
        this.outBoundHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            obNo: [{value:'',disabled:true}],   // 출고번호
            account: [{value:''},[Validators.required]], // 거래처 코드
            accountNm: [{value:'',disabled:true}],   // 거래처 명
            address: [{value:''}, [Validators.required]],   // 거래처 주소
            type: [{value:''}, [Validators.required]],   // 유형
            status: [{value:'',disabled:true}, [Validators.required]],   // 상태
            dlvAccount: [{value:''}],   // 배송처
            dlvAddress: [{value:''}, [Validators.required]],   // 배송처 주소
            dlvDate: [{value:''}, [Validators.required]],//작성일
            obCreDate: [{value:'',disabled:true}],//작성일
            obDate: [{value:'',disabled:true}], //출고일
            remarkHeader: [''], //비고
            active: [false]  // cell상태
        });
        this._outboundService.getNew(0,10,'','asc', {});

        this.outBoundDetails$ = this._outboundService.outBoundDetails$;
        this._outboundService.outBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBoundDetail: any) => {
                // Update the counts
                if(outBoundDetail !== null){
                    this.outBoundDetailsCount = outBoundDetail.length;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._outboundService.outBoundDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBoundDetailPagenation: OutBoundDetailPagenation) => {
                // Update the pagination
                this.outBoundDetailPagenation = outBoundDetailPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.outBoundHeaderForm.patchValue({'account': ''});
        this.outBoundHeaderForm.patchValue({'address': ''});
        this.outBoundHeaderForm.patchValue({'type': '1'});
        this.outBoundHeaderForm.patchValue({'status': 'N'});
        this.outBoundHeaderForm.patchValue({'dlvAccount': ''});
        this.outBoundHeaderForm.patchValue({'dlvAddress': ''});
        this.outBoundHeaderForm.patchValue({'dlvDate': ''});
        this.outBoundHeaderForm.patchValue({'remarkHeader': ''});

    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {

    }
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
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

    /* 트랜잭션 전 data Set
     * @param sendData
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: OutBound[]) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i=0; i<sendData.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            sendData[i].account = this.outBoundHeaderForm.controls['account'].value;
            sendData[i].address = this.outBoundHeaderForm.controls['address'].value;
            sendData[i].obNo = this.outBoundHeaderForm.controls['obNo'].value;
            sendData[i].type = this.outBoundHeaderForm.controls['type'].value;
            sendData[i].status = this.outBoundHeaderForm.controls['status'].value;
            sendData[i].dlvAccount = this.outBoundHeaderForm.controls['dlvAccount'].value;
            sendData[i].dlvAddress = this.outBoundHeaderForm.controls['dlvAddress'].value;
            sendData[i].dlvDate = this.outBoundHeaderForm.controls['dlvDate'].value;
            sendData[i].remarkHeader = this.outBoundHeaderForm.controls['remarkHeader'].value;
        }
        return sendData;
    }

    /* 저장
     *
     */
    saveOut(): void{
        if(!this.outBoundHeaderForm.invalid){
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
                        this.outBoundDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((outBoundDetail) => {
                                outBoundDetail.forEach((sendData: any) => {
                                    if (sendData.flag) {
                                        if (sendData.flag === 'C') {
                                            createList.push(sendData);
                                        }
                                    }
                                });
                            });
                        if (createList.length > 0) {
                            this.createOut(createList);
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

    /* 추가
     *
     * @param sendData
     */
    createOut(sendData: OutBound[]): void{
        if(sendData){
            sendData = this.headerDataSet(sendData);

            this._outboundService.createOut(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((outBound: any) => {
                    this.alertMessage(outBound);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        }

    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param account
     */
    trackByFn(index: number, outDetail: any): any {
        return outDetail.id || index;
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
        this.outBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBoundDetail) => {
                // @ts-ignore
                outBoundDetail.push({
                    no: outBoundDetail.length + 1,
                    flag: 'C',
                    obLineNo: 0,
                    itemCd: '',
                    itemNm: '',
                    obExpQty: 0,
                    qty: 0,
                    remarkDetail: ''});
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
                        this.outBoundDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((outBoundDetail) => {
                                // eslint-disable-next-line prefer-arrow/prefer-arrow-functions,@typescript-eslint/prefer-for-of
                                for(let e=0; e<outBoundDetail.length; e++){
                                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                                    if(row.selected[i].no === outBoundDetail[e].no){
                                        if(outBoundDetail[e].flag === 'D'){
                                            outBoundDetail[e].flag = '';
                                        }else{
                                            outBoundDetail[e].flag = 'D';
                                        }
                                    }
                                }
                            });
                    }else{
                        this.outBoundDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((outBoundDetail) => {
                                // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
                                for(let e=0; e<outBoundDetail.length; e++){
                                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                                    if(row.selected[i].no === outBoundDetail[e].no){
                                        outBoundDetail.splice(e,1);
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

        this.outBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBoundDetail) =>{
                this.selection.select(...outBoundDetail);
            });
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): any {
        const numSelected = this.selection.selected.length;
        const numRows = this.outBoundDetailsCount;
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
                    this.outBoundHeaderForm.patchValue({'account': result.accountCd});
                    this.outBoundHeaderForm.patchValue({'accountNm': result.accountNm});
                    this.outBoundHeaderForm.patchValue({'address': result.address});
                }
            });
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    backPage() {
        this._router.navigate(['bound/outbound']);
    }
}
