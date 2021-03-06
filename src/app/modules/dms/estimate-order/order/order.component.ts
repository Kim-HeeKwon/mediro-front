 import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {Columns} from '../../../../../@teamplat/services/realgrid/realgrid.types';
import {merge, Observable, Subject} from 'rxjs';
import {OrderDetail, OrderHeader, OrderHeaderPagenation} from './order.types';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {ActivatedRoute, Router} from '@angular/router';
import {OrderService} from './order.service';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {FunctionService} from '../../../../../@teamplat/services/function';
import {TeamPlatConfirmationService} from '../../../../../@teamplat/services/confirmation';
import {ShortcutsService} from '../../../../layout/common/shortcuts/shortcuts.service';
import {DeviceDetectorService} from 'ngx-device-detector';
import * as moment from 'moment';
import {FuseRealGridService} from '../../../../../@teamplat/services/realgrid';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {Order} from './order.types';
 import {InboundService} from "../../bound/inbound/inbound.service";

@Component({
    selector: 'dms-order',
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit, OnDestroy, AfterViewInit {
    statusProcess: string;
    isLoading: boolean = false;
    isMobile: boolean = false;
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    searchForm: FormGroup;
    status: CommonCode[] = null;
    type: CommonCode[] = null;
    orderHeaderColumns: Columns[];
    orderHeaders$: Observable<OrderHeader[]>;
    orderDetails$ = new Observable<OrderDetail[]>();
    isSearchForm: boolean = false;
    orderBy: any = 'desc';
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    orderHeaderPagenation: OrderHeaderPagenation | null = null;
    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    orderHeaderDataProvider: RealGrid.LocalDataProvider;
    orderHeaderFields: DataFieldObject[] = [
        {fieldName: 'no', dataType: ValueType.TEXT},
        {fieldName: 'mId', dataType: ValueType.TEXT},
        {fieldName: 'poNo', dataType: ValueType.TEXT},
        {fieldName: 'poCreDate', dataType: ValueType.TEXT},
        {fieldName: 'poDate', dataType: ValueType.TEXT},
        {fieldName: 'ibNo', dataType: ValueType.TEXT},
        {fieldName: 'type', dataType: ValueType.TEXT},
        {fieldName: 'status', dataType: ValueType.TEXT},
        {fieldName: 'account', dataType: ValueType.TEXT},
        {fieldName: 'accountNm', dataType: ValueType.TEXT},
        {fieldName: 'email', dataType: ValueType.TEXT},
        {fieldName: 'cellPhoneNumber', dataType: ValueType.TEXT},
        {fieldName: 'poAmt', dataType: ValueType.NUMBER},
        {fieldName: 'remarkHeader', dataType: ValueType.TEXT},
        {fieldName: 'toAccountNm', dataType: ValueType.TEXT},
        {fieldName: 'deliveryDate', dataType: ValueType.TEXT},
        {fieldName: 'custBusinessNumber', dataType: ValueType.TEXT},
        {fieldName: 'custBusinessName', dataType: ValueType.TEXT},
        {fieldName: 'representName', dataType: ValueType.TEXT},
        {fieldName: 'address', dataType: ValueType.TEXT},
        {fieldName: 'businessCondition', dataType: ValueType.TEXT},
        {fieldName: 'businessCategory', dataType: ValueType.TEXT},
        {fieldName: 'phoneNumber', dataType: ValueType.TEXT},
        {fieldName: 'fax', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(private _activatedRoute: ActivatedRoute,
                private _router: Router,
                private _realGridsService: FuseRealGridService,
                private _formBuilder: FormBuilder,
                private _inBoundService: InboundService,
                private _orderService: OrderService,
                private _changeDetectorRef: ChangeDetectorRef,
                private _codeStore: CodeStore,
                private _functionService: FunctionService,
                private _teamPlatConfirmationService: TeamPlatConfirmationService,
                private _utilService: FuseUtilsService,
                private _shortcutService: ShortcutsService,
                private _deviceService: DeviceDetectorService,) {
        this.status = _utilService.commonValue(_codeStore.getValue().data, 'PO_STATUS');
        this.type = _utilService.commonValue(_codeStore.getValue().data, 'PO_TYPE');
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnInit(): void {
        let dashboard = false;
        // ?????? Form ??????
        this.searchForm = this._formBuilder.group({
            status: ['ALL'],
            type: ['ALL'],
            account: [''],
            accountNm: [''],
            poNo: [''],
            range: [{
                start: moment().utc(true).add(-7, 'day').endOf('day').toISOString(),
                end: moment().utc(true).startOf('day').toISOString()
            }],
            start: [],
            end: [],
        });
        if (this._activatedRoute.snapshot.paramMap['params'] !== (null || undefined)
            && Object.keys(this._activatedRoute.snapshot.paramMap['params']).length > 0) {
            this.searchForm = this._formBuilder.group({
                status: ['ALL'],
                type: ['ALL'],
                account: [''],
                accountNm: [''],
                poNo: [''],
                range: [{
                    start: moment().utc(true).add(-1, 'month').endOf('day').toISOString(),
                    end: moment().utc(true).startOf('day').toISOString()
                }],
                start: [],
                end: [],
            });
            this.searchForm.patchValue(this._activatedRoute.snapshot.paramMap['params']);
            dashboard = true;
        }

        const valuesType = [];
        const lablesType = [];

        const valuesStatus = [];
        const lablesStatus = [];

        this.type.forEach((param: any) => {
            valuesType.push(param.id);
            lablesType.push(param.name);
        });

        this.status.forEach((param: any) => {
            valuesStatus.push(param.id);
            lablesStatus.push(param.name);
        });

        //????????? ??????
        this.orderHeaderColumns = [
            {
                name: 'poNo', fieldName: 'poNo', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'poCreDate', fieldName: 'poCreDate', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '?????? ????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'poDate', fieldName: 'poDate', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '?????? ??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'ibNo', fieldName: 'ibNo', type: 'data', width: '150', styleName: 'center-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true,
                    type: 'button'
                }
            },
            {
                name: 'deliveryDate', fieldName: 'deliveryDate', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '?????? ??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'type', fieldName: 'type', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '??????', styleName: 'center-cell-text'},
                values: valuesType,
                labels: lablesType,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.type), renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'status', fieldName: 'status', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '??????', styleName: 'center-cell-text'},
                values: valuesStatus,
                labels: lablesStatus,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.status), renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'account', fieldName: 'account', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '????????? ??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'accountNm', fieldName: 'accountNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '????????? ???', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'poAmt', fieldName: 'poAmt', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '?????? ??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
                , numberFormat: '#,##0'
            },
            {
                name: 'remarkHeader', fieldName: 'remarkHeader', type: 'data', width: '400', styleName: 'left-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
        ];
        //????????? Provider
        this.orderHeaderDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //????????? ??????
        const gridListOption = {
            stateBar: false,
            checkBar: true,
            footers: false,
        };

        //????????? ??????
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.orderHeaderDataProvider,
            'orderHeaderGrid',
            this.orderHeaderColumns,
            this.orderHeaderFields,
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
                if (clickData.cellType !== 'head') {
                    if(this._realGridsService.gfn_GridDataCnt(this.gridList, this.orderHeaderDataProvider)){
                        this.searchSetValue();
                        // eslint-disable-next-line max-len
                        const rtn = this._orderService.getHeader(this.orderHeaderPagenation.page, this.orderHeaderPagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
                        this.selectCallBack(rtn);
                    }
                }
            }
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
                    if(grid.getValues(clickData.dataRow) !== null){
                        this._router.navigate(['estimate-order/order/order-detail', grid.getValues(clickData.dataRow)]);
                    }
                }
            }
        };

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellItemClicked = (grid, index, clickData) => {

            const searchParam = {
                ibNo: clickData.value
            };
            const rtn = this._inBoundService.getHeader(0, 1, 'ibNo', 'desc', searchParam);
            rtn.then((ex) => {
               if(ex.inBoundHeader.length > 0){
                   this._router.navigate(['bound/inbound/inbound-detail', ex.inBoundHeader[0]]);
               }else{
                   this._functionService.cfn_alert('?????? ????????? ???????????? ????????????.');
               }
            });
        };

        //????????? ??????
        this._paginator._intl.itemsPerPageLabel = '';

        if(dashboard){
            this.selectHeader();
        }
        this._changeDetectorRef.markForCheck();
        // this.setGridData();
        //
        // // Get the pagenation
        // this._orderService.orderHeaderPagenation$
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((orderHeaderPagenation: OrderHeaderPagenation) => {
        //         // Update the pagination
        //         this.orderHeaderPagenation = orderHeaderPagenation;
        //         // Mark for check
        //         this._changeDetectorRef.markForCheck();
        //     });
    }

    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._orderService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'poNo', this.orderBy, this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.orderHeaderDataProvider);
    }

    searchSetValue(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.orderHeaderDataProvider, true);
        this.searchForm.patchValue({'start': this.searchForm.get('range').value.start});
        this.searchForm.patchValue({'end': this.searchForm.get('range').value.end});
    }

    setGridData(): void {

        this.orderHeaders$ = this._orderService.orderHeaders$;
        this._orderService.orderHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((orderHeaders: any) => {
                // Update the counts
                if (orderHeaders !== null) {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.orderHeaderDataProvider, orderHeaders);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    selectHeader(): void {
        this.isSearchForm = true;
        this.searchSetValue();
        const rtn = this._orderService.getHeader(0, 40, 'poNo', 'desc', this.searchForm.getRawValue());
        //this.setGridData();
        this.selectCallBack(rtn);
    }

    orderNew(): void {
        this._router.navigate(['estimate-order/order/order-new', {}]);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    orderSend() {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.orderHeaderDataProvider);
        if (checkValues.length < 1) {
            this._functionService.cfn_alert('?????? ????????? ??????????????????.');
            return;
        } else {
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < checkValues.length; i++) {
                if (checkValues[i].status === 'S') {
                    this._functionService.cfn_alert('?????? ??????????????????. <br> ???????????? : ' + checkValues[i].poNo);
                    check = false;
                    return false;
                }
                if (checkValues[i].status === 'CF' || checkValues[i].status === 'P' || checkValues[i].status === 'C' ||
                    checkValues[i].status === 'CFA') {
                    this._functionService.cfn_alert('?????? ??????????????? ????????? ??? ????????????. <br> ???????????? : ' + checkValues[i].poNo);
                    check = false;
                    return false;
                }
            }

            if (check) {
                const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
                    title: '',
                    message: '?????????????????????????',
                    icon: this._formBuilder.group({
                        show: true,
                        name: 'heroicons_outline:mail',
                        color: 'primary'
                    }),
                    actions: this._formBuilder.group({
                        confirm: this._formBuilder.group({
                            show: true,
                            label: '??????',
                            color: 'accent'
                        }),
                        cancel: this._formBuilder.group({
                            show: true,
                            label: '??????'
                        })
                    }),
                    dismissible: true
                }).value);

                confirmation.afterClosed()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result) => {
                        if (result) {
                            this.isLoading = true;
                            this.orderSendCall(checkValues);
                        } else {
                            this.selectHeader();
                        }
                    });
                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        }
    }

    orderSendCall(sendData: Order[]): void {
        if (sendData) {
            this._orderService.orderSend(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((order: any) => {
                    this._functionService.cfn_loadingBarClear();
                    this._functionService.cfn_alertCheckMessage(order);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    this.selectHeader();
                });
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    orderConfirm() {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.orderHeaderDataProvider);
        if (checkValues.length < 1) {
            this._functionService.cfn_alert('?????? ????????? ??????????????????.');
            return;
        } else {
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < checkValues.length; i++) {
                if (checkValues[i].status === 'CF' || checkValues[i].status === 'C') {
                    this._functionService.cfn_alert('?????? ?????? ?????? ??????????????? ????????? ??? ????????????. <br> ???????????? : ' + checkValues[i].poNo);
                    check = false;
                    return false;
                }
            }

            if (check) {
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
                            this.orderConfirmCall(checkValues);
                        } else {
                            this.selectHeader();
                        }
                    });
                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        }
    }

    orderConfirmCall(sendData: Order[]): void {
        if (sendData) {
            this._orderService.orderConfirm(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((order: any) => {
                    this._functionService.cfn_loadingBarClear();
                    this._functionService.cfn_alertCheckMessage(order);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    this.selectHeader();
                });
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    orderCancel() {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.orderHeaderDataProvider);
        if (checkValues.length < 1) {
            this._functionService.cfn_alert('?????? ????????? ??????????????????.');
            return;
        } else {
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < checkValues.length; i++) {
                if (checkValues[i].status !== 'N') {
                    this._functionService.cfn_alert('?????? ??????????????? ????????? ??? ????????????. <br> ???????????? : ' + checkValues[i].poNo);
                    check = false;
                    return false;
                }
            }

            if (check) {
                const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
                    title: '',
                    message: '?????????????????????????',
                    icon: this._formBuilder.group({
                        show: true,
                        name: 'delete',
                        color: 'warn'
                    }),
                    actions: this._formBuilder.group({
                        confirm: this._formBuilder.group({
                            show: true,
                            label: '??????',
                            color: 'warn'
                        }),
                        cancel: this._formBuilder.group({
                            show: true,
                            label: '??????'
                        })
                    }),
                    dismissible: true
                }).value);

                confirmation.afterClosed()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result) => {
                        if (result) {
                            this.orderCancelCall(checkValues);
                        } else {
                            this.selectHeader();
                        }
                    });
            }
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    orderCancelCall(sendData: Order[]): void {
        if (sendData) {
            this._orderService.orderCancel(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((order: any) => {
                    this._functionService.cfn_loadingBarClear();
                    this._functionService.cfn_alertCheckMessage(order);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    this.selectHeader();
                });
        }
    }

    searchFormClick(): void {
        if (this.isSearchForm) {
            this.isSearchForm = false;
        } else {
            this.isSearchForm = true;
        }
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '?????? ??????');
    }

    //?????????
    pageEvent($event: PageEvent): void {

        this.searchSetValue();
        const rtn = this._orderService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'poNo', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.selectHeader();
        }
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            ex.orderHeader.forEach((data) => {
                if(data.cellPhoneNumber === 0){
                    data.cellPhoneNumber = '';
                }else{
                    data.cellPhoneNumber = '0' + data.cellPhoneNumber;
                }
            });

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.orderHeaderDataProvider, ex.orderHeader);
            this._orderService.orderHeaderPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((orderHeaderPagenation: OrderHeaderPagenation) => {
                    // Update the pagination
                    this.orderHeaderPagenation = orderHeaderPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if(ex.orderHeader.length < 1){
                this._functionService.cfn_alert('????????? ????????? ????????????.');
            }
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.orderHeaderDataProvider, false);
        });
    }

    searchStatus(val: string): void{
        this.statusProcess = val;
        if(this.statusProcess !== null) {
            this.searchForm.patchValue({'status': this.statusProcess});
        }
    }
}
