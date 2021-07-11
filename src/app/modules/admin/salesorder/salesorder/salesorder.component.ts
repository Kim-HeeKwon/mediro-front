import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {merge, Observable, Subject} from 'rxjs';
import {SalesOrderHeader, SalesOrderHeaderPagenation} from './salesorder.types';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {SelectionModel} from '@angular/cdk/collections';
import {ActivatedRoute, Router} from '@angular/router';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {SalesorderService} from './salesorder.service';
import {map, switchMap, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-salesorder',
  templateUrl: './salesorder.component.html',
  styleUrls: ['./salesorder.component.scss']
})
export class SalesorderComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild(MatPaginator) private _salesorderHeaderPagenator: MatPaginator;
    @ViewChild(MatSort) private _salesorderHeaderSort: MatSort;
    salesorderHeaders$: Observable<SalesOrderHeader[]>;
    salesorderHeaderPagenation: SalesOrderHeaderPagenation | null = null;
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    salesorderHeadersCount: number = 0;
    salesorderHeadersTableColumns: string[] = [
        'select',
        'no',
        'soCreDate',
        'soDate',
        'soNo',
        'account',
        'accountNm',
        'accountType',
        'type',
        'status',
        'email',
        'soAmt',
        'remarkHeader',
        'obNo',
    ];
    selectedSalesOrderHeader: SalesOrderHeader = new SalesOrderHeader();
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
    // eslint-disable-next-line @typescript-eslint/member-ordering
    selection = new SelectionModel<any>(true, []);

    constructor(private _activatedRoute: ActivatedRoute,
                private _router: Router,
                private _formBuilder: FormBuilder,
                private _salesorderService: SalesorderService,
                private _changeDetectorRef: ChangeDetectorRef,
                private _codeStore: CodeStore,
                private _utilService: FuseUtilsService)
    {
        this.status = _utilService.commonValue(_codeStore.getValue().data,'SO_STATUS');
        this.type = _utilService.commonValue(_codeStore.getValue().data,'SO_TYPE');
        this.accountType = _utilService.commonValue(_codeStore.getValue().data,'ACCOUNT_TYPE');
    }
    ngOnInit(): void {

        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            status: ['ALL'],
            type: ['ALL'],
            account: [''],
            accountNm: [''],
            searchCondition: ['100'],
            searchText: [''],
        });

        this._salesorderService.getHeader();
        // getHeader
        this.salesorderHeaders$ = this._salesorderService.salesorderHeaders$;

        this._salesorderService.salesorderHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((salesorderHeaders: any) => {
                // Update the counts
                if(salesorderHeaders !== null){
                    this.salesorderHeadersCount = salesorderHeaders.length;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the pagenation
        this._salesorderService.salesorderHeaderPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((salesorderHeaderPagenation: SalesOrderHeaderPagenation) => {
                // Update the pagination
                this.salesorderHeaderPagenation = salesorderHeaderPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
    /**
     * After view init
     */
    ngAfterViewInit(): void {

        if(this._salesorderHeaderSort !== undefined){
            // Get products if sort or page changes
            merge(this._salesorderHeaderSort.sortChange, this._salesorderHeaderPagenator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._salesorderService.getHeader(this._salesorderHeaderPagenator.pageIndex, this._salesorderHeaderPagenator.pageSize, this._salesorderHeaderSort.active, this._salesorderHeaderSort.direction, this.searchForm.getRawValue());
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
    trackByFn(index: number, orderHeader: any): any {
        return orderHeader.id || index;
    }
    selectHeader(): void
    {
        if(this.searchForm.getRawValue().searchCondition === '100') {
            this.searchForm.patchValue({'account': ''});
            this.searchForm.patchValue({'accountNm': this.searchForm.getRawValue().searchText});
        }
        this._salesorderService.getHeader(0,10,'accountNm','asc',this.searchForm.getRawValue());
    }
    selectDoubleClickRow(row: any): void {
        this._router.navigate(['salesorder/salesorder/salesorder-detail' , row]);
    }

    selectClickRow(row: any): void{
        this._router.navigate(['salesorder/salesorder/salesorder-detail' , row]);
    }

    newSalesOrder(): void{
        this._router.navigate(['salesorder/salesorder/salesorder-new' , {}]);
    }
    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): SelectionModel<any> {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }
        this.salesorderHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((salesorderHeader) =>{
                this.selection.select(...salesorderHeader);
            });
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): any {
        const numSelected = this.selection.selected.length;
        const numRows = this.salesorderHeadersCount;
        return numSelected === numRows;
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: any): string {
        if (!row) {
            return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.no + 1}`;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    salesorderConfirm() {
        console.log(this.selection.selected);
    }
}
