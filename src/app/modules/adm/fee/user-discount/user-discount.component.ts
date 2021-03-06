import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {Columns} from "../../../../../@teamplat/services/realgrid/realgrid.types";
import {merge, Observable, Subject} from "rxjs";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {DeviceDetectorService} from "ngx-device-detector";
import {FuseRealGridService} from "../../../../../@teamplat/services/realgrid";
import {UserDiscountService} from "./user-discount.service";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {TeamPlatConfirmationService} from "../../../../../@teamplat/services/confirmation";
import {DiscountPagenation} from "../discount/discount.types";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {MatDialog} from "@angular/material/dialog";

@Component({
    selector: 'app-admin-user-discount',
    templateUrl: 'user-discount.component.html',
    styleUrls: ['./user-discount.component.scss']
})
export class UserDiscountComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    drawerMode: 'over' | 'side' = 'over';
    orderBy: any = 'asc';
    drawerOpened: boolean = false;
    isMobile: boolean = false;
    isLoading: boolean = false;
    pagenation: any | null = null;
    searchForm: FormGroup;
    columns: Columns[];
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gridList: RealGrid.GridView;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    dataProvider: RealGrid.LocalDataProvider;// @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    fields: DataFieldObject[] = [
        {fieldName: 'mId', dataType: ValueType.TEXT},
        {fieldName: 'businessNumber', dataType: ValueType.TEXT},
        {fieldName: 'businessName', dataType: ValueType.TEXT},
        {fieldName: 'addDate', dataType: ValueType.TEXT},
        {fieldName: 'discount', dataType: ValueType.TEXT},
        {fieldName: 'discountTitle', dataType: ValueType.TEXT},
        {fieldName: 'discountComment', dataType: ValueType.TEXT},
        {fieldName: 'beginDate', dataType: ValueType.TEXT},
        {fieldName: 'endDate', dataType: ValueType.TEXT},
        {fieldName: 'discountRate', dataType: ValueType.NUMBER},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(private _realGridsService: FuseRealGridService,
                private _changeDetectorRef: ChangeDetectorRef,
                public _matDialogPopup: MatDialog,
                private _formBuilder: FormBuilder,
                private _functionService: FunctionService,
                private _teamPlatConfirmationService: TeamPlatConfirmationService,
                private _userDiscountService: UserDiscountService,
                private _deviceService: DeviceDetectorService,
                private readonly breakpointObserver: BreakpointObserver) {
        this.isMobile = this._deviceService.isMobile();
    }

    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._userDiscountService.getUserDiscount(this._paginator.pageIndex, this._paginator.pageSize, 'addDate', 'desc', this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.dataProvider);
    }

    ngOnInit(): void {
        // ?????? Form ??????
        this.searchForm = this._formBuilder.group({
            businessName: ['']
        });

        this.columns = [
            {
                name: 'businessNumber',
                fieldName: 'businessNumber',
                type: 'data',
                width: '110',
                styleName: 'left-cell-text'
                ,
                header: {text: '????????? ??????', styleName: 'center-cell-text red-font-color'}
                ,
                renderer: 'mIdGrdPopup'
                ,
                popUpObject:
                    {
                        popUpId: 'P$_MID',
                        popUpHeaderText: '????????? ??????',
                        popUpDataSet: 'businessNumber:businessNumber|businessName:businessName|addDate:addDate'
                    }
            },
            {
                name: 'businessName', fieldName: 'businessName', type: 'data', width: '110', styleName: 'left-cell-text'
                , header: {text: '????????? ???', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'addDate', fieldName: 'addDate', type: 'data', width: '110', styleName: 'left-cell-text'
                , header: {text: '?????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'discountTitle',
                fieldName: 'discountTitle',
                type: 'data',
                width: '150',
                styleName: 'left-cell-text'
                ,
                header: {text: '??????', styleName: 'center-cell-text red-font-color'}
                ,
                renderer: 'discountGrdPopup'
                ,
                popUpObject:
                    {
                        popUpId: 'P$_DISCOUNT',
                        popUpHeaderText: '????????? ??????',
                        popUpDataSet: 'discount:discount' +
                            '|discountTitle:discountTitle' +
                            '|discountComment:discountComment' +
                            '|discountRate:discountRate'
                    }
            },
            {
                name: 'discountComment',
                fieldName: 'discountComment',
                type: 'data',
                width: '150',
                styleName: 'left-cell-text'
                ,
                header: {text: '??????', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'beginDate', fieldName: 'beginDate', type: 'date', width: '120', styleName: 'center-cell-text'
                , header: {text: '??????(??????)', styleName: 'center-cell-text red-font-color'}, renderer: {
                    showTooltip: true
                },
                datetimeFormat: 'yyyy-MM',
                mask: {editMask: '9999-99', includeFormat: false, allowEmpty: true}
                ,
                editor: {
                    type: 'date',
                    datetimeFormat: 'yyyy-MM',
                    textReadOnly: true,
                }
            },
            {
                name: 'endDate', fieldName: 'endDate', type: 'data', width: '120', styleName: 'center-cell-text'
                , header: {text: '??????(??????)', styleName: 'center-cell-text red-font-color'}, renderer: {
                    showTooltip: true
                },
                datetimeFormat: 'yyyy-MM',
                mask: {editMask: '9999-99', includeFormat: false, allowEmpty: true}
                ,
                editor: {
                    type: 'date',
                    datetimeFormat: 'yyyy-MM',
                    textReadOnly: true,
                }
            },

            {
                name: 'discountRate',
                fieldName: 'discountRate',
                type: 'data',
                width: '120',
                styleName: 'right-cell-text',
                header: {text: '?????????', styleName: 'center-cell-text'},
                numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
        ];
        this.dataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        // this.dataProvider.setOptions({
        //     softDeleting: false,
        //     deleteCreated: false
        // });

        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.dataProvider,
            'userDiscount',
            this.columns,
            this.fields,
            gridListOption);

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
        const validationList = ['businessNumber', 'discountTitle', 'beginDate', 'endDate'];
        this._realGridsService.gfn_ValidationOption(this.gridList, validationList);
        this._realGridsService.gfn_PopUp(this.isMobile, this.isExtraSmall, this.gridList, this.dataProvider, this.columns, this._matDialogPopup, this._unsubscribeAll, this._changeDetectorRef);

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                if (this._realGridsService.gfn_GridDataCnt(this.gridList, this.dataProvider)) {
                    this._realGridsService.gfn_GridLoadingBar(this.gridList, this.dataProvider, true);
                    const rtn = this._userDiscountService.getUserDiscount(this.pagenation.page, this.pagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
                    this.selectCallBack(rtn);
                }
            }
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };

        // ??? edit control
        this.gridList.setCellStyleCallback((grid, dataCell) => {

            //?????????
            if (dataCell.item.rowState === 'created') {
                if(dataCell.dataColumn.fieldName === 'beginDate' ||
                    dataCell.dataColumn.fieldName === 'endDate'){
                    return {editable: true};
                }else{
                    return {editable: false};
                }
            } else {
                if(dataCell.dataColumn.fieldName === 'beginDate' ||
                    dataCell.dataColumn.fieldName === 'endDate'){
                    this._realGridsService.gfn_PopUpBtnHide('mIdGrdPopup');
                    this._realGridsService.gfn_PopUpBtnHide('discountGrdPopup');
                    return {editable: true};
                }else{
                    this._realGridsService.gfn_PopUpBtnHide('mIdGrdPopup');
                    this._realGridsService.gfn_PopUpBtnHide('discountGrdPopup');
                    return {editable: false};
                }
            }
        });

        //????????? ??????
        this._paginator._intl.itemsPerPageLabel = '';

        this._changeDetectorRef.markForCheck();
    }

    select(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.dataProvider, true);
        const rtn = this._userDiscountService.getUserDiscount(0, 100, 'addDate', 'desc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.dataProvider, ex.userDiscount);
            this._userDiscountService.pagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((discountPagenation: DiscountPagenation) => {
                    // Update the pagination
                    this.pagenation = discountPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if (ex.userDiscount.length < 1) {
                this._functionService.cfn_alert('????????? ????????? ????????????.');
            }
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.dataProvider, false);
        });
    }

    //?????? ????????????
    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '????????? ?????????');
    }

    saveUserDiscount(): void {

        if (this._realGridsService.gfn_ValidationRows(this.gridList, this._functionService)) {
            return;
        }

        let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.dataProvider);

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
                    this._userDiscountService.saveUserDiscount(rows)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((userDiscount: any) => {
                            this._functionService.cfn_loadingBarClear();
                            this.alertMessage(userDiscount);
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
            this.select();
        } else if (param.status === 'CANCEL') {

        } else {
            this._functionService.cfn_alert(param.msg);
        }
    }

    pageEvent($event: PageEvent): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.dataProvider, true);
        const rtn = this._userDiscountService.getUserDiscount(this._paginator.pageIndex, this._paginator.pageSize, 'addDate', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.select();
        }
    }

    addRow() {
        const values = [
            '',
        ];

        this._realGridsService.gfn_AddRow(this.gridList, this.dataProvider, values);
    }

    delRow() {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.dataProvider);

        if (checkValues.length < 1) {
            this._functionService.cfn_alert('?????? ????????? ??????????????????.');
            return;
        }

        this._realGridsService.gfn_DelRow(this.gridList, this.dataProvider);
    }
}
