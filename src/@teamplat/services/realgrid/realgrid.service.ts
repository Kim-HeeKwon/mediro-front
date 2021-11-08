import {Injectable} from "@angular/core";
import RealGrid, {GridView, IndicatorValue, LocalDataProvider} from "realgrid";
import {CommonCode} from "../utils";
@Injectable({
    providedIn: 'root'
})
export class FuseRealGridService {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/naming-convention
    gfn_CreateDataProvider(): RealGrid.LocalDataProvider{
        const dataProvider = new RealGrid.LocalDataProvider(false);
        return dataProvider;
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering,@typescript-eslint/naming-convention
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/naming-convention
    gfn_CreateGrid(dataProvider: RealGrid.LocalDataProvider, id: string, columns: any, fields: any, option?: any): RealGrid.GridView{
        const gridView = new RealGrid.GridView(id);
        gridView.setDataSource(dataProvider);

        dataProvider.setFields(fields);
        gridView.setColumns(columns);
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
        gridView.header.height = 30;
        gridView.displayOptions.rowHeight = 30;
        //인디케이터 (NO)
        gridView.setRowIndicator({
            visible: true, displayValue: IndicatorValue.INDEX, zeroBase: false,
            headText: 'No',
            footText: ''});
        gridView.setContextMenu([
            {
                label: '-' // menu separator를 삽입합니다.
            },
            {label: 'Excel Export'},
            {
                label: '-' // menu separator를 삽입합니다.
            },
        ]);

        //정렬
        gridView.sortingOptions.enabled = false;
        // @ts-ignore
        gridView.sortingOptions.handleVisibility = 'always';
        //컬럼 move
        gridView.displayOptions.columnMovable = true;
        return gridView;
    }

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

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/naming-convention
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/explicit-function-return-type
    gfn_FilterGrid(gridView: RealGrid.GridView, columnId: any, filters: any){
        gridView.setColumnFilters(columnId, filters);
        //gridView.clearColumnFilters(columnId);
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/naming-convention
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/explicit-function-return-type
    gfn_AutoFilterGrid(gridView: RealGrid.GridView, columnId: any, bool: boolean){
        gridView.setColumnProperty(columnId, 'autoFilter', bool);
        //gridView.clearColumnFilters(columnId);
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/naming-convention
    gfn_ExcelExportGrid(gridView: RealGrid.GridView, fileName?: string ): void{

        if(fileName === undefined){
            fileName = 'Excel';
        }

        gridView.exportGrid({
            type: 'excel',
            target: 'local',
            fileName: fileName + '.xlsx',
            showProgress: true,
            compatibility: true,
            sheetName: fileName,
            progressMessage: '엑셀 Export중입니다.',
            // exportGrids: [
            //     { grid: gridView, sheetName: '거래처' },
            //     { grid: gridView, sheetName: '거래처2' }
            // ]
        });
    }

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/naming-convention
    gfn_Destory(gridList: RealGrid.GridView, dataProvider: RealGrid.LocalDataProvider): void {

        //데이터 초기화
        dataProvider.clearRows();

        //grid, provider 초기화
        gridList.destroy();
        dataProvider.destroy();

        //LocalDataProvider와 GridView 객체 초기화
        gridList = null;
        dataProvider = null;
    }

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/naming-convention
    gfn_GetCheckRows(gridView: RealGrid.GridView, dataProvider: RealGrid.LocalDataProvider): any {
        const rows = [];
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for(let i=0; i<gridView.getCheckedRows().length; i++){
            rows.push(dataProvider.getJsonRow(gridView.getCheckedRows()[i]));
        }
        return rows;
    }

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/naming-convention
    gfn_DeleteGrid(gridView: RealGrid.GridView, dataProvider: RealGrid.LocalDataProvider): void {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for(let i=0; i<gridView.getCheckedRows().length; i++){
            dataProvider.removeRow(gridView.getCheckedRows()[i]);
        }
    }

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
}
