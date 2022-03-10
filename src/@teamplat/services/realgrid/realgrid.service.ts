import {ChangeDetectorRef, Injectable} from "@angular/core";
import RealGrid, {GridView, IndicatorValue, LocalDataProvider} from "realgrid";
import {CommonCode} from "../utils";
import {FunctionService} from "../function";
import {Columns} from "./realgrid.types";
import {CommonPopupItemsComponent} from "../../components/common-popup-items";
import {takeUntil} from "rxjs/operators";
import {MatDialog} from "@angular/material/dialog";
import {BehaviorSubject, Subject} from "rxjs";
import {Common} from "../../providers/common/common";
import {CommonExcelComponent} from "../../components/common-excel";
import {Estimate} from "../../../app/modules/dms/estimate-order/estimate/estimate.types";
import {replace} from "lodash-es";
import {DeviceDetectorService} from "ngx-device-detector";
@Injectable({
    providedIn: 'root'
})
export class FuseRealGridService {
    isMobile: boolean = false;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(private _common: Common,
                public _matDialogPopup: MatDialog,
                private _deviceService: DeviceDetectorService,)
    {
        this.isMobile = this._deviceService.isMobile();
    }

    // 그리드 생성 전 Provider 생성
    // eslint-disable-next-line @typescript-eslint/naming-convention
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/naming-convention
    gfn_CreateDataProvider(editOption?: boolean): RealGrid.LocalDataProvider{
        const dataProvider = new RealGrid.LocalDataProvider(false);

        if(editOption){
            dataProvider.setOptions({
                softDeleting: true,
                deleteCreated: true
            });
        }
        return dataProvider;
    }
    // 그리드 생성
    // eslint-disable-next-line @typescript-eslint/member-ordering,@typescript-eslint/naming-convention
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/naming-convention
    gfn_CreateGrid(dataProvider: RealGrid.LocalDataProvider, id: string, columns: any, fields: any, option?: any, columnLayout?: any, group?: any, displayOptions?: any): RealGrid.GridView{
        const gridView = new RealGrid.GridView(id);
        gridView.setDataSource(dataProvider);
        dataProvider.setFields(fields);
        gridView.setColumns(columns);
        if(columnLayout){
            gridView.setColumnLayout(columnLayout);
        }
        if(group){
            gridView.groupPanel.visible = false;
            gridView.groupBy(group);
            gridView.setRowGroup({
                mergeMode: true,
            });
        }
        if(displayOptions){
            gridView.setDisplayOptions(displayOptions);
        }
        gridView.displayOptions.emptyMessage = '표시할 데이터가 없습니다.';

        gridView.footers.visible = false;
        //상태바
        gridView.setStateBar({visible: false});
        //체크바
        gridView.setCheckBar({visible: false});

        gridView.undoable = true;

        if(option !== undefined){
            if(option.footers){gridView.footers.visible = option.footers;}
            if(option.stateBar){gridView.setStateBar({visible: option.stateBar});}
            if(option.checkBar){gridView.setCheckBar({visible: option.checkBar});}
        }
        /**
         * 그리드 기본 설정
         */
        if(this.isMobile) {
            gridView.header.height = 40;
            gridView.displayOptions.rowHeight = 40;
        }else {
            gridView.header.height = 27;
            gridView.displayOptions.rowHeight = 27;
        }
        //인디케이터 (NO)
        gridView.setRowIndicator({
            visible: true, displayValue: IndicatorValue.INDEX, zeroBase: false,
            headText: 'No',
            footText: ''});
        gridView.setContextMenu([
            {
                label: '열 고정',
                tag: 'fixedCol'
            }, {
                label: '행 고정',
                tag: 'fixedRow'
            }, {
                label: '열 고정 취소',
                tag: 'fixedColCancel'
            },{
                label: '행 고정 취소',
                tag: 'fixedRowCancel'
            },{
                label: '전체 취소',
                tag: 'all'
            },
        ]);
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        gridView.onContextMenuItemClicked = ((grid, item, clickData) => {
            if (item.tag === 'fixedCol') {
                const count = grid.getColumnProperty(clickData.column, 'displayIndex') + 1;
                grid.setFixedOptions({ colCount: count });
            } else if (item.tag === 'fixedRow') {
                const count = clickData.itemIndex + 1;
                grid.setFixedOptions({ rowCount: count });
            } else if (item.tag === 'fixedColCancel') {
                grid.setFixedOptions({ colCount: 0 });
            } else if (item.tag === 'fixedRowCancel') {
                grid.setFixedOptions({ rowCount: 0 });
            } else if (item.tag === 'all') {
                grid.setFixedOptions({ colCount: 0, rowCount: 0 });
            };
        });

        //정렬
        gridView.sortingOptions.enabled = false;
        // @ts-ignore
        gridView.sortingOptions.handleVisibility = 'always';
        //컬럼 move
        gridView.displayOptions.columnMovable = true;

        return gridView;
    }

