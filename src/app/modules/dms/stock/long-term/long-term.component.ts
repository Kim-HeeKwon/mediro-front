import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CommonCode, FuseUtilsService} from "../../../../../@teamplat/services/utils";
import {merge, Observable, Subject} from "rxjs";
import {LongTerm, LongTermPagenation} from "./long-term.types";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {Columns} from "../../../../../@teamplat/services/realgrid/realgrid.types";
import {FuseRealGridService} from "../../../../../@teamplat/services/realgrid";
import {NavigationEnd, Router} from "@angular/router";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {CodeStore} from "../../../../core/common-code/state/code.store";
import {DeviceDetectorService} from "ngx-device-detector";
import {LongTermService} from "./long-term.service";
import {map, switchMap, takeUntil} from "rxjs/operators";

@Component({
    selector: 'dms-app-long-term',
    templateUrl: './long-term.component.html',
    styleUrls: ['./long-term.component.scss']
})
export class LongTermComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    isLoading: boolean = false;
    orderBy: any = 'asc';
    isMobile: boolean = false;
    navigationSubscription: any;
    searchForm: FormGroup;
    itemGrades: CommonCode[] = null;
    longTerms$: Observable<LongTerm[]>;
    longTermPagenation: LongTermPagenation | null = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    longTermDataProvider: RealGrid.LocalDataProvider;
    longTermColumns: Columns[];
    // @ts-ignore
    longTermFields: DataFieldObject[] = [
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'lot1', dataType: ValueType.TEXT},
        {fieldName: 'retentionPeriod', dataType: ValueType.TEXT},
        {fieldName: 'averageHolding', dataType: ValueType.TEXT},
        {fieldName: 'longTermType', dataType: ValueType.TEXT},
        {fieldName: 'longTermStatus', dataType: ValueType.TEXT},
        {fieldName: 'qty', dataType: ValueType.NUMBER},
        {fieldName: 'availQty', dataType: ValueType.NUMBER}
    ];
    constructor(
        private _realGridsService: FuseRealGridService,
        private _longTermService: LongTermService,
        private _formBuilder: FormBuilder,
        private _utilService: FuseUtilsService,
        private _router: Router,
        private _changeDetectorRef: ChangeDetectorRef,
        private _functionService: FunctionService,
        private _codeStore: CodeStore,
        private _deviceService: DeviceDetectorService,) {
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_GRADE');
        this.navigationSubscription = this._router.events.subscribe((e: any) => {
            // RELOAD로 설정했기때문에 동일한 라우트로 요청이 되더라도
            // 네비게이션 이벤트가 발생한다. 우리는 이 네비게이션 이벤트를 구독하면 된다.
            if (e instanceof NavigationEnd) {
            }
        });
        this.isMobile = this._deviceService.isMobile();
    }
    ngAfterViewInit(): void {
        // Get products if sort or page changes
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._longTermService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'itemNm', this.orderBy, this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.longTermDataProvider);
    }

    ngOnInit(): void {
        const values = [];
        const lables = [];
        this.itemGrades.forEach((param: any) => {
            values.push(param.id);
            lables.push(param.name);
        });

        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            itemNm: [''],
            searchCondition: ['100'],
            searchText: [''],
        });

        this.longTermColumns = [
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '품목명', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'standard',
                fieldName: 'standard',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text',
                header: {text: '규격', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                },
            },
            {
                name: 'unit',
                fieldName: 'unit',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text',
                header: {text: '단위', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                },
            },
            {
                name: 'itemGrade', fieldName: 'itemGrade', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '품목등급', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                },
                values: values,
                labels: lables,
                lookupDisplay: true,
            },
            // {
            //     name: 'qty',
            //     fieldName: 'qty'
            //     ,
            //     type: 'data',
            //     width: '100',
            //     styleName: 'right-cell-text',
            //     header: {text: '현재고', styleName: 'center-cell-text'},
            //     numberFormat: '#,##0',
            //     renderer: {
            //         showTooltip: true
            //     },
            // },
            {
                name: 'availQty',
                fieldName: 'availQty',
                type: 'data',
                width: '100',
                styleName: 'right-cell-text',
                numberFormat: '#,##0'
                ,
                header: {text: '수량', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                },
            },
            {
                name: 'lot1',
                fieldName: 'lot1',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text',
                header: {text: '입고일자', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                },
            },
            {
                name: 'retentionPeriod',
                fieldName: 'retentionPeriod',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text',
                header: {text: '보유기간', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                },
            },
            // {
            //     name: 'averageHolding',
            //     fieldName: 'averageHolding',
            //     type: 'data',
            //     width: '100',
            //     styleName: 'left-cell-text',
            //     header: {text: '평균보유', styleName: 'center-cell-text'},
            //     renderer: {
            //         showTooltip: true
            //     },
            // },
            {
                name: 'longTermType',
                fieldName: 'longTermType',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text',
                header: {text: '관리유형', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                },
            },
            {
                name: 'longTermStatus',
                fieldName: 'longTermStatus',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text',
                header: {text: '재고상태', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                },
            },
        ];

        this.longTermDataProvider = this._realGridsService.gfn_CreateDataProvider();

        const gridListOption = {
            stateBar: false,
            checkBar: true,
            footers: false,
        };

        this.longTermDataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.longTermDataProvider,
            'longTerm',
            this.longTermColumns,
            this.longTermFields,
            gridListOption);

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

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                const rtn = this._longTermService.getHeader(this.longTermPagenation.page, this.longTermPagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
                this.selectCallBack(rtn);
            }
            ;
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };

        //페이지 라벨
        this._paginator._intl.itemsPerPageLabel = '';
        this.selectHeader();
        this._changeDetectorRef.markForCheck();
    }

    selectHeader(): void {
        const rtn = this._longTermService.getHeader(0, 40, 'itemNm', 'asc', this.searchForm.getRawValue());
        //this.setGridData();
        this.selectCallBack(rtn);
    }

    setGridData(): void {
        this.longTerms$ = this._longTermService.longTerms$;
        this._longTermService.longTerms$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((longTerm: any) => {
                if (longTerm !== null) {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.longTermDataProvider, longTerm);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    //페이징
    pageEvent($event: PageEvent): void {
        const rtn = this._longTermService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'itemNm', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '장기재고 목록');
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.selectHeader();
        }
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.longTermDataProvider, ex.longTerm);
            this._longTermService.longTermPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((longTermPagenation: LongTermPagenation) => {
                    // Update the pagination
                    this.longTermPagenation = longTermPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if(ex.longTerm.length < 1){
                this._functionService.cfn_alert('검색된 정보가 없습니다.');
            }
        });
    }

    setting(): void{

    }

}