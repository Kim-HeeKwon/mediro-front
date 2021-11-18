import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {merge, Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CommonCode, FuseUtilsService} from "../../../../../@teamplat/services/utils";
import {Columns} from "../../../../../@teamplat/services/realgrid/realgrid.types";
import {InvoiceDetail, InvoiceHeader, InvoiceHeaderPagenation} from "./tax.types";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {MatDialog} from "@angular/material/dialog";
import {TaxService} from "./tax.service";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {CodeStore} from "../../../../core/common-code/state/code.store";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {SessionStore} from "../../../../core/session/state/session.store";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {TeamPlatConfirmationService} from "../../../../../@teamplat/services/confirmation";
import {DeviceDetectorService} from "ngx-device-detector";
import * as moment from "moment";
import {FuseRealGridService} from "../../../../../@teamplat/services/realgrid";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {environment} from "../../../../../environments/environment";

@Component({
    selector: 'dms-tax',
    templateUrl: './tax.component.html',
    styleUrls: ['./tax.component.scss']
})
export class TaxComponent implements OnInit, OnDestroy, AfterViewInit {
    // isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
    //     Breakpoints.XSmall
    // );
    isLoading: boolean = false;
    isMobile: boolean = false;
    isProgressSpinner: boolean = false;
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    searchForm: FormGroup;
    type: CommonCode[] = null;
    status: CommonCode[] = null;
    issueType: CommonCode[] = null;
    taxType: CommonCode[] = null;
    chargeDirection: CommonCode[] = null;
    purposeType: CommonCode[] = null;
    invoiceHeaderColumns: Columns[];
    invoiceHeaders$: Observable<InvoiceHeader[]>;
    invoiceDetails$: Observable<InvoiceDetail[]>;
    invoiceHeaderPagenation: InvoiceHeaderPagenation | null = null;
    isSearchForm: boolean = false;
    orderBy: any = 'desc';
    @ViewChild(MatPaginator, { static: true }) _paginator: MatPaginator;
    searchCondition: CommonCode[] = [
        {
            id: '100',
            name: '공급자'
        },
        {
            id: '101',
            name: '공급받는 자'
        }];
    searchCondition2: CommonCode[] = [
        {
            id: 'invoice',
            name: '문서 번호'
        }];
    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    invoiceHeaderDataProvider: RealGrid.LocalDataProvider;
    invoiceHeaderFields: DataFieldObject[] = [
        {fieldName: 'no', dataType: ValueType.TEXT},
        {fieldName: 'mId', dataType: ValueType.TEXT},
        {fieldName: 'writeDate', dataType: ValueType.TEXT},
        {fieldName: 'invoice', dataType: ValueType.TEXT},
        {fieldName: 'taxBillNo', dataType: ValueType.TEXT},
        {fieldName: 'bisNo', dataType: ValueType.TEXT},
        {fieldName: 'account', dataType: ValueType.TEXT},
        {fieldName: 'accountNm', dataType: ValueType.TEXT},
        {fieldName: 'toBisNo', dataType: ValueType.TEXT},
        {fieldName: 'toAccount', dataType: ValueType.TEXT},
        {fieldName: 'toAccountNm', dataType: ValueType.TEXT},
        {fieldName: 'type', dataType: ValueType.TEXT},
        {fieldName: 'status', dataType: ValueType.TEXT},
        {fieldName: 'issueType', dataType: ValueType.TEXT},
        {fieldName: 'taxType', dataType: ValueType.TEXT},
        {fieldName: 'chargeDirection', dataType: ValueType.TEXT},
        {fieldName: 'purposeType', dataType: ValueType.TEXT},
        {fieldName: 'supplyAmt', dataType: ValueType.NUMBER},
        {fieldName: 'taxAmt', dataType: ValueType.NUMBER},
        {fieldName: 'totalAmt', dataType: ValueType.NUMBER},
        {fieldName: 'remark', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _realGridsService: FuseRealGridService,
        private _matDialog: MatDialog,
        public _matDialogPopup: MatDialog,
        private _formBuilder: FormBuilder,
        private _taxService: TaxService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _common: Common,
        private _codeStore: CodeStore,
        private _activatedRoute: ActivatedRoute,
        private _sessionStore: SessionStore,
        private _router: Router,
        private _functionService: FunctionService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver) {
        this.type = _utilService.commonValue(_codeStore.getValue().data, 'INVOICE_TYPE');
        this.status = _utilService.commonValue(_codeStore.getValue().data, 'INVOICE_STATUS');
        this.issueType = _utilService.commonValue(_codeStore.getValue().data, 'ISSUE_TYPE');
        this.taxType = _utilService.commonValue(_codeStore.getValue().data, 'TAX_TYPE');
        this.chargeDirection = _utilService.commonValue(_codeStore.getValue().data, 'CH_DIRECTION');
        this.purposeType = _utilService.commonValue(_codeStore.getValue().data, 'PURPOSE_TYPE');
        this.isMobile = this._deviceService.isMobile();
    }
    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            accountNm: [''],
            toAccountNm: [''],
            invoice: [''],
            searchCondition: ['100'],
            searchCondition2: ['invoice'],
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

        const valuesIssueType = [];
        const lablesIssueType = [];

        const valuesTaxType = [];
        const lablesTaxType = [];

        const valuesChargeDirection = [];
        const lablesChargeDirection = [];

        const valuesPurposeType = [];
        const lablesPurposeType = [];

        this.type.forEach((param: any) => {
            valuesType.push(param.id);
            lablesType.push(param.name);
        });

        this.status.forEach((param: any) => {
            valuesStatus.push(param.id);
            lablesStatus.push(param.name);
        });

        this.issueType.forEach((param: any) => {
            valuesIssueType.push(param.id);
            lablesIssueType.push(param.name);
        });

        this.taxType.forEach((param: any) => {
            valuesTaxType.push(param.id);
            lablesTaxType.push(param.name);
        });

        this.chargeDirection.forEach((param: any) => {
            valuesChargeDirection.push(param.id);
            lablesChargeDirection.push(param.name);
        });

        this.purposeType.forEach((param: any) => {
            valuesPurposeType.push(param.id);
            lablesPurposeType.push(param.name);
        });

        //그리드 컬럼
        this.invoiceHeaderColumns = [
            {name: 'writeDate', fieldName: 'writeDate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '작성일자' , styleName: 'left-cell-text'}
            },
            {name: 'invoice', fieldName: 'invoice', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '문서번호', styleName: 'left-cell-text'}
                ,renderer:{
                    type:'button'
                }},
            {name: 'taxBillNo', fieldName: 'taxBillNo', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '국세청 전송번호' , styleName: 'left-cell-text'}},
            {name: 'bisNo', fieldName: 'bisNo', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '공급자 사업자번호' , styleName: 'left-cell-text'}},
            {name: 'accountNm', fieldName: 'accountNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '공급자' , styleName: 'left-cell-text'}},
            {name: 'toBisNo', fieldName: 'toBisNo', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '공급받는 자 사업자번호' , styleName: 'left-cell-text'}},
            {name: 'toAccountNm', fieldName: 'toAccountNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '공급받는 자' , styleName: 'left-cell-text'}},
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
            {name: 'issueType', fieldName: 'issueType', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '발행형태', styleName: 'left-cell-text'},
                values: valuesIssueType,
                labels: lablesIssueType,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.issueType),
            },
            {name: 'taxType', fieldName: 'taxType', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '과세형태', styleName: 'left-cell-text'},
                values: valuesTaxType,
                labels: lablesTaxType,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.taxType),
            },
            {name: 'chargeDirection', fieldName: 'chargeDirection', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '과금방향', styleName: 'left-cell-text'},
                values: valuesChargeDirection,
                labels: lablesChargeDirection,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.chargeDirection),
            },
            {name: 'purposeType', fieldName: 'purposeType', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '영수/청구', styleName: 'left-cell-text'},
                values: valuesPurposeType,
                labels: lablesPurposeType,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.purposeType),
            },
            {name: 'supplyAmt', fieldName: 'supplyAmt', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '총 공급가액' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'
            },
            {name: 'taxAmt', fieldName: 'taxAmt', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '총 세액' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'
            },
            {name: 'totalAmt', fieldName: 'totalAmt', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '총 금액' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'
            },
        ];
        //그리드 Provider
        this.invoiceHeaderDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const gridListOption = {
            stateBar : false,
            checkBar : true,
            footers : false,
        };

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.invoiceHeaderDataProvider,
            'invoiceHeaderGrid',
            this.invoiceHeaderColumns,
            this.invoiceHeaderFields,
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
                    this._taxService.getHeader(this.invoiceHeaderPagenation.page,this.invoiceHeaderPagenation.size,clickData.column,this.orderBy,this.searchForm.getRawValue());
                }
            }
            if(this.orderBy === 'asc'){
                this.orderBy = 'desc';
            }else{
                this.orderBy = 'asc';
            }
        };

        this.gridList.onCellItemClicked = (grid, index, clickData) => {

            if(clickData.type === 'button'){
                this.selectClickRow(grid.getValues(index.dataRow));
            }
        };

        //페이지 라벨
        this._paginator._intl.itemsPerPageLabel = '';
        this.setGridData();


        this._taxService.invoiceHeaderPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((invoiceHeaderPagenation: InvoiceHeaderPagenation) => {
                this.invoiceHeaderPagenation = invoiceHeaderPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
    searchSetValue(): void{
        if (this.searchForm.getRawValue().searchCondition === '100') {
            this.searchForm.patchValue({'toAccountNm': ''});
            this.searchForm.patchValue({'accountNm': this.searchForm.getRawValue().searchText});
        }else{
            this.searchForm.patchValue({'toAccountNm': this.searchForm.getRawValue().searchText});
            this.searchForm.patchValue({'accountNm': ''});
        }
        if (this.searchForm.getRawValue().searchCondition2 === 'invoice') {
            this.searchForm.patchValue({'invoice': this.searchForm.getRawValue().searchText2});
        }
        this.searchForm.patchValue({'start': this.searchForm.get('range').value.start});
        this.searchForm.patchValue({'end': this.searchForm.get('range').value.end});
    }
    setGridData(): void {
        this.invoiceHeaders$ = this._taxService.invoiceHeaders$;
        this._taxService.invoiceHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((invoiceHeaders: any) => {
                // Update the counts
                if (invoiceHeaders !== null) {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.invoiceHeaderDataProvider, invoiceHeaders);
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
                return this._taxService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'invoice', this.orderBy, this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.invoiceHeaderDataProvider);
    }

    selectHeader(): void {

        this.searchSetValue();
        this._taxService.getHeader(0, 20, 'invoice', 'desc', this.searchForm.getRawValue());

        this.setGridData();
    }

    searchFormClick(): void {
        if(this.isSearchForm){
            this.isSearchForm = false;
        }else{
            this.isSearchForm = true;
        }
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '계산서 목록');
    }

    //페이징
    pageEvent($event: PageEvent): void {

        this.searchSetValue();
        this._taxService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'invoice', this.orderBy, this.searchForm.getRawValue());
    }

    enter(event): void {
        if(event.keyCode===13){
            this.selectHeader();
        }
    }

    //발행
    invoice(): void {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.invoiceHeaderDataProvider);
        if(checkValues.length < 1){
            this._functionService.cfn_alert('대상을 선택해주세요.');
            return;
        }else{
            const confirmation = this._teamPlatConfirmationService.open({
                title  : '',
                message: '발행 하시겠습니까?',
                actions: {
                    confirm: {
                        label: '발행'
                    },
                    cancel: {
                        label: '닫기'
                    }
                }
            });
            confirmation.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if(result) {
                        if(checkValues){
                            this._taxService.invoice(this.headerDataSet(checkValues))
                                .pipe(takeUntil(this._unsubscribeAll))
                                .subscribe((bill: any) => {
                                    this.cfn_alertCheckMessage(bill);
                                    // Mark for check
                                    this._changeDetectorRef.markForCheck();
                                });
                        }
                    }
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    //발행 취소
    invoiceCancel(): void {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.invoiceHeaderDataProvider);
        if(checkValues.length < 1){
            this._functionService.cfn_alert('대상을 선택해주세요.');
            return;
        }else{
            const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
                title      : '',
                message    : '취소하시겠습니까?',
                icon       : this._formBuilder.group({
                    show : true,
                    name : 'heroicons_outline:exclamation',
                    color: 'warn'
                }),
                actions    : this._formBuilder.group({
                    confirm: this._formBuilder.group({
                        show : true,
                        label: '취소',
                        color: 'warn'
                    }),
                    cancel : this._formBuilder.group({
                        show : true,
                        label: '닫기'
                    })
                }),
                dismissible: true
            }).value);

            confirmation.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if(result) {
                        if(checkValues){
                            this._taxService.invoiceCancel(this.headerDataSet(checkValues))
                                .pipe(takeUntil(this._unsubscribeAll))
                                .subscribe((bill: any) => {
                                    this.cfn_alertCheckMessage(bill);
                                    // Mark for check
                                    this._changeDetectorRef.markForCheck();
                                });
                        }
                    }
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    //삭제
    invoiceDelete(): void {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.invoiceHeaderDataProvider);
        if(checkValues.length < 1){
            this._functionService.cfn_alert('대상을 선택해주세요.');
            return;
        }else{
            const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
                title      : '',
                message    : '삭제하시겠습니까?',
                icon       : this._formBuilder.group({
                    show : true,
                    name : 'heroicons_outline:exclamation',
                    color: 'warn'
                }),
                actions    : this._formBuilder.group({
                    confirm: this._formBuilder.group({
                        show : true,
                        label: '삭제',
                        color: 'warn'
                    }),
                    cancel : this._formBuilder.group({
                        show : true,
                        label: '닫기'
                    })
                }),
                dismissible: true
            }).value);

            confirmation.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if(result) {
                        if(checkValues){
                            this._taxService.invoiceDelete(this.headerDataSet(checkValues))
                                .pipe(takeUntil(this._unsubscribeAll))
                                .subscribe((bill: any) => {
                                    this.cfn_alertCheckMessage(bill);
                                    // Mark for check
                                    this._changeDetectorRef.markForCheck();
                                });
                        }
                    }
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(selected: any[]) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i=0; i<selected.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            selected[i].popBillId = this._sessionStore.getValue().popBillId;
        }
        return selected;
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    cfn_alertCheckMessage(param: any, redirectUrl?: string): void
    {
        if(param.status !== 'SUCCESS'){

            const icon = 'information-circle';
            // Setup config form
            this._functionService.configForm = this._formBuilder.group({
                title      : '',
                message    : param.msg,
                icon       : this._formBuilder.group({
                    show : true,
                    name : 'heroicons_outline:' + icon,
                    color: 'accent'
                }),
                actions    : this._formBuilder.group({
                    confirm: this._formBuilder.group({
                        show : false,
                        label: '',
                    }),
                    cancel : this._formBuilder.group({
                        show : true,
                        label: '닫기'
                    })
                }),
                dismissible: true
            });
            const confirmation = this._teamPlatConfirmationService.open(this._functionService.configForm.value);
        }else{
            this._functionService.cfn_alert('정상적으로 처리되었습니다.','check-circle');
            this.selectHeader();
        }
    }

    //상세정보 보기
    selectClickRow(invoiceHeader: any): void {

        this._common.sendDataChgUrl(invoiceHeader,environment.serverTaxUrl + '/v1/api/calculate/tax/getPrintURL')
            .subscribe((param: any) => {
                if(param.status !== 'SUCCESS'){

                    const icon = 'information-circle';
                    // Setup config form
                    this._functionService.configForm = this._formBuilder.group({
                        title      : '',
                        message    : param.msg,
                        icon       : this._formBuilder.group({
                            show : true,
                            name : 'heroicons_outline:' + icon,
                            color: 'accent'
                        }),
                        actions    : this._formBuilder.group({
                            confirm: this._formBuilder.group({
                                show : false,
                                label: '',
                            }),
                            cancel : this._formBuilder.group({
                                show : true,
                                label: '닫기'
                            })
                        }),
                        dismissible: true
                    });
                    const confirmation = this._teamPlatConfirmationService.open(this._functionService.configForm.value);
                }else{
                    window.open(param.data[0].url, '상세 정보(' + invoiceHeader.invoice + ')','top=50,left=200,width=1100,height=700');
                }
            });
    }
}