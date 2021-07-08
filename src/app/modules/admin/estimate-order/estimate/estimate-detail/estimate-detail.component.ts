import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit, ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {fuseAnimations} from '../../../../../../@teamplat/animations';
import {
    Estimate,
    EstimateDetail,
    EstimateDetailPagenation,
} from '../estimate.types';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder,FormGroup, Validators} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {BehaviorSubject, merge, Observable, Subject} from 'rxjs';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {EstimateService} from '../estimate.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatDialog} from '@angular/material/dialog';
import {SaveAlertComponent} from '../../../../../../@teamplat/components/common-alert/save-alert';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTable} from '@angular/material/table';
import {DeleteAlertComponent} from '../../../../../../@teamplat/components/common-alert/delete-alert';
import {TableConfig, TableStyle} from '../../../../../../@teamplat/components/common-table/common-table.types';
import {data} from "autoprefixer";
import {ItemSearchComponent} from "../../../../../../@teamplat/components/item-search";
import {CommonPopupComponent} from "../../../../../../@teamplat/components/common-popup";

@Component({
    selector       : 'estimate-detail',
    templateUrl    : './estimate-detail.component.html',
    styleUrls: ['./estimate-detail.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class EstimateDetailComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatPaginator) private _estimateDetailPagenator: MatPaginator;
    @ViewChild(MatSort) private _estimateDetailSort: MatSort;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild(MatTable,{static:true}) _table: MatTable<any>;
    isLoading: boolean = false;
    estimateHeaderForm: FormGroup;
    flashMessage: 'success' | 'error' | null = null;
    estimateDetailsCount: number = 0;

    type: CommonCode[] = null;
    status: CommonCode[] = null;
    filterList: string[];

    estimateDetailPagenation: EstimateDetailPagenation | null = null;
    estimateDetails$ = new Observable<EstimateDetail[]>();
    estimateDetail: EstimateDetail = null;
    selection = new SelectionModel<any>(true, []);

    estimateDetailsTableStyle: TableStyle = new TableStyle();
    estimateDetailsTable: TableConfig[] = [
        {headerText : '라인번호' , dataField : 'qtLineNo', display : false},
        {headerText : '품목코드' , dataField : 'itemCd', width: 80, display : true, type: 'text'},
        {headerText : '품목명' , dataField : 'itemNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '규격' , dataField : 'standard', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '단위' , dataField : 'unit', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '수량' , dataField : 'qty', width: 50, display : true, type: 'number', style: this.estimateDetailsTableStyle.textAlign.right},
        {headerText : '단가' , dataField : 'qtPrice', width: 50, display : true, type: 'number', style: this.estimateDetailsTableStyle.textAlign.right},
        {headerText : '견적금액' , dataField : 'qtAmt', width: 50, display : true, disabled : true, type: 'number', style: this.estimateDetailsTableStyle.textAlign.right},
        {headerText : '비고' , dataField : 'remarkDetail', width: 100, display : true, type: 'text'},
    ];
    estimateDetailsTableColumns: string[] = [
        'select',
        'no',
        'qtLineNo',
        'itemCd',
        'itemNm',
        'standard',
        'unit',
        'qty',
        'qtPrice',
        'qtAmt',
        'remarkDetail',
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _matDialog: MatDialog,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _formBuilder: FormBuilder,
        public _matDialogPopup: MatDialog,
        private _codeStore: CodeStore,
        private _changeDetectorRef: ChangeDetectorRef,
        private _estimateService: EstimateService,
        private _utilService: FuseUtilsService)
    {
        this.filterList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data,'QT_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data,'QT_STATUS', this.filterList);
    }
    /**
     * On init
     */
    ngOnInit(): void
    {
        // Form 생성
        this.estimateHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            qtNo: [{value:'',disabled:true}],   // 견적번호
            account: [{value:'',disabled:true},[Validators.required]], // 거래처 코드
            accountNm: [{value:'',disabled:true}],   // 거래처 명
            type: [{value:'',disabled:true}, [Validators.required]],   // 유형
            status: [{value:'',disabled:true}, [Validators.required]],   // 상태
            qtAmt: [{value:'',disabled:true}],   // 견적금액
            soNo: [{value:'',disabled:true}],   // 주문번호
            qtCreDate: [{value:'',disabled:true}],//견적 생성일자
            qtDate: [{value:'',disabled:true}], //견적일자
            remarkHeader: [''], //비고
            active: [false]  // cell상태
        });

        if(this._activatedRoute.snapshot.paramMap['params'].length !== (null || undefined)){

            this.estimateHeaderForm.patchValue(
                this._activatedRoute.snapshot.paramMap['params']
            );

            this._estimateService.getDetail(0,10,'qtLineNo','asc',this.estimateHeaderForm.getRawValue());
        }
        this.estimateDetails$ = this._estimateService.estimateDetails$;
        this._estimateService.estimateDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estimateDetail: any) => {
                // Update the counts
                if(estimateDetail !== null){
                    this.estimateDetailsCount = estimateDetail.length;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._estimateService.estimateDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estimateDetailPagenation: EstimateDetailPagenation) => {
                // Update the pagination
                this.estimateDetailPagenation = estimateDetailPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

    }
    /**
     * After view init
     */
    ngAfterViewInit(): void {

        if(this._estimateDetailSort !== undefined){
            // Get products if sort or page changes
            merge(this._estimateDetailSort.sortChange, this._estimateDetailPagenator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._estimateService.getDetail(this._estimateDetailPagenator.pageIndex, this._estimateDetailPagenator.pageSize, this._estimateDetailSort.active, this._estimateDetailSort.direction, this.estimateHeaderForm.getRawValue());
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).pipe(takeUntil(this._unsubscribeAll)).subscribe();
        }
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }


    backPage(): void{
        this._router.navigate(['estimate-order/estimate']);
    }
    createEstimate(): void{
        const sendData: Estimate[] = [];
        this.estimateDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
                next(estimateDetail) {
                    if(estimateDetail !== null){
                        // eslint-disable-next-line @typescript-eslint/prefer-for-of
                        for (let i=0; i<estimateDetail.length; i++) {
                            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                            sendData.push(<Estimate>estimateDetail[i]);
                        }
                    }
                },
        });

        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i=0; i<sendData.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            sendData[i]['account'] = this.estimateHeaderForm.getRawValue().account;
            sendData[i]['qtNo'] = this.estimateHeaderForm.getRawValue().qtNo;
            sendData[i]['type'] = this.estimateHeaderForm.getRawValue().type;
            sendData[i]['status'] = this.estimateHeaderForm.getRawValue().status;
            sendData[i]['remarkHeader'] = this.estimateHeaderForm.getRawValue().remarkHeader;
        }
        console.log(sendData);
        /*if(!this.estimateHeaderForm.invalid){
            this._estimateService.createEstimate(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((estimate: any) => {
                    this.backPage();
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
            });
        }*/
    }

    updateEstimate(): void{
        const updateConfirm =this._matDialog.open(SaveAlertComponent, {
            data: {
            }
        });

        updateConfirm.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if(result.status){
                    const sendData: Estimate[] = [];
                    this.estimateDetails$
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe({
                            // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
                            next(estimateDetail) {
                                if(estimateDetail !== null){
                                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                                    for (let i=0; i<estimateDetail.length; i++) {
                                        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                                        sendData.push(<Estimate>estimateDetail[i]);
                                    }
                                }
                            },
                    });

                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                    for (let i=0; i<sendData.length; i++) {
                        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                        sendData[i]['account'] = this.estimateHeaderForm.getRawValue().account;
                        sendData[i]['qtNo'] = this.estimateHeaderForm.getRawValue().qtNo;
                        sendData[i]['type'] = this.estimateHeaderForm.getRawValue().type;
                        sendData[i]['status'] = this.estimateHeaderForm.getRawValue().status;
                        sendData[i]['remarkHeader'] = this.estimateHeaderForm.getRawValue().remarkHeader;
                    }
                    if(!this.estimateHeaderForm.invalid){
                        this._estimateService.updateEstimate(sendData)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((estimate: any) => {
                                this.backPage();
                                // Mark for check
                                this._changeDetectorRef.markForCheck();
                        });
                    }
                }
        });
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param account
     */
    trackByFn(index: number, estimateDetail: any): any {
        return estimateDetail.id || index;
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    tableClear(){
        this._table.renderRows();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    transactionRow(action,row) {
        if(action === 'Row_Add'){

            this.addRowData(row);

        }else if(action === 'Row_Delete'){

            this.deleteRowData(row);

        }else if(action === 'Delete'){

            this.realDeleteData();
        }
        this.tableClear();
    }
    private _estimateDetails: BehaviorSubject<EstimateDetail[]> = new BehaviorSubject(null);

    // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/explicit-function-return-type
    addRowData(row: any){

        /*this.estimateDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estimateDetail) => {
                if(!estimateDetail){

                    estimateDetail.push({
                        no: estimateDetail.length + 1,
                        itemCd: '',
                        itemNm: '',
                        qtLineNo: 0,
                        qtPrice: 0,
                        qty: 0,
                        remarkDetail: '',
                        standard: '',
                        unit: '',
                        qtAmt:0
                    });
                }else{
                    // @ts-ignore
                    estimateDetail.push({
                        no: estimateDetail.length + 1,
                        itemCd: '',
                        itemNm: '',
                        qtLineNo: 0,
                        qtPrice: 0,
                        qty: 0,
                        remarkDetail: '',
                        standard: '',
                        unit: '',
                        qtAmt:0});
                }
        });*/
        this.estimateDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
                next(estimateDetail) {
                    if(estimateDetail){
                        // @ts-ignore
                        estimateDetail.push({
                            no: estimateDetail.length + 1,
                            itemCd: '',
                            itemNm: '',
                            qtLineNo: 0,
                            qtPrice: 0,
                            qty: 0,
                            remarkDetail: '',
                            standard: '',
                            unit: '',
                            qtAmt:0});
                    }else{
                    }
                    console.log(estimateDetail);
                }
            });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    deleteRowData(row: any) {

        if(this.selection.hasValue()){
            if(row.selected.length > 0){
                let check = false;
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for(let i=0; i<row.selected.length; i++){
                    if(row.selected[i].length){
                        check = true;
                    }
                }

                if(check){
                    this.realDeleteData();
                    return;
                }else{
                    this.estimateDetails$
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((estimateDetail) => {
                            // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
                            for(let i=0; i<estimateDetail.length; i++){
                                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                                for(let r=0; r<row.selected.length; r++){
                                    if(row.selected[r].no === estimateDetail[i].no){
                                        estimateDetail.splice(i,1);
                                    }
                                }
                            }
                        });
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

        this.estimateDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estimateDetail) =>{
                this.selection.select(...estimateDetail);
        });
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): any {
        const numSelected = this.selection.selected.length;
        const numRows = this.estimateDetailsCount;
        return numSelected === numRows;
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: any): string {
        if (!row) {
            return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.no + 1}`;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    realDeleteData() {
        if(this.selection.selected.length === 0){
            return;
        }

        const deleteConfirm =this._matDialog.open(DeleteAlertComponent, {
            data: {
            }
        });

        deleteConfirm.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if(result.status){
                    const sendData: Estimate[] = [];
                    if(this.selection.selected.length !== 0){

                        this.selection.selected.forEach((param: any) => {
                            if(param.length){
                                sendData.push(param);
                            }
                        });

                        // eslint-disable-next-line @typescript-eslint/prefer-for-of
                        for (let i=0; i<sendData.length; i++) {
                            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                            sendData[i]['account'] = this.estimateHeaderForm.getRawValue().account;
                            sendData[i]['qtNo'] = this.estimateHeaderForm.getRawValue().qtNo;
                            sendData[i]['type'] = this.estimateHeaderForm.getRawValue().type;
                            sendData[i]['status'] = this.estimateHeaderForm.getRawValue().status;
                            sendData[i]['remarkHeader'] = this.estimateHeaderForm.getRawValue().remarkHeader;
                        }
                    }

                    this._estimateService.deleteEstimate(sendData)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe(
                            (param: any) => {
                                if(param.status === 'SUCCESS'){
                                    this.backPage();
                                    // Mark for check
                                    this._changeDetectorRef.markForCheck();
                                }
                            },(response) => {});
                }
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    cellClick(element, column: TableConfig, i) {
        if(column.dataField === 'itemCd'){

            const popup =this._matDialogPopup.open(CommonPopupComponent, {
                data: {
                    popup : 'P$_ALL_ITEM'
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
                    }
                });
        }
    }
}
