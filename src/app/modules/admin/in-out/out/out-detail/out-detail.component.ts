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
import {OutService} from '../out.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTable} from '@angular/material/table';
import {FuseAlertType} from '../../../../../../@teamplat/components/alert';
import {CommonCode, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {merge, Observable, Subject} from 'rxjs';
import {SelectionModel} from '@angular/cdk/collections';
import {OutBound, OutDetail, OutDetailPagenation, OutHeader} from '../out.types';
import {TableConfig, TableStyle} from '../../../../../../@teamplat/components/common-table/common-table.types';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {CommonPopupComponent} from '../../../../../../@teamplat/components/common-popup';
import {SaveAlertComponent} from '../../../../../../@teamplat/components/common-alert/save-alert';

@Component({
    selector     : 'out-detail',
    templateUrl  : './out-detail.component.html',
    styleUrls    : ['./out-detail.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class OutDetailComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatPaginator) private _outDetailPagenator: MatPaginator;
    @ViewChild(MatSort) private _outDetailSort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild(MatTable,{static:true}) _table: MatTable<any>;
    isLoading: boolean = false;
    outBound = {};
    flashMessage: 'success' | 'error' | null = null;
    outDetailsCount: number = 0;
    outCheck: number = 0;
    outHeader = new Observable<OutHeader>();

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
    navigationSubscription: any;

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
        this.navigationSubscription = this._router.events.subscribe((e: any) => {
            // RELOAD로 설정했기때문에 동일한 라우트로 요청이 되더라도
            // 네비게이션 이벤트가 발생한다. 우리는 이 네비게이션 이벤트를 구독하면 된다.
            if (e instanceof NavigationEnd) {
                this.initialiseInvites();
            }
        });
        this.filterList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data,'OB_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data,'OB_STATUS', this.filterList);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    initialiseInvites() {
        // 이곳에 페이지가 리로드되면 바뀔 데이터들이나 로직을 정리한다.
        this._outService.setInitList();
        this._changeDetectorRef.markForCheck();
        this.outDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outDetails: any) => {
                console.log(outDetails);
                this._changeDetectorRef.markForCheck();
        });

        if(this._outService.outHeader$ !== undefined){
            this.outHeader = this._outService.outHeader$;
            this._outService.outHeader$
                .pipe(takeUntil(this._unsubscribeAll))
                // eslint-disable-next-line @typescript-eslint/no-shadow
                .subscribe((outHeader: any) => {
                    // Update the counts
                    if(outHeader !== null){
                        this.outBound = outHeader;
                        this.outCheck = 1;
                    }

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            //this._outService.getDetail(0,10,'obLineNo','asc', this.outBound);
        }

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

        if(this._outDetailSort !== undefined){
            // Get products if sort or page changes
            merge(this._outDetailSort.sortChange, this._outDetailPagenator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._outService.getDetail(this._outDetailPagenator.pageIndex, this._outDetailPagenator.pageSize, this._outDetailSort.active, this._outDetailSort.direction, this.outBound);
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
        this._outService.setShowMobile(false);
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


    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: OutBound[]) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i=0; i<sendData.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            sendData[i].account = this.outBound['account'];
            sendData[i].address = this.outBound['address'];
            sendData[i].obNo = this.outBound['obNo'];
            sendData[i].type = this.outBound['type'];
            sendData[i].status = this.outBound['status'];
            sendData[i].dlvAccount = this.outBound['dlvAccount'];
            sendData[i].dlvAddress = this.outBound['dlvAddress'];
            sendData[i].dlvDate = this.outBound['dlvDate'];
            sendData[i].remarkHeader = this.outBound['remarkHeader'];
        }
        return sendData;
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
                        this.tableClear();
                        this.isLoading = false;
                        this._changeDetectorRef.markForCheck();
                    }
                });
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    saveOut() {
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
                    this.outDetails$
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((outDetail) => {
                            outDetail.forEach((sendData: any) => {
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
                        this.createOut(createList);
                        //this.totalAmt();
                    }
                    if (updateist.length > 0) {
                        this.updateOut(updateist);
                    }
                    if (deleteList.length > 0) {
                        this.deleteOut(deleteList);
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
        this._router.navigate(['in-out/out']);
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
    /* 수정
     *
     * @param sendData
     */
    updateOut(sendData: OutBound[]): void{
        if(sendData){
            sendData = this.headerDataSet(sendData);

            this._outService.updateOut(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((outBound: any) => {
                });
        }
    }

    /* 삭제
     * @param sendData
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    deleteOut(sendData: OutBound[]) {
        if(sendData){
            sendData = this.headerDataSet(sendData);

            this._outService.deleteOut(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(
                    (outBound: any) => {
                    },(response) => {});
        }

    }
}
