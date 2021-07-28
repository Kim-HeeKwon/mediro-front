import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {map, switchMap, takeUntil} from "rxjs/operators";
import {merge, Observable, Subject} from "rxjs";
import {DashboardsPagination, RecallItem} from "./dashboards.types";
import {DashboardsService} from "./dashboards.service";
import {CodeStore} from "../../../../core/common-code/state/code.store";
import {FuseUtilsService} from "../../../../../@teamplat/services/utils";
import {DeviceDetectorService} from "ngx-device-detector";
import {BreakpointObserver} from "@angular/cdk/layout";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {Router} from "@angular/router";

@Component({
  selector: 'app-dashboards',
  templateUrl: './dashboards.component.html',
  styleUrls: ['./dashboards.component.scss']
})
export class DashboardsComponent implements OnInit, AfterViewInit,OnDestroy {

  @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(MatSort) private _sort: MatSort;

  recallItems$: Observable<RecallItem[]>;
  pagination: DashboardsPagination = { length: 0, size: 0, page: 0, lastPage: 0, startIndex: 0, endIndex: 0 };
  isLoading: boolean = false;

  racallTaleData: any = null;

  reacllItemsCount: number = 0;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
      private _dashboardsService: DashboardsService,
      private _changeDetectorRef: ChangeDetectorRef,
      private _codeStore: CodeStore,
      private _utilService: FuseUtilsService,
      private _deviceService: DeviceDetectorService,
      private _router: Router,
      private readonly breakpointObserver: BreakpointObserver
  ) { }

  ngOnInit(): void {

      // getItems
      this.recallItems$ = this._dashboardsService.reallItems$;

      this._dashboardsService.reallItems$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((items: any) => {
              // Update the counts
              console.log(items);
              if(items === null || items === 'null'){
                  this.racallTaleData = null;
                  this.reacllItemsCount = 0;
              }else{
                  this.racallTaleData = items;
                  this.reacllItemsCount = items.rows.length;
              }

              // Mark for check
              this._changeDetectorRef.markForCheck();
          });

      // Get the pagination
      this._dashboardsService.pagenation$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((pagination: DashboardsPagination) => {
              // Update the pagination
              //this.pagination = pagination;
              if(pagination !== null){
                  this.pagination = pagination;
              }
              // Mark for check
              this._changeDetectorRef.markForCheck();
          });

      this._dashboardsService.getRecallItem();
  }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        // Get products if sort or page changes
        merge(this._paginator.page).pipe(
            switchMap(() => {

                this.isLoading = true;
                return this._dashboardsService.getRecallItem(this._paginator.pageIndex, this._paginator.pageSize, '', '','');
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
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    movePage(): void
    {
        this._router.navigate(['/pages/settings']);
    }

}
