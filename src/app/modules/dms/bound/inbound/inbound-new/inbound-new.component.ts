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
import {formatDate} from "@angular/common";
import {ItemSelectComponent} from "../../../../../../@teamplat/components/item-select";

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
        {fieldName: 'fomlInfo', dataType: ValueType.TEXT},
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
        this.filterList = ['ALL'];
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
        // Form ??????
        this.inBoundHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // ?????????
            ibNo: [{value: '', disabled: true}],   // ????????????
            account: [{value: '', disabled: true}, [Validators.required]], // ????????? ??????
            accountNm: [{value: '', disabled: true}],   // ????????? ???
            type: [{value: ''}, [Validators.required]],   // ??????
            status: [{value: '', disabled: true}, [Validators.required]],   // ??????
            supplier: [{value: ''}],   // ?????????
            supplierNm: [{value: '', disabled: true}],   // ????????? ???
            ibCreDate: [{value: '', disabled: true}],//?????????
            ibDate: [{value: '', disabled: false}, [Validators.required]], //?????????
            remarkHeader: [''], //??????
            ibAmt: [{value: '', disabled: true}],   // ??????
            poNo: [{value: '', disabled: true}],   // ????????????
            active: [false]  // cell??????
        });
        //????????? ??????
        this._inBoundDetailPagenator._intl.itemsPerPageLabel = '';

        const valuesItemGrades = [];
        const lablesItemGrades = [];
        this.itemGrades.forEach((param: any) => {
            valuesItemGrades.push(param.id);
            lablesItemGrades.push(param.name);
        });

        //????????? ??????
        this.inBoundDetailColumns = [
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text red-font-color'}
                , renderer: 'itemGrdPopup'
                , popUpObject:
                    {
                        popUpId: 'P$_ALL_ITEM',
                        popUpHeaderText: '?????? ??????',
                        popUpDataSet: 'itemCd:itemCd|itemNm:itemNm|fomlInfo:fomlInfo|' +
                            'standard:standard|unit:unit|itemGrade:itemGrade|unitPrice:buyPrice',
                        where : [{
                            key: 'account',
                            replace : 'account:=:#{account}'
                        }]
                    }
            },
            {
                name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '?????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'fomlInfo', fieldName: 'fomlInfo', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '?????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'standard', fieldName: 'standard', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'unit', fieldName: 'unit', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemGrade', fieldName: 'itemGrade', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                },
                values: valuesItemGrades,
                labels: lablesItemGrades,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.itemGrades),
            },
            {
                name: 'ibExpQty', fieldName: 'ibExpQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '??????????????????', styleName: 'center-cell-text red-font-color'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            // {
            //     name: 'qty', fieldName: 'qty', type: 'data', width: '100', styleName: 'right-cell-text'
            //     , header: {text: '??????', styleName: 'center-cell-text'}
            //     , numberFormat: '#,##0'
            // },
            {
                name: 'unitPrice', fieldName: 'unitPrice', type: 'data', width: '150', styleName: 'right-cell-text'
                , header: {text: '??????(VAT??????)', styleName: 'center-cell-text blue-font-color'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'totalAmt', fieldName: 'totalAmt', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'lot4', fieldName: 'lot4', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: 'UDI No.', styleName: 'center-cell-text blue-font-color'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'lot2', fieldName: 'lot2', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text blue-font-color'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'lot3', fieldName: 'lot3', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '????????? lot', styleName: 'center-cell-text blue-font-color'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'remarkDetail', fieldName: 'remarkDetail', type: 'data', width: '300', styleName: 'left-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text blue-font-color'}, renderer: {
                    showTooltip: true
                }
            },
        ];
        //????????? Provider
        this.inBoundDetailDataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        //????????? ??????
        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        //????????? ??????
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.inBoundDetailDataProvider,
            'inBoundDetailGrid',
            this.inBoundDetailColumns,
            this.inBoundDetailFields,
            gridListOption);

        //????????? ??????
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

        // ??? edit control
        this.gridList.setCellStyleCallback((grid, dataCell) => {

            //?????????
            if (dataCell.dataColumn.fieldName === 'itemCd' ||
                dataCell.dataColumn.fieldName === 'itemNm' ||
                dataCell.dataColumn.fieldName === 'fomlInfo' ||
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
        this._realGridsService.gfn_PopUp(this.isMobile, this.isExtraSmall, this.gridList, this.inBoundDetailDataProvider, this.inBoundDetailColumns, this._matDialogPopup, this._unsubscribeAll, this._changeDetectorRef, this.inBoundHeaderForm);
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
            this.inBoundHeaderForm.patchValue({'ibDate': this.inBoundHeaders.soDate});

        } else {
            this.inBoundHeaderForm.patchValue({'account': ''});
            this.inBoundHeaderForm.patchValue({'type': ''});
            this.inBoundHeaderForm.patchValue({'status': 'N'});
            this.inBoundHeaderForm.patchValue({'supplier': ''});
            this.inBoundHeaderForm.patchValue({'remarkHeader': ''});
            this.inBoundHeaderForm.patchValue({'poNo': ''});
            const nowIb = new Date();
            const ibDate = formatDate(new Date(nowIb.setDate(nowIb.getDate())), 'yyyy-MM-dd', 'en');
            this.inBoundHeaderForm.patchValue({ibDate: ibDate});
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
                            fomlInfo: salesorderDetail.fomlInfo,
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

                    for(let i=0; i<this.inBoundDetails.length; i++){
                        this.inBoundDetailDataProvider.setRowState(i, 'created', true);
                    }
                    this._changeDetectorRef.markForCheck();
                });
        }
        this._changeDetectorRef.markForCheck();
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
            '', '', '', '', '', '', '', 0, 0, 0, 0, '', '', '', '', '', '', '', '', '', '', ''
        ];

        this._realGridsService.gfn_AddRow(this.gridList, this.inBoundDetailDataProvider, values);
    }

    delRow(): void {

        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.inBoundDetailDataProvider);

        if (checkValues.length < 1) {
            this._functionService.cfn_alert('?????? ????????? ??????????????????.');
            return;
        }

        this._realGridsService.gfn_DelRow(this.gridList, this.inBoundDetailDataProvider);
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '?????? ????????????');
    }

    inBoundSave(): void {
        const status = this.inBoundHeaderForm.controls['status'].value;
        if (this._realGridsService.gfn_ValidationRows(this.gridList, this._functionService)) {
            return;
        }
        if(this.inBoundHeaderForm.getRawValue().type === ''){
            this._functionService.cfn_alert('????????? ????????? ?????????.');
            return;
        }
        if(this.inBoundHeaderForm.getRawValue().account === ''){
            this._functionService.cfn_alert('???????????? ????????? ?????????.');
            return;
        }
        if(this.inBoundHeaderForm.getRawValue().ibDate === ''){
            this._functionService.cfn_alert('???????????? ????????? ?????????.');
            return;
        }
        if (!this.inBoundHeaderForm.invalid) {

            let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.inBoundDetailDataProvider);
            let detailCheck = false;

            //return;
            if (rows.length === 0) {
                this._functionService.cfn_alert('??????????????? ?????? ????????????.');
                detailCheck = true;
            }
            if (detailCheck) {
                return;
            }

            const confirmation = this._teamPlatConfirmationService.open({
                title: '',
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
                    if (result) {
                        rows = this.headerDataSet(rows);
                        this._inboundService.createIn(rows)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((inBound: any) => {
                                this._functionService.cfn_loadingBarClear();
                                this.alertMessage(inBound);
                                this._changeDetectorRef.markForCheck();
                            });
                    }
                });

            // Mark for check
            this._changeDetectorRef.markForCheck();

        } else {
            this._functionService.cfn_alert('???????????? ??????????????????.');
        }
    }

    /* ???????????? ??? data Set
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

            if(this.inBoundHeaderForm.getRawValue().ibDate.value === '' ||
                this.inBoundHeaderForm.getRawValue().ibDate === undefined ||
                this.inBoundHeaderForm.getRawValue().ibDate === null ||
                this.inBoundHeaderForm.getRawValue().ibDate === ''){
                sendData[i].ibDate = '';
            }else{
                sendData[i].ibDate = this.inBoundHeaderForm.controls['ibDate'].value;
            }
        }
        return sendData;
    }

    alertMessage(param: any): void {
        if (param.status === 'SUCCESS') {
            this.backPage();
        } else if (param.status === 'CANCEL') {

        } else {
            this._functionService.cfn_alert(param.msg);
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
                    headerText: '????????? ??????',
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
                    headerText: '????????? ??????'
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

    itemSelect() {
        if (!this.isMobile) {
            const d = this._matDialog.open(ItemSelectComponent, {
                autoFocus: false,
                disableClose: true,
                data: {
                    account: this.inBoundHeaderForm.getRawValue().account,
                    qty: '??????????????????',
                    price: '??????(VAT??????)',
                    amt: '??????',
                    buyPrice: 'buyPrice'
                },
            });

            d.afterClosed().subscribe((result) => {

                if(result){
                    result.forEach((ex) => {

                        // {fieldName: 'ibLineNo', dataType: ValueType.TEXT},
                        // {fieldName: 'itemCd', dataType: ValueType.TEXT},
                        // {fieldName: 'itemNm', dataType: ValueType.TEXT},
                        // {fieldName: 'fomlInfo', dataType: ValueType.TEXT},
                        // {fieldName: 'standard', dataType: ValueType.TEXT},
                        // {fieldName: 'unit', dataType: ValueType.TEXT},
                        // {fieldName: 'itemGrade', dataType: ValueType.TEXT},
                        // {fieldName: 'ibExpQty', dataType: ValueType.NUMBER},
                        // {fieldName: 'qty', dataType: ValueType.NUMBER},
                        // {fieldName: 'unitPrice', dataType: ValueType.NUMBER},
                        // {fieldName: 'totalAmt', dataType: ValueType.NUMBER},
                        // {fieldName: 'lot1', dataType: ValueType.TEXT},
                        // {fieldName: 'lot2', dataType: ValueType.TEXT},
                        // {fieldName: 'lot3', dataType: ValueType.TEXT},
                        // {fieldName: 'lot4', dataType: ValueType.TEXT},
                        // {fieldName: 'lot5', dataType: ValueType.TEXT},
                        // {fieldName: 'lot6', dataType: ValueType.TEXT},
                        // {fieldName: 'lot7', dataType: ValueType.TEXT},
                        // {fieldName: 'lot8', dataType: ValueType.TEXT},
                        // {fieldName: 'lot9', dataType: ValueType.TEXT},
                        // {fieldName: 'lot10', dataType: ValueType.TEXT},
                        // {fieldName: 'remarkDetail', dataType: ValueType.TEXT},

                        const values = [
                            '', ex.itemCd, ex.itemNm, ex.fomlInfo, ex.standard,
                            ex.unit, ex.itemGrade, ex.qty, 0, ex.price, ex.amt, '', '', '', '', '', '', '', '', '', '', ''
                        ];

                        this._realGridsService.gfn_AddRow(this.gridList, this.inBoundDetailDataProvider, values);
                    });
                }
            });
        } else {
            const d = this._matDialog.open(ItemSelectComponent, {
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true,
                data: {
                    account: this.inBoundHeaderForm.getRawValue().account,
                    qty: '??????????????????',
                    price: '??????(VAT??????)',
                    amt: '??????',
                    buyPrice: 'buyPrice'
                },
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    d.updateSize('calc(100vw - 10px)', '');
                } else {
                }
            });
            d.afterClosed().subscribe((result) => {
                if(result){
                    result.forEach((ex) => {

                        // {fieldName: 'ibLineNo', dataType: ValueType.TEXT},
                        // {fieldName: 'itemCd', dataType: ValueType.TEXT},
                        // {fieldName: 'itemNm', dataType: ValueType.TEXT},
                        // {fieldName: 'fomlInfo', dataType: ValueType.TEXT},
                        // {fieldName: 'standard', dataType: ValueType.TEXT},
                        // {fieldName: 'unit', dataType: ValueType.TEXT},
                        // {fieldName: 'itemGrade', dataType: ValueType.TEXT},
                        // {fieldName: 'ibExpQty', dataType: ValueType.NUMBER},
                        // {fieldName: 'qty', dataType: ValueType.NUMBER},
                        // {fieldName: 'unitPrice', dataType: ValueType.NUMBER},
                        // {fieldName: 'totalAmt', dataType: ValueType.NUMBER},
                        // {fieldName: 'lot1', dataType: ValueType.TEXT},
                        // {fieldName: 'lot2', dataType: ValueType.TEXT},
                        // {fieldName: 'lot3', dataType: ValueType.TEXT},
                        // {fieldName: 'lot4', dataType: ValueType.TEXT},
                        // {fieldName: 'lot5', dataType: ValueType.TEXT},
                        // {fieldName: 'lot6', dataType: ValueType.TEXT},
                        // {fieldName: 'lot7', dataType: ValueType.TEXT},
                        // {fieldName: 'lot8', dataType: ValueType.TEXT},
                        // {fieldName: 'lot9', dataType: ValueType.TEXT},
                        // {fieldName: 'lot10', dataType: ValueType.TEXT},
                        // {fieldName: 'remarkDetail', dataType: ValueType.TEXT},

                        const values = [
                            '', ex.itemCd, ex.itemNm, ex.fomlInfo, ex.standard,
                            ex.unit, ex.itemGrade, ex.qty, 0, ex.price, ex.amt, '', '', '', '', '', '', '', '', '', '', ''
                        ];

                        this._realGridsService.gfn_AddRow(this.gridList, this.inBoundDetailDataProvider, values);
                    });
                }

                smallDialogSubscription.unsubscribe();
            });
        }
    }
}
