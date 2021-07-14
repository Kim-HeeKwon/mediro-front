import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {OutService} from '../out.service';
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatTable} from "@angular/material/table";
import {FuseAlertType} from "../../../../../../@teamplat/components/alert";
import {CommonCode, FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {EstimateDetail, EstimateDetailPagenation} from "../../../estimate-order/estimate/estimate.types";
import {merge, Observable, Subject} from "rxjs";
import {SelectionModel} from "@angular/cdk/collections";
import {OutDetail, OutDetailPagenation} from "../out.types";
import {TableConfig, TableStyle} from "../../../../../../@teamplat/components/common-table/common-table.types";
import {MatDialog} from "@angular/material/dialog";
import {ActivatedRoute, Router} from "@angular/router";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {EstimateService} from "../../../estimate-order/estimate/estimate.service";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {CommonPopupComponent} from "../../../../../../@teamplat/components/common-popup";

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
        this.filterList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data,'OB_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data,'OB_STATUS', this.filterList);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Form 생성
        this.outHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            obNo: [{value:'',disabled:true}],   // 출고번호
            account: [{value:''},[Validators.required]], // 거래처 코드
            accountNm: [{value:'',disabled:true}],   // 거래처 명
            address: [{value:''}, [Validators.required]],   // 거래처 주소
            type: [{value:'',disabled:true}, [Validators.required]],   // 유형
            status: [{value:'',disabled:true}, [Validators.required]],   // 상태
            dlvAccount: [{value:''}],   // 배송처
            dlvAddress: [{value:''}, [Validators.required]],   // 배송처 주소
            dlvDate: [{value:''}, [Validators.required]],//작성일
            obCreDate: [{value:'',disabled:true}],//작성일
            obDate: [{value:'',disabled:true}], //출고일
            remarkHeader: [''], //비고
            active: [false]  // cell상태
        });
        //console.log(this._activatedRoute.snapshot.queryParams.row);

        if(this._activatedRoute.snapshot.queryParams.row !== (null || undefined)){
            const headerForm = JSON.parse(this._activatedRoute.snapshot.queryParams.row);
            if(headerForm !== (null || undefined)){
                this.outHeaderForm.patchValue(
                    headerForm
                );

            }
            this._outService.getDetail(0,10,'obLineNo','asc',this.outHeaderForm.getRawValue());
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

    /**
     * After view init
     */
    ngAfterViewInit(): void {

        console.log('ngAfterViewInit');

        if(this._outDetailSort !== undefined){
            // Get products if sort or page changes
            merge(this._outDetailSort.sortChange, this._outDetailPagenator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._outService.getDetail(this._outDetailPagenator.pageIndex, this._outDetailPagenator.pageSize, this._outDetailSort.active, this._outDetailSort.direction, this.outHeaderForm.getRawValue());
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).pipe(takeUntil(this._unsubscribeAll)).subscribe();
        }
    }

    ngOnDestroy(): void {
        console.log('ngOnDestroy');
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

            //this.addRowData(row);

        }else if(action === 'DELETE'){

            //this.deleteRowData(row);

        }
        this.tableClear();
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

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    saveOut() {

    }
}
