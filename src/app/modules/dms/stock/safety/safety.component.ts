import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {Safety, SafetyPagenation} from './safety.types';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {Columns} from '../../../../../@teamplat/services/realgrid/realgrid.types';
import {FuseRealGridService} from '../../../../../@teamplat/services/realgrid';
import {MatDialog} from '@angular/material/dialog';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {DeviceDetectorService} from 'ngx-device-detector';
import {SafetyService} from './safety.service';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {FunctionService} from '../../../../../@teamplat/services/function';
import {TeamPlatConfirmationService} from '../../../../../@teamplat/services/confirmation';

@Component({
    selector: 'dms-app-safety',
    templateUrl: './safety.component.html',
    styleUrls: ['./safety.component.scss']
})
export class SafetyComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );

    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    drawerMode: 'over' | 'side' = 'over';
    orderBy: any = 'asc';
    safetys$: Observable<Safety[]>;
    drawerOpened: boolean = false;
    isMobile: boolean = false;
    safetyPagenation: SafetyPagenation | null = null;
    searchForm: FormGroup;
    itemGrades: CommonCode[] = [];
    invYn: CommonCode[] = [];
    safetyType: CommonCode[] = [];

    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    safetyDataProvider: RealGrid.LocalDataProvider;
    safetyColumns: Columns[];

    // @ts-ignore
    safetyFields: DataFieldObject[] = [
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'fomlInfo', dataType: ValueType.TEXT},
        {fieldName: 'supplier', dataType: ValueType.TEXT},
        {fieldName: 'supplierNm', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'safetyQty', dataType: ValueType.NUMBER},
        {fieldName: 'safety', dataType: ValueType.TEXT},
        {fieldName: 'safetyType', dataType: ValueType.TEXT},
        {fieldName: 'safetyStatus', dataType: ValueType.TEXT},
        {fieldName: 'availQty', dataType: ValueType.NUMBER},
        {fieldName: 'poQty', dataType: ValueType.NUMBER},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _realGridsService: FuseRealGridService,
        private _matDialog: MatDialog,
        private _safetyService: SafetyService,
        private _formBuilder: FormBuilder,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _functionService: FunctionService,
        private _utilService: FuseUtilsService,
        private _codeStore: CodeStore,
        private _deviceService: DeviceDetectorService,
        private _changeDetectorRef: ChangeDetectorRef,
        private readonly breakpointObserver: BreakpointObserver) {
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_GRADE');
        this.invYn = _utilService.commonValue(_codeStore.getValue().data, 'INV_YN');
        this.safetyType = _utilService.commonValue(_codeStore.getValue().data, 'SAFETY_TYPE');
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnInit(): void {
        const values = [];
        const lables = [];
        this.itemGrades.forEach((param: any) => {
            values.push(param.id);
            lables.push(param.name);
        });
        const valueTypes = [];
        const lableTypes = [];
        this.safetyType.forEach((param: any) => {
            valueTypes.push(param.id);
            lableTypes.push(param.name);
        });

        // ?????? Form ??????
        this.searchForm = this._formBuilder.group({
            itemNm: [''],
            fomlInfo: [''],
            invYn: ['ALL'],
        });

        //????????? ??????
        this.safetyColumns = [
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
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
                name: 'supplierNm', fieldName: 'supplierNm', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '?????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'standard', fieldName: 'standard', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'unit', fieldName: 'unit', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemGrade', fieldName: 'itemGrade', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '????????????', styleName: 'center-cell-text'},
                values: values,
                labels: lables,
                lookupDisplay: true, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'availQty',
                fieldName: 'availQty',
                type: 'data',
                width: '100',
                styleName: 'right-cell-text',
                header: {text: '??????', styleName: 'center-cell-text'},
                numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'safetyType', fieldName: 'safetyType', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '????????????', styleName: 'center-cell-text red-font-color',
                    template: '${headerText} <span class="material-icons text-13s text-bold-600 tooltip-hover-safety">\n' +
                        'help_outline\n' +
                        '<span class="tooltip-text-safety tooltip-safety text-12s">A Type: ~0%(??????), 0~10%(??????), 10~30%(??????), 30%~(??????)<br>' +
                        'B Type: ~0%(??????), 0~15%(??????), 15~30%(??????), 30%~(??????)<br>' +
                        'C Type: ~0%(??????), 0~20%(??????), 20~30%(??????), 30%~(??????)</span></span>',
                    values: { 'headerText':'????????????' }},
                values: valueTypes,
                labels: lableTypes,
                editor: this._realGridsService.gfn_ComboBox(this.safetyType),
                lookupDisplay: true, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'safetyQty',
                fieldName: 'safetyQty',
                type: 'data',
                width: '120',
                styleName: 'right-cell-text',
                header: {text: '??????????????????', styleName: 'center-cell-text red-font-color'},
                numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'safety', fieldName: 'safety', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '???????????????', styleName: 'center-cell-text blue-font-color'},
                lookupDisplay: true, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'safetyStatus', fieldName: 'safetyStatus', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '??????', styleName: 'center-cell-text blue-font-color'},renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'poQty',
                fieldName: 'poQty',
                type: 'data',
                width: '120',
                styleName: 'right-cell-text',
                header: {text: '??????????????????', styleName: 'center-cell-text blue-font-color'},
                numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
        ];
        this.safetyDataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        this.safetyDataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.safetyDataProvider,
            'safety',
            this.safetyColumns,
            this.safetyFields,
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
            commitEdit: true,
            checkReadOnly: true
        });
        this.gridList.editOptions.commitByCell = true;
        this.gridList.editOptions.editWhenFocused = true;
        this.gridList.editOptions.validateOnEdited = true;
        this._realGridsService.gfn_EditGrid(this.gridList);

        // ??? edit control
        this.gridList.setCellStyleCallback((grid, dataCell) => {
            const ret = {styleName : '', editable: false};
            const safetyStatus = grid.getValue(dataCell.index.itemIndex, 'safetyStatus');

            if(safetyStatus === '??????'){
                if (dataCell.dataColumn.fieldName === 'safetyStatus') {
                    ret.styleName = 'center-cell-text red-cell-color';
                    return ret;
                }
            }else if(safetyStatus === '??????'){
                if (dataCell.dataColumn.fieldName === 'safetyStatus') {
                    ret.styleName = 'center-cell-text orange-cell-color';
                    return ret;
                }
            }else if(safetyStatus === '??????'){
                if (dataCell.dataColumn.fieldName === 'safetyStatus') {
                    ret.styleName = 'center-cell-text yellow-cell-color';
                    return ret;
                }
            }else if(safetyStatus === '??????'){
                if (dataCell.dataColumn.fieldName === 'safetyStatus') {
                    ret.styleName = 'center-cell-text yellowgreen-cell-color';
                    return ret;
                }
            }
            //?????????
            if (dataCell.dataColumn.fieldName === 'itemCd' ||
                dataCell.dataColumn.fieldName === 'itemNm' ||
                dataCell.dataColumn.fieldName === 'fomlInfo' ||
                dataCell.dataColumn.fieldName === 'supplierNm' ||
                dataCell.dataColumn.fieldName === 'standard' ||
                dataCell.dataColumn.fieldName === 'unit' ||
                dataCell.dataColumn.fieldName === 'itemGrade' ||
                dataCell.dataColumn.fieldName === 'safety' ||
                dataCell.dataColumn.fieldName === 'safetyStatus' ||
                dataCell.dataColumn.fieldName === 'availQty') {

                return ret;
            } else {
                ret.editable= true;
                return ret;
            }


        });

        // this.gridList.setRowStyleCallback((grid, item, fixed) => {
        //     const ret = {
        //         styleName: ''
        //     };
        //     const safetyQty = grid.getValue(item.index, 'safetyQty');
        //     const availQty = grid.getValue(item.index, 'availQty');
        //     if (safetyQty > availQty) {
        //         ret.styleName = 'red-color';
        //         return ret;
        //     }
        // });
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                if(this._realGridsService.gfn_GridDataCnt(this.gridList, this.safetyDataProvider)){
                    this._realGridsService.gfn_GridLoadingBar(this.gridList, this.safetyDataProvider, true);
                    const rtn = this._safetyService.getHeader(this.safetyPagenation.page, this.safetyPagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
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
        // this.setGridData();
        // this._safetyService.safetyPagenation$
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((safetyPagenation: SafetyPagenation) => {
        //         this.safetyPagenation = safetyPagenation;
        //         // Mark for check
        //         this._changeDetectorRef.markForCheck();
        //     });
    }

    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() =>
                // eslint-disable-next-line max-len
                this._safetyService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'itemNm', this.orderBy, this.searchForm.getRawValue())
            ),
            map(() => {
            })
        ).subscribe();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.safetyDataProvider);
    }

    setGridData(): void {
        this.safetys$ = this._safetyService.safetys$;
        this._safetyService.safetys$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((safety: any) => {
                if (safety !== null) {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.safetyDataProvider, safety);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    selectHeader(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.safetyDataProvider, true);
        const rtn = this._safetyService.getHeader(0, 40, 'itemNm', 'asc', this.searchForm.getRawValue());
        //this.setGridData();
        this.selectCallBack(rtn);
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.selectHeader();
        }
    }

    //?????????
    pageEvent($event: PageEvent): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.safetyDataProvider, true);
        const rtn = this._safetyService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'itemNm', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '???????????? ??????');
    }

    safetySave(): void {
        const rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.safetyDataProvider);
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
                    this._safetyService.safetySave(rows)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((safety: any) => {
                            this._functionService.cfn_loadingBarClear();
                            this._functionService.cfn_alertCheckMessage(safety);
                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                            this.selectHeader();
                        });
                } else {
                    this.selectHeader();
                }
            });
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    order(): void {

        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.safetyDataProvider);
        if (checkValues.length < 1) {
            this._functionService.cfn_alert('?????? ????????? ??????????????????.');
            return;
        } else {

            const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
                title: '',
                message: '????????? ?????? ???????????????????',
                actions: {
                    confirm: {
                        label: '??????'
                    },
                    cancel: {
                        label: '??????'
                    }
                }
            }).value);

            confirmation.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        this._safetyService.order(checkValues)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((inBound: any) => {
                                this._functionService.cfn_loadingBarClear();
                                this._functionService.cfn_alertCheckMessage(inBound);
                                // Mark for check
                                this._changeDetectorRef.markForCheck();
                                //this.selectHeader();
                            });
                    } else {
                        //this.selectHeader();
                    }
                });
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }


    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.safetyDataProvider, ex.safety);
            this._safetyService.safetyPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((safetyPagenation: SafetyPagenation) => {
                    // Update the pagination
                    this.safetyPagenation = safetyPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if(ex.safety.length < 1){
                this._functionService.cfn_alert('????????? ????????? ????????????.');
            }
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.safetyDataProvider, false);
        });
    }
}
