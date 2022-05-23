import {
    AfterViewInit, ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {fuseAnimations} from '../../animations';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {merge, Observable, Subject} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {Common} from '../../providers/common/common';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {CodeStore} from '../../../app/core/common-code/state/code.store';
import {FuseUtilsService} from '../../services/utils';
import {DeviceDetectorService} from 'ngx-device-detector';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {NoticeBoardService} from './notice-board.service';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {Pagenation} from '../common-udi-account/common-udi-account.types';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {DetailNoticeBoardComponent} from './detail-notice-board/detail-notice-board.component';
import {Pagination} from "./notice-board.types";

@Component({
    selector: 'app-notice-board-list',
    templateUrl: './notice-board.component.html',
    styleUrls: ['./notice-board.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})

export class NoticeBoardComponent implements OnInit, OnDestroy, AfterViewInit{
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild(MatPaginator, { static: true }) _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    isMobile: boolean = false;
    isLoading: boolean = false;
    details: any;
    searchForm: FormGroup;
    lists$: Observable<any[]>;
    listsCount: number = 0;
    pagination: Pagination | null = null;
    tableColumns: string[] = ['nbNo', 'title', 'addUser', 'addDate'];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _router: Router,
        private _route: ActivatedRoute,
        private _common: Common,
        public matDialogRef: MatDialogRef<NoticeBoardComponent>,
        private _matDialog: MatDialog,
        private _formBuilder: FormBuilder,
        private _noticeService: NoticeBoardService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _codeStore: CodeStore,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver
    ) {
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._noticeService.setInitList();
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.search();
        }
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            title: [''],
        });

        // getItems
        this.lists$ = this._noticeService.lists$;

        this._noticeService.lists$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((a: any) => {
                // Update the counts
                if(a !== null){
                    this.listsCount = a.length;
                    this.details = a;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        // Get the pagination
        this._noticeService.pagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: Pagenation) => {
                // Update the pagination
                if(pagination !== null){
                    this.pagination = pagination;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        //페이지 라벨
        if(this._paginator !== undefined){
            this._paginator._intl.itemsPerPageLabel = '';
        }
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    search(): void {
        this._noticeService.getNoticeBoard(0,40,'nbNo','desc',this.searchForm.getRawValue());
    }

    detail(val: any): void {
        let nbNo;
        let title;
        let addUser;
        let addDate;
        let comment;
        let cnt;
        let details;
        let no;

        if(val) {
            title = val.title;
            addUser = val.addUser;
            addDate = val.addDate;
            comment = val.comment;
            cnt = val.cnt;
            nbNo = val.nbNo;
            no = val.no;
        }

        details = this.details;
        if(!this.isMobile) {
            this._matDialog.open(DetailNoticeBoardComponent, {
                autoFocus: false,
                disableClose: true,
                data: {
                    title,
                    addUser,
                    addDate,
                    comment,
                    cnt,
                    nbNo,
                    details,
                    no

                }
            });
        } else {
            const t = this._matDialog.open(DetailNoticeBoardComponent, {
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true,
                data: {
                    title,
                    addUser,
                    addDate,
                    comment,
                    cnt,
                    nbNo,
                    details,
                    no
                }
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    t.updateSize('calc(100vw - 10px)', '');
                }
            });
            t.afterClosed().subscribe(() => {
                smallDialogSubscription.unsubscribe();
            });
        }
    }
    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
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
                    return this._noticeService.getNoticeBoard(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchForm.getRawValue());
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).subscribe();
        }
    }
}
