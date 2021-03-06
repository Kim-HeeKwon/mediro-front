import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SupplyStatus, SupplyStatusPagenation} from './status.types';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {MatDialog} from '@angular/material/dialog';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {StatusService} from './status.service';
import {FunctionService} from '../../../../../@teamplat/services/function';
import {TeamPlatConfirmationService} from '../../../../../@teamplat/services/confirmation';
import {DeviceDetectorService} from 'ngx-device-detector';
import {FuseRealGridService} from '../../../../../@teamplat/services/realgrid';
import {Columns} from '../../../../../@teamplat/services/realgrid/realgrid.types';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import * as moment from 'moment';
import {EstimateHeaderPagenation} from "../../estimate-order/estimate/estimate.types";
import {StockHistoryPagenation} from "../../stock/stock/stock.types";

@Component({
    selector: 'dms-supply-status',
    templateUrl: './status.component.html',
    styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    isLoading: boolean = false;
    isMobile: boolean = false;
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    searchForm: FormGroup;
    supplyStatus$: Observable<SupplyStatus[]>;
    supplyStatusPagenation: SupplyStatusPagenation | null = null;

    suplyColumns: Columns[];
    suplyFlagCode: CommonCode[] = null;
    mFlag: CommonCode[] = null;
    udiFlag: CommonCode[] = null;
    suplyTypeCode: CommonCode[] = null;
    isSearchForm: boolean = false;
    orderBy: any = 'desc';
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;

    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    suplyDataProvider: RealGrid.LocalDataProvider;
    suplyFields: DataFieldObject[] = [
        {fieldName: 'no', dataType: ValueType.TEXT},
        {fieldName: 'mId', dataType: ValueType.TEXT},
        {fieldName: 'mflag', dataType: ValueType.TEXT},
        {fieldName: 'serialkey', dataType: ValueType.TEXT},
        {fieldName: 'suplyContStdmt', dataType: ValueType.TEXT},
        {fieldName: 'suplyFlagCode', dataType: ValueType.TEXT},
        {fieldName: 'suplyTypeCode', dataType: ValueType.TEXT},
        {fieldName: 'meddevItemSeq', dataType: ValueType.TEXT},
        {fieldName: 'stdCode', dataType: ValueType.TEXT},
        {fieldName: 'lotNo', dataType: ValueType.TEXT},
        {fieldName: 'manufYm', dataType: ValueType.TEXT},
        {fieldName: 'bcncCode', dataType: ValueType.TEXT},
        {fieldName: 'bcncEntpName', dataType: ValueType.TEXT},
        {fieldName: 'dvyfgEntpName', dataType: ValueType.TEXT},
        {fieldName: 'suplyDate', dataType: ValueType.TEXT},
        {fieldName: 'suplyQty', dataType: ValueType.NUMBER},
        {fieldName: 'suplyUntpc', dataType: ValueType.NUMBER},
        {fieldName: 'suplyAmt', dataType: ValueType.NUMBER},
        {fieldName: 'udiFlag', dataType: ValueType.TEXT},
        {fieldName: 'message', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _realGridsService: FuseRealGridService,
        private _matDialog: MatDialog,
        private _codeStore: CodeStore,
        private _statusService: StatusService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _utilService: FuseUtilsService,
        private _functionService: FunctionService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private readonly breakpointObserver: BreakpointObserver,
        private _deviceService: DeviceDetectorService,
    ) {
        this.isMobile = this._deviceService.isMobile();
        this.suplyFlagCode = _utilService.commonValue(_codeStore.getValue().data, 'SUPLYFLAGCODE');
        this.udiFlag = _utilService.commonValue(_codeStore.getValue().data, 'UDI_FLAG');
        this.mFlag = _utilService.commonValue(_codeStore.getValue().data, 'M_FLAG');
        this.suplyTypeCode = _utilService.commonValue(_codeStore.getValue().data, 'SUPLYTYPECODE');
    }

    ngOnInit(): void {
        // ?????? Form ??????
        this.searchForm = this._formBuilder.group({
            searchText: [''],
            searchText2: [''],
            range: [{
                start: moment().utc(true).add(-7, 'day').endOf('day').toISOString(),
                end: moment().utc(true).startOf('day').toISOString()
            }],
            start: [],
            end: [],
        });

        const valuesSuplyFlagCode = [];
        const lablesSuplyFlagCode = [];

        const valuesUdiFlag = [];
        const lablesUdiFlag = [];

        const valuesMFlag = [];
        const lablesMFlag = [];

        const valuesSuplyTypeCode = [];
        const lablesSuplyTypeCode = [];

        this.suplyFlagCode.forEach((param: any) => {
            valuesSuplyFlagCode.push(param.id);
            lablesSuplyFlagCode.push(param.name);
        });
        this.udiFlag.forEach((param: any) => {
            valuesUdiFlag.push(param.id);
            lablesUdiFlag.push(param.name);
        });
        this.mFlag.forEach((param: any) => {
            valuesMFlag.push(param.id);
            lablesMFlag.push(param.name);
        });
        this.suplyTypeCode.forEach((param: any) => {
            valuesSuplyTypeCode.push(param.id);
            lablesSuplyTypeCode.push(param.name);
        });

        //????????? ??????
        this.suplyColumns = [
            {
                name: 'mflag', fieldName: 'mflag', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '????????????', styleName: 'center-cell-text'},
                values: valuesMFlag,
                labels: lablesMFlag,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.mFlag), renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'suplyFlagCode',
                fieldName: 'suplyFlagCode',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text',
                header: {text: '????????????', styleName: 'center-cell-text'},
                values: valuesSuplyFlagCode,
                labels: lablesSuplyFlagCode,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.suplyFlagCode),
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'suplyTypeCode',
                fieldName: 'suplyTypeCode',
                type: 'data',
                width: '200',
                styleName: 'left-cell-text',
                header: {text: '????????????', styleName: 'center-cell-text'},
                values: valuesSuplyTypeCode,
                labels: lablesSuplyTypeCode,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.suplyTypeCode),
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'meddevItemSeq',
                fieldName: 'meddevItemSeq',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text'
                ,
                header: {text: '??????????????????', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'stdCode', fieldName: 'stdCode', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'lotNo', fieldName: 'lotNo', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'manufYm', fieldName: 'manufYm', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'bcncCode', fieldName: 'bcncCode', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '??????????????? ??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'bcncEntpName', fieldName: 'bcncEntpName', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '???????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'dvyfgEntpName',
                fieldName: 'dvyfgEntpName',
                type: 'data',
                width: '150',
                styleName: 'left-cell-text'
                ,
                header: {text: '???????????? ??????', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'suplyDate', fieldName: 'suplyDate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'suplyQty', fieldName: 'suplyQty', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
                , numberFormat: '#,##0'
            },
            {
                name: 'suplyUntpc', fieldName: 'suplyUntpc', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
                , numberFormat: '#,##0'
            },
            {
                name: 'suplyAmt', fieldName: 'suplyAmt', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
                , numberFormat: '#,##0'
            },
            {
                name: 'udiFlag', fieldName: 'udiFlag', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '??????', styleName: 'center-cell-text'},
                values: valuesUdiFlag,
                labels: lablesUdiFlag,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.udiFlag), renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'message', fieldName: 'message', type: 'data', width: '300', styleName: 'left-cell-text'
                , header: {text: '?????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
        ];

        //????????? Provider
        this.suplyDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //????????? ??????
        const gridListOption = {
            stateBar: false,
            checkBar: true,
            footers: false,
        };

        //????????? ??????
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.suplyDataProvider,
            'suplyGrid',
            this.suplyColumns,
            this.suplyFields,
            gridListOption);

        //????????? ??????
        this.gridList.setEditOptions({
            readOnly: true,
            insertable: false,
            appendable: false,
            editable: false,
            deletable: false,
            checkable: true,
            softDeleting: false,
        });
        this.gridList.deleteSelection(true);
        this.gridList.setDisplayOptions({liveScroll: false,});
        this.gridList.setPasteOptions({enabled: false,});
        this.gridList.setCopyOptions({
            enabled: true,
            singleMode: false
        });

        //??????
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                if (clickData.cellType !== 'head') {
                    // eslint-disable-next-line max-len
                    this._realGridsService.gfn_GridLoadingBar(this.gridList, this.suplyDataProvider, true);
                    const rtn = this._statusService.getHeader(this.supplyStatusPagenation.page, this.supplyStatusPagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
                    this.selectCallBack(rtn);
                }
            }
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };

        //????????? ??????
        this._paginator._intl.itemsPerPageLabel = '';
        this.setGridData();

        this._statusService.suppleyStatusPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((statusPagenation: SupplyStatusPagenation) => {
                this.supplyStatusPagenation = statusPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    setGridData(): void {

        this.supplyStatus$ = this._statusService.supplyStatus$;
        this._statusService.supplyStatus$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((status: any) => {
                if (status !== null) {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.suplyDataProvider, status);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

    }

    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._statusService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'serialkey', this.orderBy, this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.suplyDataProvider);
    }

    selectHeader(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.suplyDataProvider, true);
        this.searchForm.patchValue({'start': this.searchForm.get('range').value.start});
        this.searchForm.patchValue({'end': this.searchForm.get('range').value.end});

        const rtn = this._statusService.getHeader(0, 20, 'serialkey', 'desc', this.searchForm.getRawValue());

        this.selectCallBack(rtn);
        // this.setGridData();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    suplyResend() {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.suplyDataProvider);
        if (checkValues.length < 1) {
            this._functionService.cfn_alert('????????? ????????? ??????????????????.');
            return;
        } else {
            const confirmation = this._teamPlatConfirmationService.open({
                title: '',
                message: '????????? ???????????????????',
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
                        const sendData = checkValues;
                        this._statusService.suplyResend(sendData)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((status: any) => {
                                this._functionService.cfn_loadingBarClear();
                                this._functionService.cfn_alertCheckMessage(status);
                                this.selectHeader();
                                // Mark for check
                                this._changeDetectorRef.markForCheck();
                            });
                    } else {
                        this.selectHeader();
                    }
                });
        }
    }

    searchFormClick(): void {
        if (this.isSearchForm) {
            this.isSearchForm = false;
        } else {
            this.isSearchForm = true;
        }
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '????????? ??????');
    }

    //?????????
    pageEvent($event: PageEvent): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.suplyDataProvider, true);
        const rtn = this._statusService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'serialkey', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.selectHeader();
        }
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {
            this._realGridsService.gfn_DataSetGrid(this.gridList, this.suplyDataProvider, ex.estimateHeader);
            this._statusService.suppleyStatusPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((suppleyStatusPagenation: SupplyStatusPagenation) => {
                    // Update the pagination
                    this.supplyStatusPagenation = suppleyStatusPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if(ex._value.length < 1){
                this._functionService.cfn_alert('????????? ????????? ????????????.');
            }
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.suplyDataProvider, false);
        });
    }
}
