import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {Columns} from '../../../../../@teamplat/services/realgrid/realgrid.types';
import {merge, Observable, Subject} from 'rxjs';
import {
    Estimate,
    EstimateDetail,
    EstimateHeader,
    EstimateHeaderPagenation
} from './estimate.types';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {FuseRealGridService} from '../../../../../@teamplat/services/realgrid';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {EstimateService} from './estimate.service';
import {FunctionService} from '../../../../../@teamplat/services/function';
import {TeamPlatConfirmationService} from '../../../../../@teamplat/services/confirmation';
import {ShortcutsService} from '../../../../layout/common/shortcuts/shortcuts.service';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {DeviceDetectorService} from 'ngx-device-detector';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import * as moment from 'moment';

@Component({
    selector: 'app-dms-estimate',
    templateUrl: './estimate.component.html',
    styleUrls: ['./estimate.component.scss']
})

export class EstimateComponent implements OnInit, OnDestroy, AfterViewInit {
    isLoading: boolean = false;
    isMobile: boolean = false;
    statusProcess: string;
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    searchForm: FormGroup;
    status: CommonCode[] = null;
    type: CommonCode[] = null;
    estimateHeaderColumns: Columns[];
    estimateHeaders$: Observable<EstimateHeader[]>;
    estimateDetails$ = new Observable<EstimateDetail[]>();
    isSearchForm: boolean = false;
    orderBy: any = 'desc';
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    estimateHeaderPagenation: EstimateHeaderPagenation | null = null;
    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    estimateHeaderDataProvider: RealGrid.LocalDataProvider;
    estimateHeaderFields: DataFieldObject[] = [
        {fieldName: 'Rating', dataType: ValueType.TEXT},
        {fieldName: 'no', dataType: ValueType.TEXT},
        {fieldName: 'mId', dataType: ValueType.TEXT},
        {fieldName: 'qtNo', dataType: ValueType.TEXT},
        {fieldName: 'qtCreDate', dataType: ValueType.TEXT},
        {fieldName: 'qtDate', dataType: ValueType.TEXT},
        {fieldName: 'effectiveDate', dataType: ValueType.TEXT},
        {fieldName: 'type', dataType: ValueType.TEXT},
        {fieldName: 'status', dataType: ValueType.TEXT},
        {fieldName: 'account', dataType: ValueType.TEXT},
        {fieldName: 'accountNm', dataType: ValueType.TEXT},
        {fieldName: 'accountAddress', dataType: ValueType.TEXT},
        {fieldName: 'poCreate', dataType: ValueType.TEXT},
        {fieldName: 'soCreate', dataType: ValueType.TEXT},
        {fieldName: 'email', dataType: ValueType.TEXT},
        {fieldName: 'cellPhoneNumber', dataType: ValueType.TEXT},
        {fieldName: 'qtAmt', dataType: ValueType.NUMBER},
        {fieldName: 'soNo', dataType: ValueType.TEXT},
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

    constructor(
        private _realGridsService: FuseRealGridService,
        private _activatedRoute: ActivatedRoute,
        public _matDialogPopup: MatDialog,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _estimateService: EstimateService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _functionService: FunctionService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _shortcutService: ShortcutsService,
        private _codeStore: CodeStore,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
    ) {
        this.status = _utilService.commonValue(_codeStore.getValue().data, 'QT_STATUS');
        this.type = _utilService.commonValue(_codeStore.getValue().data, 'QT_TYPE');
        this.isMobile = this._deviceService.isMobile();
    }

    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._estimateService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'qtNo', this.orderBy, this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.estimateHeaderDataProvider);
    }

    ngOnInit(): void {
        let dashboard = false;
        // ?????? Form ??????
        this.searchForm = this._formBuilder.group({
            status: ['ALL'],
            type: ['ALL'],
            account: [''],
            accountNm: [''],
            qtNo: [''],
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
                qtNo: [''],
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
        this.estimateHeaderColumns = [
            // {
            //     name: 'Rating',
            //     fieldName: 'Rating',
            //     type: 'data',
            //     width: '200',
            //     renderer: {
            //         type: 'signalbar',
            //         barCount: 5,
            //         minimum: 0,
            //         maximum: 5,
            //         startRate: 20,
            //         endRate: 100
            //     },
            //     header: {
            //         text: 'Process bar'
            //     },
            //     styleName: 'right-column'
            // },
            {
                name: 'qtNo', fieldName: 'qtNo', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'qtCreDate', fieldName: 'qtCreDate', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '?????? ????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'qtDate', fieldName: 'qtDate', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '?????? ??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'deliveryDate', fieldName: 'deliveryDate', type: 'data', width: '130', styleName: 'left-cell-text'
                , header: {text: '?????? ??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'effectiveDate', fieldName: 'effectiveDate', type: 'data', width: '130', styleName: 'left-cell-text'
                , header: {text: '????????? ????????????', styleName: 'center-cell-text'}, renderer: {
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
                name: 'account', fieldName: 'account', type: 'data', width: '150', styleName: 'left-cell-text'
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
                name: 'qtAmt', fieldName: 'qtAmt', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '?????? ??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
                , numberFormat: '#,##0'
            },
            {
                name: 'poCreate', fieldName: 'poCreate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '?????????', styleName: 'center-cell-text'}
                , renderer: {
                    type: 'html',
                    template: '<button class="mediro-cell-button">' +
                        '<span>?????????</span>' +
                        '</button>',
                }
            },
            {
                name: 'soCreate', fieldName: 'soCreate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '?????????', styleName: 'center-cell-text'}
                , renderer: {
                    type: 'html',
                    template: '<button class="mediro-cell-button">' +
                        '<span>?????????</span>' +
                        '</button>',
                }
            },
            {
                name: 'remarkHeader', fieldName: 'remarkHeader', type: 'data', width: '300', styleName: 'left-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
        ];

        //????????? Provider
        this.estimateHeaderDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //????????? ??????
        const gridListOption = {
            stateBar: false,
            checkBar: true,
            footers: false,
        };

        //????????? ??????
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.estimateHeaderDataProvider,
            'estimateHeaderGrid',
            this.estimateHeaderColumns,
            this.estimateHeaderFields,
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
            //hideDeletedRows: false,
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
                    if(this._realGridsService.gfn_GridDataCnt(this.gridList, this.estimateHeaderDataProvider)){
                        this.searchSetValue();
                        // eslint-disable-next-line max-len
                        const rtn = this._estimateService.getHeader(this.estimateHeaderPagenation.page, this.estimateHeaderPagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
                        this.selectCallBack(rtn);
                    };
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
                        this._router.navigate(['estimate-order/estimate/estimate-detail', grid.getValues(clickData.dataRow)]);
                    }
                }
            }
        };

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellItemClicked = (grid, index, clickData) => {

            if (clickData.target.innerText === '?????????') {
                this.order(grid.getValues(index.dataRow));
            } else if (clickData.target.innerText === '?????????') {
                this.salesorder(grid.getValues(index.dataRow));
            }
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
        // this._estimateService.estimateHeaderPagenation$
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((estimateHeaderPagenation: EstimateHeaderPagenation) => {
        //         // Update the pagination
        //         this.estimateHeaderPagenation = estimateHeaderPagenation;
        //         // Mark for check
        //         this._changeDetectorRef.markForCheck();
        //     });
    }

    searchSetValue(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.estimateHeaderDataProvider, true);
        this.searchForm.patchValue({'start': this.searchForm.get('range').value.start});
        this.searchForm.patchValue({'end': this.searchForm.get('range').value.end});
    }

    selectHeader(): void {
        this.isSearchForm = true;
        this.searchSetValue();
        const rtn = this._estimateService.getHeader(0, 40, 'qtNo', 'desc', this.searchForm.getRawValue());
        //this.setGridData();
        this.selectCallBack(rtn);
    }

    estimateNew(): void {
        this._router.navigate(['estimate-order/estimate/estimate-new', {}]);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    estimateSend() {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.estimateHeaderDataProvider);

        if (checkValues.length < 1) {
            this._functionService.cfn_alert('?????? ????????? ??????????????????.');
            return;
        } else {
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < checkValues.length; i++) {
                if (checkValues[i].status === 'S') {
                    this._functionService.cfn_alert('?????? ??????????????????. <br> ???????????? : ' + checkValues[i].qtNo);
                    check = false;
                    return false;
                }

                if (checkValues[i].status === 'CF' || checkValues[i].status === 'C') {
                    this._functionService.cfn_alert('?????? ?????? ?????? ????????? ????????? ??? ????????????. <br> ???????????? : ' + checkValues[i].qtNo);
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
                            this.estimateSendCall(checkValues);
                        } else {
                            this.selectHeader();
                        }
                    });
                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        }
    }

    estimateSendCall(sendData: Estimate[]): void {
        if (sendData) {
            this._estimateService.estimateSend(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((estimate: any) => {
                    this._functionService.cfn_loadingBarClear();
                    this._functionService.cfn_alertCheckMessage(estimate);
                    this.isLoading = false;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    this.selectHeader();
                });
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    estimateConfirm() {

        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.estimateHeaderDataProvider);

        if (checkValues.length < 1) {
            this._functionService.cfn_alert('?????? ????????? ??????????????????.');
            return;
        } else {
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < checkValues.length; i++) {
                if (checkValues[i].status === 'CF' || checkValues[i].status === 'C') {
                    this._functionService.cfn_alert('?????? ?????? ?????? ??????????????? ????????? ??? ????????????. <br> ???????????? : ' + checkValues[i].qtNo);
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
                            this.estimateConfirmCall(checkValues);
                        } else {
                            this.selectHeader();
                        }
                    });
            }
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    estimateConfirmCall(sendData: Estimate[]): void {
        if (sendData) {
            this._estimateService.estimateConfirm(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((estimate: any) => {
                    this._functionService.cfn_loadingBarClear();
                    this._functionService.cfn_alertCheckMessage(estimate);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    this.selectHeader();
                });
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    estimateCancel() {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.estimateHeaderDataProvider);

        if (checkValues.length < 1) {
            this._functionService.cfn_alert('?????? ????????? ??????????????????.');
            return;
        } else {
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < checkValues.length; i++) {
                if (checkValues[i].status !== 'N') {
                    this._functionService.cfn_alert('?????? ??????????????? ????????? ??? ????????????. <br> ???????????? : ' + checkValues[i].qtNo);
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
                            this.estimateCancelCall(checkValues);
                        } else {
                            this.selectHeader();
                        }
                    });
            }
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    estimateCancelCall(sendData: Estimate[]): void {
        if (sendData) {
            this._estimateService.estimateCancel(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((estimate: any) => {
                    this._functionService.cfn_loadingBarClear();
                    this._functionService.cfn_alertCheckMessage(estimate);
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
        const rtn = this._estimateService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'qtNo', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    // @ts-ignore
    setGridData(): void {
        this.estimateHeaders$ = this._estimateService.estimateHeaders$;
        this._estimateService.estimateHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estimateHeaders: any) => {
                const estimate = estimateHeaders;
                // Update the counts
                if (estimateHeaders !== null) {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.estimateHeaderDataProvider, estimateHeaders);
                }
                // Mark for check
            });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    order(estimateHeader) {
        const status = estimateHeader.status;

        if (status !== 'CF') {
            this._functionService.cfn_alert('????????? ???????????????. ?????? ???????????????.');
            return;
        }

        const confirmation = this._teamPlatConfirmationService.open({
            title: '',
            message: '????????? ?????????????????????????',
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
                    const rtn = this._estimateService.getDetailReport(0, 1000, 'qtLineNo', 'asc', estimateHeader);

                    rtn.then((ex) => {
                        if(ex.estimateDetail){
                            if(ex.estimateDetail != null){
                                this._router.navigate(['estimate-order/order/order-new'], {
                                    state: {
                                        'header': estimateHeader,
                                        'detail': ex.estimateDetail
                                    }
                                });
                                // Mark for check
                                this._changeDetectorRef.markForCheck();
                                return;
                            }
                        }
                    });
                    // this.estimateDetails$ = this._estimateService.estimateDetails$;
                    // this._estimateService.estimateDetails$
                    //     .pipe(takeUntil(this._unsubscribeAll))
                    //     .subscribe((estimateDetail: any) => {
                    //         if (estimateDetail != null) {
                    //             const estimateDetails = estimateDetail;
                    //             this._router.navigate(['estimate-order/order/order-new'], {
                    //                 state: {
                    //                     'header': estimateHeader,
                    //                     'detail': estimateDetails
                    //                 }
                    //             });
                    //         }
                    //         // Mark for check
                    //         this._changeDetectorRef.markForCheck();
                    //         return;
                    //     });
                } else {
                    this.selectHeader();
                }
            });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    salesorder(estimateHeader) {
        const status = estimateHeader.status;

        if (status !== 'CF') {
            this._functionService.cfn_alert('????????? ???????????????. ?????? ???????????????.');
            return;
        }
        const confirmation = this._teamPlatConfirmationService.open({
            title: '',
            message: '????????? ?????????????????????????',
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
                    const rtn = this._estimateService.getDetailReport(0, 1000, 'qtLineNo', 'asc', estimateHeader);

                    rtn.then((ex) => {
                        if(ex.estimateDetail){
                            if(ex.estimateDetail != null){
                                this._router.navigate(['salesorder/salesorder/salesorder-new'], {
                                    state: {
                                        'header': estimateHeader,
                                        'detail': ex.estimateDetail
                                    }
                                });
                                // Mark for check
                                this._changeDetectorRef.markForCheck();
                                return;
                            }
                        }
                    });
                    // this._estimateService.getDetail(0, 10, 'qtLineNo', 'asc', estimateHeader);
                    //
                    // this.estimateDetails$ = this._estimateService.estimateDetails$;
                    // this._estimateService.estimateDetails$
                    //     .pipe(takeUntil(this._unsubscribeAll))
                    //     .subscribe((estimateDetail: any) => {
                    //         if (estimateDetail != null) {
                    //             const row = {header: estimateHeader, detail: estimateDetail};
                    //             this._router.navigate(['salesorder/salesorder/salesorder-new'], {
                    //                 state: {
                    //                     'header': estimateHeader,
                    //                     'detail': estimateDetail
                    //                 }
                    //             });
                    //         }
                    //         // Mark for check
                    //         this._changeDetectorRef.markForCheck();
                    //         return;
                    //     });
                } else {
                    this.selectHeader();
                }
            });
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.selectHeader();
        }
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {
            ex.estimateHeader.forEach((data) => {
                if(data.cellPhoneNumber === 0){
                    data.cellPhoneNumber = '';
                }else{
                    data.cellPhoneNumber = '0' + data.cellPhoneNumber;
                }
            });

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.estimateHeaderDataProvider, ex.estimateHeader);
            this._estimateService.estimateHeaderPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((estimateHeaderPagenation: EstimateHeaderPagenation) => {
                    // Update the pagination
                    this.estimateHeaderPagenation = estimateHeaderPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if(ex.estimateHeader.length < 1){
                this._functionService.cfn_alert('????????? ????????? ????????????.');
            }
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.estimateHeaderDataProvider, false);
        });
    }

    searchStatus(val: string): void{
        this.statusProcess = val;
        if(this.statusProcess !== null) {
            this.searchForm.patchValue({'status': this.statusProcess});

        }
    }
}
