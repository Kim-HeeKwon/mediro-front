import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {Columns} from '../../../../../@teamplat/services/realgrid/realgrid.types';
import {merge, Observable, Subject} from 'rxjs';
import {OutBoundDetail, OutBoundHeader, OutBoundHeaderPagenation} from './outbound.types';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {MatDialog} from '@angular/material/dialog';
import {OutboundService} from './outbound.service';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {FunctionService} from '../../../../../@teamplat/services/function';
import {DeviceDetectorService} from 'ngx-device-detector';
import {TeamPlatConfirmationService} from '../../../../../@teamplat/services/confirmation';
import {BreakpointObserver} from '@angular/cdk/layout';
import * as moment from 'moment';
import {FuseRealGridService} from '../../../../../@teamplat/services/realgrid';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {OutBound} from './outbound.types';
import {InBound} from "../inbound/inbound.types";

@Component({
    selector: 'dms-outbound',
    templateUrl: './outbound.component.html',
    styleUrls: ['./outbound.component.scss'],
})

export class OutboundComponent implements OnInit, OnDestroy, AfterViewInit {
    isLoading: boolean = false;
    isMobile: boolean = false;
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    searchForm: FormGroup;
    status: CommonCode[] = null;
    type: CommonCode[] = null;
    outBoundHeaderColumns: Columns[];
    outBoundHeaders$: Observable<OutBoundHeader[]>;
    outBoundDetails$ = new Observable<OutBoundDetail[]>();
    isSearchForm: boolean = false;
    orderBy: any = 'desc';
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    outBoundHeaderPagenation: OutBoundHeaderPagenation | null = null;

    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    outBoundHeaderDataProvider: RealGrid.LocalDataProvider;
    outBoundHeaderFields: DataFieldObject[] = [
        {fieldName: 'no', dataType: ValueType.TEXT},
        {fieldName: 'mId', dataType: ValueType.TEXT},
        {fieldName: 'obNo', dataType: ValueType.TEXT},
        {fieldName: 'obCreDate', dataType: ValueType.TEXT},
        {fieldName: 'obDate', dataType: ValueType.TEXT},
        {fieldName: 'type', dataType: ValueType.TEXT},
        {fieldName: 'status', dataType: ValueType.TEXT},
        {fieldName: 'account', dataType: ValueType.TEXT},
        {fieldName: 'accountNm', dataType: ValueType.TEXT},
        {fieldName: 'address', dataType: ValueType.TEXT},
        {fieldName: 'dlvAccount', dataType: ValueType.TEXT},
        {fieldName: 'dlvAccountNm', dataType: ValueType.TEXT},
        {fieldName: 'dlvAddress', dataType: ValueType.TEXT},
        {fieldName: 'dlvDate', dataType: ValueType.TEXT},
        {fieldName: 'remarkHeader', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _realGridsService: FuseRealGridService,
        private _matDialog: MatDialog,
        public _matDialogPopup: MatDialog,
        private _formBuilder: FormBuilder,
        private _outBoundService: OutboundService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _codeStore: CodeStore,
        private _activatedRoute: ActivatedRoute,
        private _functionService: FunctionService,
        private _router: Router,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private readonly breakpointObserver: BreakpointObserver) {
        this.type = _utilService.commonValue(_codeStore.getValue().data, 'OB_TYPE');
        this.status = _utilService.commonValue(_codeStore.getValue().data, 'OB_STATUS');
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            status: [['ALL']],
            type: ['ALL'],
            account: [''],
            accountNm: [''],
            obNo: [''],
            range: [{
                start: moment().utc(false).add(-7, 'day').endOf('day').toISOString(),
                end: moment().utc(false).startOf('day').toISOString()
            }],
            start: [],
            end: []
        });
        if (this._activatedRoute.snapshot.paramMap['params'] !== (null || undefined)
            && Object.keys(this._activatedRoute.snapshot.paramMap['params']).length > 0) {
            this.searchForm = this._formBuilder.group({
                status: [['ALL']],
                type: ['ALL'],
                account: [''],
                accountNm: [''],
                obNo: [''],
                range: [{
                    start: moment().utc(false).add(-1, 'month').endOf('day').toISOString(),
                    end: moment().utc(false).startOf('day').toISOString()
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
        this.outBoundHeaderColumns = [
            {
                name: 'obNo', fieldName: 'obNo', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '출고번호', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'obCreDate', fieldName: 'obCreDate', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '출고 생성일자', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'obDate', fieldName: 'obDate', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '출고 일자', styleName: 'center-cell-text'}, renderer: {
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
                name: 'accountNm', fieldName: 'accountNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '거래처 명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'address', fieldName: 'address', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '거래처 주소', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'dlvAccountNm', fieldName: 'dlvAccountNm', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '납품처 명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'dlvAddress', fieldName: 'dlvAddress', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '납품주소', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'dlvDate', fieldName: 'dlvDate', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '납품 일자', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'remarkHeader', fieldName: 'remarkHeader', type: 'data', width: '300', styleName: 'left-cell-text'
                , header: {text: '비고', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
        ];
        //그리드 Provider
        this.outBoundHeaderDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const gridListOption = {
            stateBar: false,
            checkBar: true,
            footers: false,
        };

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.outBoundHeaderDataProvider,
            'outBoundHeaderGrid',
            this.outBoundHeaderColumns,
            this.outBoundHeaderFields,
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
                    this.searchSetValue();
                    // eslint-disable-next-line max-len
                    const rtn = this._outBoundService.getHeader(this.outBoundHeaderPagenation.page, this.outBoundHeaderPagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
                    this.selectCallBack(rtn);
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
                    console.log(grid.getValues(clickData.dataRow));
                    this._router.navigate(['bound/outbound/outbound-detail', grid.getValues(clickData.dataRow)]);
                }
            }
        };
        //페이지 라벨
        this._paginator._intl.itemsPerPageLabel = '';

        this.selectHeader();
        this._changeDetectorRef.markForCheck();
        // this.setGridData();
        //
        // // Get the pagenation
        // this._outBoundService.outBoundHeaderPagenation$
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((outBoundHeaderPagenation: OutBoundHeaderPagenation) => {
        //         // Update the pagination
        //         this.outBoundHeaderPagenation = outBoundHeaderPagenation;
        //         // Mark for check
        //         this._changeDetectorRef.markForCheck();
        //     });
    }

    setGridData(): void {

        this.outBoundHeaders$ = this._outBoundService.outBoundHeaders$;
        this._outBoundService.outBoundHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBoundHeaders: any) => {
                // Update the counts
                if (outBoundHeaders !== null) {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.outBoundHeaderDataProvider, outBoundHeaders);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._outBoundService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'obNo', this.orderBy, this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.outBoundHeaderDataProvider);
    }

    searchSetValue(): void {
        this.searchForm.patchValue({'start': this.searchForm.get('range').value.start});
        this.searchForm.patchValue({'end': this.searchForm.get('range').value.end});
    }

    selectHeader(): void {
        this.isSearchForm = true;
        this.searchSetValue();
        const rtn = this._outBoundService.getHeader(0, 20, 'obNo', 'desc', this.searchForm.getRawValue());
        //this.setGridData();
        this.selectCallBack(rtn);
    }

    outBoundNew(): void {
        this._router.navigate(['bound/outbound/outbound-new', {}]);
    }

    outBoundCancel(): boolean {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.outBoundHeaderDataProvider);
        if (checkValues.length < 1) {
            this._functionService.cfn_alert('취소 대상을 선택해주세요.');
            return;
        } else {
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < checkValues.length; i++) {
                if (checkValues[i].status !== 'N') {
                    this._functionService.cfn_alert('취소할 수 없는 상태입니다. 출고번호 : ' + checkValues[i].obNo);
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
                            this.outBoundCancelCall(checkValues);
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
    outBoundCancelCall(sendData: OutBound[]): void {
        if (sendData) {
            this._outBoundService.outBoundCancel(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((outBound: any) => {
                    this._functionService.cfn_loadingBarClear();
                    this._functionService.cfn_alertCheckMessage(outBound);
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
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '출고 목록');
    }

    //페이징
    pageEvent($event: PageEvent): void {

        this.searchSetValue();
        const rtn = this._outBoundService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'obNo', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.selectHeader();
        }
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.outBoundHeaderDataProvider, ex.outBoundHeader);
            this._outBoundService.outBoundHeaderPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((outBoundHeaderPagenation: OutBoundHeaderPagenation) => {
                    // Update the pagination
                    this.outBoundHeaderPagenation = outBoundHeaderPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if(ex.outBoundHeader.length < 1){
                this._functionService.cfn_alert('검색된 정보가 없습니다.');
            }
        });
    }

    outBoundClose(): boolean {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.outBoundHeaderDataProvider);
        if (checkValues.length < 1) {
            this._functionService.cfn_alert('확정 대상을 선택해주세요.');
            return;
        } else {
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < checkValues.length; i++) {
                if (checkValues[i].status === 'N' || checkValues[i].status === 'C') {
                    this._functionService.cfn_alert('확정할 수 없는 상태입니다. 출고번호 : ' + checkValues[i].obNo);
                    check = false;
                    return false;
                }

                if (checkValues[i].status === 'PC' || checkValues[i].status === 'SC') {
                    this._functionService.cfn_alert('이미 확정되었습니다. 출고번호 : ' + checkValues[i].obNo);
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
                            this.outBoundCloseCall(checkValues);
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
    outBoundCloseCall(sendData: OutBound[]): void {
        if (sendData) {
            this._outBoundService.outBoundClose(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((outBound: any) => {
                    this._functionService.cfn_loadingBarClear();
                    this._functionService.cfn_alertCheckMessage(outBound);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    this.selectHeader();
                });
        }
    }
}
