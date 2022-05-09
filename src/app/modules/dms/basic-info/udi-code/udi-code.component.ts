import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {FuseRealGridService} from '../../../../../@teamplat/services/realgrid';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {Columns} from '../../../../../@teamplat/services/realgrid/realgrid.types';
import {UdiCodeService} from './udi-code.service';
import {takeUntil} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {UdiCode, UdiCodePagination} from './udi-code.types';
import {FunctionService} from '../../../../../@teamplat/services/function';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {DeviceDetectorService} from 'ngx-device-detector';
import {MatSort} from '@angular/material/sort';
import {DetailItemsComponent} from '../items/detail-items/detail-items.component';
import {MatDialog} from '@angular/material/dialog';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {TeamPlatConfirmationService} from "../../../../../@teamplat/services/confirmation";

@Component({
    selector: 'app-udi-code',
    templateUrl: './udi-code.component.html',
    styleUrls: ['./udi-code.component.scss']
})
export class UdiCodeComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    udiCodes$: Observable<UdiCode[]>;
    drawerMode: 'over' | 'side' = 'over';
    orderBy: any = 'asc';
    isMobile: boolean = false;
    isLoading: boolean = false;
    drawerOpened: boolean = false;
    searchForm: FormGroup;
    pagenation: UdiCodePagination | null = null;
    itemGrades: CommonCode[] = [];
    udiYn: CommonCode[] = [];
    itemUnit: CommonCode[] = [];
    taxGbn: CommonCode[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gridList: RealGrid.GridView;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    udiCodeDataProvider: RealGrid.LocalDataProvider;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    udiCodeColumns: Columns[];
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    udiCodeFields: DataFieldObject[] = [
        {fieldName: 'udiDiCode', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        // {fieldName: 'standard', dataType: ValueType.TEXT},
        // {fieldName: 'rcperSalaryCode', dataType: ValueType.TEXT},
        {fieldName: 'fomlInfo', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'itemNoFullname', dataType: ValueType.TEXT},
        // {fieldName: 'udiYn', dataType: ValueType.TEXT},
        // {fieldName: 'supplier', dataType: ValueType.TEXT},
        // {fieldName: 'supplierNm', dataType: ValueType.TEXT},
        {fieldName: 'manufacturer', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'convertedQty', dataType: ValueType.NUMBER},
        {fieldName: 'medDevSeq', dataType: ValueType.TEXT},
        {fieldName: 'mebTypeSeq', dataType: ValueType.TEXT},
        // {fieldName: 'taxGbn', dataType: ValueType.TEXT},
        // {fieldName: 'buyPrice', dataType: ValueType.NUMBER},
        // {fieldName: 'salesPrice', dataType: ValueType.NUMBER}
    ];
    constructor(
        private _realGridsService: FuseRealGridService,
        private _udiCodeService: UdiCodeService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _utilService: FuseUtilsService,
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog,
        public _matDialogPopup: MatDialog,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _deviceService: DeviceDetectorService,
        private _codeStore: CodeStore,
        private _functionService: FunctionService,
        private readonly breakpointObserver: BreakpointObserver) {
        this.taxGbn = _utilService.commonValue(_codeStore.getValue().data, 'TAX_GBN');
        this.itemUnit = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_UNIT');
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_GRADE');
        this.udiYn = _utilService.commonValue(_codeStore.getValue().data, 'UDI_YN');
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnInit(): void {
        // getUdiCodes
        this.udiCodes$ = this._udiCodeService.udiCodes$;
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            itemGrade: ['ALL'],
            itemNm: [''],
            fomlInfo: [''],
            itemCd: [''],
            searchCondition: ['100'],
            searchText: [''],
            range: [{}]
        });

        const itemGradesvalues = [];
        const itemGradeslables = [];
        this.itemGrades.forEach((param: any) => {
            itemGradesvalues.push(param.id);
            itemGradeslables.push(param.name);
        });

        const udiYnvalues = [];
        const udiYnlables = [];
        this.udiYn.forEach((param: any) => {
            udiYnvalues.push(param.id);
            udiYnlables.push(param.name);
        });

        const taxGbnvalues = [];
        const taxGbnlables = [];
        this.taxGbn.forEach((param: any) => {
            taxGbnvalues.push(param.id);
            taxGbnlables.push(param.name);
        });

        //그리드 컬럼
        this.udiCodeColumns = [
            {
                name: 'udiDiCode', fieldName: 'udiDiCode', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: 'UDI DI 코드', styleName: 'center-cell-text red-font-color'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'center-cell-text red-font-color'}
                , renderer: 'itemGrdPopup'
                , popUpObject:
                    {
                        popUpId: 'P$_UDI_ITEM',
                        popUpHeaderText: '품목 조회 - UDI',
                        popUpDataSet: 'itemCd:itemCd|itemNm:itemNm|fomlInfo:fomlInfo|' +
                            'itemNoFullname:itemNoFullname|itemGrade:itemGrade|manufacturer:manufacturer',
                    }
            },
            {
                name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'fomlInfo', fieldName: 'fomlInfo', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '모델명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemGrade', fieldName: 'itemGrade', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '등급', styleName: 'center-cell-text'},
                values: itemGradesvalues,
                labels: itemGradeslables,
                lookupDisplay: true, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemNoFullname', fieldName: 'itemNoFullname', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목허가번호', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'manufacturer', fieldName: 'manufacturer', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '제조사', styleName: 'center-cell-text'}, renderer: {
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
                header: {text: '환산수량', styleName: 'center-cell-text'}
                ,
                numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            }

        ];

        // 그리드 Provider
        this.udiCodeDataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        //그리드 옵션
        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.udiCodeDataProvider,
            'udiCode',
            this.udiCodeColumns,
            this.udiCodeFields,
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
        const validationList = ['udiDiCode', 'itemCd'];
        this._realGridsService.gfn_ValidationOption(this.gridList, validationList);

        //정렬
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                if(this._realGridsService.gfn_GridDataCnt(this.gridList, this.udiCodeDataProvider)){
                    const rtn = this._udiCodeService.getUdiCodes(this.pagenation.page, this.pagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
                    this.selectCallBack(rtn);
                }
            };
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellDblClicked = (grid, clickData) => {
            if (clickData.cellType !== 'header') {
                if (clickData.cellType !== 'head') {
                    if(grid.getValues(clickData.dataRow) !== null){
                        if (!this.isMobile) {
                            // const d = this._matDialog.open(DetailItemsComponent, {
                            //     autoFocus: false,
                            //     disableClose: true,
                            //     data: {
                            //         selectedItem: grid.getValues(clickData.dataRow)
                            //     },
                            // });
                            // d.afterClosed().subscribe(() => {
                            //     this.searchUdiCode();
                            // });

                        } else {
                            // const d = this._matDialog.open(DetailItemsComponent, {
                            //     data: {
                            //         selectedItem: grid.getValues(clickData.dataRow)
                            //     },
                            //     autoFocus: false,
                            //     width: 'calc(100% - 50px)',
                            //     maxWidth: '100vw',
                            //     maxHeight: '80vh',
                            //     disableClose: true
                            // });
                            // const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                            //     if (size.matches) {
                            //         d.updateSize('calc(100vw - 10px)', '');
                            //     } else {
                            //     }
                            // });
                            // d.afterClosed().subscribe(() => {
                            //     smallDialogSubscription.unsubscribe();
                            // });
                        }
                    }
                }
            }
        };

        // 셀 edit control
        this.gridList.setCellStyleCallback((grid, dataCell) => {

            //추가시
            if (dataCell.item.rowState === 'created') {

                if (dataCell.dataColumn.fieldName === 'itemCd' ||
                    dataCell.dataColumn.fieldName === 'itemNm' ||
                    dataCell.dataColumn.fieldName === 'fomlInfo'||
                    dataCell.dataColumn.fieldName === 'itemGrade'||
                    dataCell.dataColumn.fieldName === 'itemNoFullname'||
                    dataCell.dataColumn.fieldName === 'manufacturer') {
                    return {editable: false};
                } else {
                    return {editable: true};
                }
            }else{

                this._realGridsService.gfn_PopUpBtnHide('itemGrdPopup');
                if (dataCell.dataColumn.fieldName === 'udiDiCode' ||
                    dataCell.dataColumn.fieldName === 'itemCd' ||
                    dataCell.dataColumn.fieldName === 'itemNm' ||
                    dataCell.dataColumn.fieldName === 'fomlInfo'||
                    dataCell.dataColumn.fieldName === 'itemGrade'||
                    dataCell.dataColumn.fieldName === 'itemNoFullname'||
                    dataCell.dataColumn.fieldName === 'manufacturer') {
                    return {editable: false};
                } else {
                    return {editable: true};
                }
            }
        });

        // eslint-disable-next-line max-len
        this._realGridsService.gfn_PopUp(this.isMobile, this.isExtraSmall, this.gridList, this.udiCodeDataProvider, this.udiCodeColumns, this._matDialogPopup, this._unsubscribeAll, this._changeDetectorRef, []);

        //페이지 라벨
        this._paginator._intl.itemsPerPageLabel = '';
        this._changeDetectorRef.markForCheck();
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.udiCodeDataProvider);
    }

    searchUdiCode(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.udiCodeDataProvider, true);
        const rtn = this._udiCodeService.getUdiCodes(0, 40, 'addDate', 'desc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.udiCodeDataProvider, ex.products);
            this._udiCodeService.pagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((udiCodePagination: UdiCodePagination) => {
                    // Update the pagination
                    this.pagenation = udiCodePagination;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if(ex.products.length < 1){
                this._functionService.cfn_alert('검색된 정보가 없습니다.');
            }
        }).then((ex2) =>{
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.udiCodeDataProvider, false);
        });
    }

    selectHeader(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.udiCodeDataProvider, true);
        const rtn = this._udiCodeService.getUdiCodes(0, 40, 'addDate', 'desc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.selectHeader();
        }
    }

    //엑셀 다운로드
    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, 'UDI DI 코드 내역');
    }

    //페이징
    pageEvent($event: PageEvent): void {
        const rtn = this._udiCodeService.getUdiCodes(this._paginator.pageIndex, this._paginator.pageSize, 'addDate', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }
    excelSelect(files: FileList) {

        const file = files[0];
        if(typeof file === 'undefined'){
            return;
        }

        console.log(file);

    }

    // @ts-ignore
    addRow(): boolean {

        const values = [
            '','','','','','','','',1
        ];

        this._realGridsService.gfn_AddRow(this.gridList, this.udiCodeDataProvider, values);
    }

    delRow(): boolean {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.udiCodeDataProvider);

        if (checkValues.length < 1) {
            this._functionService.cfn_alert('삭제 대상을 선택해주세요.');
            return;
        }

        this._realGridsService.gfn_DelRow(this.gridList, this.udiCodeDataProvider);
    }

    saveUdiDiCode() {

        if (this._realGridsService.gfn_ValidationRows(this.gridList, this._functionService)) {
            return;
        }

        let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.udiCodeDataProvider);

        console.log(rows);

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
                    this._udiCodeService.saveUdiDiCode(rows)
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
}
