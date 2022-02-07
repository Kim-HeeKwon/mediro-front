import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FuseRealGridService} from "../../../../../../@teamplat/services/realgrid";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {FormBuilder, FormGroup} from "@angular/forms";
import {FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {Columns} from "../../../../../../@teamplat/services/realgrid/realgrid.types";
import {Observable, Subject} from "rxjs";
import {IncomeOutcomeService} from "../income-outcome.service";
import {takeUntil} from "rxjs/operators";
import {InBoundHeaderPagenation} from "../../../bound/inbound/inbound.types";
import {CommonPopupItemsComponent} from "../../../../../../@teamplat/components/common-popup-items";
import {DeviceDetectorService} from "ngx-device-detector";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";

@Component({
    selector: 'dms-stock-income-outcome-detail',
    templateUrl: 'income-outcome-detail.component.html',
    styleUrls: ['income-outcome-detail.component.scss'],
})
export class IncomeOutcomeDetailComponent implements OnInit, OnDestroy, AfterViewInit {
    isLoading: boolean = false;
    isMobile: boolean = false;
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    searchForm: FormGroup;
    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    incomeOutcomeDataProvider: RealGrid.LocalDataProvider;
    incomeOutcomeColumns: Columns[];

    // @ts-ignore
    incomeOutcomeFields: DataFieldObject[] = [
        {fieldName: 'route', dataType: ValueType.TEXT},
        {fieldName: 'accountNm', dataType: ValueType.TEXT},
        {fieldName: 'rbalance', dataType: ValueType.NUMBER},
        {fieldName: 'sbalance', dataType: ValueType.NUMBER},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _realGridsService: FuseRealGridService,
        private _incomeOutcomeService: IncomeOutcomeService,
        public matDialogRef: MatDialogRef<IncomeOutcomeDetailComponent>,
        private _codeStore: CodeStore,
        public _matDialogPopup: MatDialog,
        private _formBuilder: FormBuilder,
        private _deviceService: DeviceDetectorService,
        private _changeDetectorRef: ChangeDetectorRef,
        private readonly breakpointObserver: BreakpointObserver,
        private _utilService: FuseUtilsService) {
        this.isMobile = this._deviceService.isMobile();
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
        this.searchForm = this._formBuilder.group({
            account: [''],
            accountNm: [''],
        });

        //그리드 컬럼
        this.incomeOutcomeColumns = [
            {
                name: 'accountNm', fieldName: 'accountNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '거래처명', styleName: 'center-cell-text'},
                renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'rbalance', fieldName: 'rbalance', type: 'data', width: '150', styleName: 'right-cell-text'
                , header: {text: '미수금', styleName: 'center-cell-text'}
                , footer: {
                    text: '',
                    expression: 'sum',
                    numberFormat : '#,##0',
                }
                , numberFormat : '#,##0', renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'sbalance', fieldName: 'sbalance', type: 'data', width: '150', styleName: 'right-cell-text'
                , header: {text: '미지급금', styleName: 'center-cell-text'}
                , footer: {
                    text: '',
                    expression: 'sum',
                    numberFormat : '#,##0',
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

        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.incomeOutcomeDataProvider,
            'incomeOutcomeDetail',
            this.incomeOutcomeColumns,
            this.incomeOutcomeFields,
            gridListOption,);

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

        this._changeDetectorRef.markForCheck();
    }

    selectHeader(): void {
        const rtn = this._incomeOutcomeService.getDetail(0, 1, 'accountNm', 'asc', this.searchForm.getRawValue());

        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.incomeOutcomeDataProvider, ex.incomeOutcomeDetail);

        });
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '원장 목록');
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
