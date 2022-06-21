import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CommonCode, CommonPopup, FuseUtilsService} from '@teamplat/services/utils';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CommonPopupItemsService} from './common-popup-items.service';
import {BehaviorSubject, merge, Observable, Subject} from 'rxjs';
import {PopupPagenation} from './common-popup-items.types';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {MatSort} from '@angular/material/sort';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {fuseAnimations} from '@teamplat/animations';
import {PopupStore} from '../../../app/core/common-popup/state/popup.store';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {FuseRealGridService} from '../../services/realgrid';
import {Columns} from '../../services/realgrid/realgrid.types';
import {EstimateHeaderPagenation} from "../../../app/modules/dms/estimate-order/estimate/estimate.types";
import {FunctionService} from "../../services/function";

export interface DisplayedColumn {
    id: string;
}

export interface Column {
    id: string;
    name: string;
    width?: string;
}

@Component({
    selector: 'app-common-popup-items',
    templateUrl: './common-popup-items.component.html',
    styleUrls: ['./common-popup-items.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class CommonPopupItemsComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    isLoading: boolean = false;
    popupCount: number = 0;
    loading: boolean = false;
    displayedColumns: DisplayedColumn[] = [];
    clickedRows = new Set<any>();
    getList$: Observable<any>;
    searchForm: FormGroup;
    popupInfo: CommonPopup[] = null;
    asPopupCd: string;
    pagenation: PopupPagenation | null = null;
    where: any;

    commonValues: Column[] = [];
    headerText: string = '공통팝업';
    orderBy: any = 'desc';
    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    popupDataProvider: RealGrid.LocalDataProvider;
    popupFields: DataFieldObject[] = [];
    popupColumns: Columns[] = [];

    type: CommonCode[] = [];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public _matDialogRef: MatDialogRef<CommonPopupItemsComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _realGridsService: FuseRealGridService,
        private _utilService: FuseUtilsService,
        private _functionService: FunctionService,
        private _formBuilder: FormBuilder,
        private _popupService: CommonPopupItemsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _popupStore: PopupStore) {
        this.popupInfo = _utilService.commonPopupValue(_popupStore.getValue().data, data.popup);
        this.asPopupCd = data.popup;
        if (data.headerText) {
            this.headerText = data.headerText;
        }
        this.where = data.where;
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            searchText: [''],
            type: [''],
            asPopupCd: [''],
            acWhereVal: ['']
        });
        this.popupInfo.forEach((param: any) => {
            const commonValue: Column = {
                id: param.extColId,              //컬럼ID;
                name: param.extColNm,            //컬럼명;
                width: param.extColWidVal,
            };
            if (param.extColCondGbnVal !== '' && param.extColCondGbnVal !== null) {
                this.type.push({
                    id: param.extColId,
                    name: param.extColNm,
                });
            }

            if (param.extColCondGbnVal === 'W') {
                this.searchForm.patchValue({'type': param.extColId});
            }

            this.displayedColumns.push(param.extColId);
            this.commonValues.push(commonValue);

        });

        if (this.displayedColumns) {
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < this.displayedColumns.length; i++) {
                // @ts-ignore
                this.popupFields.push({fieldName: this.displayedColumns[i], dataType: ValueType.TEXT});
            }
        }

        if (this.commonValues) {
            this.commonValues.forEach((param: any) => {
                this.popupColumns.push({
                    name: param.id, fieldName: param.id, type: 'data'
                    , width: param.width === '' ? '100' : param.width, styleName: 'left-cell-text'
                    , header: {text: param.name, styleName: 'center-cell-text'}
                });
            });
        }
        //그리드 Provider
        this.popupDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const gridListOption = {
            stateBar: false,
            checkBar: false,
            footers: false,
        };

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.popupDataProvider,
            'popupGrid',
            this.popupColumns,
            this.popupFields,
            gridListOption);

        //그리드 옵션
        this.gridList.setEditOptions({
            readOnly: true,
            insertable: false,
            appendable: false,
            editable: false,
            //deletable: true,
            checkable: false,
            softDeleting: false,
            //hideDeletedRows: true,
        });
        this.gridList.setDisplayOptions({liveScroll: false,});
        this.gridList.setPasteOptions({enabled: false,});


        //정렬
        if (this.orderBy === 'asc') {
            this.orderBy = 'desc';
        } else {
            this.orderBy = 'asc';
        }

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellDblClicked = (grid, clickData) => {
            this._matDialogRef.close(grid.getValues(clickData.dataRow));
            // this._matDialogRef.afterClosed().subscribe(() => {
            //     this._popupService.setInitList();
            // });
        };
        //페이지 라벨
        this._paginator._intl.itemsPerPageLabel = '';

        this.setGridData();

        // Get the pagenation
        this._popupService.pagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagenation: PopupPagenation) => {
                // Update the pagination
                this.pagenation = pagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        // Get products if sort or page changes
        merge(this._paginator.page).pipe(
            switchMap(() => {
                let whereVal;
                const curVal = this.searchForm.controls['type'].value;
                const textCond = this.searchForm.controls['searchText'].value;

                // eslint-disable-next-line @typescript-eslint/naming-convention
                const ds_combo = this.popupInfo.filter((item: any) => item.extColId === curVal).map((param: any) => param);

                if (textCond === '') {
                    whereVal = 'K:LIKE_BOTH:';
                } else {
                    whereVal = ds_combo[0].extColCondGbnVal + ':' + ds_combo[0].extEtcQryColCondVal + ':' + textCond;
                }
                this.searchForm.patchValue({'asPopupCd': this.asPopupCd});
                this.searchForm.patchValue({'acWhereVal': whereVal});
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._popupService.getDynamicSql(this._paginator.pageIndex, this._paginator.pageSize, '', this.orderBy, this.searchForm.getRawValue());
            }),
            map(() => {
                this.isLoading = false;
            })
        ).subscribe();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this.popupCount = 0;
        // this.pagenation = null;
        this._popupService.setInitList();
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.popupDataProvider);
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param account
     */
    trackByFn(index: number, data: any): any {
        return data.id || index;
    }

    selectRow(row: any): void {
        this._matDialogRef.close(row);
    }

    select(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.popupDataProvider, true);
        let whereVal;
        const curVal = this.searchForm.controls['type'].value;
        const textCond = this.searchForm.controls['searchText'].value;
        if (this.where !== undefined) {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const ds_combo = this.popupInfo.filter((item: any) => item.extColId === curVal).map((param: any) => param);

            if (textCond === '') {
                whereVal = 'K:LIKE_BOTH:';
            } else {
                whereVal = ds_combo[0].extColCondGbnVal + ':' + ds_combo[0].extEtcQryColCondVal + ':' + textCond;
            }

            const listWhere = this.where.split(',');
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < listWhere.length; i++) {
                const tmpStr = listWhere[i];
                const tmpArr = tmpStr.split(':');
                if (tmpArr[2] === 'K' || tmpArr[2] === 'W') {
                    continue;
                }
                if (tmpArr[2] === ('' && null && undefined)) {
                    continue;
                }
                whereVal += '|' + tmpArr[0] + ':' + tmpArr[1] + ':' + tmpArr[2];
            }
        } else {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const ds_combo = this.popupInfo.filter((item: any) => item.extColId === curVal).map((param: any) => param);

            if (textCond === '') {
                whereVal = 'K:LIKE_BOTH:';
            } else {
                whereVal = ds_combo[0].extColCondGbnVal + ':' + ds_combo[0].extEtcQryColCondVal + ':' + textCond;
            }
        }

        this.searchForm.patchValue({'asPopupCd': this.asPopupCd});
        this.searchForm.patchValue({'acWhereVal': whereVal});
        const rtn = this._popupService.getDynamicSql(0, 300, '', 'asc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
        // this.setGridData();
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {
            this._realGridsService.gfn_DataSetGrid(this.gridList, this.popupDataProvider, ex.estimateHeader);
            this._popupService.getList$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((pagenation: PopupPagenation) => {
                    // Update the pagination
                    this.pagenation = pagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if(ex._value.length < 1){
                this._functionService.cfn_alert('검색된 정보가 없습니다.');
            }
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.popupDataProvider, false);
        });
    }

    getProperty(element, id: string): string {
        return element[id];
    }

    //페이징
    pageEvent($event: PageEvent): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.popupDataProvider, true);
        const rtn = this._popupService.getDynamicSql(this._paginator.pageIndex, this._paginator.pageSize, '', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    setGridData(): void {

        this._popupService.getList$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((gridList: any) => {
                // Update the counts
                if (gridList !== null) {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.popupDataProvider, gridList);
                }
                // this._realGridsService.gfn_GridLoadingBar(this.gridList, this.popupDataProvider, false);
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

    }
}