    // 데이터 셋
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/naming-convention
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/explicit-function-return-type
    gfn_DataSetGrid(gridView: RealGrid.GridView, dataProvider: RealGrid.LocalDataProvider, data: any): void {
        if(data){

            dataProvider.clearRows();

            //dataProvider.setRows(data);

            dataProvider.fillJsonData(data, { fillMode: 'set' });

            // @ts-ignore
            gridView.refresh();
        }
    }

    // 그리드 콤보 박스
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/naming-convention
    gfn_ComboBox(combo: CommonCode[]): any{
        const rtnCombo = {
            type: 'dropdown',
            dropDownCount: combo.length,
            domainOnly: true,
            values: [],
            labels: []
        };
        combo.forEach((c: any) => {
            rtnCombo.values.push(c.id);
            rtnCombo.labels.push(c.name);
        });

        return rtnCombo;
    }

    // 필터
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/naming-convention
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/explicit-function-return-type
    gfn_FilterGrid(gridView: RealGrid.GridView, columnId: any, filters: any){
        gridView.setColumnFilters(columnId, filters);
        //gridView.clearColumnFilters(columnId);
    }

    // 자동 필터
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/naming-convention
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/explicit-function-return-type
    gfn_AutoFilterGrid(gridView: RealGrid.GridView, columnId: any, bool: boolean){
        gridView.setColumnProperty(columnId, 'autoFilter', bool);
        //gridView.clearColumnFilters(columnId);
    }

