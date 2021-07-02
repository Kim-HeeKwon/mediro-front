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
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {CommonCode, CommonPopup, FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {PopupStore} from "../../../../../core/common-popup/state/popup.store";
import {FormBuilder, FormGroup} from "@angular/forms";
import {PopupService} from "./popup.service";
import {BehaviorSubject, merge, Observable, Subject} from 'rxjs';
import {PopupPagenation} from './popup.types';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {fuseAnimations} from '../../../../../../@teamplat/animations';

export interface DisplayedColumn{
    id: string;
}

export interface Column{
    id: string;
    name: string;
}

@Component({
    selector: 'app-popup',
    templateUrl: './popup.component.html',
    styleUrls: ['./popup.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class PopupComponent implements OnInit, OnDestroy, AfterViewInit {
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

    accountNm1 = '고객사';
    accountNm2 = '고객사 명';

    type: CommonCode[] = [];

    private _dataSet: BehaviorSubject<any> = new BehaviorSubject(null);
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        public _matDialogRef: MatDialogRef<PopupComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _utilService: FuseUtilsService,
        private _formBuilder: FormBuilder,
        private _popupService: PopupService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _popupStore: PopupStore) {
        this.popupInfo = _utilService.commonPopupValue(_popupStore.getValue().data, data.popup);
        this.asPopupCd = data.popup;


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
            this.type.push({
                id : param.extColId,
                name : param.extColNm,
            });

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
        console.log(this._sort);
        if(this._sort !== undefined){
            // Get products if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    this.searchForm.patchValue({'asPopupCd': this.asPopupCd});
                    this.searchForm.patchValue({'acWhereVal': 'K:LIKE_BOTH:'});
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
        //console.log(data);
        return data.id || index;
    }

    selectRow(row: any): void {
        this._matDialogRef.close(row);
    }
    select(): void{
        this.searchForm.patchValue({'asPopupCd': this.asPopupCd});
        this.searchForm.patchValue({'acWhereVal': 'K:LIKE_BOTH:'});
        this._popupService.getDynamicSql(0,10,'accountCd','asc',this.searchForm.getRawValue());


    }
}
