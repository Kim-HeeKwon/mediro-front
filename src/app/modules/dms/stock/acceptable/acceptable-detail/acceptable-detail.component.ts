import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {FormBuilder, FormGroup} from "@angular/forms";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FuseRealGridService} from "../../../../../../@teamplat/services/realgrid";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {DeviceDetectorService} from "ngx-device-detector";
import {CommonCode, FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {AcceptableService} from "../acceptable.service";
import {CommonPopupItemsComponent} from "../../../../../../@teamplat/components/common-popup-items";
import {takeUntil} from "rxjs/operators";
import {AcceptableDetailPagenation} from "../acceptable.types";
import {Columns} from "../../../../../../@teamplat/services/realgrid/realgrid.types";
import {MatPaginator} from "@angular/material/paginator";
import {TeamPlatConfirmationService} from "../../../../../../@teamplat/services/confirmation";
import {FunctionService} from "../../../../../../@teamplat/services/function";

@Component({
    selector: 'dms-stock-acceptable-detail',
    templateUrl: 'acceptable-detail.component.html',
    styleUrls: ['acceptable-detail.component.scss'],
})
export class AcceptableDetailComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    orderBy: any = 'desc';
    acceptableDetailPagenation: AcceptableDetailPagenation | null = null;
    isLoading: boolean = false;
    isMobile: boolean = false;
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    itemGrades: CommonCode[] = null;
    acceptableType: CommonCode[] = null;
    searchForm: FormGroup;
    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    acceptableDetailDataProvider: RealGrid.LocalDataProvider;
    acceptableDetailColumns: Columns[];
    // @ts-ignore
    acceptableDetailFields: DataFieldObject[] = [
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'acceptableType', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _realGridsService: FuseRealGridService,
        private _acceptableService: AcceptableService,
        public matDialogRef: MatDialogRef<AcceptableDetailComponent>,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _functionService: FunctionService,
        private _codeStore: CodeStore,
        public _matDialogPopup: MatDialog,
        private _formBuilder: FormBuilder,
        private _deviceService: DeviceDetectorService,
        private _changeDetectorRef: ChangeDetectorRef,
        private readonly breakpointObserver: BreakpointObserver,
        private _utilService: FuseUtilsService) {
        this.isMobile = this._deviceService.isMobile();
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_GRADE');
        this.acceptableType = _utilService.commonValue(_codeStore.getValue().data, 'ACCEPTABLE_TYPE');
    }
    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.acceptableDetailDataProvider);
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            itemCd: [''],
            itemNm: [''],
        });
        const values = [];
        const lables = [];
        this.itemGrades.forEach((param: any) => {
            values.push(param.id);
            lables.push(param.name);
        });
        const valueTypes = [];
        const lableTypes = [];
        this.acceptableType.forEach((param: any) => {
            valueTypes.push(param.id);
            lableTypes.push(param.name);
        });

        //그리드 컬럼
        this.acceptableDetailColumns = [
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '품목명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'standard', fieldName: 'standard', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '규격', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'unit', fieldName: 'unit', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '단위', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemGrade', fieldName: 'itemGrade', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '품목등급', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                },
                values: values,
                labels: lables,
                lookupDisplay: true,
            },
            {
                name: 'acceptableType', fieldName: 'acceptableType', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '가납기간 설정', styleName: 'center-cell-text'},
                values: valueTypes,
                labels: lableTypes,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.acceptableType), renderer: {
                    showTooltip: true
                }
            },
        ];
        this.acceptableDetailDataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        //그리드 옵션
        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.acceptableDetailDataProvider,
            'acceptableDetail',
            this.acceptableDetailColumns,
            this.acceptableDetailFields,
            gridListOption,
        );

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
            if (dataCell.dataColumn.fieldName === 'itemCd' ||
                dataCell.dataColumn.fieldName === 'itemNm' ||
                dataCell.dataColumn.fieldName === 'standard' ||
                dataCell.dataColumn.fieldName === 'unit' ||
                dataCell.dataColumn.fieldName === 'itemGrade') {
                return {editable: false};
            }
        });
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                const rtn = this._acceptableService.getDetail(this.acceptableDetailPagenation.page, this.acceptableDetailPagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
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

    openItemSearch() {
        if (!this.isMobile) {

            const popup = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup: 'P$_ALL_ITEM',
                    headerText: '품목 조회',
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });

            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        this.searchForm.patchValue({'itemCd': result.itemCd});
                        this.searchForm.patchValue({'itemNm': result.itemNm});
                        this._changeDetectorRef.markForCheck();
                    }
                });
        } else {
            const popup = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup: 'P$_ALL_ITEM',
                    headerText: '품목 조회'
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
                        this.searchForm.patchValue({'itemCd': result.itemCd});
                        this.searchForm.patchValue({'itemNm': result.itemNm});
                    }
                });
        }
    }

    excelExport() {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '가납재고 설정 목록');
    }

    selectHeader() {
        const rtn = this._acceptableService.getDetail(0, 40, 'addDate', 'desc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.acceptableDetailDataProvider, ex.acceptableDetail);
            this._acceptableService.acceptableDetailPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((acceptableDetailPagenation: AcceptableDetailPagenation) => {
                    // Update the pagination
                    this.acceptableDetailPagenation = acceptableDetailPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        });
    }

    saveAcceptable() {
        let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.acceptableDetailDataProvider);

        let detailCheck = false;

        if(rows.length < 1){
            this._functionService.cfn_alert('수정된 정보가 존재하지 않습니다.');
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
                    this._acceptableService.saveAcceptable(rows)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((stock: any) => {
                            this._functionService.cfn_loadingBarClear();
                            this.alertMessage(stock);
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
}
