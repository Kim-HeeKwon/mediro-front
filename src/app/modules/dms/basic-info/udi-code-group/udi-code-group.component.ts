import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {UdiCodeGroup, UdiCodeGroupPagination} from "./udi-code-group.types";
import {Observable, Subject} from "rxjs";
import {Columns} from "../../../../../@teamplat/services/realgrid/realgrid.types";
import {FuseRealGridService} from "../../../../../@teamplat/services/realgrid";
import {MatDialog} from "@angular/material/dialog";
import {TeamPlatConfirmationService} from "../../../../../@teamplat/services/confirmation";
import {DeviceDetectorService} from "ngx-device-detector";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {UdiCodeGroupService} from "./udi-code-group.service";
import {takeUntil} from "rxjs/operators";
import {MatSort} from "@angular/material/sort";

@Component({
    selector: 'app-udi-code-group',
    templateUrl: './udi-code-group.component.html',
    styleUrls: ['./udi-code-group.component.scss']
})
export class UdiCodeGroupComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    udiCodeGroup$: Observable<UdiCodeGroup[]>;
    drawerMode: 'over' | 'side' = 'over';
    orderBy: any = 'asc';
    drawerOpened: boolean = false;
    isMobile: boolean = false;
    searchForm: FormGroup;
    pagenation: UdiCodeGroupPagination | null = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gridList: RealGrid.GridView;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    udiCodeGroupDataProvider: RealGrid.LocalDataProvider;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    udiCodeGroupColumns: Columns[];
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    udiCodeGroupFields: DataFieldObject[] = [
        {fieldName: 'udiDiCode', dataType: ValueType.TEXT},
        {fieldName: 'udiDiCodeGroup', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'convertedQty', dataType: ValueType.NUMBER},
    ];

    constructor(
        private _realGridsService: FuseRealGridService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _udiCodeGroupService: UdiCodeGroupService,
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog,
        public _matDialogPopup: MatDialog,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _deviceService: DeviceDetectorService,
        private _functionService: FunctionService,
        private readonly breakpointObserver: BreakpointObserver) {
        this.isMobile = this._deviceService.isMobile();
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.udiCodeGroupDataProvider);
    }

    ngOnInit(): void {
        // getUdiCodeGroups
        this.udiCodeGroup$ = this._udiCodeGroupService.udiCodeGroups$;
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            udiDiCode: [''],
            udiDiCodeGroup: [''],
        });

        //그리드 컬럼
        this.udiCodeGroupColumns = [
            {
                name: 'udiDiCode', fieldName: 'udiDiCode', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: 'UDI DI 코드 그룹', styleName: 'center-cell-text red-font-color'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'udiDiCodeGroup',
                fieldName: 'udiDiCodeGroup',
                type: 'data',
                width: '150',
                styleName: 'left-cell-text'
                ,
                header: {text: 'UDI DI 코드', styleName: 'center-cell-text red-font-color'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'unit', fieldName: 'unit', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '단위', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'convertedQty',
                fieldName: 'convertedQty',
                type: 'number',
                width: '120',
                styleName: 'right-cell-text',
                header: {text: '환산수량', styleName: 'center-cell-text'},
                numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            }
        ];

        // 그리드 Provider
        this.udiCodeGroupDataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        //그리드 옵션
        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.udiCodeGroupDataProvider,
            'udiCodeGroup',
            this.udiCodeGroupColumns,
            this.udiCodeGroupFields,
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
        const validationList = ['udiDiCode', 'udiDiCodeGroup'];
        this._realGridsService.gfn_ValidationOption(this.gridList, validationList);

        //정렬
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                if (this._realGridsService.gfn_GridDataCnt(this.gridList, this.udiCodeGroupDataProvider)) {
                    const rtn = this._udiCodeGroupService.getUdiCodeGroups(this.pagenation.page, this.pagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
                    this.selectCallBack(rtn);
                }
            }
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };

        // 셀 edit control
        this.gridList.setCellStyleCallback((grid, dataCell) => {

            //추가시
            if (dataCell.item.rowState === 'created') {
                return {editable: true};
            } else {
                if(dataCell.dataColumn.fieldName === 'udiDiCode' ||
                    dataCell.dataColumn.fieldName === 'udiDiCodeGroup') {
                    return {editable: false};
                } else {
                    return {editable: true};
                }
            }
        });

        // eslint-disable-next-line max-len
        this._realGridsService.gfn_PopUp(this.isMobile, this.isExtraSmall, this.gridList, this.udiCodeGroupDataProvider, this.udiCodeGroupColumns, this._matDialogPopup, this._unsubscribeAll, this._changeDetectorRef, []);

        //페이지 라벨
        this._paginator._intl.itemsPerPageLabel = '';
        this._changeDetectorRef.markForCheck();
    }

    searchUdiCodeGroup(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.udiCodeGroupDataProvider, true);
        const rtn = this._udiCodeGroupService.getUdiCodeGroups(0, 40, 'udiDiCode', 'desc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {
            this._realGridsService.gfn_DataSetGrid(this.gridList, this.udiCodeGroupDataProvider, ex.products);
            this._udiCodeGroupService.pagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((udiCodeGroupPagination: UdiCodeGroupPagination) => {
                    // Update the pagination
                    this.pagenation = udiCodeGroupPagination;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if (ex.products.length < 1) {
                this._functionService.cfn_alert('검색된 정보가 없습니다.');
            }
        }).then((ex2) => {
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.udiCodeGroupDataProvider, false);
        });
    }

    selectHeader(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.udiCodeGroupDataProvider, true);
        const rtn = this._udiCodeGroupService.getUdiCodeGroups(0, 40, 'udiDiCode', 'desc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.selectHeader();
        }
    }

    //엑셀 다운로드
    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, 'UDI DI 포장 내역');
    }

    // @ts-ignore
    addRow(): boolean {

        const values = [
            '', '', '', 1
        ];

        this._realGridsService.gfn_AddRow(this.gridList, this.udiCodeGroupDataProvider, values);
    }

    delRow(): boolean {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.udiCodeGroupDataProvider);

        if (checkValues.length < 1) {
            this._functionService.cfn_alert('삭제 대상을 선택해주세요.');
            return;
        }

        this._realGridsService.gfn_DelRow(this.gridList, this.udiCodeGroupDataProvider);
    }

    saveUdiDiCodeGroup(): void {

        if (this._realGridsService.gfn_ValidationRows(this.gridList, this._functionService)) {
            return;
        }

        let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.udiCodeGroupDataProvider);

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
                    this._udiCodeGroupService.saveUdiDiCodeGroup(rows)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((order: any) => {
                            this._functionService.cfn_loadingBarClear();
                            this.alertMessage(order);
                            this._changeDetectorRef.markForCheck();
                        });
                }
            });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    alertMessage(param: any): void {
        if (param.status === 'SUCCESS') {
            this._functionService.cfn_alert('정상적으로 처리되었습니다.');
            this.selectHeader();
        } else if (param.status === 'CANCEL') {

        } else {
            this._functionService.cfn_alert(param.msg);
        }
    }

    pageEvent($event: PageEvent): void {
        const rtn = this._udiCodeGroupService.getUdiCodeGroups(this._paginator.pageIndex, this._paginator.pageSize, 'udiDiCode', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }
}
