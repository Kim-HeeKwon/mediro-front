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
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {merge, Observable, Subject} from 'rxjs';
import {ItemPriceHistory, ItemPriceHistoryPagenation, ItemPricePagenation} from '../item-price.types';
import {CommonCode, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {ItemPriceService} from '../item-price.service';
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {Columns} from '../../../../../../@teamplat/services/realgrid/realgrid.types';
import {FuseRealGridService} from '../../../../../../@teamplat/services/realgrid';
import {fuseAnimations} from "../../../../../../@teamplat/animations";
import {FunctionService} from "../../../../../../@teamplat/services/function";
import {formatDate} from "@angular/common";

@Component({
    selector: 'dms-item-price-history',
    templateUrl: './item-price-history.component.html',
    styleUrls: ['./item-price-history.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class ItemPriceHistoryComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    orderBy: any = 'asc';
    itemPriceHistorys$ = new Observable<ItemPriceHistory[]>();
    isLoading: boolean = false;
    selectedItemPrice: ItemPriceHistory | null = null;
    itemPriceHistoryForm: FormGroup;
    reason: CommonCode[] = null;
    where: any;
    type: CommonCode[] = null;
    itemPriceHistoryPagenation: ItemPriceHistoryPagenation | null = null;
    // @ts-ignore
    gridList: RealGrid.GridView;
    dataForm: any;
    minDate: string;
    // @ts-ignore
    itemPriceHistoryDataProvider: RealGrid.LocalDataProvider;
    itemPriceHistoryColumns: Columns[];
    itemPriceHistoryFields: DataFieldObject[] = [
        {fieldName: 'addDate', dataType: ValueType.TEXT},
        {fieldName: 'endDate', dataType: ValueType.TEXT},
        {fieldName: 'effectiveDate', dataType: ValueType.TEXT},
        {fieldName: 'reason', dataType: ValueType.TEXT},
        {fieldName: 'unitPrice', dataType: ValueType.NUMBER},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'account', dataType: ValueType.TEXT},
        {fieldName: 'accountNm', dataType: ValueType.TEXT},
        {fieldName: 'type', dataType: ValueType.TEXT},
        {fieldName: 'addUser', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _realGridsService: FuseRealGridService,
        private _functionService: FunctionService,
        private _itemPriceService: ItemPriceService,
        public matDialogRef: MatDialogRef<ItemPriceHistoryComponent>,
        private _changeDetectorRef: ChangeDetectorRef,
        private _codeStore: CodeStore,
        private _formBuilder: FormBuilder,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _utilService: FuseUtilsService) {
        this.reason = _utilService.commonValue(_codeStore.getValue().data, 'PRICE_REASON');
        this.type = _utilService.commonValue(_codeStore.getValue().data, 'BL_TYPE');
        this.dataForm = data;
    }

    ngOnInit(): void {
        // Form ??????
        this.itemPriceHistoryForm = this._formBuilder.group({
            itemCd: [{value: ''}, [Validators.required]], // ????????????
            itemNm: [{value: ''}, [Validators.required]], // ?????????
            fomlInfo: [{value: ''}], // ?????????
            refItemNm: [''], // ?????????
            account: [{value: ''}, [Validators.required]], // ????????? ??????
            accountNm: [{value: ''}, [Validators.required]], // ????????? ???
            type: [{value: ''}, [Validators.required]],   // ??????
            unitPrice: [{value: ''}, [Validators.required]],   // ??????
            effectiveDate: [{value: ''}, [Validators.required]],   // ?????? ????????????
            active: [false]  // cell??????
        });
        const now = new Date();
        this.minDate = formatDate(new Date(now.setDate(now.getDate() + 1)), 'yyyy-MM-dd', 'en');
        if (this.dataForm.detail) {
            this.itemPriceHistoryForm.patchValue(this.dataForm.detail);
        }
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
        //????????? ??????
        this.itemPriceHistoryColumns = [
            // {
            //     name: 'addDate', fieldName: 'addDate', type: 'data', width: '130', styleName: 'left-cell-text'
            //     , header: {text: '?????? ??????', styleName: 'center-cell-text'}, renderer: {
            //         showTooltip: true
            //     }
            // },
            {
                name: 'effectiveDate',
                fieldName: 'effectiveDate',
                type: 'data',
                width: '130',
                styleName: 'left-cell-text'
                ,
                header: {text: '?????? ????????????', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'endDate',
                fieldName: 'endDate',
                type: 'data',
                width: '130',
                styleName: 'left-cell-text'
                ,
                header: {text: '?????? ????????????', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'reason', fieldName: 'reason', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text'},
                values: reasonValues,
                labels: reasonLables,
                lookupDisplay: true, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'unitPrice', fieldName: 'unitPrice', type: 'number', width: '120', styleName: 'right-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
                , numberFormat: '#,##0'
            }
            // {name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '120', styleName: 'left-cell-text'
            //     , header: {text: '????????????' , styleName: 'left-cell-text'}},
            // {name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '120', styleName: 'left-cell-text'
            //     , header: {text: '?????????' , styleName: 'left-cell-text'}
            // },
            // {name: 'account', fieldName: 'account', type: 'data', width: '120', styleName: 'left-cell-text'
            //     , header: {text: '?????????' , styleName: 'left-cell-text'}
            // },
            // {name: 'accountNm', fieldName: 'accountNm', type: 'data', width: '120', styleName: 'left-cell-text'
            //     , header: {text: '????????????' , styleName: 'left-cell-text'}
            // },
            // {name: 'type', fieldName: 'type', type: 'data', width: '120', styleName: 'left-cell-text'
            //     , header: {text: '??????' , styleName: 'left-cell-text'},
            //     values: typeValues,
            //     labels: typeLables,
            //     lookupDisplay: true
            // },
            ,{
                name: 'addUser', fieldName: 'addUser', type: 'data', width: '160', styleName: 'left-cell-text'
                , header: {text: '?????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
        ];

        //????????? Provider
        this.itemPriceHistoryDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //????????? ??????
        const gridListOption = {
            stateBar: false,
            checkBar: false,
            footers: false,
        };

        //????????? ??????
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.itemPriceHistoryDataProvider,
            'itemPriceHistory',
            this.itemPriceHistoryColumns,
            this.itemPriceHistoryFields,
            gridListOption);

        //????????? ??????
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
        this.gridList.setCopyOptions({
            enabled: true,
            singleMode: false
        });

        //??????
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                // eslint-disable-next-line max-len
                this._itemPriceService.getHistory(this.itemPriceHistoryPagenation.page, this.itemPriceHistoryPagenation.size, clickData.column, this.orderBy, this.itemPriceHistoryForm.getRawValue());
            }
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };
        //????????? ??????
        this._paginator._intl.itemsPerPageLabel = '';

        this._itemPriceService.itemPriceHistoryPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((itemPriceHistoryPagenation: ItemPriceHistoryPagenation) => {
                if (itemPriceHistoryPagenation !== null) {
                    this.itemPriceHistoryPagenation = itemPriceHistoryPagenation;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.itemPriceHistoryForm.controls['itemCd'].disable();
        this.itemPriceHistoryForm.controls['itemNm'].disable();
        this.itemPriceHistoryForm.controls['fomlInfo'].disable();
        this.itemPriceHistoryForm.controls['account'].disable();
        this.itemPriceHistoryForm.controls['accountNm'].disable();
        this.itemPriceHistoryForm.controls['type'].disable();

        this.gridList.refresh();
        this.itemPriceHistoryForm.patchValue({effectiveDate: ''});
        this._changeDetectorRef.markForCheck();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._paginator = null;
        this.itemPriceHistoryPagenation = null;
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.itemPriceHistoryDataProvider);
    }

    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._itemPriceService.getHistory(this._paginator.pageIndex, this._paginator.pageSize, '', this.orderBy, this.itemPriceHistoryForm.getRawValue());
            }),
            map(() => {
                this.isLoading = false;
            })
        ).subscribe();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    updateItemPrice() {

        const itemPrice = {};
        const itemPriceArray = [];
        itemPrice['account'] = this.itemPriceHistoryForm.controls['account'].value;
        itemPrice['itemCd'] = this.itemPriceHistoryForm.controls['itemCd'].value;
        itemPrice['type'] = this.itemPriceHistoryForm.controls['type'].value;
        itemPrice['unitPrice'] = this.itemPriceHistoryForm.controls['unitPrice'].value;
        itemPrice['refItemNm'] = this.itemPriceHistoryForm.controls['refItemNm'].value;
        itemPrice['effectiveDate'] = this.itemPriceHistoryForm.controls['effectiveDate'].value;

        itemPriceArray.push(itemPrice);
        if(!this.itemPriceHistoryForm.invalid){
            const confirmation = this._teamPlatConfirmationService.open({
                title: '',
                message: '?????????????????????????',
                actions: {
                    confirm: {
                        label: '??????'
                    },
                    cancel: {
                        label: '??????'
                    }
                }
            });

            confirmation.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        this._itemPriceService.updateItemPrice(itemPriceArray)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((itemPriceHistory: any) => {

                                this._functionService.cfn_loadingBarClear();

                                this._functionService.cfn_alertCheckMessage(itemPriceHistory);
                                this.selectItemPrice();
                                // Mark for check
                                this._changeDetectorRef.markForCheck();
                            });
                    }
                });
        }else{
            this._functionService.cfn_alert('??????, ?????????, ??????, ??????, ??????????????? ??????????????????.');
        }


        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    selectItemPrice(): void {

        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.itemPriceHistoryDataProvider, true);
        const rtn = this._itemPriceService.getHistory(0, 40, 'seq', 'desc', this.itemPriceHistoryForm.getRawValue());
        this.selectCallBack(rtn);


    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.itemPriceHistoryDataProvider, ex.itemPriceHistorys);

            this._itemPriceService.itemPriceHistoryPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((itemPriceHistoryPagenation: ItemPriceHistoryPagenation) => {
                    this.itemPriceHistoryPagenation = itemPriceHistoryPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.itemPriceHistoryDataProvider, false);
        });
    }

    //?????????
    pageEvent($event: PageEvent): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.itemPriceHistoryDataProvider, true);
        const rtn = this._itemPriceService.getHistory(this._paginator.pageIndex, this._paginator.pageSize, 'seq', this.orderBy, this.itemPriceHistoryForm.getRawValue());
        this.selectCallBack(rtn);
    }
}
