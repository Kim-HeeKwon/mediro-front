import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
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
import {Chart} from 'chart.js';
import {Context} from 'chartjs-plugin-datalabels';
import {EmptyObject} from 'chart.js/types/basic';

@Component({
    selector: 'app-dashboards',
    templateUrl: './dashboards.component.html',
    styleUrls: ['./dashboards.component.scss']
})
export class DashboardsComponent implements OnInit, AfterViewInit, OnDestroy {
    userName: string;
    ibInfo$: Observable<DashboardInfo1>;
    obInfo$: Observable<DashboardInfo1>;
    qtInfo$: Observable<DashboardInfo1>;
    poInfo$: Observable<DashboardInfo1>;
    soInfo$: Observable<DashboardInfo1>;
    supplyStatus$: Observable<DashboardInfo1>;
    udiInfo$: Observable<any>;
    bill$: Observable<any>;
    billInfo$: Observable<any>;
    stockInfo$: Observable<any>;
    stockInfos: any;
    billInfos: any;
    udiMonth: any;
    udiLastDay: any;
    errEveCnt: any;
    errNowCnt: any;
    nowRtn: any;
    eveRtn: any;
    nowRpt: any;
    eveRpt: any;
    stockTotalPrice: any;
    availQtyPrice: any;
    acceptableTotal: any;
    acceptableTotalPrice: any;
    unusedQtyTotal: any;
    unusedQtyTotalPrice: any;
    ibInfo: IbInfo = {nCnt: 0, cCnt: 0, pCnt: 0, sCnt: 0, pcCnt: 0, scCnt: 0};
    obInfo: ObInfo = {nCnt: 0, cCnt: 0, pCnt: 0, sCnt: 0, pcCnt: 0, scCnt: 0};
    qtInfo: QtInfo = {nCnt: 0, cCnt: 0, sCnt: 0, rsCnt: 0, cfaCnt: 0, cfCnt: 0};
    poInfo: PoInfo = {nCnt: 0, cCnt: 0, sCnt: 0, pCnt: 0, cfaCnt: 0, cfCnt: 0};
    soInfo: SoInfo = {sCnt: 0, cCnt: 0, nCnt: 0};
    nowCnt = {oCnt: 0, tCnt: 0, thCnt: 0, fCnt: 0};
    eveCnt = {oCnt: 0, tCnt: 0, thCnt: 0, fCnt: 0};
    udiErrE = {oCnt: 0, tCnt: 0, thCnt: 0, fCnt: 0};
    udiErrN = {oCnt: 0, tCnt: 0, thCnt: 0, fCnt: 0};
    udiNowRtn = {oCnt: 0, tCnt: 0, thCnt: 0, fCnt: 0};
    udiEveRtn = {oCnt: 0, tCnt: 0, thCnt: 0, fCnt: 0};
    availQty = {etcCnt: 0, zCnt: 0, oCnt: 0, tCnt: 0, thCnt: 0, fCnt: 0};
    stockPrice = {etcCnt: 0, zCnt: 0, oCnt: 0, tCnt: 0, thCnt: 0, fCnt: 0};
    billInfo: BillInfo = {totalCnt: 0, invoiceCnt: 0};
    recallItems$: Observable<RecallItem[]>;
    pagination: DashboardsPagination = {length: 0, size: 0, page: 0, lastPage: 0, startIndex: 0, endIndex: 0};
    isLoading: boolean = false;
    isMobile: boolean = false;
    billop: boolean = true;
    udiop: boolean = true;
    ibInfopCnt: any;
    obInfopCnt: any;
    buy: any;
    sal: any;
    buybool: boolean = false;
    salbool: boolean = true;
    udiLastMonth: boolean = false;
    udiThisMonth: boolean = true;
    racallTaleData: any = null;
    reacllItemsCount: number = 0;
    sumAvailQty: number = 0;
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
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
        this.supplyStatus$ = this._dashboardsService.supplyStatus$;
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
                data.filter(option => option.subCd === 'INVOICE').map((result: any) => {
                    this.billInfo.invoiceCnt = result.totalCnt;
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
                if (pagination !== null) {
                    this.pagination = pagination;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._dashboardsService.getRecallItem();

        this.inChart();
        this.outChart();

        //정산정보
        this.bill$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data: any) => {
                this.billInfos = data;
                this.billChart(this.billInfos);
            });
        this.buy = this.billInfos[this.billInfos.length - 2].totalAmt;
        this.sal = this.billInfos[this.billInfos.length - 1].totalAmt;
        // if(this.billInfos[this.billInfos.length - 2].totalAmt.length > 4) {
        //     this.buy = String(this.billInfos[this.billInfos.length - 2].totalAmt.toString().slice(0, -3));
        // } else {
        //     this.buy = this.billInfos[this.billInfos.length - 2].totalAmt;
        // }
        // if(this.billInfos[this.billInfos.length - 1].totalAmt.length > 4) {
        //     this.sal = String(this.billInfos[this.billInfos.length - 1].totalAmt.toString().slice(0, -3));
        // } else {
        //     this.sal = this.billInfos[this.billInfos.length - 1].totalAmt;
        // }

        //udi정보
        this.udiInfo$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data: any) => {
                data.filter(option => option.subCd === '1' && option.day === 'E').map((result: any) => {
                    this.udiEveRtn.oCnt = result.udiRtn;
                });
                data.filter(option => option.subCd === '2' && option.day === 'E').map((result: any) => {
                    this.udiEveRtn.tCnt = result.udiRtn;
                });
                data.filter(option => option.subCd === '3' && option.day === 'E').map((result: any) => {
                    this.udiEveRtn.thCnt = result.udiRtn;
                });
                data.filter(option => option.subCd === '4' && option.day === 'E').map((result: any) => {
                    this.udiEveRtn.fCnt = result.udiRtn;
                });
                data.filter(option => option.subCd === '1' && option.day === 'N').map((result: any) => {
                    this.udiNowRtn.oCnt = result.udiRtn;
                });
                data.filter(option => option.subCd === '2' && option.day === 'N').map((result: any) => {
                    this.udiNowRtn.tCnt = result.udiRtn;
                });
                data.filter(option => option.subCd === '3' && option.day === 'N').map((result: any) => {
                    this.udiNowRtn.thCnt = result.udiRtn;
                });
                data.filter(option => option.subCd === '4' && option.day === 'N').map((result: any) => {
                    this.udiNowRtn.fCnt = result.udiRtn;
                });
                this.eveRtn = Number(this.udiEveRtn.oCnt) + Number(this.udiEveRtn.tCnt) + Number(this.udiEveRtn.thCnt) + Number(this.udiEveRtn.fCnt);
                this.nowRtn = Number(this.udiNowRtn.oCnt) + Number(this.udiNowRtn.tCnt) + Number(this.udiNowRtn.thCnt) + Number(this.udiNowRtn.fCnt);
                data.filter(option => option.subCd === '1' && option.day === 'E').map((result: any) => {
                    this.udiErrE.oCnt = result.udiError;
                });
                data.filter(option => option.subCd === '2' && option.day === 'E').map((result: any) => {
                    this.udiErrE.tCnt = result.udiError;
                });
                data.filter(option => option.subCd === '3' && option.day === 'E').map((result: any) => {
                    this.udiErrE.thCnt = result.udiError;
                });
                data.filter(option => option.subCd === '4' && option.day === 'E').map((result: any) => {
                    this.udiErrE.fCnt = result.udiError;
                });
                data.filter(option => option.subCd === '1' && option.day === 'N').map((result: any) => {
                    this.udiErrN.oCnt = result.udiError;
                });
                data.filter(option => option.subCd === '2' && option.day === 'N').map((result: any) => {
                    this.udiErrN.tCnt = result.udiError;
                });
                data.filter(option => option.subCd === '3' && option.day === 'N').map((result: any) => {
                    this.udiErrN.thCnt = result.udiError;
                });
                data.filter(option => option.subCd === '4' && option.day === 'N').map((result: any) => {
                    this.udiErrN.fCnt = result.udiError;
                });
                this.errEveCnt = Number(this.udiErrE.oCnt) + Number(this.udiErrE.tCnt) + Number(this.udiErrE.thCnt) + Number(this.udiErrE.fCnt);
                this.errNowCnt = Number(this.udiErrN.oCnt) + Number(this.udiErrN.tCnt) + Number(this.udiErrN.thCnt) + Number(this.udiErrN.fCnt);
                data.filter(option => option.subCd === '1' && option.day === 'N').map((result: any) => {
                    this.nowCnt.oCnt = result.udiRpt;
                });
                data.filter(option => option.subCd === '2' && option.day === 'N').map((result: any) => {
                    this.nowCnt.tCnt = result.udiRpt;
                });
                data.filter(option => option.subCd === '3' && option.day === 'N').map((result: any) => {
                    this.nowCnt.thCnt = result.udiRpt;
                });
                data.filter(option => option.subCd === '4' && option.day === 'N').map((result: any) => {
                    this.nowCnt.fCnt = result.udiRpt;
                });
                data.filter(option => option.subCd === '1' && option.day === 'E').map((result: any) => {
                    this.eveCnt.oCnt = result.udiRpt;
                });
                data.filter(option => option.subCd === '2' && option.day === 'E').map((result: any) => {
                    this.eveCnt.tCnt = result.udiRpt;
                });
                data.filter(option => option.subCd === '3' && option.day === 'E').map((result: any) => {
                    this.eveCnt.thCnt = result.udiRpt;
                });
                data.filter(option => option.subCd === '4' && option.day === 'E').map((result: any) => {
                    this.eveCnt.fCnt = result.udiRpt;
                });
                this.eveRpt = Number(this.eveCnt.oCnt) + Number(this.eveCnt.tCnt) + Number(this.eveCnt.thCnt) + Number(this.eveCnt.fCnt);
                this.nowRpt = Number(this.nowCnt.oCnt) + Number(this.nowCnt.tCnt) + Number(this.nowCnt.thCnt) + Number(this.nowCnt.fCnt);
            });
        //재고정보
        this.stockInfo$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data: any) => {
                this.stockChart(data);
                data.filter(option => option.subCd === '-').map((result: any) => {
                    this.availQty.etcCnt = result.availQty;
                    this.stockPrice.etcCnt = result.buyPrice;
                });
                data.filter(option => option.subCd === '0').map((result: any) => {
                    this.availQty.zCnt = result.availQty;
                    this.stockPrice.zCnt = result.buyPrice;
                });
                data.filter(option => option.subCd === '1').map((result: any) => {
                    this.availQty.oCnt = result.availQty;
                    this.stockPrice.oCnt = result.buyPrice;
                });
                data.filter(option => option.subCd === '2').map((result: any) => {
                    this.availQty.tCnt = result.availQty;
                    this.stockPrice.tCnt = result.buyPrice;
                });
                data.filter(option => option.subCd === '3').map((result: any) => {
                    this.availQty.thCnt = result.availQty;
                    this.stockPrice.thCnt = result.buyPrice;
                });
                data.filter(option => option.subCd === '4').map((result: any) => {
                    this.availQty.fCnt = result.availQty;
                    this.stockPrice.fCnt = result.buyPrice;
                });
            });
        let availPrice;
        this.sumAvailQty = this.availQty.etcCnt + this.availQty.zCnt + this.availQty.oCnt + this.availQty.tCnt + this.availQty.thCnt + this.availQty.fCnt;
        availPrice = (this.stockPrice.etcCnt * this.availQty.etcCnt)
            + (this.stockPrice.zCnt * this.availQty.zCnt)
            + (this.stockPrice.oCnt * this.availQty.oCnt)
            + (this.stockPrice.tCnt * this.availQty.tCnt)
            + (this.stockPrice.thCnt * this.availQty.thCnt)
            + (this.stockPrice.fCnt * this.availQty.fCnt);
        if(availPrice.toString().length > 4) {
            this.availQtyPrice = String(availPrice.toString().slice(0, -3));
        } else {
            this.availQtyPrice = availPrice + '(원)';
        }


        const currDay = new Date();
        const year = currDay.getFullYear();
        const month = currDay.getMonth() + 1;
        const date = new Date(year, month, 0);
        const day = date.getDate();
        const lastDay = new Date(`${currDay.getFullYear()}-${month}-${day}`);

        const diffDays = Math.floor((lastDay.getTime() - currDay.getTime()) / (1000 * 60 * 60 * 24));

        if(month === 1) {
            this.udiMonth = 12;
        } else {
            this.udiMonth = month - 1;
        }
        // this.udiMonth

        if (diffDays === 0) {
            this.udiLastDay = 'D - day';
        } else {
            this.udiLastDay = 'D - ' + diffDays;
        }
        console.log(diffDays);

        this._changeDetectorRef.markForCheck();
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
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
        } else if (obj.gbn === 'UDI') {
            this._router.navigate(['/udi/manages']);
        } else if (obj.gbn === 'UDI_RTN') {
            this._router.navigate(['/bound/inbound']);
        } else if (obj.gbn === 'error_UDI') {
            this._router.navigate(['/udi/status']);
        }
    }

    inChart(): void {
        const ibInfoCnt = this.ibInfo.nCnt + this.ibInfo.pCnt + (this.ibInfo.pCnt + this.ibInfo.sCnt);
        const ibInfopsCnt = (this.ibInfo.pCnt + this.ibInfo.sCnt) / ibInfoCnt * 100;
        const undecided = this.ibInfo.pCnt + this.ibInfo.sCnt;
        const doughnutChartLabels = [
            '미확정',
            '확정',
        ];
        const doughnutChartData = {
            labels: doughnutChartLabels,
            datasets: [
                {
                    data: [undecided, this.ibInfo.scCnt],
                    backgroundColor: ['#DDDDDD', '#a2d5f4'],
                    hoverBackgroundColor: ['#DDDDDD', '#a2d5f4'],
                    borderWidth: 1,
                    hoverBorderWidth: 1,
                    hoverBorderColor: ['#DDDDDD', '#a2d5f4'],
                    hoverOffset: 1,
                }
            ],
        };
        const doughnutChartOption = {
            cutout: (ctx: Context) => {
                if (this.isMobile) {
                    return 35;
                } else {
                    return 35;
                }
            },
            plugins: {
                legend: {
                    display: false
                },
            },
        };

        const inbound = {
            id: 'inbound',
            // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
            afterDatasetsDraw(chart: Chart, args: EmptyObject, cancelable: false): void {
                const {ctx, chartArea: {top, right, bottom, left, width, height}} = chart;
                ctx.fillStyle = '#303236';
                ctx.font = '20px arial, "Malgun Gothic", AppleSDGothicNeo-Light, sans-serif';
                ctx.textAlign = 'center';
                if(isNaN(ibInfopsCnt)) {
                    ctx.fillText('0%', width / 2, top + (height / 1.9));
                } else {
                    ctx.fillText(Math.round(ibInfopsCnt) + '%', width / 2, top + (height / 1.9));
                }
            }
        };
        const inbound2 = {

            id: 'inbound2',
            // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
            afterDatasetsDraw(chart: Chart, args: EmptyObject, cancelable: false): void {
                const {ctx, chartArea: {top, right, bottom, left, width, height}} = chart;
                ctx.fillStyle = '#303236';
                ctx.font = '10px arial, "Malgun Gothic", AppleSDGothicNeo-Light, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('입고', width / 2, top + (height / 1.5));
            }
        };

        const ctx = document.getElementById('in_chart');
        // @ts-ignore
        const inChart = new Chart(ctx, {
            type: 'doughnut',
            data: doughnutChartData,
            options: doughnutChartOption,
            plugins: [inbound, inbound2],
        });
    }

    outChart(): void {
        const obInfoCnt = this.obInfo.nCnt + this.obInfo.pCnt + (this.obInfo.pCnt + this.obInfo.sCnt);
        const obInfopsCnt = (this.obInfo.pCnt + this.obInfo.sCnt) / obInfoCnt * 100;
        const undecided = this.obInfo.pCnt + this.obInfo.sCnt;
        const doughnutChartLabels = [
            '미확정',
            '확정',
        ];
        const doughnutChartData = {
            labels: doughnutChartLabels,
            datasets: [
                {
                    data: [undecided, this.ibInfo.scCnt],
                    backgroundColor: ['#DDDDDD', '#EFC519'],
                    hoverBackgroundColor: ['#DDDDDD', '#EFC519'],
                    borderWidth: 1,
                    hoverBorderWidth: 1,
                    hoverBorderColor: ['#DDDDDD', '#EFC519'],
                    hoverOffset: 1,
                }
            ],
        };
        const doughnutChartOption = {
            cutout: (ctx: Context) => {
                if (this.isMobile) {
                    return 35;
                } else {
                    return 35;
                }
            },
            plugins: {
                legend: {
                    display: false
                },
            }
        };

        const outbound = {
            id: 'outbound',
            // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
            afterDatasetsDraw(chart: Chart, args: EmptyObject, cancelable: false): void {
                const {ctx, chartArea: {top, right, bottom, left, width, height}} = chart;
                ctx.fillStyle = '#303236';
                ctx.font = '20px arial, "Malgun Gothic", AppleSDGothicNeo-Light, sans-serif';
                ctx.textAlign = 'center';
                if(isNaN(obInfopsCnt)) {
                    ctx.fillText('0%', width / 2, top + (height / 1.9));
                } else {
                    ctx.fillText(Math.round(obInfopsCnt) + '%', width / 2, top + (height / 1.9));
                }
            }
        };
        const outbound2 = {

            id: 'outbound2',
            // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
            afterDatasetsDraw(chart: Chart, args: EmptyObject, cancelable: false): void {
                const {ctx, chartArea: {top, right, bottom, left, width, height}} = chart;
                ctx.fillStyle = '#303236';
                ctx.font = '10px arial, "Malgun Gothic", AppleSDGothicNeo-Light, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('출고', width / 2, top + (height / 1.5));
            }
        };


        const ctx = document.getElementById('out_chart');
        // @ts-ignore
        const outChart = new Chart(ctx, {
            type: 'doughnut',
            data: doughnutChartData,
            options: doughnutChartOption,
            plugins: [outbound, outbound2],
        });
    }

    billChart(billInfos: any): void {

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
        // const bill = {
        //     id: 'bill',
        //     // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
        //     afterDatasetsDraw(chart: Chart, args: EmptyObject, cancelable: false): void {
        //         const {ctx, chartArea: {top, right, bottom, left, width, height}} = chart;
        //         ctx.fillStyle = '#303236';
        //         ctx.font = '10px arial, "Malgun Gothic", AppleSDGothicNeo-Light, sans-serif';
        //         ctx.textAlign = 'right';
        //         ctx.fillText('단위 (천원)', width / 0.87, top + (height / 7));
        //     }
        // };

        const ctx = document.getElementById('bill_chart');
        // @ts-ignore
        const mixedChart = new Chart(ctx, {
            data: {
                datasets: [{
                    type: 'line',
                    label: '매입',
                    data: buyPrice,
                    fill: false,
                    hidden: true,
                    borderColor: '#3983DC',
                    pointBackgroundColor: '#3983DC',
                    hoverBackgroundColor: '#3983DC',
                    backgroundColor: '#3983DC',
                    hoverBorderColor: '#3983DC',
                    pointBorderColor: '#3983DC',
                    pointHoverBackgroundColor: '#3983DC',
                    pointHoverBorderColor: '#3983DC',
                    borderWidth: 3,
                    pointBorderWidth: 3,
                    hoverBorderWidth: 3,
                }, {
                    type: 'line',
                    label: '매출',
                    data: salesPrice,
                    fill: false,
                    borderColor: '#00A5FF',
                    pointBackgroundColor: '#00A5FF',
                    hoverBackgroundColor: '#00A5FF',
                    backgroundColor: '#00A5FF',
                    hoverBorderColor: '#00A5FF',
                    pointBorderColor: '#00A5FF',
                    pointHoverBackgroundColor: '#00A5FF',
                    pointHoverBorderColor: '#00A5FF',
                    borderWidth: 3,
                    pointBorderWidth: 3,
                    hoverBorderWidth: 3,
                }],
                labels: date
            },
            options: {
                // responsive: false,
                plugins: {
                    tooltip: {
                        xAlign: 'right',
                        yAlign: 'top',
                        callbacks: {
                            label: (ctx: Context) => {
                                const name = ctx.dataset.label;
                                return name + ' ' + this.priceToString(ctx.chart.tooltip.dataPoints[0].raw) + '원';
                            }
                        }
                    },
                    legend: {
                        display: false,
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            font: {
                                size: 10,
                                weight: 'bold'
                            },
                            color: '#9CA0A9'
                        }
                    },
                    y: {
                        ticks: {
                            callback: (value, index, ticks) => {
                                if(value.toString().length > 4) {
                                    return this.priceToString(value.toString().slice(0, -3));
                                } else {
                                    return this.priceToString(value);
                                }
                            },
                            font: {
                                size: 10,
                                weight: 'bold'
                            },
                            color: '#9CA0A9'
                        }
                    }
                }
            },
            plugins: []
        });
        document.getElementById('billbuy').addEventListener('click', () => {
            if (this.buybool) {
                // false 라서 처음에 보인다
                mixedChart.show(0);
            } else {
                mixedChart.hide(0);
            }
        });
        document.getElementById('billbuy').addEventListener('click', () => {
            if (!this.salbool) {
                // truedlek
                mixedChart.hide(1);
            } else {
                mixedChart.show(1);
            }
        });
    }

    priceToString(price): number {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    biiOption(): void {
        if (this.billop) {
            this.billop = false;
        } else {
            this.billop = true;
        }
        this._changeDetectorRef.markForCheck();
    }

    udiOption(): void {
        if (this.udiop) {
            this.udiop = false;
        } else {
            this.udiop = true;
        }
        this._changeDetectorRef.markForCheck();
    }

    billBuy(): void {
        this.buybool = true;
        if (this.buybool) {
            this.buybool = true;
            this.salbool = false;
        } else {
            this.buybool = false;
            this.salbool = true;
        }
    }

    billSal(): void {
        this.salbool = true;
        if (this.salbool) {
            this.buybool = false;
            this.salbool = true;
        } else {
            this.buybool = true;
            this.salbool = false;
        }
    }

    // billbuy(): void {
    //     if (!this.buybool) {
    //         this.buybool = true;
    //     } else {
    //         this.buybool = false;
    //     }
    //     if (!this.salbool) {
    //         this.salbool = true;
    //     } else {
    //         this.salbool = false;
    //     }
    // }

    // udiLast(): void {
    //     if (!this.udiLastMonth) {
    //         this.udiLastMonth = true;
    //     } else {
    //         this.udiLastMonth = false;
    //     }
    //     if (!this.udiThisMonth) {
    //         this.udiThisMonth = true;
    //     } else {
    //         this.udiThisMonth = false;
    //     }
    // }

    udiLast(): void {
        this.udiLastMonth = true;
        if (this.udiLastMonth) {
            this.udiLastMonth = true;
            this.udiThisMonth = false;
        } else {
            this.udiLastMonth = false;
            this.udiThisMonth = true;
        }
    }

    udiThis(): void {
        this.udiThisMonth = true;
        if (this.udiThisMonth) {
            this.udiThisMonth = true;
            this.udiLastMonth = false;
        } else {
            this.udiThisMonth = false;
            this.udiLastMonth = true;
        }
    }

    stockChart(data: any): void {
        const unusedQty = {etcCnt: 0, zCnt: 0, oCnt: 0, tCnt: 0, thCnt: 0, fCnt: 0};
        const acceptableQty = {etcCnt: 0, zCnt: 0, oCnt: 0, tCnt: 0, thCnt: 0, fCnt: 0};
        const availQty = {etcCnt: 0, zCnt: 0, oCnt: 0, tCnt: 0, thCnt: 0, fCnt: 0};
        const price = {etcCnt: 0, zCnt: 0, oCnt: 0, tCnt: 0, thCnt: 0, fCnt: 0};

        data.filter(option => option.subCd === '-').map((result: any) => {
            unusedQty.etcCnt = result.unusedQty;
            acceptableQty.etcCnt = result.acceptableQty;
            availQty.etcCnt = result.availQty;
            price.etcCnt = result.buyPrice;
        });
        data.filter(option => option.subCd === '0').map((result: any) => {
            unusedQty.zCnt = result.unusedQty;
            acceptableQty.zCnt = result.acceptableQty;
            availQty.zCnt = result.availQty;
            price.zCnt = result.buyPrice;
        });
        data.filter(option => option.subCd === '1').map((result: any) => {
            unusedQty.oCnt = result.unusedQty;
            acceptableQty.oCnt = result.acceptableQty;
            availQty.oCnt = result.availQty;
            price.oCnt = result.buyPrice;
        });
        data.filter(option => option.subCd === '2').map((result: any) => {
            unusedQty.tCnt = result.unusedQty;
            acceptableQty.tCnt = result.acceptableQty;
            availQty.tCnt = result.availQty;
            price.tCnt = result.buyPrice;
        });
        data.filter(option => option.subCd === '3').map((result: any) => {
            unusedQty.thCnt = result.unusedQty;
            acceptableQty.thCnt = result.acceptableQty;
            availQty.thCnt = result.availQty;
            price.thCnt = result.buyPrice;
        });
        data.filter(option => option.subCd === '4').map((result: any) => {
            unusedQty.fCnt = result.unusedQty;
            acceptableQty.fCnt = result.acceptableQty;
            availQty.fCnt = result.availQty;
            price.fCnt = result.buyPrice;
        });
        let acceptableTotalPrice;
        let unusedQtyTotalPrice;
        let availQtyTotalPrice;
        let totalPrice;
        this.acceptableTotal = acceptableQty.oCnt + acceptableQty.tCnt + acceptableQty.thCnt + acceptableQty.fCnt + acceptableQty.zCnt + acceptableQty.etcCnt;
        acceptableTotalPrice = (price.etcCnt * acceptableQty.etcCnt)
            + (price.zCnt * acceptableQty.zCnt)
            + (price.oCnt * acceptableQty.oCnt)
            + (price.tCnt * acceptableQty.tCnt)
            + (price.thCnt * acceptableQty.thCnt)
            + (price.fCnt * acceptableQty.fCnt);
        if(acceptableTotalPrice.toString().length > 4) {
            this.acceptableTotalPrice = String(acceptableTotalPrice.toString().slice(0, -3));
        } else {
            this.acceptableTotalPrice = acceptableTotalPrice;
        }
        this.unusedQtyTotal = unusedQty.oCnt + unusedQty.tCnt + unusedQty.thCnt + unusedQty.fCnt + unusedQty.zCnt + unusedQty.etcCnt;
        unusedQtyTotalPrice = (price.etcCnt * unusedQty.etcCnt)
            + (price.zCnt * unusedQty.zCnt)
            + (price.oCnt * unusedQty.oCnt)
            + (price.tCnt * unusedQty.tCnt)
            + (price.thCnt * unusedQty.thCnt)
            + (price.fCnt * unusedQty.fCnt);
        if(unusedQtyTotalPrice.toString().length > 4) {
            this.unusedQtyTotalPrice = String(unusedQtyTotalPrice.toString().slice(0, -3));
        } else {
            this.unusedQtyTotalPrice = unusedQtyTotalPrice;
        }
        availQtyTotalPrice = (price.etcCnt * availQty.etcCnt)
            + (price.zCnt * availQty.zCnt)
            + (price.oCnt * availQty.oCnt)
            + (price.tCnt * availQty.tCnt)
            + (price.thCnt * availQty.thCnt)
            + (price.fCnt * availQty.fCnt);
        totalPrice = acceptableTotalPrice + unusedQtyTotalPrice + availQtyTotalPrice;
        if(totalPrice.toString().length > 4) {
            this.stockTotalPrice = String(totalPrice.toString().slice(0, -3));
        } else {
            this.stockTotalPrice = totalPrice;
        }
        const ctx = document.getElementById('stock_chart');

        // @ts-ignore
        const mixedChart = new Chart(ctx, {
                data: {
                    datasets: [{
                        type: 'bar',
                        axis: 'y',
                        label: '0등급',
                        data: [unusedQty.zCnt, acceptableQty.zCnt, availQty.zCnt],
                        fill: false,
                        borderColor: '#B9FFFF',
                        pointBackgroundColor: '#B9FFFF',
                        hoverBackgroundColor: '#B9FFFF',
                        backgroundColor: '#B9FFFF',
                        hoverBorderColor: '#B9FFFF',
                        pointBorderColor: '#B9FFFF',
                        pointHoverBackgroundColor: '#B9FFFF',
                        pointHoverBorderColor: '#B9FFFF',
                        borderWidth: 1,
                        pointBorderWidth: 0.1,
                        hoverBorderWidth: 0.1,
                    }, {
                        type: 'bar',
                        axis: 'y',
                        label: '1등급',
                        data: [unusedQty.oCnt, acceptableQty.oCnt, availQty.oCnt],
                        fill: false,
                        borderColor: '#1EDDFF',
                        pointBackgroundColor: '#1EDDFF',
                        hoverBackgroundColor: '#1EDDFF',
                        backgroundColor: '#1EDDFF',
                        hoverBorderColor: '#1EDDFF',
                        pointBorderColor: '#1EDDFF',
                        pointHoverBackgroundColor: '#1EDDFF',
                        pointHoverBorderColor: '#1EDDFF',
                        borderWidth: 1,
                        pointBorderWidth: 0.1,
                        hoverBorderWidth: 0.1,
                    }, {
                        type: 'bar',
                        axis: 'y',
                        label: '2등급',
                        data: [unusedQty.tCnt, acceptableQty.tCnt, availQty.tCnt],
                        fill: false,
                        borderColor: '#00A5FF',
                        pointBackgroundColor: '#00A5FF',
                        hoverBackgroundColor: '#00A5FF',
                        backgroundColor: '#00A5FF',
                        hoverBorderColor: '#00A5FF',
                        pointBorderColor: '#00A5FF',
                        pointHoverBackgroundColor: '#00A5FF',
                        pointHoverBorderColor: '#00A5FF',
                        borderWidth: 1,
                        pointBorderWidth: 0.1,
                        hoverBorderWidth: 0.1,
                    }, {
                        type: 'bar',
                        axis: 'y',
                        label: '3등급',
                        data: [unusedQty.thCnt, acceptableQty.thCnt, availQty.thCnt],
                        fill: false,
                        borderColor: '#0064FF',
                        pointBackgroundColor: '#0064FF',
                        hoverBackgroundColor: '#0064FF',
                        backgroundColor: '#0064FF',
                        hoverBorderColor: '#0064FF',
                        pointBorderColor: '#0064FF',
                        pointHoverBackgroundColor: '#0064FF',
                        pointHoverBorderColor: '#0064FF',
                        borderWidth: 1,
                        pointBorderWidth: 0.1,
                        hoverBorderWidth: 0.1,
                    }, {
                        type: 'bar',
                        axis: 'y',
                        label: '4등급',
                        data: [unusedQty.fCnt, acceptableQty.fCnt, availQty.fCnt],
                        fill: false,
                        borderColor: '#027dc4',
                        pointBackgroundColor: '#027dc4',
                        hoverBackgroundColor: '#027dc4',
                        backgroundColor: '#027dc4',
                        hoverBorderColor: '#027dc4',
                        pointBorderColor: '#027dc4',
                        pointHoverBackgroundColor: '#027dc4',
                        pointHoverBorderColor: '#027dc4',
                        borderWidth: 0.1,
                        pointBorderWidth: 0.1,
                        hoverBorderWidth: 0.1,
                    }, {
                        type: 'bar',
                        axis: 'y',
                        label: '기타등급',
                        data: [unusedQty.etcCnt, acceptableQty.etcCnt, availQty.etcCnt],
                        fill: false,
                        borderColor: '#0000FF',
                        pointBackgroundColor: '#0000FF',
                        hoverBackgroundColor: '#0000FF',
                        backgroundColor: '#0000FF',
                        hoverBorderColor: '#0000FF',
                        pointBorderColor: '#0000FF',
                        pointHoverBackgroundColor: '#0000FF',
                        pointHoverBorderColor: '#0000FF',
                        borderWidth: 0.1,
                        pointBorderWidth: 0.1,
                        hoverBorderWidth: 0.1,
                    }],
                    labels: ['불용', '가납', '보유'],
                },
                options: {
                    maxBarThickness: 30,
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                boxWidth: 8,
                                font: {weight: 'bold', size: 11},
                                color: '#8F95A0'
                            },
                        },
                    },
                    indexAxis: 'y',
                    scales: {
                        x: {
                            display: false,
                            stacked: true,
                        },
                        y: {
                            stacked: true,
                            ticks: {
                                font: {
                                    size: 10,
                                    weight: 'bold'
                                },
                                color: '#000000'
                            }
                        }
                    }
                }
        });
    }

}

