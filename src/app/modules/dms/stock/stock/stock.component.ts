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

@Component({
    selector: 'dms-app-stock',
    templateUrl: './stock.component.html',
    styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
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
            name: '품목 명'
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
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'poQty', dataType: ValueType.TEXT},
        {fieldName: 'availQty', dataType: ValueType.TEXT},
        {fieldName: 'acceptableQty', dataType: ValueType.TEXT},
        {fieldName: 'unusedQty', dataType: ValueType.TEXT},
        {fieldName: 'safetyQty', dataType: ValueType.TEXT},
        {fieldName: 'longtermQty', dataType: ValueType.TEXT},
        {fieldName: 'longterm', dataType: ValueType.TEXT}
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        private _realGridsService: FuseRealGridService,
        private _matDialog: MatDialog,
        private _stockService: StockService,
        private _formBuilder: FormBuilder,
        private _utilService: FuseUtilsService,
        private _codeStore: CodeStore,
        private _deviceService: DeviceDetectorService,
        private _changeDetectorRef: ChangeDetectorRef,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.taxGbn = _utilService.commonValue(_codeStore.getValue().data,'TAX_GBN');
        this.itemUnit = _utilService.commonValue(_codeStore.getValue().data,'ITEM_UNIT');
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data,'ITEM_GRADE');
        this.udiYn = _utilService.commonValue(_codeStore.getValue().data,'UDI_YN');
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
            type: ['ALL'],
            itemNm: [''],
            searchCondition: ['100'],
            searchText: [''],
        });

        //그리드 컬럼
        this.stockColumns = [
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '160', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'left-cell-text'},
                renderer: {
                    'type': 'link',
                    'baseUrl': '#'
                }
            },
            {name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '160', styleName: 'left-cell-text'
                , header: {text: '품목명' , styleName: 'left-cell-text'},},
            {name: 'itemGrade', fieldName: 'itemGrade', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '품목등급', styleName: 'left-cell-text'},
                values: values,
                labels: lables,
                lookupDisplay: true,
            },
            {name: 'poQty', fieldName: 'poQty', type: 'data', width: '100', styleName: 'right-cell-text', header: {text: '발주' , styleName: 'left-cell-text'},
            },
            {name: 'availQty', fieldName: 'availQty', type: 'data', width: '100', styleName: 'right-cell-text', header: {text: '보유' , styleName: 'left-cell-text'}},
            {name: 'acceptableQty', fieldName: 'acceptableQty', type: 'data', width: '100', styleName: 'right-cell-text', header: {text: '가납' , styleName: 'left-cell-text'}},
            {name: 'unusedQty', fieldName: 'unusedQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '불용' , styleName: 'left-cell-text'}},
            {name: 'safetyQty', fieldName: 'safetyQty'
                , type: 'data', width: '100', styleName: 'right-cell-text', header: {text: '안전재고' , styleName: 'left-cell-text'}},
            {name: 'longtermQty', fieldName: 'longtermQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '장기재고' , styleName: 'left-cell-text'}},
            {name: 'longterm', fieldName: 'longterm', type: 'data', width: '100', styleName: 'left-cell-text', header: {text: '기간' , styleName: 'left-cell-text'}}
        ];

        this.stockDataProvider = this._realGridsService.gfn_CreateDataProvider();

        const gridListOption = {
            stateBar : false,
            checkBar : true,
            footers : false,
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
            gridListOption);

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
            if(clickData.cellType === 'header'){
                this._stockService.getHeader(this.stockPagenation.page,this.stockPagenation.size,clickData.column,this.orderBy,this.searchForm.getRawValue());
            };
            if(this.orderBy === 'asc'){
                this.orderBy = 'desc';
            }else{
                this.orderBy = 'asc';
            }
        };

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
        this._stockService.stockPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stockPagenation: StockPagenation) => {
                this.stockPagenation = stockPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellItemClicked =  (grid, index, clickData) => {
            if(!this.isMobile){
                const d = this._matDialog.open(StockDetailComponent, {
                    autoFocus: false,
                    disableClose: true,
                    data     : {
                        detail: this.stockDataProvider.getJsonRow(this.gridList.getCurrent().dataRow)
                    },
                });
                d.afterClosed().subscribe(() => {
                    this.selectHeader();
                });
            }else{
                const d = this._matDialog.open(StockDetailComponent, {
                    data        : {
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
                        d.updateSize('calc(100vw - 10px)','');
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
                    this._stockService.getStockHistoryById(grid.getValues(clickData.dataRow).itemCd)
                        .subscribe((stock) => {
                            this.selectedStock = stock;
                            this._stockService.getStockHistory(0, 10, 'seq', 'desc', this.selectedStock);

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
                    }else{
                        const d = this._matDialog.open(StockHistoryComponent, {
                            data     : {
                                selectedStock : grid.getValues(clickData.dataRow)
                            },
                            autoFocus: false,
                            width: 'calc(100% - 50px)',
                            maxWidth: '100vw',
                            maxHeight: '80vh',
                            disableClose: true
                        });
                        const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                            if (size.matches) {
                                d.updateSize('calc(100vw - 10px)','');
                            } else {
                            }
                        });
                        d.afterClosed().subscribe(() => {
                            smallDialogSubscription.unsubscribe();
                        });
                    }
                }
            }
        };
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
        if (this.searchForm.getRawValue().searchCondition === '100') {
            this.searchForm.patchValue({'itemCd': ''});
            this.searchForm.patchValue({'itemNm': this.searchForm.getRawValue().searchText});
        }
        this._stockService.getHeader(0, 10, 'itemNm', 'desc', this.searchForm.getRawValue());
    }

    enter(event): void {
        if(event.keyCode===13){
            this.selectHeader();
        }
    }
    //페이징
    pageEvent($event: PageEvent): void {
        this._stockService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'stock', this.orderBy, this.searchForm.getRawValue());
    }
}
