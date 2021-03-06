import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {CommonCode, FuseUtilsService} from "../../services/utils";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CodeStore} from "../../../app/core/common-code/state/code.store";
import {PopupStore} from "../../../app/core/common-popup/state/popup.store";
import {Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {Columns} from "../../services/realgrid/realgrid.types";
import {DeviceDetectorService} from "ngx-device-detector";
import {FuseRealGridService} from "../../services/realgrid";
import {TeamPlatConfirmationService} from "../../services/confirmation";
import {FunctionService} from "../../services/function";
import {takeUntil} from "rxjs/operators";
import {ItemSelectService} from "./item-select.service";

@Component({
    selector: 'app-items-select',
    templateUrl: 'item-select.component.html',
    styleUrls: ['item-select.component.scss'],
})
export class ItemSelectComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    qty: string;
    price: string;
    amt: string;
    buyPrice: string;
    formGroup: FormGroup;
    itemGrades: CommonCode[] = [];
    isLoading: boolean = false;
    isMobile: boolean = false;
    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    dataProvider: RealGrid.LocalDataProvider;
    columns: Columns[];
    // @ts-ignore
    fields: DataFieldObject[] = [
        {fieldName: 'message', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'qty', dataType: ValueType.NUMBER},
        {fieldName: 'price', dataType: ValueType.NUMBER},
        {fieldName: 'amt', dataType: ValueType.NUMBER},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'fomlInfo', dataType: ValueType.TEXT},
        {fieldName: 'refItemNm', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'salesPrice', dataType: ValueType.NUMBER},
        {fieldName: 'buyPrice', dataType: ValueType.NUMBER},
        {fieldName: 'poQty', dataType: ValueType.NUMBER},
        {fieldName: 'availQty', dataType: ValueType.NUMBER},
        {fieldName: 'code', dataType: ValueType.TEXT},
    ];

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        public _matDialogRef: MatDialogRef<ItemSelectComponent>,
        public _matDialogPopup: MatDialog,
        private _utilService: FuseUtilsService,
        private _realGridsService: FuseRealGridService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _functionService: FunctionService,
        @Inject(ElementRef) private element: ElementRef,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _formBuilder: FormBuilder,
        private _itemSelectService: ItemSelectService,
        private _codeStore: CodeStore,
        private _changeDetectorRef: ChangeDetectorRef,
        private _popupStore: PopupStore,
        private dialog: MatDialog,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver
    ) {
        if(data.qty) {
            this.qty = data.qty;
        }
        if(data.price) {
            this.price = data.price;
        }
        if(data.amt) {
            this.amt = data.amt;
        }
        if(data.buyPrice) {
            this.buyPrice = data.buyPrice;
        }
        this.isMobile = this._deviceService.isMobile();
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_GRADE');
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.dataProvider);
    }

    ngOnInit(): void {
        // Form ??????
        this.formGroup = this._formBuilder.group({
            account: [{value: '', disabled: false}], // ????????? ??????
            active: [false]  // cell??????
        });

        this.formGroup.patchValue({account: this.data.account});

        this._changeDetectorRef.markForCheck();

        const valuesItemGrades = [];
        const lablesItemGrades = [];
        this.itemGrades.forEach((param: any) => {
            valuesItemGrades.push(param.id);
            lablesItemGrades.push(param.name);
        });

        this.columns = [
            {
                name: 'message', fieldName: 'message', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '?????? ?????????', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text red-font-color'}
                , renderer: 'itemGrdPopup'
                , popUpObject:
                    {
                        popUpId: 'P$_ALL_ITEM',
                        popUpHeaderText: '?????? ??????',
                        popUpDataSet: 'itemCd:itemCd|itemNm:itemNm|price:'+ this.buyPrice +'|fomlInfo:fomlInfo|refItemNm:refItemNm|' +
                            'standard:standard|unit:unit|itemGrade:itemGrade|buyPrice:buyPrice' +
                            '|salesPrice:salesPrice|poQty:poQty|availQty:availQty',
                        where: [{
                            key: 'account',
                            replace: 'account:=:#{account}'
                        }]
                    }
            },
            {
                name: 'qty', fieldName: 'qty', type: 'data', width: '120', styleName: 'right-cell-text'
                , header: {text: this.qty, styleName: 'center-cell-text red-font-color'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'price', fieldName: 'price', type: 'data', width: '150', styleName: 'right-cell-text'
                , header: {text: this.price, styleName: 'center-cell-text red-font-color'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'amt', fieldName: 'amt', type: 'data', width: '120', styleName: 'right-cell-text'
                , header: {text: this.amt, styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
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
                name: 'refItemNm', fieldName: 'refItemNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '?????? ?????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'standard',
                fieldName: 'standard',
                type: 'data',
                width: '120',
                styleName: 'left-cell-text',
                header: {text: '??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'unit',
                fieldName: 'unit',
                type: 'data',
                width: '120',
                styleName: 'left-cell-text',
                header: {text: '??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemGrade', fieldName: 'itemGrade', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '??????', styleName: 'center-cell-text'},
                values: valuesItemGrades,
                labels: lablesItemGrades,
                lookupDisplay: true, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'buyPrice', fieldName: 'buyPrice', type: 'number', width: '150', styleName: 'right-cell-text'
                , header: {text: '????????????(VAT??????)', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'salesPrice',
                fieldName: 'salesPrice',
                type: 'number',
                width: '150',
                styleName: 'right-cell-text',
                header: {text: '????????????(VAT??????)', styleName: 'center-cell-text'}
                ,
                numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'poQty', fieldName: 'poQty', type: 'number', width: '150', styleName: 'right-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'availQty', fieldName: 'availQty', type: 'number', width: '150', styleName: 'right-cell-text'
                , header: {text: '???????????????', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
        ];
        this.dataProvider = this._realGridsService.gfn_CreateDataProvider(false);

        //????????? ??????
        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: true,
        };

        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.dataProvider,
            'selectItem',
            this.columns,
            this.fields,
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
            checkReadOnly: true,
        });
        this.gridList.editOptions.commitByCell = true;
        this.gridList.editOptions.validateOnEdited = true;

        // eslint-disable-next-line max-len
        this._realGridsService.gfn_PopUp(
            // eslint-disable-next-line max-len
            this.isMobile, this.isExtraSmall, this.gridList, this.dataProvider, this.columns, this._matDialogPopup, this._unsubscribeAll, this._changeDetectorRef,
            this.formGroup
        );
        //onPaste
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onPaste = ((grid, itemIndex, row, field) => {
        });
        // ??? edit control
        this.gridList.setCellStyleCallback((grid, dataCell) => {
            const ret = {styleName : '', editable: false};
            if (dataCell.item.rowState === 'updated') {

                const code = grid.getValue(dataCell.index.itemIndex, 'code');
                if(code < 0){
                    if (dataCell.dataColumn.fieldName === 'message') {
                        ret.styleName = 'left-cell-text red-cell-color';
                    }
                }else{
                    if (dataCell.dataColumn.fieldName === 'message') {
                        ret.styleName = 'left-cell-text green-cell-color';
                    }
                }
            }

            //?????????
            if (dataCell.dataColumn.fieldName === 'itemCd' || dataCell.dataColumn.fieldName === 'qty' || dataCell.dataColumn.fieldName === 'price') {
                ret.editable = true;
                return ret;
            } else {
                ret.editable = false;
                return ret;
            }
        });

        setTimeout(() => {
            const values = [
                '','',0,0,0,'','','','','','',0,0,0,0,
            ];

            this._realGridsService.gfn_AddRow(this.gridList, this.dataProvider, values);

            // const focusCell = this.gridList.getCurrent();
            // focusCell.dataRow = 0;
            // focusCell.column = 'itemCd';
            // focusCell.fieldName = 'itemCd';
            // //???????????? ??? ??????
            // this.gridList.setCurrent(focusCell);
            // const curr = this.gridList.getCurrent();
            // this.gridList.beginUpdateRow(curr.itemIndex);
            // this.gridList.setFocus();
        },200);

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellEdited = ((grid, itemIndex, row, field) => {
            if (this.dataProvider.getOrgFieldName(field) === 'qty' ||
                this.dataProvider.getOrgFieldName(field) === 'price') {
                const that = this;
                setTimeout(() => {
                    const qty = that._realGridsService.gfn_CellDataGetRow(
                        this.gridList,
                        this.dataProvider,
                        itemIndex, 'qty');
                    const qtPrice = that._realGridsService.gfn_CellDataGetRow(
                        this.gridList,
                        this.dataProvider,
                        itemIndex, 'price');
                    that._realGridsService.gfn_CellDataSetRow(that.gridList,
                        that.dataProvider,
                        itemIndex,
                        'amt',
                        qty * qtPrice);
                }, 100);
            }
        });

        this._changeDetectorRef.markForCheck();
    }

    insertItem() {
        const values = [
            '','',0,0,0,'','','','','','',0,0,0,0,
        ];

        this._realGridsService.gfn_AddRow(this.gridList, this.dataProvider, values);
    }

    deleteItem() {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.dataProvider);

        if (checkValues.length < 1) {
            this._functionService.cfn_alert('?????? ????????? ??????????????????.');
            return;
        }

        this._realGridsService.gfn_DelRow(this.gridList, this.dataProvider);
    }

    selectItem() {
        let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.dataProvider);
        if(rows.length < 1){
            this._functionService.cfn_alert('?????? ??? ????????? ????????????. ??????????????????.');
            return;
        }

        const confirmation = this._teamPlatConfirmationService.open({
            title: '',
            message: '?????? ???????????????????',
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
                    const sendData = this.headerDataSet(rows);
                    this._itemSelectService.selectItem(sendData)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((item: any) => {
                            this._functionService.cfn_loadingBarClear();
                            this.alertMessage(item);
                            this._changeDetectorRef.markForCheck();
                        });
                }
            });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    alertMessage(param: any): void {
        if (param.status === 'SUCCESS') {

            let check = false;
            param.data.forEach((ex) => {
               if(ex.code < 0){
                   check = true;
               }
            });
            if(check){
                this._realGridsService.gfn_DataSetGrid(this.gridList, this.dataProvider, param.data);

                setTimeout(() => {

                    for(let i=0; i<param.data.length; i++) {
                        this.dataProvider.setRowState(i, 'updated', false);
                        // this._realGridsService.gfn_CellDataSetRow(this.gridList,
                        //     this.dataProvider,
                        //     i,
                        //     'amt',
                        //     0);
                        // this._realGridsService.gfn_CellDataSetRow(this.gridList,
                        //     this.dataProvider,
                        //     i,
                        //     'qty',
                        //     0);
                        // this._realGridsService.gfn_CellDataSetRow(this.gridList,
                        //     this.dataProvider,
                        //     i,
                        //     'price',
                        //     0);
                        this._realGridsService.gfn_CellDataSetRow(this.gridList,
                            this.dataProvider,
                            i,
                            'buyPrice',
                            0);
                        this._realGridsService.gfn_CellDataSetRow(this.gridList,
                            this.dataProvider,
                            i,
                            'salesPrice',
                            0);
                        this._realGridsService.gfn_CellDataSetRow(this.gridList,
                            this.dataProvider,
                            i,
                            'poQty',
                            0);
                        this._realGridsService.gfn_CellDataSetRow(this.gridList,
                            this.dataProvider,
                            i,
                            'availQty',
                            0);
                    }
                },200);
                return;
            }
            this._matDialogRef.close(param.data);
            this._changeDetectorRef.markForCheck();

        } else if (param.status === 'CANCEL') {

        } else {
            this._functionService.cfn_alert(param.msg);
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: any[]) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < sendData.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            sendData[i].selectAccount = this.formGroup.controls['account'].value;
        }
        return sendData;
    }
}
