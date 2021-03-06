import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {FuseRealGridService} from "../../../../../@teamplat/services/realgrid";
import {DeviceDetectorService} from "ngx-device-detector";
import {merge, Subject} from "rxjs";
import * as moment from "moment";
import {Columns} from "../../../../../@teamplat/services/realgrid/realgrid.types";
import {ConnectionHistoryService} from "./connection-history.service";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {ConnectionHistoryPagenation} from "./connection-history.types";

@Component({
    selector: 'app-admin-connection-history',
    templateUrl: 'connection-history.component.html',
    styleUrls: ['./connection-history.component.scss']
})
export class ConnectionHistoryComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    drawerMode: 'over' | 'side' = 'over';
    orderBy: any = 'asc';
    drawerOpened: boolean = false;
    isLoading: boolean = false;
    isMobile: boolean = false;
    isSearchForm: boolean = false;
    pagenation: any | null = null;
    searchForm: FormGroup;
    columns: Columns[];
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gridList: RealGrid.GridView;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    dataProvider: RealGrid.LocalDataProvider;// @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    fields: DataFieldObject[] = [
        {fieldName: 'mId', dataType: ValueType.TEXT},
        {fieldName: 'businessNumber', dataType: ValueType.TEXT},
        {fieldName: 'businessId', dataType: ValueType.TEXT},
        {fieldName: 'connectDay', dataType: ValueType.TEXT},
        {fieldName: 'connectDate', dataType: ValueType.TEXT},
        {fieldName: 'connectTime', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(private _realGridsService: FuseRealGridService,
                private _deviceService: DeviceDetectorService,
                private _formBuilder: FormBuilder,
                private _functionService: FunctionService,
                private _connectionHistoryService: ConnectionHistoryService,
                private _changeDetectorRef: ChangeDetectorRef,) {
        this.isMobile = this._deviceService.isMobile();
    }

    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._connectionHistoryService.getConnectionHistory(this._paginator.pageIndex, this._paginator.pageSize, 'connectDate', 'desc', this.searchForm.getRawValue());
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
        // ?????? Form ??????
        this.searchForm = this._formBuilder.group({
            businessId: [''],
            range: [{
                start: moment().utc(true).add(-7, 'day').endOf('day').toISOString(),
                end: moment().utc(true).startOf('day').toISOString()
            }],
            start: [],
            end: [],
        });

        this.columns = [
            {
                name: 'businessNumber',
                fieldName: 'businessNumber',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text',
                header: {text: '???????????????', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'businessId', fieldName: 'businessId', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '?????? ID', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'connectDay', fieldName: 'connectDay', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '?????? ??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'connectDate', fieldName: 'connectDate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '?????? ??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'connectTime', fieldName: 'connectTime', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '?????? ??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
        ];

        //????????? Provider
        this.dataProvider = this._realGridsService.gfn_CreateDataProvider();

        //????????? ??????
        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        this.dataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        //????????? ??????
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.dataProvider,
            'connectionHistory',
            this.columns,
            this.fields,
            gridListOption);

        //????????? ??????
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

        //??????
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                if (this._realGridsService.gfn_GridDataCnt(this.gridList, this.dataProvider)) {
                    this._realGridsService.gfn_GridLoadingBar(this.gridList, this.dataProvider, true);
                    const rtn = this._connectionHistoryService.getConnectionHistory(this.pagenation.page, this.pagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
                    this.selectCallBack(rtn);
                }
            }
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };

        //????????? ??????
        this._paginator._intl.itemsPerPageLabel = '';

        //this.select();
        this._changeDetectorRef.markForCheck();
    }

    select(): void {
        this.isSearchForm = true;
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.dataProvider, true);
        const rtn = this._connectionHistoryService.getConnectionHistory(0, 100, 'connectDate', 'desc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {
            this._realGridsService.gfn_DataSetGrid(this.gridList, this.dataProvider, ex.connectionHistory);
            this._connectionHistoryService.pagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((connectionHistoryPagenation: ConnectionHistoryPagenation) => {
                    // Update the pagination
                    this.pagenation = connectionHistoryPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if(ex.connectionHistory.length < 1){
                this._functionService.cfn_alert('????????? ????????? ????????????.');
            }
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.dataProvider, false);
        });
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.select();
        }
    }

    //?????? ????????????
    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '?????? ??????');
    }

    pageEvent($event: PageEvent): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.dataProvider, true);
        const rtn = this._connectionHistoryService.getConnectionHistory(this._paginator.pageIndex, this._paginator.pageSize, 'connectDate', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    searchFormClick(): void {
        if (this.isSearchForm) {
            this.isSearchForm = false;
        } else {
            this.isSearchForm = true;
        }
    }

}
