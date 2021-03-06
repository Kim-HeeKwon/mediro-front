import {
    AfterViewInit, ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {Columns} from '../../../../../@teamplat/services/realgrid/realgrid.types';
import {merge, Observable, Subject} from 'rxjs';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {InBoundDetail, InBoundHeader, InBoundHeaderPagenation} from './inbound.types';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {FuseRealGridService} from '../../../../../@teamplat/services/realgrid';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {FunctionService} from '../../../../../@teamplat/services/function';
import {TeamPlatConfirmationService} from '../../../../../@teamplat/services/confirmation';
import {ShortcutsService} from '../../../../layout/common/shortcuts/shortcuts.service';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {DeviceDetectorService} from 'ngx-device-detector';
import {InboundService} from './inbound.service';
import * as moment from 'moment';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {InBound} from './inbound.types';

@Component({
    selector: 'dms-inbound',
    templateUrl: './inbound.component.html',
    styleUrls: ['./inbound.component.scss'],
})
export class InboundComponent implements OnInit, OnDestroy, AfterViewInit {
    statusProcess: string[];
    isLoading: boolean = false;
    isMobile: boolean = false;
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    searchForm: FormGroup;
    status: CommonCode[] = null;
    type: CommonCode[] = null;
    inBoundHeaderColumns: Columns[];
    inBoundHeaders$: Observable<InBoundHeader[]>;
    inBoundDetails$ = new Observable<InBoundDetail[]>();
    isSearchForm: boolean = false;
    orderBy: any = 'desc';
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    inBoundHeaderPagenation: InBoundHeaderPagenation | null = null;

    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    inBoundHeaderDataProvider: RealGrid.LocalDataProvider;
    inBoundHeaderFields: DataFieldObject[] = [
        {fieldName: 'no', dataType: ValueType.TEXT},
        {fieldName: 'mId', dataType: ValueType.TEXT},
        {fieldName: 'ibNo', dataType: ValueType.TEXT},
        {fieldName: 'ibCreDate', dataType: ValueType.TEXT},
        {fieldName: 'ibDate', dataType: ValueType.TEXT},
        {fieldName: 'type', dataType: ValueType.TEXT},
        {fieldName: 'status', dataType: ValueType.TEXT},
        {fieldName: 'account', dataType: ValueType.TEXT},
        {fieldName: 'accountNm', dataType: ValueType.TEXT},
        {fieldName: 'supplier', dataType: ValueType.TEXT},
        {fieldName: 'supplierNm', dataType: ValueType.TEXT},
        {fieldName: 'ibAmt', dataType: ValueType.NUMBER},
        {fieldName: 'poNo', dataType: ValueType.TEXT},
        {fieldName: 'remarkHeader', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _realGridsService: FuseRealGridService,
        private _activatedRoute: ActivatedRoute,
        public _matDialogPopup: MatDialog,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _inBoundService: InboundService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _functionService: FunctionService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _shortcutService: ShortcutsService,
        private _codeStore: CodeStore,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
    ) {
        this.status = _utilService.commonValue(_codeStore.getValue().data, 'IB_STATUS');
        this.type = _utilService.commonValue(_codeStore.getValue().data, 'IB_TYPE');
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnInit(): void {
        let dashboard = false;
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            status: [['ALL']],
            type: ['ALL'],
            account: [''],
            accountNm: [''],
            ibNo: [''],
            range: [{
                start: moment().utc(true).add(-7, 'day').endOf('day').toISOString(),
                end: moment().utc(true).startOf('day').toISOString()
            }],
            start: [],
            end: []
        });
        //2022-05-17T00:00:00.000Z
        if (this._activatedRoute.snapshot.paramMap['params'] !== (null || undefined)
            && Object.keys(this._activatedRoute.snapshot.paramMap['params']).length > 0) {
            this.searchForm = this._formBuilder.group({
                status: [['ALL']],
                type: ['ALL'],
                account: [''],
                accountNm: [''],
                ibNo: [''],
                range: [{
                    start: moment().utc(true).add(-1, 'month').endOf('day').toISOString(),
                    end: moment().utc(true).startOf('day').toISOString()
                }],
                start: [],
                end: []
            });
            if(this._activatedRoute.snapshot.paramMap['params'].status !== (null || undefined)){
                const arr = this._activatedRoute.snapshot.paramMap['params'].status.split(',');
                this.searchForm.patchValue(this._activatedRoute.snapshot.paramMap['params']);
                this.searchForm.patchValue({'status': arr});
            }else{
                this.searchForm.patchValue(this._activatedRoute.snapshot.paramMap['params']);
            }
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

        //그리드 컬럼
        this.inBoundHeaderColumns = [
            {
                name: 'ibNo', fieldName: 'ibNo', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '입고번호', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'ibCreDate', fieldName: 'ibCreDate', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '입고 생성일자', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'ibDate', fieldName: 'ibDate', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '입고 일자', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'type', fieldName: 'type', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '유형', styleName: 'center-cell-text'},
                values: valuesType,
                labels: lablesType,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.type), renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'status', fieldName: 'status', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '상태', styleName: 'center-cell-text'},
                values: valuesStatus,
                labels: lablesStatus,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.status), renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'account', fieldName: 'account', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '공급처 코드', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'accountNm', fieldName: 'accountNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '공급처 명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'ibAmt', fieldName: 'ibAmt', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '금액', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
                , numberFormat: '#,##0'
            },
            {
                name: 'poNo', fieldName: 'poNo', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '발주번호', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'remarkHeader', fieldName: 'remarkHeader', type: 'data', width: '400', styleName: 'left-cell-text'
                , header: {text: '비고', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
        ];
        //그리드 Provider
        this.inBoundHeaderDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const gridListOption = {
            stateBar: false,
            checkBar: true,
            footers: false,
        };

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.inBoundHeaderDataProvider,
            'inBoundHeaderGrid',
            this.inBoundHeaderColumns,
            this.inBoundHeaderFields,
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
        this.gridList.setCopyOptions({
            enabled: true,
            singleMode: false
        });

        //정렬
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                if (clickData.cellType !== 'head') {
                    if(this._realGridsService.gfn_GridDataCnt(this.gridList, this.inBoundHeaderDataProvider)){
                        this.searchSetValue();
                        // eslint-disable-next-line max-len
                        const rtn = this._inBoundService.getHeader(this.inBoundHeaderPagenation.page, this.inBoundHeaderPagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
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
                        this._router.navigate(['bound/inbound/inbound-detail', grid.getValues(clickData.dataRow)]);
                    }
                }
            }
        };
        //페이지 라벨
        this._paginator._intl.itemsPerPageLabel = '';

        if(dashboard){
            this.selectHeader();
        }
        this._changeDetectorRef.markForCheck();
        // this.setGridData();
        //
        // // Get the pagenation
        // this._inBoundService.inBoundHeaderPagenation$
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((inBoundHeaderPagenation: InBoundHeaderPagenation) => {
        //         // Update the pagination
        //         this.inBoundHeaderPagenation = inBoundHeaderPagenation;
        //         // Mark for check
        //         this._changeDetectorRef.markForCheck();
        //     });
    }

    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._inBoundService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'ibNo', this.orderBy, this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.inBoundHeaderDataProvider);
    }

    searchSetValue(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.inBoundHeaderDataProvider, true);
        this.searchForm.patchValue({'start': this.searchForm.get('range').value.start});
        this.searchForm.patchValue({'end': this.searchForm.get('range').value.end});
    }

    setGridData(): void {

        this.inBoundHeaders$ = this._inBoundService.inBoundHeaders$;
        this._inBoundService.inBoundHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBoundHeaders: any) => {
                // Update the counts
                if (inBoundHeaders !== null) {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.inBoundHeaderDataProvider, inBoundHeaders);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    selectHeader(): void {
        this.isSearchForm = true;
        this.searchSetValue();
        const rtn = this._inBoundService.getHeader(0, 40, 'ibNo', 'desc', this.searchForm.getRawValue());
        //this.setGridData();
        this.selectCallBack(rtn);
    }

    inBoundNew(): void {
        this._router.navigate(['bound/inbound/inbound-new', {}]);
    }

    inBoundBack(): boolean {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.inBoundHeaderDataProvider);
        if (checkValues.length < 1) {
            this._functionService.cfn_alert('취소 대상을 선택해주세요.');
            return;
        } else {

            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < checkValues.length; i++) {
                if (checkValues[i].status === 'PC' || checkValues[i].status === 'SC' ||
                    checkValues[i].status === 'N' || checkValues[i].status === 'C'  || checkValues[i].status === '') {
                    this._functionService.cfn_alert('작업 상태에서만 취소할 수 있습니다. <br> 입고번호 : ' + checkValues[i].ibNo);
                    check = false;
                    return false;
                }
            }

            if (check) {
                const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
                    title: '',
                    message: '취소하시겠습니까?',
                    icon: this._formBuilder.group({
                        show: true,
                        name: 'heroicons_outline:exclamation',
                        color: 'warn'
                    }),
                    actions: this._formBuilder.group({
                        confirm: this._formBuilder.group({
                            show: true,
                            label: '취소',
                            color: 'warn'
                        }),
                        cancel: this._formBuilder.group({
                            show: true,
                            label: '닫기'
                        })
                    }),
                    dismissible: true
                }).value);

                confirmation.afterClosed()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result) => {
                        if (result) {
                            if (checkValues) {
                                this._inBoundService.inBoundBack(checkValues)
                                    .pipe(takeUntil(this._unsubscribeAll))
                                    .subscribe((inBound: any) => {

                                        this._functionService.cfn_loadingBarClear();
                                        this._functionService.cfn_alertCheckMessage(inBound);
                                        // Mark for check
                                        this._changeDetectorRef.markForCheck();
                                        this.selectHeader();
                                    });
                            }

                        } else {
                            this.selectHeader();
                        }
                    });
            }

            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    inBoundCancel(): boolean {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.inBoundHeaderDataProvider);
        if (checkValues.length < 1) {
            this._functionService.cfn_alert('삭제 대상을 선택해주세요.');
            return;
        } else {
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < checkValues.length; i++) {
                if (checkValues[i].status !== 'N') {
                    this._functionService.cfn_alert('예정 상태에서만 삭제할 수 있습니다. <br> 입고번호 : ' + checkValues[i].ibNo);
                    check = false;
                    return false;
                }
            }

            if (check) {

                const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
                    title: '',
                    message: '삭제하시겠습니까?',
                    icon: this._formBuilder.group({
                        show: true,
                        name: 'delete',
                        color: 'warn'
                    }),
                    actions: this._formBuilder.group({
                        confirm: this._formBuilder.group({
                            show: true,
                            label: '삭제',
                            color: 'warn'
                        }),
                        cancel: this._formBuilder.group({
                            show: true,
                            label: '닫기'
                        })
                    }),
                    dismissible: true
                }).value);

                confirmation.afterClosed()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result) => {
                        if (result) {
                            this.inBoundCancelCall(checkValues);
                        } else {
                            this.selectHeader();
                        }
                    });
            }

            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    /* 취소
     *
     * @param sendData
     */
    inBoundCancelCall(sendData: InBound[]): void {
        if (sendData) {
            this._inBoundService.inBoundCancel(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((inBound: any) => {

                    this._functionService.cfn_loadingBarClear();
                    this._functionService.cfn_alertCheckMessage(inBound);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    this.selectHeader();
                });
        }
    }

    inBoundClose(): boolean {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.inBoundHeaderDataProvider);
        if (checkValues.length < 1) {
            this._functionService.cfn_alert('확정 대상을 선택해주세요.');
            return;
        } else {
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < checkValues.length; i++) {
                if (checkValues[i].status === 'N' || checkValues[i].status === 'C') {
                    this._functionService.cfn_alert('입고 작업 중 또는 입고 작업 완료 상태에서만 확정할 수 있습니다. <br> 입고번호 : ' + checkValues[i].ibNo);
                    check = false;
                    return false;
                }

                if (checkValues[i].status === 'PC' || checkValues[i].status === 'SC') {
                    this._functionService.cfn_alert('이미 확정되었습니다. <br> 입고번호 : ' + checkValues[i].ibNo);
                    check = false;
                    return false;
                }
            }

            if (check) {
                const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
                    title: '',
                    message: '확정하시겠습니까?',
                    actions: {
                        confirm: {
                            label: '확인'
                        },
                        cancel: {
                            label: '닫기'
                        }
                    }
                }).value);

                confirmation.afterClosed()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result) => {
                        if (result) {
                            this.inBoundCloseCall(checkValues);
                        } else {
                            this.selectHeader();
                        }
                    });
            }
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    /* 확정
     *
     * @param sendData
     */
    inBoundCloseCall(sendData: InBound[]): void {
        if (sendData) {
            this._inBoundService.inBoundClose(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((inBound: any) => {
                    this._functionService.cfn_loadingBarClear();
                    this._functionService.cfn_alertCheckMessage(inBound);
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
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '입고 목록');
    }

    //페이징
    pageEvent($event: PageEvent): void {

        this.searchSetValue();
        const rtn = this._inBoundService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'ibNo', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.selectHeader();
        }
    }
    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.inBoundHeaderDataProvider, ex.inBoundHeader);
            this._inBoundService.inBoundHeaderPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((inBoundHeaderPagenation: InBoundHeaderPagenation) => {
                    // Update the pagination
                    this.inBoundHeaderPagenation = inBoundHeaderPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if(ex.inBoundHeader.length < 1){
                this._functionService.cfn_alert('검색된 정보가 없습니다.');
            }
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.inBoundHeaderDataProvider, false);
        });
    }

    searchStatus(val: any): void {
        this.statusProcess = val;
        if(this.statusProcess !== null) {
            this.searchForm.patchValue({'status': [this.statusProcess]});
        }
    }
}
