import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component, Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {fuseAnimations} from "../../animations";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {FormBuilder, FormGroup} from "@angular/forms";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {Columns} from "../../services/realgrid/realgrid.types";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FuseRealGridService} from "../../services/realgrid";
import {CodeStore} from "../../../app/core/common-code/state/code.store";
import {TeamPlatConfirmationService} from "../../services/confirmation";
import {FunctionService} from "../../services/function";
import {CommonCode, FuseUtilsService} from "../../services/utils";
import {DeviceDetectorService} from "ngx-device-detector";
import {CommonUdiAccountService} from "./common-udi-account.service";
import {Pagenation} from "./common-udi-account.types";
import {takeUntil} from "rxjs/operators";

@Component({
    selector: 'app-common-udi-account',
    templateUrl: './common-udi-account.component.html',
    styleUrls: ['./common-udi-account.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class CommonUdiAccountComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    orderBy: any = 'desc';
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    pagenation: Pagenation | null = null;
    isLoading: boolean = false;
    isMobile: boolean = false;
    searchForm: FormGroup;
    cobFlagCode: CommonCode[] = [];
    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    dataProvider: RealGrid.LocalDataProvider;
    columns: Columns[];
    // @ts-ignore
    fields: DataFieldObject[] = [
        {fieldName: 'no', dataType: ValueType.TEXT},
        {fieldName: 'closeDate', dataType: ValueType.TEXT},
        {fieldName: 'rprsntName', dataType: ValueType.TEXT},
        {fieldName: 'entpName', dataType: ValueType.TEXT},
        {fieldName: 'cobFlagType', dataType: ValueType.TEXT},
        {fieldName: 'cobFlagCodeName', dataType: ValueType.TEXT},
        {fieldName: 'cobDetailName', dataType: ValueType.TEXT},
        {fieldName: 'entpAddrAll', dataType: ValueType.TEXT},
        {fieldName: 'entpAddr1', dataType: ValueType.TEXT},
        {fieldName: 'entpAddr2', dataType: ValueType.TEXT},
        {fieldName: 'hptlSymbl', dataType: ValueType.TEXT},
        {fieldName: 'unityCompanySeq', dataType: ValueType.TEXT},
        {fieldName: 'taxNo', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public matDialogRef: MatDialogRef<CommonUdiAccountComponent>,
        private _realGridsService: FuseRealGridService,
        public _matDialogPopup: MatDialog,
        private _commonUdiAccountService: CommonUdiAccountService,
        private _formBuilder: FormBuilder,
        private _codeStore: CodeStore,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _functionService: FunctionService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.cobFlagCode = _utilService.commonValue(_codeStore.getValue().data, 'COB_FLAG_CODE');
        this.isMobile = this._deviceService.isMobile();
    }
    ngAfterViewInit(): void {
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
            cobFlagCode: ['9'], // 판매
            entpName: [''],
            offset: [1],
            limit: [100],
        });

        this.columns = [
            {
                name: 'taxNo', fieldName: 'taxNo', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '사업자 번호', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'unityCompanySeq', fieldName: 'unityCompanySeq', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '거래처 코드', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'entpName', fieldName: 'entpName', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '거래처 명', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'rprsntName', fieldName: 'rprsntName', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '대표자명', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'cobFlagCodeName', fieldName: 'cobFlagCodeName', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '업종명', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'cobDetailName', fieldName: 'cobDetailName', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '종목', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'entpAddrAll', fieldName: 'entpAddrAll', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '업종 주소', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
        ];

        this.dataProvider = this._realGridsService.gfn_CreateDataProvider();

        const gridListOption = {
            stateBar: false,
            checkBar: true,
            footers: false,
        };

        this.dataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.dataProvider,
            'udiaccount',
            this.columns,
            this.fields,
            gridListOption,);

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
        this.gridList.onCellDblClicked = (grid, clickData) => {
            if (clickData.cellType !== 'header') {
                if (clickData.cellType !== 'head') {
                    const obj = new Object();
                    obj['row'] = grid.getValues(clickData.dataRow);
                    obj['cobFlagCode'] = this.searchForm.getRawValue().cobFlagCode;
                    console.log(obj);
                    this.matDialogRef.close(obj);
                }
            }
        };
        //페이지 라벨
        this._paginator._intl.itemsPerPageLabel = '';

        this._changeDetectorRef.markForCheck();
    }

    excelExport() {

        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '통합 업체 목록');
    }

    selectHeader() {
        const rtn = this._commonUdiAccountService.getAccount(0, 100, '', 'asc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {
            this._realGridsService.gfn_DataSetGrid(this.gridList, this.dataProvider, ex.list);
            this._commonUdiAccountService.pagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((pagenation: Pagenation) => {
                    // Update the pagination
                    this.pagenation = pagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        });
    }


    //페이징
    pageEvent($event: PageEvent): void {

        this.searchForm.patchValue({'offset': this._paginator.pageIndex + 1});
        this.searchForm.patchValue({'limit': this._paginator.pageSize});
        const rtn = this._commonUdiAccountService.getAccount(this._paginator.pageIndex + 1, this._paginator.pageSize, '', 'asc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }


    enter(event): void {
        if (event.keyCode === 13) {
            this.selectHeader();
        }
    }

    createEtcAccount() {
        const obj = new Object();
        obj['row'] = {
            'cobFlagCodeName' : '기타',
            'entpName' : '',
            'cobDetailName' : '',
            'rprsntName' : '',
            'companyName' : '',
            'entpAddrAll' : '',
        };
        obj['cobFlagCode'] = '99';
        this.matDialogRef.close(obj);
    }
}
