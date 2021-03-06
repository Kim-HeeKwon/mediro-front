import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {fuseAnimations} from '../../../../../../@teamplat/animations';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {merge, Observable, Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {CommonCode, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {OutBoundDetail, OutBoundDetailPagenation} from '../outbound.types';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {Columns} from '../../../../../../@teamplat/services/realgrid/realgrid.types';
import {FuseRealGridService} from '../../../../../../@teamplat/services/realgrid';
import {OutboundService} from '../outbound.service';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {DeviceDetectorService} from 'ngx-device-detector';
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import {FunctionService} from '../../../../../../@teamplat/services/function';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {OutBound} from '../outbound.types';
import {CommonUdiScanComponent} from '../../../../../../@teamplat/components/common-udi-scan';
import {CommonPopupItemsComponent} from '../../../../../../@teamplat/components/common-popup-items';
import {ReportHeaderData} from '../../../../../../@teamplat/components/common-bill/common-bill.types';
import {CommonBillComponent} from '../../../../../../@teamplat/components/common-bill';
import {OutboundScanComponent} from "../../../../../../@teamplat/components/outbound-scan";
import {Common} from "../../../../../../@teamplat/providers/common/common";

@Component({
    selector: 'app-dms-outbound-detail',
    templateUrl: './outbound-detail.component.html',
    styleUrls: ['./outbound-detail.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class OutboundDetailComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator, {static: true}) private _outBoundDetailPagenator: MatPaginator;
    isLoading: boolean = false;
    isMobile: boolean = false;
    orderBy: any = 'asc';
    reportHeaderData: ReportHeaderData = new ReportHeaderData();
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
        {fieldName: 'fomlInfo', dataType: ValueType.TEXT},
        {fieldName: 'refItemNm', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'udiYn', dataType: ValueType.TEXT},
        {fieldName: 'medDevItemSeq', dataType: ValueType.TEXT},
        {fieldName: 'typeName', dataType: ValueType.TEXT},
        {fieldName: 'udiCode', dataType: ValueType.TEXT},
        {fieldName: 'invQty', dataType: ValueType.NUMBER},
        {fieldName: 'obExpQty', dataType: ValueType.NUMBER},
        {fieldName: 'qty', dataType: ValueType.NUMBER},
        {fieldName: 'obQty', dataType: ValueType.NUMBER},
        {fieldName: 'unitPrice', dataType: ValueType.NUMBER},
        {fieldName: 'totalAmt', dataType: ValueType.NUMBER},
        {fieldName: 'remarkDetail', dataType: ValueType.TEXT},
        {fieldName: 'reportRemark', dataType: ValueType.TEXT},
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
        private _common: Common,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _utilService: FuseUtilsService,
        private _functionService: FunctionService,
    ) {
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data, 'OB_TYPE', ['ALL']);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data, 'OB_STATUS', ['ALL']);
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_GRADE');
        this.isMobile = this._deviceService.isMobile();
    }

    /**
     * On init
     */
    ngOnInit(): void {
        // Form 생성
        this.outBoundHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            obNo: [{value: '', disabled: true}],   // 출고번호
            account: [{value: '', disabled: true}, [Validators.required]], // 거래처 코드
            accountNm: [{value: '', disabled: true}],   // 거래처 명
            address: [{value: ''}],   // 거래처 주소
            type: [{value: '', disabled: true}, [Validators.required]],   // 유형
            status: [{value: '', disabled: true}, [Validators.required]],   // 상태
            dlvAccount: [{value: ''}],   // 납품처
            dlvAccountNm: [{value: '', disabled: true}],   // 납품처
            dlvAddress: [{value: ''}],   // 납품처 주소
            dlvDate: [{value: ''}, [Validators.required]],//납품일자
            obCreDate: [{value: '', disabled: true}],//작성일
            obDate: [{value: '', disabled: false}, [Validators.required]], //출고일
            remarkHeader: [''], //비고
            obAmt: [{value: '', disabled: true}],   // 금액
            toAccountNm: [''],
            deliveryDate: [''],
            custBusinessNumber: [''],// 사업자 등록번호
            custBusinessName: [''],//상호
            representName: [''],//성명
            reportAddress: [''],
            businessCondition: [''],// 업태
            businessCategory: [''],// 종목
            phoneNumber: [''],// 전화번호
            fax: [''],// 팩스번호
            active: [false]  // cell상태
        });


        if (this._activatedRoute.snapshot.paramMap['params'] !== (null || undefined)) {
            this.outBoundHeaderForm.patchValue(
                this._activatedRoute.snapshot.paramMap['params']
            );

            this.outBoundHeaderForm.patchValue({'obAmt' :
                this.priceToString(this._activatedRoute.snapshot.paramMap['params'].obAmt)});

            this._outboundService.getDetail(0, 100, 'obLineNo', 'asc', this.outBoundHeaderForm.getRawValue());
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
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'center-cell-text red-font-color'}
                , renderer: 'itemGrdPopup'
                , popUpObject:
                    {
                        popUpId: 'P$_ALL_ITEM',
                        popUpHeaderText: '품목 조회',
                        popUpDataSet: 'itemCd:itemCd|itemNm:itemNm|fomlInfo:fomlInfo|refItemNm:refItemNm|' +
                            'standard:standard|unit:unit|itemGrade:itemGrade|unitPrice:salesPrice|invQty:availQty',
                        where : [{
                            key: 'account',
                            replace : 'account:=:#{account}'
                        }]
                    }
            },
            {
                name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'fomlInfo', fieldName: 'fomlInfo', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '모델명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'refItemNm', fieldName: 'refItemNm', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '고객 품목명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'standard', fieldName: 'standard', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '규격', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'unit', fieldName: 'unit', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '단위', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemGrade', fieldName: 'itemGrade', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '품목등급', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                },
                values: valuesItemGrades,
                labels: lablesItemGrades,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.itemGrades),
            },
            {
                name: 'udiYn', fieldName: 'udiYn', type: 'data', width: '100', styleName: 'center-cell-text'
                , header: {text: '바코드 스캔 여부', styleName: 'center-cell-text text-8s'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'invQty', fieldName: 'invQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '보유재고량', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'obExpQty', fieldName: 'obExpQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '출고대상수량', styleName: 'center-cell-text red-font-color'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'obQty', fieldName: 'obQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '출고수량', styleName: 'center-cell-text red-font-color'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'qty', fieldName: 'qty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '미출고수량', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'unitPrice', fieldName: 'unitPrice', type: 'data', width: '150', styleName: 'right-cell-text'
                , header: {text: '단가(VAT포함)', styleName: 'center-cell-text blue-font-color'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'totalAmt', fieldName: 'totalAmt', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '금액', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'remarkDetail', fieldName: 'remarkDetail', type: 'data', width: '300', styleName: 'left-cell-text'
                , header: {text: '비고', styleName: 'center-cell-text blue-font-color'}, renderer: {
                    showTooltip: true
                }
            },
        ];
        //그리드 Provider
        this.outBoundDetailDataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        //그리드 옵션
        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
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
        });
        this.gridList.deleteSelection(true);
        this.gridList.setDisplayOptions({liveScroll: false,});
        this.gridList.setCopyOptions({
            enabled: true,
            singleMode: false
        });
        this.gridList.setPasteOptions({
            enabled: true,
            startEdit: false,
            commitEdit: true,
            checkReadOnly: true
        });
        this.gridList.editOptions.commitByCell = true;
        this.gridList.editOptions.validateOnEdited = true;

        this._realGridsService.gfn_EditGrid(this.gridList);
        const validationList = ['itemCd'];
        this._realGridsService.gfn_ValidationOption(this.gridList, validationList);

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellEdited = ((grid, itemIndex, row, field) => {

            if(this.outBoundDetailDataProvider.getOrgFieldName(field) === 'obExpQty' ||
                this.outBoundDetailDataProvider.getOrgFieldName(field) === 'unitPrice'){
                const that = this;
                setTimeout(() =>{
                    const ibExpQty = that._realGridsService.gfn_CellDataGetRow(
                        this.gridList,
                        this.outBoundDetailDataProvider,
                        itemIndex,'obExpQty');
                    const unitPrice = that._realGridsService.gfn_CellDataGetRow(
                        this.gridList,
                        this.outBoundDetailDataProvider,
                        itemIndex,'unitPrice');
                    that._realGridsService.gfn_CellDataSetRow(that.gridList,
                        that.outBoundDetailDataProvider,
                        itemIndex,
                        'totalAmt',
                        ibExpQty * unitPrice);
                },100);
            }

            if(this.outBoundDetailDataProvider.getOrgFieldName(field) === 'obQty'){
                const that = this;
                setTimeout(() =>{

                    const obQty = that._realGridsService.gfn_CellDataGetRow(
                        this.gridList,
                        this.outBoundDetailDataProvider,
                        itemIndex,'obQty');
                    const obExpQty = that._realGridsService.gfn_CellDataGetRow(
                        this.gridList,
                        this.outBoundDetailDataProvider,
                        itemIndex,'obExpQty');
                    that._realGridsService.gfn_CellDataSetRow(that.gridList,
                        that.outBoundDetailDataProvider,
                        itemIndex,
                        'qty',
                        obExpQty - obQty);

                },100);
            }
        });
        // 셀 edit control
        this.gridList.setCellStyleCallback((grid, dataCell) => {
            const ret = {styleName : '', editable: false};
            const obType = this.outBoundHeaderForm.getRawValue().type;
            const udiYn = grid.getValue(dataCell.index.itemIndex, 'udiYn');

            //추가시
            if (dataCell.item.rowState === 'created') {
                if (dataCell.dataColumn.fieldName === 'udiYn' ||
                    dataCell.dataColumn.fieldName === 'itemCd' ||
                    dataCell.dataColumn.fieldName === 'itemNm' ||
                    dataCell.dataColumn.fieldName === 'fomlInfo' ||
                    dataCell.dataColumn.fieldName === 'refItemNm' ||
                    dataCell.dataColumn.fieldName === 'standard' ||
                    dataCell.dataColumn.fieldName === 'unit' ||
                    dataCell.dataColumn.fieldName === 'itemGrade' ||
                    dataCell.dataColumn.fieldName === 'totalAmt' ||
                    dataCell.dataColumn.fieldName === 'invQty'||
                    dataCell.dataColumn.fieldName === 'qty') {
                } else {
                    ret.editable= true;
                }
            } else {
                //console.log(dataCell.dataColumn.renderer);
                if (dataCell.dataColumn.fieldName === 'udiYn' ||
                    dataCell.dataColumn.fieldName === 'itemCd' ||
                    dataCell.dataColumn.fieldName === 'itemNm' ||
                    dataCell.dataColumn.fieldName === 'fomlInfo' ||
                    dataCell.dataColumn.fieldName === 'refItemNm' ||
                    dataCell.dataColumn.fieldName === 'standard' ||
                    dataCell.dataColumn.fieldName === 'unit' ||
                    dataCell.dataColumn.fieldName === 'itemGrade' ||
                    dataCell.dataColumn.fieldName === 'totalAmt' ||
                    dataCell.dataColumn.fieldName === 'invQty'||
                    dataCell.dataColumn.fieldName === 'qty') {

                    this._realGridsService.gfn_PopUpBtnHide('itemGrdPopup');
                } else {
                    ret.editable= true;
                }
            }

            if (
                dataCell.dataColumn.fieldName === 'qty' ||
                dataCell.dataColumn.fieldName === 'invQty'||
                dataCell.dataColumn.fieldName === 'fomlInfo' ||
                dataCell.dataColumn.fieldName === 'refItemNm') {
            }

            const invQty = grid.getValue(dataCell.index.itemIndex, 'invQty');
            const qty = grid.getValue(dataCell.index.itemIndex, 'qty');
            if(invQty < qty){
                if (
                    dataCell.dataColumn.fieldName === 'invQty') {
                    ret.styleName = 'right-cell-text red-color';
                    ret.editable = false;
                }
            }

            if (obType === '1' || obType === '3' || obType === '5') {
                if(udiYn === 'Y'){
                    if (dataCell.dataColumn.fieldName === 'udiYn') {
                        ret.styleName = 'center-cell-text green-color';
                    }

                    if (dataCell.dataColumn.fieldName === 'obQty'){
                        ret.editable = false;
                    }
                }else {

                    if (dataCell.dataColumn.fieldName === 'obQty'){
                        ret.editable = true;
                    }
                }
            }else {

                if (dataCell.dataColumn.fieldName === 'obQty'){
                    ret.editable = true;
                }
            }

            return ret;
        });
        // eslint-disable-next-line max-len
        this._realGridsService.gfn_PopUp(this.isMobile, this.isExtraSmall, this.gridList, this.outBoundDetailDataProvider, this.outBoundDetailColumns, this._matDialogPopup, this._unsubscribeAll, this._changeDetectorRef, this.outBoundHeaderForm);
        //정렬
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                this._realGridsService.gfn_GridLoadingBar(this.gridList, this.outBoundDetailDataProvider, true);
                // eslint-disable-next-line max-len
                const rtn = this._outboundService.getDetail(this.outBoundDetailPagenation.page, this.outBoundDetailPagenation.size, clickData.column, this.orderBy, this.outBoundHeaderForm.getRawValue());
                this.loadingEnd(rtn);
            }
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };
        this.setGridData();

        this._outboundService.outBoundDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBoundDetailPagenation: OutBoundDetailPagenation) => {
                // Update the pagination
                if (outBoundDetailPagenation !== null) {
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
                if (outboundDetail !== null) {
                    outboundDetail.forEach((param) => {
                        const obType = this.outBoundHeaderForm.getRawValue().type;
                        if (obType === '1' || obType === '3' || obType === '5') {
                            if(param.udiYn === 'N'){
                                param.obQty = param.obExpQty - param.qty;
                            }else{
                                param.qty = param.obExpQty - param.obQty;
                            }
                        }else{
                            param.obQty = param.obExpQty - param.qty;
                        }
                    });
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.outBoundDetailDataProvider, outboundDetail);
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    loadingEnd(rtn: any): void {
        rtn.then(() => {
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.outBoundDetailDataProvider, false);
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


    addRow(): boolean {

        const obStatus = this.outBoundHeaderForm.controls['status'].value;
        if (obStatus !== 'N') {
            this._functionService.cfn_alert('예정 상태에서 추가할 수 있습니다.');
            return false;
        }
        const values = [
            '', '', '', '', '', '', '', '', '', '', '', '', '', 0 ,0, 0, 0, 0, 0, ''
        ];

        this._realGridsService.gfn_AddRow(this.gridList, this.outBoundDetailDataProvider, values);
    }

    delRow(): boolean {

        const obStatus = this.outBoundHeaderForm.controls['status'].value;
        if (obStatus !== 'N') {
            this._functionService.cfn_alert('예정 상태에서 삭제할 수 있습니다.');
            return false;
        }

        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.outBoundDetailDataProvider);

        if (checkValues.length < 1) {
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
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.outBoundDetailDataProvider, true);
        const rtn = this._outboundService.getDetail(this._outBoundDetailPagenator.pageIndex, this._outBoundDetailPagenator.pageSize, 'obLineNo', this.orderBy, this.outBoundHeaderForm.getRawValue());
        this.selectCallBack(rtn);
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {
            if(ex._value) {
                this._realGridsService.gfn_GridLoadingBar(this.gridList, this.outBoundDetailDataProvider, false);
            }
        });
    }

    alertMessage(param: any): void {
        if (param.status === 'SUCCESS') {
            this._functionService.cfn_alert('정상적으로 처리되었습니다.');
            this.reData();
        } else if (param.status === 'CANCEL') {

        } else {
            this._functionService.cfn_alert(param.msg);
        }
    }

    backPage(): void {
        this._router.navigate(['bound/outbound']);
    }

    reportOutbound(): void {
        const outboundDetailData = [];
        let index = 0;
        const rows = this._realGridsService.gfn_GetRows(this.gridList, this.outBoundDetailDataProvider);
        rows.forEach((data: any) => {
            if(data.refItemNm !== data.itemNm){
                data.itemNm = data.itemNm + '/' + data.refItemNm;
            }
            index++;
            outboundDetailData.push({
                no: index,
                itemNm: data.itemNm,
                fomlInfo: data.fomlInfo,
                standard: data.standard,
                unit: data.unit,
                itemGrade: data.itemGrade,
                qty: data.obExpQty,
                unitPrice: data.unitPrice,
                totalAmt: data.totalAmt,
                taxAmt: 0,
                remark: data.remarkDetail,
                tax: data.totalAmt / 10
            });
        });

        let obDate = '';
        if(this.outBoundHeaderForm.getRawValue().obDate !== 'null'){
            obDate = this.outBoundHeaderForm.getRawValue().obDate;
        }
        this.reportHeaderData.no = this.outBoundHeaderForm.getRawValue().obNo;
        this.reportHeaderData.date = obDate; // 출고일
        this.reportHeaderData.remark = this.outBoundHeaderForm.getRawValue().remarkHeader; // 비고
        this.reportHeaderData.address = this.outBoundHeaderForm.getRawValue().reportAddress;//주소
        this.reportHeaderData.deliveryAddress = this.outBoundHeaderForm.getRawValue().dlvAddress; // 낲품주소
        this.reportHeaderData.custBusinessNumber = this.outBoundHeaderForm.getRawValue().custBusinessNumber; // 사업자 등록번호
        this.reportHeaderData.custBusinessName = this.outBoundHeaderForm.getRawValue().custBusinessName; // 상호
        this.reportHeaderData.representName = this.outBoundHeaderForm.getRawValue().representName; // 성명
        this.reportHeaderData.businessCondition = this.outBoundHeaderForm.getRawValue().businessCondition; // 업태
        this.reportHeaderData.businessCategory = this.outBoundHeaderForm.getRawValue().businessCategory; // 종목
        this.reportHeaderData.phoneNumber = '0' + this.outBoundHeaderForm.getRawValue().phoneNumber; // 전화번호
        this.reportHeaderData.fax = '0' + this.outBoundHeaderForm.getRawValue().fax; // 팩스
        this.reportHeaderData.toAccountNm = this.outBoundHeaderForm.getRawValue().toAccountNm;
        this.reportHeaderData.deliveryDate = this.outBoundHeaderForm.getRawValue().dlvDate; // 납품일자

        const popup = this._matDialogPopup.open(CommonBillComponent, {
            data: {
                divisionText: '거래명세',
                division: 'OUTBOUND',
                header: this.reportHeaderData,
                body: outboundDetailData,
                tail: '',
            },
            autoFocus: false,
            maxHeight: '100vh',
            disableClose: true
        });
        popup.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this._changeDetectorRef.markForCheck();
            });
    }

    shipmentOutbound(): void {
        const outboundDetailData = [];
        let index = 0;
        const rows = this._realGridsService.gfn_GetRows(this.gridList, this.outBoundDetailDataProvider);
        rows.forEach((data: any) => {
            if(data.refItemNm !== data.itemNm){
                data.itemNm = data.itemNm + '/' + data.refItemNm;
            }
            index++;
            outboundDetailData.push({
                no: index,
                itemNm: data.itemNm,
                fomlInfo: data.fomlInfo,
                standard: data.standard,
                unit: data.unit,
                itemGrade: data.itemGrade,
                qty: data.obExpQty,
                unitPrice: data.unitPrice,
                totalAmt: data.totalAmt,
                taxAmt: 0,
                remark: data.remarkDetail,
                tax: data.totalAmt / 10
            });
        });

        let obDate = '';
        if(this.outBoundHeaderForm.getRawValue().obDate !== 'null'){
            obDate = this.outBoundHeaderForm.getRawValue().obDate;
        }
        this.reportHeaderData.no = this.outBoundHeaderForm.getRawValue().obNo;
        this.reportHeaderData.date = obDate; // 출고일
        this.reportHeaderData.dlvAddress = this.outBoundHeaderForm.getRawValue().address; // 거래처 주소
        this.reportHeaderData.remark = this.outBoundHeaderForm.getRawValue().remarkHeader; // 비고
        this.reportHeaderData.address = this.outBoundHeaderForm.getRawValue().reportAddress;//주소
        this.reportHeaderData.dlvAccountNm = this.outBoundHeaderForm.getRawValue().dlvAccountNm; // 납품처
        this.reportHeaderData.deliveryAddress = this.outBoundHeaderForm.getRawValue().dlvAddress; // 납품주소
        this.reportHeaderData.custBusinessNumber = this.outBoundHeaderForm.getRawValue().custBusinessNumber; // 사업자 등록번호
        this.reportHeaderData.custBusinessName = this.outBoundHeaderForm.getRawValue().custBusinessName; // 상호
        this.reportHeaderData.representName = this.outBoundHeaderForm.getRawValue().representName; // 성명
        this.reportHeaderData.businessCondition = this.outBoundHeaderForm.getRawValue().businessCondition; // 업태
        this.reportHeaderData.businessCategory = this.outBoundHeaderForm.getRawValue().businessCategory; // 종목
        this.reportHeaderData.phoneNumber = '0' + this.outBoundHeaderForm.getRawValue().phoneNumber; // 전화번호
        this.reportHeaderData.fax = '0' + this.outBoundHeaderForm.getRawValue().fax; // 팩스
        this.reportHeaderData.toAccountNm = this.outBoundHeaderForm.getRawValue().toAccountNm; // 거래처명
        this.reportHeaderData.deliveryDate = this.outBoundHeaderForm.getRawValue().dlvDate; // 납품일자

        const popup = this._matDialogPopup.open(CommonBillComponent, {
            data: {
                divisionText: '출하지시',
                division: 'OUTBOUND',
                header: this.reportHeaderData,
                body: outboundDetailData,
                tail: '',
                shipment: true
            },
            autoFocus: false,
            maxHeight: '100vh',
            disableClose: true
        });
        popup.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this._changeDetectorRef.markForCheck();
            });
    }

    outBoundSave(): void {
        const status = this.outBoundHeaderForm.controls['status'].value;
        //신규가 아니면 불가능
        if (status !== 'N') {
            this._functionService.cfn_alert('예정 상태에서 저장할 수 있습니다.');
            return;
        }
        if (this._realGridsService.gfn_ValidationRows(this.gridList, this._functionService)) {
            return;
        }

        if (!this.outBoundHeaderForm.invalid) {

            let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.outBoundDetailDataProvider);

            const detailCheck = false;

            // if(this.outBoundHeaderForm.untouched){
            //     this._functionService.cfn_alert('수정된 정보가 존재하지 않습니다.');
            //     detailCheck = true;
            // }
            if (detailCheck) {
                return;
            }

            const confirmation = this._teamPlatConfirmationService.open({
                title: '',
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
                    if (result) {
                        rows = this.headerDataSet(rows);
                        this._outboundService.saveOut(rows)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((outBound: any) => {
                                this._functionService.cfn_loadingBarClear();
                                this.alertMessage(outBound);
                                this._changeDetectorRef.markForCheck();
                            });
                    }
                });


            // Mark for check
            this._changeDetectorRef.markForCheck();
        } else {
            this._functionService.cfn_alert('필수값을 입력해주세요.');
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: OutBound[], outBoundHeader?: any) {
        if(sendData.length === 0){

            let obDate = '';
            if(this.outBoundHeaderForm.getRawValue().obDate === null ||
                this.outBoundHeaderForm.getRawValue().obDate.value === '' ||
                this.outBoundHeaderForm.getRawValue().obDate === undefined ||
                this.outBoundHeaderForm.getRawValue().obDate === ''){
            }else{
                obDate = this.outBoundHeaderForm.controls['obDate'].value;
            }

            sendData.push({
                account: this.outBoundHeaderForm.controls['account'].value,
                address: this.outBoundHeaderForm.controls['address'].value,
                obNo: this.outBoundHeaderForm.controls['obNo'].value,
                type: this.outBoundHeaderForm.controls['type'].value,
                status: this.outBoundHeaderForm.controls['status'].value,
                dlvAccount: this.outBoundHeaderForm.controls['dlvAccount'].value,
                dlvAddress: this.outBoundHeaderForm.controls['dlvAddress'].value,
                dlvDate: this.outBoundHeaderForm.controls['dlvDate'].value,
                remarkHeader: this.outBoundHeaderForm.controls['remarkHeader'].value,
                dlvAccountNm: '',
                itemCd: '',
                itemNm: '',
                mId: '',
                obCreDate: '',
                obDate: obDate,
                obExpQty: 0,
                obLineNo: 0,
                obQty: 0,
                qty: 0,
                remarkDetail: '',
                udiYn: '',
            });
        }else{
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < sendData.length; i++) {
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                sendData[i].account = this.outBoundHeaderForm.controls['account'].value;
                sendData[i].address = this.outBoundHeaderForm.controls['address'].value;
                sendData[i].obNo = this.outBoundHeaderForm.controls['obNo'].value;
                sendData[i].type = this.outBoundHeaderForm.controls['type'].value;
                sendData[i].status = this.outBoundHeaderForm.controls['status'].value;
                sendData[i].dlvAccount = this.outBoundHeaderForm.controls['dlvAccount'].value;
                sendData[i].dlvAddress = this.outBoundHeaderForm.controls['dlvAddress'].value;
                sendData[i].dlvDate = this.outBoundHeaderForm.controls['dlvDate'].value;
                sendData[i].remarkHeader = this.outBoundHeaderForm.controls['remarkHeader'].value;

                if(this.outBoundHeaderForm.getRawValue().obDate.value === '' ||
                    this.outBoundHeaderForm.getRawValue().obDate === undefined ||
                    this.outBoundHeaderForm.getRawValue().obDate === null ||
                    this.outBoundHeaderForm.getRawValue().obDate === ''){
                    sendData[i].obDate = '';
                }else{
                    sendData[i].obDate = this.outBoundHeaderForm.controls['obDate'].value;
                }
            }
        }

        return sendData;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    outBoundConfirm() {
        const obStatus = this.outBoundHeaderForm.controls['status'].value;
        const obType = this.outBoundHeaderForm.controls['type'].value;
        if (obStatus !== 'N' && obStatus !== 'P') {
            this._functionService.cfn_alert('예정, 작업 중 상태에서만 출고가 가능합니다.');
            return false;
        }

        let outBoundData;
        let outBoundDataFilter;
        let udiCheckData;
        let outBoundSetData;
        let rows = this._realGridsService.gfn_GetRows(this.gridList, this.outBoundDetailDataProvider);

        //수정 후
        outBoundSetData = rows.filter((detail: any) =>
            (detail.obExpQty < detail.obQty))
            .map((param: any) => param);

        if (outBoundSetData.length > 0) {
            this._functionService.cfn_alert('출고 수량이 초과됬습니다. <br> 품목코드 : ' + outBoundSetData[0].itemCd);
            return false;
        }

        let rowYs;
        let rowNs;

        rowYs = rows.filter((detail: any) => detail.qty > 0)
            .map((param: any) => param);

        rowYs = rows.filter((detail: any) => detail.udiYn === 'Y')
            .map((param: any) => param);

        rowNs = rows.filter((detail: any) => detail.obQty > 0)
            .map((param: any) => param);

        rowNs = rows.filter((detail: any) => detail.udiYn !== 'Y')
            .map((param: any) => param);

        //일반출고, 폐기, 가납출고
        if (obType === '1' || obType === '3' || obType === '5') {

            //리스트 중 하나라도 바코드 스캔 여부 Y
            if(rowYs.length > 0){

                //유효기간 체크
                this._common.sendData(this.outBoundHeaderForm.getRawValue(),'/v1/api/inOut/outBound/validity-List')
                    .subscribe((responseData: any) => {
                        if (!this._common.gfn_isNull(responseData.data)) {

                            let itemNm = '';
                            responseData.data.forEach((p) => {
                                itemNm += p.itemNm + ', ';
                            });

                            const confirmation = this._teamPlatConfirmationService.open({
                                title: '출고',
                                message: '유효기간이 만료된 품목이 존재합니다. 출고하시겠습니까? <br> '
                                    + '품목명 리스트 : ' + itemNm,
                                actions: {
                                    confirm: {
                                        label: '출고'
                                    },
                                    cancel: {
                                        label: '닫기'
                                    }
                                }
                            });

                            confirmation.afterClosed()
                                .pipe(takeUntil(this._unsubscribeAll))
                                .subscribe((result) => {
                                    if (result) {
                                        if (!this.isMobile) {
                                            const d = this._matDialog.open(OutboundScanComponent, {
                                                autoFocus: false,
                                                disableClose: true,
                                                maxHeight: '90vh',
                                                data: {
                                                    detail: rowYs,
                                                    detailN: rowNs
                                                },
                                            });
                                            d.afterClosed().subscribe(() => {
                                                this.reData();
                                            });
                                        } else {
                                            const d = this._matDialog.open(OutboundScanComponent, {
                                                data: {
                                                    detail: rowYs,
                                                    detailN: rowNs
                                                },
                                                autoFocus: false,
                                                width: 'calc(100% - 50px)',
                                                maxWidth: '100vw',
                                                maxHeight: '80vh',
                                                disableClose: true
                                            });
                                            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                                                if (size.matches) {
                                                    d.updateSize('calc(100vw - 10px)', '');
                                                } else {
                                                }
                                            });
                                            d.afterClosed().subscribe(() => {
                                                this.reData();
                                                smallDialogSubscription.unsubscribe();
                                            });
                                        }
                                    }
                                });


                        }else{
                            if (!this.isMobile) {
                                const d = this._matDialog.open(OutboundScanComponent, {
                                    autoFocus: false,
                                    disableClose: true,
                                    maxHeight: '90vh',
                                    data: {
                                        detail: rowYs,
                                        detailN: rowNs
                                    },
                                });
                                d.afterClosed().subscribe(() => {
                                    this.reData();
                                });
                            } else {
                                const d = this._matDialog.open(OutboundScanComponent, {
                                    data: {
                                        detail: rowYs,
                                        detailN: rowNs
                                    },
                                    autoFocus: false,
                                    width: 'calc(100% - 50px)',
                                    maxWidth: '100vw',
                                    maxHeight: '80vh',
                                    disableClose: true
                                });
                                const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                                    if (size.matches) {
                                        d.updateSize('calc(100vw - 10px)', '');
                                    } else {
                                    }
                                });
                                d.afterClosed().subscribe(() => {
                                    this.reData();
                                    smallDialogSubscription.unsubscribe();
                                });
                            }
                        }
                    });


            }else{
                //리스트 전부 바코드 스캔 여부 N
                this.outBoundBarcodeN(rows);
            }
        }else {

            //리스트 전부 바코드 스캔 여부 N
            this.outBoundBarcodeN(rows);
        }

        // 수정 전
        // outBoundData = rows;
        //
        // outBoundSetData = rows.filter((detail: any) =>
        //     (detail.obExpqty < detail.obqty))
        //     .map((param: any) => param);
        //
        // outBoundDataFilter = rows.filter((detail: any) => detail.udiYn !== 'Y')
        //     .map((param: any) => param);
        //
        // udiCheckData = rows.filter((detail: any) => detail.udiYn === 'Y')
        //     .map((param: any) => param);
        //
        // if (outBoundSetData.length > 0) {
        //     this._functionService.cfn_alert('출고 수량이 초과됬습니다.');
        //     return false;
        // }
        //
        // if (outBoundData.length < 1) {
        //     this._functionService.cfn_alert('출고 수량이 존재하지 않습니다.');
        //     return false;
        // } else {
        //     //일반출고, 폐기, 가납출고
        //     if (obType === '1' || obType === '3' || obType === '5') {
        //         if (udiCheckData.length > 0) {
        //             //UDI 체크 로우만 나오게 하고 , outBoundData 는 숨기기
        //             //입력 수량 그대로 가져오기
        //             //UDI 정보 INPUT 후 값 셋팅
        //
        //             const popup = this._matDialogPopup.open(CommonUdiScanComponent, {
        //                 data: {
        //                     detail: udiCheckData
        //                 },
        //                 autoFocus: false,
        //                 maxHeight: '90vh',
        //                 disableClose: true
        //             });
        //             popup.afterClosed().subscribe((result) => {
        //                 if (result) {
        //                     if (result !== undefined) {
        //                         // eslint-disable-next-line @typescript-eslint/prefer-for-of
        //                         for (let i = 0; i < result.length; i++) {
        //                             const qty = result[i].obQty;
        //                             result[i].obQty = result[i].qty;
        //                             result[i].qty = qty;
        //                             outBoundDataFilter.push(result[i]);
        //                         }
        //                         this.outBoundCall(outBoundDataFilter);
        //                     }
        //                 }
        //             });
        //         } else {
        //             this.outBoundCall(outBoundData);
        //         }
        //     } else {
        //         this.outBoundCall(outBoundData);
        //     }
        // }
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    outBoundBarcodeN(outBoundData: OutBound[]){

        //유효기간 체크
        this._common.sendData(this.outBoundHeaderForm.getRawValue(),'/v1/api/inOut/outBound/validity-List')
            .subscribe((responseData: any) => {
                if(!this._common.gfn_isNull(responseData.data)){

                    let itemNm = '';
                    responseData.data.forEach((p) => {
                        itemNm += p.itemNm + ', ';
                    });

                    const confirmation = this._teamPlatConfirmationService.open({
                        title: '출고',
                        message: '유효기간이 만료된 품목이 존재합니다. 출고하시겠습니까? <br> '
                                    + '품목명 리스트 : ' + itemNm,
                        actions: {
                            confirm: {
                                label: '출고'
                            },
                            cancel: {
                                label: '닫기'
                            }
                        }
                    });
                    outBoundData = outBoundData.filter((outBound: any) => outBound.obQty > 0).map((param: any) => param);

                    const rows = this.headerDataSet(outBoundData);
                    confirmation.afterClosed()
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((result) => {
                            if (result) {
                                this._outboundService.outBoundBarcodeN(rows)
                                    .pipe(takeUntil(this._unsubscribeAll))
                                    .subscribe((outBound: any) => {
                                        this._functionService.cfn_loadingBarClear();
                                        this.alertMessage(outBound);
                                        // Mark for check
                                        this._changeDetectorRef.markForCheck();
                                    });
                            }
                        });

                }else{
                    const confirmation = this._teamPlatConfirmationService.open({
                        title: '출고',
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
                    outBoundData = outBoundData.filter((outBound: any) => outBound.obQty > 0).map((param: any) => param);

                    const rows = this.headerDataSet(outBoundData);
                    confirmation.afterClosed()
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((result) => {
                            if (result) {
                                this._outboundService.outBoundBarcodeN(rows)
                                    .pipe(takeUntil(this._unsubscribeAll))
                                    .subscribe((outBound: any) => {
                                        this._functionService.cfn_loadingBarClear();
                                        this.alertMessage(outBound);
                                        // Mark for check
                                        this._changeDetectorRef.markForCheck();
                                    });
                            }
                        });
                }
            });



    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    outBoundCall(outBoundData: OutBound[]) {
        const confirmation = this._teamPlatConfirmationService.open({
            title: '출고',
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
            outBound.lot4 = outBound.udiCode;
        });
        outBoundData = outBoundData.filter((outBound: any) => outBound.obQty > 0).map((param: any) => param);
        confirmation.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if (result) {
                    this.outBoundDetailConfirm(outBoundData);
                }
            });
    }

    /* 출고 (상세)
     *
     * @param sendData
     */
    outBoundDetailConfirm(sendData: OutBound[]): void {
        if (sendData) {
            const rows = this.headerDataSet(sendData);
            this._outboundService.outBoundDetailConfirm(rows)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((outBound: any) => {
                    this._functionService.cfn_loadingBarClear();
                    this.alertMessage(outBound);
                    //this._functionService.cfn_alertCheckMessage(outBound);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        }
    }

    //데이터 재 로딩
    reData(): void {
        const searchForm = {
            obNo:  this.outBoundHeaderForm.getRawValue().obNo
        };
        const header = this._outboundService.getHeader(0, 1, '', this.orderBy, searchForm);
        header.then((ex) => {
            if(ex.outBoundHeader.length === 1){
                this.outBoundHeaderForm.patchValue(
                    ex.outBoundHeader[0]
                );
                this._changeDetectorRef.markForCheck();
            }
        }).then((ex) =>{
            this._outboundService.getDetail(0, 100, 'obLineNo', 'asc', this.outBoundHeaderForm.getRawValue());

            this.setGridData();
            this._outboundService.outBoundDetailPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((outBoundDetailPagenation: OutBoundDetailPagenation) => {
                    // Update the pagination
                    if (outBoundDetailPagenation !== null) {
                        this.outBoundDetailPagenation = outBoundDetailPagenation;
                    }
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        });
    }

    openDlvAccountCancel(): void {
        this.outBoundHeaderForm.patchValue({'dlvAccount': ''});
        this.outBoundHeaderForm.patchValue({'dlvAccountNm': ''});
        this.outBoundHeaderForm.patchValue({'dlvAddress': ''});
    }

    openDlvAccountSearch(): void {
        if (!this.isMobile) {
            const popup = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup: 'P$_DLVACCOUNT',
                    headerText: '납품처 조회'
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });

            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        this.outBoundHeaderForm.patchValue({'dlvAccount': result.accountCd});
                        this.outBoundHeaderForm.patchValue({'dlvAccountNm': result.accountNm});
                        this.outBoundHeaderForm.patchValue({'dlvAddress': result.address});
                    }
                });
        } else {
            const popup = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup: 'P$_ACCOUNT',
                    headerText: '납품처 조회'
                },
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    popup.updateSize('calc(100vw - 10px)', '');
                } else {
                    // d.updateSize('calc(100% - 50px)', '');
                }
            });
            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        smallDialogSubscription.unsubscribe();
                        this.outBoundHeaderForm.patchValue({'dlvAccount': result.accountCd});
                        this.outBoundHeaderForm.patchValue({'dlvAccountNm': result.accountNm});
                        this.outBoundHeaderForm.patchValue({'dlvAddress': result.address});
                    }
                });
        }
    }

    priceToString(price): string {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    outboundScan() {

    }
}
