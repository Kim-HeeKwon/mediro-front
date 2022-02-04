import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {MatPaginator} from "@angular/material/paginator";
import {FuseRealGridService} from "../../../../../@teamplat/services/realgrid";
import {MatDialog} from "@angular/material/dialog";
import {FormBuilder, FormGroup} from "@angular/forms";
import {TeamPlatConfirmationService} from "../../../../../@teamplat/services/confirmation";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {CommonCode, FuseUtilsService} from "../../../../../@teamplat/services/utils";
import {CodeStore} from "../../../../core/common-code/state/code.store";
import {DeviceDetectorService} from "ngx-device-detector";
import * as moment from "moment";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {Columns} from "../../../../../@teamplat/services/realgrid/realgrid.types";
import {IncomeOutcomeService} from "./income-outcome.service";
import {IncomeOutcomeDetailComponent} from "./income-outcome-detail/income-outcome-detail.component";
import {CommonPopupItemsComponent} from "../../../../../@teamplat/components/common-popup-items";
import {takeUntil} from "rxjs/operators";

@Component({
    selector: 'app-dms-income-outcome',
    templateUrl: './income-outcome.component.html',
    styleUrls: ['./income-outcome.component.scss']
})

export class IncomeOutcomeComponent implements OnInit, OnDestroy, AfterViewInit {
    isLoading: boolean = false;
    isSearchForm: boolean = false;
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    searchForm: FormGroup;
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    drawerMode: 'over' | 'side' = 'over';
    orderBy: any = 'asc';
    drawerOpened: boolean = false;
    isMobile: boolean = false;
    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    incomeOutcomeDataProvider: RealGrid.LocalDataProvider;
    incomeOutcomeColumns: Columns[];
    year: CommonCode[] = null;

    // @ts-ignore
    incomeOutcomeFields: DataFieldObject[] = [
        {fieldName: 'route', dataType: ValueType.TEXT},
        {fieldName: 'writeDate', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'invoice', dataType: ValueType.TEXT},
        {fieldName: 'inComeAmt', dataType: ValueType.NUMBER},
        {fieldName: 'outComeAmt', dataType: ValueType.NUMBER},
        {fieldName: 'cashD', dataType: ValueType.NUMBER},
        {fieldName: 'noteD', dataType: ValueType.NUMBER},
        {fieldName: 'etcD', dataType: ValueType.NUMBER},
        {fieldName: 'cashW', dataType: ValueType.NUMBER},
        {fieldName: 'noteW', dataType: ValueType.NUMBER},
        {fieldName: 'etcW', dataType: ValueType.NUMBER},
        {fieldName: 'balance', dataType: ValueType.NUMBER},
        {fieldName: 'm', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    _range: { start: any | null; end: any | null } = {
        start: null,
        end  : null
    };

    constructor(
        private _realGridsService: FuseRealGridService,
        private _matDialog: MatDialog,
        private _incomeOutcomeService: IncomeOutcomeService,
        private _formBuilder: FormBuilder,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _functionService: FunctionService,
        private _utilService: FuseUtilsService,
        private _codeStore: CodeStore,
        public _matDialogPopup: MatDialog,
        private _deviceService: DeviceDetectorService,
        private _changeDetectorRef: ChangeDetectorRef,
        private readonly breakpointObserver: BreakpointObserver) {
        this.isMobile = this._deviceService.isMobile();
        this.year = _utilService.commonValue(_codeStore.getValue().data, 'YEAR');
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.incomeOutcomeDataProvider);
    }

    ngOnInit(): void {
        // 검색 Form 생성
        const today = new Date();
        const YYYY = today.getFullYear();
        console.log(YYYY);
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            year: [YYYY + ''],
            account: [''],
            accountNm: [''],
            range: [{
                start: moment().utc(false).add(-1, 'month').endOf('day').toISOString(),
                end: moment().utc(false).startOf('day').toISOString()
            }],
            start: [],
            end: []
        });

        this._range = {
            start: moment().utc(false).add(-1, 'month').endOf('day').toISOString(),
            end: moment().utc(false).startOf('day').toISOString()
        };

