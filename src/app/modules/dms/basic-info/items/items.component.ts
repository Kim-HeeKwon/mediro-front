import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {ItemsService} from '../items/items.service';
import {ActivatedRoute, Router} from '@angular/router';
import {InventoryItem, InventoryPagination} from '../items/items.types';
import {NewItemComponent} from '../items/new-item/new-item.component';
import {MatDialog} from '@angular/material/dialog';
import {merge, Observable, Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {Columns} from '../../../../../@teamplat/services/realgrid/realgrid.types';
import {FuseRealGridService} from '../../../../../@teamplat/services/realgrid';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {DeviceDetectorService} from 'ngx-device-detector';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {MatSort} from '@angular/material/sort';
import {DetailItemsComponent} from './detail-items/detail-items.component';

@Component({
    selector: 'dms-app-items',
    templateUrl: './items.component.html',
    styleUrls: ['./items.component.scss']
})
export class ItemsComponent implements OnInit, AfterViewInit, OnDestroy {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild(MatPaginator, { static: true }) _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    items$: Observable<InventoryItem[]>;
    isProgressSpinner: boolean = false;
    isMobile: boolean = false;
    isLoading: boolean = false;
    drawerMode: 'over' | 'side' = 'over';
    selectedItem: InventoryItem | null = null;
    drawerOpened: boolean = false;
    pagenation: InventoryPagination | null = null;
    orderBy: any = 'asc';
    searchForm: FormGroup;
    itemGrades: CommonCode[] = [];
    udiYn: CommonCode[] = [];
    itemUnit: CommonCode[] = [];
    taxGbn: CommonCode[] = [];
    searchCondition: CommonCode[] = [
        {
            id: '100',
            name: '품목코드'
        },
        {
            id: '101',
            name: '품목명'
        }];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gridList: RealGrid.GridView;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    itemsDataProvider: RealGrid.LocalDataProvider;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    itemsColumns: Columns[];
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    itemsFields: DataFieldObject[] = [
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'udiYn', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'supplier', dataType: ValueType.TEXT},
        {fieldName: 'taxGbn', dataType: ValueType.TEXT},
        {fieldName: 'buyPrice', dataType: ValueType.NUMBER},
        {fieldName: 'salesPrice', dataType: ValueType.NUMBER}
    ];
    constructor(
        private _realGridsService: FuseRealGridService,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _route: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _matDialog: MatDialog,
        private _deviceService: DeviceDetectorService,
        private _utilService: FuseUtilsService,
        private _codeStore: CodeStore,
        private _itemService: ItemsService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.taxGbn = _utilService.commonValue(_codeStore.getValue().data,'TAX_GBN');
        this.itemUnit = _utilService.commonValue(_codeStore.getValue().data,'ITEM_UNIT');
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data,'ITEM_GRADE');
        this.udiYn = _utilService.commonValue(_codeStore.getValue().data,'UDI_YN');
        this.isMobile = this._deviceService.isMobile();
    }
    ngAfterViewInit(): void {

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellButtonClicked = (grid, index, column) => {
            alert(index.itemIndex + column.fieldName + '셀버튼 클릭');
        };
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._itemService.getItems(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.itemsDataProvider);
    }

    ngOnInit(): void {

        this._route.params.subscribe((params) => {
            console.log(params);
        });
        // getItems
        this.items$ = this._itemService.items$;
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            itemGrade: ['ALL'],
            itemNm: [''],
            itemCd: [''],
            searchCondition: ['100'],
            searchText: [''],
            range: [{}]
        });

        const itemGradesvalues = [];
        const itemGradeslables = [];
        this.itemGrades.forEach((param: any) => {
            itemGradesvalues.push(param.id);
            itemGradeslables.push(param.name);
        });

        const udiYnvalues = [];
        const udiYnlables = [];
        this.udiYn.forEach((param: any) => {
            udiYnvalues.push(param.id);
            udiYnlables.push(param.name);
        });

        const taxGbnvalues = [];
        const taxGbnlables = [];
        this.taxGbn.forEach((param: any) => {
            taxGbnvalues.push(param.id);
            taxGbnlables.push(param.name);
        });

        //그리드 컬럼
        this.itemsColumns = [
            {name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'left-cell-text'}},
            {name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목명' , styleName: 'left-cell-text'},},
            {name: 'itemGrade', fieldName: 'itemGrade', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '등급', styleName: 'left-cell-text'},
                values: itemGradesvalues,
                labels: itemGradeslables,
                lookupDisplay: true
            },
            {name: 'udiYn', fieldName: 'udiYn', type: 'data', width: '100', styleName: 'left-cell-text', header: {text: 'UDI 대상 유무' , styleName: 'left-cell-text'},
                values: udiYnvalues,
                labels: udiYnlables,
                lookupDisplay: true
            },
            {name: 'unit', fieldName: 'unit', type: 'data', width: '100', styleName: 'left-cell-text', header: {text: '단위' , styleName: 'left-cell-text'}},
            {name: 'standard', fieldName: 'standard', type: 'data', width: '100', styleName: 'left-cell-text', header: {text: '규격' , styleName: 'left-cell-text'}},
            {name: 'supplier', fieldName: 'supplier', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '공급사' , styleName: 'left-cell-text'}},
            {name: 'taxGbn', fieldName: 'taxGbn'
                , type: 'data', width: '100', styleName: 'left-cell-text', header: {text: '거래유형' , styleName: 'left-cell-text'},
                values: taxGbnvalues,
                labels: taxGbnlables,
                lookupDisplay: true},
            {name: 'buyPrice', fieldName: 'buyPrice', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '구매단가' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'},
            {name: 'salesPrice', fieldName: 'salesPrice', type: 'number', width: '100', styleName: 'right-cell-text', header: {text: '판매단가' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'}
        ];

        // 그리드 Provider
        this.itemsDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const gridListOption = {
            stateBar : false,
            checkBar : true,
            footers : false,
        };

        this.itemsDataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.itemsDataProvider,
            'items',
            this.itemsColumns,
            this.itemsFields,
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
            if(clickData.cellType === 'header'){
                this._itemService.getItems(this.pagenation.page,this.pagenation.size,clickData.column,this.orderBy,this.searchForm.getRawValue());
            };
            if(this.orderBy === 'asc'){
                this.orderBy = 'desc';
            }else{
                this.orderBy = 'asc';
            }
        };


        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellDblClicked = (grid, clickData) => {
            if(clickData.cellType !== 'header'){
                if(clickData.cellType !== 'head'){

                    if(!this.isMobile){
                        const d = this._matDialog.open(DetailItemsComponent, {
                            autoFocus: false,
                            disableClose: true,
                            data     : {
                                selectedItem : grid.getValues(clickData.dataRow)
                            },
                        });
                        d.afterClosed().subscribe(() => {
                            this.searchItem();
                        });

                    }else{
                        const d = this._matDialog.open(DetailItemsComponent, {
                            data     : {
                                selectedItem : grid.getValues(clickData.dataRow)
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

        //페이지 라벨
        this._paginator._intl.itemsPerPageLabel = '';

        this._itemService.items$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((items: any) => {
                if(items != null){
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.itemsDataProvider, items);
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the pagenation
        this._itemService.pagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagenation: InventoryPagination) => {
                // Update the pagination
                this.pagenation = pagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * SearchItem
     */
    searchItem(): void
    {
        console.log(this.searchForm.getRawValue());
        if(this.searchForm.getRawValue().searchCondition === '100') {
            this.searchForm.patchValue({'itemCd': this.searchForm.getRawValue().searchText});
            this.searchForm.patchValue({'itemNm': ''});
        }else if(this.searchForm.getRawValue().searchCondition === '101'){
            this.searchForm.patchValue({'itemNm': this.searchForm.getRawValue().searchText});
            this.searchForm.patchValue({'itemCd': ''});
        }

        this._itemService.getItems(0,10,'itemCd','asc',this.searchForm.getRawValue());
        this.closeDetails();

        this._router.navigate(['.'], { relativeTo: this._route, queryParams: this.searchForm.getRawValue()});
    }

    enter(event): void {
        if(event.keyCode===13){
            this.searchItem();
        }
    }

    //엑셀 다운로드
    excelExport(): void{
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '픔목 내역');
    }

    /**
     * Add a new note
     */
    createItem(): void
    {
        if(!this.isMobile){
            this._matDialog.open(NewItemComponent, {
                autoFocus: false,
                disableClose: true,
                data     : {
                    note: {}
                },
            });
        }else{
            const d = this._matDialog.open(NewItemComponent, {
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

    //페이징
    pageEvent($event: PageEvent): void {
        this._itemService.getItems(this._paginator.pageIndex, this._paginator.pageSize, 'items', this.orderBy, this.searchForm.getRawValue());
    }

    /**
     * Close the details
     */
    closeDetails(): void
    {
        this.isProgressSpinner = false;
        this.selectedItem = null;
    }
}
