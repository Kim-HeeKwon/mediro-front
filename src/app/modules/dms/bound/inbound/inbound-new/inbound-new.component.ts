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
import {Observable, Subject} from 'rxjs';
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
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import {FunctionService} from '../../../../../../@teamplat/services/function';
import {DeviceDetectorService} from 'ngx-device-detector';
import {InboundService} from '../inbound.service';
import {takeUntil} from 'rxjs/operators';
import {InBound} from '../inbound.types';
import {CommonPopupItemsComponent} from '../../../../../../@teamplat/components/common-popup-items';

@Component({
    selector: 'app-dms-inbound-new',
    templateUrl: './inbound-new.component.html',
    styleUrls: ['./inbound-new.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class InboundNewComponent implements OnInit, OnDestroy, AfterViewInit {
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
    inBoundHeaders: any;
    inBoundDetails: any;
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
        {fieldName: 'ibLineNo', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'ibExpQty', dataType: ValueType.NUMBER},
        {fieldName: 'qty', dataType: ValueType.NUMBER},
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
        this.filterList = ['ALL', '1', '2'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data, 'IB_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data, 'IB_STATUS', this.filterList);
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_GRADE');
        this.isMobile = this._deviceService.isMobile();

        if (this._router.getCurrentNavigation() !== (null && undefined)) {

            if (this._router.getCurrentNavigation().extras.state !== undefined) {
                if (this._router.getCurrentNavigation().extras.state.header !== undefined
                    && this._router.getCurrentNavigation().extras.state.detail !== undefined) {
                    //console.log(this._router.getCurrentNavigation().extras.state.header);
                    const header = this._router.getCurrentNavigation().extras.state.header;
                    const detail = this._router.getCurrentNavigation().extras.state.detail;
                    this.inBoundHeaders = header;
                    this.inBoundDetails = detail;
                    this.type = _utilService.commonValueFilter(_codeStore.getValue().data, 'IB_TYPE', ['ALL']);
                }
            }
            this._changeDetectorRef.markForCheck();
        }
    }

    ngOnInit(): void {
        // Form 생성
        this.inBoundHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            ibNo: [{value: '', disabled: true}],   // 입고번호
            account: [{value: ''}, [Validators.required]], // 거래처 코드
            accountNm: [{value: '', disabled: true}],   // 거래처 명
            type: [{value: ''}, [Validators.required]],   // 유형
            status: [{value: '', disabled: true}, [Validators.required]],   // 상태
            supplier: [{value: ''}],   // 공급사
            supplierNm: [{value: '', disabled: true}],   // 공급사 명
            ibCreDate: [{value: '', disabled: true}],//작성일
            ibDate: [{value: '', disabled: true}], //입고일
            remarkHeader: [''], //비고
            poNo: [{value: '', disabled: true}],   // 발주번호
            active: [false]  // cell상태
        });
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
                editor: this._realGridsService.gfn_ComboBox(this.itemGrades),
            },
            {
                name: 'ibExpQty', fieldName: 'ibExpQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '입고대상수량', styleName: 'center-cell-text'}
                , numberFormat: '#,##0'
            },
            // {
            //     name: 'qty', fieldName: 'qty', type: 'data', width: '100', styleName: 'right-cell-text'
            //     , header: {text: '수량', styleName: 'center-cell-text'}
            //     , numberFormat: '#,##0'
            // },
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
            if (dataCell.dataColumn.fieldName === 'itemCd' ||
                dataCell.dataColumn.fieldName === 'itemNm' ||
                dataCell.dataColumn.fieldName === 'standard' ||
                dataCell.dataColumn.fieldName === 'unit' ||
                dataCell.dataColumn.fieldName === 'itemGrade'||
                dataCell.dataColumn.fieldName === 'totalAmt') {
                return {editable: false};
            } else {
                return {editable: true};
            }
        });
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellEdited = ((grid, itemIndex, row, field) => {
            if(this.inBoundDetailDataProvider.getOrgFieldName(field) === 'ibExpQty' ||
                this.inBoundDetailDataProvider.getOrgFieldName(field) === 'unitPrice'){
                const that = this;
                setTimeout(() =>{
                    const qty = that._realGridsService.gfn_CellDataGetRow(
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
                        qty * unitPrice);
                },100);
            }
        });
        // eslint-disable-next-line max-len
        this._realGridsService.gfn_PopUp(this.isMobile, this.isExtraSmall, this.gridList, this.inBoundDetailDataProvider, this.inBoundDetailColumns, this._matDialogPopup, this._unsubscribeAll, this._changeDetectorRef);
        this.inBoundDetails$ = this._inboundService.inBoundDetails$;

        if (this.inBoundHeaders !== undefined) {
            this.inBoundHeaderForm.controls.type.disable();
            this.inBoundHeaderForm.controls.account.disable();
            this.inBoundHeaderForm.patchValue({'account': this.inBoundHeaders.account});
            this.inBoundHeaderForm.patchValue({'accountNm': this.inBoundHeaders.accountNm});
            this.inBoundHeaderForm.patchValue({'type': '2'});
            this.inBoundHeaderForm.patchValue({'status': 'N'});
            this.inBoundHeaderForm.patchValue({'supplier': ''});
            this.inBoundHeaderForm.patchValue({'poNo': ''});
            this.inBoundHeaderForm.patchValue({'remarkHeader': this.inBoundHeaders.remarkHeader});

        } else {
            this.inBoundHeaderForm.patchValue({'account': ''});
            this.inBoundHeaderForm.patchValue({'type': '1'});
            this.inBoundHeaderForm.patchValue({'status': 'N'});
            this.inBoundHeaderForm.patchValue({'supplier': ''});
            this.inBoundHeaderForm.patchValue({'remarkHeader': ''});
            this.inBoundHeaderForm.patchValue({'poNo': ''});
        }

        if (this.inBoundDetails !== undefined) {
            this.inBoundDetails$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((inBoundDetail) => {
                    inBoundDetail = [];
                    this.inBoundDetails.forEach((salesorderDetail: any) => {
                        inBoundDetail.push({
                            no: inBoundDetail.length + 1,
                            flag: 'C',
                            ibLineNo: 0,
                            itemCd: salesorderDetail.itemCd,
                            itemNm: salesorderDetail.itemNm,
                            itemGrade: salesorderDetail.itemGrade,
                            standard: salesorderDetail.standard,
                            unit: salesorderDetail.unit,
                            ibExpQty: salesorderDetail.qty,
                            qty: 0,
                            unitPrice: salesorderDetail.unitPrice,
                            totalAmt: salesorderDetail.soAmt,
                            lot1: '',
                            lot2: '',
                            lot3: '',
                            lot4: '',
                            lot5: '',
                            lot6: '',
                            lot7: '',
                            lot8: '',
                            lot9: '',
                            lot10: '',
                            remarkDetail: salesorderDetail.remarkDetail,
                            ibQty: 0,
                            poLineNo: 0,
                            poNo: '',
                            udiYn: ''
                        });
                    });
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.inBoundDetailDataProvider, inBoundDetail);
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
        this._realGridsService.gfn_Destory(this.gridList, this.inBoundDetailDataProvider);
    }

    addRow(): void {

        const values = [
            '', '', '', '', '', '', 0, 0, 0, 0, '', '', '', '', '', '', '', '', '', '', ''
        ];

        this._realGridsService.gfn_AddRow(this.gridList, this.inBoundDetailDataProvider, values);
    }

    delRow(): void {

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

    inBoundSave(): void {
        const status = this.inBoundHeaderForm.controls['status'].value;
        if (this._realGridsService.gfn_ValidationRows(this.gridList, this._functionService)) {
            return;
        }

        if (!this.inBoundHeaderForm.invalid) {

            let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.inBoundDetailDataProvider);

            let detailCheck = false;

            if (rows.length === 0) {
                this._functionService.cfn_alert('수정된 행이 존재하지 않습니다.');
                detailCheck = true;
            }
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
                        this._inboundService.createIn(rows)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((inBound: any) => {
                                this.isProgressSpinner = true;
                                this.alertMessage(inBound);
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

    /* 트랜잭션 전 data Set
     * @param sendData
     */

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: InBound[]) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < sendData.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            sendData[i].account = this.inBoundHeaderForm.controls['account'].value;
            sendData[i].poNo = '';
            sendData[i].type = this.inBoundHeaderForm.controls['type'].value;
            sendData[i].status = this.inBoundHeaderForm.controls['status'].value;
            sendData[i].supplier = this.inBoundHeaderForm.controls['supplier'].value;
            sendData[i].remarkHeader = this.inBoundHeaderForm.controls['remarkHeader'].value;
        }
        return sendData;
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

    openAccountSearch(): void {
        if (!this.isMobile) {

            const popup = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup: 'P$_ACCOUNT',
                    headerText: '거래처 조회',
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });

            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        this.inBoundHeaderForm.patchValue({'account': result.accountCd});
                        this.inBoundHeaderForm.patchValue({'accountNm': result.accountNm});
                        this.inBoundHeaderForm.patchValue({'email': result.email});
                        this._changeDetectorRef.markForCheck();
                    }
                });
        } else {
            const popup = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup: 'P$_ACCOUNT',
                    headerText: '거래처 조회'
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
                }
            });
            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        smallDialogSubscription.unsubscribe();
                        this.inBoundHeaderForm.patchValue({'account': result.accountCd});
                        this.inBoundHeaderForm.patchValue({'accountNm': result.accountNm});
                        this.inBoundHeaderForm.patchValue({'email': result.email});
                    }
                });
        }
    }
}
