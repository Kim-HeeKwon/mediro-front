import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {Manages, ManagesPagenation} from './manages.types';
import {FormBuilder, FormGroup} from '@angular/forms';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {MatDialog} from '@angular/material/dialog';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {ManagesService} from './manages.service';
import {FunctionService} from '../../../../../@teamplat/services/function';
import {TeamPlatConfirmationService} from '../../../../../@teamplat/services/confirmation';
import {DeviceDetectorService} from 'ngx-device-detector';
import {Columns} from '../../../../../@teamplat/services/realgrid/realgrid.types';
import {FuseRealGridService} from '../../../../../@teamplat/services/realgrid';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {ManagesReportComponent} from './manages-report/manages-report.component';
import {ManagesDetailComponent} from './manages-detail/manages-detail.component';
import {ManagesNewComponent} from './manages-new';
import {ManagesEmailComponent} from './manages-email/manages-email.component';
import {CommonLoadingBarComponent} from "../../../../../@teamplat/components/common-loding-bar/common-loading-bar.component";
import {ManagesPackageComponent} from "./manages-package/manages-package.component";

@Component({
    selector: 'dms-manages',
    templateUrl: './manages.component.html',
    styleUrls: ['./manages.component.scss']
})
export class ManagesComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    isLoading: boolean = false;
    isMobile: boolean = false;
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    searchForm: FormGroup;
    emailForm: FormGroup;
    manages$: Observable<Manages[]>;
    managesPagenation: ManagesPagenation = {length: 0, size: 0, page: 0, lastPage: 0, startIndex: 0, endIndex: 0};

    managesColumns: Columns[];
    month: CommonCode[] = null;
    year: CommonCode[] = null;
    suplyTypeCode: CommonCode[] = null;
    suplyFlagCode: CommonCode[] = null;
    isSearchForm: boolean = false;
    orderBy: any = 'desc';
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;

    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    managesDataProvider: RealGrid.LocalDataProvider;
    managesFields: DataFieldObject[] = [
        {fieldName: 'no', dataType: ValueType.TEXT},
        {fieldName: 'mId', dataType: ValueType.TEXT},
        {fieldName: 'suplyContStdmt', dataType: ValueType.TEXT},
        {fieldName: 'suplyFlagCode', dataType: ValueType.TEXT},
        {fieldName: 'suplyTypeCode', dataType: ValueType.TEXT},
        {fieldName: 'suplyContSeq', dataType: ValueType.TEXT},
        {fieldName: 'meddevItemSeq', dataType: ValueType.TEXT},
        {fieldName: 'stdCode', dataType: ValueType.TEXT},
        {fieldName: 'lotNo', dataType: ValueType.TEXT},
        {fieldName: 'manufYm', dataType: ValueType.TEXT},
        {fieldName: 'useTmlmt', dataType: ValueType.TEXT},
        {fieldName: 'bcncCode', dataType: ValueType.TEXT},
        {fieldName: 'bcncEntpName', dataType: ValueType.TEXT},
        {fieldName: 'dvyfgEntpName', dataType: ValueType.TEXT},
        {fieldName: 'suplyDate', dataType: ValueType.TEXT},
        {fieldName: 'suplyQty', dataType: ValueType.NUMBER},
        {fieldName: 'suplyUntpc', dataType: ValueType.NUMBER},
        {fieldName: 'suplyAmt', dataType: ValueType.NUMBER},
        {fieldName: 'udiDiCode', dataType: ValueType.TEXT},
        {fieldName: 'udiPiCode', dataType: ValueType.TEXT},
        {fieldName: 'entpName', dataType: ValueType.TEXT},
        {fieldName: 'itemName', dataType: ValueType.TEXT},
        {fieldName: 'meaClassNo', dataType: ValueType.TEXT},
        {fieldName: 'permitNo', dataType: ValueType.TEXT},
        {fieldName: 'typeName', dataType: ValueType.TEXT},
        {fieldName: 'itemSeq', dataType: ValueType.TEXT},
        {fieldName: 'remark', dataType: ValueType.TEXT},
        {fieldName: 'bcncCobTypeName', dataType: ValueType.TEXT},
        {fieldName: 'bcncEntpAddr', dataType: ValueType.TEXT},
        {fieldName: 'bcncHptlCode', dataType: ValueType.TEXT},
        {fieldName: 'bcncTaxNo', dataType: ValueType.TEXT},
        {fieldName: 'cobTypeName', dataType: ValueType.TEXT},
        {fieldName: 'dvyfgCobTypeName', dataType: ValueType.TEXT},
        {fieldName: 'dvyfgEntpAddr', dataType: ValueType.TEXT},
        {fieldName: 'dvyfgHptlCode', dataType: ValueType.TEXT},
        {fieldName: 'dvyfgPlaceBcncCode', dataType: ValueType.TEXT},
        {fieldName: 'dvyfgTaxNo', dataType: ValueType.TEXT},
        {fieldName: 'isDiffDvyfg', dataType: ValueType.TEXT},
        {fieldName: 'packQuantity', dataType: ValueType.TEXT},
        {fieldName: 'rtngudFlagCode', dataType: ValueType.TEXT},
        {fieldName: 'seq', dataType: ValueType.TEXT},
        {fieldName: 'totalCnt', dataType: ValueType.TEXT},
        {fieldName: 'udiDiSeq', dataType: ValueType.TEXT},
        {fieldName: 'grade', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _realGridsService: FuseRealGridService,
        private _matDialog: MatDialog,
        private _codeStore: CodeStore,
        private _managesService: ManagesService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _utilService: FuseUtilsService,
        private _functionService: FunctionService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private readonly breakpointObserver: BreakpointObserver,
        private _deviceService: DeviceDetectorService,
    ) {
        this.isMobile = this._deviceService.isMobile();
        this.month = _utilService.commonValue(_codeStore.getValue().data, 'MONTH');
        this.year = _utilService.commonValue(_codeStore.getValue().data, 'YEAR');
        this.suplyTypeCode = _utilService.commonValue(_codeStore.getValue().data, 'SUPLYTYPECODE');
        this.suplyFlagCode = _utilService.commonValue(_codeStore.getValue().data, 'SUPLYFLAGCODE');
    }

    ngOnInit(): void {
        // ?????? Form ??????
        const today = new Date();
        const YYYY = today.getFullYear();
        const mm = today.getMonth() + 1; //January is 0!
        let MM;
        if (mm < 10) {
            MM = String('0' + mm);
        } else {
            MM = String(mm);
        }
        this.searchForm = this._formBuilder.group({
            year: [YYYY + ''],
            month: [MM + ''],
            searchText: [''],
            suplyContStdmt: [''],
            bcncName: [''],
            offset: [1],
            limit: [100],
        });
        this.emailForm = this._formBuilder.group({
            recevicrEmail: ['']
        });

        const valuesSuplyFlagCode = [];
        const lablesSuplyFlagCode = [];
        const valuesSuplyTypeCode = [];
        const lablesSuplyTypeCode = [];


        this.suplyFlagCode.forEach((param: any) => {
            valuesSuplyFlagCode.push(param.id);
            lablesSuplyFlagCode.push(param.name);
        });

        this.suplyTypeCode.forEach((param: any) => {
            valuesSuplyTypeCode.push(param.id);
            lablesSuplyTypeCode.push(param.name);
        });

        //????????? ??????
        this.managesColumns = [
            {
                name: 'suplyFlagCode',
                fieldName: 'suplyFlagCode',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text',
                header: {text: '????????????', styleName: 'center-cell-text'},
                values: valuesSuplyFlagCode,
                labels: lablesSuplyFlagCode,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.suplyFlagCode),
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'suplyTypeCode',
                fieldName: 'suplyTypeCode',
                type: 'data',
                width: '200',
                styleName: 'left-cell-text',
                header: {text: '????????????', styleName: 'center-cell-text'},
                values: valuesSuplyTypeCode,
                labels: lablesSuplyTypeCode,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.suplyTypeCode),
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'bcncEntpName', fieldName: 'bcncEntpName', type: 'data', width: '300', styleName: 'left-cell-text'
                , header: {text: '???????????? ???(????????? ???)', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'suplyDate', fieldName: 'suplyDate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemName',
                fieldName: 'itemName',
                type: 'data',
                width: '150',
                styleName: 'left-cell-text'
                ,
                header: {text: '?????????', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'typeName',
                fieldName: 'typeName',
                type: 'data',
                width: '150',
                styleName: 'left-cell-text'
                ,
                header: {text: '?????????', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'suplyQty', fieldName: 'suplyQty', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
                , numberFormat: '#,##0'
            },
            {
                name: 'suplyUntpc', fieldName: 'suplyUntpc', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
                , numberFormat: '#,##0'
            },
            {
                name: 'suplyAmt', fieldName: 'suplyAmt', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
                , numberFormat: '#,##0'
            },
            {
                name: 'meddevItemSeq',
                fieldName: 'meddevItemSeq',
                type: 'data',
                width: '150',
                styleName: 'left-cell-text'
                ,
                header: {text: '??????????????????', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'stdCode', fieldName: 'stdCode', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'lotNo', fieldName: 'lotNo', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'manufYm', fieldName: 'manufYm', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'useTmlmt', fieldName: 'useTmlmt', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'bcncCode', fieldName: 'bcncCode', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '??????????????? ??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'dvyfgEntpName',
                fieldName: 'dvyfgEntpName',
                type: 'data',
                width: '150',
                styleName: 'left-cell-text'
                ,
                header: {text: '???????????? ??????', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
        ];

        //????????? Provider
        this.managesDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //????????? ??????
        const gridListOption = {
            stateBar: false,
            checkBar: true,
            footers: false,
        };

        //????????? ??????
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.managesDataProvider,
            'managesGrid',
            this.managesColumns,
            this.managesFields,
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

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellDblClicked = (grid, clickData) => {
            if (clickData.cellType !== 'header') {
                if (clickData.cellType !== 'head') {
                    if (grid.getValues(clickData.dataRow) !== null) {
                        this.selectDoubleClickRow(grid.getValues(clickData.dataRow));
                    }
                }
            }
        };

        //????????? ??????
        this._paginator._intl.itemsPerPageLabel = '';
        // this.setGridData();

        this._changeDetectorRef.markForCheck();
        // this._managesService.managesPagenation$
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((managesPagenation: ManagesPagenation) => {
        //         if (managesPagenation !== null) {
        //             this.managesPagenation = managesPagenation;
        //         }
        //         // Mark for check
        //         this._changeDetectorRef.markForCheck();
        //     });
    }


    setGridData(): void {
        this.manages$ = this._managesService.manages$;
        this._managesService.manages$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((manages: any) => {
                if (manages !== null || manages === 'null') {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.managesDataProvider, manages);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    searchSetValue(): void {

        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.managesDataProvider, true);
        const day = this.searchForm.getRawValue().year + this.searchForm.getRawValue().month;
        this.searchForm.patchValue({'suplyContStdmt': day});
    }

    select(): void {
        // this._matDialog.open(CommonLoadingBarComponent, {
        //     id: 'loadingBar'
        // });
        this.searchForm.patchValue({'offset': 1});
        this.searchSetValue();
        const rtn = this._managesService.getHeader(0, 100, '', 'asc', this.searchForm.getRawValue());
        //this.setGridData();
        this.selectCallBack(rtn);
    }

    // selectDelet(): void {
    //     this.searchSetValue();
    //     const rtn = this._managesService.getHeader(0, 100, '', 'asc', this.searchForm.getRawValue());
    //     //this.setGridData();
    //     this.selectCallBackDelete(rtn);
    // }


    /**
     * After view init
     */
    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._managesService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, '', this.orderBy, this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.managesDataProvider);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    suplyReport() {
        const d = this._matDialog.open(ManagesReportComponent, {
            data: {
                headerText: '',
                url: 'https://udiportal.mfds.go.kr/api/v1/company-info/bcnc',
                searchList: ['companyName', 'taxNo', 'cobFlagCode'],
                code: 'UDI_BCNC',
                tail: false,
                mediroUrl: 'bcnc/company-info',
                tailKey: '',
            },
            autoFocus: false,
            maxHeight: '80vh',
            disableClose: true
        });

    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    suplyUpdate() {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.managesDataProvider);
        if (checkValues.length < 1) {
            this._functionService.cfn_alert('?????? ????????? ??????????????????.');
            return;
        } else {
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
                        this._managesService.updateSupplyInfo(checkValues)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((manage: any) => {
                                this._functionService.cfn_loadingBarClear();
                                this._functionService.cfn_alertCheckMessage(manage);
                                this.searchSetValue();
                                const rtn = this._managesService.getHeader(0, 100, '', 'asc', this.searchForm.getRawValue());
                                this.selectCallBack(rtn);
                                // Mark for check
                                this._changeDetectorRef.markForCheck();
                            });
                    }
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    suplyEmail() {
        const getRows = this._realGridsService.gfn_GetRows(this.gridList, this.managesDataProvider);

        if (getRows.length < 1) {
            this._functionService.cfn_alert('???????????? ?????? ????????? ?????? ??????????????????.');
            return;
        } else {
            if (!this.isMobile) {
                const d = this._matDialog.open(ManagesEmailComponent, {
                    autoFocus: false,
                    maxHeight: '90vh',
                    disableClose: true,
                    data: {rows: getRows, searchForm: this.searchForm.getRawValue()},
                });
                d.afterClosed().subscribe(() => {
                    this.select();
                });
            } else {
                const d = this._matDialog.open(ManagesEmailComponent, {
                    autoFocus: false,
                    width: 'calc(100% - 50px)',
                    maxWidth: '100vw',
                    maxHeight: '80vh',
                    disableClose: true,
                    data: {rows: getRows, searchForm: this.searchForm.getRawValue()},
                });
                const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                    if (size.matches) {
                        d.updateSize('calc(100vw - 10px)', '');
                    }
                });
                d.afterClosed().subscribe(() => {
                    this.select();
                    smallDialogSubscription.unsubscribe();
                });
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    suplyDelete() {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.managesDataProvider);
        if (checkValues.length < 1) {
            this._functionService.cfn_alert('?????? ????????? ??????????????????.');
            return;
        } else {
            const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
                title: '',
                message: '?????????????????????????',
                icon: this._formBuilder.group({
                    show: true,
                    name: 'heroicons_outline:exclamation',
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
                        this._managesService.deleteSupplyInfo(checkValues)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((manage: any) => {
                                this._functionService.cfn_loadingBarClear();
                                this._functionService.cfn_alertCheckMessage(manage);
                                // Mark for check
                                this._changeDetectorRef.markForCheck();
                                this.select();
                            });
                    }
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }


    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '???????????? ??????');
    }

    //?????????
    pageEvent($event: PageEvent): void {
        this.searchSetValue();
        this.searchForm.patchValue({'offset' : this._paginator.pageIndex + 1});
        const rtn = this._managesService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'stdCode', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.select();
        }
    }

    suplyCreate(): void {
        const popup = this._matDialog.open(ManagesNewComponent, {
            autoFocus: false,
            maxHeight: '90vh',
            disableClose: true
        });
        popup.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                this.searchSetValue();
                const rtn = this._managesService.getHeader(0, 100, '', 'asc', this.searchForm.getRawValue());
                this.selectCallBack(rtn);
                if (result) {
                }
            });
    }

    suplyPackageCreate(): void {
        if (!this.isMobile) {
            const popup = this._matDialog.open(ManagesPackageComponent, {
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });
            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                });
        } else {
            const d = this._matDialog.open(ManagesPackageComponent, {
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true,
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    d.updateSize('calc(100vw - 10px)', '');
                }
            });
            d.afterClosed().subscribe(() => {
                smallDialogSubscription.unsubscribe();
            });
        }

    }

    selectDoubleClickRow(row: any): void {
        if (!this.isMobile) {
            const d = this._matDialog.open(ManagesDetailComponent, {
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true,
                data: row,
            });
            d.afterClosed().subscribe(() => {
                this.searchSetValue();
                const rtn = this._managesService.getHeader(0, 100, '', 'asc', this.searchForm.getRawValue());
                this.selectCallBack(rtn);
            });
        } else {
            const d = this._matDialog.open(ManagesDetailComponent, {
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true,
                data: row
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    d.updateSize('calc(100vw - 10px)', '');
                }
            });
            d.afterClosed().subscribe(() => {
                smallDialogSubscription.unsubscribe();
            });
        }
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {
            this._realGridsService.gfn_DataSetGrid(this.gridList, this.managesDataProvider, ex.manages);
            this._managesService.managesPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((managesPagenation: ManagesPagenation) => {
                    // Update the pagination
                    this.managesPagenation = managesPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if (ex.manages.length < 1) {
                this._functionService.cfn_alert('????????? ????????? ????????????.');
            }
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.managesDataProvider, false);
        });
    }

    selectCallBackDelete(rtn: any): void {
        rtn.then((ex) => {
            this._realGridsService.gfn_DataSetGrid(this.gridList, this.managesDataProvider, ex.manages);
            this._managesService.managesPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((managesPagenation: ManagesPagenation) => {
                    // Update the pagination
                    this.managesPagenation = managesPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        });
    }
}
