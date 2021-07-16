import {
    AfterViewInit,
    ChangeDetectorRef,
    Component, OnChanges,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTable} from '@angular/material/table';
import {FuseAlertType} from '../../../../../../@teamplat/components/alert';
import {CommonCode, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {merge, Observable, Subject} from 'rxjs';
import {SelectionModel} from '@angular/cdk/collections';
import {TableConfig, TableStyle} from '../../../../../../@teamplat/components/common-table/common-table.types';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {CommonPopupComponent} from '../../../../../../@teamplat/components/common-popup';
import {SaveAlertComponent} from '../../../../../../@teamplat/components/common-alert/save-alert';
import {InBound, InDetail, InDetailPagenation, InHeader} from '../in.types';
import {InService} from '../in.service';

@Component({
    selector     : 'in-detail',
    templateUrl  : './in-detail.component.html',
    styleUrls    : ['./in-detail.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class InDetailComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatPaginator) private _inDetailPagenator: MatPaginator;
    @ViewChild(MatSort) private _inDetailSort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild(MatTable,{static:true}) _table: MatTable<any>;
    isLoading: boolean = false;
    inBound = {};
    flashMessage: 'success' | 'error' | null = null;
    inDetailsCount: number = 0;
    inCheck: number = 0;
    inHeader = new Observable<InHeader>();

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
    navigationSubscription: any;

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
        this.navigationSubscription = this._router.events.subscribe((e: any) => {
            // RELOAD로 설정했기때문에 동일한 라우트로 요청이 되더라도
            // 네비게이션 이벤트가 발생한다. 우리는 이 네비게이션 이벤트를 구독하면 된다.
            if (e instanceof NavigationEnd) {
                this.initialiseInvites();
            }
        });
        this.filterList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data,'IB_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data,'IB_STATUS', this.filterList);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    initialiseInvites() {
        // 이곳에 페이지가 리로드되면 바뀔 데이터들이나 로직을 정리한다.
        this._inService.setInitList();
        this._changeDetectorRef.markForCheck();
        this.inDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inDetails: any) => {
                console.log(inDetails);
                this._changeDetectorRef.markForCheck();
            });

        if(this._inService.inHeader$ !== undefined){
            this.inHeader = this._inService.inHeader$;
            this._inService.inHeader$
                .pipe(takeUntil(this._unsubscribeAll))
                // eslint-disable-next-line @typescript-eslint/no-shadow
                .subscribe((inHeader: any) => {
                    // Update the counts
                    if(inHeader !== null){
                        this.inBound = inHeader;
                        this.inCheck = 1;
                    }

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            //this._inService.getDetail(0,10,'ibLineNo','asc', this.inBound);
        }

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
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {

        if(this._inDetailSort !== undefined){
            // Get products if sort or page changes
            merge(this._inDetailSort.sortChange, this._inDetailPagenator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._inService.getDetail(this._inDetailPagenator.pageIndex, this._inDetailPagenator.pageSize, this._inDetailSort.active, this._inDetailSort.direction, this.inBound);
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).pipe(takeUntil(this._unsubscribeAll)).subscribe();
        }
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

    isBack(): void{
        this._inService.setShowMobile(false);
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


    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: InBound[]) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i=0; i<sendData.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            sendData[i].account = this.inBound['account'];
            sendData[i].ibNo = this.inBound['ibNo'];
            sendData[i].type = this.inBound['type'];
            sendData[i].status = this.inBound['status'];
            sendData[i].supplier = this.inBound['supplier'];
            sendData[i].remarkHeader = this.inBound['remarkHeader'];
        }
        return sendData;
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

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    saveIn() {
        this.showAlert = false;

        const saveConfirm =this._matDialog.open(SaveAlertComponent, {
            data: {
            }
        });

        saveConfirm.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                let createList;
                let updateist;
                let deleteList;
                if (result.status) {
                    createList = [];
                    updateist = [];
                    deleteList = [];
                    this.inDetails$
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((inDetail) => {
                            inDetail.forEach((sendData: any) => {
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
                        this.createIn(createList);
                        //this.totalAmt();
                    }
                    if (updateist.length > 0) {
                        this.updateIn(updateist);
                    }
                    if (deleteList.length > 0) {
                        this.deleteIn(deleteList);
                    }
                    this.backPage();
                }
            });

        this.alertMessage('');

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    backPage() {
        this._router.navigate(['in-out/in']);
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
    /* 수정
     *
     * @param sendData
     */
    updateIn(sendData: InBound[]): void{
        if(sendData){
            sendData = this.headerDataSet(sendData);

            this._inService.updateIn(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((inBound: any) => {
                });
        }
    }

    /* 삭제
     * @param sendData
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    deleteIn(sendData: InBound[]) {
        if(sendData){
            sendData = this.headerDataSet(sendData);

            this._inService.deleteIn(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(
                    (inBound: any) => {
                    },(response) => {});
        }

    }
}