        const columnLayout = [
            'writeDate',
            'itemNm',
            'invoice',
            'm',
            {
                name: 'comeAmt',
                direction: 'horizontal',
                items: [
                    'outComeAmt',
                    'inComeAmt',
                ],
                header: {
                    text: '매출/매입',
                }
            },
            {
                name: 'withdrawal',
                direction: 'horizontal',
                items: [
                    'cashW',
                    // 'noteW',
                    'etcW',
                ],
                header: {
                    text: '출금',
                }
            },
            {
                name: 'deposit',
                direction: 'horizontal',
                items: [
                    'cashD',
                    // 'noteD',
                    'etcD',
                ],
                header: {
                    text: '입금',
                }
            },
            'balance',
        ];

        //그리드 컬럼
        this.incomeOutcomeColumns = [
            {
                name: 'writeDate', fieldName: 'writeDate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '거래일', styleName: 'center-cell-text'},
                renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '제품명', styleName: 'center-cell-text'},
                renderer:{
                    showTooltip:true
                },groupFooter: {
                    text: '월계'
                }
            },
            {
                name: 'invoice', fieldName: 'invoice', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '문서번호', styleName: 'center-cell-text'},
                renderer:{
                    showTooltip:true
                }, footer: {
                    text: '합계',
                }
            },
            {
                name: 'm', fieldName: 'm', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '월', styleName: 'center-cell-text'},
                renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'inComeAmt', fieldName: 'inComeAmt', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '매입', styleName: 'center-cell-text'}
                , footer: {
                    text: '',
                    expression: 'sum',
                    numberFormat : '#,##0'
                },groupFooter: {
                    expression: 'sum',
                    numberFormat: '#,##0',
                }
                , numberFormat : '#,##0', renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'outComeAmt', fieldName: 'outComeAmt', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '매출', styleName: 'center-cell-text'}
                , footer: {
                    text: '',
                    expression: 'sum',
                    numberFormat : '#,##0'
                },groupFooter: {
                    expression: 'sum',
                    numberFormat: '#,##0',
                }
                , numberFormat : '#,##0', renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'cashD', fieldName: 'cashD', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '현금', styleName: 'center-cell-text'}
                , footer: {
                    text: '',
                    expression: 'sum',
                    numberFormat : '#,##0'
                },groupFooter: {
                    expression: 'sum',
                    numberFormat: '#,##0',
                }
                , numberFormat : '#,##0', renderer:{
                    showTooltip:true
                }
            },
            // {
            //     name: 'noteD', fieldName: 'noteD', type: 'data', width: '100', styleName: 'right-cell-text'
            //     , header: {text: '어음', styleName: 'center-cell-text'}
            //     , footer: {
            //         text: '',
            //         expression: 'sum',
            //     }
            //     , numberFormat : '#,##0', renderer:{
            //         showTooltip:true
            //     }
            // },
            {
                name: 'etcD', fieldName: 'etcD', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '기타', styleName: 'center-cell-text'}
                , footer: {
                    text: '',
                    expression: 'sum',
                    numberFormat : '#,##0',
                },groupFooter: {
                    expression: 'sum',
                    numberFormat: '#,##0',
                }
                , numberFormat : '#,##0', renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'cashW', fieldName: 'cashW', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '현금', styleName: 'center-cell-text'}
                , footer: {
                    text: '',
                    expression: 'sum',
                    numberFormat : '#,##0'
                },groupFooter: {
                    expression: 'sum',
                    numberFormat: '#,##0',
                }
                , numberFormat : '#,##0', renderer:{
                    showTooltip:true
                }
            },
            // {
            //     name: 'noteW', fieldName: 'noteW', type: 'data', width: '100', styleName: 'right-cell-text'
            //     , header: {text: '어음', styleName: 'center-cell-text'}
            //     , footer: {
            //         text: '',
            //         expression: 'sum',
            //         numberFormat : '#,##0'
            //     }
            //     , numberFormat : '#,##0', renderer:{
            //         showTooltip:true
            //     }
            // },
            {
                name: 'etcW', fieldName: 'etcW', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '기타', styleName: 'center-cell-text'}
                , footer: {
                    text: '',
                    expression: 'sum',
                    numberFormat : '#,##0',
                },groupFooter: {
                    expression: 'sum',
                    numberFormat: '#,##0',
                }
                , numberFormat : '#,##0', renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'balance', fieldName: 'balance', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '잔액', styleName: 'center-cell-text'}
                , footer: {
                    text: '',
                },groupFooter: {
                    expression: 'sum',
                    numberFormat: '#,##0',
                }
                , numberFormat : '#,##0', renderer:{
                    showTooltip:true
                }
            },

        ];

        this.incomeOutcomeDataProvider = this._realGridsService.gfn_CreateDataProvider();

        const gridListOption = {
            stateBar: false,
            checkBar: true,
            footers: true,
        };

        this.incomeOutcomeDataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        const gridListGroup = ['m'];

        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.incomeOutcomeDataProvider,
            'incomeoutcome',
            this.incomeOutcomeColumns,
            this.incomeOutcomeFields,
            gridListOption,
            columnLayout,gridListGroup);

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

        const data = [{
            date: '2021-05-30',
            itemNm: '실린지 외 2품목',
            invoice: '11111-000002',
            outComeAmt: 1000000,
            inComeAmt: '',
            cashD: '',
            noteD: '',
            etcD: '',
            cashW: '',
            noteW: '',
            etcW: '',
            balance: 1000000,
        },{
            route: 'after',
            date: '2021-05-27',
            itemNm: '현금',
            invoice: '',
            outComeAmt: '',
            inComeAmt: '',
            cashD: '',
            noteD: '',
            etcD: '',
            cashW: 200000,
            noteW: '',
            etcW: '',
            balance: 0,
        },{
            route: 'after',
            date: '2021-05-05',
            itemNm: '현금',
            invoice: '',
            outComeAmt: '',
            inComeAmt: '',
            cashD: '',
            noteD: '',
            etcD: '',
            cashW: 100000,
            noteW: '',
            etcW: '',
            balance: 200000,
        },{
            route: 'after',
            date: '2021-05-01',
            itemNm: '실린지 외 2품목',
            invoice: '11111-000001',
            outComeAmt: '',
            inComeAmt: 300000,
            cashD: '',
            noteD: '',
            etcD: '',
            cashW: '',
            noteW: '',
            etcW: '',
            balance: -300000,
        },{
            route: 'before',
            date: '2021-04-30',
            itemNm: '전기이월',
            invoice: '',
            outComeAmt: '',
            inComeAmt: '',
            cashD: '',
            noteD: '',
            etcD: '',
            cashW: '',
            noteW: '',
            etcW: '',
            balance: '0',
        },];

        this.gridList.setRowStyleCallback((grid, item, fixed) => {
            const ret = {
                styleName: ''
            };
            const route = grid.getValue(item.index, 'route');
            if (route === 'before') {
                ret.styleName = 'whiteSmoke-color';
                return ret;
            }
        });
        //this._realGridsService.gfn_DataSetGrid(this.gridList, this.incomeOutcomeDataProvider, data);

        this._changeDetectorRef.markForCheck();
    }

    selectHeader(){

        this.searchSetValue();
        const rtn = this._incomeOutcomeService.getHeader(0, 1, 'accountNm', 'asc', this.searchForm.getRawValue());

        rtn.then((ex) => {

            // ex.incomeOutcomeHeader.push(
            //     {
            //         route: 'before',
            //         writeDate: '2021-04-30',
            //         itemNm: '전기이월',
            //         invoice: '',
            //         outComeAmt: '',
            //         inComeAmt: '',
            //         cashD: '',
            //         noteD: '',
            //         etcD: '',
            //         cashW: '',
            //         noteW: '',
            //         etcW: '',
            //         balance: '0',
            //     }
            // );

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.incomeOutcomeDataProvider, ex.incomeOutcomeHeader);

        });
    }
    yearCha(): void {
        this._range = {
            end: moment().utc(false).startOf('day').toISOString(),
            start  : moment().utc(false).add(-2, 'month').endOf('month').toISOString()
        };
    }

    searchFormClick(): void {
        if (this.isSearchForm) {
            this.isSearchForm = false;
        } else {
            this.isSearchForm = true;
        }
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.selectHeader();
        }
    }



    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '원장 목록');
    }

    po() {

        const columnLayout = [
            'writeDate',
            'itemNm',
            'invoice',
            'inComeAmt',
            {
                name: 'withdrawal',
                direction: 'horizontal',
                items: [
                    'cashW',
                    // 'noteW',
                    'etcW',
                ],
                header: {
                    text: '출금',
                }
            },
            'balance',
        ];
        if(columnLayout){
            this.gridList.setColumnLayout(columnLayout);
        }
    }
    so() {
        const columnLayout = [
            'writeDate',
            'itemNm',
            'invoice',
            'outComeAmt',
            {
                name: 'deposit',
                direction: 'horizontal',
                items: [
                    'cashD',
                    // 'noteD',
                    'etcD',
                ],
                header: {
                    text: '입금',
                }
            },
            'balance',
        ];
        if(columnLayout){
            this.gridList.setColumnLayout(columnLayout);
        }
    }
    all() {

        const columnLayout = [
            'writeDate',
            'itemNm',
            'invoice',
            {
                name: 'comeAmt',
                direction: 'horizontal',
                items: [
                    'outComeAmt',
                    'inComeAmt',
                ],
                header: {
                    text: '매출/매입',
                }
            },
            {
                name: 'withdrawal',
                direction: 'horizontal',
                items: [
                    'cashW',
                    // 'noteW',
                    'etcW',
                ],
                header: {
                    text: '출금',
                }
            },
            {
                name: 'deposit',
                direction: 'horizontal',
                items: [
                    'cashD',
                    // 'noteD',
                    'etcD',
                ],
                header: {
                    text: '입금',
                }
            },
            'balance',
        ];
        if(columnLayout){
            this.gridList.setColumnLayout(columnLayout);
        }
    }

    incomeOutcome() {

        if (!this.isMobile) {
            const d = this._matDialog.open(IncomeOutcomeDetailComponent, {
                autoFocus: false,
                disableClose: true,
                data: {

                },
            });
            d.afterClosed().subscribe(() => {
            });
        } else {
            const d = this._matDialog.open(IncomeOutcomeDetailComponent, {
                data: {

                },
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    d.updateSize('calc(100vw - 10px)', '');
                } else {
                }
            });
            d.afterClosed().subscribe(() => {
                smallDialogSubscription.unsubscribe();
            });
        }
    }

    // selectDate(m: number) {
    //
    //     console.log(this.searchForm.getRawValue().year);
    //     const year = this.searchForm.getRawValue().year;
    //     const lastDate = new Date(year, m, 0).getDate();
    //     const startDay = year + '-' + m + '-' + '1';
    //     const endDay = year + '-' + m + '-' + lastDate;
    //     this._range = {
    //         end: moment().utc(false).startOf('day').toISOString(),
    //         start  : moment().utc(false).add(-2, 'month').endOf('month').toISOString()
    //     };
    //     // this._range.start = startDay;
    //     // this._range.end = endDay;
    //     console.log(startDay);
    //     console.log(endDay);
    //     this._changeDetectorRef.markForCheck();
    // }

    searchSetValue(): void {
        this.searchForm.patchValue({'start': this.searchForm.get('range').value.start});
        this.searchForm.patchValue({'end': this.searchForm.get('range').value.end});
        console.log(this.searchForm.getRawValue().range);
    }

    openAccountSearch(): void {
        if (!this.isMobile) {

            const popup = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup: 'P$_ACCOUNT',
                    headerText: '거래처 조회',
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });

            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        this.searchForm.patchValue({'account': result.accountCd});
                        this.searchForm.patchValue({'accountNm': result.accountNm});
                        this._changeDetectorRef.markForCheck();
                    }
                });
        } else {
            const popup = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup: 'P$_ACCOUNT',
                    headerText: '거래처 조회'
                },
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });

            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    popup.updateSize('calc(100vw - 10px)', '');
                }
            });
            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        smallDialogSubscription.unsubscribe();
                        this.searchForm.patchValue({'account': result.accountCd});
                        this.searchForm.patchValue({'accountNm': result.accountNm});
                    }
                });
        }
    }
}
