import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {merge, Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CommonCode, FuseUtilsService} from "../../../../../@teamplat/services/utils";
import {Withdrawal, WithdrawalPagenation} from "./withdrawal.types";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {Columns} from "../../../../../@teamplat/services/realgrid/realgrid.types";
import {FuseRealGridService} from "../../../../../@teamplat/services/realgrid";
import {MatDialog} from "@angular/material/dialog";
import {TeamPlatConfirmationService} from "../../../../../@teamplat/services/confirmation";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {CodeStore} from "../../../../core/common-code/state/code.store";
import {DeviceDetectorService} from "ngx-device-detector";
import * as moment from "moment";
import {WithdrawalService} from "./withdrawal.service";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {DepositPagenation} from "../deposit/deposit.types";
import {formatDate} from "@angular/common";

@Component({
    selector: 'app-dms-withdrawal',
    templateUrl: './withdrawal.component.html',
    styleUrls: ['./withdrawal.component.scss']
})

export class WithdrawalComponent implements OnInit, OnDestroy, AfterViewInit {
    isLoading: boolean = false;
    isSearchForm: boolean = false;
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    drawerMode: 'over' | 'side' = 'over';
    orderBy: any = 'asc';
    withdrawals$: Observable<Withdrawal[]>;
    drawerOpened: boolean = false;
    isMobile: boolean = false;
    withdrawalPagenation: WithdrawalPagenation | null = null;
    searchForm: FormGroup;
    type: CommonCode[] = null;
    ynFlag: CommonCode[] = null;

    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    withdrawalDataProvider: RealGrid.LocalDataProvider;
    withdrawalColumns: Columns[];

