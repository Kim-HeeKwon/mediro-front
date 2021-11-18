import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatTable} from '@angular/material/table';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {SelectionModel} from '@angular/cdk/collections';
import {merge, Observable, Subject} from 'rxjs';
import {TableConfig, TableStyle} from '../../../../../../@teamplat/components/common-table/common-table.types';
import {ItemPriceHistory, ItemPriceHistoryPagenation} from '../item-price.types';
import {CommonCode, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {ItemPriceService} from '../item-price.service';
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import {FunctionService} from '../../../../../../@teamplat/services/function';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {Columns} from '../../../../../../@teamplat/services/realgrid/realgrid.types';
import {FuseRealGridService} from '../../../../../../@teamplat/services/realgrid';

@Component({
    selector       : 'dms-item-price-history',
    templateUrl    : './item-price-history.component.html',
    styleUrls: ['./item-price-history.component.scss'],
})
export class ItemPriceHistoryComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatPaginator) private _itemPriceHistoryPagenator: MatPaginator;
    orderBy: any = 'asc';
    itemPriceHistorys$ = new Observable<ItemPriceHistory[]>();
    isProgressSpinner: boolean = false;
    isLoading: boolean = false;
    selectedItemPrice: ItemPriceHistory | null = null;
    itemPriceHistoryForm: FormGroup;
    reason: CommonCode[] = null;
    type: CommonCode[] = null;
    itemPriceHistoryPagenation: ItemPriceHistoryPagenation | null = null;
    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    itemPriceHistoryDataProvider: RealGrid.LocalDataProvider;
    itemPriceHistoryColumns: Columns[];
    itemPriceHistoryFields: DataFieldObject[] = [
        {fieldName: 'addDate', dataType: ValueType.TEXT},
        {fieldName: 'reason', dataType: ValueType.TEXT},
        {fieldName: 'unitPrice', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'account', dataType: ValueType.TEXT},
        {fieldName: 'accountNm', dataType: ValueType.TEXT},
        {fieldName: 'type', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _realGridsService: FuseRealGridService,
        private _itemPriceService: ItemPriceService,
        public matDialogRef: MatDialogRef<ItemPriceHistoryComponent>,
        private _changeDetectorRef: ChangeDetectorRef,
        private _codeStore: CodeStore,
        private _formBuilder: FormBuilder,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _utilService: FuseUtilsService)
    {
        this.reason = _utilService.commonValue(_codeStore.getValue().data,'PRICE_REASON');
        this.type = _utilService.commonValue(_codeStore.getValue().data,'BL_TYPE');
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.itemPriceHistoryDataProvider);
    }

    ngOnInit(): void {

        const reasonValues = [];
        const reasonLables = [];
        this.reason.forEach((param: any) => {
            reasonValues.push(param.id);
            reasonLables.push(param.name);
        });

        const typeValues = [];
        const typeLables = [];
        this.type.forEach((param: any) => {
            typeValues.push(param.id);
            typeLables.push(param.name);
        });
        // Form 생성
        this.itemPriceHistoryForm = this._formBuilder.group({
            itemCd: [{value:''},[Validators.required]], // 품목코드
            itemNm: [{value:''},[Validators.required]], // 품목명
            account: [{value:''},[Validators.required]], // 거래처 코드
            accountNm: [{value:''},[Validators.required]], // 거래처 명
            type: [{value:''}, [Validators.required]],   // 유형
            unitPrice: [0],   // 단가
            active: [false]  // cell상태
        });

        this.itemPriceHistoryForm.controls['itemCd'].disable();
        this.itemPriceHistoryForm.controls['itemNm'].disable();

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

        //그리드 컬럼
        this.itemPriceHistoryColumns = [
                {name: 'addDate', fieldName: 'addDate', type: 'data', width: '170', styleName: 'left-cell-text'
                , header: {text: '일자', styleName: 'left-cell-text'}},
            {name: 'reason', fieldName: 'reason', type: 'data', width: '170', styleName: 'left-cell-text'
                , header: {text: '사유', styleName: 'left-cell-text'},
                values: reasonValues,
                labels: reasonLables,
                lookupDisplay: true
            },
            {name: 'unitPrice', fieldName: 'unitPrice', type: 'data', width: '170', styleName: 'left-cell-text'
                , header: {text: '단가' , styleName: 'left-cell-text'}},
            {name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '170', styleName: 'left-cell-text'
                , header: {text: '품목코드' , styleName: 'left-cell-text'}},
            {name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '170', styleName: 'right-cell-text'
                , header: {text: '품목명' , styleName: 'left-cell-text'}
            },
            {name: 'account', fieldName: 'account', type: 'data', width: '170', styleName: 'right-cell-text'
                , header: {text: '거래처' , styleName: 'left-cell-text'}
            },
            {name: 'accountNm', fieldName: 'accountNm', type: 'data', width: '170', styleName: 'right-cell-text'
                , header: {text: '거래처명' , styleName: 'left-cell-text'}
            },
            {name: 'type', fieldName: 'type', type: 'data', width: '170', styleName: 'left-cell-text'
                , header: {text: '유형' , styleName: 'left-cell-text'},
                values: typeValues,
                labels: typeLables,
                lookupDisplay: true
            },
        ];

        //그리드 Provider
        this.itemPriceHistoryDataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        //그리드 옵션
        const gridListOption = {
            stateBar : false,
            checkBar : true,
            footers : false,
        };
        this.itemPriceHistoryDataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.itemPriceHistoryDataProvider,
            'itemPriceHistory',
            this.itemPriceHistoryColumns,
            this.itemPriceHistoryFields,
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


        this.itemPriceHistorys$ = this._itemPriceService.itemPriceHistorys$;
        this._itemPriceService.itemPriceHistorys$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((itemPriceHistory: any) => {
                if(itemPriceHistory !== null){
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.itemPriceHistoryDataProvider, itemPriceHistory);
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
            merge(this._itemPriceHistoryPagenator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._itemPriceService.getHistory(this._itemPriceHistoryPagenator.pageIndex, this._itemPriceHistoryPagenator.pageSize, 'addDate', this.orderBy, itemPrice);
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).pipe(takeUntil(this._unsubscribeAll)).subscribe();
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

        const confirmation = this._teamPlatConfirmationService.open({
            title : '',
            message: '저장하시겠습니까?',
            actions: {
                confirm: {
                    label: '확인'
                },
                cancel: {
                    label: '닫기'
                }
            }
        });

        confirmation.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if(result){
                    this.isProgressSpinner = true;
                    this._itemPriceService.updateItemPrice(itemPriceArray)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((itemPriceHistory: any) => {
                            this.isProgressSpinner = false;
                        });
                }
            });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
}
