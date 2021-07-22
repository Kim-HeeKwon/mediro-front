import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {SelectionModel} from '@angular/cdk/collections';
import {TableConfig, TableStyle} from '../../../../../@teamplat/components/common-table/common-table.types';
import {Validity, ValidityPagenation} from './validity.types';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {MatDialog} from '@angular/material/dialog';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {DeviceDetectorService} from 'ngx-device-detector';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {ValidityService} from './validity.service';

@Component({
    selector: 'app-validity',
    templateUrl: './validity.component.html',
    styleUrls: ['./validity.component.scss']
})
export class ValidityComponent implements OnInit, OnDestroy, AfterViewInit  {

    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild(MatSort) private _sort: MatSort;
    isMobile: boolean = false;
    selection = new SelectionModel<any>(true, []);
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    validitys$: Observable<Validity[]>;
    validityPagenation: ValidityPagenation | null = null;
    isLoading: boolean = false;
    validitysCount: number = 0;
    validitysTableStyle: TableStyle = new TableStyle();
    validitysTable: TableConfig[] = [
        {headerText : '품목코드' , dataField : 'itemCd', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '품목명' , dataField : 'itemNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '품목등급' , dataField : 'itemGrade', width: 60, display : true, disabled : true, type: 'text',combo : true},
        {headerText : '규격' , dataField : 'standard', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '단위' , dataField : 'unit', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '유효기간 일자' , dataField : 'lot2', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '유효기간' , dataField : 'validity', width: 60, display : true, disabled : true, type: 'number'},
        {headerText : '현재고' , dataField : 'qty', width: 60, display : true, disabled : true, type: 'number'},
        {headerText : '가용재고' , dataField : 'availQty', width: 60, display : true, disabled : true, type: 'number'},
    ];

    validitysTableColumns: string[] = [
        /*'no',*/
        /*'details',*/
        'itemCd',
        'itemNm',
        'itemGrade',
        'standard',
        'unit',
        'lot2',
        'validity',
        'qty',
        'availQty',
    ];

    searchForm: FormGroup;
    selectedValidityHeader: Validity | null = null;
    filterList: string[];
    flashMessage: 'success' | 'error' | null = null;
    navigationSubscription: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    itemGrades: CommonCode[] = null;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    validity: CommonCode[] = null;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    searchCondition: CommonCode[] = [
        {
            id: '100',
            name: '품목 명'
        }];

    constructor(
        private _matDialog: MatDialog,
        public _matDialogPopup: MatDialog,
        private _formBuilder: FormBuilder,
        private _validityService: ValidityService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _codeStore: CodeStore,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.validity = _utilService.commonValue(_codeStore.getValue().data,'INV_VALIDITY');
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data,'ITEM_GRADE');
        this.navigationSubscription = this._router.events.subscribe((e: any) => {
            // RELOAD로 설정했기때문에 동일한 라우트로 요청이 되더라도
            // 네비게이션 이벤트가 발생한다. 우리는 이 네비게이션 이벤트를 구독하면 된다.
            if (e instanceof NavigationEnd) {
            }
        });
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            type: ['ALL'],
            validity: ['ALL'],
            itemNm: [''],
            searchCondition: ['100'],
            searchText: [''],
        });

        this.validitys$ = this._validityService.validitys$;
        this._validityService.validitys$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((validity: any) => {
                if(validity !== null){
                    this.validitysCount = validity.length;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._validityService.validityPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((validityPagenation: ValidityPagenation) => {
                this.validityPagenation = validityPagenation;
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
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._validityService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchForm.getRawValue());
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
    trackByFn(index: number, validity: any): any {
        return validity.id || index;
    }

    /**
     * Toggle product details
     *
     * @param account
     */
    toggleDetails(itemCd: string): void
    {
        //console.log(itemCd);
    }
    /**
     * Close the details
     */
    closeDetails(): void
    {
        this.selectedValidityHeader = null;
    }

    selectHeader(): void
    {
        if(this.searchForm.getRawValue().searchCondition === '100') {
            this.searchForm.patchValue({'itemCd': ''});
            this.searchForm.patchValue({'itemNm': this.searchForm.getRawValue().searchText});
        }
        this._validityService.getHeader(0,10,'itemNm','desc',this.searchForm.getRawValue());
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getComboData(column: TableConfig) {
        let combo;
        if(column.dataField === 'itemGrade'){
            combo = this.itemGrades;
        }
        return combo;
    }
}
