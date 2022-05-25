import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {FuseRealGridService} from "../../../../../@teamplat/services/realgrid";
import {DeviceDetectorService} from "ngx-device-detector";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {Columns} from "../../../../../@teamplat/services/realgrid/realgrid.types";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {merge, Subject} from "rxjs";
import {map, switchMap} from "rxjs/operators";
import {SchedulerHistoryService} from "./scheduler-history.service";
import * as moment from "moment";

@Component({
    selector: 'app-admin-scheduler-history',
    templateUrl: 'scheduler-history.component.html',
    styleUrls: ['./scheduler-history.component.scss']
})
export class SchedulerHistoryComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    drawerMode: 'over' | 'side' = 'over';
    orderBy: any = 'asc';
    drawerOpened: boolean = false;
    isMobile: boolean = false;
    isLoading: boolean = false;
    pagenation: any | null = null;
    searchForm: FormGroup;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gridList: RealGrid.GridView;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    dataProvider: RealGrid.LocalDataProvider;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    columns: Columns[];
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    fields: DataFieldObject[] = [
        {fieldName: 'mId', dataType: ValueType.TEXT},
        {fieldName: 'schedulerNo', dataType: ValueType.TEXT},
        {fieldName: 'schedulerName', dataType: ValueType.TEXT},
        {fieldName: 'schedulerDay', dataType: ValueType.TEXT},
        {fieldName: 'schedulerDate', dataType: ValueType.TEXT},
        {fieldName: 'schedulerTime', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(private _realGridsService: FuseRealGridService,
                private _deviceService: DeviceDetectorService,
                private _schedulerHistoryService: SchedulerHistoryService,
                private _changeDetectorRef: ChangeDetectorRef,
                private _formBuilder: FormBuilder,)
    {
        this.isMobile = this._deviceService.isMobile();
    }

    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._schedulerHistoryService.getSchedulerHistory(this._paginator.pageIndex, this._paginator.pageSize, 'schedulerDate', 'desc', this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.dataProvider);
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            range: [{
                start: moment().utc(true).add(-7, 'day').endOf('day').toISOString(),
                end: moment().utc(true).startOf('day').toISOString()
            }],
            start: [],
            end: [],
        });

        this.columns = [
            {
                name: 'schedulerNo', fieldName: 'schedulerNo', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '작업 번호', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'schedulerName', fieldName: 'schedulerName', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '작업 명', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'schedulerDay', fieldName: 'schedulerDay', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '작업 일자', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'schedulerDate', fieldName: 'schedulerDate', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '작업 날자', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'schedulerTime', fieldName: 'schedulerTime', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '작업 시간', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
        ];

        //그리드 Provider
        this.dataProvider = this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        this.dataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.dataProvider,
            'schedulerHistory',
            this.columns,
            this.fields,
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
            }
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };

        //페이지 라벨
        this._paginator._intl.itemsPerPageLabel = '';

        this._changeDetectorRef.markForCheck();
    }

    //페이징
    pageEvent($event: PageEvent): void {
        const rtn = this._schedulerHistoryService.getSchedulerHistory(this._paginator.pageIndex, this._paginator.pageSize, 'schedulerDate', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    select(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.dataProvider, true);
        const rtn = this._schedulerHistoryService.getSchedulerHistory(0, 100, 'schedulerDate', 'desc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    selectCallBack(rtn: any): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.dataProvider, false);

    }

    //엑셀 다운로드
    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '스케줄러 이력');
    }

}
