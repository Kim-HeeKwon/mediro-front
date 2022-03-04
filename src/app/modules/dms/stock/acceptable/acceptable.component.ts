import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {Columns} from '../../../../../@teamplat/services/realgrid/realgrid.types';
import {Acceptable, AcceptablePagenation} from './acceptable.types';
import {FuseRealGridService} from '../../../../../@teamplat/services/realgrid';
import {MatDialog} from '@angular/material/dialog';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {DeviceDetectorService} from 'ngx-device-detector';
import {AcceptableService} from './acceptable.service';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {FunctionService} from "../../../../../@teamplat/services/function";
import {AcceptableDetailComponent} from "./acceptable-detail/acceptable-detail.component";

@Component({
    selector: 'dms-app-acceptable',
    templateUrl: './acceptable.component.html',
    styleUrls: ['./acceptable.component.scss']
})
export class AcceptableComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    drawerMode: 'over' | 'side' = 'over';
    orderBy: any = 'asc';
    acceptables$: Observable<Acceptable[]>;
    drawerOpened: boolean = false;
    isMobile: boolean = false;
    acceptablePagenation: AcceptablePagenation | null = null;
    searchForm: FormGroup;
    itemGrades: CommonCode[] = [];
    acceptableType: CommonCode[] = [];

    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    acceptableDataProvider: RealGrid.LocalDataProvider;
    acceptableColumns: Columns[];
    // @ts-ignore
    acceptableFields: DataFieldObject[] = [
        {fieldName: 'account', dataType: ValueType.TEXT},
        {fieldName: 'accountNm', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'ibDate', dataType: ValueType.TEXT},
        {fieldName: 'validity', dataType: ValueType.TEXT},
        {fieldName: 'acceptableType', dataType: ValueType.TEXT},
        {fieldName: 'thirty', dataType: ValueType.NUMBER},
        {fieldName: 'thirtyBysixty', dataType: ValueType.NUMBER},
        {fieldName: 'sixtyByninety', dataType: ValueType.NUMBER},
        {fieldName: 'ninety', dataType: ValueType.NUMBER},
        {fieldName: 'availQty', dataType: ValueType.NUMBER},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _realGridsService: FuseRealGridService,
        private _matDialog: MatDialog,
        private _acceptableService: AcceptableService,
        private _formBuilder: FormBuilder,
        private _functionService: FunctionService,
        private _utilService: FuseUtilsService,
        private _codeStore: CodeStore,
        private _deviceService: DeviceDetectorService,
        private _changeDetectorRef: ChangeDetectorRef,
        private readonly breakpointObserver: BreakpointObserver) {
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_GRADE');
        this.acceptableType = _utilService.commonValue(_codeStore.getValue().data, 'ACCEPTABLE_TYPE');
        this.isMobile = this._deviceService.isMobile();
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
        this.acceptableType.forEach((param: any) => {
            valueTypes.push(param.id);
            lableTypes.push(param.name);
        });

        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            accountNm: [''],
            itemNm: [''],
        });

        const columnLayout = [
            //'account',
            'accountNm',
            'itemCd',
            'itemNm',
            'standard',
            'unit',
            'itemGrade',
            'acceptableType',
            {
                name: 'acceptable',
                direction: 'horizontal',
                items: [
                    'thirty',
                    'thirtyBysixty',
                    'sixtyByninety',
                    'ninety',
                    'availQty',
                ],
                header: {
                    text: '가납 기간 및 재고수량',
                    styleName: 'blue-font-color',
                }
            },
        ];

        //그리드 컬럼
        this.acceptableColumns = [
            {
                name: 'account', fieldName: 'account', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '거래처 코드', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'accountNm', fieldName: 'accountNm', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '거래처 명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '품목명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'standard', fieldName: 'standard', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '규격', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'unit', fieldName: 'unit', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '단위', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemGrade', fieldName: 'itemGrade', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '품목등급', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                },
                values: values,
                labels: lables,
                lookupDisplay: true,
            },
            {
                name: 'acceptableType', fieldName: 'acceptableType', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: 'Alert 유형', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                },
                values: valueTypes,
                labels: lableTypes,
                lookupDisplay: true,
            },
            {
                name: 'thirty',
                fieldName: 'thirty',
                type: 'data',
                width: '100',
                styleName: 'right-cell-text',
                header: {text: '~30일', styleName: 'center-cell-text blue-font-color'},
                numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'thirtyBysixty',
                fieldName: 'thirtyBysixty',
                type: 'data',
                width: '100',
                styleName: 'right-cell-text',
                header: {text: '31~60일', styleName: 'center-cell-text blue-font-color'},
                numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'sixtyByninety',
                fieldName: 'sixtyByninety',
                type: 'data',
                width: '100',
                styleName: 'right-cell-text',
                header: {text: '61~90일', styleName: 'center-cell-text blue-font-color'},
                numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'ninety',
                fieldName: 'ninety',
                type: 'data',
                width: '100',
                styleName: 'right-cell-text',
                header: {text: '91일~', styleName: 'center-cell-text blue-font-color'},
                numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'availQty',
                fieldName: 'availQty',
                type: 'data',
                width: '100',
                styleName: 'right-cell-text',
                header: {text: '합계', styleName: 'center-cell-text blue-font-color'},
                numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            // {
            //     name: 'ibDate', fieldName: 'ibDate', type: 'data', width: '100', styleName: 'left-cell-text'
            //     , header: {text: '입고일자', styleName: 'center-cell-text'}, renderer: {
            //         showTooltip: true
            //     }
            // },
            // {
            //     name: 'validity', fieldName: 'validity', type: 'data', width: '100', styleName: 'left-cell-text'
            //     , header: {text: '유효기간', styleName: 'center-cell-text'}, renderer: {
            //         showTooltip: true
            //     }
            // },
        ];

        this.acceptableDataProvider = this._realGridsService.gfn_CreateDataProvider();

        const gridListOption = {
            stateBar: false,
            checkBar: true,
            footers: false,
        };

        this.acceptableDataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.acceptableDataProvider,
            'acceptable',
            this.acceptableColumns,
            this.acceptableFields,
            gridListOption,
            columnLayout);

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
                const rtn = this._acceptableService.getHeader(this.acceptablePagenation.page, this.acceptablePagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
                this.selectCallBack(rtn);
            }
            ;
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };

        this.gridList.setCellStyleCallback((grid, dataCell) => {
            const ret = {styleName : ''};
            const acceptableType = grid.getValue(dataCell.index.itemIndex, 'acceptableType');
            if(Number(acceptableType) === 30){
                if (dataCell.dataColumn.fieldName === 'thirtyBysixty' ||
                    dataCell.dataColumn.fieldName === 'sixtyByninety' ||
                    dataCell.dataColumn.fieldName === 'ninety') {
                    ret.styleName = 'right-cell-text orange-cell-color';
                    return ret;
                }
            }else if(Number(acceptableType) === 60){
                if (dataCell.dataColumn.fieldName === 'sixtyByninety' ||
                    dataCell.dataColumn.fieldName === 'ninety') {

                    ret.styleName = 'right-cell-text orange-cell-color';
                    return ret;
                }
            }else if(Number(acceptableType) === 90){
                if (dataCell.dataColumn.fieldName === 'ninety') {
                    ret.styleName = 'right-cell-text orange-cell-color';
                    return ret;
                }
            }

        });

        //페이지 라벨
        this._paginator._intl.itemsPerPageLabel = '';

        this.selectHeader();
        this._changeDetectorRef.markForCheck();
        // this.setGridData();
        // this._acceptableService.acceptablePagenation$
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((acceptablePagenation: AcceptablePagenation) => {
        //         this.acceptablePagenation = acceptablePagenation;
        //         // Mark for check
        //         this._changeDetectorRef.markForCheck();
        //     });
    }

    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() =>
                // eslint-disable-next-line max-len
                 this._acceptableService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'accountNm', this.orderBy, this.searchForm.getRawValue())
            ),
            map(() => {
            })
        ).subscribe();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.acceptableDataProvider);
    }

    setGridData(): void {
        this.acceptables$ = this._acceptableService.acceptables$;
        this._acceptableService.acceptables$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((acceptable: any) => {
                if (acceptable !== null) {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.acceptableDataProvider, acceptable);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    selectHeader(): void {
        const rtn = this._acceptableService.getHeader(0, 40, 'accountNm', 'asc', this.searchForm.getRawValue());
        //this.setGridData();
        this.selectCallBack(rtn);
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.selectHeader();
        }
    }

    //페이징
    pageEvent($event: PageEvent): void {
        const rtn = this._acceptableService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'accountNm', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '가납재고 목록');
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.acceptableDataProvider, ex.acceptable);
            this._acceptableService.acceptablePagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((acceptablePagenation: AcceptablePagenation) => {
                    // Update the pagination
                    this.acceptablePagenation = acceptablePagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if(ex.acceptable.length < 1){
                this._functionService.cfn_alert('검색된 정보가 없습니다.');
            }
        });
    }

    setting(): void{

        if (!this.isMobile) {
            const d = this._matDialog.open(AcceptableDetailComponent, {
                autoFocus: false,
                disableClose: true,
                data: {

                },
            });
            d.afterClosed().subscribe(() => {
                this.selectHeader();
            });
        } else {
            const d = this._matDialog.open(AcceptableDetailComponent, {
                data: {

                },
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
