import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {DeviceDetectorService} from 'ngx-device-detector';
import {merge, Observable, range, Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {Stock, StockHistory, StockPagenation} from './stock.types';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {MatDialog} from '@angular/material/dialog';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {StockService} from './stock.service';
import {filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {StockDetailComponent} from './stock-detail/stock-detail.component';
import {FuseRealGridService} from '../../../../../@teamplat/services/realgrid';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {Columns} from '../../../../../@teamplat/services/realgrid/realgrid.types';
import {StockHistoryComponent} from './stock-history/stock-history.component';
import {FunctionService} from '../../../../../@teamplat/services/function';
import * as moment from "moment";
import {ActivatedRoute} from "@angular/router";
import {StockUploadComponent} from "./stock-upload/stock-upload.component";

@Component({
    selector: 'dms-app-stock',
    templateUrl: './stock.component.html',
    styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild(MatPaginator, { static: true }) _paginator: MatPaginator;
    drawerMode: 'over' | 'side' = 'over';
    orderBy: any = 'asc';
    stocks$: Observable<Stock[]>;
    drawerOpened: boolean = false;
    isMobile: boolean = false;
    stockPagenation: StockPagenation | null = null;
    searchForm: FormGroup;
    selectedStock: Stock | null = null;
    stocksCount: number = 0;
    itemGrades: CommonCode[] = [];
    udiYn: CommonCode[] = [];
    itemUnit: CommonCode[] = [];
    taxGbn: CommonCode[] = [];
    searchCondition: CommonCode[] = [
        {
            id: '100',
            name: '?????? ???'
        }];
    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    stockDataProvider: RealGrid.LocalDataProvider;
    stockColumns: Columns[];
    // @ts-ignore
    stockFields: DataFieldObject[] = [
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'fomlInfo', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'supplier', dataType: ValueType.TEXT},
        {fieldName: 'supplierNm', dataType: ValueType.TEXT},
        {fieldName: 'poQty', dataType: ValueType.NUMBER},
        {fieldName: 'availQty', dataType: ValueType.NUMBER},
        {fieldName: 'acceptableQty', dataType: ValueType.NUMBER},
        {fieldName: 'unusedQty', dataType: ValueType.NUMBER},
        {fieldName: 'safetyQty', dataType: ValueType.NUMBER},
        {fieldName: 'longterm', dataType: ValueType.TEXT},
        {fieldName: 'longtermQty', dataType: ValueType.NUMBER},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _realGridsService: FuseRealGridService,
        private _matDialog: MatDialog,
        private _activatedRoute: ActivatedRoute,
        private _stockService: StockService,
        private _formBuilder: FormBuilder,
        private _utilService: FuseUtilsService,
        private _functionService: FunctionService,
        private _codeStore: CodeStore,
        private _deviceService: DeviceDetectorService,
        private _changeDetectorRef: ChangeDetectorRef,
        private readonly breakpointObserver: BreakpointObserver) {
        this.taxGbn = _utilService.commonValue(_codeStore.getValue().data, 'TAX_GBN');
        this.itemUnit = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_UNIT');
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_GRADE');
        this.udiYn = _utilService.commonValue(_codeStore.getValue().data, 'UDI_YN');
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnInit(): void {
        let dashboard = false;
        const values = [];
        const lables = [];
        this.itemGrades.forEach((param: any) => {
            values.push(param.id);
            lables.push(param.name);
        });
        // ?????? Form ??????
        this.searchForm = this._formBuilder.group({
            type: ['ALL'],
            itemCd: [''],
            itemNm: [''],
            fomlInfo: [''],
            itemGrade: ['ALL'],
            supplier: [''],
            supplierNm: [''],
            searchCondition: ['100'],
            searchText: [''],
        });
        if (this._activatedRoute.snapshot.paramMap['params'] !== (null || undefined)
            && Object.keys(this._activatedRoute.snapshot.paramMap['params']).length > 0) {
            this.searchForm = this._formBuilder.group({
                type: ['ALL'],
                itemCd: [''],
                itemNm: [''],
                fomlInfo: [''],
                itemGrade: ['ALL'],
                supplier: [''],
                supplierNm: [''],
                searchCondition: ['100'],
                searchText: [''],
                range: [{
                    start: moment().utc(false).add(-1, 'month').endOf('day').toISOString(),
                    end: moment().utc(false).startOf('day').toISOString()
                }],
                start: [],
                end: [],
            });
            this.searchForm.patchValue(this._activatedRoute.snapshot.paramMap['params']);
            dashboard = true;
        }
        const columnLayout = [
            'itemCd',
            'itemNm',
            'fomlInfo',
            'standard',
            'unit',
            'itemGrade',
            'supplierNm',
            {
                name: 'stockGroup',
                direction: 'horizontal',
                items: [
                    {
                        name: 'stockO',
                        direction: 'horizontal',
                        items: [
                            'poQty',
                            'availQty'
                        ],
                        header: {
                            text: '??????',
                        }
                    },
                    {
                        name: 'stockX',
                        direction: 'horizontal',
                        items: [
                            'acceptableQty',
                            'unusedQty',
                        ],
                        header: {
                            text: '?????????',
                        }
                    },
                ],
                header: {
                    text: '?????? ??????',
                }
            },
            'safetyQty',
            /*{
                name: 'long',
                direction: 'horizontal',
                items: [
                    'longterm',
                    'longtermQty'
                ],
                header: {
                    text: '????????????',
                }
            },*/
        ];

        //????????? ??????
        this.stockColumns = [
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'},
                renderer: {
                    'showTooltip' :true,
                    'type': 'link',
                    'baseUrl': '#'
                }
            },
            {
                name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '?????????', styleName: 'center-cell-text'},
                renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'fomlInfo', fieldName: 'fomlInfo', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '?????????', styleName: 'center-cell-text'},
                renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'standard', fieldName: 'standard', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text'},
                renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'unit', fieldName: 'unit', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text'},
                renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'itemGrade', fieldName: 'itemGrade', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '????????????', styleName: 'center-cell-text'},
                values: values,
                labels: lables,
                lookupDisplay: true, renderer:{
                    showTooltip:true
                 }
            },
            {
                name: 'supplierNm', fieldName: 'supplierNm', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '?????????', styleName: 'center-cell-text'},
                renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'poQty',
                fieldName: 'poQty',
                type: 'data',
                width: '100',
                styleName: 'right-cell-text',
                header: {text: '??????', styleName: 'center-cell-text'}
                , numberFormat : '#,##0', renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'availQty',
                fieldName: 'availQty',
                type: 'data',
                width: '100',
                styleName: 'right-cell-text',
                header: {text: '??????', styleName: 'center-cell-text'}
                , numberFormat : '#,##0', renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'acceptableQty',
                fieldName: 'acceptableQty',
                type: 'data',
                width: '100',
                styleName: 'right-cell-text',
                header: {text: '??????', styleName: 'center-cell-text'}
                , numberFormat : '#,##0', renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'unusedQty', fieldName: 'unusedQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text'}
                , numberFormat : '#,##0', renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'safetyQty',
                fieldName: 'safetyQty'
                ,
                type: 'data',
                width: '100',
                styleName: 'right-cell-text',
                header: {text: '????????????', styleName: 'center-cell-text'}
                , numberFormat : '#,##0', renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'longterm',
                fieldName: 'longterm',
                type: 'data',
                width: '100',
                styleName: 'center-cell-text',
                header: {text: '??????', styleName: 'center-cell-text'}, renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'longtermQty', fieldName: 'longtermQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}
                , numberFormat : '#,##0', renderer:{
                    showTooltip:true
                }
            },

        ];

        this.stockDataProvider = this._realGridsService.gfn_CreateDataProvider();

        const gridListOption = {
            stateBar: false,
            checkBar: false,
            footers: false,
        };

        this.stockDataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.stockDataProvider,
            'stock',
            this.stockColumns,
            this.stockFields,
            gridListOption,
            columnLayout);

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
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                if(this._realGridsService.gfn_GridDataCnt(this.gridList, this.stockDataProvider)){
                    this._realGridsService.gfn_GridLoadingBar(this.gridList, this.stockDataProvider, true);
                    const rtn = this._stockService.getHeader(this.stockPagenation.page, this.stockPagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
                    this.selectCallBack(rtn);
                }
            };
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };
        //????????? ??????
        this._paginator._intl.itemsPerPageLabel = '';

       // this.setGridData();
       //  this._stockService.stockPagenation$
       //      .pipe(takeUntil(this._unsubscribeAll))
       //      .subscribe((stockPagenation: StockPagenation) => {
       //          this.stockPagenation = stockPagenation;
       //          // Mark for check
       //          this._changeDetectorRef.markForCheck();
       //      });

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellItemClicked = (grid, index, clickData) => {
            if (!this.isMobile) {
                const d = this._matDialog.open(StockDetailComponent, {
                    autoFocus: false,
                    disableClose: true,
                    data: {
                        detail: this.stockDataProvider.getJsonRow(this.gridList.getCurrent().dataRow)
                    },
                });
                d.afterClosed().subscribe(() => {
                    this.selectHeader();
                });
            } else {
                const d = this._matDialog.open(StockDetailComponent, {
                    data: {
                        detail: this.stockDataProvider.getJsonRow(this.gridList.getCurrent().dataRow)
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
                    } else {
                        // d.updateSize('calc(100% - 50px)', '');
                    }
                });
                d.afterClosed().subscribe(() => {
                    smallDialogSubscription.unsubscribe();
                });
            }
            return false;
        };

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellDblClicked = (grid, clickData) => {
            if (clickData.cellType !== 'header') {
                if (clickData.cellType !== 'head') {
                    if(grid.getValues(clickData.dataRow) !== null){
                        this._stockService.getStockHistoryById(grid.getValues(clickData.dataRow).itemCd)
                            .subscribe((stock) => {
                                this.selectedStock = stock;
                                //this._stockService.getStockHistory(0, 40, 'seq', 'desc', this.selectedStock);

                                // Mark for check
                                this._changeDetectorRef.markForCheck();
                            });
                        if (!this.isMobile) {
                            const d = this._matDialog.open(StockHistoryComponent, {
                                autoFocus: false,
                                disableClose: true,
                                data: {
                                    selectedStock: grid.getValues(clickData.dataRow)
                                },
                            });
                            d.afterClosed().subscribe(() => {
                            });
                        } else {
                            const d = this._matDialog.open(StockHistoryComponent, {
                                data: {
                                    selectedStock: grid.getValues(clickData.dataRow)
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
                                } else {
                                }
                            });
                            d.afterClosed().subscribe(() => {
                                smallDialogSubscription.unsubscribe();
                            });
                        }
                    }
                }
            }
        };
        if(dashboard){
            this.selectHeader();
        }
        this._changeDetectorRef.markForCheck();
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.stockDataProvider);
    }

    selectHeader(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.stockDataProvider, true);
        const rtn = this._stockService.getHeader(0, 40, 'itemNm', 'asc', this.searchForm.getRawValue());
        //this.setGridData();
        this.selectCallBack(rtn);
    }
    setGridData(): void {
        this.stocks$ = this._stockService.stocks$;
        this._stockService.stocks$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stock: any) => {
                if (stock !== null) {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.stockDataProvider, stock);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.selectHeader();
        }
    }

    //?????????
    pageEvent($event: PageEvent): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.stockDataProvider, true);
        const rtn = this._stockService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'itemNm', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    excelImport(): void {
        //this._realGridsService.gfn_ExcelImportGrid('STOCK', true);
        if(!this.isMobile) {
            const popUp = this._matDialog.open(StockUploadComponent, {
                autoFocus: false,
                disableClose: true,
            });

            popUp.afterClosed().subscribe(() => {
                this.selectHeader();
            });
        } else {
            const popUp = this._matDialog.open(StockUploadComponent, {
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    popUp.updateSize('calc(100vw - 10px)', '');
                } else {
                }
            });
            popUp.afterClosed().subscribe(() => {
                this.selectHeader();
                smallDialogSubscription.unsubscribe();
            });
        }
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '?????? ??????');
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.stockDataProvider, ex.stock);
            this._stockService.stockPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((stockPagenation: StockPagenation) => {
                    // Update the pagination
                    this.stockPagenation = stockPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if(ex.stock.length < 1){
                this._functionService.cfn_alert('????????? ????????? ????????????.');
            }
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.stockDataProvider, false);
        });
    }

}
