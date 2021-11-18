import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {fuseAnimations} from "../../../../../../@teamplat/animations";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {CommonCode, FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SalesOrderDetail, SalesOrderDetailPagenation} from "../salesorder.types";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {Columns} from "../../../../../../@teamplat/services/realgrid/realgrid.types";
import {FuseRealGridService} from "../../../../../../@teamplat/services/realgrid";
import {MatDialog} from "@angular/material/dialog";
import {ActivatedRoute, Router} from "@angular/router";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {TeamPlatConfirmationService} from "../../../../../../@teamplat/services/confirmation";
import {FunctionService} from "../../../../../../@teamplat/services/function";
import {DeviceDetectorService} from "ngx-device-detector";
import {SalesorderService} from "../salesorder.service";
import {takeUntil} from "rxjs/operators";
import {SalesOrder} from "../salesorder.types";
import {CommonPopupItemsComponent} from "../../../../../../@teamplat/components/common-popup-items";

@Component({
    selector       : 'app-dms-salesorder-new',
    templateUrl    : './salesorder-new.component.html',
    styleUrls: ['./salesorder-new.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class SalesorderNewComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatPaginator, { static: true }) private _salesorderDetailPagenator: MatPaginator;
    isLoading: boolean = false;
    isMobile: boolean = false;
    isProgressSpinner: boolean = false;
    orderBy: any = 'asc';
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );

    type: CommonCode[] = null;
    status: CommonCode[] = null;
    filterList: string[];
    estimateHeader: any;
    estimateDetail: any;

    salesorderHeaderForm: FormGroup;
    salesorderDetailPagenation: SalesOrderDetailPagenation | null = null;
    salesorderDetails$ = new Observable<SalesOrderDetail[]>();

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gridList: RealGrid.GridView;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    salesorderDetailColumns: Columns[];
    // @ts-ignore
    salesorderDetailDataProvider: RealGrid.LocalDataProvider;
    salesorderDetailFields: DataFieldObject[] = [
        {fieldName: 'soLineNo', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'poReqQty', dataType: ValueType.NUMBER},
        {fieldName: 'invQty', dataType: ValueType.NUMBER},
        {fieldName: 'reqQty', dataType: ValueType.NUMBER},
        {fieldName: 'qty', dataType: ValueType.NUMBER},
        {fieldName: 'unitPrice', dataType: ValueType.NUMBER},
        {fieldName: 'soAmt', dataType: ValueType.NUMBER},
        {fieldName: 'remarkDetail', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _realGridsService: FuseRealGridService,
        private _matDialog: MatDialog,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _formBuilder: FormBuilder,
        public _matDialogPopup: MatDialog,
        private _codeStore: CodeStore,
        private _changeDetectorRef: ChangeDetectorRef,
        private _salesorderService: SalesorderService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _functionService: FunctionService,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.filterList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data,'SO_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data,'SO_STATUS', this.filterList);
        if(this._router.getCurrentNavigation() !== (null && undefined)){

            if(this._router.getCurrentNavigation().extras.state !== undefined){
                if(this._router.getCurrentNavigation().extras.state.header !== undefined
                    && this._router.getCurrentNavigation().extras.state.detail !== undefined){
                    //console.log(this._router.getCurrentNavigation().extras.state.header);
                    const header = this._router.getCurrentNavigation().extras.state.header;
                    const detail = this._router.getCurrentNavigation().extras.state.detail;
                    this.estimateHeader = header;
                    this.estimateDetail = detail;
                }
            }

            this._changeDetectorRef.markForCheck();
        }
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnInit(): void {
        // Form 생성
        this.salesorderHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            soNo: [{value:'',disabled:true}],   // 주문번호
            account: [{value:''},[Validators.required]], // 거래처 코드
            accountNm: [{value:'',disabled:true}],   // 거래처 명
            type: [{value:''}, [Validators.required]],   // 유형
            status: [{value:'',disabled:true}, [Validators.required]],   // 상태
            soAmt: [{value:'',disabled:true}],   // 주문금액
            obNo: [{value:'',disabled:true}],   // 출고번호
            soCreDate: [{value:'',disabled:true}],//주문 생성일자
            soDate: [{value:'',disabled:true}], //주문일자
            remarkHeader: [''], //비고
            active: [false]  // cell상태
        });
        //페이지 라벨
        this._salesorderDetailPagenator._intl.itemsPerPageLabel = '';

        //그리드 컬럼
        this.salesorderDetailColumns = [
            {name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'left-cell-text'}
                , renderer: 'itemGrdPopup'
                , popUpObject:
                    {
                        popUpId: 'P$_ALL_ITEM',
                        popUpHeaderText: '품목 조회',
                        popUpDataSet: 'itemCd:itemCd|itemNm:itemNm|' +
                            'standard:standard|unit:unit|unitPrice:salesPrice|' +
                            'poReqQty:poQty|invQty:availQty'
                    }
            },
            {name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '품목명', styleName: 'left-cell-text'}},
            {name: 'standard', fieldName: 'standard', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '규격' , styleName: 'left-cell-text'}},
            {name: 'unit', fieldName: 'unit', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '단위' , styleName: 'left-cell-text'}},
            {name: 'poReqQty', fieldName: 'poReqQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '발주' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'
            },
            {name: 'invQty', fieldName: 'invQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '보유' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'
            },
            {name: 'reqQty', fieldName: 'reqQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '요청수량' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'
            },
            {name: 'unitPrice', fieldName: 'unitPrice', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '단가' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'
            },
            {name: 'poAmt', fieldName: 'soAmt', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '주문금액' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'
            },
            {name: 'remarkDetail', fieldName: 'remarkDetail', type: 'data', width: '300', styleName: 'left-cell-text'
                , header: {text: '비고' , styleName: 'left-cell-text'}},
        ];

        //그리드 Provider
        this.salesorderDetailDataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        //그리드 옵션
        const gridListOption = {
            stateBar : true,
            checkBar : true,
            footers : false,
        };

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.salesorderDetailDataProvider,
            'salesorderDetailGrid',
            this.salesorderDetailColumns,
            this.salesorderDetailFields,
            gridListOption);

        //그리드 옵션
        this.gridList.setEditOptions({
            readOnly: false,
            insertable: false,
            appendable: false,
            editable: true,
            updatable: true,
            deletable: true,
            checkable: true,
            softDeleting: true,
            //hideDeletedRows: true,
        });
        this.gridList.deleteSelection(true);
        this.gridList.setDisplayOptions({liveScroll: false,});
        this.gridList.setCopyOptions({
            enabled: true,
            singleMode: false});
        this.gridList.setPasteOptions({
            enabled: true,
            commitEdit: true,
            checkReadOnly: true});
        this.gridList.editOptions.commitByCell = true;
        this.gridList.editOptions.validateOnEdited = true;

        this._realGridsService.gfn_EditGrid(this.gridList);
        const validationList = ['itemCd'];
        this._realGridsService.gfn_ValidationOption(this.gridList, validationList);

        // 셀 edit control
        this.gridList.setCellStyleCallback((grid, dataCell) => {

            //추가시
            if(dataCell.dataColumn.fieldName === 'itemCd'||
                dataCell.dataColumn.fieldName === 'itemNm'||
                dataCell.dataColumn.fieldName === 'standard'||
                dataCell.dataColumn.fieldName === 'unit'||
                dataCell.dataColumn.fieldName === 'poReqQty'||
                dataCell.dataColumn.fieldName === 'invQty'||
                dataCell.dataColumn.fieldName === 'soAmt'){
                return {editable : false};
            }else {
                return {editable : true};
            }
        });
        // eslint-disable-next-line max-len
        this._realGridsService.gfn_PopUp(this.isMobile, this.isExtraSmall, this.gridList, this.salesorderDetailDataProvider, this.salesorderDetailColumns, this._matDialogPopup, this._unsubscribeAll, this._changeDetectorRef);
        this.salesorderDetails$ = this._salesorderService.salesorderDetails$;
        if(this.estimateHeader !== undefined){
            this.salesorderHeaderForm.patchValue({'account': this.estimateHeader.account});
            this.salesorderHeaderForm.patchValue({'accountNm': this.estimateHeader.accountNm});
            this.salesorderHeaderForm.patchValue({'type': '1'});
            this.salesorderHeaderForm.patchValue({'status': 'N'});
            this.salesorderHeaderForm.patchValue({'obNo': ''});
            this.salesorderHeaderForm.patchValue({'remarkHeader': this.estimateHeader.remarkHeader});
        }else{
            this.salesorderHeaderForm.patchValue({'account': ''});
            this.salesorderHeaderForm.patchValue({'type': '1'});
            this.salesorderHeaderForm.patchValue({'status': 'N'});
            this.salesorderHeaderForm.patchValue({'obNo': ''});
            this.salesorderHeaderForm.patchValue({'remarkHeader': ''});
        }

        if(this.estimateDetail !== undefined){
            this.salesorderDetails$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((salesorderDetail) => {
                    salesorderDetail = [];
                    this.estimateDetail.forEach((estimateDetail: any) => {
                        salesorderDetail.push({
                            no: estimateDetail.length + 1,
                            flag: 'C',
                            itemCd: estimateDetail.itemCd,
                            itemNm: estimateDetail.itemNm,
                            standard: estimateDetail.standard,
                            unit: estimateDetail.unit,
                            soLineNo: estimateDetail.qtLineNo,
                            unitPrice: estimateDetail.qtPrice,
                            reqQty: estimateDetail.qty,
                            qty: 0,
                            poReqQty: estimateDetail.poReqQty,
                            invQty: estimateDetail.invQty,
                            soAmt:estimateDetail.qtAmt,
                            remarkDetail: estimateDetail.remarkDetail,
                        });
                    });
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.salesorderDetailDataProvider, salesorderDetail);
                    this._changeDetectorRef.markForCheck();
                });
        }
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.salesorderDetailDataProvider);
    }

    addRow(): void {

        const values = [
            '', '', '', '', '', 0, 0, 0, 0, 0, 0, ''
        ];

        this._realGridsService.gfn_AddRow(this.gridList, this.salesorderDetailDataProvider, values);
    }

    delRow(): void {

        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.salesorderDetailDataProvider);

        if(checkValues.length < 1){
            this._functionService.cfn_alert('삭제 대상을 선택해주세요.');
            return;
        }

        this._realGridsService.gfn_DelRow(this.gridList, this.salesorderDetailDataProvider);
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '주문 상세목록');
    }

    salesorderSave(): void {
        const status = this.salesorderHeaderForm.controls['status'].value;
        if(this._realGridsService.gfn_ValidationRows(this.gridList , this._functionService)) {return;}

        if(!this.salesorderHeaderForm.invalid){
            let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.salesorderDetailDataProvider);

            let detailCheck = false;

            if(rows.length === 0){
                this._functionService.cfn_alert('수정된 행이 존재하지 않습니다.');
                detailCheck = true;
            }
            if(detailCheck){
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
                    if(result){
                        rows = this.headerDataSet(rows);
                        this._salesorderService.createSalesOrder(rows)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((order: any) => {
                                this.isProgressSpinner = true;
                                this.alertMessage(order);
                                this._changeDetectorRef.markForCheck();
                            });
                    }
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();

        }else{
            this._functionService.cfn_alert('필수값을 입력해주세요.');
        }
    }
    /* 트랜잭션 전 data Set
     * @param sendData
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: SalesOrder[]) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i=0; i<sendData.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            sendData[i].account = this.salesorderHeaderForm.controls['account'].value;
            sendData[i].soNo = this.salesorderHeaderForm.controls['soNo'].value;
            sendData[i].type = this.salesorderHeaderForm.controls['type'].value;
            sendData[i].status = this.salesorderHeaderForm.controls['status'].value;
            sendData[i].obNo = '';
            sendData[i].remarkHeader = this.salesorderHeaderForm.controls['remarkHeader'].value;
        }
        return sendData;
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

    backPage(): void{
        this._router.navigate(['salesorder/salesorder']);
    }

    openAccountSearch(): void {
        if(!this.isMobile){

            const popup =this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup : 'P$_ACCOUNT',
                    headerText : '거래처 조회',
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });

            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if(result){
                        this.salesorderHeaderForm.patchValue({'account': result.accountCd});
                        this.salesorderHeaderForm.patchValue({'accountNm': result.accountNm});
                        this.salesorderHeaderForm.patchValue({'email': result.email});
                        this._changeDetectorRef.markForCheck();
                    }
                });
        }else{
            const popup =this._matDialogPopup.open(CommonPopupItemsComponent, {
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
                        this.salesorderHeaderForm.patchValue({'account': result.accountCd});
                        this.salesorderHeaderForm.patchValue({'accountNm': result.accountNm});
                        this.salesorderHeaderForm.patchValue({'email': result.email});
                    }
                });
        }
    }
    //페이징
    pageEvent($event: PageEvent): void {
        // eslint-disable-next-line max-len
        //this._salesorderService.getDetail(this._salesorderDetailPagenator.pageIndex, this._salesorderDetailPagenator.pageSize, 'soLineNo', this.orderBy, this.salesorderHeaderForm.getRawValue());
    }
}