import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit, ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {SelectionModel} from '@angular/cdk/collections';
import {TableConfig, TableStyle} from '../../../../../../@teamplat/components/common-table/common-table.types';
import {ActivatedRoute, Router} from '@angular/router';
import {OutService} from '../out.service';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {OutHeader, OutHeaderPagenation} from '../out.types';
import {fuseAnimations} from '../../../../../../@teamplat/animations';
import {FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {DeviceDetectorService} from 'ngx-device-detector';

@Component({
    selector     : 'out-header',
    templateUrl  : './out-header.component.html',
    styleUrls    : ['./out-header.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class OutHeaderComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatPaginator) private _outHeaderPagenator: MatPaginator;
    @ViewChild(MatSort) private _outHeaderSort: MatSort;

    showMobile$: Observable<boolean>;
    showMobile: boolean = false;
    isMobile: boolean = false;

    sizeLeft: number = 60;
    sizeRight: number = 40;

    // eslint-disable-next-line @typescript-eslint/member-ordering
    isLoading: boolean = false;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    outHeadersCount: number = 1;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    outHeaderPagenation: OutHeaderPagenation | null = null;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    outHeaders$ = new Observable<OutHeader[]>();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    selection = new SelectionModel<any>(true, []);

    // eslint-disable-next-line @typescript-eslint/member-ordering
    outHeadersTableStyle: TableStyle = new TableStyle();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    outHeadersTable: TableConfig[] = [
        {headerText : '작성일' , dataField : 'obCreDate', display : false , disabled : true},
        {headerText : '출고일' , dataField : 'obDate', width: 80, display : true, disabled : true, type: 'text'},
        {headerText : '출고번호' , dataField : 'obNo', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '거래처' , dataField : 'account', width: 100, display : false, disabled : true, type: 'text'},
        {headerText : '거래처 명' , dataField : 'accountNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '주소' , dataField : 'address', width: 80, display : false, disabled : true, type: 'text'},
        {headerText : '유형' , dataField : 'type', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '상태' , dataField : 'status', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '배송처' , dataField : 'dlvAccount', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '배송주소' , dataField : 'dlvAddress', width: 80, display : false, disabled : true, type: 'text'},
        {headerText : '배송일' , dataField : 'dlvDate', width: 80, display : false, disabled : true, type: 'text'},
        {headerText : '비고' , dataField : 'remarkHeader', width: 100, display : false, disabled : true, type: 'text'}
    ];
    outHeadersTableColumns: string[] = [
        'select',
        'no',
        'obCreDate',
        'obDate',
        'obNo',
        'account',
        'accountNm',
        'address',
        'type',
        'status',
        'dlvAccount',
        'dlvAddress',
        'dlvDate',
        'remarkHeader',
    ];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _outService: OutService,
        private _route: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private _router: Router
    ) {
        this.isMobile = this._deviceService.isMobile();
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        // 모바일에서 페이지 나누기 옵션
        this.showMobile$ = this._outService.showMobile$;

        if(this.isMobile){
            // 모바일이면
            this.sizeLeft = 60;
            this.sizeRight = 40;
        }else{
            // 모바일 아니면
            this.sizeLeft = 60;
            this.sizeRight = 40;
        }

        this._outService.showMobile$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((showMobile: any) => {
                this.showMobile = showMobile;
                if(showMobile){
                    this.sizeLeft = 60;
                    this.sizeRight = 40;
                }else{
                    this.sizeLeft = 60;
                    this.sizeRight = 40;
                }
            });

        this.outHeaders$ = this._outService.outHeaders$;
        this._outService.outHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outHeader: any) => {
               if(outHeader !== null){
                   this.outHeadersCount = outHeader.length;
               }
               // Mark for check
               this._changeDetectorRef.markForCheck();
            });

        this._outService.outHeaderPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outHeaderPagenation: OutHeaderPagenation) => {
                this.outHeaderPagenation = outHeaderPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        if(this._outHeaderSort !== undefined){
            // Get products if sort or page changes
            merge(this._outHeaderSort.sortChange, this._outHeaderPagenator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._outService.getHeader(this._outHeaderPagenator.pageIndex, this._outHeaderPagenator.pageSize, this._outHeaderSort.active, this._outHeaderSort.direction, {});
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).pipe(takeUntil(this._unsubscribeAll)).subscribe();
        }
    }

    /**
     * On Destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    clickTest(): void {
        this._outService.setShowMobile(true);
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): any {
        const numSelected = this.selection.selected.length;
        const numRows = this.outHeadersCount;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): SelectionModel<any> {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }

        this.outHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outHeader) => {
               this.selection.select(...outHeader);
            });
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: any): string {
        if (!row) {
            return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    rowClick(row, i) {
        this.selection.clear();
        this.selection.toggle(row);
        this._outService.setShowMobile(true);
        this._outService.setInitList();
        this._router.navigate(['in-out/out/outbox/1' , row.no]
            , {
                queryParams: {
                    row : JSON.stringify(row)
                }
            });

        //모바일 디테일
        if(this.isMobile){
            // eslint-disable-next-line no-cond-assign
            if(this.sizeLeft = 100){
                // 모바일이면
                this.sizeLeft = 60;
                this.sizeRight = 40;
            }else{
                // 모바일 아니면
                this.sizeLeft = 60;
                this.sizeRight = 40;
            }
        }
    }
}
