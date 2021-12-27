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
import {InBoundDetail, InBoundDetailPagenation} from '../inbound.types';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {Columns} from '../../../../../../@teamplat/services/realgrid/realgrid.types';
import {FuseRealGridService} from '../../../../../../@teamplat/services/realgrid';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {InboundService} from '../inbound.service';
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import {FunctionService} from '../../../../../../@teamplat/services/function';
import {DeviceDetectorService} from 'ngx-device-detector';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {InBound} from '../inbound.types';
import {CommonUdiRtnScanComponent} from '../../../../../../@teamplat/components/common-udi-rtn-scan';

@Component({
    selector: 'app-dms-inbound-detail',
    templateUrl: './inbound-detail.component.html',
    styleUrls: ['./inbound-detail.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class InboundDetailComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator, {static: true}) private _inBoundDetailPagenator: MatPaginator;
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

    inBoundHeaderForm: FormGroup;
    inBoundDetailPagenation: InBoundDetailPagenation | null = null;
    inBoundDetails$ = new Observable<InBoundDetail[]>();
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gridList: RealGrid.GridView;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    inBoundDetailColumns: Columns[];
    // @ts-ignore
    inBoundDetailDataProvider: RealGrid.LocalDataProvider;
    inBoundDetailFields: DataFieldObject[] = [
        {fieldName: 'ibNo', dataType: ValueType.TEXT},
        {fieldName: 'ibLineNo', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'udiYn', dataType: ValueType.TEXT},
        {fieldName: 'udiCode', dataType: ValueType.TEXT},
        {fieldName: 'ibExpQty', dataType: ValueType.NUMBER},
        {fieldName: 'qty', dataType: ValueType.NUMBER},
        {fieldName: 'ibQty', dataType: ValueType.NUMBER},
        {fieldName: 'unitPrice', dataType: ValueType.NUMBER},
        {fieldName: 'totalAmt', dataType: ValueType.NUMBER},
        {fieldName: 'lot1', dataType: ValueType.TEXT},
        {fieldName: 'lot2', dataType: ValueType.TEXT},
        {fieldName: 'lot3', dataType: ValueType.TEXT},
        {fieldName: 'lot4', dataType: ValueType.TEXT},
        {fieldName: 'lot5', dataType: ValueType.TEXT},
        {fieldName: 'lot6', dataType: ValueType.TEXT},
        {fieldName: 'lot7', dataType: ValueType.TEXT},
        {fieldName: 'lot8', dataType: ValueType.TEXT},
        {fieldName: 'lot9', dataType: ValueType.TEXT},
        {fieldName: 'lot10', dataType: ValueType.TEXT},
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
        private _inboundService: InboundService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _functionService: FunctionService,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver) {
        this.filterList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data, 'IB_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data, 'IB_STATUS', this.filterList);
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_GRADE');
        this.isMobile = this._deviceService.isMobile();
    }

    /**
     * On init
     */
    ngOnInit(): void {
        // Form 생성
        this.inBoundHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            ibNo: [{value: '', disabled: true}],   // 입고번호
            account: [{value: '', disabled: true}, [Validators.required]], // 거래처 코드
            accountNm: [{value: '', disabled: true}],   // 거래처 명
            type: [{value: '', disabled: true}, [Validators.required]],   // 유형
            status: [{value: '', disabled: true}, [Validators.required]],   // 상태
            supplier: [{value: '', disabled: true}],   // 공급사
            supplierNm: [{value: '', disabled: true}],   // 공급사 명
            ibCreDate: [{value: '', disabled: true}],//작성일
            ibDate: [{value: '', disabled: true}], //입고일
            remarkHeader: [''], //비고
            poNo: [{value: '', disabled: true}],   // 발주번호
            active: [false]  // cell상태
        });

        if (this._activatedRoute.snapshot.paramMap['params'] !== (null || undefined)) {
            this.inBoundHeaderForm.patchValue(
                this._activatedRoute.snapshot.paramMap['params']
            );

            this._inboundService.getDetail(0, 20, 'ibLineNo', 'asc', this.inBoundHeaderForm.getRawValue());
        }
        //페이지 라벨
        this._inBoundDetailPagenator._intl.itemsPerPageLabel = '';
        const valuesItemGrades = [];
        const lablesItemGrades = [];
        this.itemGrades.forEach((param: any) => {
            valuesItemGrades.push(param.id);
            lablesItemGrades.push(param.name);
        });

        //그리드 컬럼
        this.inBoundDetailColumns = [
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'center-cell-text'}
                , renderer: 'itemGrdPopup'
                , popUpObject:
                    {
                        popUpId: 'P$_ALL_ITEM',
                        popUpHeaderText: '품목 조회',
                        popUpDataSet: 'itemCd:itemCd|itemNm:itemNm|' +
                            'standard:standard|unit:unit|itemGrade:itemGrade'
                    }
            },
            {
                name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '품목명', styleName: 'center-cell-text'}
            },
            {
                name: 'standard', fieldName: 'standard', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '규격', styleName: 'center-cell-text'}
            },
            {
                name: 'unit', fieldName: 'unit', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '단위', styleName: 'center-cell-text'}
            },
            {
                name: 'itemGrade', fieldName: 'itemGrade', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '품목등급', styleName: 'center-cell-text'},
                values: valuesItemGrades,
                labels: lablesItemGrades,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.status),
            },
            {
                name: 'ibExpQty', fieldName: 'ibExpQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '입고예정수량', styleName: 'center-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'ibQty', fieldName: 'ibQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '입고수량', styleName: 'center-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'qty', fieldName: 'qty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '미입고수량', styleName: 'center-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'unitPrice', fieldName: 'unitPrice', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '단가', styleName: 'center-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'totalAmt', fieldName: 'totalAmt', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '금액', styleName: 'center-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'lot2', fieldName: 'lot2', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '유효기간', styleName: 'center-cell-text'}
            },
            {
                name: 'lot3', fieldName: 'lot3', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '제조사 lot', styleName: 'center-cell-text'}
            },
            {
                name: 'lot4', fieldName: 'lot4', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: 'UDI No.', styleName: 'center-cell-text'}
            },
            {
                name: 'remarkDetail', fieldName: 'remarkDetail', type: 'data', width: '300', styleName: 'left-cell-text'
                , header: {text: '비고', styleName: 'center-cell-text'}
            },
        ];
        //그리드 Provider
        this.inBoundDetailDataProvider = this._realGridsService.gfn_CreateDataProvider(true);
        //그리드 옵션
        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.inBoundDetailDataProvider,
            'inBoundDetailGrid',
            this.inBoundDetailColumns,
            this.inBoundDetailFields,
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

        // 셀 edit control
        this.gridList.setCellStyleCallback((grid, dataCell) => {

            //추가시
            if (dataCell.item.rowState === 'created') {
                if (dataCell.dataColumn.fieldName === 'itemCd' ||
                    dataCell.dataColumn.fieldName === 'itemNm' ||
                    dataCell.dataColumn.fieldName === 'standard' ||
                    dataCell.dataColumn.fieldName === 'unit' ||
                    dataCell.dataColumn.fieldName === 'itemGrade' ||
                    dataCell.dataColumn.fieldName === 'totalAmt' ||
                    dataCell.dataColumn.fieldName === 'ibQty' ||
                    dataCell.dataColumn.fieldName === 'qty') {
                    return {editable: false};
                } else {
                    return {editable: true};
                }
            } else {
                //console.log(dataCell.dataColumn.renderer);
                if (dataCell.dataColumn.fieldName === 'itemCd' ||
                    dataCell.dataColumn.fieldName === 'itemNm' ||
                    dataCell.dataColumn.fieldName === 'standard' ||
                    dataCell.dataColumn.fieldName === 'unit' ||
                    dataCell.dataColumn.fieldName === 'itemGrade'||
                    dataCell.dataColumn.fieldName === 'totalAmt' ||
                    dataCell.dataColumn.fieldName === 'qty') {

                    this._realGridsService.gfn_PopUpBtnHide('itemGrdPopup');
                    return {editable: false};
                } else {
                    return {editable: true};
                }
            }

            if (dataCell.dataColumn.fieldName === 'poReqQty' ||
                dataCell.dataColumn.fieldName === 'invQty' ||
                dataCell.dataColumn.fieldName === 'qty') {
                return {editable: false};
            }
        });
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellEdited = ((grid, itemIndex, row, field) => {
            if(this.inBoundDetailDataProvider.getOrgFieldName(field) === 'ibExpQty' ||
                this.inBoundDetailDataProvider.getOrgFieldName(field) === 'unitPrice'){
                const that = this;
                setTimeout(() =>{
                    const ibExpQty = that._realGridsService.gfn_CellDataGetRow(
                        this.gridList,
                        this.inBoundDetailDataProvider,
                        itemIndex,'ibExpQty');
                    const unitPrice = that._realGridsService.gfn_CellDataGetRow(
                        this.gridList,
                        this.inBoundDetailDataProvider,
                        itemIndex,'unitPrice');
                    that._realGridsService.gfn_CellDataSetRow(that.gridList,
                        that.inBoundDetailDataProvider,
                        itemIndex,
                        'totalAmt',
                        ibExpQty * unitPrice);
                },100);
            }
        });
        // eslint-disable-next-line max-len
        this._realGridsService.gfn_PopUp(this.isMobile, this.isExtraSmall, this.gridList, this.inBoundDetailDataProvider, this.inBoundDetailColumns, this._matDialogPopup, this._unsubscribeAll, this._changeDetectorRef);
        //정렬
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                // eslint-disable-next-line max-len
                this._inboundService.getDetail(this.inBoundDetailPagenation.page, this.inBoundDetailPagenation.size, clickData.column, this.orderBy, this.inBoundHeaderForm.getRawValue());
            }
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };

        this.setGridData();

        this._inboundService.inBoundDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBoundDetailPagenation: InBoundDetailPagenation) => {
                // Update the pagination
                this.inBoundDetailPagenation = inBoundDetailPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    setGridData(): void {
        this.inBoundDetails$ = this._inboundService.inBoundDetails$;
        this._inboundService.inBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inboundDetail: any) => {
                // Update the counts
                if (inboundDetail !== null) {

                    inboundDetail.forEach((param) => {
                        param.ibQty = param.ibExpQty - param.qty;
                    });
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.inBoundDetailDataProvider, inboundDetail);

                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    ngAfterViewInit(): void {

        merge(this._inBoundDetailPagenator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._inboundService.getDetail(this._inBoundDetailPagenator.pageIndex, this._inBoundDetailPagenator.pageSize, 'ibLineNo', this.orderBy, this.inBoundHeaderForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.inBoundDetailDataProvider);
    }

    addRow(): boolean {

        const ibStatus = this.inBoundHeaderForm.controls['status'].value;
        if (ibStatus !== 'N') {
            this._functionService.cfn_alert('추가할 수 없는 상태입니다.');
            return false;
        }
        const values = [
            '', '', '', '', '', '', '', '', '', 0, 0, 0, 0, 0, '', '', '', '', '', '', '', '', '', '', ''
        ];

        this._realGridsService.gfn_AddRow(this.gridList, this.inBoundDetailDataProvider, values);
    }

    delRow(): boolean {

        const ibStatus = this.inBoundHeaderForm.controls['status'].value;
        if (ibStatus !== 'N') {
            this._functionService.cfn_alert('삭제할 수 없는 상태입니다.');
            return false;
        }
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.inBoundDetailDataProvider);

        if (checkValues.length < 1) {
            this._functionService.cfn_alert('삭제 대상을 선택해주세요.');
            return;
        }

        this._realGridsService.gfn_DelRow(this.gridList, this.inBoundDetailDataProvider);
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '입고 상세목록');
    }

    //페이징
    pageEvent($event: PageEvent): void {
        // eslint-disable-next-line max-len
        this._inboundService.getDetail(this._inBoundDetailPagenator.pageIndex, this._inBoundDetailPagenator.pageSize, 'ibLineNo', this.orderBy, this.inBoundHeaderForm.getRawValue());
    }

    alertMessage(param: any): void {
        if (param.status !== 'SUCCESS') {
            this.isProgressSpinner = false;
            this._functionService.cfn_alert(param.msg);
        } else {
            this.backPage();
        }
    }

    backPage(): void {
        this._router.navigate(['bound/inbound']);
    }

    inBoundSave(): void {
        const status = this.inBoundHeaderForm.controls['status'].value;
        if (this._realGridsService.gfn_ValidationRows(this.gridList, this._functionService)) {
            return;
        }

        if (!this.inBoundHeaderForm.invalid) {

            let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.inBoundDetailDataProvider);

            let detailCheck = false;

            // if(this.inBoundHeaderForm.untouched){
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
                        this._inboundService.saveIn(rows)
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

        } else {
            this._functionService.cfn_alert('필수값을 입력해주세요.');
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: InBound[], inBoundHeader?: any) {
        if(sendData.length === 0){
            sendData.push({
                account: this.inBoundHeaderForm.controls['account'].value,
                ibNo: this.inBoundHeaderForm.controls['ibNo'].value,
                type: this.inBoundHeaderForm.controls['type'].value,
                status: this.inBoundHeaderForm.controls['status'].value,
                supplier: this.inBoundHeaderForm.controls['supplier'].value,
                remarkHeader: this.inBoundHeaderForm.controls['remarkHeader'].value,
                ibCreDate: '',
                ibDate: '',
                ibExpQty: 0,
                ibLineNo: 0,
                ibQty: 0,
                itemCd: '',
                itemGrade: '',
                itemNm: '',
                lot1: '',
                lot10: '',
                lot2: '',
                lot3: '',
                lot4: '',
                lot5: '',
                lot6: '',
                lot7: '',
                lot8: '',
                lot9: '',
                mId: '',
                poLineNo: 0,
                poNo: '',
                qty: 0,
                remarkDetail: '',
                standard: '',
                supplierNm: '',
                totalAmt: 0,
                udiYn: '',
                unit: '',
                unitPrice: 0,
            });
        }else{

            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < sendData.length; i++) {
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                sendData[i].account = this.inBoundHeaderForm.controls['account'].value;
                sendData[i].ibNo = this.inBoundHeaderForm.controls['ibNo'].value;
                sendData[i].type = this.inBoundHeaderForm.controls['type'].value;
                sendData[i].status = this.inBoundHeaderForm.controls['status'].value;
                sendData[i].supplier = this.inBoundHeaderForm.controls['supplier'].value;
                sendData[i].remarkHeader = this.inBoundHeaderForm.controls['remarkHeader'].value;
            }
        }
        return sendData;
    }

    inBoundConfirm() {
        const ibStatus = this.inBoundHeaderForm.controls['status'].value;
        const ibType = this.inBoundHeaderForm.controls['type'].value;
        if (ibStatus !== 'N' && ibStatus !== 'P' && ibStatus !== 'S') {
            this._functionService.cfn_alert('입고할 수 없는 상태입니다.');
            this.isProgressSpinner = false;
            return false;
        }
        let inBoundData;
        let inBoundSetData;
        let inBoundDataFilter;
        let udiCheckData;
        const rows = this._realGridsService.gfn_GetRows(this.gridList, this.inBoundDetailDataProvider);

        // inBoundData = rows.filter((detail: any) => detail.ibQty > 0)
        //     .map((param: any) => param);

        inBoundData = rows;

        inBoundSetData = rows.filter((detail: any) =>
            (detail.ibExpqty <= detail.ibqty))
            .map((param: any) => param);


        inBoundDataFilter = rows.filter((detail: any) => detail.udiYn !== 'Y')
            .map((param: any) => param);

        udiCheckData = rows.filter((detail: any) => detail.udiYn === 'Y')
            .map((param: any) => param);

        if (inBoundSetData.length > 0) {
            this._functionService.cfn_alert('입고 수량이 초과됬습니다.');
            this.isProgressSpinner = false;
            return false;
        }

        // if (inBoundData.length < 1) {
        //     this._functionService.cfn_alert('입력 수량이 존재하지 않습니다.');
        //     this.isProgressSpinner = false;
        //     return false;
        // }

        //반품일 경우
        if (ibType === '2') {
            if (udiCheckData.length > 0) {
                //UDI 체크 로우만 나오게 하고 , outBoundData 는 숨기기
                //입력 수량 그대로 가져오기
                //UDI 정보 INPUT 후 값 셋팅
                const popup = this._matDialogPopup.open(CommonUdiRtnScanComponent, {
                    data: {
                        detail: udiCheckData
                    },
                    autoFocus: false,
                    maxHeight: '90vh',
                    disableClose: true
                });

                popup.afterClosed().subscribe((result) => {
                    if (result) {
                        if (result !== undefined) {
                            // eslint-disable-next-line @typescript-eslint/prefer-for-of
                            for (let i = 0; i < result.length; i++) {
                                inBoundDataFilter.push(result[i]);
                            }

                            const conf = this._teamPlatConfirmationService.open({
                                title: '입고',
                                message: '입고하시겠습니까?',
                                actions: {
                                    confirm: {
                                        label: '입고'
                                    },
                                    cancel: {
                                        label: '닫기'
                                    }
                                }
                            });
                            //lot 셋팅
                            inBoundDataFilter.forEach((inBound: any) => {
                                inBound.ibQty = inBound.qty;
                                inBound.lot4 = inBound.udiCode;
                            });
                            inBoundDataFilter = inBoundDataFilter.filter((inBound: any) => inBound.qty > 0).map((param: any) => param);
                            conf.afterClosed()
                                .pipe(takeUntil(this._unsubscribeAll))
                                .subscribe((rtn) => {
                                    this.isProgressSpinner = true;
                                    if (rtn) {
                                        this.inBoundDetailConfirm(inBoundDataFilter);
                                    }
                                });
                        }
                    }
                });
            } else {
                const confirmation = this._teamPlatConfirmationService.open({
                    title: '입고',
                    message: '입고하시겠습니까?',
                    actions: {
                        confirm: {
                            label: '입고'
                        },
                        cancel: {
                            label: '닫기'
                        }
                    }
                });
                confirmation.afterClosed()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result) => {
                        this.isProgressSpinner = false;
                        if (result) {
                            this.inBoundDetailConfirm(inBoundData);
                        }
                    });
            }
        } else {
            const confirmation = this._teamPlatConfirmationService.open({
                title: '입고',
                message: '입고하시겠습니까?',
                actions: {
                    confirm: {
                        label: '입고'
                    },
                    cancel: {
                        label: '닫기'
                    }
                }
            });
            confirmation.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    this.isProgressSpinner = false;
                    if (result) {
                        this.inBoundDetailConfirm(inBoundData);
                    }
                });
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();

    }

    /* 입고 (상세)
     *
     * @param sendData
     */

    inBoundDetailConfirm(sendData: InBound[]): void {
        this.isProgressSpinner = false;
        if (sendData) {
            const rows = this.headerDataSet(sendData);
            this._inboundService.inBoundDetailConfirm(rows)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((inBound: any) => {
                    this._functionService.cfn_alertCheckMessage(inBound);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        }
    }
}