    withdrawalFields: DataFieldObject[] = [
        {fieldName: 'withdrawal', dataType: ValueType.TEXT},
        {fieldName: 'withdrawalFlag', dataType: ValueType.TEXT},
        {fieldName: 'mgtFlag', dataType: ValueType.TEXT},
        {fieldName: 'billing', dataType: ValueType.TEXT},
        {fieldName: 'lineNo', dataType: ValueType.TEXT},
        {fieldName: 'account', dataType: ValueType.TEXT},
        {fieldName: 'accountNm', dataType: ValueType.TEXT},
        {fieldName: 'type', dataType: ValueType.TEXT},
        {fieldName: 'note', dataType: ValueType.TEXT},
        {fieldName: 'withdrawalDate', dataType: ValueType.TEXT},
        {fieldName: 'withdrawalAmt', dataType: ValueType.NUMBER},
        {fieldName: 'remark', dataType: ValueType.TEXT},
        {fieldName: 'udf1', dataType: ValueType.TEXT},
        {fieldName: 'udf2', dataType: ValueType.TEXT},
        {fieldName: 'udf3', dataType: ValueType.TEXT},
        {fieldName: 'udf4', dataType: ValueType.TEXT},
        {fieldName: 'udf5', dataType: ValueType.TEXT},
        {fieldName: 'udf6', dataType: ValueType.TEXT},
        {fieldName: 'udf7', dataType: ValueType.TEXT},
        {fieldName: 'udf8', dataType: ValueType.TEXT},
        {fieldName: 'udf9', dataType: ValueType.TEXT},
        {fieldName: 'udf10', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _realGridsService: FuseRealGridService,
        private _matDialog: MatDialog,
        private _withdrawalService: WithdrawalService,
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
        this.type = _utilService.commonValue(_codeStore.getValue().data, 'DW_TYPE');
        this.ynFlag = _utilService.commonValue(_codeStore.getValue().data, 'YN_FLAG');
    }
    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            accountNm: [''],
            range: [{
                start: moment().utc(false).add(-1, 'month').endOf('day').toISOString(),
                end: moment().utc(false).startOf('day').toISOString()
            }],
            start: [],
            end: []
        });
        const valuesType = [];
        const lablesType = [];

        this.type.forEach((param: any) => {
            valuesType.push(param.id);
            lablesType.push(param.name);
        });

        const valuesFlag = [];
        const lablesFlag = [];

        this.ynFlag.forEach((param: any) => {
            valuesFlag.push(param.id);
            lablesFlag.push(param.name);
        });

        //그리드 컬럼
        this.withdrawalColumns = [
            // {
            //     name: 'deposit', fieldName: 'deposit', type: 'data', width: '120', styleName: 'left-cell-text'
            //     , header: {text: '입금번호', styleName: 'center-cell-text'}, renderer: {
            //         showTooltip: true
            //     }
            // },
            {
                name: 'withdrawalFlag', fieldName: 'withdrawalFlag', type: 'data', width: '80', styleName: 'center-cell-text',
                header: {text: '마감', styleName: 'center-cell-text'},
                values: valuesFlag,
                labels: lablesFlag,
                lookupDisplay: true,
            },
            {
                name: 'account', fieldName: 'account', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '거래처 코드', styleName: 'center-cell-text red-font-color'}
                , renderer: 'accountGrdPopup'
                , popUpObject:
                    {
                        popUpId: 'P$_ACCOUNT',
                        popUpHeaderText: '거래처 조회',
                        popUpDataSet: 'account:accountCd|accountNm:accountNm'
                        // where : [{
                        //     key: 'account',
                        //     replace : 'account:=:#{account}'
                        // }]
                    }
            },
            {
                name: 'accountNm', fieldName: 'accountNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '거래처 명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'type', fieldName: 'type', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '유형', styleName: 'center-cell-text red-font-color'},
                values: valuesType,
                labels: lablesType,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.type), renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'withdrawalDate', fieldName: 'withdrawalDate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '일자', styleName: 'center-cell-text red-font-color'}, renderer: {
                    showTooltip: true
                }
                , datetimeFormat: 'yyyy-MM-dd'
                , mask: {editMask: '9999-99-99', includeFormat: false, allowEmpty: true}
                , editor: {
                    type: 'date',
                    datetimeFormat: 'yyyy-MM-dd',
                    textReadOnly: true,
                }
            },
            {
                name: 'withdrawalAmt',
                fieldName: 'withdrawalAmt',
                type: 'data',
                width: '120',
                styleName: 'right-cell-text',
                header: {text: '출금금액', styleName: 'center-cell-text blue-font-color'},
                numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            // {
            //     name: 'note', fieldName: 'note', type: 'data', width: '150', styleName: 'left-cell-text'
            //     , header: {text: 'Note.', styleName: 'center-cell-text'}, renderer: {
            //         showTooltip: true
            //     }
            // },
            {
                name: 'remark', fieldName: 'remark', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '비고', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
        ];
        this.withdrawalDataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.withdrawalDataProvider,
            'withdrawal',
            this.withdrawalColumns,
            this.withdrawalFields,
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
        const validationList = ['account', 'type', 'withdrawalDate'];
        this._realGridsService.gfn_ValidationOption(this.gridList, validationList);
        this._realGridsService.gfn_PopUp(this.isMobile, this.isExtraSmall, this.gridList, this.withdrawalDataProvider, this.withdrawalColumns, this._matDialogPopup, this._unsubscribeAll, this._changeDetectorRef);

        // 셀 edit control
        this.gridList.setCellStyleCallback((grid, dataCell) => {
            //추가시
            if (dataCell.item.rowState === 'created') {
                if (dataCell.dataColumn.fieldName === 'withdrawal'||
                    dataCell.dataColumn.fieldName === 'account'||
                    dataCell.dataColumn.fieldName === 'accountNm'||
                    dataCell.dataColumn.fieldName === 'withdrawalFlag') {
                    return {editable: false};
                } else {
                    return {editable: true};
                }
            }else{

                const withdrawalFlag = grid.getValue(dataCell.index.itemIndex, 'withdrawalFlag');
                if(withdrawalFlag === 'Y'){
                    return {editable: false};
                }else{

                    if (dataCell.dataColumn.fieldName === 'deposit'||
                        dataCell.dataColumn.fieldName === 'account'||
                        dataCell.dataColumn.fieldName === 'accountNm'||
                        dataCell.dataColumn.fieldName === 'withdrawalFlag') {
                        return {editable: false};
                    } else {
                        return {editable: true};
                    }
                }
            }

        });

        this.gridList.setRowStyleCallback((grid, item, fixed) => {
        });

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                const rtn = this._withdrawalService.getHeader(this.withdrawalPagenation.page, this.withdrawalPagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
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
    }

    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._withdrawalService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'withdrawalDate', this.orderBy, this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.withdrawalDataProvider);
    }

    setGridData(): void {
        this.withdrawals$ = this._withdrawalService.withdrawals$;
        this._withdrawalService.withdrawals$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((withdrawals: any) => {
                // Update the counts
                if (withdrawals !== null) {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.withdrawalDataProvider, withdrawals);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
    selectHeader(): void {

        this.isSearchForm = true;
        this.searchSetValue();
        const rtn = this._withdrawalService.getHeader(0, 40, 'withdrawalDate', 'desc', this.searchForm.getRawValue());
        //this.setGridData();
        this.selectCallBack(rtn);
    }

    searchSetValue(): void {
        this.searchForm.patchValue({'start': this.searchForm.get('range').value.start});
        this.searchForm.patchValue({'end': this.searchForm.get('range').value.end});
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

    //페이징
    pageEvent($event: PageEvent): void {
        const rtn = this._withdrawalService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'withdrawalDate', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '출금 목록');
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.withdrawalDataProvider, ex.withdrawal);
            this._withdrawalService.withdrawalPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((withdrawalPagenation: WithdrawalPagenation) => {
                    // Update the pagination
                    this.withdrawalPagenation = withdrawalPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if(ex.withdrawal.length < 1){
                this._functionService.cfn_alert('검색된 정보가 없습니다.');
            }
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    addWithdrawal(){
        const now = new Date();
        const date = formatDate(new Date(now.setDate(now.getDate())), 'yyyy-MM-dd', 'en');

        const values = [
            '', 'N', '', '', '', '', '', '', '', date, 0, '', '', '', '', '', '', '', '', '', '', ''
        ];

        this._realGridsService.gfn_AddRow(this.gridList, this.withdrawalDataProvider, values);
    }

    delWithdrawal(): boolean {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.withdrawalDataProvider);

        if (checkValues.length < 1) {
            this._functionService.cfn_alert('삭제 대상을 선택해주세요.');
            return;
        }
        checkValues.forEach((r) => {
            if(r.withdrawalFlag === 'Y'){

                this._functionService.cfn_alert('마감된 내역은 수정 및 삭제할 수 없습니다.');
                this.selectHeader();
                return;
            }
        });

        this._realGridsService.gfn_DelRow(this.gridList, this.withdrawalDataProvider);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    saveWithdrawal() {
        if (this._realGridsService.gfn_ValidationRows(this.gridList, this._functionService)) {
            return;
        }
        let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.withdrawalDataProvider);

        let detailCheck = false;

        if (rows.length === 0) {
            this._functionService.cfn_alert('수정된 행이 존재하지 않습니다.');
            detailCheck = true;
        }
        rows.forEach((r) => {
            if(r.withdrawalFlag === 'Y'){

                this._functionService.cfn_alert('마감된 내역은 수정 및 삭제할 수 없습니다.');
                detailCheck = true;
            }
        });
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
                    this._withdrawalService.saveWithdrawal(rows)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((deposit: any) => {
                            this._functionService.cfn_loadingBarClear();
                            this.alertMessage(deposit);
                            this._changeDetectorRef.markForCheck();
                        });
                }
            });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    alertMessage(param: any): void {
        if (param.status !== 'SUCCESS') {
            this._functionService.cfn_alert(param.msg);
        } else {
            //this.backPage();
            this._functionService.cfn_alert('정상적으로 처리되었습니다.');
            this.selectHeader();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    closeWithdrawal(){
        let rows = this._realGridsService.gfn_GetCheckRows(this.gridList, this.withdrawalDataProvider);

        let detailCheck = false;

        if (rows.length === 0) {
            this._functionService.cfn_alert('선택된 행이 존재하지 않습니다.');
            detailCheck = true;
        }
        if (detailCheck) {
            return;
        }
        const confirmation = this._teamPlatConfirmationService.open({
            title: '',
            message: '마감하시겠습니까?',
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
                    this._withdrawalService.closeWithdrawal(rows)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((deposit: any) => {
                            this._functionService.cfn_loadingBarClear();
                            this.alertMessage(deposit);
                            this._changeDetectorRef.markForCheck();
                        });
                }
            });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
}
