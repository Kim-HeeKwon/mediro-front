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

import * as XLSX from 'xlsx';

import {
    BreakpointObserver,
    Breakpoints,
    BreakpointState
} from '@angular/cdk/layout';

import { DeviceDetectorService } from 'ngx-device-detector';
import {Common} from "../../../../../@teamplat/providers/common/common";

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
    itemsTableColumns: string[] = ['details', 'itemCd', 'itemNm', 'itemGrade','udiYn','unit','standard','supplier','taxGbn','buyPrice','salesPrice'];
    selectedItemForm: FormGroup;
    searchForm: FormGroup;
    selectedItem: InventoryItem | null = null;
    flashMessage: 'success' | 'error' | null = null;

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

    // eslint-disable-next-line @typescript-eslint/member-ordering
    formFieldHelpers: string[] = [''];

    excelData:any;
    file:File;
    arrayBuffer:any;
    excelFileName: string;
    excelFileNameYn: boolean;

    constructor(
        private _common:Common,
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
        this.taxGbn = _utilService.commonValue(_codeStore.getValue().data,'TAX_GBN');
        this.itemUnit = _utilService.commonValue(_codeStore.getValue().data,'ITEM_UNIT');
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data,'ITEM_GRADE');
        this.udiYn = _utilService.commonValue(_codeStore.getValue().data,'UDI_YN');
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
            range: [{}]
        });

        // 아이템(품목) Form 생성
        this.selectedItemForm = this._formBuilder.group({
            itemCd: ['', [Validators.required]], // 품목코드
            itemNm: ['', [Validators.required]], // 품목명
            itemGrade: [''], // 등급
            udiYn: [''], // UDI 신고 대상 유무
            category: [''], // 카테고리
            unit: [''], // 단위
            standard: [''], // 규격
            supplier: [''], // 공급사
            taxGbn: [''], // 거래유형
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

        // Subscribe to 'range' field value changes
        this.searchForm.get('range').valueChanges.subscribe((value) => {
            console.log(value);
            if ( !value )
            {
                return;
            }

            // Set the 'start' field value from the range
            this.searchForm.get('start').setValue(value.start, {emitEvent: false});

            // Set the end field
            this.searchForm.get('end').setValue(value.end, {emitEvent: false});
        });
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

    incomingfile(event) {
        this.file= event.target.files[0];

        if(this.file.size > 1000){
            this.excelFileName = this.file.name;
            this.excelFileNameYn = true;
        }
    }

    upLoad(): void
    {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            this.arrayBuffer = fileReader.result;
            let data = new Uint8Array(this.arrayBuffer);
            let arr = new Array();
            for(let i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
            let bstr = arr.join("");
            let workbook = XLSX.read(bstr, {type:"binary"});
            let first_sheet_name = workbook.SheetNames[0];
            let worksheet = workbook.Sheets[first_sheet_name];

            this.excelData = XLSX.utils.sheet_to_json(worksheet,{raw:true});
            this.uploadToServe(this.excelData);
        }
        fileReader.readAsArrayBuffer(this.file);
    }

    uploadToServe(fileData): void{
        let dataSets = [];
        let indexCnt = 0;

        fileData.filter(data => data)
            .forEach(
                data => {
                    dataSets[indexCnt] = data;
                    indexCnt = indexCnt +1 ;
                }
            );

        // 상품 업로드
        let arrCondition = {
            "excelData": dataSets
        }

        console.log(arrCondition);

        this._common.sendData(arrCondition, '/v1/api/common/excel/upload').subscribe((result: any) => {
           console.log(result);
        });
        console.log(arrCondition);

    }
}
