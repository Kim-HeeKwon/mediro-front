import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {DeviceDetectorService} from 'ngx-device-detector';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ReportBoundPagenation} from './report-bound.types';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {Columns} from '../../../../../@teamplat/services/realgrid/realgrid.types';
import {FuseRealGridService} from '../../../../../@teamplat/services/realgrid';
import {MatDialog} from '@angular/material/dialog';
import {TeamPlatConfirmationService} from '../../../../../@teamplat/services/confirmation';
import {FunctionService} from '../../../../../@teamplat/services/function';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import * as moment from 'moment';
import {ReportBoundService} from './report-bound.service';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {floor} from "lodash-es";

@Component({
    selector: 'dms-report-bound',
    templateUrl: './report-bound.component.html',
    styleUrls: ['./report-bound.component.scss']
})
export class ReportBoundComponent implements OnInit, OnDestroy, AfterViewInit {
    isLoading: boolean = false;
    isSearchForm: boolean = false;
    drawerOpened: boolean = false;
    isMobile: boolean = false;
    reportBoundPagenation: ReportBoundPagenation | null = null;
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    drawerMode: 'over' | 'side' = 'over';
    orderBy: any = 'asc';
    searchForm: FormGroup;
    reportType: CommonCode[] = null;
    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    reportBoundDataProvider: RealGrid.LocalDataProvider;
    reportBoundColumns: Columns[];
    reportBoundFields: DataFieldObject[] = [
        {fieldName: 'mId', dataType: ValueType.TEXT},
        {fieldName: 'reportType', dataType: ValueType.TEXT},
        {fieldName: 'orderNo', dataType: ValueType.TEXT},
        {fieldName: 'addDate', dataType: ValueType.TEXT},
        {fieldName: 'account', dataType: ValueType.TEXT},
        {fieldName: 'accountNm', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'fomlInfo', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'ibQty', dataType: ValueType.NUMBER},
        {fieldName: 'obQty', dataType: ValueType.NUMBER},
        {fieldName: 'totalAmt', dataType: ValueType.NUMBER}
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _realGridsService: FuseRealGridService,
        private _matDialog: MatDialog,
        private _deviceService: DeviceDetectorService,
        private _formBuilder: FormBuilder,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _functionService: FunctionService,
        private _utilService: FuseUtilsService,
        private _codeStore: CodeStore,
        private _reportBoundService: ReportBoundService,
        private _changeDetectorRef: ChangeDetectorRef,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.isMobile = this._deviceService.isMobile();
        this.reportType = _utilService.commonValue(_codeStore.getValue().data, 'RB_TYPE');
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            accountNm: [''],
            itemNm: [''],
            range: [{
                start: moment().utc(true).add(-7, 'day').endOf('day').toISOString(),
                end: moment().utc(true).startOf('day').toISOString()
            }],
            start: [],
            end: []
        });

        const valuesType = [];
        const lablesType = [];

        this.reportType.forEach((param: any) => {
            valuesType.push(param.id);
            lablesType.push(param.name);
        });

        //그리드 컬럼
        this.reportBoundColumns = [
            {
                name: 'reportType', fieldName: 'reportType', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '유형', styleName: 'center-cell-text'},
                values: valuesType,
                labels: lablesType,
                lookupDisplay: true,
            },
            {
                name: 'orderNo', fieldName: 'orderNo', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '오더번호', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'addDate', fieldName: 'addDate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '일자', styleName: 'center-cell-text'}, renderer: {
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
            // {
            //     name: 'account', fieldName: 'account', type: 'data', width: '150', styleName: 'left-cell-text'
            //     , header: {text: '거래처 코드', styleName: 'center-cell-text'}, renderer: {
            //         showTooltip: true
            //     }
            // },
            {
                name: 'accountNm', fieldName: 'accountNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '거래처 명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'fomlInfo', fieldName: 'fomlInfo', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '모델명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'standard',
                fieldName: 'standard',
                type: 'data',
                width: '120',
                styleName: 'left-cell-text',
                header: {text: '규격', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'unit',
                fieldName: 'unit',
                type: 'data',
                width: '120',
                styleName: 'left-cell-text',
                header: {text: '단위', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'ibQty', fieldName: 'ibQty', type: 'number', width: '120', styleName: 'right-cell-text'
                , header: {text: '입고수량', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }, footer: {
                    text: '',
                    expression: 'sum',
                    numberFormat : '#,##0',
                }
            },
            {
                name: 'obQty', fieldName: 'obQty', type: 'number', width: '120', styleName: 'right-cell-text'
                , header: {text: '출고수량', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }, footer: {
                    text: '',
                    expression: 'sum',
                    numberFormat : '#,##0',
                }
            },
            {
                name: 'totalAmt', fieldName: 'totalAmt', type: 'number', width: '150', styleName: 'right-cell-text'
                , header: {text: '매입/매출금액', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }, footer: {
                    text: '',
                    expression: 'sum',
                    numberFormat : '#,##0',
                }
            },
        ];

        // 그리드 Provider
        this.reportBoundDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const gridListOption = {
            stateBar: false,
            checkBar: true,
            footers: true,
        };

        this.reportBoundDataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.reportBoundDataProvider,
            'reportBound',
            this.reportBoundColumns,
            this.reportBoundFields,
            gridListOption);

        //그리드 옵션
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

        //정렬
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                if(this._realGridsService.gfn_GridDataCnt(this.gridList, this.reportBoundDataProvider)){
                    this._realGridsService.gfn_GridLoadingBar(this.gridList, this.reportBoundDataProvider, true);
                    const rtn = this._reportBoundService.getSearch(this.reportBoundPagenation.page, this.reportBoundPagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
                    this.selectCallBack(rtn);
                }
            }
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };
        //페이지 라벨
        this._paginator._intl.itemsPerPageLabel = '';
        this._changeDetectorRef.markForCheck();

    }

    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._reportBoundService.getSearch(this._paginator.pageIndex, this._paginator.pageSize, 'orderNo', this.orderBy, this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.reportBoundDataProvider);
    }

    selectHeader(): void {
        this.isSearchForm = true;
        this.searchSetValue();
        const rtn = this._reportBoundService.getSearch(0, 40, 'addDate', 'desc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    searchSetValue(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.reportBoundDataProvider, true);
        this.searchForm.patchValue({'start': this.searchForm.get('range').value.start});
        this.searchForm.patchValue({'end': this.searchForm.get('range').value.end});
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

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '수불 현황');
    }

    //페이징
    pageEvent($event: PageEvent): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.reportBoundDataProvider, true);
        const rtn = this._reportBoundService.getSearch(this._paginator.pageIndex, this._paginator.pageSize, 'addDate', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.reportBoundDataProvider, ex.reportBoundData);
            this._reportBoundService.reportBoundPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((reportBoundPagenation: ReportBoundPagenation) => {
                    // Update the pagination
                    this.reportBoundPagenation = reportBoundPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if(ex.reportBoundData.length < 1){
                this._functionService.cfn_alert('검색된 정보가 없습니다.');
            }
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.reportBoundDataProvider, false);
        });
    }

}


