import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {Validity, ValidityPagenation} from './validity.types';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {DeviceDetectorService} from 'ngx-device-detector';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {ValidityService} from './validity.service';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {Columns} from '../../../../../@teamplat/services/realgrid/realgrid.types';
import {FuseRealGridService} from '../../../../../@teamplat/services/realgrid';
import {FunctionService} from '../../../../../@teamplat/services/function';
import {MatDialog} from '@angular/material/dialog';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {ValidityDetailComponent} from './validity-detail/validity-detail.component';

@Component({
    selector: 'dms-app-validity',
    templateUrl: './validity.component.html',
    styleUrls: ['./validity.component.scss']
})
export class ValidityComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    isLoading: boolean = false;
    orderBy: any = 'asc';
    isMobile: boolean = false;
    navigationSubscription: any;
    searchForm: FormGroup;
    validity: CommonCode[] = null;
    validityType: CommonCode[] = null;
    itemGrades: CommonCode[] = null;
    validitys$: Observable<Validity[]>;
    validityPagenation: ValidityPagenation | null = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    searchCondition: CommonCode[] = [
        {
            id: '100',
            name: '품목 명'
        }];

    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    validityDataProvider: RealGrid.LocalDataProvider;
    validityColumns: Columns[];
    // @ts-ignore
    validityFields: DataFieldObject[] = [
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'fomlInfo', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'lot1', dataType: ValueType.TEXT},
        {fieldName: 'lot2', dataType: ValueType.TEXT},
        {fieldName: 'retentionPeriod', dataType: ValueType.TEXT},
        {fieldName: 'averageHolding', dataType: ValueType.TEXT},
        {fieldName: 'imminentType', dataType: ValueType.TEXT},
        {fieldName: 'imminentStatus', dataType: ValueType.TEXT},
        {fieldName: 'imminentPeriod', dataType: ValueType.TEXT},
        {fieldName: 'validity', dataType: ValueType.NUMBER},
        {fieldName: 'qty', dataType: ValueType.NUMBER},
        {fieldName: 'availQty', dataType: ValueType.NUMBER}
    ];

    constructor(
        private _realGridsService: FuseRealGridService,
        private _validityService: ValidityService,
        private _formBuilder: FormBuilder,
        private _utilService: FuseUtilsService,
        private _matDialog: MatDialog,
        private _router: Router,
        private _changeDetectorRef: ChangeDetectorRef,
        private _functionService: FunctionService,
        private _codeStore: CodeStore,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver) {
        this.validity = _utilService.commonValue(_codeStore.getValue().data, 'INV_VALIDITY');
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_GRADE');
        this.validityType = _utilService.commonValue(_codeStore.getValue().data, 'VALIDITY_TYPE');
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
                return this._validityService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'itemNm', this.orderBy, this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.validityDataProvider);
    }

    ngOnInit(): void {
        const values = [];
        const lables = [];
        this.itemGrades.forEach((param: any) => {
            values.push(param.id);
            lables.push(param.name);
        });
        const valueTypes = [];
        const lableTypes = [];
        this.validityType.forEach((param: any) => {
            valueTypes.push(param.id);
            lableTypes.push(param.name);
        });

        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            type: ['ALL'],
            validity: ['ALL'],
            itemNm: [''],
            fomlInfo: [''],
            searchCondition: ['100'],
            searchText: [''],
        });

        this.validityColumns = [
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목명', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'fomlInfo', fieldName: 'fomlInfo', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '모델명', styleName: 'center-cell-text'},
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
            // {
            //     name: 'lot1',
            //     fieldName: 'lot1',
            //     type: 'data',
            //     width: '100',
            //     styleName: 'left-cell-text',
            //     header: {text: '입고일자', styleName: 'center-cell-text'},
            //     renderer: {
            //         showTooltip: true
            //     },
            // },
            {
                name: 'lot2',
                fieldName: 'lot2',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text',
                header: {text: '유효기간', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                },
            },
            // {
            //     name: 'retentionPeriod',
            //     fieldName: 'retentionPeriod',
            //     type: 'data',
            //     width: '100',
            //     styleName: 'left-cell-text',
            //    header: {text: '보유기간', styleName: 'center-cell-text'},
            //     renderer: {
            //         showTooltip: true
            //     },
            // },
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
                name: 'imminentPeriod',
                fieldName: 'imminentPeriod',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text',
                header: {text: '임박기간', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                },
            },
            {
                name: 'imminentType',
                fieldName: 'imminentType',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text',
                header: {
                    text: '임박유형',
                    styleName: 'center-cell-text blue-font-color',
                    template: '${headerText}<span class="material-icons text-13s text-bold-600 tooltip-hover-validity">\n' +
                        'help_outline\n' +
                        '<span class="tooltip-text-validity tooltip-validity">\n' +
                        'A Type: 3개월(위험), 6개월(상), 9개월(중), 12개월(하)<br>' +
                        'B Type: 2개월(위험), 4개월(상), 6개월(중), 8개월(하)<br>' +
                        'C Type: 1개월(위험), 2개월(상), 3개월(중), 4개월(하)</span></span>',
                    values: {'headerText': '임박유형'},
                },
                values: valueTypes,
                labels: lableTypes,
                lookupDisplay: true,
            },
            {
                name: 'imminentStatus',
                fieldName: 'imminentStatus',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text',
                header: {text: '임박상태', styleName: 'center-cell-text blue-font-color'},
                renderer: {
                    showTooltip: true
                },
            },
            // {
            //     name: 'validity', fieldName: 'validity', type: 'data', width: '100', styleName: 'right-cell-text'
            //     , header: {text: '유효기간', styleName: 'center-cell-text'}, numberFormat: '#,##0', renderer: {
            //         showTooltip: true
            //     },
            // },
        ];

        this.validityDataProvider = this._realGridsService.gfn_CreateDataProvider();

        const gridListOption = {
            stateBar: false,
            checkBar: true,
            footers: false,
        };

        this.validityDataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.validityDataProvider,
            'validity',
            this.validityColumns,
            this.validityFields,
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
        this.gridList.setCellStyleCallback((grid, dataCell) => {
            const ret = {styleName: ''};
            const imminentStatus = grid.getValue(dataCell.index.itemIndex, 'imminentStatus');

            if (imminentStatus === '위험') {
                if (dataCell.dataColumn.fieldName === 'imminentStatus') {
                    ret.styleName = 'center-cell-text red-cell-color';
                    return ret;
                }
            } else if (imminentStatus === '상') {
                if (dataCell.dataColumn.fieldName === 'imminentStatus') {
                    ret.styleName = 'center-cell-text orange-cell-color';
                    return ret;
                }
            } else if (imminentStatus === '중') {
                if (dataCell.dataColumn.fieldName === 'imminentStatus') {
                    ret.styleName = 'center-cell-text yellow-cell-color';
                    return ret;
                }
            } else if (imminentStatus === '하') {
                if (dataCell.dataColumn.fieldName === 'imminentStatus') {
                    ret.styleName = 'center-cell-text yellowgreen-cell-color';
                    return ret;
                }
            }

        });
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                if(this._realGridsService.gfn_GridDataCnt(this.gridList, this.validityDataProvider)){
                    this._realGridsService.gfn_GridLoadingBar(this.gridList, this.validityDataProvider, true);
                    const rtn = this._validityService.getHeader(this.validityPagenation.page, this.validityPagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
                    this.selectCallBack(rtn);
                }
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
        //this.selectHeader();
        this._changeDetectorRef.markForCheck();
        // this.setGridData();
        //
        // this._validityService.validityPagenation$
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((validityPagenation: ValidityPagenation) => {
        //         this.validityPagenation = validityPagenation;
        //         // Mark for check
        //         this._changeDetectorRef.markForCheck();
        //     });
    }

    selectHeader(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.validityDataProvider, true);
        const rtn = this._validityService.getHeader(0, 40, 'itemNm', 'asc', this.searchForm.getRawValue());
        //this.setGridData();
        this.selectCallBack(rtn);
    }

    setGridData(): void {
        this.validitys$ = this._validityService.validitys$;
        this._validityService.validitys$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((validity: any) => {
                if (validity !== null) {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.validityDataProvider, validity);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    //페이징
    pageEvent($event: PageEvent): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.validityDataProvider, true);
        const rtn = this._validityService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'itemNm', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '유효기간 목록');
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.selectHeader();
        }
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.validityDataProvider, ex.validity);
            this._validityService.validityPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((validityPagenation: ValidityPagenation) => {
                    // Update the pagination
                    this.validityPagenation = validityPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if (ex.validity.length < 1) {
                this._functionService.cfn_alert('검색된 정보가 없습니다.');
            }
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.validityDataProvider, false);
        });
    }

    setting(): void {
        if (!this.isMobile) {
            const d = this._matDialog.open(ValidityDetailComponent, {
                autoFocus: false,
                disableClose: true,
                data: {},
            });
            d.afterClosed().subscribe(() => {
                this.selectHeader();
            });
        } else {
            const d = this._matDialog.open(ValidityDetailComponent, {
                data: {},
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    d.updateSize('calc(100vw - 10px)', '');
                } else {
                }
            });
            d.afterClosed().subscribe(() => {
                this.selectHeader();
                smallDialogSubscription.unsubscribe();
            });
        }
    }
}
