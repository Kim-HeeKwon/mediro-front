import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit, ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {fuseAnimations} from "../../animations";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CommonCode, FuseUtilsService} from "../../services/utils";
import {CodeStore} from "../../../app/core/common-code/state/code.store";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {Columns} from "../../services/realgrid/realgrid.types";
import {FuseRealGridService} from "../../services/realgrid";
import {CommonUdiGridService} from "./common-udi-grid.service";
import {UdiGridPagenation} from "./common-udi-grid.types";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {Subject, merge, Observable} from "rxjs";
import {Pagenation} from "../common-udi-account/common-udi-account.types";
import {PopupPagenation} from "../common-popup/common-popup.types";
import {FunctionService} from "../../services/function";

@Component({
    selector: 'app-common-udi-grid',
    templateUrl: 'common-udi-grid.component.html',
    styleUrls: ['common-udi-grid.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class CommonUdiGridComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    getList$: Observable<any>;
    isLoading: boolean = false;
    popupCount: number = 0;
    url: string = '';
    mediroUrl: string = '';
    mergeData: string = '';
    headerText: string = 'UDI 공통팝업';
    searchForm: FormGroup;
    columnList: CommonCode[] = [];
    searchType: CommonCode[] = [];
    searchList: string[];
    merge: boolean = false;
    pagenation: UdiGridPagenation | null = null;
// @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gridList: RealGrid.GridView;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    commonUdiGridDataProvider: RealGrid.LocalDataProvider;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    commonUdiGridColumns: Columns[];
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    commonUdiGridFields: DataFieldObject[] = [
        {fieldName: 'taxNo', dataType: ValueType.TEXT},
        {fieldName: 'bcncCode', dataType: ValueType.TEXT},
        {fieldName: 'companyName', dataType: ValueType.TEXT},
        {fieldName: 'bossName', dataType: ValueType.TEXT},
        {fieldName: 'bcncCobFlagCodeNm', dataType: ValueType.TEXT},
        {fieldName: 'bcncCobDetailName', dataType: ValueType.TEXT},
        {fieldName: 'area', dataType: ValueType.TEXT},
        {fieldName: 'bcncUnityCompanySeq', dataType: ValueType.TEXT},
        {fieldName: 'bcncUnityCompanySeqs', dataType: ValueType.TEXT},
        {fieldName: 'cobFlagCode', dataType: ValueType.TEXT},
        {fieldName: 'entpAddr', dataType: ValueType.TEXT},
        {fieldName: 'entpAddr1', dataType: ValueType.TEXT},
        {fieldName: 'entpAddr2', dataType: ValueType.TEXT},
        {fieldName: 'hptlSymbl', dataType: ValueType.TEXT},
        {fieldName: 'mid', dataType: ValueType.TEXT},
        {fieldName: 'no', dataType: ValueType.TEXT},
        {fieldName: 'totalCnt', dataType: ValueType.TEXT}
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        public _matDialogRef: MatDialogRef<CommonUdiGridComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _realGridsService: FuseRealGridService,
        private _utilService: FuseUtilsService,
        private _functionService: FunctionService,
        private _codeStore: CodeStore,
        private _changeDetectorRef: ChangeDetectorRef,
        private _udiGridService: CommonUdiGridService,
        private _formBuilder: FormBuilder,)
    {
        this.url = data.url;
        this.mediroUrl = data.mediroUrl;
        this.columnList = _utilService.commonValue(_codeStore.getValue().data,data.code);
        this.merge = false;
        this.searchList = data.searchList;
        this.searchType = _utilService.commonValueSearchFilter(_codeStore.getValue().data,data.code, this.searchList);
        if(data.headerText){
            this.headerText = data.headerText;
        }
        if(data.merge){
            this.merge = data.merge;
            this.mergeData = data.mergeData;
        }
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            searchText: [''],
            searchType: [this.searchType[0].id],
            url: [''],
            mediroUrl: [''],
            tail: [''],
            accessToken: [''],
            //c5b5ddaf-70cf-4460-8697-f9d4b84ed77b
            offset: [1],
            limit: [100],
        });

        // 그리드 컬럼
        this.commonUdiGridColumns = [
            {
                name: 'taxNo', fieldName: 'taxNo', type: 'data', width: '180', styleName: 'left-cell-text'
                , header: {text: '사업자 등록 번호', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'bcncCode', fieldName: 'bcncCode', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '거래처 코드', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'companyName', fieldName: 'companyName', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '거래처 명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'bossName', fieldName: 'bossName', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '대표자 명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'bcncCobFlagCodeNm', fieldName: 'bcncCobFlagCodeNm', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '업태', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'bcncCobDetailName', fieldName: 'bcncCobDetailName', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '종목', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            }
        ];

        // 그리드 Provider
        this.commonUdiGridDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const gridListOption = {
            stateBar: false,
            checkBar: true,
            footers: false,
        };

        this.commonUdiGridDataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.commonUdiGridDataProvider,
            'commonUdiGrid',
            this.commonUdiGridColumns,
            this.commonUdiGridFields,
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

        this._changeDetectorRef.markForCheck();
    }

    ngAfterViewInit(): void {
        if(this._sort !== undefined){
            // Get products if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    this.searchForm.patchValue({'url': this.url});
                    this.searchForm.patchValue({'mediroUrl': this.mediroUrl});
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._udiGridService.getUdiGrid(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchForm.getRawValue());
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).subscribe();
        }
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.commonUdiGridDataProvider);
    }

    mergeUdiData(): void {
        if(this.merge){
            let rowData;
            this._udiGridService.getList$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((getList: any) => {
                    // Update the counts
                    if(getList !== null){
                        rowData = getList;
                    }

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if(this.mergeData === 'account'){
                if(!this._realGridsService.gfn_GridDataCnt(this.gridList, this.commonUdiGridDataProvider)){
                    this._functionService.cfn_alert('데이터가 없습니다. 먼저 조회하세요.');
                }else{
                    this._udiGridService.mergeAccount(rowData)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((salesOrder: any) => {
                            this._functionService.cfn_loadingBarClear();
                            this._functionService.cfn_alertCheckMessage(salesOrder);
                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                            this._matDialogRef.close();
                        });
                }
            }else{
                this._functionService.cfn_alert('설정 정보가 존재하지 않습니다.');
            }
        }else{
            this._functionService.cfn_alert('설정 정보가 존재하지 않습니다.');
        }
    }

    select(): void{
        // @ts-ignore
        this.searchForm.patchValue({'url': this.url});
        this.searchForm.patchValue({'mediroUrl': this.mediroUrl});
        const rtn = this._udiGridService.getUdiGrid(0,100,'','asc',this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    pageChange(evt: any): void{
        this.searchForm.patchValue({'offset': this._paginator.pageIndex + 1});
        this.searchForm.patchValue({'limit': this._paginator.pageSize});
        this._udiGridService.getUdiGrid(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchForm.getRawValue());
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {
            this._realGridsService.gfn_DataSetGrid(this.gridList, this.commonUdiGridDataProvider, ex._value);
            this._udiGridService.pagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((pagenation: Pagenation) => {
                    // Update the pagination
                    this.pagenation = pagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        });
    }
}
