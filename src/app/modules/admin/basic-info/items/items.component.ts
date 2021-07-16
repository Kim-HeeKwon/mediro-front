import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild, ViewEncapsulation
} from '@angular/core';
import {fuseAnimations} from '@teamplat/animations';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {merge, Observable, Subject} from 'rxjs';
import { debounceTime, map, switchMap, takeUntil } from 'rxjs/operators';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatDialog} from '@angular/material/dialog';
import {InventoryItem, InventoryPagination} from './items.types';
import {ItemsService} from './items.service';
import {NewItemComponent} from './new-item/new-item.component';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {CommonCode, FuseUtilsService} from '@teamplat/services/utils';

import {
    BreakpointObserver,
    Breakpoints,
    BreakpointState
} from '@angular/cdk/layout';

import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
    selector: 'app-items',
    templateUrl: './items.component.html',
    styleUrls: ['./items.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class ItemsComponent implements OnInit, AfterViewInit, OnDestroy {

    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    isMobile: boolean = false;

    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;

    items$: Observable<InventoryItem[]>;
    pagination: InventoryPagination | null = null;

    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    itemsCount: number = 0;
    itemsTableColumns: string[] = ['details', 'itemCd', 'itemNm', 'itemGrade','unit','standard','supplier','buyPrice','salesPrice'];
    selectedItemForm: FormGroup;
    searchForm: FormGroup;
    selectedItem: InventoryItem | null = null;
    flashMessage: 'success' | 'error' | null = null;

    itemGrades: CommonCode[] = [];

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

    // eslint-disable-next-line @typescript-eslint/member-ordering
    formFieldHelpers: string[] = [''];

    constructor(
        private _matDialog: MatDialog,
        private _formBuilder: FormBuilder,
        private _itemService: ItemsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _codeStore: CodeStore,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver
    ) {
        // console.log('hello CodeStore');
        // console.log(_codeStore.getValue());
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data,'ITEM_GRADE');
        this.isMobile = this._deviceService.isMobile();
    }


    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            itemGrade: ['ALL'],
            itemNm: [''],
            itemCd: [''],
            searchCondition: ['100'],
            searchText: [''],
        });

        // 아이템(품목) Form 생성
        this.selectedItemForm = this._formBuilder.group({
            itemCd: ['', [Validators.required]], // 품목코드
            itemNm: ['', [Validators.required]], // 품목명
            itemGrade: [''], // 등급
            category: [''], // 카테고리
            unit: [''], // 단위
            standard: [''], // 규격
            supplier: [''], // 공급단가
            buyPrice: [''], // 구매단가
            salesPrice: [''], // 판매단가
            active: [false]  // cell상태
        });

        // getItems
        this.items$ = this._itemService.items$;

        this._itemService.items$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((items: any) => {
                // Update the counts
                this.itemsCount = items.length;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the pagination
        this._itemService.pagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: InventoryPagination) => {
                // Update the pagination
                this.pagination = pagination;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        //this._paginator._intl.itemsPerPageLabel = 'test';
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        // If the user changes the sort order...
        // this._sort.sortChange
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe(() => {
        //         // Reset back to the first page
        //         this._paginator.pageIndex = 0;
        //
        //         // Close the details
        //         this.closeDetails();
        //     });

        // Get products if sort or page changes
        merge(this._sort.sortChange, this._paginator.page).pipe(
            switchMap(() => {
                // console.log('change paginator!!');
                // console.log(this._paginator.pageIndex);
                // console.log(this._paginator.pageSize);
                // console.log(this._sort.active);
                // console.log(this._sort);
                // this.closeDetails();
                this.isLoading = true;
                return this._itemService.getItems(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchForm.getRawValue());
            }),
            map(() => {
                this.isLoading = false;
            })
        ).subscribe();

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    /**
     * Toggle product details
     *
     * @param itemCd
     */
    toggleDetails(itemCd: string): void
    {
        // If the Item is already selected...
        if ( this.selectedItem && this.selectedItem.itemCd === itemCd )
        {
            // Close the details
            this.closeDetails();
            return;
        }

        // Get the product by itemCd
        this._itemService.getItemsById(itemCd)
            .subscribe((item) => {
                // Set the selected Item
                this.selectedItem = item;

                // Fill the form
                this.selectedItemForm.patchValue(item);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Close the details
     */
    closeDetails(): void
    {
        this.selectedItem = null;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

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
                    // d.updateSize('calc(100% - 50px)', '');
                }
            });
            d.afterClosed().subscribe(() => {
                smallDialogSubscription.unsubscribe();
            });
        }
    }

    /**
     * SearchItem
     */
    searchItem(): void
    {
        if(this.searchForm.getRawValue().searchCondition === '100') {
                this.searchForm.patchValue({'itemCd': this.searchForm.getRawValue().searchText});
                this.searchForm.patchValue({'itemNm': ''});
        }else if(this.searchForm.getRawValue().searchCondition === '101'){
            this.searchForm.patchValue({'itemNm': this.searchForm.getRawValue().searchText});
            this.searchForm.patchValue({'itemCd': ''});
        }

        this._itemService.getItems(0,10,'itemCd','asc',this.searchForm.getRawValue());
    }

    /**
     * Delete Item From Items
     */
    deleteItem(): void
    {
        const itemData = this.selectedItemForm.value;

        this._itemService.deleteItem(itemData)
            .subscribe(
                (param: any) => {
                    if(param.status === 'SUCCESS'){
                        //this._accountService.getAccount();
                        this.closeDetails();
                    }

                },(response) => {
                });
    }

    /**
     * Update Item From Items
     */
    updateItem(): void
    {
        const itemData = this.selectedItemForm.value;

        this._itemService.updateItem(itemData)
            .subscribe(
                (param: any) => {
                    if(param.status === 'SUCCESS'){
                        //this._accountService.getAccount();
                        this.closeDetails();
                    }

                },(response) => {
                });
    }
}
