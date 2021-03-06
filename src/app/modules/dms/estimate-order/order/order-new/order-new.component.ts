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
import {Order, OrderDetail, OrderDetailPagenation} from '../order.types';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {Columns} from '../../../../../../@teamplat/services/realgrid/realgrid.types';
import {FuseRealGridService} from '../../../../../../@teamplat/services/realgrid';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import {FunctionService} from '../../../../../../@teamplat/services/function';
import {DeviceDetectorService} from 'ngx-device-detector';
import {OrderService} from '../order.service';
import {takeUntil} from 'rxjs/operators';
import {CommonPopupItemsComponent} from '../../../../../../@teamplat/components/common-popup-items';
import {LatelyCardComponent} from '../../../../../../@teamplat/components/lately-card';
import {formatDate} from "@angular/common";
import {ItemSelectComponent} from "../../../../../../@teamplat/components/item-select";

@Component({
    selector: 'app-dms-order-new',
    templateUrl: './order-new.component.html',
    styleUrls: ['./order-new.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class OrderNewComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator, {static: true}) private _orderDetailPagenator: MatPaginator;
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
    estimateHeader: any;
    estimateDetail: any;

    orderHeaderForm: FormGroup;
    orderDetailPagenation: OrderDetailPagenation | null = null;
    orderDetails$ = new Observable<OrderDetail[]>();

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gridList: RealGrid.GridView;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    orderDetailColumns: Columns[];
    // @ts-ignore
    orderDetailDataProvider: RealGrid.LocalDataProvider;
    orderDetailFields: DataFieldObject[] = [
        {fieldName: 'poLineNo', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'fomlInfo', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'poReqQty', dataType: ValueType.NUMBER},
        {fieldName: 'invQty', dataType: ValueType.NUMBER},
        {fieldName: 'reqQty', dataType: ValueType.NUMBER},
        {fieldName: 'qty', dataType: ValueType.NUMBER},
        {fieldName: 'unitPrice', dataType: ValueType.NUMBER},
        {fieldName: 'poAmt', dataType: ValueType.NUMBER},
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
        private _orderService: OrderService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _functionService: FunctionService,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver) {
        this.filterList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data, 'PO_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data, 'PO_STATUS', this.filterList);
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_GRADE');
        if (this._router.getCurrentNavigation() !== (null && undefined)) {

            if (this._router.getCurrentNavigation().extras.state !== undefined) {
                if (this._router.getCurrentNavigation().extras.state.header !== undefined
                    && this._router.getCurrentNavigation().extras.state.detail !== undefined) {
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
        // Form ??????
        this.orderHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // ?????????
            poNo: [{value: '', disabled: true}],   // ????????????
            account: [{value: '', disabled: true}, [Validators.required]], // ????????? ??????
            accountNm: [{value: '', disabled: true}],   // ????????? ???
            type: [{value: ''}, [Validators.required]],   // ??????
            status: [{value: '', disabled: true}, [Validators.required]],   // ??????
            poAmt: [{value: '', disabled: true}],   // ????????????
            poCreDate: [{value: '', disabled: true}],//?????? ????????????
            poDate: [{value: '', disabled: false}, [Validators.required]], //????????????
            deliveryDate: [{value: ''}], //????????????
            email: [{value: '', disabled: false}, [Validators.required]], //?????????
            cellPhoneNumber: [], //????????????
            remarkHeader: [''], //??????
            active: [false]  // cell??????
        });
        //????????? ??????
        this._orderDetailPagenator._intl.itemsPerPageLabel = '';

        const valuesItemGrades = [];
        const lablesItemGrades = [];
        this.itemGrades.forEach((param: any) => {
            valuesItemGrades.push(param.id);
            lablesItemGrades.push(param.name);
        });

        //????????? ??????
        this.orderDetailColumns = [
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text red-font-color'}
                , renderer: 'itemGrdPopup'
                , popUpObject:
                    {
                        popUpId: 'P$_ALL_ITEM',
                        popUpHeaderText: '?????? ??????',
                        popUpDataSet: 'itemCd:itemCd|itemNm:itemNm|fomlInfo:fomlInfo|' +
                            'standard:standard|unit:unit|itemGrade:itemGrade|unitPrice:buyPrice|' +
                            'poReqQty:poQty|invQty:availQty',
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
                name: 'poReqQty', fieldName: 'poReqQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'invQty', fieldName: 'invQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '???????????????', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'reqQty', fieldName: 'reqQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '??????????????????', styleName: 'center-cell-text red-font-color'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'unitPrice', fieldName: 'unitPrice', type: 'data', width: '150', styleName: 'right-cell-text'
                , header: {text: '????????????(VAT??????)', styleName: 'center-cell-text red-font-color'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'poAmt', fieldName: 'poAmt', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
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
        this.orderDetailDataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        //????????? ??????
        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        //????????? ??????
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.orderDetailDataProvider,
            'orderDetailGrid',
            this.orderDetailColumns,
            this.orderDetailFields,
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
                dataCell.dataColumn.fieldName === 'itemGrade' ||
                dataCell.dataColumn.fieldName === 'poReqQty' ||
                dataCell.dataColumn.fieldName === 'invQty' ||
                dataCell.dataColumn.fieldName === 'poAmt') {
                return {editable: false};
            } else {
                return {editable: true};
            }
        });
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellEdited = ((grid, itemIndex, row, field) => {
            if(this.orderDetailDataProvider.getOrgFieldName(field) === 'reqQty' ||
                this.orderDetailDataProvider.getOrgFieldName(field) === 'unitPrice'){
                const that = this;
                setTimeout(() =>{
                    const reqQty = that._realGridsService.gfn_CellDataGetRow(
                        this.gridList,
                        this.orderDetailDataProvider,
                        itemIndex,'reqQty');
                    const unitPrice = that._realGridsService.gfn_CellDataGetRow(
                        this.gridList,
                        this.orderDetailDataProvider,
                        itemIndex,'unitPrice');
                    that._realGridsService.gfn_CellDataSetRow(that.gridList,
                        that.orderDetailDataProvider,
                        itemIndex,
                        'poAmt',
                        reqQty * unitPrice);
                },100);
            }
        });
        // eslint-disable-next-line max-len
        this._realGridsService.gfn_PopUp(this.isMobile, this.isExtraSmall, this.gridList, this.orderDetailDataProvider, this.orderDetailColumns, this._matDialogPopup, this._unsubscribeAll, this._changeDetectorRef, this.orderHeaderForm);
        this.orderDetails$ = this._orderService.orderDetails$;
        if (this.estimateHeader !== undefined) {

            this.orderHeaderForm.patchValue({'account': this.estimateHeader.account});
            this.orderHeaderForm.patchValue({'accountNm': this.estimateHeader.accountNm});
            this.orderHeaderForm.patchValue({'email': this.estimateHeader.email});
            this.orderHeaderForm.patchValue({'type': '1'});
            this.orderHeaderForm.patchValue({'status': 'N'});
            this.orderHeaderForm.patchValue({'remarkHeader': this.estimateHeader.remarkHeader});
            this.orderHeaderForm.patchValue({'poDate': this.estimateHeader.qtDate});

        } else {

            this.orderHeaderForm.patchValue({'account': ''});
            this.orderHeaderForm.patchValue({'type': '1'});
            this.orderHeaderForm.patchValue({'status': 'N'});
            this.orderHeaderForm.patchValue({'remarkHeader': ''});
            const nowPo = new Date();
            const poDate = formatDate(new Date(nowPo.setDate(nowPo.getDate())), 'yyyy-MM-dd', 'en');
            this.orderHeaderForm.patchValue({poDate: poDate});
        }

        if (this.estimateDetail !== undefined) {
            this.orderDetails$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((orderDetail) => {
                    orderDetail = [];
                    this.estimateDetail.forEach((estimateDetail: any) => {
                        orderDetail.push({
                            no: estimateDetail.length + 1,
                            flag: 'C',
                            itemCd: estimateDetail.itemCd,
                            itemNm: estimateDetail.itemNm,
                            fomlInfo: estimateDetail.fomlInfo,
                            standard: estimateDetail.standard,
                            unit: estimateDetail.unit,
                            itemGrade : estimateDetail.itemGrade,
                            poLineNo: estimateDetail.qtLineNo,
                            unitPrice: estimateDetail.qtPrice,
                            poReqQty: estimateDetail.poReqQty,
                            invQty: estimateDetail.invQty,
                            reqQty: estimateDetail.qty,
                            qty: 0,
                            poQty: 0,
                            poAmt: estimateDetail.qtAmt,
                            remarkDetail: estimateDetail.remarkDetail,
                        });
                    });
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.orderDetailDataProvider, orderDetail);
                    for (let i = 0; i < this.orderDetailDataProvider.getRowCount(); i++) {

                        this.orderDetailDataProvider.setRowState(i, 'created', false);
                    }
                    this.gridList.commit();
                    this._changeDetectorRef.markForCheck();
                });
        }
        const now = new Date();
        const deliveryDate = formatDate(new Date(now.setDate(now.getDate() + 7)), 'yyyy-MM-dd', 'en');

        this.orderHeaderForm.patchValue({deliveryDate: deliveryDate});
        this._changeDetectorRef.markForCheck();
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.orderDetailDataProvider);
    }

    addRow(): void {

        const values = [
            '', '', '', '', '', '', '', 0, 0, 0, 0, 0, 0, ''
        ];

        this._realGridsService.gfn_AddRow(this.gridList, this.orderDetailDataProvider, values);
    }

    delRow(): void {

        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.orderDetailDataProvider);

        if (checkValues.length < 1) {
            this._functionService.cfn_alert('?????? ????????? ??????????????????.');
            return;
        }

        this._realGridsService.gfn_DelRow(this.gridList, this.orderDetailDataProvider);
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '?????? ????????????');
    }

    orderSave(): void {
        const status = this.orderHeaderForm.controls['status'].value;
        if (this._realGridsService.gfn_ValidationRows(this.gridList, this._functionService)) {
            return;
        }

        if (!this.orderHeaderForm.invalid) {
            let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.orderDetailDataProvider);

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
                        this._orderService.createOrder(rows)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((order: any) => {
                                this._functionService.cfn_loadingBarClear();
                                this.alertMessage(order);
                                this._changeDetectorRef.markForCheck();
                            });
                    }
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();

        } else {
            if (!this.orderHeaderForm.getRawValue().account) {
                this._functionService.cfn_alert('???????????? ????????? ?????????.');
            } else if (!this.orderHeaderForm.getRawValue().email) {
                this._functionService.cfn_alert('???????????? ????????? ?????????.');
            } else if (!this.orderHeaderForm.getRawValue().obDate) {
                this._functionService.cfn_alert('??????????????? ????????? ?????????.');
            } else if (!this.orderHeaderForm.getRawValue().type) {
                this._functionService.cfn_alert('????????? ????????? ?????????.');
            }
        }
    }

    /* ???????????? ??? data Set
     * @param sendData
     */

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: Order[]) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < sendData.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            sendData[i].account = this.orderHeaderForm.controls['account'].value;
            sendData[i].poNo = this.orderHeaderForm.controls['poNo'].value;
            sendData[i].type = this.orderHeaderForm.controls['type'].value;
            sendData[i].status = this.orderHeaderForm.controls['status'].value;
            sendData[i].email = this.orderHeaderForm.controls['email'].value;
            sendData[i].cellPhoneNumber = this.orderHeaderForm.controls['cellPhoneNumber'].value;
            sendData[i].remarkHeader = this.orderHeaderForm.controls['remarkHeader'].value;

            if(this.orderHeaderForm.getRawValue().deliveryDate.value === '' ||
                this.orderHeaderForm.getRawValue().deliveryDate === undefined ||
                this.orderHeaderForm.getRawValue().deliveryDate === null ||
                this.orderHeaderForm.getRawValue().deliveryDate === ''){
                sendData[i].deliveryDate = '';
            }else{
                sendData[i].deliveryDate = this.orderHeaderForm.controls['deliveryDate'].value;
            }

            if(this.orderHeaderForm.getRawValue().poDate.value === '' ||
                this.orderHeaderForm.getRawValue().poDate === undefined ||
                this.orderHeaderForm.getRawValue().poDate === null ||
                this.orderHeaderForm.getRawValue().poDate === ''){
                sendData[i].poDate = '';
            }else{
                sendData[i].poDate = this.orderHeaderForm.controls['poDate'].value;
            }
        }
        return sendData;
    }

    backPage(): void {
        this._router.navigate(['estimate-order/order']);
    }

    alertMessage(param: any): void {
        if (param.status === 'SUCCESS') {
            this.backPage();
        } else if (param.status === 'CANCEL'){

        } else {
            this._functionService.cfn_alert(param.msg);
        }
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
                        this.orderHeaderForm.patchValue({'account': result.accountCd});
                        this.orderHeaderForm.patchValue({'accountNm': result.accountNm});
                        this.orderHeaderForm.patchValue({'email': result.email});
                        this.orderHeaderForm.patchValue({'cellPhoneNumber': result.cellPhoneNumber});
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
                } else {
                    // d.updateSize('calc(100% - 50px)', '');
                }
            });
            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        smallDialogSubscription.unsubscribe();
                        this.orderHeaderForm.patchValue({'account': result.accountCd});
                        this.orderHeaderForm.patchValue({'accountNm': result.accountNm});
                        this.orderHeaderForm.patchValue({'email': result.email});
                        this.orderHeaderForm.patchValue({'cellPhoneNumber': result.cellPhoneNumber});
                    }
                });
        }
    }

    //?????? ??????
    latelyOrder(): void {
        if (!this.isMobile) {
            const popup = this._matDialogPopup.open(LatelyCardComponent, {
                data: {
                    text: '??????',
                    content: 'ORDER'
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });

            popup.afterClosed().subscribe((result) => {
                if (result) {
                    result.header.forEach((data) => {
                        if(data.cellPhoneNumber === 0){
                            data.cellPhoneNumber = '';
                        }else{
                            data.cellPhoneNumber = '0' + data.cellPhoneNumber;
                        }
                    });
                    this.orderHeaderForm.patchValue(
                        result.header[0]
                    );
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.orderDetailDataProvider, result.detail);
                    for (let i = 0; i < this.orderDetailDataProvider.getRowCount(); i++) {

                        this.orderDetailDataProvider.setRowState(i, 'created', false);
                    }
                    this.gridList.commit();
                    this._changeDetectorRef.markForCheck();
                }
            });
        } else {
            const d = this._matDialogPopup.open(LatelyCardComponent, {
                data: {
                    text: '??????',
                    content: 'ORDER'
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
                }
            });
            d.afterClosed().subscribe((result) => {
                if (result) {
                    this.orderHeaderForm.patchValue(
                        result.header[0]
                    );
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.orderDetailDataProvider, result.detail);
                    for (let i = 0; i < this.orderDetailDataProvider.getRowCount(); i++) {

                        this.orderDetailDataProvider.setRowState(i, 'created', false);
                    }
                    this.gridList.commit();
                    this._changeDetectorRef.markForCheck();
                }
                smallDialogSubscription.unsubscribe();
            });
        }
    }

    itemSelect() {
        if (!this.isMobile) {
            const d = this._matDialog.open(ItemSelectComponent, {
                autoFocus: false,
                disableClose: true,
                data: {
                    account: this.orderHeaderForm.getRawValue().account,
                    qty: '??????????????????',
                    price: '????????????(VAT??????)',
                    amt: '????????????',
                    buyPrice: 'buyPrice'
                },
            });

            d.afterClosed().subscribe((result) => {

                if(result){
                    result.forEach((ex) => {

                        // {fieldName: 'poLineNo', dataType: ValueType.TEXT},
                        // {fieldName: 'itemCd', dataType: ValueType.TEXT},
                        // {fieldName: 'itemNm', dataType: ValueType.TEXT},
                        // {fieldName: 'fomlInfo', dataType: ValueType.TEXT},
                        // {fieldName: 'standard', dataType: ValueType.TEXT},
                        // {fieldName: 'unit', dataType: ValueType.TEXT},
                        // {fieldName: 'itemGrade', dataType: ValueType.TEXT},
                        // {fieldName: 'poReqQty', dataType: ValueType.NUMBER},
                        // {fieldName: 'invQty', dataType: ValueType.NUMBER},
                        // {fieldName: 'reqQty', dataType: ValueType.NUMBER},
                        // {fieldName: 'qty', dataType: ValueType.NUMBER},
                        // {fieldName: 'unitPrice', dataType: ValueType.NUMBER},
                        // {fieldName: 'poAmt', dataType: ValueType.NUMBER},
                        // {fieldName: 'remarkDetail', dataType: ValueType.TEXT},

                        const values = [
                            '', ex.itemCd, ex.itemNm, ex.fomlInfo, ex.standard,
                            ex.unit, ex.itemGrade, ex.poQty, ex.availQty, ex.qty, 0, ex.price, ex.amt, ''
                        ];

                        this._realGridsService.gfn_AddRow(this.gridList, this.orderDetailDataProvider, values);
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
                    account: this.orderHeaderForm.getRawValue().account,
                    qty: '??????????????????',
                    price: '????????????(VAT??????)',
                    amt: '????????????',
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

                        // {fieldName: 'poLineNo', dataType: ValueType.TEXT},
                        // {fieldName: 'itemCd', dataType: ValueType.TEXT},
                        // {fieldName: 'itemNm', dataType: ValueType.TEXT},
                        // {fieldName: 'fomlInfo', dataType: ValueType.TEXT},
                        // {fieldName: 'standard', dataType: ValueType.TEXT},
                        // {fieldName: 'unit', dataType: ValueType.TEXT},
                        // {fieldName: 'itemGrade', dataType: ValueType.TEXT},
                        // {fieldName: 'poReqQty', dataType: ValueType.NUMBER},
                        // {fieldName: 'invQty', dataType: ValueType.NUMBER},
                        // {fieldName: 'reqQty', dataType: ValueType.NUMBER},
                        // {fieldName: 'qty', dataType: ValueType.NUMBER},
                        // {fieldName: 'unitPrice', dataType: ValueType.NUMBER},
                        // {fieldName: 'poAmt', dataType: ValueType.NUMBER},
                        // {fieldName: 'remarkDetail', dataType: ValueType.TEXT},

                        const values = [
                            '', ex.itemCd, ex.itemNm, ex.fomlInfo, ex.standard,
                            ex.unit, ex.itemGrade, ex.poQty, ex.availQty, ex.qty, 0, ex.price, ex.amt, ''
                        ];

                        this._realGridsService.gfn_AddRow(this.gridList, this.orderDetailDataProvider, values);
                    });
                }

                smallDialogSubscription.unsubscribe();
            });
        }
    }
}
