import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {merge, Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Deposit, DepositPagenation} from "./deposit.types";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {Columns} from "../../../../../@teamplat/services/realgrid/realgrid.types";
import {FuseRealGridService} from "../../../../../@teamplat/services/realgrid";
import {MatDialog} from "@angular/material/dialog";
import {TeamPlatConfirmationService} from "../../../../../@teamplat/services/confirmation";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {CommonCode, FuseUtilsService} from "../../../../../@teamplat/services/utils";
import {CodeStore} from "../../../../core/common-code/state/code.store";
import {DeviceDetectorService} from "ngx-device-detector";
import {DepositService} from "./deposit.service";
import {map, switchMap, takeUntil} from "rxjs/operators";
import * as moment from "moment";
import {formatDate} from "@angular/common";

@Component({
    selector: 'app-dms-deposit',
    templateUrl: './deposit.component.html',
    styleUrls: ['./deposit.component.scss']
})

export class DepositComponent implements OnInit, OnDestroy, AfterViewInit {
    isLoading: boolean = false;
    isSearchForm: boolean = false;
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    drawerMode: 'over' | 'side' = 'over';
    orderBy: any = 'asc';
    deposits$: Observable<Deposit[]>;
    drawerOpened: boolean = false;
    isMobile: boolean = false;
    depositPagenation: DepositPagenation | null = null;
    searchForm: FormGroup;
    type: CommonCode[] = null;
    ynFlag: CommonCode[] = null;

    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    depositDataProvider: RealGrid.LocalDataProvider;
    depositColumns: Columns[];

