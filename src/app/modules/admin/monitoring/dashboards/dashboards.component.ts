import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {merge, Observable, Subject} from 'rxjs';
import {
    DashboardInfo1,
    DashboardsPagination,
    IbInfo,
    ObInfo,
    PoInfo,
    QtInfo,
    RecallItem,
    SoInfo
} from './dashboards.types';
import {DashboardsService} from './dashboards.service';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {DeviceDetectorService} from 'ngx-device-detector';
import {BreakpointObserver} from '@angular/cdk/layout';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {Router} from '@angular/router';
import {SessionStore} from "../../../../core/session/state/session.store";
import {ApexOptions} from "ng-apexcharts";

@Component({
  selector: 'app-dashboards',
  templateUrl: './dashboards.component.html',
  styleUrls: ['./dashboards.component.scss']
})
export class DashboardsComponent implements OnInit, AfterViewInit,OnDestroy {

  @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(MatSort) private _sort: MatSort;
  userName: string;
  ibInfo$: Observable<DashboardInfo1>;
  obInfo$: Observable<DashboardInfo1>;
  qtInfo$: Observable<DashboardInfo1>;
  poInfo$: Observable<DashboardInfo1>;
  soInfo$: Observable<DashboardInfo1>;
  udiInfo$: Observable<any>;
  udiInfos: any;
  ibInfo: IbInfo = {sCnt:0,pCnt:0,cCnt:0,fCnt:0,nCnt:0};
  obInfo: ObInfo = {sCnt:0, cCnt:0, pCnt:0, nCnt:0, dCnt:0};
  qtInfo: QtInfo = {sCnt:0, cCnt:0, nCnt:0, cfCnt:0, rCnt:0};
  poInfo: PoInfo = {psCnt:0, nCnt:0, pCnt:0, sCnt:0};
  soInfo: SoInfo = {sCnt:0, cCnt:0, nCnt:0};
  recallItems$: Observable<RecallItem[]>;
  pagination: DashboardsPagination = { length: 0, size: 0, page: 0, lastPage: 0, startIndex: 0, endIndex: 0 };
  isLoading: boolean = false;

  chartUdiInfo: ApexOptions = {};

  racallTaleData: any = null;

  reacllItemsCount: number = 0;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
      private _dashboardsService: DashboardsService,
      private _changeDetectorRef: ChangeDetectorRef,
      private _sessionStore: SessionStore,
      private _codeStore: CodeStore,
      private _utilService: FuseUtilsService,
      private _deviceService: DeviceDetectorService,
      private _router: Router,
      private readonly breakpointObserver: BreakpointObserver
  ) {
      this.userName = _sessionStore.getValue().name;
  }

  ngOnInit(): void {

      this.ibInfo$ = this._dashboardsService.ibInfo$;
      this.obInfo$ = this._dashboardsService.obInfo$;
      this.qtInfo$ = this._dashboardsService.qtInfo$;
      this.poInfo$ = this._dashboardsService.poInfo$;
      this.soInfo$ = this._dashboardsService.soInfo$;
      this.udiInfo$ = this._dashboardsService.udiInfo$;
      //udi정보
      this.udiInfo$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((data: any) => {
                this.udiInfos = data;
                console.log(this.udiInfos);
                this._prepareChartData();
      });

      //입고
      this.ibInfo$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((data: any) => {
              data.filter(option => option.subCd === 'S').map((result: any) => {this.ibInfo.sCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'P').map((result: any) => {this.ibInfo.pCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'N').map((result: any) => {this.ibInfo.nCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'F').map((result: any) => {this.ibInfo.fCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'C').map((result: any) => {this.ibInfo.cCnt= result.totalCnt;});
          });
      //견적
      this.qtInfo$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((data: any) => {
              data.filter(option => option.subCd === 'S').map((result: any) => {this.qtInfo.sCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'C').map((result: any) => {this.qtInfo.cCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'N').map((result: any) => {this.qtInfo.nCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'CF').map((result: any) => {this.qtInfo.cfCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'R').map((result: any) => {this.qtInfo.rCnt= result.totalCnt;});
          });
      //출고
      this.obInfo$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((data: any) => {
              data.filter(option => option.subCd === 'PS').map((result: any) => {this.obInfo.sCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'C').map((result: any) => {this.obInfo.cCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'N').map((result: any) => {this.obInfo.nCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'P').map((result: any) => {this.obInfo.pCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'D').map((result: any) => {this.obInfo.dCnt= result.totalCnt;});
          });
      //발주
      this.poInfo$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((data: any) => {
              data.filter(option => option.subCd === 'S').map((result: any) => {this.poInfo.sCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'PS').map((result: any) => {this.poInfo.psCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'N').map((result: any) => {this.poInfo.nCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'P').map((result: any) => {this.poInfo.pCnt= result.totalCnt;});
          });
      //주문
      this.soInfo$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((data: any) => {
              data.filter(option => option.subCd === 'S').map((result: any) => {this.soInfo.sCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'N').map((result: any) => {this.soInfo.nCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'C').map((result: any) => {this.soInfo.cCnt= result.totalCnt;});
          });


      // getItems
      this.recallItems$ = this._dashboardsService.reallItems$;

      this._dashboardsService.reallItems$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((items: any) => {
              // Update the counts
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
     * Prepare the chart data from the data
     *
     * @private
     */
    private _prepareChartData(): void {
        // UDI 공급내역
        this.chartUdiInfo = {
            chart: {
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'line',
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                }
            },
            colors: ['#64748B', '#94A3B8'],
            dataLabels: {
                enabled: true,
                enabledOnSeries: [0],
                background: {
                    borderWidth: 0
                }
            },
            grid: {
                borderColor: 'var(--fuse-border)'
            },
            labels: this.udiInfos.labels,
            legend: {
                show: false
            },
            plotOptions: {
                bar: {
                    columnWidth: '50%'
                }
            },
            series: this.udiInfos.series,
            states: {
                hover: {
                    filter: {
                        type: 'darken',
                        value: 0.75
                    }
                }
            },
            stroke: {
                width: [3, 0]
            },
            tooltip: {
                followCursor: true,
                theme: 'dark'
            },
            xaxis: {
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    color: 'var(--fuse-border)'
                },
                labels: {
                    style: {
                        colors: 'var(--fuse-text-secondary)'
                    }
                },
                tooltip: {
                    enabled: false
                }
            },
            yaxis: {
                labels: {
                    offsetX: -16,
                    style: {
                        colors: 'var(--fuse-text-secondary)'
                    }
                }
            }
        };
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

    goPage(gbn): void
    {
        if(gbn === 'QT'){
            this._router.navigate(['/estimate-order/estimate']);
        }else if(gbn === 'IB'){
            this._router.navigate(['/bound/inbound']);
        }else if(gbn === 'OB'){
            this._router.navigate(['/bound/outbound']);
        }else if(gbn === 'SO'){
            this._router.navigate(['/salesorder/salesorder']);
        }else if(gbn === 'PO'){
            this._router.navigate(['/estimate-order/order']);
        }
    }

}
