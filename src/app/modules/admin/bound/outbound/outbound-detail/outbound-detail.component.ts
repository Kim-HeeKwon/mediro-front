import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatTable} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {SelectionModel} from '@angular/cdk/collections';
import {merge, Observable, Subject} from 'rxjs';
import {TableConfig, TableStyle} from '../../../../../../@teamplat/components/common-table/common-table.types';
import {OutBound, OutBoundDetail, OutBoundDetailPagenation} from '../outbound.types';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {CommonCode, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {OutboundService} from '../outbound.service';
import {SaveAlertComponent} from '../../../../../../@teamplat/components/common-alert/save-alert';
import {CommonPopupComponent} from '../../../../../../@teamplat/components/common-popup';
import {FunctionService} from '../../../../../../@teamplat/services/function';
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import {CommonUdiScanComponent} from '../../../../../../@teamplat/components/common-udi-scan';

@Component({
    selector       : 'outbound-detail',
    templateUrl    : './outbound-detail.component.html',
    styleUrls: ['./outbound-detail.component.scss'],
})
export class OutboundDetailComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatTable,{static:true}) _table: MatTable<any>;
    @ViewChild(MatPaginator) private _outBoundDetailPagenator: MatPaginator;
    @ViewChild(MatSort) private _outBoundDetailSort: MatSort;
    isLoading: boolean = false;
    selection = new SelectionModel<any>(true, []);
    outboundDetailsCount: number = 0;
    outBoundHeaderForm: FormGroup;
    outBoundDetails$ = new Observable<OutBoundDetail[]>();
    outBoundDetailsTableStyle: TableStyle = new TableStyle();
    outBoundDetailsTable: TableConfig[] = [
        {headerText : '라인번호' , dataField : 'obLineNo', display : false},
        {headerText : '품목코드' , dataField : 'itemCd', width: 80, display : true, type: 'text',validators: true},
        {headerText : '품목명' , dataField : 'itemNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '출고대상수량' , dataField : 'obExpQty', width: 50, display : true, type: 'number', style: this.outBoundDetailsTableStyle.textAlign.right,validators: true},
        {headerText : '수량' , dataField : 'qty', width: 50, display : true, type: 'number', style: this.outBoundDetailsTableStyle.textAlign.right},
        {headerText : '출고수량' , dataField : 'obQty', width: 60, display : true, disabled : true, type: 'number', style: this.outBoundDetailsTableStyle.textAlign.right},
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
        'obQty',
        'remarkDetail',
    ];
    outBoundDetailPagenation: OutBoundDetailPagenation | null = null;
    type: CommonCode[] = null;
    status: CommonCode[] = null;
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
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _codeStore: CodeStore,
        private _changeDetectorRef: ChangeDetectorRef,
        private _utilService: FuseUtilsService,
        private _functionService: FunctionService,
    )
    {
        this.type = _utilService.commonValue(_codeStore.getValue().data,'OB_TYPE');
        this.status = _utilService.commonValue(_codeStore.getValue().data,'OB_STATUS');

        this.outBoundDetails$ = this._outboundService.outBoundDetails$;
        this._outboundService.outBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBoundDetail: any) => {
                // Update the counts
                if(outBoundDetail !== null){
                    this.outboundDetailsCount = outBoundDetail.length;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
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
            account: [{value:'',disabled:true},[Validators.required]], // 거래처 코드
            accountNm: [{value:'',disabled:true}],   // 거래처 명
            address: [{value:'',disabled:true}, [Validators.required]],   // 거래처 주소
            type: [{value:'',disabled:true}, [Validators.required]],   // 유형
            status: [{value:'',disabled:true}, [Validators.required]],   // 상태
            dlvAccount: [{value:'',disabled:true}],   // 배송처
            dlvAddress: [{value:'',disabled:true}],   // 배송처 주소
            dlvDate: [{value:'',disabled:true}, [Validators.required]],//배송일
            obCreDate: [{value:'',disabled:true}],//작성일
            obDate: [{value:'',disabled:true}], //출고일
            remarkHeader: [''], //비고
            active: [false]  // cell상태
        });

        this._outboundService.outBoundHeader$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBound: any) => {
                // Update the pagination
                if(outBound !== null){
                    this.outBoundHeaderForm.patchValue(outBound);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        this.tableEditingEvent();

        this._outboundService.outBoundDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBoundDetailPagenation: OutBoundDetailPagenation) => {
                // Update the pagination
                if(outBoundDetailPagenation !== null){
                    this.outBoundDetailPagenation = outBoundDetailPagenation;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        let outBoundHeader = null;

        this._outboundService.outBoundHeader$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBound: any) => {
                // Update the pagination
                if(outBound !== null){
                    outBoundHeader = outBound;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        if(outBoundHeader === null){
            outBoundHeader = {};
        }

        if(this._outBoundDetailSort !== undefined){
            // Get products if sort or page changes
            merge(this._outBoundDetailSort.sortChange, this._outBoundDetailPagenator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._outboundService.getDetail(this._outBoundDetailPagenator.pageIndex, this._outBoundDetailPagenator.pageSize, this._outBoundDetailSort.active, this._outBoundDetailSort.direction, outBoundHeader);
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).pipe(takeUntil(this._unsubscribeAll)).subscribe();
        }
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param account
     */
    trackByFn(index: number, outBoundDetail: any): any {
        return outBoundDetail.id || index;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    saveOut() {

        const status = this.outBoundHeaderForm.controls['status'].value;

        //신규가 아니면 불가능
        if(status !== 'N'){
            this._functionService.cfn_alert('저장 할 수 없습니다.');
            return;
        }

        const validCheck = this._functionService.cfn_validator('상세정보',
            this.outBoundDetails$,
            this.outBoundDetailsTable);

        if(validCheck){
            return;
        }

        const saveConfirm =this._matDialog.open(SaveAlertComponent, {
            data: {
            }
        });
        saveConfirm.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                let createList;
                let updateList;
                let deleteList;
                if (result.status) {
                    createList = [];
                    updateList = [];
                    deleteList = [];
                    this.outBoundDetails$
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((outBoundDetail) => {
                            outBoundDetail.forEach((sendData: any) => {
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
                    let outBoundHeader = null;

                    this._outboundService.outBoundHeader$
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((outBound: any) => {
                            // Update the pagination
                            if(outBound !== null){
                                outBoundHeader = outBound;
                            }
                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        });

                    if(outBoundHeader === null){
                        outBoundHeader = {};
                    }
                    if (createList.length > 0) {
                        this.createOut(createList,outBoundHeader);
                    }
                    if (updateList.length > 0) {
                        this.updateOut(updateList,outBoundHeader);
                    }
                    if (deleteList.length > 0) {
                        this.deleteOut(deleteList,outBoundHeader);
                    }
                }
            });
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: OutBound[],outBoundHeader: any) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i=0; i<sendData.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            /*sendData[i].account = outBoundHeader['account'];
            sendData[i].address = outBoundHeader['address'];
            sendData[i].obNo = outBoundHeader['obNo'];
            sendData[i].type = outBoundHeader['type'];
            sendData[i].status = outBoundHeader['status'];
            sendData[i].dlvAccount = outBoundHeader['dlvAccount'];
            sendData[i].dlvAddress = outBoundHeader['dlvAddress'];
            sendData[i].dlvDate = outBoundHeader['dlvDate'];
            sendData[i].remarkHeader = outBoundHeader['remarkHeader'];*/
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

    /* 추가
     *
     * @param sendData
     */
    createOut(sendData: OutBound[],outBoundHeader: any): void{
        if(sendData){
            sendData = this.headerDataSet(sendData,outBoundHeader);
            this._outboundService.createOut(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((outBound: any) => {
                });
        }
    }
    /* 수정
     *
     * @param sendData
     */
    updateOut(sendData: OutBound[],outBoundHeader: any): void{
        if(sendData){
            sendData = this.headerDataSet(sendData,outBoundHeader);

            this._outboundService.updateOut(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((outBound: any) => {
                });
        }
    }

    /* 삭제
     * @param sendData
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    deleteOut(sendData: OutBound[],outBoundHeader: any) {
        if(sendData){
            sendData = this.headerDataSet(sendData,outBoundHeader);

            this._outboundService.deleteOut(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(
                    (outBound: any) => {
                    },(response) => {});
        }

    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    cellClick(element, column: TableConfig, i) {
        const disableList = [
            'itemCd',
            'itemNm',
            'obExpQty',
            'qty',
            'obQty',
            'remarkDetail',
        ];
        const enableList = [
            'obExpQty',
        ];

        const enableListOutBound = [
            'qty',
        ];
        const status = this.outBoundHeaderForm.controls['status'].value;
        this._functionService.cfn_cellDisable(column,disableList);

        //신규만 가능
        if(status === 'N'){
            this._functionService.cfn_cellEnable(column,enableList);
        }

        //신규, 부분출고 가능
        if(status === 'N' || status === 'P'){
            this._functionService.cfn_cellEnable(column,enableListOutBound);
        }
        if(element.flag !== undefined && element.flag === 'C') {
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
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    updateRowData(element, column: TableConfig, i) {
        if(element.flag !== 'C' || !element.flag){
            element.flag = 'U';
        }
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    transactionRow(action, row) {
        const status = this.outBoundHeaderForm.controls['status'].value;

        //신규가 아니면 불가능
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
        this._changeDetectorRef.markForCheck();
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

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): any {
        const numSelected = this.selection.selected.length;
        const numRows = this.outboundDetailsCount;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): SelectionModel<any> {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }

        this.outBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBoundDetail) => {
                this.selection.select(...outBoundDetail);
            });
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: any): string {
        if (!row) {
            return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    tableClear(){
        this._table.renderRows();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    tableEditingEvent(){
        this.outBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((oubBoundDetail) => {
                // @ts-ignore
                if(oubBoundDetail !== null){
                    const obStatus = this.outBoundHeaderForm.controls['status'].value;
                    if(obStatus === 'N' || obStatus === 'P'){
                        oubBoundDetail.forEach((detail: any) => {
                            /*detail.qty = detail.obExpQty - detail.obQty;*/
                        });

                        this.outBoundDetailsTable.forEach((table: any) => {
                            if(table.dataField === 'itemCd'){
                                table.disabled = true;
                            }
                        });
                    }
                }
                this._changeDetectorRef.markForCheck();
            });
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    outBound() {
        const obStatus = this.outBoundHeaderForm.controls['status'].value;
        if(obStatus !== 'N' && obStatus !== 'P'){
            this._functionService.cfn_alert('출고할 수 없는 상태입니다.');
            return false;
        }

        let outBoundData;
        let outBoundDataFilter;
        let udiCheckData;
        this.outBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBoundDetail) => {
                outBoundData = outBoundDetail.filter((detail: any) => (detail.qty > 0 && detail.qty !== '0'))
                    .map((param: any) => {
                        return param;
                    });

                outBoundDataFilter = outBoundData.filter((detail: any) => detail.udiYn !== 'Y')
                    .map((param: any) => {
                        return param;
                    });

                udiCheckData = outBoundData.filter((detail: any) => detail.udiYn === 'Y')
                    .map((param: any) => {
                        return param;
                    });
            });
        if(outBoundData.length < 1) {
            this._functionService.cfn_alert('출고 수량이 존재하지 않습니다.');
            return false;
        }else{

            if(udiCheckData.length > 0){
                //UDI 체크 로우만 나오게 하고 , outBoundData 는 숨기기
                //입력 수량 그대로 가져오기
                //UDI 정보 INPUT 후 값 셋팅

                const popup =this._matDialogPopup.open(CommonUdiScanComponent, {
                    data: {
                        outBoundDetail : udiCheckData
                    },
                    autoFocus: false,
                    maxHeight: '90vh',
                    disableClose: true
                });

                popup.afterClosed().subscribe((result) => {
                    if(result){

                        if(result !== undefined){

                            // eslint-disable-next-line @typescript-eslint/prefer-for-of
                            for(let i=0; i<result.length; i++){
                                outBoundDataFilter.push(result[i]);
                            }
                            this.outBoundCall(outBoundDataFilter);
                        }
                    }
                });

            }else{
                this.outBoundCall(outBoundData);
            }
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    outBoundCall(outBoundData: OutBound[]){
        const confirmation = this._teamPlatConfirmationService.open({
            title  : '출고',
            message: '출고하시겠습니까?',
            actions: {
                confirm: {
                    label: '출고'
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
                    this.outBoundDetailConfirm(outBoundData);
                }
            });
    }

    /* 출고 (상세)
     *
     * @param sendData
     */
    outBoundDetailConfirm(sendData: OutBound[]): void{
        if(sendData){
            this._outboundService.outBoundDetailConfirm(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((outBound: any) => {
                    this._functionService.cfn_alertCheckMessage(outBound);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        }
    }
}
