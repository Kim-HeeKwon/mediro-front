import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FuseRealGridService} from "../../../../../../@teamplat/services/realgrid";
import {StockService} from "../../../stock/stock/stock.service";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {FormBuilder, FormGroup} from "@angular/forms";
import {FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import * as moment from "moment";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {Columns} from "../../../../../../@teamplat/services/realgrid/realgrid.types";
import {Subject} from "rxjs";

@Component({
    selector: 'dms-stock-income-outcome-detail',
    templateUrl: 'income-outcome-detail.component.html',
    styleUrls: ['income-outcome-detail.component.scss'],
})
export class IncomeOutcomeDetailComponent implements OnInit, OnDestroy, AfterViewInit {
    isLoading: boolean = false;
    searchForm: FormGroup;
    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    incomeOutcomeDataProvider: RealGrid.LocalDataProvider;
    incomeOutcomeColumns: Columns[];

    // @ts-ignore
    incomeOutcomeFields: DataFieldObject[] = [
        {fieldName: 'route', dataType: ValueType.TEXT},
        {fieldName: 'accountNm', dataType: ValueType.TEXT},
        {fieldName: 'rbalance', dataType: ValueType.NUMBER},
        {fieldName: 'sbalance', dataType: ValueType.NUMBER},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _realGridsService: FuseRealGridService,
        private _stockService: StockService,
        public matDialogRef: MatDialogRef<IncomeOutcomeDetailComponent>,
        private _codeStore: CodeStore,
        private _formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _utilService: FuseUtilsService) {
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.incomeOutcomeDataProvider);
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            account: [''],
            accountNm: [''],
        });

        //그리드 컬럼
        this.incomeOutcomeColumns = [
            {
                name: 'accountNm', fieldName: 'accountNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '거래처명', styleName: 'center-cell-text'},
                renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'rbalance', fieldName: 'rbalance', type: 'data', width: '150', styleName: 'right-cell-text'
                , header: {text: '미수금', styleName: 'center-cell-text'}
                , footer: {
                    text: '',
                    expression: 'sum',
                    numberFormat : '#,##0',
                }
                , numberFormat : '#,##0', renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'sbalance', fieldName: 'sbalance', type: 'data', width: '150', styleName: 'right-cell-text'
                , header: {text: '미지급금', styleName: 'center-cell-text'}
                , footer: {
                    text: '',
                    expression: 'sum',
                    numberFormat : '#,##0',
                }
                , numberFormat : '#,##0', renderer:{
                    showTooltip:true
                }
            },

        ];

        this.incomeOutcomeDataProvider = this._realGridsService.gfn_CreateDataProvider();

        const gridListOption = {
            stateBar: false,
            checkBar: true,
            footers: true,
        };

        this.incomeOutcomeDataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.incomeOutcomeDataProvider,
            'incomeOutcomeDetail',
            this.incomeOutcomeColumns,
            this.incomeOutcomeFields,
            gridListOption,);

        this.gridList.setEditOptions({
            readOnly: true,
            insertable: false,
            appendable: false,
            editable: false,
            deletable: false,
            checkable: true,
            softDeleting: false,
        });

        this.gridList.deleteSelection(true);
        this.gridList.setDisplayOptions({liveScroll: false,});
        this.gridList.setPasteOptions({enabled: false,});

        this._changeDetectorRef.markForCheck();
    }

    selectHeader(){

        const data = [{
            accountNm: 'A 거래처',
            rbalance: 1000000,
            sbalance: 300000,
        },{
            accountNm: 'B 거래처',
            rbalance: 0,
            sbalance: 5000000,
        },{
            accountNm: 'C 거래처',
            rbalance: 300000,
            sbalance: 240000,
        }];

        this._realGridsService.gfn_DataSetGrid(this.gridList, this.incomeOutcomeDataProvider, data);
        this._changeDetectorRef.markForCheck();
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '원장 목록');
    }

}