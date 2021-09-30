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
import {CommonCode, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {merge, Observable, Subject} from 'rxjs';
import {SelectionModel} from '@angular/cdk/collections';
import {InBound, InBoundDetail, InBoundDetailPagenation} from '../inbound.types';
import {TableConfig, TableStyle} from '../../../../../../@teamplat/components/common-table/common-table.types';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {InboundService} from '../inbound.service';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {CommonPopupComponent} from '../../../../../../@teamplat/components/common-popup';
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import {FunctionService} from '../../../../../../@teamplat/services/function';
import {ItemSearchComponent} from "../../../../../../@teamplat/components/item-search";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {DeviceDetectorService} from "ngx-device-detector";

@Component({
    selector       : 'inbound-new',
    templateUrl    : './inbound-new.component.html',
    styleUrls: ['./inbound-new.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class InboundNewComponent implements OnInit, OnDestroy, AfterViewInit
{
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild(MatPaginator) private _inBoundDetailPagenator: MatPaginator;
    @ViewChild(MatSort) private _inBoundDetailSort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild(MatTable,{static:true}) _table: MatTable<any>;
    isLoading: boolean = false;
    inBoundHeaderForm: FormGroup;
    flashMessage: 'success' | 'error' | null = null;
    inBoundDetailsCount: number = 0;
    isMobile: boolean = false;
    selectedItemForm: FormGroup;
    is_edit:boolean = false;

    // eslint-disable-next-line @typescript-eslint/member-ordering
    showAlert: boolean = false;

    type: CommonCode[] = null;
    status: CommonCode[] = null;
    itemGrades: CommonCode[] = null;
    filterTypeList: string[];
    filterStatusList: string[];

    inBoundDetailPagenation: InBoundDetailPagenation | null = null;
    inBoundDetails$ = new Observable<InBoundDetail[]>();
    inBoundDetail: InBoundDetail = null;
    selection = new SelectionModel<any>(true, []);

    inBoundHeaders: any;
    inBoundDetails: any;
    inBoundDetailsTableStyle: TableStyle = new TableStyle();
    inBoundDetailsTable: TableConfig[] = [
        {headerText : '라인번호' , dataField : 'ibLineNo', display : false},
        {headerText : '품목코드' , dataField : 'itemCd', width: 60, display : true, type: 'text',validators: true},
        {headerText : '품목명' , dataField : 'itemNm', width: 60, display : true, disabled : true, type: 'text'},
        {headerText : '품목등급' , dataField : 'itemGrade', width: 60, display : true, disabled : true, type: 'text',combo:true},
        {headerText : '규격' , dataField : 'standard', width: 60, display : true, disabled : true, type: 'text'},
        {headerText : '단위' , dataField : 'unit', width: 60, display : true, disabled : true, type: 'text'},
        {headerText : '입고대상수량' , dataField : 'ibExpQty', width: 100, display : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right,validators: true},
        {headerText : '수량' , dataField : 'qty', width: 60, display : true, disabled : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right},
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
        private _inboundService: InboundService,
        private _matDialog: MatDialog,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _formBuilder: FormBuilder,
        public _matDialogPopup: MatDialog,
        private _codeStore: CodeStore,
        private readonly breakpointObserver: BreakpointObserver,
        private _deviceService: DeviceDetectorService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _utilService: FuseUtilsService,
        private _functionService: FunctionService,
    )
    {
        this.filterTypeList = ['ALL'];
        this.filterStatusList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data,'IB_TYPE', this.filterTypeList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data,'IB_STATUS', this.filterStatusList);
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data,'ITEM_GRADE');
        this.isMobile = this._deviceService.isMobile();

        if(this._router.getCurrentNavigation() !== (null && undefined)){

            if(this._router.getCurrentNavigation().extras.state !== undefined){
                if(this._router.getCurrentNavigation().extras.state.header !== undefined
                    && this._router.getCurrentNavigation().extras.state.detail !== undefined){
                    //console.log(this._router.getCurrentNavigation().extras.state.header);
                    const header = this._router.getCurrentNavigation().extras.state.header;
                    const detail = this._router.getCurrentNavigation().extras.state.detail;
                    this.inBoundHeaders = header;
                    this.inBoundDetails = detail;
                }
            }

            this._changeDetectorRef.markForCheck();
        }
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
            account: [{value:''},[Validators.required]], // 거래처 코드
            accountNm: [{value:'',disabled:true}],   // 거래처 명
            type: [{value:''}, [Validators.required]],   // 유형
            status: [{value:'',disabled:true}, [Validators.required]],   // 상태
            supplier: [{value:''}],   // 공급사
            supplierNm: [{value:'',disabled:true}],   // 공급사 명
            ibCreDate: [{value:'',disabled:true}],//작성일
            ibDate: [{value:'',disabled:true}], //입고일
            remarkHeader: [''], //비고
            poNo: [{value:'',disabled:true}],   // 발주번호
            active: [false]  // cell상태
        });
        this._inboundService.getNew(0,10,'','asc', {});

        this.inBoundDetails$ = this._inboundService.inBoundDetails$;
        this._inboundService.inBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBoundDetail: any) => {
                // Update the counts
                if(inBoundDetail !== null){
                    this.inBoundDetailsCount = inBoundDetail.length;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._inboundService.inBoundDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBoundDetailPagenation: InBoundDetailPagenation) => {
                // Update the pagination
                this.inBoundDetailPagenation = inBoundDetailPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        if(this.inBoundHeaders !== undefined){
            this.inBoundHeaderForm.controls.type.disable();
            this.inBoundHeaderForm.controls.account.disable();
            this.inBoundHeaderForm.patchValue({'account': this.inBoundHeaders.account});
            this.inBoundHeaderForm.patchValue({'accountNm': this.inBoundHeaders.accountNm});
            this.inBoundHeaderForm.patchValue({'type': '2'});
            this.inBoundHeaderForm.patchValue({'status': 'N'});
            this.inBoundHeaderForm.patchValue({'supplier': ''});
            this.inBoundHeaderForm.patchValue({'poNo': ''});
            this.inBoundHeaderForm.patchValue({'remarkHeader': this.inBoundHeaders.remarkHeader});

        }else{

            this.inBoundHeaderForm.patchValue({'account': ''});
            this.inBoundHeaderForm.patchValue({'type': '1'});
            this.inBoundHeaderForm.patchValue({'status': 'N'});
            this.inBoundHeaderForm.patchValue({'supplier': ''});
            this.inBoundHeaderForm.patchValue({'remarkHeader': ''});
            this.inBoundHeaderForm.patchValue({'poNo': ''});
        }

        if(this.inBoundDetails !== undefined){
            this.inBoundDetails$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((inBoundDetail) => {
                    this.inBoundDetails.forEach((salesorderDetail: any) => {
                        inBoundDetail.push({
                            no: inBoundDetail.length + 1,
                            flag: 'C',
                            ibLineNo: 0,
                            itemCd: salesorderDetail.itemCd,
                            itemNm: salesorderDetail.itemNm,
                            itemGrade: salesorderDetail.itemGrade,
                            standard: salesorderDetail.standard,
                            unit: salesorderDetail.unit,
                            ibExpQty: salesorderDetail.qty,
                            qty: 0,
                            unitPrice: salesorderDetail.unitPrice,
                            totalAmt: salesorderDetail.soAmt,
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
                            remarkDetail: salesorderDetail.remarkDetail, ibQty: 0, poLineNo: 0, poNo: '', udiYn: ''
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

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    /* 트랜잭션 전 data Set
     * @param sendData
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: InBound[]) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i=0; i<sendData.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            sendData[i].account = this.inBoundHeaderForm.controls['account'].value;
            sendData[i].poNo = '';
            sendData[i].type = this.inBoundHeaderForm.controls['type'].value;
            sendData[i].status = this.inBoundHeaderForm.controls['status'].value;
            sendData[i].supplier = this.inBoundHeaderForm.controls['supplier'].value;
            sendData[i].remarkHeader = this.inBoundHeaderForm.controls['remarkHeader'].value;
        }
        return sendData;
    }

    /* 저장
     *
     */
    saveIn(): void{

        if(!this.inBoundHeaderForm.invalid){

            let detailCheck = false;
            this.inBoundDetails$.pipe(takeUntil(this._unsubscribeAll))
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
                this.inBoundDetails$,
                this.inBoundDetailsTable);

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
                    if(result){
                        createList = [];
                        this.inBoundDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((inBoundDetail) => {
                                inBoundDetail.forEach((sendData: any) => {
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
                    }
                });

            // Mark for check
            this._changeDetectorRef.markForCheck();

        }else{
            this._functionService.cfn_alert('필수값을 입력해주세요.');
        }
    }

    /* 추가
     *
     * @param sendData
     */
    createIn(sendData: InBound[]): void{
        if(sendData){
            sendData = this.headerDataSet(sendData);

            this._inboundService.createIn(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((inBound: any) => {
                    this.alertMessage(inBound);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        }
    }

    alertMessage(param: any): void
    {
        if(param.status !== 'SUCCESS'){
            this._functionService.cfn_alert(param.msg);
        }else{
            this.backPage();
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

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): SelectionModel<any> {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }

        this.inBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBoundDetail) =>{
                this.selection.select(...inBoundDetail);
            });
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): any {
        const numSelected = this.selection.selected.length;
        const numRows = this.inBoundDetailsCount;
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
        if (column.dataField === 'itemCd') {
            if (!this.isMobile) {
                const popup = this._matDialogPopup.open(CommonPopupComponent, {
                    data: {
                        popup: 'P$_ALL_ITEM',
                        headerText: '품목 조회',
                    },
                    autoFocus: false,
                    maxHeight: '90vh',
                    disableClose: true
                });

                popup.afterClosed()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result) => {
                        if (result) {
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
            } else {
                const popup = this._matDialogPopup.open(CommonPopupComponent, {
                    data: {
                        popup: 'P$_ALL_ITEM',
                        headerText: '품목 조회',
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
                        if (result) {
                            smallDialogSubscription.unsubscribe();
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
    openAccountSearch(): void
    {
        if(!this.isMobile) {
            const popup = this._matDialogPopup.open(CommonPopupComponent, {
                data: {
                    popup: 'P$_ACCOUNT',
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });

            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        this.inBoundHeaderForm.patchValue({'account': result.accountCd});
                        this.inBoundHeaderForm.patchValue({'accountNm': result.accountNm});
                    }
                });
        } else {
            const popup = this._matDialogPopup.open(CommonPopupComponent, {
                data: {
                    popup: 'P$_ACCOUNT',
                    headerText : '거래처 조회'
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
                    if (result) {
                        smallDialogSubscription.unsubscribe();
                        this.inBoundHeaderForm.patchValue({'account': result.accountCd});
                        this.inBoundHeaderForm.patchValue({'accountNm': result.accountNm});
                    }
                });
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    backPage() {
        this._router.navigate(['bound/inbound']);
    }


    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getComboData(column: TableConfig) {
        let combo;
        if(column.dataField === 'itemGrade'){
            combo = this.itemGrades;
        }
        return combo;
    }
    openItemSearch(): void
    {
        if(!this.isMobile){
            const popup =this._matDialogPopup.open(ItemSearchComponent, {
                data: {
                    popup : 'P$_ACCOUNT',
                    headerText : '거래처 조회'
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });

            popup.afterClosed().subscribe((result) => {
                if(result){
                    console.log(result);
                    this.selectedItemForm.patchValue({'itemCd': result.modelId});
                    this.selectedItemForm.patchValue({'itemNm': result.itemName});
                    this.selectedItemForm.patchValue({'itemGrade': result.grade});
                    this.selectedItemForm.patchValue({'entpName': result.entpName});
                    this.selectedItemForm.patchValue({'fomlInfo': result.typeName});
                    this.selectedItemForm.patchValue({'itemNoFullname': result.itemNoFullname});
                    this.selectedItemForm.patchValue({'medDevSeq': result.medDevSeq});
                    this.selectedItemForm.patchValue({'udiDiCode': result.udidiCode});
                    this.selectedItemForm.patchValue({'supplier': result.entpName});
                    this.selectedItemForm.patchValue({'udiYn': 'Y'});
                    this.is_edit = true;
                }
            });
        }else{
            const d = this._matDialogPopup.open(ItemSearchComponent, {
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    d.updateSize('calc(100vw - 10px)','');
                } else {
                    // d.updateSize('calc(100% - 50px)', '');
                }
            });
            d.afterClosed().subscribe((result) => {
                if(result){
                    this.selectedItemForm.patchValue({'itemCd': result.modelId});
                    this.selectedItemForm.patchValue({'itemNm': result.itemName});
                    this.selectedItemForm.patchValue({'itemGrade': result.grade});
                    this.selectedItemForm.patchValue({'entpName': result.entpName});
                    this.selectedItemForm.patchValue({'fomlInfo': result.typeName});
                    this.selectedItemForm.patchValue({'itemNoFullname': result.itemNoFullname});
                    this.selectedItemForm.patchValue({'medDevSeq': result.medDevSeq});
                    this.selectedItemForm.patchValue({'udiDiCode': result.udidiCode});
                    this.selectedItemForm.patchValue({'supplier': result.entpName});
                    this.selectedItemForm.patchValue({'udiYn': 'Y'});
                    this.is_edit = true;
                }
                smallDialogSubscription.unsubscribe();
            });
        }
    }
}
