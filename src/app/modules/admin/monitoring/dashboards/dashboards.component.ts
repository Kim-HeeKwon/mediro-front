import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {takeUntil} from "rxjs/operators";
import {Observable, Subject} from "rxjs";
import {DashboardsPagination, RecallItem} from "./dashboards.types";
import {DashboardsService} from "./dashboards.service";
import {CodeStore} from "../../../../core/common-code/state/code.store";
import {FuseUtilsService} from "../../../../../@teamplat/services/utils";
import {DeviceDetectorService} from "ngx-device-detector";
import {BreakpointObserver} from "@angular/cdk/layout";

@Component({
  selector: 'app-dashboards',
  templateUrl: './dashboards.component.html',
  styleUrls: ['./dashboards.component.scss']
})
export class DashboardsComponent implements OnInit, OnDestroy {

  recallItems$: Observable<RecallItem[]>;
  pagination: DashboardsPagination | null = null;
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
      private readonly breakpointObserver: BreakpointObserver
  ) { }

  ngOnInit(): void {

      // getItems
      this.recallItems$ = this._dashboardsService.reallItems$;

      this._dashboardsService.reallItems$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((items: any) => {
              console.log(items);
              // Update the counts
              this.racallTaleData = items;
              console.log(items);
              this.reacllItemsCount = items.length;

              // Mark for check
              this._changeDetectorRef.markForCheck();
          });

      // Get the pagination
      this._dashboardsService.pagenation$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((pagination: DashboardsPagination) => {
              // Update the pagination
              this.pagination = pagination;
              // Mark for check
              this._changeDetectorRef.markForCheck();
          });
  }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
