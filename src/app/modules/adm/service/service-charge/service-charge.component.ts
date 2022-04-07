import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {merge, Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {FormBuilder, FormGroup} from "@angular/forms";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {Columns} from "../../../../../@teamplat/services/realgrid/realgrid.types";
import {FuseRealGridService} from "../../../../../@teamplat/services/realgrid";
import {CodeStore} from "../../../../core/common-code/state/code.store";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {CommonCode, FuseUtilsService} from "../../../../../@teamplat/services/utils";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {DeviceDetectorService} from "ngx-device-detector";
import {ServiceChargeService} from "./service-charge.service";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {ServiceChargePagenation} from "./service-charge.types";

@Component({
    selector: 'app-admin-service-charge',
    templateUrl: 'service-charge.component.html',
    styleUrls: ['./service-charge.component.scss']
})
export class ServiceChargeComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    pagenation: any | null = null;
    isMobile: boolean = false;
    isLoading: boolean = false;
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    searchForm: FormGroup;
    orderBy: any = 'asc';

    yearUser: CommonCode[] = null;
    payGrade: CommonCode[] = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gridList: RealGrid.GridView;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    serviceChargeDataProvider: RealGrid.LocalDataProvider;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    serviceChargeColumns: Columns[];
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    serviceChargeFields: DataFieldObject[] = [
        {fieldName: 'payGrade', dataType: ValueType.TEXT},
        {fieldName: 'yearUser', dataType: ValueType.TEXT},
        {fieldName: 'priority', dataType: ValueType.TEXT},
        {fieldName: 'basePrice', dataType: ValueType.NUMBER},
        {fieldName: 'cntPrice', dataType: ValueType.NUMBER},
        {fieldName: 'useYn', dataType: ValueType.TEXT},
    ];
    constructor(private _realGridsService: FuseRealGridService,
                private _formBuilder: FormBuilder,
                private _codeStore: CodeStore,
                private _router: Router,
                private _matDialog: MatDialog,
                public _matDialogPopup: MatDialog,
                private _utilService: FuseUtilsService,
                private _changeDetectorRef: ChangeDetectorRef,
                private _functionService: FunctionService,
                private _deviceService: DeviceDetectorService,
                private _serviceChargeService: ServiceChargeService,
                private readonly breakpointObserver: BreakpointObserver)
    {
        this.isMobile = this._deviceService.isMobile();
        this.yearUser = _utilService.commonValue(_codeStore.getValue().data, 'YEAR_USER');
        this.payGrade = _utilService.commonValue(_codeStore.getValue().data, 'PAY_GRADE');
    }

    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._serviceChargeService.getServiceCharge(this._paginator.pageIndex, this._paginator.pageSize, 'priority', 'asc', this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.serviceChargeDataProvider);
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            payGrade: ['']
        });

        const valuesYearUser = [];
        const lablesYearUser = [];

        const valuesPayGrade = [];
        const lablesPayGrade = [];

        this.yearUser.forEach((param: any) => {
            valuesYearUser.push(param.id);
            lablesYearUser.push(param.name);
        });

        this.payGrade.forEach((param: any) => {
            valuesPayGrade.push(param.id);
            lablesPayGrade.push(param.name);
        });

        //그리드 컬럼
        this.serviceChargeColumns = [
            {
                name: 'payGrade', fieldName: 'payGrade', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '결제 등급', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                },
                values: valuesPayGrade,
                labels: lablesPayGrade,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.payGrade)
            },
            {
                name: 'yearUser', fieldName: 'yearUser', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '연/월', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                },
                values: valuesYearUser,
                labels: lablesYearUser,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.yearUser)
            },
            {
                name: 'basePrice',
                fieldName: 'basePrice',
                type: 'number',
                width: '150',
                styleName: 'right-cell-text',
                header: {text: '기본 사용료', styleName: 'center-cell-text'}, numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'cntPrice',
                fieldName: 'cntPrice',
                type: 'number',
                width: '150',
                styleName: 'right-cell-text',
                header: {text: '사용료 포함 금액(매월)', styleName: 'center-cell-text'}, numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            // {
            //     name: 'businessCondition',
            //     fieldName: 'businessCondition'
            //     ,
            //     type: 'data',
            //     width: '100',
            //     styleName: 'left-cell-text',
            //     header: {text: '업태', styleName: 'center-cell-text'},

            //     renderer: {
            //         showTooltip: true
            //     }
            // },
            // {
        ];

        //그리드 Provider
        this.serviceChargeDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const gridListOption = {
            stateBar: false,
            checkBar: true,
            footers: false,
        };

        this.serviceChargeDataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.serviceChargeDataProvider,
            'serviceCharge',
            this.serviceChargeColumns,
            this.serviceChargeFields,
            gridListOption);

        //그리드 옵션
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

        //정렬
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                const rtn = this._serviceChargeService.getServiceCharge(this.pagenation.page, this.pagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
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

        this.selectServiceCharge();
    }

    selectServiceCharge() {
        const rtn = this._serviceChargeService.getServiceCharge(0, 100, 'priority', 'asc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }
    //페이징
    pageEvent($event: PageEvent): void {
        const rtn = this._serviceChargeService.getServiceCharge(this._paginator.pageIndex, this._paginator.pageSize, 'priority', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            ex.serviceCharge.forEach((data) => {
            });

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.serviceChargeDataProvider, ex.serviceCharge);
            this._serviceChargeService.pagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((serviceChargePagenation: ServiceChargePagenation) => {
                    // Update the pagination
                    this.pagenation = serviceChargePagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if (ex.serviceCharge.length < 1) {
                this._functionService.cfn_alert('검색된 정보가 없습니다.');
            }
        });
    }

    //엑셀 다운로드
    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '서비스 요금 목록');
    }
    enter(event): void {
        if (event.keyCode === 13) {
            this.selectServiceCharge();
        }
    }
}
