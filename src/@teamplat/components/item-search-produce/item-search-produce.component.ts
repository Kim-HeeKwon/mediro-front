import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {fuseAnimations} from "../../animations";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {UdiModelsPagination} from "./item-search-produce.types";
import {Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {FormBuilder, FormGroup} from "@angular/forms";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {Columns} from "../../services/realgrid/realgrid.types";
import {FuseRealGridService} from "../../services/realgrid";
import {FunctionService} from "../../services/function";
import {ItemSearchProduceService} from "./item-search-produce.service";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {CodeStore} from "../../../app/core/common-code/state/code.store";
import {DeviceDetectorService} from "ngx-device-detector";
import {CommonCode, FuseUtilsService} from "../../services/utils";
import {takeUntil} from "rxjs/operators";

@Component({
    selector: 'app-item-search-produce',
    templateUrl: './item-search-produce.component.html',
    styleUrls: ['./item-search-produce.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class ItemSearchProduceComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    pageEvent: PageEvent;
    udiModelsPagination: UdiModelsPagination | null = null;
    isLoading: boolean = false;
    isMobile: boolean = false;
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );

    searchForm: FormGroup;
    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    dataProvider: RealGrid.LocalDataProvider;
    columns: Columns[];
    itemGrades: CommonCode[] = [];

    // @ts-ignore
    fields: DataFieldObject[] = [
        {fieldName: 'modelName', dataType: ValueType.TEXT},
        {fieldName: 'itemName', dataType: ValueType.TEXT},
        {fieldName: 'permitItemNo', dataType: ValueType.TEXT},
        {fieldName: 'permitDate', dataType: ValueType.TEXT},
        {fieldName: 'grade', dataType: ValueType.TEXT},
        {fieldName: 'udidiCount', dataType: ValueType.NUMBER},
        {fieldName: 'meddevItemSeq', dataType: ValueType.TEXT},
        {fieldName: 'isForExport', dataType: ValueType.TEXT},
        {fieldName: 'seq', dataType: ValueType.TEXT},
        {fieldName: 'cobFlagCode', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _realGridsService: FuseRealGridService,
        private _functionService: FunctionService,
        private _itemProduceSearchService: ItemSearchProduceService,
        public matDialogRef: MatDialogRef<ItemSearchProduceComponent>,
        private _codeStore: CodeStore,
        public _matDialogPopup: MatDialog,
        private _formBuilder: FormBuilder,
        private _deviceService: DeviceDetectorService,
        private _changeDetectorRef: ChangeDetectorRef,
        private readonly breakpointObserver: BreakpointObserver,
        private _utilService: FuseUtilsService) {
        this.isMobile = this._deviceService.isMobile();
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_GRADE');
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.dataProvider);
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            modelNameLike: [''],
            offset: [1],
            limit: [100],
        });

        const itemGradesvalues = [];
        const itemGradeslables = [];
        this.itemGrades.forEach((param: any) => {
            itemGradesvalues.push(param.id);
            itemGradeslables.push(param.name);
        });

        //그리드 컬럼
        this.columns = [
            {
                name: 'modelName', fieldName: 'modelName', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '모델명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemName', fieldName: 'itemName', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목명', styleName: 'center-cell-text'},
                renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'grade', fieldName: 'grade', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '등급', styleName: 'center-cell-text'},
                renderer:{
                    showTooltip:true
                },
                values: itemGradesvalues,
                labels: itemGradeslables,
                lookupDisplay: true,
            },
            {
                name: 'permitItemNo', fieldName: 'permitItemNo', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목허가번호', styleName: 'center-cell-text'},
                renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'permitDate', fieldName: 'permitDate', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목허가일자', styleName: 'center-cell-text'},
                renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'udidiCount', fieldName: 'udidiCount', type: 'data', width: '150', styleName: 'right-cell-text'
                , header: {text: 'UDI-DI 코드 갯수', styleName: 'center-cell-text'}
                , numberFormat : '#,##0', renderer:{
                    showTooltip:true
                }
            },
        ];

        this.dataProvider = this._realGridsService.gfn_CreateDataProvider();

        const gridListOption = {
            stateBar: false,
            checkBar: true,
            footers: false,
        };

        this.dataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.dataProvider,
            'itemProduce',
            this.columns,
            this.fields,
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

        //페이지 라벨
        this._paginator._intl.itemsPerPageLabel = '';

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellDblClicked = (grid, clickData) => {
            this.matDialogRef.close(grid.getValues(clickData.dataRow));
        };
        this._changeDetectorRef.markForCheck();
    }

    selectHeader(): void {
        const rtn = this._itemProduceSearchService.getUdiModels(1, 100, 'itemName', 'asc', this.searchForm.getRawValue());

        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.dataProvider, ex.udiModels);
            this._itemProduceSearchService.pagination$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((udiModelsPagination: UdiModelsPagination) => {
                    // Update the pagination
                    this.udiModelsPagination = udiModelsPagination;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });

            this._functionService.cfn_loadingBarClear();
        });
    }

    pageChange(evt: any): void{
        console.log(this._paginator.pageIndex);
        this.searchForm.patchValue({'offset': this._paginator.pageIndex + 1});
        this.searchForm.patchValue({'limit': this._paginator.pageSize});

        const rtn = this._itemProduceSearchService.getUdiModels(this._paginator.pageIndex, this._paginator.pageSize, 'itemName', 'asc', this.searchForm.getRawValue());

        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.dataProvider, ex.udiModels);
            this._itemProduceSearchService.pagination$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((udiModelsPagination: UdiModelsPagination) => {
                    // Update the pagination
                    this.udiModelsPagination = udiModelsPagination;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });

            this._functionService.cfn_loadingBarClear();
        });
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '품목 목록');
    }
}
