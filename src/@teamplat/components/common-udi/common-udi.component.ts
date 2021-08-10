import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component, Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {fuseAnimations} from '../../animations';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {BehaviorSubject, merge, Observable, Subject} from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CommonCode, CommonPopup, FuseUtilsService} from '../../services/utils';
import {PopupPagenation} from '../common-popup/common-popup.types';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {PopupStore} from '../../../app/core/common-popup/state/popup.store';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {CommonUdiService} from './common-udi.service';
import {DisplayedColumn, Column, UdiPagenation} from './common-udi.types';
import {CodeStore} from '../../../app/core/common-code/state/code.store';
import {FunctionService} from '../../services/function';

@Component({
    selector: 'app-common-udi',
    templateUrl: './common-udi.component.html',
    styleUrls: ['./common-udi.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class CommonUdiComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    isLoading: boolean = false;
    popupCount: number = 0;
    displayedColumns: DisplayedColumn[] = [];
    clickedRows = new Set<any>();
    getList$: Observable<any>;
    searchForm: FormGroup;
    pagenation: UdiPagenation | null = null;
    pageEvent: PageEvent;

    commonValues: Column[] = [];

    url: string = '';
    mediroUrl: string = '';
    headerText: string = 'UDI 공통팝업';

    columnList: CommonCode[] = [];
    searchType: CommonCode[] = [];
    searchList: string[];
    searchTypeColumn: string;
    merge: boolean = false;
    mergeData: string = '';


    private _dataSet: BehaviorSubject<any> = new BehaviorSubject(null);
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        public _matDialogRef: MatDialogRef<CommonUdiComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _utilService: FuseUtilsService,
        private _formBuilder: FormBuilder,
        private _udiService: CommonUdiService,
        public _matDialogPopup: MatDialog,
        private _codeStore: CodeStore,
        private _changeDetectorRef: ChangeDetectorRef,
        private _functionService: FunctionService,
        private _popupStore: PopupStore) {
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
            accessToken: ['774900bc-75af-4893-afe6-c81f71581821'],
            //c5b5ddaf-70cf-4460-8697-f9d4b84ed77b
            offset: [1],
            limit: [100],
        });

        const commonValue: Column[] = this.columnList;
        this.commonValues = commonValue;

        this.commonValues.forEach((param: any) => {
            // @ts-ignore
            this.displayedColumns.push(param.id);
        });

        // getList$
        this.getList$ = this._udiService.getList$;

        this._udiService.getList$
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
        this._udiService.pagenation$
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
                    this.searchForm.patchValue({'url': this.url});
                    this.searchForm.patchValue({'mediroUrl': this.mediroUrl});
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._udiService.getUdi(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchForm.getRawValue());
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
        this._udiService.setInitList();
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

        this.searchForm.patchValue({'url': this.url});
        this.searchForm.patchValue({'mediroUrl': this.mediroUrl});
        this._udiService.getUdi(0,100,'','asc',this.searchForm.getRawValue());

        this._udiService.getStatus$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((status: any) => {
            if(status !== 'SUCCESS'){
                /*this._udiService.getMsg$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((msg: any) => {
                        const error =this._matDialogPopup.open(ErrorAlertComponent, {
                            data: {
                                msg : msg,
                            },
                            autoFocus: false,
                            maxHeight: '90vh',
                            disableClose: true
                        });
                        return;
                    });*/
            }
        });
    }
    mergeUdiData(): void{

        if(this.merge){
            let rowData;
            this._udiService.getList$
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
                if(rowData === undefined){
                    this._functionService.cfn_alert('데이터가 없습니다. 먼저 조회하세요.');
                }else{
                    this._udiService.mergeAccount(rowData)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((salesOrder: any) => {
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

    getProperty(element, id: string): string{
        return element[id];
    }

    pageChange(evt: any): void{
        this.searchForm.patchValue({'offset': this._paginator.pageIndex + 1});
        this.searchForm.patchValue({'limit': this._paginator.pageSize});
        this._udiService.getUdi(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchForm.getRawValue());

    }
}
