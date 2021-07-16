import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {MatTable} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {SelectionModel} from "@angular/cdk/collections";
import {merge, Observable, Subject} from "rxjs";
import {TableConfig, TableStyle} from "../../../../../../@teamplat/components/common-table/common-table.types";
import {OutBound, OutBoundDetail, OutBoundDetailPagenation} from "../outbound.types";
import {MatDialog} from "@angular/material/dialog";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {OutboundService} from "../outbound.service";
import {SaveAlertComponent} from "../../../../../../@teamplat/components/common-alert/save-alert";
import {CommonPopupComponent} from "../../../../../../@teamplat/components/common-popup";

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
    outBoundDetails$ = new Observable<OutBoundDetail[]>();
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
    outBoundDetailPagenation: OutBoundDetailPagenation | null = null;
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
                    this.outBoundDetails$
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((outBoundDetail) => {
                            outBoundDetail.forEach((sendData: any) => {
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
                    if (updateist.length > 0) {
                        this.updateOut(updateist,outBoundHeader);
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
            sendData[i].account = outBoundHeader['account'];
            sendData[i].address = outBoundHeader['address'];
            sendData[i].obNo = outBoundHeader['obNo'];
            sendData[i].type = outBoundHeader['type'];
            sendData[i].status = outBoundHeader['status'];
            sendData[i].dlvAccount = outBoundHeader['dlvAccount'];
            sendData[i].dlvAddress = outBoundHeader['dlvAddress'];
            sendData[i].dlvDate = outBoundHeader['dlvDate'];
            sendData[i].remarkHeader = outBoundHeader['remarkHeader'];

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
    updateRowData(element, column: TableConfig, i) {
        if(element.flag !== 'C' || !element.flag){
            element.flag = 'U';
        }
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    transactionRow(action, row) {
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
}
