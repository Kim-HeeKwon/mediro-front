import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {FuseRealGridService} from "../../../../../@teamplat/services/realgrid";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {Columns} from "../../../../../@teamplat/services/realgrid/realgrid.types";
import {DeviceDetectorService} from "ngx-device-detector";
import {merge, Subject} from "rxjs";
import {UserListService} from "./user-list.service";
import {map, switchMap} from "rxjs/operators";

@Component({
    selector: 'app-admin-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy, AfterViewInit{
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    drawerMode: 'over' | 'side' = 'over';
    pagenation: any | null = null;
    drawerOpened: boolean = false;
    isLoading: boolean = false;
    isMobile: boolean = false;
    orderBy: any = 'asc';
    searchForm: FormGroup;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gridList: RealGrid.GridView;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    userListDataProvider: RealGrid.LocalDataProvider;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    userListColumns: Columns[];
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    userListFields: DataFieldObject[] = [
        {fieldName: 'mId', dataType: ValueType.TEXT},
        {fieldName: 'businessNumber', dataType: ValueType.TEXT},
        {fieldName: 'businessName', dataType: ValueType.TEXT},
        {fieldName: 'businessId', dataType: ValueType.TEXT},
        {fieldName: 'addDate', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(private _realGridsService: FuseRealGridService,
                private _changeDetectorRef: ChangeDetectorRef,
                private _deviceService: DeviceDetectorService,
                private _formBuilder: FormBuilder,
                private _userListService: UserListService)
    {
        this.isMobile = this._deviceService.isMobile();
    }
    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._userListService.getUserList(this._paginator.pageIndex, this._paginator.pageSize, 'businessName', 'asc', this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.userListDataProvider);
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            businessName: [''],
        });

        //그리드 컬럼
        this.userListColumns = [
            {
                name: 'businessNumber', fieldName: 'businessNumber', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '사업자번호', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'addDate', fieldName: 'addDate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '가입일', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'businessName', fieldName: 'businessName', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '회원사 명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'businessId', fieldName: 'businessId', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '회원 ID', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
        ];

        //그리드 Provider
        this.userListDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const gridListOption = {
            stateBar: false,
            checkBar: true,
            footers: false,
        };

        this.userListDataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.userListDataProvider,
            'userList',
            this.userListColumns,
            this.userListFields,
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
                const rtn = this._userListService.getUserList(this.pagenation.page, this.pagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
                this.selectCallBack(rtn);
            };
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };

        //페이지 라벨
        this._paginator._intl.itemsPerPageLabel = '';

        //this.selectUser();
        this._changeDetectorRef.markForCheck();
    }

    select(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.userListDataProvider, true);
        const rtn = this._userListService.getUserList(0, 100, 'addDate', 'desc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    selectCallBack(rtn: any): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.userListDataProvider, false);
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.select();
        }
    }

    //엑셀 다운로드
    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '사용자 목록');
    }

    //페이징
    pageEvent($event: PageEvent): void {
        const rtn = this._userListService.getUserList(this._paginator.pageIndex, this._paginator.pageSize, 'addDate', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }



}
