import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Columns} from '../../../../../@teamplat/services/realgrid/realgrid.types';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {DeviceDetectorService} from 'ngx-device-detector';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {CommonPopupService} from './common-popup.service';
import {FuseRealGridService} from '../../../../../@teamplat/services/realgrid';
import {MatDialog} from '@angular/material/dialog';
import {FunctionService} from '../../../../../@teamplat/services/function';
import {TeamPlatConfirmationService} from '../../../../../@teamplat/services/confirmation';
import {CommonPopupPagenation} from './common-popup.types';

@Component({
    selector: 'app-admin-common-popup',
    templateUrl: 'common-popup.component.html',
    styleUrls: ['./common-popup.component.scss']
})
export class CommonPopupComponent implements OnInit, OnDestroy, AfterViewInit {
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
    extUseYn: CommonCode[] = null;
    detailExtUseYn: CommonCode[] = null;
    searchForm: FormGroup;
    popUpForm: FormGroup;
    columns: Columns[];
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gridList: RealGrid.GridView;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    dataProvider: RealGrid.LocalDataProvider;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    fields: DataFieldObject[] = [
        {fieldName: 'extPopupNo', dataType: ValueType.TEXT},
        {fieldName: 'extPopupNm', dataType: ValueType.TEXT},
        {fieldName: 'extUseYn', dataType: ValueType.TEXT},
    ];
    detailColumns: Columns[];
    // @ts-ignore
    detailGridList: RealGrid.GridView;
    // @ts-ignore
    detailDataProvider: RealGrid.LocalDataProvider;
    // @ts-ignore
    detailFields: DataFieldObject[] = [
        {fieldName: 'extPopupNo', dataType: ValueType.TEXT},
        {fieldName: 'extColId', dataType: ValueType.TEXT},
        {fieldName: 'extColNm', dataType: ValueType.TEXT},
        {fieldName: 'extUseYn', dataType: ValueType.TEXT},
        {fieldName: 'extColWidVal', dataType: ValueType.TEXT},
        {fieldName: 'extColSortSeqVal', dataType: ValueType.TEXT},
        {fieldName: 'extColCondGbnVal', dataType: ValueType.TEXT},
        {fieldName: 'extColQrySortSeqVal', dataType: ValueType.TEXT},
        {fieldName: 'extColFmtVal', dataType: ValueType.TEXT},
        {fieldName: 'extSelBoxAttrVal', dataType: ValueType.TEXT},
        {fieldName: 'extEtcQryColCondVal', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _utilService: FuseUtilsService,
        private _codeStore: CodeStore,
        private _deviceService: DeviceDetectorService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _realGridsService: FuseRealGridService,
        private _commonPopupService: CommonPopupService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _formBuilder: FormBuilder,
        private _functionService: FunctionService,
        public _matDialogPopup: MatDialog,
        private readonly breakpointObserver: BreakpointObserver) {
        this.extUseYn = this._utilService.commonValue(_codeStore.getValue().data, 'YN_FLAG');
        this.detailExtUseYn = this._utilService.commonValue(_codeStore.getValue().data, 'YN_FLAG');
        this.isMobile = this._deviceService.isMobile();
    }

    ngAfterViewInit(): void {
        // merge(this._paginator.page).pipe(
        //     switchMap(() => {
        //         this.isLoading = true;
        //         // eslint-disable-next-line max-len
        //         return this._commonPopupService.getCommonPopup(this._paginator.pageIndex, this._paginator.pageSize, 'extPopupNm', 'desc', this.searchForm.getRawValue());
        //     }),
        //     map(() => {
        //         this.isLoading = false;
        //     })
        // ).subscribe();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.dataProvider);
        this._realGridsService.gfn_Destory(this.detailGridList, this.detailDataProvider);
    }

    ngOnInit(): void {
        this.searchForm = this._formBuilder.group({
            extPopupNm: [''],
        });
        this.popUpForm = this._formBuilder.group({
            extPopupNo: [''],
            extPopupNm: [''],
            extUseYn: [''],
            query: ['']
        });

        const valuesUse = [];
        const lablesUse = [];

        this.extUseYn.forEach((param: any) => {
            valuesUse.push(param.id);
            lablesUse.push(param.name);
        });

        const detailValuesUse = [];
        const detailLablesUse = [];

        this.detailExtUseYn.forEach((param: any) => {
            valuesUse.push(param.id);
            lablesUse.push(param.name);
        });

        this.columns = [
            {
                name: 'extPopupNo', fieldName: 'extPopupNo', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '?????? ??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: '???', fieldName: 'extPopupNm', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '???', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'extUseYn', fieldName: 'extUseYn', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'},
                values: valuesUse,
                labels: lablesUse,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.extUseYn),
                renderer: {
                    showTooltip: true
                }
            },
        ];

