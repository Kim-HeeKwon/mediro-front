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
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {fuseAnimations} from '../../../../../../@teamplat/animations';
import {CommonCode, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {DeviceDetectorService} from 'ngx-device-detector';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {InHeader, InHeaderPagenation} from '../in.types';
import {InService} from '../in.service';

@Component({
    selector     : 'in-header',
    templateUrl  : './in-header.component.html',
    styleUrls    : ['./in-header.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class InHeaderComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatPaginator) private _inHeaderPagenator: MatPaginator;
    @ViewChild(MatSort) private _inHeaderSort: MatSort;

    showMobile$: Observable<boolean>;
    showMobile: boolean = false;
    isMobile: boolean = false;

    sizeLeft: number = 50;
    sizeRight: number = 50;

    // eslint-disable-next-line @typescript-eslint/member-ordering
    isLoading: boolean = false;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    inHeadersCount: number = 1;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    inHeaderPagenation: InHeaderPagenation | null = null;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    inHeaders$ = new Observable<InHeader[]>();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    selection = new SelectionModel<any>(true, []);

    type: CommonCode[] = null;
    status: CommonCode[] = null;
    filterList: string[];
    // eslint-disable-next-line @typescript-eslint/member-ordering
    inHeadersTableStyle: TableStyle = new TableStyle();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    inHeadersTable: TableConfig[] = [
        {headerText : '작성일' , dataField : 'ibCreDate', display : false , disabled : true},
        {headerText : '입고일' , dataField : 'ibDate', width: 80, display : true, disabled : true, type: 'text'},
        {headerText : '입고번호' , dataField : 'ibNo', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '거래처' , dataField : 'account', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '거래처 명' , dataField : 'accountNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '유형' , dataField : 'type', width: 100, display : true, disabled : true, type: 'text',combo: true},
        {headerText : '상태' , dataField : 'status', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '공급사' , dataField : 'supplier', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '비고' , dataField : 'remarkHeader', width: 100, display : false, disabled : true, type: 'text'}
    ];
    inHeadersTableColumns: string[] = [
        'select',
        'no',
        'ibCreDate',
        'ibDate',
        'ibNo',
        'account',
        'accountNm',
        'type',
        'status',
        'supplier',
        'remarkHeader',
    ];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _inService: InService,
        private _route: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private _codeStore: CodeStore,
        private _router: Router
    )
    {
        this.filterList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data,'IB_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data,'IB_STATUS', this.filterList);
        this.isMobile = this._deviceService.isMobile();
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        // 모바일에서 페이지 나누기 옵션
        this.showMobile$ = this._inService.showMobile$;

        if(this.isMobile){
            // 모바일이면
            this.sizeLeft = 0;
            this.sizeRight = 100;
        }else{
            // 모바일 아니면
            this.sizeLeft = 50;
            this.sizeRight = 50;
        }

        this._inService.showMobile$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((showMobile: any) => {
                this.showMobile = showMobile;
                if(showMobile){
                    this.sizeLeft = 50;
                    this.sizeRight = 50;
                }else{
                    this.sizeLeft = 50;
                    this.sizeRight = 50;
                }
            });

        this.inHeaders$ = this._inService.inHeaders$;
        this._inService.inHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inHeader: any) => {
                if(inHeader !== null){
                    this.inHeadersCount = inHeader.length;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._inService.inHeaderPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inHeaderPagenation: InHeaderPagenation) => {
                this.inHeaderPagenation = inHeaderPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        if(this._inHeaderSort !== undefined){
            // Get products if sort or page changes
            merge(this._inHeaderSort.sortChange, this._inHeaderPagenator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._inService.getHeader(this._inHeaderPagenator.pageIndex, this._inHeaderPagenator.pageSize, this._inHeaderSort.active, this._inHeaderSort.direction, {});
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
        this._inService.setShowMobile(true);
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): any {
        const numSelected = this.selection.selected.length;
        const numRows = this.inHeadersCount;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): SelectionModel<any> {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }

        this.inHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inHeader) => {
                this.selection.select(...inHeader);
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
        this._inService.setShowMobile(true);
        this._inService.setInitList();
        this._router.navigate(['in-out/in/inbox/1' , row.no]
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
                this.sizeLeft = 50;
                this.sizeRight = 50;
            }else{
                // 모바일 아니면
                this.sizeLeft = 50;
                this.sizeRight = 50;
            }
        }
    }
}
