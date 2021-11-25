import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit, ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {fuseAnimations} from "../../animations";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FuseRealGridService} from "../../services/realgrid";
import {FuseUtilsService} from "../../services/utils";
import {FormBuilder} from "@angular/forms";
import {CommonPopupItemsService} from "../common-popup-items/common-popup-items.service";
import {PopupStore} from "../../../app/core/common-popup/state/popup.store";
import {BehaviorSubject, Subject} from "rxjs";
import RealGrid, {DataFieldObject, IndicatorValue, ValueType} from "realgrid";
import {PopupPagenation} from "../common-popup-items/common-popup-items.types";
import {MatPaginator} from "@angular/material/paginator";
import * as XLSX from 'xlsx';
import {CommonExcelService} from "./common-excel.service";
import {takeUntil} from "rxjs/operators";

@Component({
    selector: 'app-common-excel',
    templateUrl: './common-excel.component.html',
    styleUrls: ['./common-excel.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class CommonExcelComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild(MatPaginator, { static: true }) _paginator: MatPaginator;
    isProgressSpinner: boolean = false;
    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    excelDataProvider: RealGrid.LocalDataProvider;
    displayedColumns: any[] = [];
    jsonData: any;
    excelType: string;
    excelFields: any[] = [];
    excelColumns: any[] = [];
    commonValues: any[] = [];
    pagenation: any | null = null;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        public _matDialogRef: MatDialogRef<CommonExcelComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _realGridsService: FuseRealGridService,
        private _utilService: FuseUtilsService,
        private _formBuilder: FormBuilder,
        private _excelService: CommonExcelService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _popupStore: PopupStore) {
        this.jsonData = data.jsonData;
        this.excelType = data.excelType;
    }
    ngOnInit(): void {

        let colNum = 1;
        if(this.jsonData != null){
            //console.log(this.jsonData);
            this.jsonData.forEach((param: any) => {

                let fieldNm;
                if(colNum < 10){
                    fieldNm = 'c00' + colNum;
                }else if(9 < colNum && colNum < 100){
                    fieldNm = 'c0' + colNum;
                }else{
                    fieldNm = 'c' + colNum;
                }

                const commonValue: any = {
                    id: fieldNm,              //컬럼ID;
                    name: param.descr,            //컬럼명;
                    width: 120
                };

                this.displayedColumns.push(fieldNm);
                this.commonValues.push(commonValue);

                colNum++;
            });
        }

        this.excelFields.push('lineNo');
        if(this.displayedColumns){
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for(let i=0; i<this.displayedColumns.length; i++){
                // @ts-ignore
                this.excelFields.push({fieldName: this.displayedColumns[i], dataType: ValueType.TEXT});
            }
        }
        this.excelColumns.push({name: 'lineNo', fieldName: 'lineNo', type: 'data'
            , width: '80', styleName: 'left-cell-text'
            , header: {text: '라인번호', styleName: 'left-cell-text'}});
        if(this.commonValues){
            this.commonValues.forEach((param: any) => {

                this.excelColumns.push({name: param.id, fieldName: param.id, type: 'data'
                    , width: param.width === '' ? '100' : param.width, styleName: 'left-cell-text'
                    , header: {text: param.name, styleName: 'left-cell-text'}});
            });
        }

        this.excelColumns.push({name: 'errCode', fieldName: 'errCode', type: 'data'
            , width: '100', styleName: 'left-cell-text'
            , header: {text: '에러 코드', styleName: 'left-cell-text'}});
        this.excelColumns.push({name: 'errMsg', fieldName: 'errMsg', type: 'data'
            , width: '300', styleName: 'left-cell-text'
            , header: {text: '에러 메세지', styleName: 'left-cell-text'}});

        this.excelFields.push('errMsg');
        this.excelFields.push('errCode');

        //그리드 Provider
        this.excelDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const gridListOption = {
            stateBar : false,
            checkBar : true,
            footers : false,
        };

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.excelDataProvider,
            'excelGrid',
            this.excelColumns,
            this.excelFields,
            gridListOption);

        //그리드 옵션
        this.gridList.setEditOptions({
            readOnly: true,
            insertable: false,
            appendable: false,
            editable: false,
            //deletable: true,
            checkable: false,
            softDeleting: false,
            //hideDeletedRows: true,
        });
        //인디케이터 (NO)
        this.gridList.setRowIndicator({
            visible: false, displayValue: IndicatorValue.INDEX, zeroBase: false,
            headText: 'No',
            footText: ''});
        this.gridList.setDisplayOptions({liveScroll: false,});
        this.gridList.setPasteOptions({enabled: false,});

        this._paginator._intl.itemsPerPageLabel = '';
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.excelDataProvider);
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, 'Excel Upload');
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    excelImport(files: FileList) {
        //console.log(files);
        const file = files[0];
        if(typeof file === 'undefined'){
            return;
        }

        const rABS = typeof FileReader !== 'undefined' && typeof FileReader.prototype !== 'undefined'
            && typeof FileReader.prototype.readAsBinaryString !== 'undefined';
        const reader = new FileReader();

        let jsonObj;
        //let isProgressSpinner = this.isProgressSpinner;
        const excelService = this._excelService;
        const excelType = this.excelType;

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        reader.onload = function(e){
            const data = e.target.result;
            let workbook;

            if(rABS){
                workbook = XLSX.read(data, {type: 'binary'});
            }else{
                // eslint-disable-next-line @typescript-eslint/no-shadow,@typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
                const arr = function (data){
                    // eslint-disable-next-line prefer-const
                    let o = ''; let l = 0; let w = 10240;
                    for(; l<data.byteLength / w; ++l){
                        o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
                    }
                    o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
                    return o;
                };
                // @ts-ignore
                workbook = XLSX.read(btoa(arr), {type: 'base64'});
            }

            //console.log(workbook);

            const result = {};
            // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
            workbook.SheetNames.forEach(function(sheetName){
               let roa;
               let index = 0;

                // eslint-disable-next-line prefer-const
               roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {header: 1});

               if(roa.length > 0){
                   result['ds_excelJson'] = roa;
               }

               index++;
            });

            let output = result['ds_excelJson'];
            //output = output.replace(/<!\[CDATA\[(.*?)\]\]>/g,'$1');

            jsonObj = output;
            excelService.getExcelTransaction(jsonObj, excelType, false);
        };
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        reader.onloadend = function(e){
            //isProgressSpinner = false;

        };

        this._changeDetectorRef.markForCheck();

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        reader.onerror = function(){};

        //this._excelService.getExcelTransaction(jsonObj);

        if(rABS){
            reader.readAsBinaryString(file);
        }else{
            reader.readAsArrayBuffer(file);
        }
        this._excelService.rtnList$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((rtnList: any) => {
                // Update the counts
                if(rtnList != null){
                    if(rtnList.status === 'SUCCESS'){
                        console.log(rtnList.data);
                        this._realGridsService.gfn_DataSetGrid(this.gridList, this.excelDataProvider, rtnList.data);
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    }
                }
            });
    }
}
