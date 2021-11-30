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
import {TableConfig, TableStyle} from '../../../../../../@teamplat/components/common-table/common-table.types';
import {CommonPopupComponent} from '../../../../../../@teamplat/components/common-popup';
import {FuseAlertType} from '../../../../../../@teamplat/components/alert';
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import {FunctionService} from '../../../../../../@teamplat/services/function';
import {DeviceDetectorService} from 'ngx-device-detector';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';

@Component({
    selector       : 'estimate-new',
    templateUrl    : './estimate-new.component.html',
    styleUrls: ['./estimate-new.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class EstimateNewComponent implements OnInit, OnDestroy, AfterViewInit
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
    isProgressSpinner: boolean = false;
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
        {headerText : '라인번호' , dataField : 'qtLineNo', display : false},
        {headerText : '품목코드' , dataField : 'itemCd', width: 80, display : true, type: 'text',validators: true},
        {headerText : '품목명' , dataField : 'itemNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '규격' , dataField : 'standard', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '단위' , dataField : 'unit', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '수량' , dataField : 'qty', width: 50, display : true, type: 'number', style: this.estimateDetailsTableStyle.textAlign.right,validators: true},
        {headerText : '단가' , dataField : 'qtPrice', width: 50, display : true, type: 'number', style: this.estimateDetailsTableStyle.textAlign.right,validators: true},
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
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _functionService: FunctionService,
        private _codeStore: CodeStore,
        private _deviceService: DeviceDetectorService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _estimateService: EstimateService,
        private _utilService: FuseUtilsService,
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
        // Form 생성
        this.estimateHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            qtNo: [{value:'',disabled:true}],   // 견적번호
            account: [{value:''},[Validators.required]], // 거래처 코드
            accountNm: [{value:'',disabled:true}],   // 거래처 명
            type: [{value:'',disabled:true}, [Validators.required]],   // 유형
            status: [{value:'',disabled:true}, [Validators.required]],   // 상태
            qtAmt: [{value:'',disabled:true}],   // 견적금액
            soNo: [{value:'',disabled:true}],   // 주문번호
            qtCreDate: [{value:'',disabled:true}],//견적 생성일자
            qtDate: [{value:'',disabled:true}], //견적일자
            email : [], //이메일
            remarkHeader: [''], //비고
            active: [false]  // cell상태
        });

        this._estimateService.getNew(0,10,'','asc', {});

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
        this.estimateHeaderForm.patchValue({'account': ''});
        this.estimateHeaderForm.patchValue({'type': 'QN'});
        this.estimateHeaderForm.patchValue({'status': 'N'});
        this.estimateHeaderForm.patchValue({'soNo': ''});
        this.estimateHeaderForm.patchValue({'remarkHeader': ''});

    }
    /**
     * After view init
     */
    ngAfterViewInit(): void {

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
            this.isProgressSpinner = false;
            this._functionService.cfn_alert(param.msg);
        }else{
            this.backPage();
        }
    }

    /* 저장
     *
     */
    saveEstimate(): void{

        if(!this.estimateHeaderForm.invalid){
            this.showAlert = false;

            let detailCheck = false;
            this.estimateDetails$.pipe(takeUntil(this._unsubscribeAll))
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
                this.estimateDetails$,
                this.estimateDetailsTable);

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
                        this.estimateDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((estimateDetail) => {
                                estimateDetail.forEach((sendData: any) => {
                                    if (sendData.flag) {
                                        if (sendData.flag === 'C') {
                                            createList.push(sendData);
                                        }
                                    }
                                });
                            });
                        if (createList.length > 0) {
                            this.createEstimate(createList);
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
    createEstimate(sendData: Estimate[]): void{
        if(sendData){
            sendData = this.headerDataSet(sendData);

            this._estimateService.createEstimate(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((estimate: any) => {
                    this.isProgressSpinner = true;
                    this.alertMessage(estimate);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        }

    }
    /*견적 금액 업데이트
     *
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    totalAmt() {
        this._estimateService.totalAmt(this.estimateHeaderForm.getRawValue())
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estimate: any) => {
            });
    }
    /* 트랜잭션 전 data Set
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
            sendData[i].soNo = '';
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

    /* 그리드 셀 클릭(팝업)
     * @param element
     * @param column
     * @param i
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    cellClick(element, column: TableConfig, i) {
        if(column.dataField === 'itemCd'){

            if(!this.isMobile){
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
            }else{
                const popup =this._matDialogPopup.open(CommonPopupComponent, {
                    data: {
                        popup : 'P$_ALL_ITEM',
                        headerText : '품목 조회',
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
                    .subscribe((result) => {
                        smallDialogSubscription.unsubscribe();
                        this.isLoading = true;
                        element.itemCd = result.itemCd;
                        element.itemNm = result.itemNm;
                        element.standard = result.standard;
                        element.unit = result.unit;
                        this.tableClear();
                        this.isLoading = false;
                        this._changeDetectorRef.markForCheck();
                });
            }

        }
    }

    openAccountSearch(): void
    {
        if(!this.isMobile){
            const popup =this._matDialogPopup.open(CommonPopupComponent, {
                data: {
                    popup : 'P$_ACCOUNT',
                    headerText : '거래처 조회'
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });

            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if(result){
                        this.estimateHeaderForm.patchValue({'account': result.accountCd});
                        this.estimateHeaderForm.patchValue({'accountNm': result.accountNm});
                        this.estimateHeaderForm.patchValue({'email': result.email});
                    }
                });
        }else{
            const popup =this._matDialogPopup.open(CommonPopupComponent, {
                data: {
                    popup : 'P$_ACCOUNT',
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
                    if(result){
                        smallDialogSubscription.unsubscribe();
                        this.estimateHeaderForm.patchValue({'account': result.accountCd});
                        this.estimateHeaderForm.patchValue({'accountNm': result.accountNm});
                        this.estimateHeaderForm.patchValue({'email': result.email});
                    }
                });
        }

    }
}
