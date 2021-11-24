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
import {MatSort} from '@angular/material/sort';
import {ItemPrice, ItemPricePagenation} from './item-price.types';
import {SelectionModel} from '@angular/cdk/collections';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {MatDialog} from '@angular/material/dialog';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {DeviceDetectorService} from 'ngx-device-detector';
import {ItemPriceService} from './item-price.service';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {ItemPriceNewComponent} from './item-price-new/item-price-new.component';
import {TeamPlatConfirmationService} from '../../../../../@teamplat/services/confirmation';
import {FuseRealGridService} from '../../../../../@teamplat/services/realgrid';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {Columns} from '../../../../../@teamplat/services/realgrid/realgrid.types';
import {ItemPriceHistoryComponent} from './item-price-history/item-price-history.component';

@Component({
    selector: 'dms-app-item-price',
    templateUrl: 'item-price.component.html',
    styleUrls: ['item-price.component.scss']
})
export class ItemPriceComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
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
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'account', dataType: ValueType.TEXT},
        {fieldName: 'accountNm', dataType: ValueType.TEXT},
        {fieldName: 'unitPrice', dataType: ValueType.NUMBER}
    ];

    constructor(
        private _matDialog: MatDialog,
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

        //그리드 컬럼
        this.itemPriceColumns = [
            {
                name: 'type', fieldName: 'type', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '유형', styleName: 'left-cell-text'},
                values: itemPricevalues,
                labels: itemPricelables,
                lookupDisplay: true
            },
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'left-cell-text'}
            },
            {
                name: 'itemNm',
                fieldName: 'itemNm',
                type: 'data',
                width: '150',
                styleName: 'left-cell-text',
                header: {text: '품목명', styleName: 'left-cell-text'}
            },
            {
                name: 'account',
                fieldName: 'account',
                type: 'data',
                width: '150',
                styleName: 'left-cell-text',
                header: {text: '거래처', styleName: 'left-cell-text'},
            },
            {
                name: 'accountNm',
                fieldName: 'accountNm',
                type: 'data',
                width: '150',
                styleName: 'left-cell-text',
                header: {text: '거래처 명', styleName: 'left-cell-text'}
            },
            {
                name: 'unitPrice',
                fieldName: 'unitPrice',
                type: 'number',
                width: '150',
                styleName: 'right-cell-text',
                header: {text: '단가', styleName: 'left-cell-text'}
                ,
                numberFormat: '#,##0'
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
                this._itemPriceService.getHeader(this.itemPricePagenation.page, this.itemPricePagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
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
                            } else {
                                // d.updateSize('calc(100% - 50px)', '');
                            }
                        });
                        d.afterClosed().subscribe(() => {
                            smallDialogSubscription.unsubscribe();
                        });
                    }
                }
            }
        };

      this.setGridData();

        this._itemPriceService.itemPricePagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((itemPricePagenation: ItemPricePagenation) => {
                this.itemPricePagenation = itemPricePagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    selectHeader(): void {
        this._itemPriceService.getHeader(0, 10, 'itemNm', 'desc', this.searchForm.getRawValue());
        this.setGridData();
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
                } else {
                    // d.updateSize('calc(100% - 50px)', '');
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
        if (this.selection.selected.length > 0) {

            const deleteConfirm = this._teamPlatConfirmationService.open(this._formBuilder.group({
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

            deleteConfirm.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        this._itemPriceService.deleteItemPrice(this.selection.selected)
                            .subscribe(
                                (param: any) => {
                                    if (param.status === 'SUCCESS') {
                                        this._itemPriceService.getHeader();
                                    } else {
                                        this.selectClear();
                                    }

                                }, (response) => {
                                });
                    } else {
                        this.selectClear();
                    }
                });

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
        this._itemPriceService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, '', this.orderBy, this.searchForm.getRawValue());
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    selectClear() {
        this.selection.clear();
        this._changeDetectorRef.markForCheck();
    }
}
