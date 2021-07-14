import {
    AfterViewInit, ChangeDetectionStrategy,
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
import {CommonPopupService} from './common-popup.service';
import {BehaviorSubject, merge, Observable, Subject} from 'rxjs';
import {PopupPagenation} from './common-popup.types';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {fuseAnimations} from '@teamplat/animations';
import {PopupStore} from '../../../app/core/common-popup/state/popup.store';

export interface DisplayedColumn{
    id: string;
}

export interface Column{
    id: string;
    name: string;
}

@Component({
    selector: 'app-common-popup',
    templateUrl: './common-popup.component.html',
    styleUrls: ['./common-popup.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class CommonPopupComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    isLoading: boolean = false;
    popupCount: number = 0;
    displayedColumns: DisplayedColumn[] = [];
    clickedRows = new Set<any>();
    getList$: Observable<any>;
    searchForm: FormGroup;
    popupInfo: CommonPopup[] = null;
    asPopupCd: string;
    pagenation: PopupPagenation | null = null;

    commonValues: Column[] = [];
    headerText: string = '공통팝업';

    type: CommonCode[] = [];

    private _dataSet: BehaviorSubject<any> = new BehaviorSubject(null);
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        public _matDialogRef: MatDialogRef<CommonPopupComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _utilService: FuseUtilsService,
        private _formBuilder: FormBuilder,
        private _popupService: CommonPopupService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _popupStore: PopupStore) {
        this.popupInfo = _utilService.commonPopupValue(_popupStore.getValue().data, data.popup);
        this.asPopupCd = data.popup;
        if(data.headerText){
            this.headerText = data.headerText;
        }
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
            };
            if(param.extColCondGbnVal !== ''){
                this.type.push({
                    id : param.extColId,
                    name : param.extColNm,
                });
            }

            if(param.extColCondGbnVal === 'K'){
                this.searchForm.patchValue({'type' : param.extColId});
            }

            this.displayedColumns.push(param.extColId);
            this.commonValues.push(commonValue);

        });

        // getList$
        this.getList$ = this._popupService.getList$;
        this._popupService.getList$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((getList: any) => {
                // Update the counts
                if(getList !== null){
                    this.popupCount = getList.length;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

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
        if(this._sort !== undefined){
            // Get products if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    let whereVal;
                    const curVal = this.searchForm.controls['type'].value;
                    const textCond = this.searchForm.controls['searchText'].value;

                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    const ds_combo = this.popupInfo.filter((item: any) => item.extColId === curVal).map((param: any) => {
                        return param;
                    });

                    if(textCond === ''){
                        whereVal = 'K:LIKE_BOTH:';
                    }else{
                        whereVal = ds_combo[0].extColCondGbnVal + ':' + ds_combo[0].extEtcQryColCondVal + ':' + textCond;
                    }
                    this.searchForm.patchValue({'asPopupCd': this.asPopupCd});
                    this.searchForm.patchValue({'acWhereVal': whereVal});
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._popupService.getDynamicSql(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchForm.getRawValue());
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).subscribe();
        }
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this.popupCount = 0;
        this.pagenation = null;
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
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
    select(): void{
        let whereVal;
        const curVal = this.searchForm.controls['type'].value;
        const textCond = this.searchForm.controls['searchText'].value;

        // eslint-disable-next-line @typescript-eslint/naming-convention
        const ds_combo = this.popupInfo.filter((item: any) => item.extColId === curVal).map((param: any) => {
            return param;
        });

        if(textCond === ''){
            whereVal = 'K:LIKE_BOTH:';
        }else{
            whereVal = ds_combo[0].extColCondGbnVal + ':' + ds_combo[0].extEtcQryColCondVal + ':' + textCond;
        }

        this.searchForm.patchValue({'asPopupCd': this.asPopupCd});
        this.searchForm.patchValue({'acWhereVal': whereVal});
        this._popupService.getDynamicSql(0,1000,'','asc',this.searchForm.getRawValue());
    }

    getProperty(element, id: string): string{
        return element[id];
    }
}
