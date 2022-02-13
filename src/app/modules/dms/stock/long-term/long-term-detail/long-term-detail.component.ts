import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup} from "@angular/forms";
import {FuseRealGridService} from "../../../../../../@teamplat/services/realgrid";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {Columns} from "../../../../../../@teamplat/services/realgrid/realgrid.types";
import {CommonCode, FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {DeviceDetectorService} from "ngx-device-detector";
import {LongTermService} from "../long-term.service";
import {CommonPopupItemsComponent} from "../../../../../../@teamplat/components/common-popup-items";
import {takeUntil} from "rxjs/operators";
import {TeamPlatConfirmationService} from "../../../../../../@teamplat/services/confirmation";
import {FunctionService} from "../../../../../../@teamplat/services/function";
import {LongTermDetailPagenation} from "../long-term.types";
import {MatPaginator, PageEvent} from "@angular/material/paginator";

@Component({
    selector: 'dms-stock-long-term-detail',
    templateUrl: 'long-term-detail.component.html',
    styleUrls: ['long-term-detail.component.scss'],
})
export class LongTermDetailComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    orderBy: any = 'desc';
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    longTermDetailPagenation: LongTermDetailPagenation | null = null;
    isLoading: boolean = false;
    isMobile: boolean = false;
    searchForm: FormGroup;
    itemGrades: CommonCode[] = null;
    longTermType: CommonCode[] = null;
    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    longTermDetailDataProvider: RealGrid.LocalDataProvider;
    longTermDetailColumns: Columns[];
    // @ts-ignore
    longTermDetailFields: DataFieldObject[] = [
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'longTermType', dataType: ValueType.TEXT}
    ];

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public matDialogRef: MatDialogRef<LongTermDetailComponent>,
        private _realGridsService: FuseRealGridService,
        public _matDialogPopup: MatDialog,
        private _longTermService: LongTermService,
        private _formBuilder: FormBuilder,
        private _codeStore: CodeStore,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _functionService: FunctionService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_GRADE');
        this.longTermType = _utilService.commonValue(_codeStore.getValue().data, 'LONGTERM_TYPE');
        this.isMobile = this._deviceService.isMobile();
    }
    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.longTermDetailDataProvider);
    }

    ngOnInit(): void {
        const values = [];
        const lables = [];
        this.itemGrades.forEach((param: any) => {
            values.push(param.id);
            lables.push(param.name);
        });
        const valueTypes = [];
        const lableTypes = [];
        this.longTermType.forEach((param: any) => {
            valueTypes.push(param.id);
            lableTypes.push(param.name);
        });

        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            itemCd: [''], // 품목코드
            itemNm: [''],
        });

        this.longTermDetailColumns = [
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '품목명', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'standard',
                fieldName: 'standard',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text',
                header: {text: '규격', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                },
            },
            {
                name: 'unit',
                fieldName: 'unit',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text',
                header: {text: '단위', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                },
            },
            {
                name: 'itemGrade', fieldName: 'itemGrade', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '품목등급', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                },
                values: values,
                labels: lables,
                lookupDisplay: true,
            },
            {
                name: 'longTermType',
                fieldName: 'longTermType',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text',
                header: {text: '관리유형', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                },
                values: valueTypes,
                labels: lableTypes,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.longTermType)
            },
        ];

        this.longTermDetailDataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        //그리드 옵션
        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.longTermDetailDataProvider,
            'longTermDetail',
            this.longTermDetailColumns,
            this.longTermDetailFields,
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
                const rtn = this._longTermService.getDetail(this.longTermDetailPagenation.page, this.longTermDetailPagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
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

    openItemSearch(): void
    {
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

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '장기재고 유형 설정 목록');
    }

    selectHeader(): void {
        const rtn = this._longTermService.getDetail(0, 40, 'addDate', 'desc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    saveLongTerm(): void {

        let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.longTermDetailDataProvider);

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
                    this._longTermService.saveLongTerm(rows)
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

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.longTermDetailDataProvider, ex.longTermDetail);
            this._longTermService.longTermDetailPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((longTermDetailPagenation: LongTermDetailPagenation) => {
                    // Update the pagination
                    this.longTermDetailPagenation = longTermDetailPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        });
    }

    //페이징
    pageEvent($event: PageEvent): void {
        const rtn = this._longTermService.getDetail(this._paginator.pageIndex, this._paginator.pageSize, 'addDate', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }
}
