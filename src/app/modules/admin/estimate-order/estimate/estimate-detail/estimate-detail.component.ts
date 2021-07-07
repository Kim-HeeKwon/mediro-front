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
    EstimateHeader,
    EstimateHeaderPagenation,
    TableColumn
} from '../estimate.types';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
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
import {MatTable, MatTableDataSource} from '@angular/material/table';
import {DeleteAlertComponent} from '../../../../../../@teamplat/components/common-alert/delete-alert';

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
    estimateHeader: EstimateHeader;
    estimateHeaderForm: FormGroup;
    estimateDetailForm: FormGroup;
    flashMessage: 'success' | 'error' | null = null;
    estimateDetailsCount: number = 0;

    type: CommonCode[] = null;
    status: CommonCode[] = null;
    filterList: string[];
    showButton: boolean = true;

    estimateDetailPagenation: EstimateDetailPagenation | null = null;
    estimateDetails$ = new Observable<EstimateDetail[]>();
    estimateDetail: EstimateDetail = null;
    selection = new SelectionModel<any>(true, []);

    gridColumnRight: string = 'text-align: right;';
    gridColumnCenter: string = 'text-align: center;';
    gridColumnleft: string = 'text-align: left;';
    detailColumn: TableColumn[] = [
        {headerText : '라인번호' , dataField : 'qtLineNo', display : false},
        {headerText : '품목코드' , dataField : 'itemCd', display : true, type: 'text'},
        {headerText : '품목명' , dataField : 'itemNm', display : true, type: 'text'},
        {headerText : '규격' , dataField : 'standard', display : true, type: 'text'},
        {headerText : '단위' , dataField : 'unit', display : true, type: 'date'},
        {headerText : '수량' , dataField : 'qty', display : true, type: 'number', style: this.gridColumnRight},
        {headerText : '단가' , dataField : 'qtPrice', display : true, type: 'number', style: this.gridColumnRight},
        {headerText : '견적금액' , dataField : 'qtAmt', display : true, type: 'number', style: this.gridColumnRight},
        {headerText : '비고' , dataField : 'remarkDetail', display : true, type: 'text'},
    ];
    estimateDetailsTableColumns: string[] = [
        'select',
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
        // 고객사 Form 생성
        this.estimateHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            qtNo: [{value:'',disabled:true}],   // 견적번호
            account: ['', [Validators.required]], // 거래처 코드
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
                this.nullChk(this._activatedRoute.snapshot.paramMap['params'])
            );

            this._estimateService.getDetail(0,10,'qtLineNo','asc',this.estimateHeaderForm.getRawValue());

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
        }

        this._estimateService.estimateDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estimateDetailPagenation: EstimateDetailPagenation) => {
                // Update the pagination
                this.estimateDetailPagenation = estimateDetailPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        //this.estimateHeaderForm.controls['qtNo'].disable();

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
            ).subscribe();
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
        this.estimateDetails$.subscribe({
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
            this._estimateService.createEstimate(sendData).subscribe((estimate: any) => {
                this.backPage();
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        }
    }

    updateEstimate(): void{

        this._table.renderRows();
        const updateConfirm =this._matDialog.open(SaveAlertComponent, {
            data: {
            }
        });

        updateConfirm.afterClosed().subscribe((result) => {

            if(result.status){
                const sendData: Estimate[] = [];
                this.estimateDetails$.subscribe({
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
                /*if(!this.estimateHeaderForm.invalid){
                    this._estimateService.updateEstimate(sendData).subscribe((estimate: any) => {
                        this.backPage();
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });
                }*/
            }
        });

    }
    nullChk(value: any): any{

        /*const data = {};
        // 검색조건 Null Check
        if ((Object.keys(value).length === 0) === false) {
            // eslint-disable-next-line guard-for-in
            for (const k in value) {
                data[k] = value[k];
            }
        }*/
        return value;
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
    transactionRow(action,row) {
        if(action === 'Add'){

            this.addRowData();

        }else if(action === 'Delete'){

            if(this.selection.selected.length === 0){
                return;
            }

            const deleteConfirm =this._matDialog.open(DeleteAlertComponent, {
                data: {
                }
            });

            deleteConfirm.afterClosed().subscribe((result) => {
                if(result.status){
                    const sendData: Estimate[] = [];
                    if(this.selection.selected.length !== 0){

                        this.selection.selected.forEach((param: any) => {
                            sendData.push(param);
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
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/explicit-function-return-type
    addRowData(){
        this.estimateDetails$.subscribe({
            // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
            next(estimateDetail) {
                if(!estimateDetail){
                    estimateDetail = [];
                }else{
                    estimateDetail.push({
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
            },
        });
        this._table.renderRows();

    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): SelectionModel<any> {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }

        this.selection.select(this.estimateDetails$);
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
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
    }
}
