import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Columns} from "../../../../../@teamplat/services/realgrid/realgrid.types";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {merge, Observable, Subject} from "rxjs";
import {FuseRealGridService} from "../../../../../@teamplat/services/realgrid";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {TeamPlatConfirmationService} from "../../../../../@teamplat/services/confirmation";
import {DeviceDetectorService} from "ngx-device-detector";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {CommonCode, FuseUtilsService} from "../../../../../@teamplat/services/utils";
import {CodeStore} from "../../../../core/common-code/state/code.store";
import {MatDialog} from "@angular/material/dialog";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {CommonCodeService} from "./common-code.service";
import {CommonCodePagenation} from "./common-code.types";
@Component({
    selector: 'app-admin-common-code',
    templateUrl: 'common-code.component.html',
    styleUrls: ['./common-code.component.scss']
})
export class CommonCodeComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    drawerMode: 'over' | 'side' = 'over';
    orderBy: any = 'asc';
    drawerOpened: boolean = false;
    isMobile: boolean = false;
    isLoading: boolean = false;
    pagenation: any | null = null;
    useYn: CommonCode[] = null;
    detailUseYn: CommonCode[] = null;
    searchForm: FormGroup;
    columns: Columns[];
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gridList: RealGrid.GridView;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    dataProvider: RealGrid.LocalDataProvider;// @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    fields: DataFieldObject[] = [
        {fieldName: 'mainCd', dataType: ValueType.TEXT},
        {fieldName: 'descr', dataType: ValueType.TEXT},
        {fieldName: 'useYn', dataType: ValueType.TEXT},
    ];
    detailColumns: Columns[];
    // @ts-ignore
    detailGridList: RealGrid.GridView;
    // @ts-ignore
    detailDataProvider: RealGrid.LocalDataProvider;
    // @ts-ignore
    detailFields: DataFieldObject[] = [
        {fieldName: 'mainCd', dataType: ValueType.TEXT},
        {fieldName: 'subCd', dataType: ValueType.TEXT},
        {fieldName: 'descr', dataType: ValueType.TEXT},
        {fieldName: 'udf1', dataType: ValueType.TEXT},
        {fieldName: 'udf2', dataType: ValueType.TEXT},
        {fieldName: 'udf3', dataType: ValueType.TEXT},
        {fieldName: 'udf4', dataType: ValueType.TEXT},
        {fieldName: 'udf5', dataType: ValueType.TEXT},
        {fieldName: 'priority', dataType: ValueType.NUMBER},
        {fieldName: 'useYn', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(private _realGridsService: FuseRealGridService,
                private _changeDetectorRef: ChangeDetectorRef,
                private _formBuilder: FormBuilder,
                private _functionService: FunctionService,
                private _utilService: FuseUtilsService,
                private _deviceService: DeviceDetectorService,
                public _matDialogPopup: MatDialog,
                private _commonCodeService: CommonCodeService,
                private _codeStore: CodeStore,
                private _teamPlatConfirmationService: TeamPlatConfirmationService,
                private readonly breakpointObserver: BreakpointObserver)
    {
        this.useYn = this._utilService.commonValue(_codeStore.getValue().data, 'YN_FLAG');
        this.detailUseYn = this._utilService.commonValue(_codeStore.getValue().data, 'YN_FLAG');
        this.isMobile = this._deviceService.isMobile();
    }

    ngAfterViewInit(): void {
        // merge(this._paginator.page).pipe(
        //     switchMap(() => {
        //         this.isLoading = true;
        //         // eslint-disable-next-line max-len
        //         return this._commonCodeService.getCommonCode(this._paginator.pageIndex, this._paginator.pageSize, 'descr', 'desc', this.searchForm.getRawValue());
        //     }),
        //     map(() => {
        //         this.isLoading = false;
        //     })
        // ).subscribe();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.dataProvider);
        this._realGridsService.gfn_Destory(this.detailGridList, this.detailDataProvider);
    }

    ngOnInit(): void {
        this.searchForm = this._formBuilder.group({
            descr: ['']
        });

        const valuesUse = [];
        const lablesUse = [];

        this.useYn.forEach((param: any) => {
            valuesUse.push(param.id);
            lablesUse.push(param.name);
        });

        const detailValuesUse = [];
        const detailLablesUse = [];

        this.detailUseYn.forEach((param: any) => {
            detailValuesUse.push(param.id);
            detailLablesUse.push(param.name);
        });

        this.columns = [
            {
                name: 'mainCd', fieldName: 'mainCd', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '공통 코드', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'descr', fieldName: 'descr', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'useYn', fieldName: 'useYn', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '사용여부', styleName: 'center-cell-text'},
                values: valuesUse,
                labels: lablesUse,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.useYn),
                renderer: {
                    showTooltip: true
                }
            },
        ];
        this.dataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: true,
        };

        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.dataProvider,
            'commonCode',
            this.columns,
            this.fields,
            gridListOption);

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
        const validationList = ['mainCd', 'descr', 'useYn'];
        this._realGridsService.gfn_ValidationOption(this.gridList, validationList);
        this._realGridsService.gfn_PopUp(this.isMobile, this.isExtraSmall, this.gridList, this.dataProvider, this.columns, this._matDialogPopup, this._unsubscribeAll, this._changeDetectorRef);

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                const rtn = this._commonCodeService.getCommonCode(this.pagenation.page, this.pagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
                this.selectCallBack(rtn);
            };
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };

        this.detailColumns = [
            {
                name: 'mainCd', fieldName: 'mainCd', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '공통 코드', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'subCd', fieldName: 'subCd', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '상세 코드', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'descr', fieldName: 'descr', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '상세코드 명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'udf1', fieldName: 'udf1', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: 'udf1', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'udf2', fieldName: 'udf2', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: 'udf2', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'udf3', fieldName: 'udf3', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: 'udf3', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'udf4', fieldName: 'udf4', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: 'udf4', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'udf5', fieldName: 'udf5', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: 'udf5', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'priority', fieldName: 'priority', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '우선순위', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'useYn', fieldName: 'useYn', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '사용여부', styleName: 'center-cell-text'},
                values: detailValuesUse,
                labels: detailLablesUse,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.detailUseYn),
                renderer: {
                    showTooltip: true
                }
            },
        ];

        //그리드 Provider
        this.detailDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const detailGridListOption = {
            stateBar: true,
            checkBar: true,
            footers: true,
        };

        this.detailDataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        //그리드 생성
        this.detailGridList = this._realGridsService.gfn_CreateGrid(
            this.detailDataProvider,
            'commonCodeDetail',
            this.detailColumns,
            this.detailFields,
            detailGridListOption);

        //그리드 옵션
        this.detailGridList.setEditOptions({
            readOnly: false,
            insertable: false,
            appendable: false,
            editable: true,
            updatable: true,
            deletable: true,
            checkable: true,
            softDeleting: true,
        });

        this.detailGridList.deleteSelection(true);
        this.detailGridList.setDisplayOptions({liveScroll: false,});
        this.detailGridList.setCopyOptions({
            enabled: true,
            singleMode: false
        });

        this.detailGridList.setPasteOptions({
            enabled: true,
            startEdit: false,
            commitEdit: true,
            checkReadOnly: true
        });
        this.detailGridList.editOptions.commitByCell = true;
        this.detailGridList.editOptions.validateOnEdited = true;
        this._realGridsService.gfn_EditGrid(this.detailGridList);
        const detailValidationList = ['mainCd', 'subCd', 'descr', 'udf1', 'udf2', 'udf3', 'udf4', 'udf5', 'priority', 'useYn'];
        this._realGridsService.gfn_ValidationOption(this.detailGridList, detailValidationList);
        this._realGridsService.gfn_PopUp(this.isMobile, this.isExtraSmall, this.detailGridList, this.detailDataProvider, this.detailColumns, this._matDialogPopup, this._unsubscribeAll, this._changeDetectorRef);

        //페이지 라벨
        // this._paginator._intl.itemsPerPageLabel = '';

        this._changeDetectorRef.markForCheck();
    }

    select(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.dataProvider, true);
        const rtn = this._commonCodeService.getCommonCode(0, 100, 'descr', 'desc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.select();
        }
    }

    //엑셀 다운로드
    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '공통코드 목록');
    }

    addRow(val: any): void {
        if(val === 'grid') {
            const values = [
                '', '', ''
            ];

            this._realGridsService.gfn_AddRow(this.gridList, this.dataProvider, values);
        } else if(val === 'gridDetail') {
            const values = [
                '', '', '','', '', '','', '', '',''
            ];

            this._realGridsService.gfn_AddRow(this.detailGridList, this.detailDataProvider, values);
        }
    }

    delRow(val: any): void {
        if(val === 'grid') {
            const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.dataProvider);

            if (checkValues.length < 1) {
                this._functionService.cfn_alert('삭제 대상을 선택해주세요.');
                return;
            }

            this._realGridsService.gfn_DelRow(this.gridList, this.dataProvider);
        } else if(val === 'gridDetail') {
            const checkValues = this._realGridsService.gfn_GetCheckRows(this.detailGridList, this.detailDataProvider);

            if (checkValues.length < 1) {
                this._functionService.cfn_alert('삭제 대상을 선택해주세요.');
                return;
            }

            this._realGridsService.gfn_DelRow(this.detailGridList, this.detailDataProvider);
        }
    }

    saveCommonCode(val: any): void {
        if(val === 'grid') {
            if (this._realGridsService.gfn_ValidationRows(this.gridList, this._functionService)) {
                return;
            }

            let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.dataProvider);

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
                        this._commonCodeService.saveCommonCode(rows)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((commonCode: any) => {
                                this._functionService.cfn_loadingBarClear();
                                this.alertMessage(commonCode);
                                this._changeDetectorRef.markForCheck();
                            });
                    }
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();
        } else if(val === 'gridDetail') {
            if (this._realGridsService.gfn_ValidationRows(this.detailGridList, this._functionService)) {
                return;
            }

            let rows = this._realGridsService.gfn_GetEditRows(this.detailGridList, this.detailDataProvider);

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
                        this._commonCodeService.saveDetailCommonCode(rows)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((detailCommonCode: any) => {
                                this._functionService.cfn_loadingBarClear();
                                this.alertMessage(detailCommonCode);
                                this._changeDetectorRef.markForCheck();
                            });
                    }
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    // pageEvent($event: PageEvent): void {
    //     const rtn = this._commonCodeService.getCommonCode(this._paginator.pageIndex, this._paginator.pageSize, 'descr', this.orderBy, this.searchForm.getRawValue());
    //     this.selectCallBack(rtn);
    // }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {
            this._realGridsService.gfn_DataSetGrid(this.gridList, this.dataProvider, ex.commonCode);
            this._commonCodeService.pagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((commonCodePagenation: CommonCodePagenation) => {
                    // Update the pagination
                    this.pagenation = commonCodePagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if(ex.commonCode.length < 1){
                this._functionService.cfn_alert('검색된 정보가 없습니다.');
            }
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.dataProvider, false);
        });
    }

    alertMessage(param: any): void {
        if (param.status === 'SUCCESS') {
            this._functionService.cfn_alert('정상적으로 처리되었습니다.');
            this.select();
        } else if (param.status === 'CANCEL') {

        } else {
            this._functionService.cfn_alert(param.msg);
        }
    }
}
