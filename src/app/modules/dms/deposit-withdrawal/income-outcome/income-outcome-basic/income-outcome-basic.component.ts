import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CommonCode, FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {Columns} from "../../../../../../@teamplat/services/realgrid/realgrid.types";
import {IncomeOutcomeBasicPagenation} from "../income-outcome.types";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FuseRealGridService} from "../../../../../../@teamplat/services/realgrid";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {TeamPlatConfirmationService} from "../../../../../../@teamplat/services/confirmation";
import {FunctionService} from "../../../../../../@teamplat/services/function";
import {DeviceDetectorService} from "ngx-device-detector";
import {IncomeOutcomeService} from "../income-outcome.service";
import {CommonPopupItemsComponent} from "../../../../../../@teamplat/components/common-popup-items";
import {takeUntil} from "rxjs/operators";

@Component({
    selector: 'dms-income-outcome-basic',
    templateUrl: 'income-outcome-basic.component.html',
    styleUrls: ['income-outcome-basic.component.scss'],
})
export class IncomeOutcomeBasicComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    orderBy: any = 'desc';
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    incomeOutcomeBasicPagenation: IncomeOutcomeBasicPagenation | null = null;
    isLoading: boolean = false;
    isMobile: boolean = false;
    searchForm: FormGroup;

    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    incomeOutcomeBasicDataProvider: RealGrid.LocalDataProvider;
    incomeOutcomeBasicColumns: Columns[];
    // @ts-ignore
    incomeOutcomeBasicFields: DataFieldObject[] = [
        {fieldName: 'account', dataType: ValueType.TEXT},
        {fieldName: 'accountNm', dataType: ValueType.TEXT},
        {fieldName: 'balance', dataType: ValueType.NUMBER}
    ];

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public matDialogRef: MatDialogRef<IncomeOutcomeBasicComponent>,
        private _realGridsService: FuseRealGridService,
        public _matDialogPopup: MatDialog,
        private _incomeOutcomeService: IncomeOutcomeService,
        private _formBuilder: FormBuilder,
        private _codeStore: CodeStore,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _functionService: FunctionService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.isMobile = this._deviceService.isMobile();
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.incomeOutcomeBasicDataProvider);
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            account: [''], // 거래처
            accountNm: [''],
        });

        this.incomeOutcomeBasicColumns = [
            {
                name: 'account', fieldName: 'account', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '거래처 코드', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'accountNm', fieldName: 'accountNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '거래처 명', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'balance', fieldName: 'balance', type: 'data', width: '150', styleName: 'right-cell-text'
                , header: {text: '금액', styleName: 'center-cell-text'}
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

        this.incomeOutcomeBasicDataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        //그리드 옵션
        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.incomeOutcomeBasicDataProvider,
            'incomeOutcomeBasic',
            this.incomeOutcomeBasicColumns,
            this.incomeOutcomeBasicFields,
            gridListOption);

        //그리드 옵션
        this.gridList.setEditOptions({
            readOnly: false,
            insertable: false,
            appendable: false,
            editable: true,
            updatable: true,
            deletable: true,
            checkable: true,
            softDeleting: true,
        });
        this.gridList.deleteSelection(true);
        this.gridList.setDisplayOptions({liveScroll: false,});
        this.gridList.setCopyOptions({
            enabled: true,
            singleMode: false
        });
        this.gridList.setPasteOptions({
            enabled: true,
            startEdit: false,
            commitEdit: true,
            checkReadOnly: true
        });
        this.gridList.editOptions.commitByCell = true;
        this.gridList.editOptions.validateOnEdited = true;
        this._realGridsService.gfn_EditGrid(this.gridList);

        // 셀 edit control
        this.gridList.setCellStyleCallback((grid, dataCell) => {
            if (dataCell.dataColumn.fieldName === 'account' ||
                dataCell.dataColumn.fieldName === 'accountNm') {
                return {editable: false};
            }
        });

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                const rtn = this._incomeOutcomeService.getBasic(this.incomeOutcomeBasicPagenation.page, this.incomeOutcomeBasicPagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
                this.selectCallBack(rtn);
            }
            ;
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };

        //페이지 라벨
        this._paginator._intl.itemsPerPageLabel = '';

        this._changeDetectorRef.markForCheck();
    }

    openAccountSearch() {

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


    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '기초 금액 목록');
    }


    selectHeader(): void {
        const rtn = this._incomeOutcomeService.getBasic(0, 40, 'addDate', 'desc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.incomeOutcomeBasicDataProvider, ex.incomeOutcomeBasic);
            this._incomeOutcomeService.incomeOutcomeBasicPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((incomeOutcomeBasicPagenation: IncomeOutcomeBasicPagenation) => {
                    // Update the pagination
                    this.incomeOutcomeBasicPagenation = incomeOutcomeBasicPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        });
    }

    saveIncomeOutcomeBasic() {

        const rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.incomeOutcomeBasicDataProvider);
        let detailCheck = false;
        if (rows.length === 0) {
            this._functionService.cfn_alert('수정된 행이 존재하지 않습니다.');
            detailCheck = true;
        }

        if (detailCheck) {
            return;
        }

        const confirmation = this._teamPlatConfirmationService.open({
            title: '',
            message: '저장하시겠습니까?',
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
                    this._incomeOutcomeService.basicSave(rows)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((safety: any) => {
                            this._functionService.cfn_loadingBarClear();
                            this._functionService.cfn_alertCheckMessage(safety);
                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                            this.selectHeader();
                        });
                } else {
                    this.selectHeader();
                }
            });
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }


    //페이징
    pageEvent($event: PageEvent): void {
        const rtn = this._incomeOutcomeService.getBasic(this._paginator.pageIndex, this._paginator.pageSize, 'addDate', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }
}
