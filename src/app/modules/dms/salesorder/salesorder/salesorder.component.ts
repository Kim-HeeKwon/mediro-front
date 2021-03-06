import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {Columns} from '../../../../../@teamplat/services/realgrid/realgrid.types';
import {merge, Observable, Subject} from 'rxjs';
import {SalesOrderDetail, SalesOrderHeader, SalesOrderHeaderPagenation} from './salesorder.types';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {FuseRealGridService} from '../../../../../@teamplat/services/realgrid';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {FunctionService} from '../../../../../@teamplat/services/function';
import {TeamPlatConfirmationService} from '../../../../../@teamplat/services/confirmation';
import {ShortcutsService} from '../../../../layout/common/shortcuts/shortcuts.service';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {DeviceDetectorService} from 'ngx-device-detector';
import {SalesorderService} from './salesorder.service';
import * as moment from 'moment';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {SalesOrder} from '../../../admin/salesorder/salesorder/salesorder.types';
import {OutboundService} from "../../bound/outbound/outbound.service";

@Component({
    selector: 'dms-salesorder',
    templateUrl: './salesorder.component.html',
    styleUrls: ['./salesorder.component.scss']
})
export class SalesorderComponent implements OnInit, OnDestroy, AfterViewInit {
    statusProcess: string;
    isLoading: boolean = false;
    isMobile: boolean = false;
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    searchForm: FormGroup;
    status: CommonCode[] = null;
    type: CommonCode[] = null;
    salesorderHeaderColumns: Columns[];
    salesorderHeaders$: Observable<SalesOrderHeader[]>;
    salesorderDetails$ = new Observable<SalesOrderDetail[]>();
    isSearchForm: boolean = false;
    orderBy: any = 'desc';
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    salesorderHeaderPagenation: SalesOrderHeaderPagenation | null = null;

    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    salesorderHeaderDataProvider: RealGrid.LocalDataProvider;
    salesorderHeaderFields: DataFieldObject[] = [
        {fieldName: 'no', dataType: ValueType.TEXT},
        {fieldName: 'mId', dataType: ValueType.TEXT},
        {fieldName: 'soNo', dataType: ValueType.TEXT},
        {fieldName: 'soCreDate', dataType: ValueType.TEXT},
        {fieldName: 'soDate', dataType: ValueType.TEXT},
        {fieldName: 'type', dataType: ValueType.TEXT},
        {fieldName: 'status', dataType: ValueType.TEXT},
        {fieldName: 'account', dataType: ValueType.TEXT},
        {fieldName: 'accountNm', dataType: ValueType.TEXT},
        {fieldName: 'address', dataType: ValueType.TEXT},
        {fieldName: 'dlvAccount', dataType: ValueType.TEXT},
        {fieldName: 'dlvAccountNm', dataType: ValueType.TEXT},
        {fieldName: 'dlvAddress', dataType: ValueType.TEXT},
        {fieldName: 'dlvDate', dataType: ValueType.TEXT},
        {fieldName: 'email', dataType: ValueType.TEXT},
        {fieldName: 'soAmt', dataType: ValueType.NUMBER},
        {fieldName: 'obNo', dataType: ValueType.TEXT},
        {fieldName: 'remarkHeader', dataType: ValueType.TEXT},
        {fieldName: 'toAccountNm', dataType: ValueType.TEXT},
        {fieldName: 'deliveryDate', dataType: ValueType.TEXT},
        {fieldName: 'custBusinessNumber', dataType: ValueType.TEXT},
        {fieldName: 'custBusinessName', dataType: ValueType.TEXT},
        {fieldName: 'representName', dataType: ValueType.TEXT},
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
        private _outBoundService: OutboundService,
        private _salesorderService: SalesorderService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _functionService: FunctionService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _shortcutService: ShortcutsService,
        private _codeStore: CodeStore,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
    ) {
        this.status = _utilService.commonValue(_codeStore.getValue().data, 'SO_STATUS');
        this.type = _utilService.commonValue(_codeStore.getValue().data, 'SO_TYPE');
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
            soNo: [''],
            range: [{
                start: moment().utc(true).add(-7, 'day').endOf('day').toISOString(),
                end: moment().utc(true).startOf('day').toISOString()
            }],
            start: [],
            end: []
        });
        if (this._activatedRoute.snapshot.paramMap['params'] !== (null || undefined)
            && Object.keys(this._activatedRoute.snapshot.paramMap['params']).length > 0) {
            this.searchForm = this._formBuilder.group({
                status: ['ALL'],
                type: ['ALL'],
                account: [''],
                accountNm: [''],
                soNo: [''],
                range: [{
                    start: moment().utc(true).add(-1, 'month').endOf('day').toISOString(),
                    end: moment().utc(true).startOf('day').toISOString()
                }],
                start: [],
                end: []
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
        this.salesorderHeaderColumns = [
            {
                name: 'soNo', fieldName: 'soNo', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'soCreDate', fieldName: 'soCreDate', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '?????? ????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'soDate', fieldName: 'soDate', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '?????? ??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'obNo', fieldName: 'obNo', type: 'data', width: '150', styleName: 'center-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true,
                    type: 'button'
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
                name: 'address', fieldName: 'address', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '????????? ??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'dlvAccountNm', fieldName: 'dlvAccountNm', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '????????? ???', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'dlvAddress', fieldName: 'dlvAddress', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'dlvDate', fieldName: 'dlvDate', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '?????? ??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'soAmt', fieldName: 'soAmt', type: 'number', width: '100', styleName: 'right-cell-text'
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
        this.salesorderHeaderDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //????????? ??????
        const gridListOption = {
            stateBar: false,
            checkBar: true,
            footers: false,
        };

        //????????? ??????
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.salesorderHeaderDataProvider,
            'salesorderHeaderGrid',
            this.salesorderHeaderColumns,
            this.salesorderHeaderFields,
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
                    if(this._realGridsService.gfn_GridDataCnt(this.gridList, this.salesorderHeaderDataProvider)){
                        this.searchSetValue();
                        // eslint-disable-next-line max-len
                        const rtn = this._salesorderService.getHeader(this.salesorderHeaderPagenation.page, this.salesorderHeaderPagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
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
        this.gridList.onCellItemClicked = (grid, index, clickData) => {

            //console.log(clickData.value);
            const searchParam = {
                obNo: clickData.value
            };
            const rtn = this._outBoundService.getHeader(0, 1, 'obNo', 'desc', searchParam);
            rtn.then((ex) => {
                //console.log(ex);
                if(ex.outBoundHeader.length > 0){
                    this._router.navigate(['bound/outbound/outbound-detail', ex.outBoundHeader[0]]);
                }else{
                    this._functionService.cfn_alert('?????? ????????? ???????????? ????????????.');
                }
            });
        };

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellDblClicked = (grid, clickData) => {
            if (clickData.cellType !== 'header') {
                if (clickData.cellType !== 'head') {
                    if(grid.getValues(clickData.dataRow) !== null){
                        this._router.navigate(['salesorder/salesorder/salesorder-detail', grid.getValues(clickData.dataRow)]);
                    }
                }
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
        // this._salesorderService.salesorderHeaderPagenation$
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((salesorderHeaderPagenation: SalesOrderHeaderPagenation) => {
        //         // Update the pagination
        //         this.salesorderHeaderPagenation = salesorderHeaderPagenation;
        //         // Mark for check
        //         this._changeDetectorRef.markForCheck();
        //     });
    }

    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._salesorderService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'soNo', this.orderBy, this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.salesorderHeaderDataProvider);
    }

    searchSetValue(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.salesorderHeaderDataProvider, true);
        this.searchForm.patchValue({'start': this.searchForm.get('range').value.start});
        this.searchForm.patchValue({'end': this.searchForm.get('range').value.end});
    }

    setGridData(): void {

        this.salesorderHeaders$ = this._salesorderService.salesorderHeaders$;
        this._salesorderService.salesorderHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((salesorderHeaders: any) => {
                // Update the counts
                if (salesorderHeaders !== null) {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.salesorderHeaderDataProvider, salesorderHeaders);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    selectHeader(): void {
        this.isSearchForm = true;
        this.searchSetValue();
        const rtn = this._salesorderService.getHeader(0, 40, 'soNo', 'desc', this.searchForm.getRawValue());
        //this.setGridData();
        this.selectCallBack(rtn);
    }

    salesorderNew(): void {
        this._router.navigate(['salesorder/salesorder/salesorder-new', {}]);
    }

    //??????
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    salesorderConfirm() {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.salesorderHeaderDataProvider);
        if (checkValues.length < 1) {
            this._functionService.cfn_alert('?????? ????????? ??????????????????.');
            return;
        } else {
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < checkValues.length; i++) {
                if (checkValues[i].status === 'S' || checkValues[i].status === 'C') {
                    this._functionService.cfn_alert('?????? ??????????????? ????????? ??? ????????????. <br> ???????????? : ' + checkValues[i].soNo);
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
                            this.salesorderConfirmCall(checkValues);
                        } else {
                            this.selectHeader();
                        }
                    });
            }
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    salesorderConfirmCall(sendData: SalesOrder[]) {
        if (sendData) {
            this._salesorderService.salesorderConfirm(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((salesOrder: any) => {
                    this._functionService.cfn_loadingBarClear();
                    this._functionService.cfn_alertCheckMessage(salesOrder);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    this.selectHeader();
                });
        }
    }

    // ??????
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    salesorderCancel() {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.salesorderHeaderDataProvider);
        if (checkValues.length < 1) {
            this._functionService.cfn_alert('?????? ????????? ??????????????????.');
            return;
        } else {
            const check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            // for (let i = 0; i < checkValues.length; i++) {
            //     if (checkValues[i].status !== 'N') {
            //         this._functionService.cfn_alert('?????? ??????????????? ????????? ??? ????????????. <br> ???????????? : ' + checkValues[i].soNo);
            //         check = false;
            //         return false;
            //     }
            // }
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
                            this.salesorderCancelCall(checkValues);
                        } else {
                            this.selectHeader();
                        }
                    });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    salesorderCancelCall(sendData: SalesOrder[]) {
        if (sendData) {
            this._salesorderService.salesorderCancel(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((salesOrder: any) => {
                    this._functionService.cfn_loadingBarClear();
                    this._functionService.cfn_alertCheckMessage(salesOrder);
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
        const rtn = this._salesorderService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'soNo', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.selectHeader();
        }
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.salesorderHeaderDataProvider, ex.salesorderHeader);
            this._salesorderService.salesorderHeaderPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((salesorderHeaderPagenation: SalesOrderHeaderPagenation) => {
                    // Update the pagination
                    this.salesorderHeaderPagenation = salesorderHeaderPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if(ex.salesorderHeader.length < 1){
                this._functionService.cfn_alert('????????? ????????? ????????????.');
            }
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.salesorderHeaderDataProvider, false);
        });
    }

    searchStatus(val: string): void {
        this.statusProcess = val;
        if(this.statusProcess !== null) {
            this.searchForm.patchValue({'status': this.statusProcess});
        }
    }
}
