import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CommonCode, FuseUtilsService} from "../../../../../@teamplat/services/utils";
import {Columns} from "../../../../../@teamplat/services/realgrid/realgrid.types";
import {merge, Observable, Subject} from "rxjs";
import {
    Estimate,
    EstimateDetail,
    EstimateHeader,
    EstimateHeaderPagenation
} from "./estimate.types";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {FuseRealGridService} from "../../../../../@teamplat/services/realgrid";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {EstimateService} from "./estimate.service";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {TeamPlatConfirmationService} from "../../../../../@teamplat/services/confirmation";
import {ShortcutsService} from "../../../../layout/common/shortcuts/shortcuts.service";
import {CodeStore} from "../../../../core/common-code/state/code.store";
import {DeviceDetectorService} from "ngx-device-detector";
import {map, switchMap, takeUntil} from "rxjs/operators";
import * as moment from "moment";

@Component({
    selector: 'dms-estimate',
    templateUrl: './estimate.component.html',
    styleUrls: ['./estimate.component.scss']
})

export class EstimateComponent implements OnInit, OnDestroy, AfterViewInit{
    isLoading: boolean = false;
    isMobile: boolean = false;
    isProgressSpinner: boolean = false;
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
    @ViewChild(MatPaginator, { static: true }) _paginator: MatPaginator;
    estimateHeaderPagenation: EstimateHeaderPagenation | null = null;
    searchCondition: CommonCode[] = [
        {
            id: '100',
            name: '거래처 명'
        }];
    searchCondition2: CommonCode[] = [
        {
            id: 'qtNo',
            name: '견적 번호'
        }];
    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    estimateHeaderDataProvider: RealGrid.LocalDataProvider;
    estimateHeaderFields: DataFieldObject[] = [
        {fieldName: 'no', dataType: ValueType.TEXT},
        {fieldName: 'mId', dataType: ValueType.TEXT},
        {fieldName: 'qtNo', dataType: ValueType.TEXT},
        {fieldName: 'qtCreDate', dataType: ValueType.TEXT},
        {fieldName: 'qtDate', dataType: ValueType.TEXT},
        {fieldName: 'type', dataType: ValueType.TEXT},
        {fieldName: 'status', dataType: ValueType.TEXT},
        {fieldName: 'account', dataType: ValueType.TEXT},
        {fieldName: 'accountNm', dataType: ValueType.TEXT},
        {fieldName: 'poCreate', dataType: ValueType.TEXT},
        {fieldName: 'soCreate', dataType: ValueType.TEXT},
        {fieldName: 'email', dataType: ValueType.TEXT},
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
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            status: ['ALL'],
            type: ['ALL'],
            account: [''],
            accountNm: [''],
            qtNo: [''],
            searchCondition: ['100'],
            searchCondition2: ['qtNo'],
            searchText: [''],
            searchText2: [''],
            range: [{
                start: moment().utc(false).add(-7, 'day').endOf('day').toISOString(),
                end: moment().utc(false).startOf('day').toISOString()
            }],
            start: [],
            end: [],

        });

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
        this.estimateHeaderColumns = [
            {name: 'qtNo', fieldName: 'qtNo', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '견적번호', styleName: 'left-cell-text'}},
            {name: 'qtCreDate', fieldName: 'qtCreDate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '견적 생성일자' , styleName: 'left-cell-text'}
            },
            {name: 'qtDate', fieldName: 'qtDate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '견적 일자' , styleName: 'left-cell-text'}
            },
            {name: 'type', fieldName: 'type', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '유형', styleName: 'left-cell-text'},
                values: valuesType,
                labels: lablesType,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.type),
            },
            {name: 'status', fieldName: 'status', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '상태', styleName: 'left-cell-text'},
                values: valuesStatus,
                labels: lablesStatus,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.status),
            },
            {name: 'account', fieldName: 'account', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '거래처' , styleName: 'left-cell-text'}},
            {name: 'accountNm', fieldName: 'accountNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '거래처 명' , styleName: 'left-cell-text'}},
            {name: 'qtAmt', fieldName: 'qtAmt', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '견적 금액' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'
            },
            {name: 'poCreate', fieldName: 'poCreate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '발주서' , styleName: 'center-cell-text'}
                , renderer: {
                    type:'html',
                    template: '<button class="mediro-cell-button">' +
                        '<span>발주서</span>' +
                        '</button>',
                }},
            {name: 'soCreate', fieldName: 'soCreate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '주문서' , styleName: 'center-cell-text'}
                , renderer: {
                    type:'html',
                    template: '<button class="mediro-cell-button">' +
                        '<span>주문서</span>' +
                        '</button>',
                }},
            {name: 'remarkHeader', fieldName: 'remarkHeader', type: 'data', width: '300', styleName: 'left-cell-text'
                , header: {text: '비고' , styleName: 'left-cell-text'}
            },
        ];
        //그리드 Provider
        this.estimateHeaderDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const gridListOption = {
            stateBar : false,
            checkBar : true,
            footers : false,
        };

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.estimateHeaderDataProvider,
            'estimateHeaderGrid',
            this.estimateHeaderColumns,
            this.estimateHeaderFields,
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
            //hideDeletedRows: false,
        });
        this.gridList.deleteSelection(true);
        this.gridList.setDisplayOptions({liveScroll: false,});
        this.gridList.setPasteOptions({enabled: false,});
        this.gridList.setCopyOptions({
            enabled: true,
            singleMode: false});
        //this._realGridsService.gfn_EditGrid(this.gridList);

        //정렬
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if(clickData.cellType === 'header'){
                if(clickData.cellType !== 'head'){
                    this.searchSetValue();
                    // eslint-disable-next-line max-len
                    this._estimateService.getHeader(this.estimateHeaderPagenation.page,this.estimateHeaderPagenation.size,clickData.column,this.orderBy,this.searchForm.getRawValue());
                }
            }
            if(this.orderBy === 'asc'){
                this.orderBy = 'desc';
            }else{
                this.orderBy = 'asc';
            }
        };
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellDblClicked = (grid, clickData) => {
            if(clickData.cellType !== 'header'){
                if(clickData.cellType !== 'head'){
                    this._router.navigate(['estimate-order/estimate/estimate-detail', grid.getValues(clickData.dataRow)]);
                }
            }
        };

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        // this.estimateHeaderDataProvider.onRowStateChanged = (provider, row) => {
        //     console.log(row);
        //     console.log(this.estimateHeaderDataProvider.getRowState(row) === 'deleted');
        // };

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellItemClicked = (grid, index, clickData) => {

            if(clickData.target.innerText === '발주서'){
                this.order(grid.getValues(index.dataRow));
            }else if(clickData.target.innerText === '주문서'){
                this.salesorder(grid.getValues(index.dataRow));
            }
        };
        //페이지 라벨
        this._paginator._intl.itemsPerPageLabel = '';

        this.setGridData();

        // Get the pagenation
        this._estimateService.estimateHeaderPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estimateHeaderPagenation: EstimateHeaderPagenation) => {
                // Update the pagination
                this.estimateHeaderPagenation = estimateHeaderPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    searchSetValue(): void{
        if (this.searchForm.getRawValue().searchCondition === '100') {
            this.searchForm.patchValue({'account': ''});
            this.searchForm.patchValue({'accountNm': this.searchForm.getRawValue().searchText});
        }
        if (this.searchForm.getRawValue().searchCondition2 === 'qtNo') {
            this.searchForm.patchValue({'qtNo': this.searchForm.getRawValue().searchText2});
        }
        this.searchForm.patchValue({'start': this.searchForm.get('range').value.start});
        this.searchForm.patchValue({'end': this.searchForm.get('range').value.end});
    }

    selectHeader(): void {

        this.searchSetValue();
        this._estimateService.getHeader(0, 20, 'qtNo', 'desc', this.searchForm.getRawValue());

        this.setGridData();
    }

    estimateNew(): void {
        this._router.navigate(['estimate-order/estimate/estimate-new', {}]);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    estimateSend(){
        //this._realGridsService.gfn_DeleteGrid(this.gridList, this.estimateHeaderDataProvider);

        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.estimateHeaderDataProvider);

        if (checkValues.length < 1) {
            this._functionService.cfn_alert('발송 대상을 선택해주세요.');
            return;
        } else {
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < checkValues.length; i++) {
                if (checkValues[i].status === 'CF' || checkValues[i].status === 'C') {
                    this._functionService.cfn_alert('발송할 수 없는 상태입니다. 견적번호 : ' + checkValues[i].qtNo);
                    check = false;
                    return false;
                }
            }

            if (check) {
                const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
                    title: '',
                    message: '발송하시겠습니까?',
                    icon: this._formBuilder.group({
                        show: true,
                        name: 'heroicons_outline:mail',
                        color: 'primary'
                    }),
                    actions: this._formBuilder.group({
                        confirm: this._formBuilder.group({
                            show: true,
                            label: '발송',
                            color: 'accent'
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
                            this.isProgressSpinner = true;
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
                    this.isProgressSpinner = false;
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
            this._functionService.cfn_alert('확정 대상을 선택해주세요.');
            return;
        } else {
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < checkValues.length; i++) {
                if (checkValues[i].status === 'CF' || checkValues[i].status === 'N' || checkValues[i].status === 'C') {
                    this._functionService.cfn_alert('확정할 수 없는 상태입니다. 견적번호 : ' + checkValues[i].qtNo);
                    check = false;
                    return false;
                }
            }

            if (check) {
                const confirmation = this._teamPlatConfirmationService.open({
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
                });

                confirmation.afterClosed()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result) => {
                        if (result) {
                            this.isProgressSpinner = true;
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
                    this.isProgressSpinner = false;
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
            this._functionService.cfn_alert('취소 대상을 선택해주세요.');
            return;
        } else {
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < checkValues.length; i++) {
                if (checkValues[i].status !== 'N') {
                    this._functionService.cfn_alert('취소할 수 없는 상태입니다. 견적번호 : ' + checkValues[i].qtNo);
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
                            this.isProgressSpinner = true;
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
                    this.isProgressSpinner = false;
                    this._functionService.cfn_alertCheckMessage(estimate);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    this.selectHeader();
                });
        }
    }

    searchFormClick(): void {
        if(this.isSearchForm){
            this.isSearchForm = false;
        }else{
            this.isSearchForm = true;
        }
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '견적 목록');
    }

    //페이징
    pageEvent($event: PageEvent): void {

        this.searchSetValue();
        this._estimateService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'qtNo', this.orderBy, this.searchForm.getRawValue());
    }

    setGridData(): void {

        this.estimateHeaders$ = this._estimateService.estimateHeaders$;
        this._estimateService.estimateHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estimateHeaders: any) => {
                // Update the counts
                if (estimateHeaders !== null) {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.estimateHeaderDataProvider, estimateHeaders);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    order(estimateHeader) {
        const status = estimateHeader.status;

        if (status !== 'CF') {
            this._functionService.cfn_alert('확정만 가능합니다. 다시 조회하세요.');
            return;
        }

        const confirmation = this._teamPlatConfirmationService.open({
            title: '',
            message: '발주를 생성하시겠습니까?',
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
                if (result) {
                    this.isProgressSpinner = true;
                    this._estimateService.getDetail(0, 10, 'qtLineNo', 'asc', estimateHeader);

                    this.estimateDetails$ = this._estimateService.estimateDetails$;
                    this._estimateService.estimateDetails$
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((estimateDetail: any) => {
                            if (estimateDetail != null) {
                                this.isProgressSpinner = false;
                                const row = {header: estimateHeader, detail: estimateDetail};
                                this._router.navigate(['estimate-order/order/order-new'], {
                                    state: {
                                        'header': estimateHeader,
                                        'detail': estimateDetail
                                    }
                                });
                            }
                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        });
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
            this._functionService.cfn_alert('확정만 가능합니다. 다시 조회하세요.');
            return;
        }
        const confirmation = this._teamPlatConfirmationService.open({
            title: '',
            message: '주문을 생성하시겠습니까?',
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
                if (result) {
                    this.isProgressSpinner = true;
                    this._estimateService.getDetail(0, 10, 'qtLineNo', 'asc', estimateHeader);

                    this.estimateDetails$ = this._estimateService.estimateDetails$;
                    this._estimateService.estimateDetails$
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((estimateDetail: any) => {
                            if (estimateDetail != null) {
                                const row = {header: estimateHeader, detail: estimateDetail};
                                this._router.navigate(['salesorder/salesorder/salesorder-new'], {
                                    state: {
                                        'header': estimateHeader,
                                        'detail': estimateDetail
                                    }
                                });
                            }
                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        });
                } else {
                    this.selectHeader();
                }
            });
    }

    enter(event): void {
        if(event.keyCode===13){
            this.selectHeader();
        }
    }
}
