import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CommonCode, FuseUtilsService} from "../../../../../@teamplat/services/utils";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {EstimateService} from "../../estimate-order/estimate/estimate.service";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {TeamPlatConfirmationService} from "../../../../../@teamplat/services/confirmation";
import {ShortcutsService} from "../../../../layout/common/shortcuts/shortcuts.service";
import {CodeStore} from "../../../../core/common-code/state/code.store";
import {DeviceDetectorService} from "ngx-device-detector";
import {merge, Subject} from "rxjs";
import * as moment from "moment";
import {EstimateHeaderPagenation} from "../../estimate-order/estimate/estimate.types";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {FuseRealGridService} from "../../../../../@teamplat/services/realgrid";
import {Columns} from "../../../../../@teamplat/services/realgrid/realgrid.types";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {map, switchMap, takeUntil} from "rxjs/operators";

@Component({
    selector: 'app-header-detail',
    templateUrl: './header-detail.component.html',
    styleUrls: ['./header-detail.component.scss']
})

export class HeaderDetailComponent implements OnInit, OnDestroy, AfterViewInit{
    isLoading: boolean = false;
    isMobile: boolean = false;
    isProgressSpinner: boolean = false;
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    searchForm: FormGroup;
    status: CommonCode[] = null;
    type: CommonCode[] = null;
    estimateHeaderColumns: Columns[];
    isSearchForm: boolean = false;
    orderBy: any = 'desc';
    @ViewChild(MatPaginator, { static: true }) _paginator: MatPaginator;
    estimateHeaderPagenation: EstimateHeaderPagenation | null = null;
    searchCondition: CommonCode[] = [
        {
            id: '100',
            name: '거래처 명'
        }];
    searchCondition2: CommonCode[] = [
        {
            id: '100',
            name: '거래처 명'
        }];
    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    estimateHeaderDataProvider: RealGrid.LocalDataProvider;
    estimateHeaderFields: DataFieldObject[] = [
        {fieldName: 'no', dataType: ValueType.TEXT},
        {fieldName: 'mId', dataType: ValueType.TEXT},
        {fieldName: 'qtNo', dataType: ValueType.TEXT},
        {fieldName: 'qtCreDate', dataType: ValueType.TEXT},
        {fieldName: 'qtDate', dataType: ValueType.TEXT},
        {fieldName: 'type', dataType: ValueType.TEXT},
        {fieldName: 'status', dataType: ValueType.TEXT},
        {fieldName: 'account', dataType: ValueType.TEXT},
        {fieldName: 'accountNm', dataType: ValueType.TEXT},
        {fieldName: 'poCreate', dataType: ValueType.TEXT},
        {fieldName: 'soCreate', dataType: ValueType.TEXT},
        {fieldName: 'email', dataType: ValueType.TEXT},
        {fieldName: 'qtAmt', dataType: ValueType.NUMBER},
        {fieldName: 'soNo', dataType: ValueType.TEXT},
        {fieldName: 'remarkHeader', dataType: ValueType.TEXT},
        {fieldName: 'toAccountNm', dataType: ValueType.TEXT},
        {fieldName: 'deliveryDate', dataType: ValueType.TEXT},
        {fieldName: 'custBusinessNumber', dataType: ValueType.TEXT},
        {fieldName: 'custBusinessName', dataType: ValueType.TEXT},
        {fieldName: 'representName', dataType: ValueType.TEXT},
        {fieldName: 'address', dataType: ValueType.TEXT},
        {fieldName: 'businessCondition', dataType: ValueType.TEXT},
        {fieldName: 'businessCategory', dataType: ValueType.TEXT},
        {fieldName: 'phoneNumber', dataType: ValueType.TEXT},
        {fieldName: 'fax', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _realGridsService: FuseRealGridService,
        private _activatedRoute: ActivatedRoute,
        public _matDialogPopup: MatDialog,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _estimateService: EstimateService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _functionService: FunctionService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _shortcutService: ShortcutsService,
        private _codeStore: CodeStore,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
    ) {
        this.status = _utilService.commonValue(_codeStore.getValue().data, 'QT_STATUS');
        this.type = _utilService.commonValue(_codeStore.getValue().data, 'QT_TYPE');
        this.isMobile = this._deviceService.isMobile();
    }

    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._estimateService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'qtNo', this.orderBy, this.searchForm.getRawValue());
            }),
            map(() => {
                this.isLoading = false;
            })
        ).subscribe();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.estimateHeaderDataProvider);
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            status: ['ALL'],
            type: ['ALL'],
            account: [''],
            accountNm: [''],
            searchCondition: ['100'],
            searchCondition2: ['100'],
            searchText: [''],
            range: [{
                start: moment().utc(false).add(-7, 'day').endOf('day').toISOString(),
                end: moment().utc(false).startOf('day').toISOString()
            }],
            start: [],
            end: [],

        });

        const valuesType = [];
        const lablesType = [];

        const valuesStatus = [];
        const lablesStatus = [];

        this.type.forEach((param: any) => {
            valuesType.push(param.id);
            lablesType.push(param.name);
        });

        this.status.forEach((param: any) => {
            valuesStatus.push(param.id);
            lablesStatus.push(param.name);
        });

        //그리드 컬럼
        this.estimateHeaderColumns = [
            {name: 'qtNo', fieldName: 'qtNo', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '견적번호', styleName: 'left-cell-text'},},
            {name: 'qtCreDate', fieldName: 'qtCreDate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '견적 생성일자' , styleName: 'left-cell-text'}
            },
            {name: 'qtDate', fieldName: 'qtDate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '견적 일자' , styleName: 'left-cell-text'}
            },
            {name: 'type', fieldName: 'type', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '유형', styleName: 'left-cell-text'},
                values: valuesType,
                labels: lablesType,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.type),
            },
            {name: 'type', fieldName: 'status', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '상태', styleName: 'left-cell-text'},
                values: valuesStatus,
                labels: lablesStatus,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.status),
            },
            {name: 'account', fieldName: 'account', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '거래처' , styleName: 'left-cell-text'}},
            {name: 'accountNm', fieldName: 'accountNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '거래처 명' , styleName: 'left-cell-text'}},
            {name: 'qtAmt', fieldName: 'qtAmt', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '견적 금액' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'
            },
            {name: 'poCreate', fieldName: 'poCreate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '발주서' , styleName: 'center-cell-text'}
                , renderer: {
                    type:'html',
                    template: '<button class="mediro-cell-button">' +
                                '<span>바로가기</span>' +
                                '</button>',
                }},
            {name: 'soCreate', fieldName: 'soCreate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '주문서' , styleName: 'center-cell-text'}
                , renderer: {
                    type:'html',
                    template: '<button class="mediro-cell-button">' +
                        '<span>바로가기</span>' +
                        '</button>',
                }},
            {name: 'remarkHeader', fieldName: 'remarkHeader', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '비고' , styleName: 'left-cell-text'}
            },
        ];
        //그리드 Provider
        this.estimateHeaderDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const gridListOption = {
            stateBar : false,
            checkBar : true,
            footers : false,
        };

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.estimateHeaderDataProvider,
            'estimateHeaderGrid',
            this.estimateHeaderColumns,
            this.estimateHeaderFields,
            gridListOption);

        //그리드 옵션
        this.gridList.setEditOptions({
            readOnly: true,
            insertable: false,
            appendable: false,
            editable: false,
            //deletable: true,
            checkable: true,
            softDeleting: true,
            //hideDeletedRows: true,
        });
        this.gridList.setDisplayOptions({liveScroll: false,});
        this.gridList.setPasteOptions({enabled: false,});

        //정렬
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if(clickData.cellType === 'header'){
                this._estimateService.getHeader(this.estimateHeaderPagenation.page,this.estimateHeaderPagenation.size,clickData.column,this.orderBy,this.searchForm.getRawValue());
            }
            if(this.orderBy === 'asc'){
                this.orderBy = 'desc';
            }else{
                this.orderBy = 'asc';
            }
        };
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellDblClicked = (grid, clickData) => {
            //console.log(grid.getValues(clickData.dataRow));
            //this._router.navigate(['estimate-order/estimate/estimate-detail', grid.getValues(clickData.dataRow)]);
        };

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellItemClicked = (grid, index, clickData) => {
            console.log(grid);
            console.log(index);
            console.log(clickData);
            console.log(grid.getValues(index.dataRow));
        };
        //페이지 라벨
        this._paginator._intl.itemsPerPageLabel = '';

        this.setGridData();

        // Get the pagenation
        this._estimateService.estimateHeaderPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estimateHeaderPagenation: EstimateHeaderPagenation) => {
                // Update the pagination
                this.estimateHeaderPagenation = estimateHeaderPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    selectHeader(): void {
        if (this.searchForm.getRawValue().searchCondition === '100') {
            this.searchForm.patchValue({'account': ''});
            this.searchForm.patchValue({'accountNm': this.searchForm.getRawValue().searchText});
        }
        this.searchForm.patchValue({'start': this.searchForm.get('range').value.start});
        this.searchForm.patchValue({'end': this.searchForm.get('range').value.end});

        this._estimateService.getHeader(0, 20, 'qtNo', 'desc', this.searchForm.getRawValue());

        this.setGridData();
    }

    newEstimate(): void {

    }

    estimateSend(): void{

    }

    estimateConfirm(): void {

    }

    estimateCancel(): void {

    }

    searchFormClick(): void {
        if(this.isSearchForm){
            this.isSearchForm = false;
        }else{
            this.isSearchForm = true;
        }
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '견적 목록');
    }

    //페이징
    pageEvent($event: PageEvent): void {

        this._estimateService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'qtNo', this.orderBy, this.searchForm.getRawValue());
    }

    setGridData(): void {

        this._estimateService.estimateHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estimateHeaders: any) => {
                // Update the counts
                if (estimateHeaders !== null) {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.estimateHeaderDataProvider, estimateHeaders);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
}
