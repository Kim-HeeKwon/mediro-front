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
import {FeeUserService} from "./fee-user.service";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {UserPagenation} from "../../user/user/user.types";
import {FeeUserPagenation} from "./fee-user.types";

@Component({
    selector: 'app-admin-fee-user',
    templateUrl: 'fee-user.component.html',
    styleUrls: ['./fee-user.component.scss']
})
export class FeeUserComponent implements OnInit, OnDestroy, AfterViewInit {
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
    dataProvider: RealGrid.LocalDataProvider;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    columns: Columns[];
    year: CommonCode[] = null;
    month: CommonCode[] = null;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    fields: DataFieldObject[] = [
        {fieldName: 'mId', dataType: ValueType.TEXT},
        {fieldName: 'businessNumber', dataType: ValueType.TEXT},
        {fieldName: 'businessName', dataType: ValueType.TEXT},
        {fieldName: 'addDate', dataType: ValueType.TEXT},
        {fieldName: 'payYn', dataType: ValueType.TEXT},
        {fieldName: 'freeYn', dataType: ValueType.TEXT},
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
                private _feeUserService: FeeUserService,
                private readonly breakpointObserver: BreakpointObserver)
    {
        this.isMobile = this._deviceService.isMobile();
        this.year = _utilService.commonValue(_codeStore.getValue().data, 'YEAR');
        this.month = _utilService.commonValue(_codeStore.getValue().data, 'MONTH');
    }
    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._feeUserService.getFeeUser(this._paginator.pageIndex, this._paginator.pageSize, 'addDate', 'desc', this.searchForm.getRawValue());
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
        const today = new Date();
        const YYYY = today.getFullYear();
        const mm = today.getMonth() + 1; //January is 0!
        let MM;
        if (mm < 10) {
            MM = String('0' + mm);
        } else {
            MM = String(mm);
        }
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            year: [YYYY + ''],
            month: [MM + ''],
            businessName: ['']
        });

        //그리드 컬럼
        this.columns = [
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
                name: 'addDate', fieldName: 'addDate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '가입일', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            // {
            //     name: 'december',
            //     fieldName: 'december',
            //     type: 'number',
            //     width: '100',
            //     styleName: 'right-cell-text',
            //     header: {text: '12월', styleName: 'center-cell-text'}, numberFormat: '#,##0', renderer: {
            //         showTooltip: true
            //     }
            // },
            // {
            //     name: 'payYn', fieldName: 'payYn', type: 'data', width: '150', styleName: 'left-cell-text'
            //     , header: {text: '정기서비스 신청여부', styleName: 'center-cell-text'}, renderer: {
            //         showTooltip: true
            //     }
            // },
        ];

        //그리드 Provider
        this.dataProvider = this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const gridListOption = {
            stateBar: false,
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
            'feeUser',
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
                const rtn = this._feeUserService.getFeeUser(this.pagenation.page, this.pagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
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

        this.select();
    }


    select() {
        const rtn = this._feeUserService.getFeeUser(0, 100, 'addDate', 'desc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    //페이징
    pageEvent($event: PageEvent): void {
        const rtn = this._feeUserService.getFeeUser(this._paginator.pageIndex, this._paginator.pageSize, 'addDate', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            ex.feeUser.forEach((data) => {
                // if(data.phoneNumber === 0){
                //     data.phoneNumber = '';
                // }else{
                //     data.phoneNumber = '0' + data.phoneNumber;
                // }
            });

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.dataProvider, ex.feeUser);
            this._feeUserService.pagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((feeUserPagenation: FeeUserPagenation) => {
                    // Update the pagination
                    this.pagenation = feeUserPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if (ex.feeUser.length < 1) {
                this._functionService.cfn_alert('검색된 정보가 없습니다.');
            }
        });
    }

    //엑셀 다운로드
    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '사용료 목록');
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.select();
        }
    }

}
