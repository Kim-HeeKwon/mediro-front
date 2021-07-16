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
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {CommonPopupComponent} from '../../../../../../@teamplat/components/common-popup';
import {SaveAlertComponent} from '../../../../../../@teamplat/components/common-alert/save-alert';
import {InBound, InDetail, InDetailPagenation} from '../in.types';
import {InService} from '../in.service';

@Component({
    selector       : 'in-new',
    templateUrl    : './in-new.component.html',
    styleUrls: ['./in-new.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class InNewComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatPaginator) private _inDetailPagenator: MatPaginator;
    @ViewChild(MatSort) private _inDetailSort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild(MatTable,{static:true}) _table: MatTable<any>;
    isLoading: boolean = false;
    inHeaderForm: FormGroup;
    flashMessage: 'success' | 'error' | null = null;
    inDetailsCount: number = 0;

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

    inDetailPagenation: InDetailPagenation | null = null;
    inDetails$ = new Observable<InDetail[]>();
    inDetail: InDetail = null;
    selection = new SelectionModel<any>(true, []);

    inDetailsTableStyle: TableStyle = new TableStyle();
    inDetailsTable: TableConfig[] = [
        {headerText : '라인번호' , dataField : 'obLineNo', display : false},
        {headerText : '품목코드' , dataField : 'itemCd', width: 80, display : true, type: 'text'},
        {headerText : '품목명' , dataField : 'itemNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '품목 등급' , dataField : 'itemGrade', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '규격' , dataField : 'standard', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '단위' , dataField : 'unit', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '입고 예정 수량' , dataField : 'obExpQty', width: 50, display : true, type: 'number', style: this.inDetailsTableStyle.textAlign.right},
        {headerText : '수량' , dataField : 'qty', width: 50, display : true, type: 'number', style: this.inDetailsTableStyle.textAlign.right},
        {headerText : '단가' , dataField : 'unitPrice', width: 50, display : true, disabled : true, type: 'number', style: this.inDetailsTableStyle.textAlign.right},
        {headerText : '금액' , dataField : 'totalAmt', width: 50, display : true, disabled : true, type: 'number', style: this.inDetailsTableStyle.textAlign.right},
        {headerText : '입고일자' , dataField : 'lot1', width: 100, display : true, disabled : true, type: 'date'},
        {headerText : '유효기간' , dataField : 'lot2', width: 100, display : true, type: 'date'},
        {headerText : '제조사 lot' , dataField : 'lot3', width: 100, display : true, type: 'text'},
        {headerText : 'UDI No.' , dataField : 'lot4', width: 100, display : true, type: 'text'},
        {headerText : 'lot5' , dataField : 'lot5', width: 100, display : false, type: 'text'},
        {headerText : 'lot6' , dataField : 'lot6', width: 100, display : false, type: 'text'},
        {headerText : 'lot7' , dataField : 'lot7', width: 100, display : false, type: 'text'},
        {headerText : 'lot8' , dataField : 'lot8', width: 100, display : false, type: 'text'},
        {headerText : 'lot9' , dataField : 'lot9', width: 100, display : false, type: 'text'},
        {headerText : 'lot10' , dataField : 'lot10', width: 100, display : false, type: 'text'},
        {headerText : '비고' , dataField : 'remarkDetail', width: 100, display : true, type: 'text'},
    ];
    inDetailsTableColumns: string[] = [
        'select',
        'no',
        'obLineNo',
        'itemCd',
        'itemNm',
        'itemGrade',
        'standard',
        'unit',
        'obExpQty',
        'qty',
        'unitPrice',
        'totalAmt',
        'lot1',
        'lot2',
        'lot3',
        'lot4',
        'lot5',
        'lot6',
        'lot7',
        'lot8',
        'lot9',
        'lot10',
        'remarkDetail',
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _inService: InService,
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
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data,'IB_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data,'IB_STATUS', this.filterList);
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Form 생성
        this.inHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            ibNo: [{value:'',disabled:true}],   // 입고번호
            account: [{value:''},[Validators.required]], // 거래처 코드
            accountNm: [{value:'',disabled:true}],   // 거래처 명
            type: [{value:''}, [Validators.required]],   // 유형
            status: [{value:'',disabled:true}, [Validators.required]],   // 상태
            supplier: [{value:''}],   // 공급사
            supplierNm: [{value:'',disabled:true}],   // 공급사 명
            ibCreDate: [{value:'',disabled:true}],//작성일
            ibDate: [{value:'',disabled:true}], //입고일
            remarkHeader: [''], //비고
            active: [false]  // cell상태
        });
        this._inService.getNew(0,10,'','asc', {});

        this.inDetails$ = this._inService.inDetails$;
        this._inService.inDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inDetail: any) => {
                // Update the counts
                if(inDetail !== null){
                    this.inDetailsCount = inDetail.length;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._inService.inDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inDetailPagenation: InDetailPagenation) => {
                // Update the pagination
                this.inDetailPagenation = inDetailPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.inHeaderForm.patchValue({'account': ''});
        this.inHeaderForm.patchValue({'type': '1'});
        this.inHeaderForm.patchValue({'status': 'N'});
        this.inHeaderForm.patchValue({'supplier': ''});
        this.inHeaderForm.patchValue({'remarkHeader': ''});

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
    headerDataSet(sendData: InBound[]) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i=0; i<sendData.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            sendData[i].account = this.inHeaderForm.controls['account'].value;
            sendData[i].ibNo = this.inHeaderForm.controls['ibNo'].value;
            sendData[i].type = this.inHeaderForm.controls['type'].value;
            sendData[i].status = this.inHeaderForm.controls['status'].value;
            sendData[i].supplier = this.inHeaderForm.controls['supplier'].value;
            sendData[i].remarkHeader = this.inHeaderForm.controls['remarkHeader'].value;
        }
        return sendData;
    }
    /* 저장
     *
     */
    saveIn(): void{

        if(!this.inHeaderForm.invalid){
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
                        this.inDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((inDetail) => {
                                inDetail.forEach((sendData: any) => {
                                    if (sendData.flag) {
                                        if (sendData.flag === 'C') {
                                            createList.push(sendData);
                                        }
                                    }
                                });
                            });
                        if (createList.length > 0) {
                            this.createIn(createList);
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
    createIn(sendData: InBound[]): void{
        if(sendData){
            sendData = this.headerDataSet(sendData);

            this._inService.createIn(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((inBound: any) => {
                });
        }

    }
    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param account
     */
    trackByFn(index: number, inDetail: any): any {
        return inDetail.id || index;
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
        this.inDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inDetail) => {
                // @ts-ignore
                inDetail.push({
                    no: inDetail.length + 1,
                    flag: 'C',
                    ibLineNo: 0,
                    itemCd: '',
                    itemNm: '',
                    itemGrade: '',
                    standard: '',
                    unit: '',
                    ibExpQty: 0,
                    qty: 0,
                    unitPrice: 0,
                    totalAmt: 0,
                    lot1: '',
                    lot2: '',
                    lot3: '',
                    lot4: '',
                    lot5: '',
                    lot6: '',
                    lot7: '',
                    lot8: '',
                    lot9: '',
                    lot10: '',
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
                        this.inDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((inDetail) => {
                                // eslint-disable-next-line prefer-arrow/prefer-arrow-functions,@typescript-eslint/prefer-for-of
                                for(let e=0; e<inDetail.length; e++){
                                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                                    if(row.selected[i].no === inDetail[e].no){
                                        if(inDetail[e].flag === 'D'){
                                            inDetail[e].flag = '';
                                        }else{
                                            inDetail[e].flag = 'D';
                                        }
                                    }
                                }
                            });
                    }else{
                        this.inDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((inDetail) => {
                                // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
                                for(let e=0; e<inDetail.length; e++){
                                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                                    if(row.selected[i].no === inDetail[e].no){
                                        inDetail.splice(e,1);
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

        this.inDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inDetail) =>{
                this.selection.select(...inDetail);
            });
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): any {
        const numSelected = this.selection.selected.length;
        const numRows = this.inDetailsCount;
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
                        element.itemGrade = result.itemGrade;
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
                    this.inHeaderForm.patchValue({'account': result.accountCd});
                    this.inHeaderForm.patchValue({'accountNm': result.accountNm});
                }
            });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    backPage() {
        this._router.navigate(['in-out/in']);
    }
}
