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
import {FuseUtilsService} from "../../../../../@teamplat/services/utils";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {DeviceDetectorService} from "ngx-device-detector";
import {UserService} from "./user.service";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {UserPagenation} from "./user.types";

@Component({
    selector: 'app-admin-user',
    templateUrl: 'user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy, AfterViewInit {
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
        {fieldName: 'email', dataType: ValueType.TEXT},
        {fieldName: 'phoneNumber', dataType: ValueType.TEXT},
        {fieldName: 'userName', dataType: ValueType.TEXT},
        {fieldName: 'addDate', dataType: ValueType.TEXT},
        {fieldName: 'delFlag', dataType: ValueType.TEXT},
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
                private _userService: UserService,
                private readonly breakpointObserver: BreakpointObserver)
    {
        this.isMobile = this._deviceService.isMobile();
    }
    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._userService.getUser(this._paginator.pageIndex, this._paginator.pageSize, 'businessName', 'asc', this.searchForm.getRawValue());
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
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            businessName: [''],
        });

        //그리드 컬럼
        this.userColumns = [
            {
                name: 'businessNumber', fieldName: 'businessNumber', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '사업자번호', styleName: 'center-cell-text'}, renderer: {
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
                name: 'userName', fieldName: 'userName', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '회원 명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'a', fieldName: 'a', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '구분', styleName: 'center-cell-text'}, renderer: {
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
                name: 'delFlag', fieldName: 'delFlag', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '회원구분', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'd', fieldName: 'd', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '가입채널', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'e', fieldName: 'e', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '지역', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'phoneNumber', fieldName: 'phoneNumber', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '알림톡(C.p)', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'g', fieldName: 'g', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '알림톡 승인여부', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'email', fieldName: 'email', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: 'E-mail', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'i', fieldName: 'i', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '방문횟수', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'j', fieldName: 'j', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '설문조사응답', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'k', fieldName: 'k', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '프로모션', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'm', fieldName: 'm', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '계정 수', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'n', fieldName: 'n', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '직원 수', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'q', fieldName: 'q', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '규모(매출 or 인원)', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'w', fieldName: 'w', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '기존 IT사용', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'x', fieldName: 'x', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '비고', styleName: 'center-cell-text'}, renderer: {
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
            //     values: valuesType,
            //     labels: lablesType,
            //     lookupDisplay: true,
            //     renderer: {
            //         showTooltip: true
            //     }
            // },
            // {
        ];

        //그리드 Provider
        this.userDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const gridListOption = {
            stateBar: false,
            checkBar: true,
            footers: false,
        };

        this.userDataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.userDataProvider,
            'user',
            this.userColumns,
            this.userFields,
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
                const rtn = this._userService.getUser(this.pagenation.page, this.pagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
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

        this.selectUser();
    }

    selectUser() {
        const rtn = this._userService.getUser(0, 100, 'addDate', 'desc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    //페이징
    pageEvent($event: PageEvent): void {
        const rtn = this._userService.getUser(this._paginator.pageIndex, this._paginator.pageSize, 'addDate', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            ex.user.forEach((data) => {
                if(data.phoneNumber === 0){
                    data.phoneNumber = '';
                }else{
                    data.phoneNumber = '0' + data.phoneNumber;
                }
            });

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.userDataProvider, ex.user);
            this._userService.pagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((userPagenation: UserPagenation) => {
                    // Update the pagination
                    this.pagenation = userPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if (ex.user.length < 1) {
                this._functionService.cfn_alert('검색된 정보가 없습니다.');
            }
        });
    }

    //엑셀 다운로드
    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, 'SaaS 회원사 목록');
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.selectUser();
        }
    }
}
