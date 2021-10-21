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
    gfn_CreateGrid(dataProvider: RealGrid.LocalDataProvider, id: string, columns: any, fields: any): RealGrid.GridView{
        const gridView = new RealGrid.GridView(id);
        gridView.setDataSource(dataProvider);

        dataProvider.setFields(fields);
        gridView.setColumns(columns);
        gridView.displayOptions.emptyMessage = '표시할 데이터가 없습니다.';
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
        //상태바
        gridView.setStateBar({visible: true});
        //체크바
        gridView.setCheckBar({visible: false});
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
        gridView.sortingOptions.enabled = true;
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

            dataProvider.setRows(data);

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
    gfn_ExcelExportGrid(gridView: RealGrid.GridView): void{
        gridView.exportGrid({
            type: 'excel',
            target: 'local',
            fileName: '거래처 목록.xlsx',
            showProgress: true,
            compatibility: true,
            progressMessage: '엑셀 Export중입니다.',

        });
    }
}
