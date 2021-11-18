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
import {merge, Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {CommonCode, FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {OutBoundDetail, OutBoundDetailPagenation} from "../outbound.types";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {Columns} from "../../../../../../@teamplat/services/realgrid/realgrid.types";
import {FuseRealGridService} from "../../../../../../@teamplat/services/realgrid";
import {OutboundService} from "../outbound.service";
import {MatDialog} from "@angular/material/dialog";
import {ActivatedRoute, Router} from "@angular/router";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {DeviceDetectorService} from "ngx-device-detector";
import {TeamPlatConfirmationService} from "../../../../../../@teamplat/services/confirmation";
import {FunctionService} from "../../../../../../@teamplat/services/function";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {OutBound} from "../outbound.types";
import {CommonUdiScanComponent} from "../../../../../../@teamplat/components/common-udi-scan";

@Component({
    selector       : 'app-dms-outbound-detail',
    templateUrl    : './outbound-detail.component.html',
    styleUrls: ['./outbound-detail.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class OutboundDetailComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatPaginator, { static: true }) private _outBoundDetailPagenator: MatPaginator;
    isLoading: boolean = false;
    isMobile: boolean = false;
    isProgressSpinner: boolean = false;
    orderBy: any = 'asc';
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );

    type: CommonCode[] = null;
    status: CommonCode[] = null;
    itemGrades: CommonCode[] = null;
    filterList: string[];

    inBoundHeaders: any;
    inBoundDetails: any;

    outBoundHeaderForm: FormGroup;
    outBoundDetailPagenation: OutBoundDetailPagenation | null = null;
    outBoundDetails$ = new Observable<OutBoundDetail[]>();
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gridList: RealGrid.GridView;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    outBoundDetailColumns: Columns[];
    // @ts-ignore
    outBoundDetailDataProvider: RealGrid.LocalDataProvider;
    outBoundDetailFields: DataFieldObject[] = [
        {fieldName: 'obNo', dataType: ValueType.TEXT},
        {fieldName: 'obLineNo', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'udiYn', dataType: ValueType.TEXT},
        {fieldName: 'udiCode', dataType: ValueType.TEXT},
        {fieldName: 'obExpQty', dataType: ValueType.NUMBER},
        {fieldName: 'qty', dataType: ValueType.NUMBER},
        {fieldName: 'obQty', dataType: ValueType.NUMBER},
        {fieldName: 'unitPrice', dataType: ValueType.NUMBER},
        {fieldName: 'remarkDetail', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _realGridsService: FuseRealGridService,
        private _outboundService: OutboundService,
        private _matDialog: MatDialog,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _formBuilder: FormBuilder,
        public _matDialogPopup: MatDialog,
        private _codeStore: CodeStore,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _utilService: FuseUtilsService,
        private _functionService: FunctionService,
    )
    {
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data,'OB_TYPE', ['ALL']);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data,'OB_STATUS', ['ALL']);
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data,'ITEM_GRADE');
        this.isMobile = this._deviceService.isMobile();
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Form 생성
        this.outBoundHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            obNo: [{value:'',disabled:true}],   // 출고번호
            account: [{value:'',disabled:true},[Validators.required]], // 거래처 코드
            accountNm: [{value:'',disabled:true}],   // 거래처 명
            address: [{value:'',disabled:true}, [Validators.required]],   // 거래처 주소
            type: [{value:'',disabled:true}, [Validators.required]],   // 유형
            status: [{value:'',disabled:true}, [Validators.required]],   // 상태
            dlvAccount: [{value:'',disabled:true}],   // 납품처
            dlvAccountNm: [{value:'',disabled:true}],   // 납품처
            dlvAddress: [{value:'',disabled:true}],   // 납품처 주소
            dlvDate: [{value:'',disabled:true}, [Validators.required]],//납품일자
            obCreDate: [{value:'',disabled:true}],//작성일
            obDate: [{value:'',disabled:true}], //출고일
            remarkHeader: [''], //비고
            active: [false]  // cell상태
        });

        if(this._activatedRoute.snapshot.paramMap['params'] !== (null || undefined)){
            this.outBoundHeaderForm.patchValue(
                this._activatedRoute.snapshot.paramMap['params']
            );

            this._outboundService.getDetail(0,20,'obLineNo','asc',this.outBoundHeaderForm.getRawValue());
        }

        //페이지 라벨
        this._outBoundDetailPagenator._intl.itemsPerPageLabel = '';
        const valuesItemGrades = [];
        const lablesItemGrades = [];
        this.itemGrades.forEach((param: any) => {
            valuesItemGrades.push(param.id);
            lablesItemGrades.push(param.name);
        });

        //그리드 컬럼
        this.outBoundDetailColumns = [
            {name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'left-cell-text'}
                , renderer: 'itemGrdPopup'
                , popUpObject:
                    {
                        popUpId: 'P$_ALL_ITEM',
                        popUpHeaderText: '품목 조회',
                        popUpDataSet: 'itemCd:itemCd|itemNm:itemNm|' +
                            'standard:standard|unit:unit'
                    }
            },
            {name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '품목명', styleName: 'left-cell-text'}},
            {name: 'itemGrade', fieldName: 'itemGrade', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '품목등급', styleName: 'left-cell-text'},
                values: valuesItemGrades,
                labels: lablesItemGrades,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.status),
            },
            {name: 'standard', fieldName: 'standard', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '규격' , styleName: 'left-cell-text'}},
            {name: 'unit', fieldName: 'unit', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '단위' , styleName: 'left-cell-text'}},
            {name: 'obExpQty', fieldName: 'obExpQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '출고대상수량' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'
            },
            {name: 'qty', fieldName: 'qty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '수량' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'
            },
            {name: 'obQty', fieldName: 'obQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '출고수량' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'
            },
            {name: 'remarkDetail', fieldName: 'remarkDetail', type: 'data', width: '300', styleName: 'left-cell-text'
                , header: {text: '비고' , styleName: 'left-cell-text'}},
        ];
        //그리드 Provider
        this.outBoundDetailDataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        //그리드 옵션
        const gridListOption = {
            stateBar : true,
            checkBar : true,
            footers : false,
        };

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.outBoundDetailDataProvider,
            'outBoundDetailGrid',
            this.outBoundDetailColumns,
            this.outBoundDetailFields,
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
            if(dataCell.item.rowState === 'created'){
                if(dataCell.dataColumn.fieldName === 'itemCd'||
                    dataCell.dataColumn.fieldName === 'itemNm'||
                    dataCell.dataColumn.fieldName === 'standard'||
                    dataCell.dataColumn.fieldName === 'unit'||
                    dataCell.dataColumn.fieldName === 'itemGrade'){
                    return {editable : false};
                }else {
                    return {editable : true};
                }
            }else{
                //console.log(dataCell.dataColumn.renderer);
                if(dataCell.dataColumn.fieldName === 'itemCd'||
                    dataCell.dataColumn.fieldName === 'itemNm'||
                    dataCell.dataColumn.fieldName === 'standard'||
                    dataCell.dataColumn.fieldName === 'unit'||
                    dataCell.dataColumn.fieldName === 'itemGrade'){

                    this._realGridsService.gfn_PopUpBtnHide('itemGrdPopup');
                    return {editable : false};
                }else{
                    return {editable : true};
                }
            }

            if(
                dataCell.dataColumn.fieldName === 'obQty'){
                return {editable : false};
            }
        });
        // eslint-disable-next-line max-len
        this._realGridsService.gfn_PopUp(this.isMobile, this.isExtraSmall, this.gridList, this.outBoundDetailDataProvider, this.outBoundDetailColumns, this._matDialogPopup, this._unsubscribeAll, this._changeDetectorRef);
        //정렬
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if(clickData.cellType === 'header'){
                // eslint-disable-next-line max-len
                this._outboundService.getDetail(this.outBoundDetailPagenation.page,this.outBoundDetailPagenation.size,clickData.column,this.orderBy,this.outBoundHeaderForm.getRawValue());
            }
            if(this.orderBy === 'asc'){
                this.orderBy = 'desc';
            }else{
                this.orderBy = 'asc';
            }
        };
        this.setGridData();

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

    setGridData(): void {
        this.outBoundDetails$ = this._outboundService.outBoundDetails$;
        this._outboundService.outBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outboundDetail: any) => {
                // Update the counts
                if(outboundDetail !== null){
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.outBoundDetailDataProvider, outboundDetail);
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    ngAfterViewInit(): void {

        merge(this._outBoundDetailPagenator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._outboundService.getDetail(this._outBoundDetailPagenator.pageIndex, this._outBoundDetailPagenator.pageSize, 'obLineNo', this.orderBy, this.outBoundHeaderForm.getRawValue());
            }),
            map(() => {
                this.isLoading = false;
            })
        ).subscribe();
    }
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.outBoundDetailDataProvider);
    }

    addRow(): void {

        const values = [
            '', '', '', '', '', '', '', '', '',  0, 0, 0, 0, ''
        ];

        this._realGridsService.gfn_AddRow(this.gridList, this.outBoundDetailDataProvider, values);
    }

    delRow(): void {

        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.outBoundDetailDataProvider);

        if(checkValues.length < 1){
            this._functionService.cfn_alert('삭제 대상을 선택해주세요.');
            return;
        }

        this._realGridsService.gfn_DelRow(this.gridList, this.outBoundDetailDataProvider);
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '출고 상세목록');
    }

    //페이징
    pageEvent($event: PageEvent): void {
        // eslint-disable-next-line max-len
        this._outboundService.getDetail(this._outBoundDetailPagenator.pageIndex, this._outBoundDetailPagenator.pageSize, 'obLineNo', this.orderBy, this.outBoundHeaderForm.getRawValue());
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

    backPage(): void {
        this._router.navigate(['bound/outbound']);
    }

    outBoundSave(): void {
        const status = this.outBoundHeaderForm.controls['status'].value;
        //신규가 아니면 불가능
        if(status !== 'N'){
            this.isProgressSpinner = false;
            this._functionService.cfn_alert('저장 할 수 없습니다.');
            return;
        }
        if(this._realGridsService.gfn_ValidationRows(this.gridList , this._functionService)) {return;}

        if(!this.outBoundHeaderForm.invalid){

            let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.outBoundDetailDataProvider);

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
                        this._outboundService.saveOut(rows)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((outBound: any) => {
                                this.isProgressSpinner = true;
                                this.alertMessage(outBound);
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

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: OutBound[],outBoundHeader?: any) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i=0; i<sendData.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            /*sendData[i].account = outBoundHeader['account'];
            sendData[i].address = outBoundHeader['address'];
            sendData[i].obNo = outBoundHeader['obNo'];
            sendData[i].type = outBoundHeader['type'];
            sendData[i].status = outBoundHeader['status'];
            sendData[i].dlvAccount = outBoundHeader['dlvAccount'];
            sendData[i].dlvAddress = outBoundHeader['dlvAddress'];
            sendData[i].dlvDate = outBoundHeader['dlvDate'];
            sendData[i].remarkHeader = outBoundHeader['remarkHeader'];*/
            sendData[i].account = this.outBoundHeaderForm.controls['account'].value;
            sendData[i].address = this.outBoundHeaderForm.controls['address'].value;
            sendData[i].obNo = this.outBoundHeaderForm.controls['obNo'].value;
            sendData[i].type = this.outBoundHeaderForm.controls['type'].value;
            sendData[i].status = this.outBoundHeaderForm.controls['status'].value;
            sendData[i].dlvAccount = this.outBoundHeaderForm.controls['dlvAccount'].value;
            sendData[i].dlvAddress = this.outBoundHeaderForm.controls['dlvAddress'].value;
            sendData[i].dlvDate = this.outBoundHeaderForm.controls['dlvDate'].value;
            sendData[i].remarkHeader = this.outBoundHeaderForm.controls['remarkHeader'].value;

        }
        return sendData;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    outBoundConfirm() {
        const obStatus = this.outBoundHeaderForm.controls['status'].value;
        if(obStatus !== 'N' && obStatus !== 'P'){
            this._functionService.cfn_alert('출고할 수 없는 상태입니다.');
            return false;
        }

        let outBoundData;
        let outBoundDataFilter;
        let udiCheckData;
        const rows = this._realGridsService.gfn_GetRows(this.gridList, this.outBoundDetailDataProvider);

        outBoundData = rows.filter((detail: any) => (detail.qty > 0 && detail.qty !== '0'))
            .map((param: any) => param);

        outBoundDataFilter = rows.filter((detail: any) => detail.udiYn !== 'Y')
            .map((param: any) => param);

        udiCheckData = rows.filter((detail: any) => detail.udiYn === 'Y')
            .map((param: any) => param);

        if(outBoundData.length < 1) {
            this._functionService.cfn_alert('출고 수량이 존재하지 않습니다.');
            return false;
        }else{
            if(udiCheckData.length > 0){
                //UDI 체크 로우만 나오게 하고 , outBoundData 는 숨기기
                //입력 수량 그대로 가져오기
                //UDI 정보 INPUT 후 값 셋팅

                const popup =this._matDialogPopup.open(CommonUdiScanComponent, {
                    data: {
                        detail : udiCheckData
                    },
                    autoFocus: false,
                    maxHeight: '90vh',
                    disableClose: true
                });
                popup.afterClosed().subscribe((result) => {
                    if(result){
                        if(result !== undefined){

                            // eslint-disable-next-line @typescript-eslint/prefer-for-of
                            for(let i=0; i<result.length; i++){
                                outBoundDataFilter.push(result[i]);
                            }
                            this.outBoundCall(outBoundDataFilter);
                        }
                    }
                });
            }else{
                this.outBoundCall(outBoundData);
            }
        }
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    outBoundCall(outBoundData: OutBound[]){
        const confirmation = this._teamPlatConfirmationService.open({
            title  : '출고',
            message: '출고하시겠습니까?',
            actions: {
                confirm: {
                    label: '출고'
                },
                cancel: {
                    label: '닫기'
                }
            }
        });
        outBoundData.forEach((outBound: any) => {
            outBound.qty = outBound.qty;
            outBound.lot4 = outBound.udiCode;
        });
        outBoundData = outBoundData.filter((outBound: any) => outBound.qty > 0 ).map((param: any) => param);

        confirmation.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if(result){
                    this.outBoundDetailConfirm(outBoundData);
                }
            });
    }

    /* 출고 (상세)
     *
     * @param sendData
     */
    outBoundDetailConfirm(sendData: OutBound[]): void{
        this.isProgressSpinner = true;
        if(sendData){
            this._outboundService.outBoundDetailConfirm(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((outBound: any) => {
                    this._functionService.cfn_alertCheckMessage(outBound);
                    this.isProgressSpinner = false;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        }
    }
}
