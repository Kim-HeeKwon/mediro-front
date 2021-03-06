import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {merge, Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CommonCode, FuseUtilsService} from "../../../../../@teamplat/services/utils";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {Columns} from "../../../../../@teamplat/services/realgrid/realgrid.types";
import {FuseRealGridService} from "../../../../../@teamplat/services/realgrid";
import {CodeStore} from "../../../../core/common-code/state/code.store";
import {TeamPlatConfirmationService} from "../../../../../@teamplat/services/confirmation";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {DeviceDetectorService} from "ngx-device-detector";
import {UserInfoService} from "./user-info.service";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {UserInfoPagenation} from "./user-info.types";

@Component({
    selector: 'app-admin-user-info',
    templateUrl: './user-info.component.html',
    styleUrls: ['./user-info.component.scss'],
})
export class UserInfoComponent implements OnInit, OnDestroy, AfterViewInit{
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
    userDataProvider: RealGrid.LocalDataProvider;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    userColumns: Columns[];

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    userFields: DataFieldObject[] = [
        {fieldName: 'mId', dataType: ValueType.TEXT},
        {fieldName: 'businessNumber', dataType: ValueType.TEXT},
        {fieldName: 'businessName', dataType: ValueType.TEXT},
        {fieldName: 'payGrade', dataType: ValueType.TEXT},
        {fieldName: 'yearUser', dataType: ValueType.TEXT},
        {fieldName: 'midGrade', dataType: ValueType.TEXT},
        {fieldName: 'addDate', dataType: ValueType.TEXT},
        {fieldName: 'delFlag', dataType: ValueType.TEXT},
    ];

    constructor(private _realGridsService: FuseRealGridService,
                private _formBuilder: FormBuilder,
                private _codeStore: CodeStore,
                private _teamPlatConfirmationService: TeamPlatConfirmationService,
                private _router: Router,
                private _matDialog: MatDialog,
                public _matDialogPopup: MatDialog,
                private _utilService: FuseUtilsService,
                private _changeDetectorRef: ChangeDetectorRef,
                private _functionService: FunctionService,
                private _deviceService: DeviceDetectorService,
                private _userInfoService: UserInfoService,
                private readonly breakpointObserver: BreakpointObserver)
    {
        this.yearUser = _utilService.commonValue(_codeStore.getValue().data, 'YEAR_USER');
        this.payGrade = _utilService.commonValue(_codeStore.getValue().data, 'PAY_GRADE');

        this.isMobile = this._deviceService.isMobile();
    }
    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._userInfoService.getUserInfo(this._paginator.pageIndex, this._paginator.pageSize, 'businessName', 'asc', this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.userDataProvider);
    }

    ngOnInit(): void {
        // ?????? Form ??????
        this.searchForm = this._formBuilder.group({
            businessName: [''],
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

        const columnLayout = [
            'businessNumber',
            'businessName',
            {
                name: 'x',
                direction: 'horizontal',
                items: [
                    'payGrade',
                    'yearUser'
                ],
                header: {
                    text: '??????',
                }
            },
            'addDate',
            'midGrade',
        ];

        //????????? ??????
        this.userColumns = [
            {
                name: 'businessNumber', fieldName: 'businessNumber', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '???????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'businessName', fieldName: 'businessName', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '????????? ???', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'payGrade', fieldName: 'payGrade', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '?????? ??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                },
                values: valuesPayGrade,
                labels: lablesPayGrade,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.payGrade)
            },
            {
                name: 'yearUser', fieldName: 'yearUser', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '???/???', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                },
                values: valuesYearUser,
                labels: lablesYearUser,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.yearUser)
            },
            {
                name: 'addDate', fieldName: 'addDate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '?????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'midGrade', fieldName: 'midGrade', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
        ];

        //????????? Provider
        this.userDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //????????? ??????
        const gridListOption = {
            stateBar: false,
            checkBar: true,
            footers: false,
        };

        this.userDataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        //????????? ??????
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.userDataProvider,
            'userInfo',
            this.userColumns,
            this.userFields,
            gridListOption,
            columnLayout);

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
                if(this._realGridsService.gfn_GridDataCnt(this.gridList, this.userDataProvider)) {
                    this._realGridsService.gfn_GridLoadingBar(this.gridList, this.userDataProvider, true);
                    const rtn = this._userInfoService.getUserInfo(this.pagenation.page, this.pagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
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

        //????????? ??????
        this._paginator._intl.itemsPerPageLabel = '';

        //this.selectUser();
        this._changeDetectorRef.markForCheck();
    }

    selectUser() {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.userDataProvider, true);
        const rtn = this._userInfoService.getUserInfo(0, 100, 'addDate', 'desc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    //?????????
    pageEvent($event: PageEvent): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.userDataProvider, true);
        const rtn = this._userInfoService.getUserInfo(this._paginator.pageIndex, this._paginator.pageSize, 'addDate', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {
            this._realGridsService.gfn_DataSetGrid(this.gridList, this.userDataProvider, ex.userInfo);
            this._userInfoService.pagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((userInfoPagenation: UserInfoPagenation) => {
                    // Update the pagination
                    this.pagenation = userInfoPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if (ex.userInfo.length < 1) {
                this._functionService.cfn_alert('????????? ????????? ????????????.');
            }
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.userDataProvider, false);
        });
    }

    //?????? ????????????
    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, 'SaaS ????????? ?????? ??????');
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.selectUser();
        }
    }

}
