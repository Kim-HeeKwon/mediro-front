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

@Component({
    selector: 'app-items',
    templateUrl: './items.component.html',
    styleUrls: ['./items.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class ItemsComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    items$: Observable<InventoryItem[]>;

    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    itemsCount: number = 0;
    itemsTableColumns: string[] = ['details', 'itemCd', 'itemNm', 'itemGrade','unit','standard','supplier','buyPrice','salesPrice'];
    selectedItemForm: FormGroup;
    selectedItem: InventoryItem | null = null;
    flashMessage: 'success' | 'error' | null = null;

    //pagination: InventoryPagination;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    formFieldHelpers: string[] = [''];

    // eslint-disable-next-line @typescript-eslint/member-ordering
    pagination: any = {
        endIndex: 9,
        lastPage: 3,
        length: 23,
        page: 0,
        size: 10,
        startIndex: 0
    };

    constructor(
        private _matDialog: MatDialog,
        private _formBuilder: FormBuilder,
        private _itemService: ItemsService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {
    }

    ngOnInit(): void {
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
                console.log('pageNation');
                console.log(this.pagination);
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._paginator._intl.itemsPerPageLabel = 'test';
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
                console.log('change paginator!!');
                console.log(this._paginator.pageIndex);
                console.log(this._paginator.pageSize);
                console.log(this._sort.active);
                console.log(this._sort);
                // this.closeDetails();
                this.isLoading = true;
                return this._itemService.getItems(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
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
        this._matDialog.open(NewItemComponent, {
            autoFocus: false,
            data     : {
                note: {}
            }
        });
    }


}