    depositFields: DataFieldObject[] = [
        {fieldName: 'deposit', dataType: ValueType.TEXT},
        {fieldName: 'depositFlag', dataType: ValueType.TEXT},
        {fieldName: 'mgtFlag', dataType: ValueType.TEXT},
        {fieldName: 'billing', dataType: ValueType.TEXT},
        {fieldName: 'lineNo', dataType: ValueType.TEXT},
        {fieldName: 'account', dataType: ValueType.TEXT},
        {fieldName: 'accountNm', dataType: ValueType.TEXT},
        {fieldName: 'type', dataType: ValueType.TEXT},
        {fieldName: 'note', dataType: ValueType.TEXT},
        {fieldName: 'depositDate', dataType: ValueType.TEXT},
        {fieldName: 'depositAmt', dataType: ValueType.NUMBER},
        {fieldName: 'remark', dataType: ValueType.TEXT},
        {fieldName: 'udf1', dataType: ValueType.TEXT},
        {fieldName: 'udf2', dataType: ValueType.TEXT},
        {fieldName: 'udf3', dataType: ValueType.TEXT},
        {fieldName: 'udf4', dataType: ValueType.TEXT},
        {fieldName: 'udf5', dataType: ValueType.TEXT},
        {fieldName: 'udf6', dataType: ValueType.TEXT},
        {fieldName: 'udf7', dataType: ValueType.TEXT},
        {fieldName: 'udf8', dataType: ValueType.TEXT},
        {fieldName: 'udf9', dataType: ValueType.TEXT},
        {fieldName: 'udf10', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _realGridsService: FuseRealGridService,
        private _matDialog: MatDialog,
        private _depositService: DepositService,
        private _formBuilder: FormBuilder,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _functionService: FunctionService,
        private _utilService: FuseUtilsService,
        private _codeStore: CodeStore,
        public _matDialogPopup: MatDialog,
        private _deviceService: DeviceDetectorService,
        private _changeDetectorRef: ChangeDetectorRef,
        private readonly breakpointObserver: BreakpointObserver) {
        this.isMobile = this._deviceService.isMobile();
        this.type = _utilService.commonValue(_codeStore.getValue().data, 'DW_TYPE');
        this.ynFlag = _utilService.commonValue(_codeStore.getValue().data, 'YN_FLAG');
    }

    ngOnInit(): void {
        // ?????? Form ??????
        this.searchForm = this._formBuilder.group({
            accountNm: [''],
            range: [{
                start: moment().utc(true).add(-1, 'month').endOf('day').toISOString(),
                end: moment().utc(true).startOf('day').toISOString()
            }],
            start: [],
            end: []
        });
        const valuesType = [];
        const lablesType = [];

        this.type.forEach((param: any) => {
            valuesType.push(param.id);
            lablesType.push(param.name);
        });

        const valuesFlag = [];
        const lablesFlag = [];

        this.ynFlag.forEach((param: any) => {
            valuesFlag.push(param.id);
            lablesFlag.push(param.name);
        });

        //????????? ??????
        this.depositColumns = [
            // {
            //     name: 'deposit', fieldName: 'deposit', type: 'data', width: '120', styleName: 'left-cell-text'
            //     , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
            //         showTooltip: true
            //     }
            // },
            {
                name: 'depositFlag', fieldName: 'depositFlag', type: 'data', width: '80', styleName: 'center-cell-text',
                header: {text: '??????', styleName: 'center-cell-text'},
                values: valuesFlag,
                labels: lablesFlag,
                lookupDisplay: true,
            },
            {
                name: 'account', fieldName: 'account', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '????????? ??????', styleName: 'center-cell-text red-font-color'}
                , renderer: 'accountGrdPopup'
                , popUpObject:
                    {
                        popUpId: 'P$_ACCOUNT',
                        popUpHeaderText: '????????? ??????',
                        popUpDataSet: 'account:accountCd|accountNm:accountNm'
                        // where : [{
                        //     key: 'account',
                        //     replace : 'account:=:#{account}'
                        // }]
                    }
            },
            {
                name: 'accountNm', fieldName: 'accountNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '????????? ???', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'type', fieldName: 'type', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '??????', styleName: 'center-cell-text red-font-color'},
                values: valuesType,
                labels: lablesType,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.type), renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'depositDate', fieldName: 'depositDate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text red-font-color'}, renderer: {
                    showTooltip: true
                }
                , datetimeFormat: 'yyyy-MM-dd'
                , mask: {editMask: '9999-99-99', includeFormat: false, allowEmpty: true}
                , editor: {
                    type: 'date',
                    datetimeFormat: 'yyyy-MM-dd',
                    textReadOnly: true,
                }
            },
            {
                name: 'depositAmt',
                fieldName: 'depositAmt',
                type: 'data',
                width: '120',
                styleName: 'right-cell-text',
                header: {text: '????????????', styleName: 'center-cell-text blue-font-color'},
                numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            // {
            //     name: 'note', fieldName: 'note', type: 'data', width: '150', styleName: 'left-cell-text'
            //     , header: {text: 'Note.', styleName: 'center-cell-text'}, renderer: {
            //         showTooltip: true
            //     }
            // },
            {
                name: 'remark', fieldName: 'remark', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
        ];
        this.depositDataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.depositDataProvider,
            'deposit',
            this.depositColumns,
            this.depositFields,
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
        const validationList = ['account', 'type', 'depositDate'];
        this._realGridsService.gfn_ValidationOption(this.gridList, validationList);
        this._realGridsService.gfn_PopUp(this.isMobile, this.isExtraSmall, this.gridList, this.depositDataProvider, this.depositColumns, this._matDialogPopup, this._unsubscribeAll, this._changeDetectorRef);

        // ??? edit control
        this.gridList.setCellStyleCallback((grid, dataCell) => {

            //?????????
            if (dataCell.item.rowState === 'created') {
                if (dataCell.dataColumn.fieldName === 'deposit'||
                    dataCell.dataColumn.fieldName === 'account'||
                    dataCell.dataColumn.fieldName === 'accountNm'||
                    dataCell.dataColumn.fieldName === 'depositFlag') {
                    return {editable: false};
                } else {
                    return {editable: true};
                }
            }else{

                const depositFlag = grid.getValue(dataCell.index.itemIndex, 'depositFlag');
                if(depositFlag === 'Y'){
                    return {editable: false};
                }else{

                    if (dataCell.dataColumn.fieldName === 'deposit'||
                        dataCell.dataColumn.fieldName === 'account'||
                        dataCell.dataColumn.fieldName === 'accountNm'||
                        dataCell.dataColumn.fieldName === 'depositFlag') {
                        return {editable: false};
                    } else {
                        return {editable: true};
                    }
                }
            }
        });

        this.gridList.setRowStyleCallback((grid, item, fixed) => {
        });

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                if(this._realGridsService.gfn_GridDataCnt(this.gridList, this.depositDataProvider)){
                    this._realGridsService.gfn_GridLoadingBar(this.gridList, this.depositDataProvider, true);
                    const rtn = this._depositService.getHeader(this.depositPagenation.page, this.depositPagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
                    this.selectCallBack(rtn);
                }
            }
            ;
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };

