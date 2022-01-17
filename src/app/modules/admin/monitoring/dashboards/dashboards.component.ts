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
import {SessionStore} from '../../../../core/session/state/session.store';
import {ApexOptions} from 'ng-apexcharts';
import {Chart, ChartEvent} from 'chart.js';
import ChartDataLabels, {Context} from 'chartjs-plugin-datalabels';
import {createMouseEvent} from "@angular/cdk/testing/testbed/fake-events";

@Component({
    selector: 'app-dashboards',
    templateUrl: './dashboards.component.html',
    styleUrls: ['./dashboards.component.scss']
})
export class DashboardsComponent implements OnInit, AfterViewInit, OnDestroy {

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
    udiLastDay: any;
    ibInfo: IbInfo = {nCnt: 0, cCnt: 0, pCnt: 0, sCnt: 0, pcCnt: 0, scCnt: 0};
    obInfo: ObInfo = {nCnt: 0, cCnt: 0, pCnt: 0, sCnt: 0, pcCnt: 0, scCnt: 0};
    qtInfo: QtInfo = {nCnt: 0, cCnt: 0, sCnt: 0, rsCnt: 0, cfaCnt: 0, cfCnt: 0};
    poInfo: PoInfo = {nCnt: 0, cCnt: 0, sCnt: 0, pCnt: 0, cfaCnt: 0, cfCnt: 0};
    soInfo: SoInfo = {sCnt: 0, cCnt: 0, nCnt: 0};
    billInfo: BillInfo = {totalCnt: 0};
    recallItems$: Observable<RecallItem[]>;
    pagination: DashboardsPagination = {length: 0, size: 0, page: 0, lastPage: 0, startIndex: 0, endIndex: 0};
    isLoading: boolean = false;
    isMobile: boolean = false;
    billop: boolean = false;
    ibInfonCnt: any;
    ibInfopCnt: any;
    ibInfopsCnt: any;
    obInfonCnt: any;
    obInfopCnt: any;
    obInfopsCnt: any;
    buy: any;
    sal: any;
    buybool: boolean = true;
    salbool: boolean = false;
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
        this.isMobile = this._deviceService.isMobile();
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
                data.filter(option => option.subCd === 'N').map((result: any) => {
                    this.ibInfo.nCnt = result.totalCnt;
                });
                data.filter(option => option.subCd === 'C').map((result: any) => {
                    this.ibInfo.cCnt = result.totalCnt;
                });
                data.filter(option => option.subCd === 'P').map((result: any) => {
                    this.ibInfo.pCnt = result.totalCnt;
                });
                data.filter(option => option.subCd === 'S').map((result: any) => {
                    this.ibInfo.sCnt = result.totalCnt;
                });
                data.filter(option => option.subCd === 'PC').map((result: any) => {
                    this.ibInfo.pcCnt = result.totalCnt;
                });
                data.filter(option => option.subCd === 'SC').map((result: any) => {
                    this.ibInfo.scCnt = result.totalCnt;
                });
            });

        const ibInfoCnt = this.ibInfo.nCnt + this.ibInfo.pCnt + (this.ibInfo.pCnt + this.ibInfo.sCnt);
        const ibInfonCnt = this.ibInfo.nCnt / ibInfoCnt * 100;
        const ibInfopCnt = this.ibInfo.pCnt / ibInfoCnt * 100;
        const ibInfopsCnt = (this.ibInfo.pCnt + this.ibInfo.sCnt) / ibInfoCnt * 100;

        this.ibInfonCnt = Math.round(ibInfonCnt);
        this.ibInfopCnt = Math.round(ibInfopCnt);
        this.ibInfopsCnt = Math.round(ibInfopsCnt);

        //견적
        this.qtInfo$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data: any) => {
                data.filter(option => option.subCd === 'N').map((result: any) => {
                    this.qtInfo.nCnt = result.totalCnt;
                });
                data.filter(option => option.subCd === 'C').map((result: any) => {
                    this.qtInfo.cCnt = result.totalCnt;
                });
                data.filter(option => option.subCd === 'S').map((result: any) => {
                    this.qtInfo.sCnt = result.totalCnt;
                });
                data.filter(option => option.subCd === 'RS').map((result: any) => {
                    this.qtInfo.rsCnt = result.totalCnt;
                });
                data.filter(option => option.subCd === 'CFA').map((result: any) => {
                    this.qtInfo.cfaCnt = result.totalCnt;
                });
                data.filter(option => option.subCd === 'CF').map((result: any) => {
                    this.qtInfo.cfCnt = result.totalCnt;
                });
            });
        //출고
        this.obInfo$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data: any) => {
                data.filter(option => option.subCd === 'N').map((result: any) => {
                    this.obInfo.nCnt = result.totalCnt;
                });
                data.filter(option => option.subCd === 'C').map((result: any) => {
                    this.obInfo.cCnt = result.totalCnt;
                });
                data.filter(option => option.subCd === 'P').map((result: any) => {
                    this.obInfo.pCnt = result.totalCnt;
                });
                data.filter(option => option.subCd === 'S').map((result: any) => {
                    this.obInfo.sCnt = result.totalCnt;
                });
                data.filter(option => option.subCd === 'PC').map((result: any) => {
                    this.obInfo.pcCnt = result.totalCnt;
                });
                data.filter(option => option.subCd === 'SC').map((result: any) => {
                    this.obInfo.scCnt = result.totalCnt;
                });
            });

        const obInfoCnt = this.obInfo.nCnt + this.obInfo.pCnt + (this.obInfo.pCnt + this.obInfo.sCnt);
        const obInfonCnt = this.obInfo.nCnt / obInfoCnt * 100;
        const obInfopCnt = this.obInfo.pCnt / obInfoCnt * 100;
        const obInfopsCnt = (this.obInfo.pCnt + this.obInfo.sCnt) / obInfoCnt * 100;

        this.obInfonCnt = Math.round(obInfonCnt);
        this.obInfopCnt = Math.round(obInfopCnt);
        this.obInfopsCnt = Math.round(obInfopsCnt);

        //발주
        this.poInfo$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data: any) => {
                data.filter(option => option.subCd === 'N').map((result: any) => {
                    this.poInfo.nCnt = result.totalCnt;
                });
                data.filter(option => option.subCd === 'C').map((result: any) => {
                    this.poInfo.cCnt = result.totalCnt;
                });
                data.filter(option => option.subCd === 'S').map((result: any) => {
                    this.poInfo.sCnt = result.totalCnt;
                });
                data.filter(option => option.subCd === 'P').map((result: any) => {
                    this.poInfo.pCnt = result.totalCnt;
                });
                data.filter(option => option.subCd === 'CFA').map((result: any) => {
                    this.poInfo.cfaCnt = result.totalCnt;
                });
                data.filter(option => option.subCd === 'CF').map((result: any) => {
                    this.poInfo.cfCnt = result.totalCnt;
                });
            });
        //주문
        this.soInfo$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data: any) => {
                data.filter(option => option.subCd === 'N').map((result: any) => {
                    this.soInfo.nCnt = result.totalCnt;
                });
                data.filter(option => option.subCd === 'C').map((result: any) => {
                    this.soInfo.cCnt = result.totalCnt;
                });
                data.filter(option => option.subCd === 'S').map((result: any) => {
                    this.soInfo.sCnt = result.totalCnt;
                });
            });
        //정산
        this.billInfo$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data: any) => {
                data.filter(option => option.subCd === 'TOTAL').map((result: any) => {
                    this.billInfo.totalCnt = result.totalCnt;
                });
            });

        // getItems
        this.recallItems$ = this._dashboardsService.reallItems$;

        this._dashboardsService.reallItems$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((items: any) => {
                // Update the counts
                if (items === null || items === 'null') {
                    this.racallTaleData = null;
                    this.reacllItemsCount = 0;
                } else {
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
                if (pagination !== null) {
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
        this.buy = this.billInfos[this.billInfos.length - 2].totalAmt + '원';
        this.sal = this.billInfos[this.billInfos.length - 1].totalAmt + '원';
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

    movePage(): void {
        this._router.navigate(['/pages/settings']);
    }

    goPage(obj): void {
        if (obj.gbn === 'QT') {
            if (obj.status === 'QR') {
                this._router.navigate(['/estimate-order/estimate', {type: obj.status}]);
            } else {
                this._router.navigate(['/estimate-order/estimate', {status: obj.status}]);
            }
        } else if (obj.gbn === 'PO') {
            this._router.navigate(['/estimate-order/order', {status: obj.status}]);
        } else if (obj.gbn === 'SO') {
            this._router.navigate(['/salesorder/salesorder', {status: obj.status}]);
        } else if (obj.gbn === 'IB') {
            this._router.navigate(['/bound/inbound', {status: obj.status}]);
        } else if (obj.gbn === 'OB') {
            this._router.navigate(['/bound/outbound', {status: obj.status}]);
        } else if (obj.gbn === 'BILL') {
            this._router.navigate(['/calculate/bill', {status: obj.status}]);
        } else if (obj.gbn === 'TAX') {
            this._router.navigate(['/calculate/tax', {status: obj.status}]);
        }


        // }else if(gbn === 'OB'){
        //     this._router.navigate(['/bound/outbound']);
        // }else if(gbn === 'UDI'){
        //     this._router.navigate(['/udi/status']);
        // }
    }

    actionButton() {

    }


    qtChart() {

        const doughnutChartLabels = [
            '작성 : ' + this.qtInfo.nCnt,
            '요청 : ' + this.qtInfo.sCnt,
            '재요청 : ' + this.qtInfo.rsCnt,
            '미확정 : ' + this.qtInfo.cfaCnt,
            '확정 : ' + this.qtInfo.cfCnt];
        const doughnutChartData = {
            labels: doughnutChartLabels,
            datasets: [
                {
                    data: [this.qtInfo.nCnt, this.qtInfo.sCnt, this.qtInfo.rsCnt, this.qtInfo.cfaCnt, this.qtInfo.cfCnt],
                    backgroundColor: ['#45AAB4', '#206491', '#FBB45C', '#F36480', '#3983DC'],
                    hoverBackgroundColor: ['#45AAB4', '#206491', '#FBB45C', '#F36480', '#3983DC'],
                    borderWidth: 1,
                    hoverBorderWidth: 1,
                    hoverBorderColor: ['#45AAB4', '#206491', '#FBB45C', '#F36480', '#3983DC'],
                    hoverOffset: 1,
                }
            ],
        };
        let qtHover = true;
        const doughnutChartOption = {
            cutout: (ctx: Context) => {
                if (this.isMobile) {
                    return 45;
                } else {
                    return 50;
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        boxWidth: 0,
                        font: {weight: 'bold', size: 13},
                        textAlign: 'left',
                        color: '#000000'
                    },
                    position: 'right'
                },
            },
            onHover: (event, activeElements, chart: Chart) => {
                const {ctx, chartArea: {top, right, bottom, left, width, height}} = chart;
                ctx.fillStyle = '#3983DC';
                ctx.font = '25px arial, "Malgun Gothic", "맑은 고딕", AppleSDGothicNeo-Light, sans-serif';
                ctx.textAlign = 'center';
                if(event.type !== 'mousemove') {
                    qtHover = true;
                }
                if (activeElements.length > 0) {
                    if (activeElements[0].index === 0) {
                        qtHover = false;
                        ctx.fillText('작성', width / 2, top + (height / 2));
                        ctx.fillText('' + qt.nCnt, width / 2, top + (height / 1.65));
                    } else if (activeElements[0].index === 1) {
                        qtHover = false;
                        ctx.fillText('요청', width / 2, top + (height / 2));
                        ctx.fillText('' + qt.sCnt, width / 2, top + (height / 1.65));
                    } else if (activeElements[0].index === 2) {
                        qtHover = false;
                        ctx.fillText('재요청', width / 2, top + (height / 2));
                        ctx.fillText('' + qt.rsCnt, width / 2, top + (height / 1.65));
                    } else if (activeElements[0].index === 3) {
                        qtHover = false;
                        ctx.fillText('미확정', width / 2, top + (height / 2));
                        ctx.fillText('' + qt.cfaCnt, width / 2, top + (height / 1.65));
                    } else if (activeElements[0].index === 4) {
                        qtHover = false;
                        ctx.fillText('확정', width / 2, top + (height / 2));
                        ctx.fillText('' + qt.cfCnt, width / 2, top + (height / 1.65));
                    }
                }
            }
        };
        const qt = this.qtInfo;
        const max = qt.nCnt + qt.sCnt + qt.rsCnt + qt.cfaCnt + qt.cfCnt;
        const doughnutChartPlugin = {
            id: 'plugin',
            // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
            beforeDraw(chart: Chart, args: { cancelable: true }, activeElements): boolean | void {
                // eslint-disable-next-line @typescript-eslint/no-shadow
                const {ctx, chartArea: {top, right, bottom, left, width, height}} = chart;
                ctx.fillStyle = '#3983DC';
                ctx.font = '25px arial, "Malgun Gothic", "맑은 고딕", AppleSDGothicNeo-Light, sans-serif';
                ctx.textAlign = 'center';
                if(qtHover) {
                    //ctx.fillText('' + max, width / 2, top + (height / 1.85));
                    ctx.fillText('작성' , width / 2, top + (height / 2));
                    ctx.fillText('' + qt.nCnt, width / 2, top + (height / 1.65));
                }
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
            '발송 : ' + this.poInfo.sCnt,
            '미확정 : ' + this.poInfo.cfaCnt,
            '확정 : ' + this.poInfo.cfCnt];

        const doughnutChartData = {
            labels: doughnutChartLabels,
            datasets: [
                {
                    data: [this.poInfo.nCnt, this.poInfo.sCnt, this.poInfo.cfaCnt, this.poInfo.cfCnt],
                    backgroundColor: ['#206491', '#FBB45C', '#F36480', '#3983DC'],
                    hoverBackgroundColor: ['#206491', '#FBB45C', '#F36480', '#3983DC'],
                    borderWidth: 1,
                    hoverBorderWidth: 1,
                    hoverBorderColor: ['#206491', '#FBB45C', '#F36480', '#3983DC'],
                    hoverOffset: 1,
                }
            ],
        };
        let poHover = true;
        const doughnutChartOption = {
            cutout: (ctx: Context) => {
                if (this.isMobile) {
                    return 45;
                } else {
                    return 50;
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        boxWidth: 0,
                        font: {weight: 'bold', size: 13},
                        textAlign: 'left',
                        color: '#000000'
                    },
                    position: 'right'
                },
            },
            onHover: (event, activeElements, chart: Chart) => {
                const {ctx, chartArea: {top, right, bottom, left, width, height}} = chart;
                ctx.save();
                ctx.fillStyle = '#3983DC';
                ctx.font = '25px arial, "Malgun Gothic", "맑은 고딕", AppleSDGothicNeo-Light, sans-serif';
                ctx.textAlign = 'center';
                if(event.type !== 'mousemove') {
                    poHover = true;
                }
                if (activeElements.length > 0) {
                    if (activeElements[0].index === 0) {
                        poHover = false;
                        ctx.fillText('작성' , width / 2, top + (height / 2));
                        ctx.fillText('' + po.nCnt, width / 2, top + (height / 1.65));
                    } else if (activeElements[0].index === 1) {
                        poHover = false;
                        ctx.fillText('발송' , width / 2, top + (height / 2));
                        ctx.fillText('' + po.sCnt, width / 2, top + (height / 1.65));
                    } else if (activeElements[0].index === 2) {
                        poHover = false;
                        ctx.fillText('미확정' , width / 2, top + (height / 2));
                        ctx.fillText('' + po.cfaCnt, width / 2, top + (height / 1.65));
                    } else if (activeElements[0].index === 3) {
                        poHover = false;
                        ctx.fillText('확정' , width / 2, top + (height / 2));
                        ctx.fillText('' + po.cfCnt, width / 2, top + (height / 1.65));
                    }
                } else {
                    poHover = true;
                }
            }
        };
        const po = this.poInfo;
        const max = po.nCnt + po.sCnt + po.cfaCnt + po.cfCnt;
        const doughnutChartPlugin = {
            id: 'plugin',
            // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
            beforeDraw(chart: Chart, args: { cancelable: true }): boolean | void {
                // eslint-disable-next-line @typescript-eslint/no-shadow
                const {ctx, chartArea: {top, right, bottom, left, width, height}} = chart;
                ctx.save();
                ctx.fillStyle = '#3983DC';
                ctx.font = '25px arial, "Malgun Gothic", "맑은 고딕", AppleSDGothicNeo-Light, sans-serif';
                ctx.textAlign = 'center';
                if(poHover) {
                    ctx.fillText('작성' , width / 2, top + (height / 2));
                    ctx.fillText('' + po.nCnt, width / 2, top + (height / 1.65));
                }
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
            '접수 : ' + this.soInfo.nCnt,
            '취소 : ' + this.soInfo.cCnt,
            '등록 : ' + this.soInfo.sCnt,];

        const doughnutChartData = {
            labels: doughnutChartLabels,
            datasets: [
                {
                    data: [this.soInfo.nCnt, this.soInfo.cCnt, this.soInfo.sCnt],
                    backgroundColor: ['#45AAB4', '#FBB45C', '#3983DC'],
                    hoverBackgroundColor: ['#45AAB4', '#FBB45C', '#3983DC'],
                    borderWidth: 1,
                    hoverBorderWidth: 1,
                    hoverBorderColor: ['#45AAB4', '#FBB45C', '#3983DC'],
                    hoverOffset: 1,
                }
            ],
        };
        let soHover = true;
        const doughnutChartOption = {
            cutout: (ctx: Context) => {
                if (this.isMobile) {
                    return 45;
                } else {
                    return 50;
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        boxWidth: 0,
                        font: {weight: 'bold', size: 13},
                        textAlign: 'left',
                        color: '#000000'
                    },
                    position: 'right'
                },
            },
            onHover: (event, activeElements, chart: Chart) => {
                const {ctx, chartArea: {top, right, bottom, left, width, height}} = chart;
                ctx.save();
                ctx.fillStyle = '#3983DC';
                ctx.font = '25px arial, "Malgun Gothic", "맑은 고딕", AppleSDGothicNeo-Light, sans-serif';
                ctx.textAlign = 'center';
                if(event.type !== 'mousemove') {
                    soHover = true;
                }
                if (activeElements.length > 0) {
                    if (activeElements[0].index === 0) {
                        soHover = false;
                        ctx.fillText('접수' , width / 2, top + (height / 2));
                        ctx.fillText('' + so.nCnt, width / 2, top + (height / 1.65));
                    } else if (activeElements[0].index === 1) {
                        soHover = false;
                        ctx.fillText('취소' , width / 2, top + (height / 2));
                        ctx.fillText('' + so.cCnt, width / 2, top + (height / 1.65));
                    } else if (activeElements[0].index === 2) {
                        soHover = false;
                        ctx.fillText('등록' , width / 2, top + (height / 2));
                        ctx.fillText('' + so.sCnt, width / 2, top + (height / 1.65));
                    }
                } else {
                    soHover = true;
                }
            }
        };
        const so = this.soInfo;
        const max = so.nCnt + so.cCnt + so.sCnt;
        const doughnutChartPlugin = {
            id: 'plugin',
            // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
            beforeDraw(chart: Chart, args: { cancelable: true }): boolean | void {
                // eslint-disable-next-line @typescript-eslint/no-shadow
                const {ctx, chartArea: {top, right, bottom, left, width, height}} = chart;
                ctx.save();
                ctx.fillStyle = '#3983DC';
                ctx.font = '25px arial, "Malgun Gothic", "맑은 고딕", AppleSDGothicNeo-Light, sans-serif';
                ctx.textAlign = 'center';
                if(soHover) {
                    ctx.fillText('접수' , width / 2, top + (height / 2));
                    ctx.fillText('' + so.nCnt, width / 2, top + (height / 1.65));
                }
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
                    hoverBorderColor: '#3983DC',
                    pointBorderColor: '#3983DC',
                    pointHoverBackgroundColor: '#3983DC',
                    pointHoverBorderColor: '#3983DC',
                    borderWidth: 1,
                    pointBorderWidth: 0.1,
                    hoverBorderWidth: 0.1,
                }, {
                    type: 'line',
                    label: '매출     ' + this.priceToString(billInfos[billInfos.length - 1].totalAmt) + ' 원',
                    data: salesPrice,
                    fill: false,
                    hidden: true,
                    borderColor: '#45AAB4',
                    pointBackgroundColor: '#45AAB4',
                    hoverBackgroundColor: '#45AAB4',
                    backgroundColor: '#45AAB4',
                    hoverBorderColor: '#45AAB4',
                    pointBorderColor: '#45AAB4',
                    pointHoverBackgroundColor: '#45AAB4',
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
                        display: false,
                        boxWidth: 0,
                        boxHeight: 0,
                        align: 'center',
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            font: {
                                size: 13,
                                weight: 'bold'
                            },
                            color: '#000000'
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
        document.getElementById('billbuy').addEventListener('click', () => {
            if (!this.buybool) {
                mixedChart.hide(0);
            } else {
                mixedChart.show(0);
            }
        });
        document.getElementById('billbuy').addEventListener('click', () => {
            if (!this.salbool) {
                mixedChart.hide(1);
            } else {
                mixedChart.show(1);
            }
        });
    }

    billbuy(): void {
        if (!this.buybool) {
            this.buybool = true;
        } else {
            this.buybool = false;
        }
        if (!this.salbool) {
            this.salbool = true;
        } else {
            this.salbool = false;
        }
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
        // const udiPlugin = {
        //     id: 'plugin',
        //     // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
        //     beforeDraw(chart: Chart, args: { cancelable: true }): boolean | void {
        //         // eslint-disable-next-line @typescript-eslint/no-shadow
        //         const {ctx, chartArea: {top, right, bottom, left, width, height}} = chart;
        //         chart.data.datasets.forEach((dataset, i) => {
        //             const meta = chart.getDatasetMeta(i);
        //             if (!meta.hidden) {
        //                 meta.data.forEach((element, index) => {
        //                     ctx.fillStyle = '#000000';
        //                     const fontSize = 15;
        //                     const fontStyle = 'normal';
        //                     const fontFamily = '';
        //                     ctx.font = '15px';
        //                     const dataString = dataset.data[index].toString();
        //                     ctx.textAlign = 'center';
        //                     ctx.textBaseline = 'middle';
        //                     const position = element.tooltipPosition();
        //                     const padding = 5;
        //                     ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);
        //                 });
        //             }
        //         });
        //     }
        // };

        const ctx = document.getElementById('udi_chart');

        // @ts-ignore
        const mixedChart = new Chart(ctx, {
                plugins: [ChartDataLabels],
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
                        hoverBorderColor: '#206491',
                        pointBorderColor: '#206491',
                        pointHoverBackgroundColor: '#206491',
                        pointHoverBorderColor: '#206491',
                        borderWidth: 1,
                        pointBorderWidth: 0.1,
                        hoverBorderWidth: 0.1,
                    }, {
                        type: 'bar',
                        label: '당월등록',
                        data: nowCnt,
                        fill: false,
                        borderColor: '#45AAB4',
                        pointBackgroundColor: '#45AAB4',
                        hoverBackgroundColor: '#45AAB4',
                        backgroundColor: '#45AAB4',
                        hoverBorderColor: '#45AAB4',
                        pointBorderColor: '#45AAB4',
                        pointHoverBackgroundColor: '#45AAB4',
                        pointHoverBorderColor: '#45AAB4',
                        borderWidth: 1,
                        pointBorderWidth: 0.1,
                        hoverBorderWidth: 0.1,
                    }],
                    labels: ['1등급', '2등급', '3등급', '4등급']
                },
                options: {
                    responsive: false,
                    plugins: {
                        datalabels: {
                            color: '#000000',
                            display: (ctx: Context) => {
                                if (ctx.dataset.data[ctx.dataIndex] < 1) {
                                    return false;
                                }
                            },
                            font: {weight:'bold', size: 10},
                        },
                        legend: {
                            position: 'bottom',
                            boxWidth: 0,
                            boxHeight: 0,
                            align: 'center',
                            font: {size: 13},
                            color: '#000000'
                        },
                    },
                    scales: {
                        x: {
                            ticks: {
                                font: {
                                    size: 12,
                                },
                                color: '#000000'
                            }
                        },
                        y: {
                            ticks: {
                                font: {
                                    size: 12,
                                },
                                color: '#000000'
                            }
                        }
                    }
                }
            }
        );
        const
            currDay = new Date();
        const
            year = currDay.getFullYear();
        const
            month = currDay.getMonth() + 1;
        const
            date = new Date(year, month, 0);
        const
            day = date.getDate();
        const
            lastDay = new Date(`${currDay.getFullYear()}-${month}-${day}`);

        const
            diffDays = Math.floor((lastDay.getTime() - currDay.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays

            ===
            0
        ) {
            this
                .udiLastDay = 'D-day';
        } else {
            this.udiLastDay = 'D-' + diffDays;
        }
    }

    stockChart(data: any) {
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

        const doughnutChartData = {
            labels: doughnutChartLabels,
            datasets: [
                {
                    data: [data[0].availQty, data[1].availQty, data[2].availQty, data[3].availQty],
                    backgroundColor: ['#45AAB4', '#206491', '#FBB45C', '#F36480'],
                    hoverBackgroundColor: ['#45AAB4', '#206491', '#FBB45C', '#F36480'],
                    borderWidth: 1,
                    hoverBorderWidth: 1,
                    hoverBorderColor: ['#45AAB4', '#206491', '#FBB45C', '#F36480'],
                    hoverOffset: 1,
                }
            ],
        };
        let doughnut = true;
        const doughnutChartOption = {
            cutout: (ctx: Context) => {
                if (this.isMobile) {
                    return 45;
                } else {
                    return 43;
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        boxWidth: 0,
                        font: {weight: 'bold', size: 13},
                        textAlign: 'left',
                        color: '#000000'
                    },
                    position: 'right'
                },
            },
            onHover: (event, activeElements, chart: Chart) => {
                const {ctx, chartArea: {top, right, bottom, left, width, height}} = chart;
                ctx.save();
                ctx.fillStyle = '#3983DC';
                ctx.font = '30px arial, "Malgun Gothic", "맑은 고딕", AppleSDGothicNeo-Light, sans-serif';
                ctx.textAlign = 'center';
                if(event.type !== 'mousemove') {
                    doughnut = true;
                }
                if (activeElements.length > 0) {
                    if (activeElements[0].index === 0) {
                        doughnut = false;
                        ctx.fillText('' + data[0].availQty, width / 2, top + (height / 1.85));
                    } else if (activeElements[0].index === 1) {
                        doughnut = false;
                        ctx.fillText('' + data[1].availQty, width / 2, top + (height / 1.85));
                    } else if (activeElements[0].index === 2) {
                        doughnut = false;
                        ctx.fillText('' + data[2].availQty, width / 2, top + (height / 1.85));
                    } else if (activeElements[0].index === 3) {
                        doughnut = false;
                        ctx.fillText('' + data[3].availQty, width / 2, top + (height / 1.85));
                    }
                } else {
                    doughnut = true;
                }
            }
        };
        const doughnutChartPlugin = {
            id: 'plugin',
            // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
            beforeDraw(chart: Chart, args: { cancelable: true }): boolean | void {
                // eslint-disable-next-line @typescript-eslint/no-shadow
                const {ctx, chartArea: {top, right, bottom, left, width, height}} = chart;
                ctx.save();
                ctx.fillStyle = '#3983DC';
                ctx.font = '30px arial, "Malgun Gothic", "맑은 고딕", AppleSDGothicNeo-Light, sans-serif';
                ctx.textAlign = 'center';
                if(doughnut) {
                    ctx.fillText('' + totalAvailQty, width / 2.0, top + (height / 1.85));
                }
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
            beforeDraws(chart: Chart, args: { cancelable: true }): boolean | void {
                // eslint-disable-next-line @typescript-eslint/no-shadow
                const {ctx, chartArea: {top, right, bottom, left, width, height}} = chart;
                chart.data.datasets.forEach((dataset, i) => {
                    const meta = chart.getDatasetMeta(i);
                    if (!meta.hidden) {
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
            plugins: [ChartDataLabels],
            data: {
                datasets: [{
                    type: 'bar',
                    axis: 'y',
                    data: [use, unUse],
                    fill: false,
                    borderColor: ['#3983DC', '#BDBDBD'],
                    pointBackgroundColor: ['#3983DC', '#BDBDBD'],
                    hoverBackgroundColor: ['#3983DC', '#BDBDBD'],
                    backgroundColor: ['#3983DC', '#BDBDBD'],
                    hoverBorderColor: ['#3983DC', '#BDBDBD'],
                    pointBorderColor: ['#3983DC', '#BDBDBD'],
                    pointHoverBackgroundColor: ['#3983DC', '#BDBDBD'],
                    pointHoverBorderColor: ['#3983DC', '#BDBDBD'],
                    borderWidth: 1,
                    pointBorderWidth: 0.1,
                    hoverBorderWidth: 0.1,
                }],
                labels: ['가용', '비가용'],
            },
            options: {
                indexAxis: 'y',
                plugins: {
                    datalabels: {
                        color: '#000000',
                        align: (ctx: Context) => {
                            if (ctx.dataset.data[ctx.dataIndex] < 1000) {
                                return 'right';
                            }
                        },
                        anchor: (ctx: Context) => {
                            if (ctx.dataset.data[ctx.dataIndex] < 1000) {
                                return 'end';
                            }
                        },
                        font: {weight: 'bolder', size: 12},
                        borderWidth: 2,
                    },
                    legend: {
                        display: false,
                        position: 'left',
                        boxWidth: 0,
                        boxHeight: 0,
                        align: 'start',
                    }
                },
                scales: {
                    x: {
                        display: false,
                        ticks: {
                            font: {
                                size: 13,
                                weight: 'bold'
                            },
                            color: '#000000'
                        }
                    },
                    y: {
                        ticks: {
                            font: {
                                size: 13,
                                weight: 'bold'
                            },
                            color: '#000000'
                        }
                    }
                }
            }
        });
    }

    biiOption() {
        if (this.billop) {
            this.billop = false;
        } else {
            this.billop = true;
        }
        //this.planBillingForm.patchValue({'payGrade': this.payGrade + ''});

        this._changeDetectorRef.markForCheck();
    }
}

