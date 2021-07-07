import {
    AfterViewInit, ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CommonCode, CommonPopup, FuseUtilsService} from '@teamplat/services/utils';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ITemSearchService} from './item-search.service';
import {BehaviorSubject, merge, Observable, Subject} from 'rxjs';
import {ItemSearchPagination, UdiItem} from './item-search.types';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {fuseAnimations} from '@teamplat/animations';
import {PopupStore} from '../../../app/core/common-popup/state/popup.store';
import {CodeStore} from '../../../app/core/common-code/state/code.store';

export interface DisplayedColumn{
    id: string;
}

export interface Column{
    id: string;
    name: string;
}

@Component({
    selector: 'app-item-search',
    templateUrl: './item-search.component.html',
    styleUrls: ['./item-search.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class ItemSearchComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    udiItemList$: Observable<UdiItem[]>;

    isLoading: boolean = false;
    itemsCount: number = 0;
    displayedColumns: DisplayedColumn[] = [];
    //itemsTableColumns: string[] = ['medDevSeq', 'entpName', 'itemName', 'udidiCode','itemNoFullname','brandName','typeName','grade'];
    itemsTableColumns: string[] = ['entpName','itemName','udidiCode','itemNoFullname','brandName','typeName','grade'];
    clickedRows = new Set<any>();
    getList$: Observable<any>;
    searchForm: FormGroup;
    pagenation: ItemSearchPagination | null = null;

    itemHeader: any;
    itemGrades: CommonCode[] = [];

    private _dataSet: BehaviorSubject<any> = new BehaviorSubject(null);
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        public _matDialogRef: MatDialogRef<ItemSearchComponent>,
        //@Inject(MAT_DIALOG_DATA) public data: any,
        private _utilService: FuseUtilsService,
        private _formBuilder: FormBuilder,
        private _itemSearchService: ITemSearchService,
        private _codeStore: CodeStore,
        private _changeDetectorRef: ChangeDetectorRef,
        private _popupStore: PopupStore) {
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data,'ITEM_GRADE');
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            itemName: ['',Validators.required],
            entpName: ['', Validators.required],
            udidiCode: [''],
            typeName: [''],
            brandName: [''],
            itemNoFullname: [''],
            grade: ['ALL'],
            pageNum: [''],
            searchYn: ['Y'],
            searchOn: [true],
            recordCountPerPage: [100],
        });

        // getItems
        this.udiItemList$ = this._itemSearchService.udiItemList$;

        // Get the udiItemList
        this._itemSearchService.udiItemList$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((items: any) => {
                if(items !== null){
                    // Update the counts
                    this.itemsCount = items.length;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the pagenation
        this._itemSearchService.pagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagenation: ItemSearchPagination) => {
                // Update the pagination
                this.pagenation = pagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // GET the Table Header Setting
        this._itemSearchService.itemHeaderList$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((itemHeader: any) => {
                this.itemHeader = itemHeader;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

    }


    /**
     * After view init
     */
    ngAfterViewInit(): void {
        //console.log(this._sort);
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this.itemsCount = 0;
        this.pagenation = null;
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param account
     */
    trackByFn(index: number, data: any): any {
        //console.log(data);
        return data.id || index;
    }

    selectRow(row: any): void {
        this._matDialogRef.close(row);
    }
    select(): void{
        //this._itemSearchService.getDynamicSql(0,10,'accountCd','asc',this.searchForm.getRawValue());
    }

    getProperty(element, id: string): string{
        return element[id];
    }

    searchUdiItem(): void{
        if ( this.searchForm.invalid )
        {
            return;
        }

        if(this.searchForm.value.grade === 'ALL'){
            this.searchForm.patchValue({'grade':''});
        }

        this._itemSearchService.getUdiSearchItems(0,100,'itemName','asc',this.searchForm.getRawValue());
    }
}