        //????????? ??????
        this._paginator._intl.itemsPerPageLabel = '';

        //this.selectHeader();
        this._changeDetectorRef.markForCheck();
    }

    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._depositService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'depositDate', this.orderBy, this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.depositDataProvider);
    }

    setGridData(): void {
        this.deposits$ = this._depositService.deposits$;
        this._depositService.deposits$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((deposits: any) => {
                // Update the counts
                if (deposits !== null) {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.depositDataProvider, deposits);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
    selectHeader(): void {
        this.isSearchForm = true;
        this.searchSetValue();
        const rtn = this._depositService.getHeader(0, 40, 'depositDate', 'desc', this.searchForm.getRawValue());
        //this.setGridData();
        this.selectCallBack(rtn);
    }

    searchFormClick(): void {
        if (this.isSearchForm) {
            this.isSearchForm = false;
        } else {
            this.isSearchForm = true;
        }
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.selectHeader();
        }
    }

    //?????????
    pageEvent($event: PageEvent): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.depositDataProvider, true);
        const rtn = this._depositService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'depositDate', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '?????? ??????');
    }

    searchSetValue(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.depositDataProvider, true);
        this.searchForm.patchValue({'start': this.searchForm.get('range').value.start});
        this.searchForm.patchValue({'end': this.searchForm.get('range').value.end});
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.depositDataProvider, ex.deposit);
            this._depositService.depositPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((depositPagenation: DepositPagenation) => {
                    // Update the pagination
                    this.depositPagenation = depositPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if(ex.deposit.length < 1){
                this._functionService.cfn_alert('????????? ????????? ????????????.');
            }
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.depositDataProvider, false);
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    addDeposit(){
        const now = new Date();
        const date = formatDate(new Date(now.setDate(now.getDate())), 'yyyy-MM-dd', 'en');

        const values = [
            '', 'N', '', '', '', '', '','','', date, 0, '', '', '', '', '', '', '', '', '', '', ''
        ];

        this._realGridsService.gfn_AddRow(this.gridList, this.depositDataProvider, values);
    }

    delDeposit(): boolean {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.depositDataProvider);

        if (checkValues.length < 1) {
            this._functionService.cfn_alert('?????? ????????? ??????????????????.');
            return;
        }
        checkValues.forEach((r) => {
            if(r.depositFlag === 'Y'){

                this._functionService.cfn_alert('????????? ????????? ?????? ??? ????????? ??? ????????????.');
                this.selectHeader();
                return;
            }
        });

        this._realGridsService.gfn_DelRow(this.gridList, this.depositDataProvider);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    saveDeposit() {
        if (this._realGridsService.gfn_ValidationRows(this.gridList, this._functionService)) {
            return;
        }
        let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.depositDataProvider);

        let detailCheck = false;

        if (rows.length === 0) {
            this._functionService.cfn_alert('????????? ?????? ???????????? ????????????.');
            detailCheck = true;
        }
        rows.forEach((r) => {
           if(r.depositFlag === 'Y'){

               this._functionService.cfn_alert('????????? ????????? ?????? ??? ????????? ??? ????????????.');
               detailCheck = true;
           }
        });
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
                    this._depositService.saveDeposit(rows)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((deposit: any) => {
                            this._functionService.cfn_loadingBarClear();
                            this.alertMessage(deposit);
                            this._changeDetectorRef.markForCheck();
                        });
                }
            });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }



    alertMessage(param: any): void {
        if (param.status === 'SUCCESS') {
            this._functionService.cfn_alert('??????????????? ?????????????????????.');
            this.selectHeader();
        } else if (param.status === 'CANCEL') {

        } else {
            this._functionService.cfn_alert(param.msg);
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    closeDeposit() {
        let rows = this._realGridsService.gfn_GetCheckRows(this.gridList, this.depositDataProvider);

        let detailCheck = false;

        if (rows.length === 0) {
            this._functionService.cfn_alert('????????? ?????? ???????????? ????????????.');
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
                    this._depositService.closeDeposit(rows)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((deposit: any) => {
                            this._functionService.cfn_loadingBarClear();
                            this.alertMessage(deposit);
                            this._changeDetectorRef.markForCheck();
                        });
                }
            });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
}
