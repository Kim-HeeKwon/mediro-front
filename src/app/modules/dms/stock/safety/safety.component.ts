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
    isProgressSpinner: boolean = false;
    safetyPagenation: SafetyPagenation | null = null;
    searchForm: FormGroup;
    itemGrades: CommonCode[] = [];
    invYn: CommonCode[] = [];

    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    safetyDataProvider: RealGrid.LocalDataProvider;
    safetyColumns: Columns[];

    // @ts-ignore
    safetyFields: DataFieldObject[] = [
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'safetyQty', dataType: ValueType.NUMBER},
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
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnInit(): void {
        const values = [];
        const lables = [];
        this.itemGrades.forEach((param: any) => {
            values.push(param.id);
            lables.push(param.name);
        });

        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            itemNm: [''],
            invYn: ['ALL'],
        });

        //그리드 컬럼
        this.safetyColumns = [
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '품목명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemGrade', fieldName: 'itemGrade', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '품목등급', styleName: 'center-cell-text'},
                values: values,
                labels: lables,
                lookupDisplay: true,
            },
            {
                name: 'standard', fieldName: 'standard', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '규격', styleName: 'center-cell-text'},
            },
            {
                name: 'unit', fieldName: 'unit', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '단위', styleName: 'center-cell-text'},
            },
            {
                name: 'safetyQty',
                fieldName: 'safetyQty',
                type: 'data',
                width: '120',
                styleName: 'right-cell-text',
                header: {text: '안전재고수량', styleName: 'center-cell-text'},
                numberFormat: '#,##0'
            },
            {
                name: 'availQty',
                fieldName: 'availQty',
                type: 'data',
                width: '120',
                styleName: 'right-cell-text',
                header: {text: '보유', styleName: 'center-cell-text'},
                numberFormat: '#,##0'
            },
            {
                name: 'poQty',
                fieldName: 'poQty',
                type: 'data',
                width: '120',
                styleName: 'right-cell-text',
                header: {text: '발주대상수량', styleName: 'center-cell-text'},
                numberFormat: '#,##0',
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

        // 셀 edit control
        this.gridList.setCellStyleCallback((grid, dataCell) => {

            //추가시
            if (dataCell.dataColumn.fieldName === 'itemCd' ||
                dataCell.dataColumn.fieldName === 'itemNm' ||
                dataCell.dataColumn.fieldName === 'standard' ||
                dataCell.dataColumn.fieldName === 'unit' ||
                dataCell.dataColumn.fieldName === 'itemGrade' ||
                dataCell.dataColumn.fieldName === 'availQty') {
                return {editable: false};
            } else {
                return {editable: true};
            }
        });

        this.gridList.setRowStyleCallback((grid, item, fixed) => {
            const ret = {
                styleName: ''
            };
            const safetyQty = grid.getValue(item.index, 'safetyQty');
            const availQty = grid.getValue(item.index, 'availQty');
            if (safetyQty > availQty) {
                ret.styleName = 'red-color';
                return ret;
            }
        });
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                this._safetyService.getHeader(this.safetyPagenation.page, this.safetyPagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
            }
            ;
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };

        //페이지 라벨
        this._paginator._intl.itemsPerPageLabel = '';

        this.setGridData();
        this._safetyService.safetyPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((safetyPagenation: SafetyPagenation) => {
                this.safetyPagenation = safetyPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
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
        this._safetyService.getHeader(0, 20, 'itemNm', 'desc', this.searchForm.getRawValue());
        this.setGridData();
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.selectHeader();
        }
    }

    //페이징
    pageEvent($event: PageEvent): void {
        this._safetyService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'itemNm', this.orderBy, this.searchForm.getRawValue());
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '안전재고 목록');
    }

    safetySave(): void {
        const rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.safetyDataProvider);
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
                    this.isProgressSpinner = true;
                    this._safetyService.safetySave(rows)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((safety: any) => {
                            this.isProgressSpinner = false;
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

    }
}
