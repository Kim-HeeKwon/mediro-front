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
import {
    Estimate,
    EstimateDetail,
    EstimateDetailPagenation
} from "../estimate.types";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {Columns} from "../../../../../../@teamplat/services/realgrid/realgrid.types";
import {FuseRealGridService} from "../../../../../../@teamplat/services/realgrid";
import {MatDialog} from "@angular/material/dialog";
import {ActivatedRoute, Router} from "@angular/router";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {EstimateService} from "../estimate.service";
import {TeamPlatConfirmationService} from "../../../../../../@teamplat/services/confirmation";
import {FunctionService} from "../../../../../../@teamplat/services/function";
import {DeviceDetectorService} from "ngx-device-detector";
import {takeUntil} from "rxjs/operators";
import {CommonPopupItemsComponent} from "../../../../../../@teamplat/components/common-popup-items";

@Component({
    selector       : 'app-dms-estimate-new',
    templateUrl    : './estimate-new.component.html',
    styleUrls: ['./estimate-new.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class EstimateNewComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatPaginator, { static: true }) private _estimateDetailPagenator: MatPaginator;
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
    estimateHeaderForm: FormGroup;
    estimateDetailPagenation: EstimateDetailPagenation | null = null;
    estimateDetails$ = new Observable<EstimateDetail[]>();
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gridList: RealGrid.GridView;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    estimateDetailColumns: Columns[];
    // @ts-ignore
    estimateDetailDataProvider: RealGrid.LocalDataProvider;
    estimateDetailFields: DataFieldObject[] = [
        {fieldName: 'qtLineNo', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'qty', dataType: ValueType.NUMBER},
        {fieldName: 'qtPrice', dataType: ValueType.NUMBER},
        {fieldName: 'qtAmt', dataType: ValueType.NUMBER},
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

    ngOnInit(): void {

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

        //페이지 라벨
        this._estimateDetailPagenator._intl.itemsPerPageLabel = '';
        //그리드 컬럼
        this.estimateDetailColumns = [
            {name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'left-cell-text'}
                , renderer: 'itemGrdPopup'
                , popUpObject:
                    {
                        popUpId: 'P$_ALL_ITEM',
                        popUpHeaderText: '품목 조회',
                        popUpDataSet: 'itemCd:itemCd|itemNm:itemNm|standard:standard|unit:unit'
                    }
            },
            {name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '품목명', styleName: 'left-cell-text'}},
            {name: 'standard', fieldName: 'standard', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '규격' , styleName: 'left-cell-text'}},
            {name: 'unit', fieldName: 'unit', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '단위' , styleName: 'left-cell-text'}},
            {name: 'qty', fieldName: 'qty', type: 'data', width: '120', styleName: 'right-cell-text'
                , header: {text: '수량' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'
            },
            {name: 'qtPrice', fieldName: 'qtPrice', type: 'data', width: '120', styleName: 'right-cell-text'
                , header: {text: '단가' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'
            },
            {name: 'qtAmt', fieldName: 'qtAmt', type: 'data', width: '120', styleName: 'right-cell-text'
                , header: {text: '견적금액' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'
            },
            {name: 'remarkDetail', fieldName: 'remarkDetail', type: 'data', width: '300', styleName: 'left-cell-text'
                , header: {text: '비고' , styleName: 'left-cell-text'}},
        ];
        //그리드 Provider
        this.estimateDetailDataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        //그리드 옵션
        const gridListOption = {
            stateBar : true,
            checkBar : true,
            footers : false,
        };

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.estimateDetailDataProvider,
            'estimateDetailGrid',
            this.estimateDetailColumns,
            this.estimateDetailFields,
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

            //console.log(dataCell.item.rowState); // 추가 , 삭제, 수정 변경시
            if(dataCell.dataColumn.fieldName === 'itemCd'){
                return {editable : false};
            }else{
                return {editable : true};
            }
        });
        // eslint-disable-next-line max-len
        this._realGridsService.gfn_PopUp(this.isMobile, this.isExtraSmall, this.gridList, this.estimateDetailDataProvider, this.estimateDetailColumns, this._matDialogPopup, this._unsubscribeAll, this._changeDetectorRef);

        this.estimateDetails$ = this._estimateService.estimateDetails$;
        this.estimateHeaderForm.patchValue({'account': ''});
        this.estimateHeaderForm.patchValue({'type': 'QN'});
        this.estimateHeaderForm.patchValue({'status': 'N'});
        this.estimateHeaderForm.patchValue({'soNo': ''});
        this.estimateHeaderForm.patchValue({'remarkHeader': ''});
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.estimateDetailDataProvider);
    }

    addRow(): void {

        const values = [
            '', '', '', '', '', 0, 0, 0, ''
        ];

        this._realGridsService.gfn_AddRow(this.gridList, this.estimateDetailDataProvider, values);
    }
    delRow(): void {

        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.estimateDetailDataProvider);

        if(checkValues.length < 1){
            this._functionService.cfn_alert('삭제 대상을 선택해주세요.');
            return;
        }

        this._realGridsService.gfn_DelRow(this.gridList, this.estimateDetailDataProvider);
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '견적 상세목록');
    }


    saveEstimate(): void {

        if(this._realGridsService.gfn_ValidationRows(this.gridList , this._functionService)) {return;}

        if(!this.estimateHeaderForm.invalid){

            const rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.estimateDetailDataProvider);

            let detailCheck = false;

            if(rows.length === 0){
                this._functionService.cfn_alert('상세정보에 값이 없습니다.');
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
                    const sendData = this.headerDataSet(rows);

                    this._estimateService.createEstimate(sendData)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((estimate: any) => {
                            this.isProgressSpinner = true;
                            this.alertMessage(estimate);
                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        });
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

    backPage(): void {
        this._router.navigate(['estimate-order/estimate']);
    }
    //페이징
    pageEvent($event: PageEvent): void {
        // eslint-disable-next-line max-len
        //this._estimateService.getDetail(this._estimateDetailPagenator.pageIndex, this._estimateDetailPagenator.pageSize, 'qtLineNo', this.orderBy, this.estimateHeaderForm.getRawValue());
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
                        this.estimateHeaderForm.patchValue({'account': result.accountCd});
                        this.estimateHeaderForm.patchValue({'accountNm': result.accountNm});
                        this.estimateHeaderForm.patchValue({'email': result.email});
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
                        this.estimateHeaderForm.patchValue({'account': result.accountCd});
                        this.estimateHeaderForm.patchValue({'accountNm': result.accountNm});
                        this.estimateHeaderForm.patchValue({'email': result.email});
                    }
                });
        }
    }
}