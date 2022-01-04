import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {ItemPrice, ItemPricePagenation} from './item-price.types';
import {SelectionModel} from '@angular/cdk/collections';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {MatDialog} from '@angular/material/dialog';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {Router} from '@angular/router';
import {DeviceDetectorService} from 'ngx-device-detector';
import {ItemPriceService} from './item-price.service';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {ItemPriceNewComponent} from './item-price-new/item-price-new.component';
import {TeamPlatConfirmationService} from '../../../../../@teamplat/services/confirmation';
import {FuseRealGridService} from '../../../../../@teamplat/services/realgrid';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {Columns} from '../../../../../@teamplat/services/realgrid/realgrid.types';
import {ItemPriceHistoryComponent} from './item-price-history/item-price-history.component';
import {FunctionService} from '../../../../../@teamplat/services/function';
import {InventoryPagination} from "../items/items.types";

@Component({
    selector: 'dms-app-item-price',
    templateUrl: 'item-price.component.html',
    styleUrls: ['item-price.component.scss']
})
export class ItemPriceComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    selection = new SelectionModel<any>(true, []);
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    isMobile: boolean = false;
    isLoading: boolean = false;
    selectedItemPriceHeader: ItemPrice | null = null;
    itemPricePagenation: ItemPricePagenation | null = null;
    searchForm: FormGroup;
    itemPrices$: Observable<ItemPrice[]>;
    type: CommonCode[] = null;
    itemGrades: CommonCode[] = [];
    orderBy: any = 'asc';
    searchCondition: CommonCode[] = [
        {
            id: '100',
            name: '거래처 명'
        }];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gridList: RealGrid.GridView;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    itemPriceDataProvider: RealGrid.LocalDataProvider;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    itemPriceColumns: Columns[];
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    itemPriceFields: DataFieldObject[] = [
        {fieldName: 'type', dataType: ValueType.TEXT},
        {fieldName: 'effectiveDate', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'account', dataType: ValueType.TEXT},
        {fieldName: 'accountNm', dataType: ValueType.TEXT},
        {fieldName: 'unitPrice', dataType: ValueType.NUMBER}
    ];

    constructor(
        private _matDialog: MatDialog,
        private _functionService: FunctionService,
        private _realGridsService: FuseRealGridService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _itemPriceService: ItemPriceService,
        private _router: Router,
        private _utilService: FuseUtilsService,
        private _codeStore: CodeStore,
        private _deviceService: DeviceDetectorService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private readonly breakpointObserver: BreakpointObserver) {
        this.type = _utilService.commonValue(_codeStore.getValue().data, 'BL_TYPE');
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_GRADE');
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.itemPriceDataProvider);
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            type: ['ALL'],
            itemCd: [''],
            itemNm: [''],
            account: [''],
            accountNm: [''],
            searchCondition: ['100'],
            searchText: [''],
        });

        const itemPricevalues = [];
        const itemPricelables = [];
        this.type.forEach((param: any) => {
            itemPricevalues.push(param.id);
            itemPricelables.push(param.name);
        });

        const itemGradesvalues = [];
        const itemGradeslables = [];
        this.itemGrades.forEach((param: any) => {
            itemGradesvalues.push(param.id);
            itemGradeslables.push(param.name);
        });

        //그리드 컬럼
        this.itemPriceColumns = [
            {
                name: 'type', fieldName: 'type', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '유형', styleName: 'center-cell-text'},
                values: itemPricevalues,
                labels: itemPricelables,
                lookupDisplay: true, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'effectiveDate',
                fieldName: 'effectiveDate',
                type: 'data',
                width: '120',
                styleName: 'left-cell-text'
                ,
                header: {text: '단가 적용일자', styleName: 'center-cell-text'},
                renderer: {
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
                name: 'itemNm',
                fieldName: 'itemNm',
                type: 'data',
                width: '150',
                styleName: 'left-cell-text',
                header: {text: '품목명', styleName: 'center-cell-text'}, renderer: {
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
                name: 'itemGrade', fieldName: 'itemGrade', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '등급', styleName: 'center-cell-text'},
                values: itemGradesvalues,
                labels: itemGradeslables,
                lookupDisplay: true, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'account',
                fieldName: 'account',
                type: 'data',
                width: '150',
                styleName: 'left-cell-text',
                header: {text: '거래처 코드', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'accountNm',
                fieldName: 'accountNm',
                type: 'data',
                width: '150',
                styleName: 'left-cell-text',
                header: {text: '거래처 명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'unitPrice',
                fieldName: 'unitPrice',
                type: 'number',
                width: '150',
                styleName: 'right-cell-text',
                header: {text: '단가', styleName: 'center-cell-text'}, numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
        ];

        // 그리드 Provider
        this.itemPriceDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const gridListOption = {
            stateBar: false,
            checkBar: true,
            footers: false,
        };

        this.itemPriceDataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.itemPriceDataProvider,
            'item-price',
            this.itemPriceColumns,
            this.itemPriceFields,
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
                const rtn = this._itemPriceService.getHeader(this.itemPricePagenation.page, this.itemPricePagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
                this.selectCallBack(rtn);
            }
            ;
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellDblClicked = (grid, clickData) => {
            if (clickData.cellType !== 'header') {
                if (clickData.cellType !== 'head') {
                    const account = grid.getValues(clickData.dataRow).account;
                    const itemCd = grid.getValues(clickData.dataRow).itemCd;
                    const type = grid.getValues(clickData.dataRow).type;

                    // @ts-ignore
                    this._itemPriceService.getItemPriceHistorysById(account, itemCd, type)
                        .subscribe((itemPrice) => {
                            // Set the selected Account
                            this.selectedItemPriceHeader = itemPrice;
                            this._itemPriceService.getHistory(0, 10, '', 'asc', this.selectedItemPriceHeader);

                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        });
                    if (!this.isMobile) {
                        const d = this._matDialog.open(ItemPriceHistoryComponent, {
                            autoFocus: false,
                            disableClose: true,
                            data: {
                                detail: this.selectedItemPriceHeader
                            },
                        });
                        d.afterClosed().subscribe(() => {
                            this.selectHeader();
                        });
                    } else {
                        const d = this._matDialog.open(ItemPriceHistoryComponent, {
                            autoFocus: false,
                            width: 'calc(100% - 50px)',
                            maxWidth: '100vw',
                            maxHeight: '80vh',
                            disableClose: true
                        });
                        const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                            if (size.matches) {
                                d.updateSize('calc(100vw - 10px)', '');
                            }
                        });
                        d.afterClosed().subscribe(() => {
                            smallDialogSubscription.unsubscribe();
                            this.selectHeader();
                        });
                    }
                }
            }
        };

        this.setGridData();
        //페이지 라벨
        this._paginator._intl.itemsPerPageLabel = '';
        this._itemPriceService.itemPricePagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((itemPricePagenation: ItemPricePagenation) => {
                this.itemPricePagenation = itemPricePagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    selectHeader(): void {
        const rtn = this._itemPriceService.getHeader(0, 20, 'itemNm', 'desc', this.searchForm.getRawValue());
        //this.setGridData();
        this.selectCallBack(rtn);
    }

    newItemPrice(): void {
        if (!this.isMobile) {
            this._matDialog.open(ItemPriceNewComponent, {
                autoFocus: false,
                maxHeight: '80vh',
                disableClose: true,
                data: {
                    note: {}
                },
            });
        } else {
            const d = this._matDialog.open(ItemPriceNewComponent, {
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    d.updateSize('calc(100vw - 10px)', '');
                }
            });
            d.afterClosed().subscribe(() => {
                smallDialogSubscription.unsubscribe();
            });
        }
    }


    ngAfterViewInit(): void {
        // Get products if sort or page changes
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._itemPriceService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, '', this.orderBy, this.searchForm.getRawValue());
            }),
            map(() => {
                this.isLoading = false;
            })
        ).subscribe();
    }

    //엑셀 다운로드
    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '픔목 내역');
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.selectHeader();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    deleteItemPrice() {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.itemPriceDataProvider);
        if (checkValues.length < 1) {
            this._functionService.cfn_alert('취소 대상을 선택해주세요.');
            return;
        } else {
            const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
                title: '',
                message: '삭제하시겠습니까?',
                icon: this._formBuilder.group({
                    show: true,
                    name: 'heroicons_outline:exclamation',
                    color: 'warn'
                }),
                actions: this._formBuilder.group({
                    confirm: this._formBuilder.group({
                        show: true,
                        label: '삭제',
                        color: 'warn'
                    }),
                    cancel: this._formBuilder.group({
                        show: true,
                        label: '닫기'
                    })
                }),
                dismissible: true
            }).value);


            confirmation.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        this._itemPriceService.deleteItemPrice(checkValues)
                            .subscribe(
                                (param: any) => {

                                    this._functionService.cfn_loadingBarClear();

                                    this._functionService.cfn_alertCheckMessage(param);
                                    // Mark for check
                                    this._changeDetectorRef.markForCheck();
                                    this.selectHeader();
                                }, (response) => {
                                });
                    } else {
                        this.selectHeader();
                    }
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    setGridData(): void {
        this.itemPrices$ = this._itemPriceService.itemPrices$;
        this._itemPriceService.itemPrices$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((itemPrices: any) => {
                if (itemPrices !== null) {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.itemPriceDataProvider, itemPrices);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    //페이징
    pageEvent($event: PageEvent): void {
        const rtn = this._itemPriceService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, '', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    selectClear() {
        this.selection.clear();
        this._changeDetectorRef.markForCheck();
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.itemPriceDataProvider, ex.itemPrice);
            this._itemPriceService.itemPricePagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((itemPricePagination: ItemPricePagenation) => {
                    // Update the pagination
                    this.itemPricePagenation = itemPricePagination;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if(ex.itemPrice.length < 1){
                this._functionService.cfn_alert('검색된 정보가 없습니다.');
            }
        });
    }
}
