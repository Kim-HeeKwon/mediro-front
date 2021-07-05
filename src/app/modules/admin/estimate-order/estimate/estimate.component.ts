import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {merge, Observable, Subject} from 'rxjs';
import {EstimateHeader, EstimateHeaderPagenation} from './estimate.types';
import {EstimateService} from './estimate.service';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {ActivatedRoute, NavigationExtras, Router, RouterModule} from '@angular/router';

@Component({
    selector: 'app-estimate',
    templateUrl: './estimate.component.html',
    styleUrls: ['./estimate.component.scss']
})
export class EstimateComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator) private _estimateHeaderPagenator: MatPaginator;
    @ViewChild(MatSort) private _estimateHeaderSort: MatSort;
    estimateHeaders$: Observable<EstimateHeader[]>;
    estimateHeaderPagenation: EstimateHeaderPagenation | null = null;
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    estimateHeadersCount: number = 0;
    estimateHeadersTableColumns: string[] = [
        'qtCreDate',
        'qtDate',
        'qtNo',
        'account',
        'accountNm',
        'accountType',
        'type',
        'status',
        'email',
        'qtAmt',
        'remarkHeader',
        'soNo',
    ];
    selectedEstimateHeader: EstimateHeader | null = null;
    searchForm: FormGroup;

    status: CommonCode[] = null;
    type: CommonCode[] = null;
    accountType: CommonCode[] = null;
    searchCondition: CommonCode[] = [
        {
            id: '100',
            name: '거래처 명'
        }];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _estimateService: EstimateService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _codeStore: CodeStore,
        private _utilService: FuseUtilsService)
    {
        this.status = _utilService.commonValue(_codeStore.getValue().data,'QT_STATUS');
        this.type = _utilService.commonValue(_codeStore.getValue().data,'QT_TYPE');
        this.accountType = _utilService.commonValue(_codeStore.getValue().data,'ACCOUNT_TYPE');
    }

    ngOnInit(): void {

        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            status: ['ALL'],
            type: ['ALL'],
            searchCondition: ['100'],
            searchText: [''],
        });

        // getHeader
        this.estimateHeaders$ = this._estimateService.estimateHeaders$;

        this._estimateService.estimateHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estimateHeaders: any) => {
                // Update the counts
                if(estimateHeaders !== null){
                    this.estimateHeadersCount = estimateHeaders.length;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the pagenation
        this._estimateService.estimateHeaderPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estimateHeaderPagenation: EstimateHeaderPagenation) => {
                // Update the pagination
                this.estimateHeaderPagenation = estimateHeaderPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
    /**
     * After view init
     */
    ngAfterViewInit(): void {

        if(this._estimateHeaderSort !== undefined){
            // Get products if sort or page changes
            merge(this._estimateHeaderSort.sortChange, this._estimateHeaderPagenator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._estimateService.getHeader(this._estimateHeaderPagenator.pageIndex, this._estimateHeaderPagenator.pageSize, this._estimateHeaderSort.active, this._estimateHeaderSort.direction, this.searchForm.getRawValue());
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
    trackByFn(index: number, estimateHeader: any): any {
        return estimateHeader.id || index;
    }

    selectHeader(): void
    {
        if(this.searchForm.getRawValue().searchCondition === '100') {
            this.searchForm.patchValue({'account': ''});
            this.searchForm.patchValue({'accountNm': this.searchForm.getRawValue().searchText});
        }
        this._estimateService.getHeader(0,10,'accountNm','asc',this.searchForm.getRawValue());
    }

    selectDoubleClickRow(row: any): void {
        this._router.navigate(['estimate-order/estimate/estimate-detail' , row]);
    }

    selectClickRow(row: any): void{
        const navigationExtras: NavigationExtras = {
            queryParams: {
                data: row
            }
        };
        this._router.navigate(['estimate-order/estimate/estimate-detail' , row]);
    }

    createDetail(): void{
        this._router.navigate(['estimate-order/estimate/estimate-detail' , {}]);
    }

}
