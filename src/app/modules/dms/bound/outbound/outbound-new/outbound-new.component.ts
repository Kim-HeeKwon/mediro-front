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
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {Columns} from '../../../../../../@teamplat/services/realgrid/realgrid.types';
import {OutBoundDetail, OutBoundDetailPagenation} from '../outbound.types';
import {OutboundService} from '../outbound.service';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {DeviceDetectorService} from 'ngx-device-detector';
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import {FunctionService} from '../../../../../../@teamplat/services/function';
import {FuseRealGridService} from '../../../../../../@teamplat/services/realgrid';
import {OutBound} from '../outbound.types';
import {takeUntil} from 'rxjs/operators';
import {CommonPopupItemsComponent} from '../../../../../../@teamplat/components/common-popup-items';
import {formatDate} from "@angular/common";
import {ItemSelectComponent} from "../../../../../../@teamplat/components/item-select";

@Component({
    selector: 'app-dms-outbound-new',
    templateUrl: './outbound-new.component.html',
    styleUrls: ['./outbound-new.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class OutboundNewComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator, {static: true}) private _outBoundDetailPagenator: MatPaginator;
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
        {fieldName: 'obLineNo', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'fomlInfo', dataType: ValueType.TEXT},
        {fieldName: 'refItemNm', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'obExpQty', dataType: ValueType.NUMBER},
        {fieldName: 'qty', dataType: ValueType.NUMBER},
        {fieldName: 'unitPrice', dataType: ValueType.NUMBER},
        {fieldName: 'totalAmt', dataType: ValueType.NUMBER},
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
    ) {
        const typeFilter = ['ALL', '1', '4', '6'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data, 'OB_TYPE', typeFilter);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data, 'OB_STATUS', ['ALL']);
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_GRADE');
        this.isMobile = this._deviceService.isMobile();
    }

    /**
     * On init
     */
    ngOnInit(): void {
        // Form ??????
        this.outBoundHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // ?????????
            obNo: [{value: '', disabled: true}],   // ????????????
            account: [{value: '', disabled: true}, [Validators.required]], // ????????? ??????
            accountNm: [{value: '', disabled: true}],   // ????????? ???
            address: [{value: '', disabled: false}, [Validators.required]],   // ????????? ??????
            type: [{value: ''}, [Validators.required]],   // ??????
            status: [{value: '', disabled: true}, [Validators.required]],   // ??????
            dlvAccount: [{value: ''}],   // ?????????
            dlvAccountNm: [{value: '', disabled: true}],   // ?????????
            dlvAddress: [{value: ''}],   // ????????? ??????
            dlvDate: [{value: ''}, [Validators.required]],//????????????
            obCreDate: [{value: '', disabled: true}],//?????????
            obDate: [{value: '', disabled: false}, [Validators.required]], //?????????
            remarkHeader: [''], //??????
            obAmt: [{value: '', disabled: true}],   // ??????
            active: [false]  // cell??????
        });
        //????????? ??????
        this._outBoundDetailPagenator._intl.itemsPerPageLabel = '';

        const valuesItemGrades = [];
        const lablesItemGrades = [];
        this.itemGrades.forEach((param: any) => {
            valuesItemGrades.push(param.id);
            lablesItemGrades.push(param.name);
        });

        //????????? ??????
        this.outBoundDetailColumns = [
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text red-font-color'}
                , renderer: 'itemGrdPopup'
                , popUpObject:
                    {
                        popUpId: 'P$_ALL_ITEM',
                        popUpHeaderText: '?????? ??????',
                        popUpDataSet: 'itemCd:itemCd|itemNm:itemNm|fomlInfo:fomlInfo|refItemNm:refItemNm|' +
                            'standard:standard|unit:unit|itemGrade:itemGrade|unitPrice:salesPrice',
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
                name: 'refItemNm', fieldName: 'refItemNm', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '?????? ?????????', styleName: 'center-cell-text'}, renderer: {
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
                editor: this._realGridsService.gfn_ComboBox(this.status),
            },
            {
                name: 'obExpQty', fieldName: 'obExpQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '??????????????????', styleName: 'center-cell-text red-font-color'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'unitPrice', fieldName: 'unitPrice', type: 'data', width: '150', styleName: 'right-cell-text'
                , header: {text: '??????(VAT??????)', styleName: 'center-cell-text blue-font-color'}
                , numberFormat: '#,##0'
            },
            {
                name: 'totalAmt', fieldName: 'totalAmt', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'remarkDetail', fieldName: 'remarkDetail', type: 'data', width: '300', styleName: 'left-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text blue-font-color'}, renderer: {
                    showTooltip: true
                }
            },
        ];
        //????????? Provider
        this.outBoundDetailDataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        //????????? ??????
        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        //????????? ??????
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.outBoundDetailDataProvider,
            'outBoundDetailGrid',
            this.outBoundDetailColumns,
            this.outBoundDetailFields,
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
                dataCell.dataColumn.fieldName === 'refItemNm' ||
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
            if(this.outBoundDetailDataProvider.getOrgFieldName(field) === 'obExpQty' ||
                this.outBoundDetailDataProvider.getOrgFieldName(field) === 'unitPrice'){
                const that = this;
                setTimeout(() =>{
                    const qty = that._realGridsService.gfn_CellDataGetRow(
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
                        qty * unitPrice);
                },100);
            }
        });
        // eslint-disable-next-line max-len
        this._realGridsService.gfn_PopUp(this.isMobile, this.isExtraSmall, this.gridList, this.outBoundDetailDataProvider, this.outBoundDetailColumns, this._matDialogPopup, this._unsubscribeAll, this._changeDetectorRef, this.outBoundHeaderForm);
        this.outBoundDetails$ = this._outboundService.outBoundDetails$;
        this.outBoundHeaderForm.patchValue({'account': ''});
        this.outBoundHeaderForm.patchValue({'address': ''});
        this.outBoundHeaderForm.patchValue({'type': ''});
        this.outBoundHeaderForm.patchValue({'status': 'N'});
        this.outBoundHeaderForm.patchValue({'dlvAccount': ''});
        this.outBoundHeaderForm.patchValue({'dlvAccountNm': ''});
        this.outBoundHeaderForm.patchValue({'dlvAddress': ''});
        this.outBoundHeaderForm.patchValue({'dlvDate': ''});
        this.outBoundHeaderForm.patchValue({'remarkHeader': ''});
        const nowOb = new Date();
        const obDate = formatDate(new Date(nowOb.setDate(nowOb.getDate())), 'yyyy-MM-dd', 'en');
        this.outBoundHeaderForm.patchValue({obDate: obDate});

        const now = new Date();
        const dlvDate = formatDate(new Date(now.setDate(now.getDate() + 7)), 'yyyy-MM-dd', 'en');

        this.outBoundHeaderForm.patchValue({dlvDate: dlvDate});
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.outBoundDetailDataProvider);
    }

    addRow(): void {
        const values = [
            '', '', '', '', '', '', '', '', 0, 0, 0, 0, ''
        ];

        this._realGridsService.gfn_AddRow(this.gridList, this.outBoundDetailDataProvider, values);
    }

    delRow(): void {

        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.outBoundDetailDataProvider);

        if (checkValues.length < 1) {
            this._functionService.cfn_alert('?????? ????????? ??????????????????.');
            return;
        }

        this._realGridsService.gfn_DelRow(this.gridList, this.outBoundDetailDataProvider);
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '?????? ????????????');
    }

    outBoundSave(): void {
        const status = this.outBoundHeaderForm.controls['status'].value;

        if (this._realGridsService.gfn_ValidationRows(this.gridList, this._functionService)) {
            return;
        }

        if (!this.outBoundHeaderForm.invalid) {

            let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.outBoundDetailDataProvider);

            let detailCheck = false;

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
                        this._outboundService.createOut(rows)
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
            if (!this.outBoundHeaderForm.getRawValue().account) {
                this._functionService.cfn_alert('???????????? ????????? ?????????.');
            } else if (!this.outBoundHeaderForm.getRawValue().dlvDate) {
                this._functionService.cfn_alert('??????????????? ????????? ?????????.');
            } else if (!this.outBoundHeaderForm.getRawValue().obDate) {
                this._functionService.cfn_alert('???????????? ????????? ?????????.');
            } else if (!this.outBoundHeaderForm.getRawValue().type) {
                this._functionService.cfn_alert('????????? ????????? ?????????.');
            } else if (!this.outBoundHeaderForm.getRawValue().address) {
                this._functionService.cfn_alert('????????? ????????? ????????? ?????????.');
            }
        }
    }

    /* ???????????? ??? data Set
     * @param sendData
     */

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: OutBound[]) {
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
        this._router.navigate(['bound/outbound']);
    }

    openAccountSearch(): void {
        if (!this.isMobile) {
            const popup = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup: 'P$_ACCOUNT',
                    headerText: '????????? ??????'
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });

            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        this.outBoundHeaderForm.patchValue({'account': result.accountCd});
                        this.outBoundHeaderForm.patchValue({'accountNm': result.accountNm});
                        this.outBoundHeaderForm.patchValue({'address': result.address});
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
                } else {
                    // d.updateSize('calc(100% - 50px)', '');
                }
            });
            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        smallDialogSubscription.unsubscribe();
                        this.outBoundHeaderForm.patchValue({'account': result.accountCd});
                        this.outBoundHeaderForm.patchValue({'accountNm': result.accountNm});
                        this.outBoundHeaderForm.patchValue({'address': result.address});
                    }
                });
        }
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
                    headerText: '????????? ??????'
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

    itemSelect() {
        if (!this.isMobile) {
            const d = this._matDialog.open(ItemSelectComponent, {
                autoFocus: false,
                disableClose: true,
                data: {
                    account: this.outBoundHeaderForm.getRawValue().account,
                    qty: '??????????????????',
                    price: '??????(VAT??????)',
                    amt: '??????',
                    buyPrice: 'salesPrice'
                },
            });

            d.afterClosed().subscribe((result) => {

                if(result){
                    result.forEach((ex) => {

                        // {fieldName: 'obLineNo', dataType: ValueType.TEXT},
                        // {fieldName: 'itemCd', dataType: ValueType.TEXT},
                        // {fieldName: 'itemNm', dataType: ValueType.TEXT},
                        // {fieldName: 'fomlInfo', dataType: ValueType.TEXT},
                        // {fieldName: 'refItemNm', dataType: ValueType.TEXT},
                        // {fieldName: 'standard', dataType: ValueType.TEXT},
                        // {fieldName: 'unit', dataType: ValueType.TEXT},
                        // {fieldName: 'itemGrade', dataType: ValueType.TEXT},
                        // {fieldName: 'obExpQty', dataType: ValueType.NUMBER},
                        // {fieldName: 'qty', dataType: ValueType.NUMBER},
                        // {fieldName: 'unitPrice', dataType: ValueType.NUMBER},
                        // {fieldName: 'totalAmt', dataType: ValueType.NUMBER},
                        // {fieldName: 'remarkDetail', dataType: ValueType.TEXT},

                        const values = [
                            '', ex.itemCd, ex.itemNm, ex.fomlInfo, ex.refItemNm, ex.standard,
                            ex.unit, ex.itemGrade, ex.qty, 0, ex.price, ex.amt, ''
                        ];

                        this._realGridsService.gfn_AddRow(this.gridList, this.outBoundDetailDataProvider, values);
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
                    account: this.outBoundHeaderForm.getRawValue().account,
                    qty: '??????????????????',
                    price: '??????(VAT??????)',
                    amt: '??????',
                    buyPrice: 'salesPrice'
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

                        // {fieldName: 'obLineNo', dataType: ValueType.TEXT},
                        // {fieldName: 'itemCd', dataType: ValueType.TEXT},
                        // {fieldName: 'itemNm', dataType: ValueType.TEXT},
                        // {fieldName: 'fomlInfo', dataType: ValueType.TEXT},
                        // {fieldName: 'refItemNm', dataType: ValueType.TEXT},
                        // {fieldName: 'standard', dataType: ValueType.TEXT},
                        // {fieldName: 'unit', dataType: ValueType.TEXT},
                        // {fieldName: 'itemGrade', dataType: ValueType.TEXT},
                        // {fieldName: 'obExpQty', dataType: ValueType.NUMBER},
                        // {fieldName: 'qty', dataType: ValueType.NUMBER},
                        // {fieldName: 'unitPrice', dataType: ValueType.NUMBER},
                        // {fieldName: 'totalAmt', dataType: ValueType.NUMBER},
                        // {fieldName: 'remarkDetail', dataType: ValueType.TEXT},

                        const values = [
                            '', ex.itemCd, ex.itemNm, ex.fomlInfo, ex.refItemNm, ex.standard,
                            ex.unit, ex.itemGrade, ex.qty, 0, ex.price, ex.amt, ''
                        ];

                        this._realGridsService.gfn_AddRow(this.gridList, this.outBoundDetailDataProvider, values);
                    });
                }

                smallDialogSubscription.unsubscribe();
            });
        }
    }
}
