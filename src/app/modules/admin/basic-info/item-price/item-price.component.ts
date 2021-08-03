import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {fuseAnimations} from '../../../../../@teamplat/animations';
import {merge, Observable, Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {ItemPrice, ItemPricePagenation} from './item-price.types';
import {SelectionModel} from '@angular/cdk/collections';
import {TableConfig, TableStyle} from '../../../../../@teamplat/components/common-table/common-table.types';
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

@Component({
    selector: 'app-item-price',
    templateUrl: './item-price.component.html',
    styleUrls: ['./item-price.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class ItemPriceComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild(MatSort) private _sort: MatSort;
    isMobile: boolean = false;
    selection = new SelectionModel<any>(true, []);
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    itemPrices$: Observable<ItemPrice[]>;
    itemPricePagenation: ItemPricePagenation | null = null;
    isLoading: boolean = false;
    itemPricesCount: number = 0;
    itemPricesTableStyle: TableStyle = new TableStyle();

    itemPricesTable: TableConfig[] = [
        {headerText : '매입/매출' , dataField : 'type', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '품목코드' , dataField : 'itemCd', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '품목명' , dataField : 'itemNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '거래처' , dataField : 'account', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '거래처 명' , dataField : 'accountNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '단가' , dataField : 'unitPrice', width: 100, display : true, disabled : true, type: 'number'},
    ];
    itemPricesTableColumns: string[] = [
        'select',
        /*'no',*/
        'details',
        'type',
        'itemCd',
        'itemNm',
        'account',
        'accountNm',
        'unitPrice',
    ];
    searchForm: FormGroup;
    selectedItemPriceHeader: ItemPrice | null = null;
    type: CommonCode[] = null;
    filterList: string[];
    flashMessage: 'success' | 'error' | null = null;
    navigationSubscription: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    searchCondition: CommonCode[] = [
        {
            id: '100',
            name: '거래처 명'
        }];
    constructor(
        private _matDialog: MatDialog,
        public _matDialogPopup: MatDialog,
        private _formBuilder: FormBuilder,
        private _itemPriceService: ItemPriceService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _codeStore: CodeStore,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.navigationSubscription = this._router.events.subscribe((e: any) => {
            // RELOAD로 설정했기때문에 동일한 라우트로 요청이 되더라도
            // 네비게이션 이벤트가 발생한다. 우리는 이 네비게이션 이벤트를 구독하면 된다.
            if (e instanceof NavigationEnd) {
                if(e.url === '/basic-info/item-price'){
                    //this._itemPriceService.getHeader(0,10,'itemNm','desc',{});
                }
            }
        });
        this.type = _utilService.commonValue(_codeStore.getValue().data,'BL_TYPE');
        this.isMobile = this._deviceService.isMobile();
    }
    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            type: ['ALL'],
            accountNm: [''],
            searchCondition: ['100'],
            searchText: [''],
        });

        this.itemPrices$ = this._itemPriceService.itemPrices$;
        this._itemPriceService.itemPrices$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((itemPrices: any) => {
                if(itemPrices !== null){
                    this.itemPricesCount = itemPrices.length;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._itemPriceService.itemPricePagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((itemPricePagenation: ItemPricePagenation) => {
                this.itemPricePagenation = itemPricePagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        if(this._sort !== undefined){
            // Get products if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._itemPriceService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchForm.getRawValue());
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).subscribe();
        }
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
     * @param account
     */
    trackByFn(index: number, itemPrice: any): any {
        return itemPrice.id || index;
    }

    /**
     * Toggle product details
     *
     * @param account
     */
    toggleDetails(account: string, itemCd: string, type: string): void
    {
        // If the Account is already selected...
        if ( this.selectedItemPriceHeader && (this.selectedItemPriceHeader.account === account &&
                                             this.selectedItemPriceHeader.itemCd === itemCd &&
                                            this.selectedItemPriceHeader.type === type))
        {
            // Close the details
            this.closeDetails();
            return;
        }

        // Get the product by account
        this._itemPriceService.getItemPriceHistorysById(account, itemCd, type)
            .subscribe((itemPrice) => {
                // Set the selected Account
                this.selectedItemPriceHeader = itemPrice;

                // Fill the form
                // @ts-ignore
                this._itemPriceService.getHistory(0,10,'','asc', this.selectedItemPriceHeader);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
    /**
     * Close the details
     */
    closeDetails(): void
    {
        this.selectedItemPriceHeader = null;
    }
    selectHeader(): void
    {
        if(this.searchForm.getRawValue().searchCondition === '100') {
            this.searchForm.patchValue({'account': ''});
            this.searchForm.patchValue({'accountNm': this.searchForm.getRawValue().searchText});
        }
        this._itemPriceService.getHeader(0,10,'itemNm','desc',this.searchForm.getRawValue());
        this.closeDetails();
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): any {
        const numSelected = this.selection.selected.length;
        const numRows = this.itemPricesCount;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): SelectionModel<any> {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }

        this.itemPrices$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((itemPrices) => {
                this.selection.select(...itemPrices);
            });
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: any): string {
        if (!row) {
            return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
    }

    newItemPrice(): void{
        if(!this.isMobile){
            this._matDialog.open(ItemPriceNewComponent, {
                autoFocus: false,
                disableClose: true,
                data     : {
                    note: {}
                },
            });
        }else{
            const d = this._matDialog.open(ItemPriceNewComponent, {
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

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    deleteItemPrice() {

        if(this.selection.selected.length > 0){

            const deleteConfirm = this._teamPlatConfirmationService.open(this._formBuilder.group({
                title      : '',
                message    : '삭제하시겠습니까?',
                icon       : this._formBuilder.group({
                    show : true,
                    name : 'heroicons_outline:exclamation',
                    color: 'warn'
                }),
                actions    : this._formBuilder.group({
                    confirm: this._formBuilder.group({
                        show : true,
                        label: '삭제',
                        color: 'warn'
                    }),
                    cancel : this._formBuilder.group({
                        show : true,
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
                                    if(param.status === 'SUCCESS'){
                                        this._itemPriceService.getHeader();
                                        this.closeDetails();
                                    }else{
                                        this.closeDetails();
                                        this.selectClear();
                                    }

                                },(response) => {
                                });
                    }else{
                        this.closeDetails();
                        this.selectClear();
                    }
                });

        }
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    selectClear() {
        this.selection.clear();
        this._changeDetectorRef.markForCheck();
    }
}