        this.dataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: true,
        };

        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.dataProvider,
            'commonPopup',
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
        const validationList = ['extPopupNo', 'extPopupNm', 'extUseYn'];
        this._realGridsService.gfn_ValidationOption(this.gridList, validationList);
        this._realGridsService.gfn_PopUp(this.isMobile, this.isExtraSmall, this.gridList, this.dataProvider, this.columns, this._matDialogPopup, this._unsubscribeAll, this._changeDetectorRef);

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                if (this._realGridsService.gfn_GridDataCnt(this.gridList, this.dataProvider)) {
                    this._realGridsService.gfn_GridLoadingBar(this.gridList, this.dataProvider, true);
                    const rtn = this._commonPopupService.getCommonPopup(this.pagenation.page, this.pagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
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

        this.detailColumns = [
            {
                name: 'extPopupNo', fieldName: 'extPopupNo', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '?????? ??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'extColId', fieldName: 'extColId', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '?????? ID', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'extColNm', fieldName: 'extColNm', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '?????? ???', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'extUseYn', fieldName: 'extUseYn', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'},
                values: detailValuesUse,
                labels: detailLablesUse,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.detailExtUseYn),
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'extColWidVal', fieldName: 'extColWidVal', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'extColSortSeqVal',
                fieldName: 'extColSortSeqVal',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text'
                ,
                header: {text: '??????', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'extColCondGbnVal',
                fieldName: 'extColCondGbnVal',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text'
                ,
                header: {text: '????????????', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'extColQrySortSeqVal',
                fieldName: 'extColQrySortSeqVal',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text'
                ,
                header: {text: '??????', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'extColFmtVal', fieldName: 'extColFmtVal', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'extSelBoxAttrVal',
                fieldName: 'extSelBoxAttrVal',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text'
                ,
                header: {text: 'val ??????', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'extEtcQryColCondVal',
                fieldName: 'extEtcQryColCondVal',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text'
                ,
                header: {text: '??????', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
        ];

        //????????? Provider
        this.detailDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //????????? ??????
        const detailGridListOption = {
            stateBar: true,
            checkBar: true,
            footers: true,
        };

        this.detailDataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        //????????? ??????
        this.detailGridList = this._realGridsService.gfn_CreateGrid(
            this.detailDataProvider,
            'commonPopupDetail',
            this.detailColumns,
            this.detailFields,
            detailGridListOption);

        //????????? ??????
        this.detailGridList.setEditOptions({
            readOnly: false,
            insertable: false,
            appendable: false,
            editable: true,
            updatable: true,
            deletable: true,
            checkable: true,
            softDeleting: true,
        });

        this.detailGridList.deleteSelection(true);
        this.detailGridList.setDisplayOptions({liveScroll: false,});
        this.detailGridList.setCopyOptions({
            enabled: true,
            singleMode: false
        });

        this.detailGridList.setPasteOptions({
            enabled: true,
            startEdit: false,
            commitEdit: true,
            checkReadOnly: true
        });
        this.detailGridList.editOptions.commitByCell = true;
        this.detailGridList.editOptions.validateOnEdited = true;
        this._realGridsService.gfn_EditGrid(this.detailGridList);
        const detailValidationList = ['extPopupNo', 'extColId', 'extColNm', 'extUseYn', 'extColWidVal', 'extColSortSeqVal', 'extColCondGbnVal', 'extColQrySortSeqVal', 'extColFmtVal', 'extSelBoxAttrVal', 'extEtcQryColCondVal'];
        this._realGridsService.gfn_ValidationOption(this.detailGridList, detailValidationList);
        this._realGridsService.gfn_PopUp(this.isMobile, this.isExtraSmall, this.detailGridList, this.detailDataProvider, this.detailColumns, this._matDialogPopup, this._unsubscribeAll, this._changeDetectorRef);

        //????????? ??????
        // this._paginator._intl.itemsPerPageLabel = '';

        this._changeDetectorRef.markForCheck();
    }

    select(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.dataProvider, true);
        const rtn = this._commonPopupService.getCommonPopup(0, 100, 'extPopupNm', 'desc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.select();
        }
    }

    //?????? ????????????
    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '???????????? ??????');
    }

    addRow(val: any): void {
        if (val === 'grid') {
            const values = [
                '', '', ''
            ];

            this._realGridsService.gfn_AddRow(this.gridList, this.dataProvider, values);
        } else if (val === 'gridDetail') {
            const values = [
                '', '', '', '', '', '', '', '', '', '', ''
            ];

            this._realGridsService.gfn_AddRow(this.detailGridList, this.detailDataProvider, values);
        }
    }

    delRow(val: any): void {
        if (val === 'grid') {
            const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.dataProvider);

            if (checkValues.length < 1) {
                this._functionService.cfn_alert('?????? ????????? ??????????????????.');
                return;
            }

            this._realGridsService.gfn_DelRow(this.gridList, this.dataProvider);
        } else if (val === 'gridDetail') {
            const checkValues = this._realGridsService.gfn_GetCheckRows(this.detailGridList, this.detailDataProvider);

            if (checkValues.length < 1) {
                this._functionService.cfn_alert('?????? ????????? ??????????????????.');
                return;
            }

            this._realGridsService.gfn_DelRow(this.detailGridList, this.detailDataProvider);
        }
    }

    addPopUp(): void {
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
                }
            });
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    delPopUp(): void {
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
                    this.popUpForm.patchValue({'extPopupNo': ''});
                    this.popUpForm.patchValue({'extPopupNm': ''});
                    this.popUpForm.patchValue({'extUseYn': ''});
                    this.popUpForm.patchValue({'query': ''});
                }
            });
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    saveCommonCode(val: any): void {
        if (val === 'grid') {
            if (this._realGridsService.gfn_ValidationRows(this.gridList, this._functionService)) {
                return;
            }

            const rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.dataProvider);

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
                        this._commonPopupService.saveCommonPopup(rows)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((commonPopup: any) => {
                                this._functionService.cfn_loadingBarClear();
                                this.alertMessage(commonPopup);
                                this._changeDetectorRef.markForCheck();
                            });
                    }
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();
        } else if (val === 'gridDetail') {
            if (this._realGridsService.gfn_ValidationRows(this.detailGridList, this._functionService)) {
                return;
            }

            const rows = this._realGridsService.gfn_GetEditRows(this.detailGridList, this.detailDataProvider);

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
                        this._commonPopupService.saveDetailCommonPopup(rows)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((detailCommonPopup: any) => {
                                this._functionService.cfn_loadingBarClear();
                                this.alertMessage(detailCommonPopup);
                                this._changeDetectorRef.markForCheck();
                            });
                    }
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    // pageEvent($event: PageEvent): void {
    //     const rtn = this._commonPopupService.getCommonPopup(this._paginator.pageIndex, this._paginator.pageSize, 'extPopupNm', this.orderBy, this.searchForm.getRawValue());
    //     this.selectCallBack(rtn);
    // }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {
            this._realGridsService.gfn_DataSetGrid(this.gridList, this.dataProvider, ex.commonPopup);
            this._commonPopupService.pagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((commonPopupPagenation: CommonPopupPagenation) => {
                    // Update the pagination
                    this.pagenation = commonPopupPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if (ex.commonPopup.length < 1) {
                this._functionService.cfn_alert('????????? ????????? ????????????.');
            }
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.dataProvider, false);
        });
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
}
