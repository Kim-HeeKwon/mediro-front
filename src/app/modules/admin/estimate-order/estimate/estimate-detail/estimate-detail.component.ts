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
import {SelectionModel} from '@angular/cdk/collections';
import {MatTable} from '@angular/material/table';
import {
    DataPipe,
    TableConfig,
    TableStyle
} from '../../../../../../@teamplat/components/common-table/common-table.types';
import {CommonPopupComponent} from '../../../../../../@teamplat/components/common-popup';
import {FuseAlertType} from '../../../../../../@teamplat/components/alert';
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import {FunctionService} from '../../../../../../@teamplat/services/function';
import {ReportHeaderData} from "../../../../../../@teamplat/components/common-report/common-report.types";
import {CommonReportComponent} from "../../../../../../@teamplat/components/common-report";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {DeviceDetectorService} from "ngx-device-detector";

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
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    isMobile: boolean = false;
    reportHeaderData: ReportHeaderData = new ReportHeaderData();

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

    estimateDetailPagenation: EstimateDetailPagenation | null = null;
    estimateDetails$ = new Observable<EstimateDetail[]>();
    estimateDetail: EstimateDetail = null;
    selection = new SelectionModel<any>(true, []);

    estimateDetailsTableStyle: TableStyle = new TableStyle();
    estimateDetailsTable: TableConfig[] = [
        {headerText : '????????????' , dataField : 'qtLineNo', display : false},
        {headerText : '????????????' , dataField : 'itemCd', width: 80, display : true, type: 'text',validators: true},
        {headerText : '?????????' , dataField : 'itemNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '??????' , dataField : 'standard', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '??????' , dataField : 'unit', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '??????' , dataField : 'qty', width: 50, display : true, type: 'number', style: this.estimateDetailsTableStyle.textAlign.right, validators: true},
        {headerText : '??????' , dataField : 'qtPrice', width: 50, display : true, type: 'number', style: this.estimateDetailsTableStyle.textAlign.right, validators: true},
        {headerText : '????????????' , dataField : 'qtAmt', width: 50, display : true, disabled : true, type: 'number', style: this.estimateDetailsTableStyle.textAlign.right},
        {headerText : '??????' , dataField : 'remarkDetail', width: 100, display : true, type: 'text'},
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
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _functionService: FunctionService,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.filterList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data,'QT_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data,'QT_STATUS', this.filterList);
        this.isMobile = this._deviceService.isMobile();
    }
    /**
     * On init
     */
    ngOnInit(): void
    {
        // Form ??????
        this.estimateHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // ?????????
            qtNo: [{value:'',disabled:true}],   // ????????????
            account: [{value:'',disabled:true},[Validators.required]], // ????????? ??????
            accountNm: [{value:'',disabled:true}],   // ????????? ???
            type: [{value:'',disabled:true}, [Validators.required]],   // ??????
            status: [{value:'',disabled:true}, [Validators.required]],   // ??????
            qtAmt: [{value:'',disabled:true}],   // ????????????
            soNo: [{value:'',disabled:true}],   // ????????????
            qtCreDate: [{value:'',disabled:true}],//?????? ????????????
            qtDate: [{value:'',disabled:true}], //????????????
            email:[''],//?????????
            remarkHeader: [''], //??????
            toAccountNm: [''],
            deliveryDate: [''],
            custBusinessNumber: [''],// ????????? ????????????
            custBusinessName: [''],//??????
            representName: [''],//??????
            address: [''],//??????
            businessCondition: [''],// ??????
            businessCategory: [''],// ??????
            phoneNumber: [''],// ????????????
            fax: [''],// ????????????
            active: [false]  // cell??????
        });

        if(this._activatedRoute.snapshot.paramMap['params'].length !== (null || undefined)){

            console.log(this._activatedRoute.snapshot.paramMap['params']);
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

    alertMessage(param: any): void
    {
        if(param.status !== 'SUCCESS'){
            this._functionService.cfn_alert(param.msg);
        }else{
            this.backPage();
        }
    }

    /* ??????
     *
     */
    saveEstimate(): void{
        const status = this.estimateHeaderForm.controls['status'].value;

        //????????? ?????????
        if(status === 'CF'){
            this._functionService.cfn_alert('?????? ??? ??? ????????????.');
            return;
        }

        if(!this.estimateHeaderForm.invalid){
            this.showAlert = false;

            let detailCheck = false;
            this.estimateDetails$.pipe(takeUntil(this._unsubscribeAll))
                .subscribe((data) => {

                    if(data.length === 0){
                        this._functionService.cfn_alert('??????????????? ?????? ????????????.');
                        detailCheck = true;
                    }
                });

            if(detailCheck){
                return;
            }

            const validCheck = this._functionService.cfn_validator('????????????',
                this.estimateDetails$,
                this.estimateDetailsTable);

            if(validCheck){
                return;
            }

            const confirmation = this._teamPlatConfirmationService.open({
                title : '',
                message: '?????????????????????????',
                actions: {
                    confirm: {
                        label: '??????'
                    },
                    cancel: {
                        label: '??????'
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
                        this.estimateDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((estimateDetail) => {
                                estimateDetail.forEach((sendData: any) => {
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
                        if (createList.length > 0) {
                            this.createEstimate(createList);
                        }
                        if(!this.estimateHeaderForm.untouched){
                            if (updateList.length > 0) {
                                this.updateEstimate(updateList);
                            }else{
                                this.updateEstimate([],this.estimateHeaderForm);
                            }
                        }else{
                            if (updateList.length > 0) {
                                this.updateEstimate(updateList);
                            }
                        }
                        if (deleteList.length > 0) {
                            this.deleteEstimate(deleteList);
                        }
                        this.backPage();
                    }
                });

            // Mark for check
            this._changeDetectorRef.markForCheck();

        }else{
            this._functionService.cfn_alert('???????????? ??????????????????.');
        }

    }

    /*?????? ?????? ????????????
     *
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    totalAmt() {
        this._estimateService.totalAmt(this.estimateHeaderForm.getRawValue())
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estimate: any) => {
            });
    }

    /* ??????
     *
     * @param sendData
     */
    createEstimate(sendData: Estimate[]): void{
        if(sendData){
            sendData = this.headerDataSet(sendData);

            this._estimateService.createEstimate(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((estimate: any) => {
                });
        }

    }

    /* ??????
     *
     * @param sendData
     */
    updateEstimate(sendData: Estimate[], headerForm?: FormGroup): void{

        if(headerForm !== undefined){

            sendData.push(headerForm.getRawValue());

            this._estimateService.updateEstimate(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((estimate: any) => {
                });

        }else{
            if(sendData){
                sendData = this.headerDataSet(sendData);

                this._estimateService.updateEstimate(sendData)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((estimate: any) => {
                    });
            }
        }


    }

    /* ??????
     * @param sendData
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    deleteEstimate(sendData: Estimate[]) {
        if(sendData){
            sendData = this.headerDataSet(sendData);

            this._estimateService.deleteEstimate(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(
                    (estimate: any) => {
                    },(response) => {});
        }

    }

    /* ???????????? ??? data Set
     * @param sendData
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: Estimate[]) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i=0; i<sendData.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            sendData[i].account = this.estimateHeaderForm.controls['account'].value;
            sendData[i].qtNo = this.estimateHeaderForm.controls['qtNo'].value;
            sendData[i].type = this.estimateHeaderForm.controls['type'].value;
            sendData[i].status = this.estimateHeaderForm.controls['status'].value;
            sendData[i].email = this.estimateHeaderForm.controls['email'].value;
            sendData[i].remarkHeader = this.estimateHeaderForm.controls['remarkHeader'].value;
        }
        return sendData;
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
    tableStatusChange(){
        console.log('change');
    }

    /* ????????? ?????????
     * @param action
     * @param row
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    transactionRow(action,row) {

        const status = this.estimateHeaderForm.controls['status'].value;

        //????????? ?????????
        if(status === 'CF'){
            this._functionService.cfn_alert('????????? ????????? ??????????????????.');
            return false;
        }
        if(action === 'ADD'){

            this.addRowData(row);

        }else if(action === 'DELETE'){

            this.deleteRowData(row);

        }
        this.tableClear();
    }

    /* ????????? ??????
     * @param row
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/explicit-function-return-type
    addRowData(row: any){

        this.estimateDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estimateDetail) => {
                // @ts-ignore
                estimateDetail.push({
                    no: estimateDetail.length + 1,
                    flag: 'C',
                    itemCd: '',
                    itemNm: '',
                    qtLineNo: 0,
                    qtPrice: 0,
                    qty: 0,
                    remarkDetail: '',
                    standard: '',
                    unit: '',
                    qtAmt:0});
        });
    }

    /* ????????? ????????????
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

    /* ????????? ??????
     * @param row
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    deleteRowData(row: any) {

        if(this.selection.hasValue()){
            if(row.selected.length > 0){
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for(let i=0; i<row.selected.length; i++){
                    if(row.selected[i].length){
                        this.estimateDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((estimateDetail) => {
                                // eslint-disable-next-line prefer-arrow/prefer-arrow-functions,@typescript-eslint/prefer-for-of
                                for(let e=0; e<estimateDetail.length; e++){
                                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                                    if(row.selected[i].no === estimateDetail[e].no){
                                        if(estimateDetail[e].flag === 'D'){
                                            estimateDetail[e].flag = '';
                                        }else{
                                            estimateDetail[e].flag = 'D';
                                        }
                                    }
                                }
                            });
                    }else{
                        this.estimateDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((estimateDetail) => {
                                // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
                                for(let e=0; e<estimateDetail.length; e++){
                                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                                    if(row.selected[i].no === estimateDetail[e].no){
                                        estimateDetail.splice(e,1);
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

    /* ????????? ??? ??????(??????)
     * @param element
     * @param column
     * @param i
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    cellClick(element, column: TableConfig, i) {

        const disableList = [
            'itemCd',
            'itemNm',
            'standard',
            'unit',
            'qty',
            'qtPrice',
            'qtAmt',
            'remarkDetail',
        ];
        const enableList = [
            'qty',
            'qtPrice',
        ];
        const status = this.estimateHeaderForm.controls['status'].value;
        this._functionService.cfn_cellDisable(column,disableList);

        //????????? ?????????
        if(status !== 'CF'){
            this._functionService.cfn_cellEnable(column,enableList);
        }

        if(element.flag !== undefined && element.flag === 'C'){
            if(column.dataField === 'itemCd'){

                if(!this.isMobile){
                    const popup =this._matDialogPopup.open(CommonPopupComponent, {
                        data: {
                            popup : 'P$_ALL_ITEM',
                            headerText : '?????? ??????',
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
                }else{
                    const popup =this._matDialogPopup.open(CommonPopupComponent, {
                        data: {
                            popup : 'P$_ALL_ITEM',
                            headerText : '?????? ??????',
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
                            if(result){
                                smallDialogSubscription.unsubscribe();
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
        }
    }

    reportEstimate(): void{
        const estimateDetailData = [];
        let index = 0;
        this.estimateDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estimateDetail) => {
                if(estimateDetail != null){
                    estimateDetail.forEach((data: any) => {
                        index++;
                        estimateDetailData.push({
                            no : index,
                            itemNm : data.itemNm,
                            standard : data.standard,
                            unit : data.unit,
                            qty : data.qty,
                            unitPrice : data.qtPrice,
                            totalAmt : data.qtAmt,
                            taxAmt : 0,
                            remark : data.remarkDetail,
                        });
                    });
                }
            });
        this.reportHeaderData.no = this.estimateHeaderForm.getRawValue().qtNo;
        this.reportHeaderData.date = this.estimateHeaderForm.getRawValue().qtCreDate;
        this.reportHeaderData.remark = this.estimateHeaderForm.getRawValue().remarkHeader;
        this.reportHeaderData.custBusinessNumber = this.estimateHeaderForm.getRawValue().custBusinessNumber;// ????????? ????????????
        this.reportHeaderData.custBusinessName = this.estimateHeaderForm.getRawValue().custBusinessName;//??????
        this.reportHeaderData.representName = this.estimateHeaderForm.getRawValue().representName;//??????
        this.reportHeaderData.address = this.estimateHeaderForm.getRawValue().address;//??????
        this.reportHeaderData.businessCondition = this.estimateHeaderForm.getRawValue().businessCondition;// ??????
        this.reportHeaderData.businessCategory = this.estimateHeaderForm.getRawValue().businessCategory;// ??????
        this.reportHeaderData.phoneNumber = '0' + this.estimateHeaderForm.getRawValue().phoneNumber;// ????????????
        this.reportHeaderData.fax = '0' + this.estimateHeaderForm.getRawValue().fax;// ????????????
        this.reportHeaderData.toAccountNm = this.estimateHeaderForm.getRawValue().toAccountNm;
        this.reportHeaderData.deliveryDate = this.estimateHeaderForm.getRawValue().deliveryDate;
        this.reportHeaderData.deliveryAddress = '';

        const popup =this._matDialogPopup.open(CommonReportComponent, {
            data: {
                divisionText : '??????',
                division : 'ESTIMATE',
                header : this.reportHeaderData,
                body : estimateDetailData,
                tail : ''
            },
            autoFocus: false,
            maxHeight: '100vh',
            disableClose: true
        });
    }
}
