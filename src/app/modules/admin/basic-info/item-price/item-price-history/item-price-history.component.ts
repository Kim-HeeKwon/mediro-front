import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {MatTable} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {SelectionModel} from "@angular/cdk/collections";
import {merge, Observable, Subject} from "rxjs";
import {InBoundDetail, InBoundDetailPagenation} from "../../../bound/inbound/inbound.types";
import {TableConfig, TableStyle} from "../../../../../../@teamplat/components/common-table/common-table.types";
import {ItemPriceHistory, ItemPriceHistoryPagenation} from "../item-price.types";
import {CommonCode, FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {InboundService} from "../../../bound/inbound/inbound.service";
import {MatDialog} from "@angular/material/dialog";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {ItemPriceService} from "../item-price.service";
import {SaveAlertComponent} from "../../../../../../@teamplat/components/common-alert/save-alert";

@Component({
    selector       : 'item-price-history',
    templateUrl    : './item-price-history.component.html',
    styleUrls: ['./item-price-history.component.scss'],
})
export class ItemPriceHistoryComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatTable,{static:true}) _table: MatTable<any>;
    @ViewChild(MatPaginator) private _itemPriceHistoryPagenator: MatPaginator;
    @ViewChild(MatSort) private _itemPriceHistorySort: MatSort;
    isLoading: boolean = false;
    itemPriceHistoryForm: FormGroup;
    selection = new SelectionModel<any>(true, []);
    itemPriceHistorysCount: number = 0;
    itemPriceHistorys$ = new Observable<ItemPriceHistory[]>();
    itemPriceHistorysTableStyle: TableStyle = new TableStyle();
    itemPriceHistorysTable: TableConfig[] = [
        {headerText : '라인번호' , dataField : 'seq', display : false},
        {headerText : '일자' , dataField : 'addDate', width: 120, display : true, disabled : true, type: 'date'},
        {headerText : '사유' , dataField : 'reason', width: 100, display : true, disabled : true, type: 'text', combo: true},
        {headerText : '단가' , dataField : 'unitPrice', width: 100, display : true, disabled : true, type: 'number', style: this.itemPriceHistorysTableStyle.textAlign.right},
        {headerText : '품목코드' , dataField : 'itemCd', width: 60, display : true, disabled : true, type: 'text'},
        {headerText : '품목명' , dataField : 'itemNm', width: 60, display : true, disabled : true, type: 'text'},
        {headerText : '거래처' , dataField : 'account', width: 60, display : true, disabled : true, type: 'text'},
        {headerText : '거래처명' , dataField : 'accountNm', width: 60, display : true, disabled : true, type: 'text'},
        {headerText : '유형' , dataField : 'type', width: 60, display : true, disabled : true, type: 'text', combo: true},
    ];
    itemPriceHistorysTableColumns: string[] = [
        'no',
        'seq',
        'addDate',
        'reason',
        'unitPrice',
        'itemCd',
        'itemNm',
        'account',
        'accountNm',
        'type',
    ];
    reason: CommonCode[] = null;
    type: CommonCode[] = null;
    itemPriceHistoryPagenation: ItemPriceHistoryPagenation | null = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _itemPriceService: ItemPriceService,
        private _matDialog: MatDialog,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _formBuilder: FormBuilder,
        public _matDialogPopup: MatDialog,
        private _codeStore: CodeStore,
        private _changeDetectorRef: ChangeDetectorRef,
        private _utilService: FuseUtilsService
    )
    {
        this.reason = _utilService.commonValue(_codeStore.getValue().data,'PRICE_REASON');
        this.type = _utilService.commonValue(_codeStore.getValue().data,'BL_TYPE');
        this.itemPriceHistorys$ = this._itemPriceService.itemPriceHistorys$;
        this._itemPriceService.itemPriceHistorys$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((itemPriceHistory: any) => {
                // Update the counts
                if(itemPriceHistory !== null){
                    this.itemPriceHistorysCount = itemPriceHistory.length;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On init
     */
    ngOnInit(): void
    {

        // Form 생성
        this.itemPriceHistoryForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            itemCd: [{value:''},[Validators.required]], // 품목코드
            account: [{value:''},[Validators.required]], // 거래처 코드
            type: [{value:''}, [Validators.required]],   // 유형
            unitPrice: [0],   // 단가
            active: [false]  // cell상태
        });

        this._itemPriceService.itemPrice$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((price: any) => {
                // Update the pagination
                if(price !== null){
                    this.itemPriceHistoryForm.patchValue(price);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });


        this._itemPriceService.itemPriceHistoryPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((itemPriceHistoryPagenation: ItemPriceHistoryPagenation) => {
                // Update the pagination
                if(itemPriceHistoryPagenation !== null){
                    this.itemPriceHistoryPagenation = itemPriceHistoryPagenation;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        let itemPrice = null;

        this._itemPriceService.itemPrice$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((price: any) => {
                // Update the pagination
                if(price !== null){
                    itemPrice = price;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        if(itemPrice === null){
            itemPrice = {};
        }

        if(this._itemPriceHistorySort !== undefined){
            // Get products if sort or page changes
            merge(this._itemPriceHistorySort.sortChange, this._itemPriceHistoryPagenator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._itemPriceService.getHistory(this._itemPriceHistoryPagenator.pageIndex, this._itemPriceHistoryPagenator.pageSize, this._itemPriceHistorySort.active, this._itemPriceHistorySort.direction, itemPrice);
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).pipe(takeUntil(this._unsubscribeAll)).subscribe();
        }
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param account
     */
    trackByFn(index: number, history: any): any {
        return history.id || index;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    updateItemPrice() {

        const itemPrice = {};
        const itemPriceArray = [];
        itemPrice['account'] = this.itemPriceHistoryForm.controls['account'].value;
        itemPrice['itemCd'] = this.itemPriceHistoryForm.controls['itemCd'].value;
        itemPrice['type'] = this.itemPriceHistoryForm.controls['type'].value;
        itemPrice['unitPrice'] = this.itemPriceHistoryForm.controls['unitPrice'].value;

        itemPriceArray.push(itemPrice);

        const saveConfirm =this._matDialog.open(SaveAlertComponent, {
            data: {
            }
        });

        saveConfirm.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                console.log(itemPriceArray);

                this._itemPriceService.updateItemPrice(itemPriceArray)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((itemPriceHistory: any) => {
                    });
            });
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getComboData(column: TableConfig) {
        let combo;
        if(column.dataField === 'type'){
            combo = this.type;
        }else if(column.dataField === 'reason'){
            combo = this.reason;
        }
        return combo;
    }
}
