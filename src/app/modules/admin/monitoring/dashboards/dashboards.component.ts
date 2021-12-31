import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {merge, Observable, Subject} from 'rxjs';
import {
    BillInfo,
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
import ApexCharts from 'apexcharts';
import {Chart, ChartData, ChartOptions, ChartType} from "chart.js";

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
  bill$: Observable<any>;
  billInfo$: Observable<any>;
  stockInfo$: Observable<any>;
  stockInfos: any;
  udiInfos: any;
  billInfos: any;
  ibInfo: IbInfo = {nCnt:0,cCnt:0,pCnt:0,sCnt:0,pcCnt:0,scCnt:0};
  obInfo: ObInfo = {nCnt:0, cCnt:0, pCnt:0, sCnt:0, pcCnt:0, scCnt:0};
  qtInfo: QtInfo = {nCnt:0, cCnt:0, sCnt:0, rsCnt:0, cfaCnt:0, cfCnt:0};
  poInfo: PoInfo = {nCnt:0, cCnt:0, sCnt:0, pCnt:0, cfaCnt:0, cfCnt:0};
  soInfo: SoInfo = {sCnt:0, cCnt:0, nCnt:0};
  billInfo: BillInfo = {totalCnt:0};
  recallItems$: Observable<RecallItem[]>;
  pagination: DashboardsPagination = { length: 0, size: 0, page: 0, lastPage: 0, startIndex: 0, endIndex: 0 };
  isLoading: boolean = false;

  chartUdiInfo: ApexOptions = {};

  racallTaleData: any = null;

  reacllItemsCount: number = 0;
  sumPoQty: number = 0;
  sumAvailQty: number = 0;
  sumPoAvailQty: number = 0;
  sumAcceptableQty: number = 0;
  sumUnusedQty: number = 0;
  sumAcceptableUnusedQty: number = 0;
  sumAll: number = 0;

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
      this.billInfo$ = this._dashboardsService.billInfo$;
      this.udiInfo$ = this._dashboardsService.udiInfo$;
      this.stockInfo$ = this._dashboardsService.stockInfo$;
      this.bill$ = this._dashboardsService.bill$;

      //입고
      this.ibInfo$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((data: any) => {
              data.filter(option => option.subCd === 'N').map((result: any) => {this.ibInfo.nCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'C').map((result: any) => {this.ibInfo.cCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'P').map((result: any) => {this.ibInfo.pCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'S').map((result: any) => {this.ibInfo.sCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'PC').map((result: any) => {this.ibInfo.pcCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'SC').map((result: any) => {this.ibInfo.scCnt= result.totalCnt;});
          });
      //견적
      this.qtInfo$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((data: any) => {
              data.filter(option => option.subCd === 'N').map((result: any) => {this.qtInfo.nCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'C').map((result: any) => {this.qtInfo.cCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'S').map((result: any) => {this.qtInfo.sCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'RS').map((result: any) => {this.qtInfo.rsCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'CFA').map((result: any) => {this.qtInfo.cfaCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'CF').map((result: any) => {this.qtInfo.cfCnt= result.totalCnt;});
          });
      //출고
      this.obInfo$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((data: any) => {
              data.filter(option => option.subCd === 'N').map((result: any) => {this.obInfo.nCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'C').map((result: any) => {this.obInfo.cCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'P').map((result: any) => {this.obInfo.pCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'S').map((result: any) => {this.obInfo.sCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'PC').map((result: any) => {this.obInfo.pcCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'SC').map((result: any) => {this.obInfo.scCnt= result.totalCnt;});
          });
      //발주
      this.poInfo$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((data: any) => {
              data.filter(option => option.subCd === 'N').map((result: any) => {this.poInfo.nCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'C').map((result: any) => {this.poInfo.cCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'S').map((result: any) => {this.poInfo.sCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'P').map((result: any) => {this.poInfo.pCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'CFA').map((result: any) => {this.poInfo.cfaCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'CF').map((result: any) => {this.poInfo.cfCnt= result.totalCnt;});
          });
      //주문
      this.soInfo$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((data: any) => {
              data.filter(option => option.subCd === 'N').map((result: any) => {this.soInfo.nCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'C').map((result: any) => {this.soInfo.cCnt= result.totalCnt;});
              data.filter(option => option.subCd === 'S').map((result: any) => {this.soInfo.sCnt= result.totalCnt;});
          });
      //정산
      this.billInfo$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((data: any) => {
              data.filter(option => option.subCd === 'TOTAL').map((result: any) => {this.billInfo.totalCnt= result.totalCnt;});
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

      this.qtChart();
      this.poChart();
      this.soChart();

      //정산정보
      this.bill$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((data: any) => {
              this.billInfos = data;
              this.billChart(this.billInfos);
          });
      //udi정보
      this.udiInfo$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((data: any) => {
                this.udiInfos = data;
                this.udiChart(data);
                //this._prepareChartData();
      });
      //재고정보
      this.stockInfo$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((data: any) => {
              this.stockInfos = data;
              this.stockChart(data);
              //this._prepareChartData();
          });

      this._changeDetectorRef.markForCheck();
  }

    /**
     * Prepare the chart data from the data
     *
     * @private
     */
    private _prepareChartData(): void {
        // UDI 공급내역
        // this.chartUdiInfo = {
        //     chart: {
        //         fontFamily: 'inherit',
        //         foreColor: 'inherit',
        //         height: '100%',
        //         type: 'line',
        //         toolbar: {
        //             show: false
        //         },
        //         zoom: {
        //             enabled: false
        //         }
        //     },
        //     colors: ['#64748B', '#94A3B8'],
        //     dataLabels: {
        //         enabled: true,
        //         enabledOnSeries: [0],
        //         background: {
        //             borderWidth: 0
        //         }
        //     },
        //     grid: {
        //         borderColor: 'var(--fuse-border)'
        //     },
        //     labels: this.udiInfos.labels,
        //     legend: {
        //         show: false
        //     },
        //     plotOptions: {
        //         bar: {
        //             columnWidth: '50%'
        //         }
        //     },
        //     series: this.udiInfos.series,
        //     states: {
        //         hover: {
        //             filter: {
        //                 type: 'darken',
        //                 value: 0.75
        //             }
        //         }
        //     },
        //     stroke: {
        //         width: [3, 0]
        //     },
        //     tooltip: {
        //         followCursor: true,
        //         theme: 'dark'
        //     },
        //     xaxis: {
        //         axisBorder: {
        //             show: false
        //         },
        //         axisTicks: {
        //             color: 'var(--fuse-border)'
        //         },
        //         labels: {
        //             style: {
        //                 colors: 'var(--fuse-text-secondary)'
        //             }
        //         },
        //         tooltip: {
        //             enabled: false
        //         }
        //     },
        //     yaxis: {
        //         labels: {
        //             offsetX: -16,
        //             style: {
        //                 colors: 'var(--fuse-text-secondary)'
        //             }
        //         }
        //     }
        // };
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        // Get products if sort or page changes
        // merge(this._paginator.page).pipe(
        //     switchMap(() => {
        //
        //         this.isLoading = true;
        //         return this._dashboardsService.getRecallItem(this._paginator.pageIndex, this._paginator.pageSize, '', '','');
        //     }),
        //     map(() => {
        //         this.isLoading = false;
        //     })
        // ).subscribe();

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
        return;
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
        }else if(gbn === 'UDI'){
            this._router.navigate(['/udi/status']);
        }
    }

    actionButton() {

    }

    qtChart() {

        const doughnutChartLabels = [
            '작성 : ' + this.qtInfo.nCnt,
            '요청 : ' + this.qtInfo.sCnt,
            '재견적요청 : ' + this.qtInfo.rsCnt,
            '미확정 : ' + this.qtInfo.cfaCnt,
            '견적확정 : ' + this.qtInfo.cfCnt];

        const doughnutChartData =  {
            labels: doughnutChartLabels,
            datasets: [
                { data: [ this.qtInfo.nCnt, this.qtInfo.sCnt, this.qtInfo.rsCnt ,this.qtInfo.cfaCnt , this.qtInfo.cfCnt ],
                    backgroundColor : ['#45AAB4' , '#206491' , '#FBB45C' , '#F36480' , '#BDBDBD'],
                    hoverBackgroundColor : ['#45AAB4' , '#206491' , '#FBB45C' , '#F36480' , '#BDBDBD'],
                    borderWidth : 1,
                    hoverBorderWidth: 3,
                    hoverBorderColor: ['#45AAB4' , '#206491' , '#FBB45C' , '#F36480' , '#BDBDBD'],
                    hoverOffset: 4,}
            ],
        };
        const doughnutChartOption = {
            cutout: 30,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        boxWidth: 0,
                        font: {weight : 'bold', size: 10},
                        textAlign : 'right'
                        // color: 'rgb(255, 99, 132)'
                    },
                    position: 'right'
                },
            },
        };
        const qt = this.qtInfo;
        const doughnutChartPlugin = {
            id: 'plugin',
            // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
            beforeDraw(chart: Chart, args: { cancelable: true }): boolean | void {
                // eslint-disable-next-line @typescript-eslint/no-shadow
                const {ctx , chartArea: {top, right, bottom, left, width, height}} = chart;
                ctx.save();

                ctx.fillStyle = '#3983DC';
                // ctx.fillRect(width / 2, top + (height / 2) , 10, 10);

                ctx.font = '50px';
                ctx.textAlign = 'center';
                ctx.fillText('' + qt.cfCnt , width / 2, top + (height / 1.9));
            }
        };

        const ctx = document.getElementById('qt_chart');
        // @ts-ignore
        const qtChart = new Chart(ctx, {
            type: 'doughnut',
            data: doughnutChartData,
            options: doughnutChartOption,
            plugins: [doughnutChartPlugin],
        });
    }


    poChart() {
        const doughnutChartLabels = [
            '작성 : ' + this.poInfo.nCnt,
            '발주서 발송 : ' + this.poInfo.sCnt,
            '미확정 : ' + this.poInfo.cfaCnt,
            '발주확정 : ' + this.poInfo.cfCnt];

        const doughnutChartData =  {
            labels: doughnutChartLabels,
            datasets: [
                { data: [ this.poInfo.nCnt, this.poInfo.sCnt , this.poInfo.cfaCnt , this.poInfo.cfCnt ],
                    backgroundColor : ['#206491' , '#FBB45C' , '#F36480' , '#BDBDBD'],
                    hoverBackgroundColor : ['#206491' , '#FBB45C' , '#F36480' , '#BDBDBD'],
                    borderWidth : 1,
                    hoverBorderWidth: 3,
                    hoverBorderColor: ['#206491' , '#FBB45C' , '#F36480' , '#BDBDBD'],
                    hoverOffset: 4,}
            ],
        };
        const doughnutChartOption = {
            cutout: 30,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        boxWidth: 0,
                        font: {weight : 'bold', size: 10},
                        textAlign : 'right'
                        // color: 'rgb(255, 99, 132)'
                    },
                    position: 'right'
                },
            },
        };
        const po = this.poInfo;
        const doughnutChartPlugin = {
            id: 'plugin',
            // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
            beforeDraw(chart: Chart, args: { cancelable: true }): boolean | void {
                // eslint-disable-next-line @typescript-eslint/no-shadow
                const {ctx , chartArea: {top, right, bottom, left, width, height}} = chart;
                ctx.save();

                ctx.fillStyle = '#3983DC';
                // ctx.fillRect(width / 2, top + (height / 2) , 10, 10);

                ctx.font = '50px';
                ctx.textAlign = 'center';
                ctx.fillText('' + po.cfCnt , width / 2, top + (height / 1.9));
            }
        };

        const ctx = document.getElementById('po_chart');
        // @ts-ignore
        const poChart = new Chart(ctx, {
            type: 'doughnut',
            data: doughnutChartData,
            options: doughnutChartOption,
            plugins: [doughnutChartPlugin],
        });
    }

    soChart() {
        const doughnutChartLabels = [
            '주문접수 : ' + this.soInfo.nCnt,
            '주문취소 : ' + this.soInfo.cCnt,
            '등록완료 : ' + this.soInfo.sCnt,];

        const doughnutChartData =  {
            labels: doughnutChartLabels,
            datasets: [
                { data: [ this.soInfo.nCnt, this.soInfo.cCnt, this.soInfo.sCnt],
                    backgroundColor : ['#45AAB4' , '#FBB45C' , '#F36480'],
                    hoverBackgroundColor : ['#45AAB4' , '#FBB45C' , '#F36480'],
                    borderWidth : 1,
                    hoverBorderWidth: 3,
                    hoverBorderColor: ['#45AAB4' , '#FBB45C' , '#F36480'],
                    hoverOffset: 4,}
            ],
        };
        const doughnutChartOption = {
            cutout: 30,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        boxWidth: 0,
                        font: {weight : 'bold', size: 10},
                        textAlign : 'right'
                        // color: 'rgb(255, 99, 132)'
                    },
                    position: 'right'
                },
            },
        };
        const so = this.soInfo;
        const doughnutChartPlugin = {
            id: 'plugin',
            // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
            beforeDraw(chart: Chart, args: { cancelable: true }): boolean | void {
                // eslint-disable-next-line @typescript-eslint/no-shadow
                const {ctx , chartArea: {top, right, bottom, left, width, height}} = chart;
                ctx.save();

                ctx.fillStyle = '#3983DC';
                // ctx.fillRect(width / 2, top + (height / 2) , 10, 10);

                ctx.font = '50px';
                ctx.textAlign = 'center';
                ctx.fillText('' + so.sCnt, width / 2, top + (height / 1.9));
            }
        };

        const ctx = document.getElementById('so_chart');
        // @ts-ignore
        const soChart = new Chart(ctx, {
            type: 'doughnut',
            data: doughnutChartData,
            options: doughnutChartOption,
            plugins: [doughnutChartPlugin],
        });
    }

    priceToString(price): number {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    billChart(billInfos: any) {

        const buyPrice = [];
        const salesPrice = [];
        const date = [];
        const buy = billInfos.filter((option: any) => option.type === 'B').map((param: any) => {
            date.push(param.day);
            buyPrice.push(param.totalAmt);
            return param;
        });
        const sales = billInfos.filter((option: any) => option.type === 'S').map((param: any) => {
            salesPrice.push(param.totalAmt);
            return param;
        });
        const ctx = document.getElementById('bill_chart');
        // @ts-ignore
        const mixedChart = new Chart(ctx, {
            data: {
                datasets: [{
                    type: 'line',
                    label: '매입     ' + this.priceToString(billInfos[billInfos.length - 2].totalAmt) + ' 원',
                    data: buyPrice,
                    fill: false,
                    borderColor: '#3983DC',
                    pointBackgroundColor: '#3983DC',
                    hoverBackgroundColor: '#3983DC',
                    backgroundColor: '#3983DC',
                    hoverBorderColor : '#3983DC',
                    pointBorderColor : '#3983DC',
                    pointHoverBackgroundColor :'#3983DC',
                    pointHoverBorderColor: '#3983DC',
                    borderWidth: 1,
                    pointBorderWidth: 0.1,
                    hoverBorderWidth: 0.1,
                },{
                    type: 'line',
                    label: '매출     ' + this.priceToString(billInfos[billInfos.length -1].totalAmt) + ' 원',
                    data: salesPrice,
                    fill: false,
                    borderColor: '#45AAB4',
                    pointBackgroundColor: '#45AAB4',
                    hoverBackgroundColor: '#45AAB4',
                    backgroundColor: '#45AAB4',
                    hoverBorderColor : '#45AAB4',
                    pointBorderColor : '#45AAB4',
                    pointHoverBackgroundColor :'#45AAB4',
                    pointHoverBorderColor: '#45AAB4',
                    borderWidth: 1,
                    pointBorderWidth: 0.1,
                    hoverBorderWidth: 0.1,
                }],
                labels: date
            },
            options: {
                plugins: {
                    legend: {
                        boxWidth: 0,
                        boxHeight: 0,
                        align: 'center',
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            font: {
                                size: 8,
                            }
                        }
                    },
                    y: {
                        display: false,
                        ticks: {
                            font: {
                                size: 0,
                            }
                        }
                    }
                }
            }
        });
    }

    udiChart(data: any) {

        const eveCnt = [];
        const nowCnt = [];
        const eve = data.filter((option: any) => option.day === 'E').map((param: any) => {
            eveCnt.push(param.totalCnt);
            return param;
        });
        const now = data.filter((option: any) => option.day === 'N').map((param: any) => {
            nowCnt.push(param.totalCnt);
            return param;
        });
        const udiPlugin = {
            id: 'plugin',
            // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
            beforeDraw(chart: Chart, args: { cancelable: true }): boolean | void {
                // eslint-disable-next-line @typescript-eslint/no-shadow
                const {ctx , chartArea: {top, right, bottom, left, width, height}} = chart;
                chart.data.datasets.forEach((dataset, i) => {
                    const meta = chart.getDatasetMeta(i);
                    if(!meta.hidden){
                        meta.data.forEach((element, index) => {
                           ctx.fillStyle = '#000000';
                           const fontSize = 15;
                           const fontStyle = 'normal';
                           const fontFamily = '';
                           ctx.font = '15px';
                           const dataString = dataset.data[index].toString();
                           ctx.textAlign = 'center';
                           ctx.textBaseline = 'middle';
                           const position = element.tooltipPosition();
                           const padding = 5;
                           ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);
                        });
                    }
                });
            }
        };
        const ctx = document.getElementById('udi_chart');
        // @ts-ignore
        const mixedChart = new Chart(ctx, {
            plugins: [udiPlugin],
            data: {
                datasets: [{
                    type: 'bar',
                    label: '전월보고',
                    data: eveCnt,
                    fill: false,
                    borderColor: '#206491',
                    pointBackgroundColor: '#206491',
                    hoverBackgroundColor: '#206491',
                    backgroundColor: '#206491',
                    hoverBorderColor : '#206491',
                    pointBorderColor : '#206491',
                    pointHoverBackgroundColor :'#206491',
                    pointHoverBorderColor: '#206491',
                    borderWidth: 1,
                    pointBorderWidth: 0.1,
                    hoverBorderWidth: 0.1,
                },{
                    type: 'bar',
                    label: '당월등록',
                    data: nowCnt,
                    fill: false,
                    borderColor: '#45AAB4',
                    pointBackgroundColor: '#45AAB4',
                    hoverBackgroundColor: '#45AAB4',
                    backgroundColor: '#45AAB4',
                    hoverBorderColor : '#45AAB4',
                    pointBorderColor : '#45AAB4',
                    pointHoverBackgroundColor :'#45AAB4',
                    pointHoverBorderColor: '#45AAB4',
                    borderWidth: 1,
                    pointBorderWidth: 0.1,
                    hoverBorderWidth: 0.1,
                }],
                labels: ['1등급','2등급','3등급','4등급']
            },
            options: {
                plugins: {
                    tooltip: true,
                    legend: {
                        position: 'bottom',
                        boxWidth: 0,
                        boxHeight: 0,
                        align: 'center',
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            font: {
                                size: 8,
                            }
                        }
                    },
                    y: {
                        display: false,
                        ticks: {
                            font: {
                                size: 0,
                            }
                        }
                    }
                }
            }
        });
    }

    stockChart(data: any) {
        console.log(data);
        const doughnutChartLabels = [
            '1등급 : ' + data[0].availQty,
            '2등급 : ' + data[1].availQty,
            '3등급 : ' + data[2].availQty,
            '4등급 : ' + data[3].availQty,];

        let use = 0;
        let unUse = 0;
        data.forEach((item) => {
           use += item.poQty;
           use += item.availQty;
           unUse += item.acceptableQty;
           unUse += item.unusedQty;
           this.sumPoQty += item.poQty;
           this.sumAvailQty += item.availQty;
           this.sumPoAvailQty += item.poQty;
           this.sumPoAvailQty += item.availQty;
           this.sumAcceptableQty += item.acceptableQty;
           this.sumUnusedQty += item.unusedQty;
           this.sumAcceptableUnusedQty += item.acceptableQty;
           this.sumAcceptableUnusedQty += item.unusedQty;
           this.sumAll += item.poQty;
           this.sumAll += item.availQty;
           this.sumAll += item.acceptableQty;
           this.sumAll += item.unusedQty;
        });
        const totalAvailQty = data[0].availQty + data[1].availQty + data[2].availQty + data[3].availQty;

        const doughnutChartData =  {
            labels: doughnutChartLabels,
            datasets: [
                { data: [data[0].availQty, data[1].availQty, data[2].availQty, data[3].availQty ],
                    backgroundColor : ['#45AAB4' , '#206491' , '#FBB45C' , '#F36480' ],
                    hoverBackgroundColor : ['#45AAB4' , '#206491' , '#FBB45C' , '#F36480'],
                    borderWidth : 1,
                    hoverBorderWidth: 3,
                    hoverBorderColor: ['#45AAB4' , '#206491' , '#FBB45C' , '#F36480'],
                    hoverOffset: 4,}
            ],
        };
        const doughnutChartOption = {
            cutout: 30,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        boxWidth: 0,
                        font: {weight : 'bold', size: 10},
                        textAlign : 'right'
                        // color: 'rgb(255, 99, 132)'
                    },
                    position: 'right'
                },
            },
        };
        const doughnutChartPlugin = {
            id: 'plugin',
            // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
            beforeDraw(chart: Chart, args: { cancelable: true }): boolean | void {
                // eslint-disable-next-line @typescript-eslint/no-shadow
                const {ctx , chartArea: {top, right, bottom, left, width, height}} = chart;
                ctx.save();

                ctx.fillStyle = '#3983DC';
                // ctx.fillRect(width / 2, top + (height / 2) , 10, 10);

                ctx.font = '50px';
                ctx.textAlign = 'center';
                ctx.fillText('' + totalAvailQty , width / 2, top + (height / 1.9));
            }
        };

        const ctx = document.getElementById('stock_chart');
        // @ts-ignore
        const qtChart = new Chart(ctx, {
            type: 'doughnut',
            data: doughnutChartData,
            options: doughnutChartOption,
            plugins: [doughnutChartPlugin],
        });


        const stockPlugin = {
            id: 'plugin',
            // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
            beforeDraw(chart: Chart, args: { cancelable: true }): boolean | void {
                // eslint-disable-next-line @typescript-eslint/no-shadow
                const {ctx , chartArea: {top, right, bottom, left, width, height}} = chart;
                chart.data.datasets.forEach((dataset, i) => {
                    const meta = chart.getDatasetMeta(i);
                    if(!meta.hidden){
                        meta.data.forEach((element, index) => {
                            ctx.fillStyle = '#000000';
                            const fontSize = 15;
                            const fontStyle = 'normal';
                            const fontFamily = '';
                            ctx.font = '15px';
                            const dataString = dataset.data[index].toString();
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            const position = element.tooltipPosition();
                            const padding = 5;
                            ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);
                        });
                    }
                });
            }
        };
        const ctx2 = document.getElementById('stock2_chart');
        // @ts-ignore
        const mixedChart = new Chart(ctx2, {
            plugins: [stockPlugin],
            data: {
                datasets: [{
                    type: 'bar',
                    axis: 'y',
                    data: [use , unUse],
                    fill: false,
                    borderColor: ['#3983DC','#BDBDBD'],
                    pointBackgroundColor: ['#3983DC','#BDBDBD'],
                    hoverBackgroundColor: ['#3983DC','#BDBDBD'],
                    backgroundColor: ['#3983DC','#BDBDBD'],
                    hoverBorderColor : ['#3983DC','#BDBDBD'],
                    pointBorderColor : ['#3983DC','#BDBDBD'],
                    pointHoverBackgroundColor :['#3983DC','#BDBDBD'],
                    pointHoverBorderColor: ['#3983DC' ,'#BDBDBD'],
                    borderWidth: 1,
                    pointBorderWidth: 0.1,
                    hoverBorderWidth: 0.1,
                }],
                labels: ['가용', '비가용'],
            },
            options: {
                indexAxis: 'y',
                plugins: {
                    tooltip: true,
                    legend: {
                        display: false,
                        position: 'bottom',
                        boxWidth: 0,
                        boxHeight: 0,
                        align: 'center',
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            font: {
                                size: 8,
                            }
                        }
                    },
                    y: {
                        display: false,
                        ticks: {
                            font: {
                                size: 0,
                            }
                        }
                    }
                }
            }
        });
    }
}