    // 엑셀 업로드
    // eslint-disable-next-line @typescript-eslint/naming-convention
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/naming-convention
    gfn_ExcelImportGrid(excelType: string): void{

        const searchParam = {};
        searchParam['order'] = '';
        searchParam['sort'] = '';
        const pageParam = {
            page: 1,
            size: 10,
        };
        searchParam['excelType'] = excelType;

        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        const rtn = new Promise((resolve, reject) => {
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/common/excel/excel-config-list')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        resolve(response.data);
                    }
                }, reject);
        });
        rtn.then((l) =>{
            const popup =this._matDialogPopup.open(CommonExcelComponent, {
                data: {
                    jsonData: l,
                    excelType: excelType
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });
        });

    }

    // 엑셀 다운로드
    // eslint-disable-next-line @typescript-eslint/naming-convention
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/naming-convention
    gfn_ExcelExportGrid(gridView: RealGrid.GridView, fileName?: string, showColumns?: any, hideColumns?: any): void{

        if(fileName === undefined){
            fileName = 'Excel';
        }

        gridView.exportGrid({
            exportSeriesColumn: true,
            lookupDisplay: true,
            type: 'excel',
            target: 'local',
            fileName: fileName + '.xlsx',
            showProgress: true,
            compatibility: true,
            showColumns: showColumns,
            hideColumns: hideColumns,
            // documentTitle : { //제목
            //     message: '리얼그리드 제목1',
            //     visible: true,
            //     spaceTop: 1,
            //     spaceBottom: 0,
            //     height: 60,
            //     styleName: 'documentStyle'
            // },
            // documentSubtitle : { //부제
            //     message: '작성자 : 리얼그리드',
            //     작성일 : '',
            //     visible: true,
            //     height: 60
            // },
            // documentTail : { //꼬릿말
            //     message: '리얼그리드 꼬릿말',
            //     visible: true,
            //     height: 60
            // },
            applyDynamicStyles: true,
            sheetName: fileName,
            progressMessage: '엑셀 Export중입니다.',
            // exportGrids: [
            //     { grid: gridView, sheetName: '거래처' },
            //     { grid: gridView, sheetName: '거래처2' }
            // ]
        });
    }

    // 그리드 Destory
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/naming-convention
    gfn_Destory(gridList: RealGrid.GridView, dataProvider: RealGrid.LocalDataProvider): void {

        gridList.cancel();

        //데이터 초기화
        dataProvider.clearRows();

        //grid, provider 초기화
        gridList.destroy();
        dataProvider.destroy();

        //LocalDataProvider와 GridView 객체 초기화
        gridList = null;
        dataProvider = null;
    }

    // 체크 된 행 가져오기
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/naming-convention
    gfn_GetCheckRows(gridView: RealGrid.GridView, dataProvider: RealGrid.LocalDataProvider): any {
        gridView.commit();
        const rows = [];
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for(let i=0; i<gridView.getCheckedRows().length; i++){
            rows.push(dataProvider.getJsonRow(gridView.getCheckedRows()[i]));
        }
        return rows;
    }

    // 전체 데이터 가져오기
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/naming-convention
    gfn_GetRows(gridView: RealGrid.GridView, dataProvider: RealGrid.LocalDataProvider): any {
        let rows = [];
        gridView.commit();
        gridView.clearCurrent();
        const current = gridView.getCurrent();
        const options = { datetimeFormat: 'yyyy-MM-dd' };
        if(dataProvider.getOutputRows(options, 0 , current.dataRow)){
            rows = dataProvider.getOutputRows(options, 0 , current.dataRow);
        }
        return rows;
    }

    // css 변경 (row)
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/naming-convention
    gfn_EditGrid(gridView: RealGrid.GridView): void {

        gridView.setRowStyleCallback((grid, item, fixed)  => {
            if(item.rowState === 'deleted'){
                return 'mediro-row-delete';
            }else if(item.rowState === 'none'){
                return '';
            }
        });
    }

    // 그리드 행 추가
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/naming-convention
    gfn_AddRow(gridView: RealGrid.GridView, dataProvider: RealGrid.LocalDataProvider, values: any[]) {
        gridView.cancel();
        dataProvider.addRow(values);
    }

    // 그리드 행 삭제
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/naming-convention
    gfn_DelRow(gridView: RealGrid.GridView, dataProvider: RealGrid.LocalDataProvider): void {
        gridView.cancel();
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for(let i=0; i<gridView.getCheckedRows().length; i++){
            dataProvider.removeRow(gridView.getCheckedRows()[i]);
        }
    }

    // 그리드 추가, 수정, 삭제 행 가져오기
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/explicit-function-return-type
    gfn_GetEditRows(gridView: RealGrid.GridView, dataProvider: RealGrid.LocalDataProvider) {
        gridView.commit();
        const rtnList = [];
        const rows = dataProvider.getAllStateRows();
        if(rows){
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for(let i=0; i < rows.created.length; i++) {
                const jsonData = dataProvider.getJsonRow(rows.created[i]);
                jsonData.flag = 'C';
                rtnList.push(jsonData);
            }
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for(let i=0; i < rows.updated.length; i++) {
                const jsonData = dataProvider.getJsonRow(rows.updated[i]);
                jsonData.flag = 'U';
                rtnList.push(jsonData);
            }
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for(let i=0; i < rows.deleted.length; i++) {
                const jsonData = dataProvider.getJsonRow(rows.deleted[i]);
                jsonData.flag = 'D';
                rtnList.push(jsonData);
            }
        }

        return rtnList;
    }

    // 그리드 밸리데이션
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/naming-convention
    gfn_ValidationRows(gridView: RealGrid.GridView, functionService: FunctionService) {

        gridView.commit();
        let rtn = false;

        const val = gridView.validateCells(null, false);
        if(val !== null && val !== undefined){
            if(val[0].dataRow !== '') {
                gridView.setCurrent(val[0]);
                functionService.cfn_alert(val[0].message);
                gridView.setFocus();
                rtn = true;
            }
        }

        return rtn;
    }

    // 그리드 밸리데이션 옵션
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/naming-convention
    gfn_ValidationOption(gridView: RealGrid.GridView, validationList: string[]) {
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        gridView.onValidateColumn = (grid, column, inserting, value) => {
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for(let i=0; i<validationList.length; i++){
                if (column.fieldName === validationList[i]) {
                    if(value === '' || value === null || value === undefined){
                        return {
                            level: 'warning',
                            message: column.header.text + '를 입력해 주세요.',
                        };
                    }
                };
            }
        };
    }


    // 그리드 공통 팝업
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/naming-convention,max-len
    gfn_PopUp(isMobile: boolean, isExtraSmall: Observable<BreakpointState>, gridView: RealGrid.GridView, dataProvider: RealGrid.LocalDataProvider, columns: Columns[], _matDialogPopup: MatDialog, _unsubscribeAll: Subject<any>, _changeDetectorRef: ChangeDetectorRef
                ,param?: any) {

        //console.log(columns);
        if(columns.length > 1){
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for(let i=0; i<columns.length; i++){
                if(columns[i].renderer !== undefined){
                    gridView.registerCustomRenderer(columns[i].renderer, {
                        initContent : function(parent) {
                            const span = this._span = document.createElement('span');
                            parent.appendChild(span);
                            parent.appendChild(this._button = document.createElement('span'));
                            //this._button.id = columns[i].renderer + '_' + i;
                        },

                        // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
                        canClick : function() {
                            return true;
                        },

                        // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
                        clearContent : function(parent) {
                            //console.log('DISPOSED......');
                            parent.innerHTML = '';
                        },

                        render : function(grid, model, width, height, info) {
                            info = info || {};
                            const span = this._span;
                            // text설정.
                            span.textContent = model.value;

                            this._value = model.value;
                            this._button.className = '';
                            //console.log(model.value);
                            this._button.className += columns[i].renderer + ' rg-button-action';

                        },

                        click : function(event) {
                            const grid = this.grid.handler; //
                            const index = this.index.toProxy();  //
                            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                            event.preventDefault;

                            if (event.target === this._button) {

                                let where = '';
                                if(columns[i].popUpObject.where !== undefined){
                                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                                    for(let v=0; v<columns[i].popUpObject.where.length; v++){
                                        // eslint-disable-next-line max-len
                                        where += replace(columns[i].popUpObject.where[v].replace, '#{' + columns[i].popUpObject.where[v].key + '}', param.controls[columns[i].popUpObject.where[v].key].value);
                                    }
                                }
                                if(!isMobile){
                                    const popup = _matDialogPopup.open(CommonPopupItemsComponent, {
                                        data: {
                                            popup : columns[i].popUpObject.popUpId,
                                            headerText : columns[i].popUpObject.popUpHeaderText,
                                            where: where
                                        },
                                        autoFocus: false,
                                        maxHeight: '90vh',
                                        disableClose: true
                                    });

                                    popup.afterClosed()
                                        .pipe(takeUntil(_unsubscribeAll))
                                        .subscribe((result) => {
                                            if(result){
                                                const obj = {};
                                                if(columns[i].popUpObject.popUpDataSet !== null ||
                                                    columns[i].popUpObject.popUpDataSet !== undefined){
                                                    const barSplit = columns[i].popUpObject.popUpDataSet.split('|');
                                                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                                                    for(let x=0; x<barSplit.length; x++){
                                                        const keySplit = barSplit[x].split(':');
                                                        obj[keySplit[0]] = result[keySplit[1]];
                                                    }
                                                    dataProvider.updateRows(index.itemIndex, [obj]);
                                                }else{

                                                    dataProvider.updateRows(index.itemIndex, [result]);
                                                }
                                                _changeDetectorRef.markForCheck();
                                            }
                                        });
                                }else{
                                    const popup = _matDialogPopup.open(CommonPopupItemsComponent, {
                                        data: {
                                            popup : columns[i].popUpObject.popUpId,
                                            headerText : columns[i].popUpObject.popUpHeaderText,
                                            where : where,
                                        },
                                        autoFocus: false,
                                        width: 'calc(100% - 50px)',
                                        maxWidth: '100vw',
                                        maxHeight: '80vh',
                                        disableClose: true
                                    });

                                    const smallDialogSubscription = isExtraSmall.subscribe((size: any) => {
                                        if (size.matches) {
                                            popup.updateSize('calc(100vw - 10px)','');
                                        } else {
                                            // d.updateSize('calc(100% - 50px)', '');
                                        }
                                    });
                                    popup.afterClosed()
                                        .pipe(takeUntil(_unsubscribeAll))
                                        .subscribe((result) => {

                                            smallDialogSubscription.unsubscribe();
                                            const obj = {};
                                            if(columns[i].popUpObject.popUpDataSet !== null ||
                                                columns[i].popUpObject.popUpDataSet !== undefined){
                                                const barSplit = columns[i].popUpObject.popUpDataSet.split('|');
                                                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                                                for(let x=0; x<barSplit.length; x++){
                                                    const keySplit = barSplit[x].split(':');
                                                    obj[keySplit[0]] = result[keySplit[1]];
                                                }
                                                dataProvider.updateRows(index.itemIndex, [obj]);
                                            }else{

                                                dataProvider.updateRows(index.itemIndex, [result]);
                                            }
                                            _changeDetectorRef.markForCheck();
                                        });
                                }

                            }
                        }
                    });
                }
            }
        }
    }

    // 팝업 버튼 hide
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/naming-convention
    gfn_PopUpBtnHide(id: string) {
        const grd = document.getElementsByClassName(id);
        for(let i=0; i<grd.length; i++){
            grd.item(i).classList.add('mediro_display_none');
        }
    }

    // 그리드 전체 셀 데이터 셋
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/naming-convention
    gfn_AllDataSetRow(gridView: RealGrid.GridView, dataProvider: RealGrid.LocalDataProvider, column: string, value: any) {

        gridView.commit();

        const rowCount = dataProvider.getRowCount();

        for(let i = 0; i < rowCount; i ++){
            dataProvider.setValue(i, column, value);
        };
    }

    // 그리드 전체 셀 데이터 셋 (index)
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/naming-convention
    gfn_CellDataSetRow(gridView: RealGrid.GridView, dataProvider: RealGrid.LocalDataProvider, index: any, column: string, value: any) {

        gridView.commit();

        dataProvider.setValue(index, column, value);
    }

    // 그리드 전체 셀 데이터 Get (index)
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/naming-convention
    gfn_CellDataGetRow(gridView: RealGrid.GridView, dataProvider: RealGrid.LocalDataProvider, index: any, column: string): any {

        gridView.commit();

        let rtn;
        // eslint-disable-next-line prefer-const
        rtn = dataProvider.getValue(index, column);
        //dataProvider.setValue(index, column, value);
        return rtn;
    }

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/naming-convention
    gfn_ClearSelection(gridView: RealGrid.GridView, dataProvider: RealGrid.LocalDataProvider) {

        gridView.commit();
        gridView.clearSelection();
        gridView.clearCurrent();
    }
}
