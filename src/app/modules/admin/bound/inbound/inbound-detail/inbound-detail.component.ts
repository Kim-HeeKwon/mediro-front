import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit, ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {InboundService} from '../inbound.service';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {CommonCode, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {MatTable} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {merge, Observable, Subject} from 'rxjs';
import {InBound, InBoundDetail, InBoundDetailPagenation} from '../inbound.types';
import {TableConfig, TableStyle} from '../../../../../../@teamplat/components/common-table/common-table.types';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {CommonPopupComponent} from '../../../../../../@teamplat/components/common-popup';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {FunctionService} from '../../../../../../@teamplat/services/function';
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import {CommonUdiRtnScanComponent} from '../../../../../../@teamplat/components/common-udi-rtn-scan';

@Component({
    selector       : 'inbound-detail',
    templateUrl    : './inbound-detail.component.html',
    styleUrls: ['./inbound-detail.component.scss'],
})
export class InboundDetailComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatTable,{static:true}) _table: MatTable<any>;
    @ViewChild(MatPaginator) private _inBoundDetailPagenator: MatPaginator;
    @ViewChild(MatSort) private _inBoundDetailSort: MatSort;
    isLoading: boolean = false;
    selection = new SelectionModel<any>(true, []);
    inboundDetailsCount: number = 0;
    inBoundHeaderForm: FormGroup;
    inBoundDetails$ = new Observable<InBoundDetail[]>();
    inBoundDetailsTableStyle: TableStyle = new TableStyle();
    inBoundDetailsTable: TableConfig[] = [
        {headerText : '라인번호' , dataField : 'ibLineNo', display : false},
        {headerText : '품목코드' , dataField : 'itemCd', width: 70, display : true, type: 'text',validators: true},
        {headerText : '품목명' , dataField : 'itemNm', width: 60, display : true, disabled : true, type: 'text'},
        {headerText : '품목등급' , dataField : 'itemGrade', width: 60, display : true, disabled : true, type: 'text',combo : true},
        {headerText : '규격' , dataField : 'standard', width: 60, display : true, disabled : true, type: 'text'},
        {headerText : '단위' , dataField : 'unit', width: 60, display : true, disabled : true, type: 'text'},
        {headerText : '입고대상수량' , dataField : 'ibExpQty', width: 100, display : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right,validators: true},
        {headerText : '수량' , dataField : 'qty', width: 60, display : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right},
        {headerText : '입고수량' , dataField : 'ibQty', width: 60, display : true, disabled : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right},
        {headerText : '단가' , dataField : 'unitPrice', width: 60, display : true, disabled : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right},
        {headerText : '금액' , dataField : 'totalAmt', width: 60, display : true, disabled : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right},
        {headerText : '입고일자' , dataField : 'lot1', width: 60, display : false, disabled : true, type: 'date'},
        {headerText : '유효기간' , dataField : 'lot2', width: 100, display : true, type: 'date'},
        {headerText : '제조사 lot' , dataField : 'lot3', width: 100, display : true, type: 'text'},
        {headerText : 'UDI No.' , dataField : 'lot4', width: 100, display : true, type: 'text'},
        {headerText : 'lot5' , dataField : 'lot5', width: 100, display : false, type: 'text'},
        {headerText : 'lot6' , dataField : 'lot6', width: 100, display : false, type: 'text'},
        {headerText : 'lot7' , dataField : 'lot7', width: 100, display : false, type: 'text'},
        {headerText : 'lot8' , dataField : 'lot8', width: 100, display : false, type: 'text'},
        {headerText : 'lot9' , dataField : 'lot9', width: 100, display : false, type: 'text'},
        {headerText : 'lot10' , dataField : 'lot10', width: 100, display : false, type: 'text'},
        {headerText : '비고' , dataField : 'remarkDetail', width: 100, display : false, type: 'text'},
        /*{headerText : '라인번호' , dataField : 'ibLineNo', display : false},
        {headerText : '품목코드' , dataField : 'itemCd', width: 60, display : true, type: 'text'},
        {headerText : '품목명' , dataField : 'itemNm', width: 60, display : true, disabled : true, type: 'text'},
        {headerText : '품목등급' , dataField : 'itemGrade', width: 60, display : true, disabled : true, type: 'text',combo : true},
        {headerText : '규격' , dataField : 'standard', width: 60, display : true, disabled : true, type: 'text'},
        {headerText : '단위' , dataField : 'unit', width: 60, display : true, disabled : true, type: 'text'},
        {headerText : '입고대상수량' , dataField : 'ibExpQty', width: 100, display : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right},
        {headerText : '수량' , dataField : 'qty', width: 60, display : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right},
        {headerText : '입고수량' , dataField : 'ibQty', width: 60, display : true, disabled : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right},
        {headerText : '단가' , dataField : 'unitPrice', width: 60, display : true, disabled : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right},
        {headerText : '금액' , dataField : 'totalAmt', width: 60, display : true, disabled : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right},
        {headerText : '입고일자' , dataField : 'lot1', width: 60, display : false, disabled : true, type: 'date'},
        {headerText : '유효기간' , dataField : 'lot2', width: 100, display : true, type: 'date'},
        {headerText : '제조사 lot' , dataField : 'lot3', width: 100, display : true, type: 'text'},
        {headerText : 'UDI No.' , dataField : 'lot4', width: 100, display : true, type: 'text'},
        {headerText : 'lot5' , dataField : 'lot5', width: 100, display : false, type: 'text'},
        {headerText : 'lot6' , dataField : 'lot6', width: 100, display : false, type: 'text'},
        {headerText : 'lot7' , dataField : 'lot7', width: 100, display : false, type: 'text'},
        {headerText : 'lot8' , dataField : 'lot8', width: 100, display : false, type: 'text'},
        {headerText : 'lot9' , dataField : 'lot9', width: 100, display : false, type: 'text'},
        {headerText : 'lot10' , dataField : 'lot10', width: 100, display : false, type: 'text'},
        {headerText : '비고' , dataField : 'remarkDetail', width: 100, display : false, type: 'text'},*/
    ];
    inBoundDetailsTableColumns: string[] = [
        'select',
        'no',
        'ibLineNo',
        'itemCd',
        'itemNm',
        'itemGrade',
        'standard',
        'unit',
        'ibExpQty',
        'qty',
        'ibQty',
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
    itemGrades: CommonCode[] = null;
    type: CommonCode[] = null;
    status: CommonCode[] = null;

    inBoundDetailPagenation: InBoundDetailPagenation | null = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _inboundService: InboundService,
        private _matDialog: MatDialog,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _formBuilder: FormBuilder,
        public _matDialogPopup: MatDialog,
        private _codeStore: CodeStore,
        private _functionService: FunctionService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _utilService: FuseUtilsService
    )
    {
        this.type = _utilService.commonValue(_codeStore.getValue().data,'IB_TYPE');
        this.status = _utilService.commonValue(_codeStore.getValue().data,'IB_STATUS');
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data,'ITEM_GRADE');
        this.inBoundDetails$ = this._inboundService.inBoundDetails$;
        this._inboundService.inBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBoundDetail: any) => {
                // Update the counts
                if(inBoundDetail !== null){
                    this.inboundDetailsCount = inBoundDetail.length;
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
        this.inBoundHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            ibNo: [{value:'',disabled:true}],   // 입고번호
            account: [{value:'',disabled:true},[Validators.required]], // 거래처 코드
            accountNm: [{value:'',disabled:true}],   // 거래처 명
            type: [{value:'',disabled:true}, [Validators.required]],   // 유형
            status: [{value:'',disabled:true}, [Validators.required]],   // 상태
            supplier: [{value:'',disabled:true}],   // 공급사
            supplierNm: [{value:'',disabled:true}],   // 공급사 명
            ibCreDate: [{value:'',disabled:true}],//작성일
            ibDate: [{value:'',disabled:true}], //입고일
            remarkHeader: [''], //비고
            poNo: [{value:'',disabled:true}],   // 발주번호
            active: [false]  // cell상태
        });
        this._inboundService.inBoundHeader$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBound: any) => {
                // Update the pagination
                if(inBound !== null){
                    this.inBoundHeaderForm.patchValue(inBound);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        this.tableEditingEvent();

        this._inboundService.inBoundDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBoundDetailPagenation: InBoundDetailPagenation) => {
                // Update the pagination
                if(inBoundDetailPagenation !== null){
                    this.inBoundDetailPagenation = inBoundDetailPagenation;
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
        let inBoundHeader = null;

        this._inboundService.inBoundHeader$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBound: any) => {
                // Update the pagination
                if(inBound !== null){
                    inBoundHeader = inBound;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        if(inBoundHeader === null){
            inBoundHeader = {};
        }

        if(this._inBoundDetailSort !== undefined){
            // Get products if sort or page changes
            merge(this._inBoundDetailSort.sortChange, this._inBoundDetailPagenator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._inboundService.getDetail(this._inBoundDetailPagenator.pageIndex, this._inBoundDetailPagenator.pageSize, this._inBoundDetailSort.active, this._inBoundDetailSort.direction, inBoundHeader);
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
    trackByFn(index: number, inBoundDetail: any): any {
        return inBoundDetail.id || index;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    saveIn() {
        const status = this.inBoundHeaderForm.controls['status'].value;

        //신규가 아니면 불가능
        if(status !== 'N'){
            this._functionService.cfn_alert('저장 할 수 없습니다.');
            return;
        }

        const validCheck = this._functionService.cfn_validator('상세정보',
            this.inBoundDetails$,
            this.inBoundDetailsTable);

        if(validCheck){
            return;
        }

        if(this.inBoundHeaderForm.controls['status'].value !== 'N'){
            this._functionService.cfn_alert('신규 상태에서만 수정이 가능합니다.');
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
                let updateList;
                let deleteList;
               if(result){
                   createList = [];
                   updateList = [];
                   deleteList = [];
                   this.inBoundDetails$
                       .pipe(takeUntil(this._unsubscribeAll))
                       .subscribe((inBoundDetail) => {
                           inBoundDetail.forEach((sendData: any) => {
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
                   let inBoundHeader = null;

                   this._inboundService.inBoundHeader$
                       .pipe(takeUntil(this._unsubscribeAll))
                       .subscribe((inBound: any) => {
                           // Update the pagination
                           if(inBound !== null){
                               inBoundHeader = inBound;
                           }
                           // Mark for check
                           this._changeDetectorRef.markForCheck();
                       });

                   if(inBoundHeader === null){
                       inBoundHeader = {};
                   }
                   if (createList.length > 0) {
                       this.createIn(createList,inBoundHeader);
                   }
                   if (updateList.length > 0) {
                       this.updateIn(updateList,inBoundHeader);
                   }
                   if (deleteList.length > 0) {
                       this.deleteIn(deleteList,inBoundHeader);
                   }
               };
            });
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: InBound[],inBoundHeader: any) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i=0; i<sendData.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            /*sendData[i].account = inBoundHeader['account'];
            sendData[i].ibNo = inBoundHeader['ibNo'];
            sendData[i].type = inBoundHeader['type'];
            sendData[i].status = inBoundHeader['status'];
            sendData[i].supplier = inBoundHeader['supplier'];
            sendData[i].remarkHeader = inBoundHeader['remarkHeader'];*/
            sendData[i].account = this.inBoundHeaderForm.controls['account'].value;
            sendData[i].ibNo = this.inBoundHeaderForm.controls['ibNo'].value;
            sendData[i].type = this.inBoundHeaderForm.controls['type'].value;
            sendData[i].status = this.inBoundHeaderForm.controls['status'].value;
            sendData[i].supplier = this.inBoundHeaderForm.controls['supplier'].value;
            sendData[i].remarkHeader = this.inBoundHeaderForm.controls['remarkHeader'].value;
        }
        return sendData;
    }

    /* 추가
     *
     * @param sendData
     */
    createIn(sendData: InBound[],inBoundHeader: any): void{
        if(sendData){
            sendData = this.headerDataSet(sendData,inBoundHeader);
            this._inboundService.createIn(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((inBound: any) => {
                });
        }
    }
    /* 수정
     *
     * @param sendData
     */
    updateIn(sendData: InBound[],inBoundHeader: any): void{
        if(sendData){
            sendData = this.headerDataSet(sendData,inBoundHeader);

            this._inboundService.updateIn(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((inBound: any) => {
                });
        }
    }

    /* 삭제
     * @param sendData
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    deleteIn(sendData: InBound[],inBoundHeader: any) {
        if(sendData){
            sendData = this.headerDataSet(sendData,inBoundHeader);

            this._inboundService.deleteIn(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(
                    (inBound: any) => {
                    },(response) => {});
        }

    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    cellClick(element, column: TableConfig, i) {
        const disableList = [
            'itemCd',
            'itemNm',
            'itemGrade',
            'standard',
            'unit',
            'ibExpQty',
            'qty',
            'ibQty',
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
            'remarkDetail'
        ];
        const enableList = [
            'ibExpQty',
        ];

        const enableListInBound = [
            'qty',
        ];
        const status = this.inBoundHeaderForm.controls['status'].value;
        this._functionService.cfn_cellDisable(column,disableList);

        //신규만 가능
        if(status === 'N'){
            this._functionService.cfn_cellEnable(column,enableList);
        }

        //신규, 부분입고 가능
        if(status === 'N' || status === 'P'){
            this._functionService.cfn_cellEnable(column,enableListInBound);
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
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    updateRowData(element, column: TableConfig, i) {
        if(element.flag !== 'C' || !element.flag){
            element.flag = 'U';
        }

        const ibStatus = this.inBoundHeaderForm.controls['status'].value;
        if(element.flag === 'U'){

        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    transactionRow(action, row) {
        const status = this.inBoundHeaderForm.controls['status'].value;

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
        this.inBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBoundDetail) => {
                // @ts-ignore
                inBoundDetail.push({
                    no: inBoundDetail.length + 1,
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
                        this.inBoundDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((inBoundDetail) => {
                                // eslint-disable-next-line prefer-arrow/prefer-arrow-functions,@typescript-eslint/prefer-for-of
                                for(let e=0; e<inBoundDetail.length; e++){
                                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                                    if(row.selected[i].no === inBoundDetail[e].no){
                                        if(inBoundDetail[e].flag === 'D'){
                                            inBoundDetail[e].flag = '';
                                        }else{
                                            inBoundDetail[e].flag = 'D';
                                        }
                                    }
                                }
                            });
                    }else{
                        this.inBoundDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((inBoundDetail) => {
                                // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
                                for(let e=0; e<inBoundDetail.length; e++){
                                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                                    if(row.selected[i].no === inBoundDetail[e].no){
                                        inBoundDetail.splice(e,1);
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
        const numRows = this.inboundDetailsCount;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): SelectionModel<any> {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }

        this.inBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBoundDetail) => {
                this.selection.select(...inBoundDetail);
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
    getComboData(column: TableConfig) {
        let combo;
        if(column.dataField === 'itemGrade'){
            combo = this.itemGrades;
        }
        return combo;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    tableEditingEvent(){
        this.inBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBoundDetail) => {
                // @ts-ignore
                if(inBoundDetail !== null){
                    const ibStatus = this.inBoundHeaderForm.controls['status'].value;
                    if(ibStatus === 'N' || ibStatus === 'P'){
                        inBoundDetail.forEach((detail: any) => {
                            detail.qty = detail.ibExpQty - detail.ibQty;
                        });

                        this.inBoundDetailsTable.forEach((table: any) => {
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
    inBound() {
        const ibStatus = this.inBoundHeaderForm.controls['status'].value;
        const ibType = this.inBoundHeaderForm.controls['type'].value;
        if(ibStatus !== 'N' && ibStatus !== 'P'){
            this._functionService.cfn_alert('입고할 수 없는 상태입니다.');
            return false;
        }
        let inBoundData;
        let inBoundDataFilter;
        let udiCheckData;
        this.inBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBoundDetail) => {
                inBoundData = inBoundDetail.filter((detail: any) => detail.qty > 0)
                    .map((param: any) => {
                        return param;
                });

                inBoundDataFilter = inBoundData.filter((detail: any) => detail.udiYn !== 'Y')
                    .map((param: any) => {
                        return param;
                    });

                udiCheckData = inBoundData.filter((detail: any) => detail.udiYn === 'Y')
                    .map((param: any) => {
                        return param;
                    });
            });

        if(inBoundData.length < 1) {
            this._functionService.cfn_alert('입고 수량이 존재하지 않습니다.');
            return false;
        }else{

            //반품일 경우
            if(ibType === '2'){
                if(udiCheckData.length > 0){
                    //UDI 체크 로우만 나오게 하고 , outBoundData 는 숨기기
                    //입력 수량 그대로 가져오기
                    //UDI 정보 INPUT 후 값 셋팅
                    const popup =this._matDialogPopup.open(CommonUdiRtnScanComponent, {
                        data: {
                            detail : udiCheckData
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
                                    inBoundDataFilter.push(result[i]);
                                }

                                const conf = this._teamPlatConfirmationService.open({
                                    title  : '입고',
                                    message: '입고하시겠습니까?',
                                    actions: {
                                        confirm: {
                                            label: '입고'
                                        },
                                        cancel: {
                                            label: '닫기'
                                        }
                                    }
                                });
                                //lot 셋팅
                                inBoundDataFilter.forEach((inBound: any) => {
                                    inBound.lot4 = inBound.udiCode;
                                });
                                conf.afterClosed()
                                    .pipe(takeUntil(this._unsubscribeAll))
                                    .subscribe((rtn) => {
                                        if(rtn){
                                            this.inBoundDetailConfirm(inBoundDataFilter);
                                        }
                                    });
                            }
                        }
                    });
                }
            }else{
                const confirmation = this._teamPlatConfirmationService.open({
                    title  : '입고',
                    message: '입고하시겠습니까?',
                    actions: {
                        confirm: {
                            label: '입고'
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
                            this.inBoundDetailConfirm(inBoundData);
                        }
                    });
            }
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
    /* 입고 (상세)
     *
     * @param sendData
     */
    inBoundDetailConfirm(sendData: InBound[]): void{
        if(sendData){
            this._inboundService.inBoundDetailConfirm(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((inBound: any) => {
                    this._functionService.cfn_alertCheckMessage(inBound);
                    this.reloadDetail();
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    reloadDetail() {

    }
}
