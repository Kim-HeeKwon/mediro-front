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
import {OutBound, OutDetail, OutDetailPagenation, OutHeader} from '../out.types';
import {merge, Observable, Subject} from 'rxjs';
import {SelectionModel} from '@angular/cdk/collections';
import {TableConfig, TableStyle} from '../../../../../../@teamplat/components/common-table/common-table.types';
import {OutService} from '../out.service';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {CommonPopupComponent} from '../../../../../../@teamplat/components/common-popup';
import {SaveAlertComponent} from '../../../../../../@teamplat/components/common-alert/save-alert';

@Component({
    selector       : 'out-new',
    templateUrl    : './out-new.component.html',
    styleUrls: ['./out-new.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class OutNewComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatPaginator) private _outDetailPagenator: MatPaginator;
    @ViewChild(MatSort) private _outDetailSort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild(MatTable,{static:true}) _table: MatTable<any>;
    isLoading: boolean = false;
    outHeaderForm: FormGroup;
    flashMessage: 'success' | 'error' | null = null;
    outDetailsCount: number = 0;

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

    outDetailPagenation: OutDetailPagenation | null = null;
    outDetails$ = new Observable<OutDetail[]>();
    outDetail: OutDetail = null;
    selection = new SelectionModel<any>(true, []);

    outDetailsTableStyle: TableStyle = new TableStyle();
    outDetailsTable: TableConfig[] = [
        {headerText : '라인번호' , dataField : 'obLineNo', display : false},
        {headerText : '품목코드' , dataField : 'itemCd', width: 80, display : true, type: 'text'},
        {headerText : '품목명' , dataField : 'itemNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '출고 예정 수량' , dataField : 'obExpQty', width: 50, display : true, type: 'number', style: this.outDetailsTableStyle.textAlign.right},
        {headerText : '수량' , dataField : 'qty', width: 50, display : true, type: 'number', style: this.outDetailsTableStyle.textAlign.right},
        {headerText : '비고' , dataField : 'remarkDetail', width: 100, display : true, type: 'text'},
    ];
    outDetailsTableColumns: string[] = [
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
        private _outService: OutService,
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
        console.log('new');
        this.filterList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data,'OB_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data,'OB_STATUS', this.filterList);
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        console.log('new');
        // Form 생성
        this.outHeaderForm = this._formBuilder.group({
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
        this._outService.getNew(0,10,'','asc', {});

        this.outDetails$ = this._outService.outDetails$;
        this._outService.outDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outDetail: any) => {
                // Update the counts
                if(outDetail !== null){
                    this.outDetailsCount = outDetail.length;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._outService.outDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outDetailPagenation: OutDetailPagenation) => {
                // Update the pagination
                this.outDetailPagenation = outDetailPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.outHeaderForm.patchValue({'account': ''});
        this.outHeaderForm.patchValue({'address': ''});
        this.outHeaderForm.patchValue({'type': '1'});
        this.outHeaderForm.patchValue({'status': 'N'});
        this.outHeaderForm.patchValue({'dlvAccount': ''});
        this.outHeaderForm.patchValue({'dlvAddress': ''});
        this.outHeaderForm.patchValue({'dlvDate': ''});
        this.outHeaderForm.patchValue({'remarkHeader': ''});

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
    headerDataSet(sendData: OutBound[]) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i=0; i<sendData.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            sendData[i].account = this.outHeaderForm.controls['account'].value;
            sendData[i].address = this.outHeaderForm.controls['address'].value;
            sendData[i].obNo = this.outHeaderForm.controls['obNo'].value;
            sendData[i].type = this.outHeaderForm.controls['type'].value;
            sendData[i].status = this.outHeaderForm.controls['status'].value;
            sendData[i].dlvAccount = this.outHeaderForm.controls['dlvAccount'].value;
            sendData[i].dlvAddress = this.outHeaderForm.controls['dlvAddress'].value;
            sendData[i].dlvDate = this.outHeaderForm.controls['dlvDate'].value;
            sendData[i].remarkHeader = this.outHeaderForm.controls['remarkHeader'].value;
        }
        return sendData;
    }
    /* 저장
     *
     */
    saveOut(): void{

        if(!this.outHeaderForm.invalid){
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
                        this.outDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((outDetail) => {
                                outDetail.forEach((sendData: any) => {
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
                message: '(빨간색 표시)필수값 들을 입력해주세요.'
            };

            // Show the alert
            this.showAlert = true;
        }

    }

    /* 추가
     *
     * @param sendData
     */
    createOut(sendData: OutBound[]): void{
        if(sendData){
            sendData = this.headerDataSet(sendData);

            this._outService.createOut(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((outBound: any) => {
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
        this.outDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outDetail) => {
                // @ts-ignore
                outDetail.push({
                    no: outDetail.length + 1,
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
                        this.outDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((outDetail) => {
                                // eslint-disable-next-line prefer-arrow/prefer-arrow-functions,@typescript-eslint/prefer-for-of
                                for(let e=0; e<outDetail.length; e++){
                                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                                    if(row.selected[i].no === outDetail[e].no){
                                        if(outDetail[e].flag === 'D'){
                                            outDetail[e].flag = '';
                                        }else{
                                            outDetail[e].flag = 'D';
                                        }
                                    }
                                }
                            });
                    }else{
                        this.outDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((outDetail) => {
                                // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
                                for(let e=0; e<outDetail.length; e++){
                                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                                    if(row.selected[i].no === outDetail[e].no){
                                        outDetail.splice(e,1);
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

        this.outDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outDetail) =>{
                this.selection.select(...outDetail);
            });
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): any {
        const numSelected = this.selection.selected.length;
        const numRows = this.outDetailsCount;
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
                    this.outHeaderForm.patchValue({'account': result.accountCd});
                    this.outHeaderForm.patchValue({'accountNm': result.accountNm});
                    this.outHeaderForm.patchValue({'address': result.address});
                }
            });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    backPage() {
        this._router.navigate(['in-out/out']);
    }
}
