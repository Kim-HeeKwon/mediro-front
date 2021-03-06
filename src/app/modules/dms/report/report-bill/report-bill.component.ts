import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ReportBoundPagenation} from "../report-bound/report-bound.types";
import {merge, Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {FormBuilder, FormGroup} from "@angular/forms";
import {DeviceDetectorService} from "ngx-device-detector";
import {CommonCode, FuseUtilsService} from "../../../../../@teamplat/services/utils";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {Columns} from "../../../../../@teamplat/services/realgrid/realgrid.types";
import {FuseRealGridService} from "../../../../../@teamplat/services/realgrid";
import {MatDialog} from "@angular/material/dialog";
import {TeamPlatConfirmationService} from "../../../../../@teamplat/services/confirmation";
import {FunctionService} from "../../../../../@teamplat/services/function";
import * as moment from "moment";
import {ReportBillService} from "./report-bill.service";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {ReportBillPagenation} from "./report-bill.types";
import {CodeStore} from "../../../../core/common-code/state/code.store";

@Component({
    selector: 'dms-report-bill',
    templateUrl: 'report-bill.component.html',
    styleUrls: ['./report-bill.component.scss']
})
export class ReportBillComponent implements OnInit, AfterViewInit, OnDestroy {
    isLoading: boolean = false;
    isSearchForm: boolean = false;
    drawerOpened: boolean = false;
    isMobile: boolean = false;
    reportBillPagenation: ReportBoundPagenation | null = null;
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    drawerMode: 'over' | 'side' = 'over';
    orderBy: any = 'asc';
    type: CommonCode[] = null;
    searchForm: FormGroup;
    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    reportBillDataProvider: RealGrid.LocalDataProvider;
    reportBillColumns: Columns[];
    reportBillFields: DataFieldObject[] = [
        {fieldName: 'type', dataType: ValueType.TEXT},
        {fieldName: 'mId', dataType: ValueType.TEXT},
        {fieldName: 'addDate', dataType: ValueType.TEXT},
        {fieldName: 'bisNo', dataType: ValueType.TEXT},
        {fieldName: 'account', dataType: ValueType.TEXT},
        {fieldName: 'accountNm', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'fomlInfo', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'qty', dataType: ValueType.NUMBER},
        {fieldName: 'unitPrice', dataType: ValueType.NUMBER},
        {fieldName: 'billingAmt', dataType: ValueType.NUMBER},
        {fieldName: 'taxAmt', dataType: ValueType.NUMBER},
        {fieldName: 'billingTotalAmt', dataType: ValueType.NUMBER},
        {fieldName: 'manager', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    _range: { start: any | null; end: any | null } = {
        start: null,
        end  : null
    };
    constructor(
        private _realGridsService: FuseRealGridService,
        private _matDialog: MatDialog,
        private _codeStore: CodeStore,
        private _deviceService: DeviceDetectorService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _formBuilder: FormBuilder,
        private _functionService: FunctionService,
        private _utilService: FuseUtilsService,
        private _reportBillService: ReportBillService,
        private _changeDetectorRef: ChangeDetectorRef,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.type = _utilService.commonValue(_codeStore.getValue().data, 'BL_TYPE');
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnInit(): void {
        // ?????? Form ??????
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        this.searchForm = this._formBuilder.group({
            accountNm: [''],
            itemNm: [''],
            type: ['ALL'],
            manager: [''],
            range: [{
                start: firstDay,
                end: lastDay
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
        this._range = {
            start: moment().utc(true).add(-1, 'month').endOf('day').toISOString(),
            end: moment().utc(true).startOf('day').toISOString()
        };

        //????????? ??????
        this.reportBillColumns = [
            {
                name: 'type', fieldName: 'type', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '??????', styleName: 'center-cell-text'},
                values: valuesType,
                labels: lablesType,
                lookupDisplay: true, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'addDate', fieldName: 'addDate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text'}, renderer: {
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
                name: 'bisNo', fieldName: 'bisNo', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '???????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            // {
            //     name: 'account', fieldName: 'account', type: 'data', width: '150', styleName: 'left-cell-text'
            //     , header: {text: '????????? ??????', styleName: 'center-cell-text'}, renderer: {
            //         showTooltip: true
            //     }
            // },
            {
                name: 'accountNm', fieldName: 'accountNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '????????? ???', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
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
                name: 'qty', fieldName: 'qty', type: 'number', width: '120', styleName: 'right-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'unitPrice', fieldName: 'unitPrice', type: 'number', width: '120', styleName: 'right-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'billingAmt', fieldName: 'billingAmt', type: 'number', width: '120', styleName: 'right-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'taxAmt', fieldName: 'taxAmt', type: 'number', width: '120', styleName: 'right-cell-text'
                , header: {text: '?????????', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'billingTotalAmt', fieldName: 'billingTotalAmt', type: 'number', width: '120', styleName: 'right-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'manager', fieldName: 'manager', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '?????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
        ];

        // ????????? Provider
        this.reportBillDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //????????? ??????
        const gridListOption = {
            stateBar: false,
            checkBar: true,
            footers: true,
        };

        this.reportBillDataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        //????????? ??????
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.reportBillDataProvider,
            'reportBill',
            this.reportBillColumns,
            this.reportBillFields,
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

        //??????
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                if(this._realGridsService.gfn_GridDataCnt(this.gridList, this.reportBillDataProvider)){
                    this._realGridsService.gfn_GridLoadingBar(this.gridList, this.reportBillDataProvider, true);
                    const rtn = this._reportBillService.getSearch(this.reportBillPagenation.page, this.reportBillPagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
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
        this._changeDetectorRef.markForCheck();

    }

    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._reportBillService.getSearch(this._paginator.pageIndex, this._paginator.pageSize, 'addDate', this.orderBy, this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.reportBillDataProvider);
    }

    selectHeader(): void {
        this.isSearchForm = true;
        this.searchSetValue();
        const rtn = this._reportBillService.getSearch(0, 40, 'addDate', 'desc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    searchSetValue(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.reportBillDataProvider, true);
        this.searchForm.patchValue({'start': this.searchForm.get('range').value.start});
        this.searchForm.patchValue({'end': this.searchForm.get('range').value.end});
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '??????/?????? ??????');
    }

    //?????????
    pageEvent($event: PageEvent): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.reportBillDataProvider, true);
        const rtn = this._reportBillService.getSearch(this._paginator.pageIndex, this._paginator.pageSize, 'addDate', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.reportBillDataProvider, ex.reportBillData);
            this._reportBillService.reportBillPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((reportBillPagenation: ReportBillPagenation) => {
                    // Update the pagination
                    this.reportBillPagenation = reportBillPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if(ex.reportBillData.length < 1){
                this._functionService.cfn_alert('????????? ????????? ????????????.');
            }
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.reportBillDataProvider, false);
        });
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

}
