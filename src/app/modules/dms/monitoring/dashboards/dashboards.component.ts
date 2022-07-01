import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
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
import {DashboardsColorChangeService} from '../../../../../@teamplat/components/dashboards-color-change/dashboards-color-change.service';
import {FunctionService} from "../../../../../@teamplat/services/function";

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
    availQtyTotalPrice: any;
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
    stockData: boolean;
    racallTaleData: any = null;
    reacllItemsCount: number = 0;
    sumAvailQty: number = 0;
    mixedChart: any;
    inBoundChart: any;
    ouBoundChart: any;
    billsChart: any;
    change: any;
    style = 'background-color: #9186D0!important; color: #FFFFFF;';
    styleTable = 'background-color: #f1dcff!important;';
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _dashboardsService: DashboardsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _dashBoardColorChangeService: DashboardsColorChangeService,
        private _sessionStore: SessionStore,
        private _codeStore: CodeStore,
        private _functionService: FunctionService,
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

        //this._dashboardsService.getRecallItem();

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

        const currDay = new Date();
        const year = currDay.getFullYear();
        const month = currDay.getMonth() + 1;
        const date = new Date(year, month, 0);
        const day = date.getDate();
        const lastDay = new Date(`${currDay.getFullYear()}-${month}-${day}`);
        // const diffDays = Math.floor((lastDay.getTime() - currDay.getTime()) / (1000 * 60 * 60 * 24));
        const diffDays = lastDay.getDate().valueOf() - currDay.getDate().valueOf();
        if (month === 1) {
            this.udiMonth = 12;
        } else {
            this.udiMonth = month - 1;
        }

        if (diffDays === 0) {
            this.udiLastDay = 'D - day';
        } else {
            this.udiLastDay = 'D - ' + diffDays;
        }
        this._dashBoardColorChangeService.dateCreated$.subscribe((val) => {
            this.colorChange(val);
        });
        if (localStorage.getItem('dashboardColor') !== null) {
            this.colorChange(localStorage.getItem('dashboardColor'));
        }
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

    // dashBordColorChange(): void {
    //     if (this.dashBoardsColor) {
    //         this.dashBoardsColor = false;
    //     } else {
    //         this.dashBoardsColor = true;
    //     }
    //     this._changeDetectorRef.markForCheck();
    // }


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
            this._router.navigate(['/bound/inbound', {type: obj.status}]);
        } else if (obj.gbn === 'error_UDI') {
            this._router.navigate(['/udi/status']);
        } else if (obj.gbn === 'STOCK') {
            this._router.navigate(['/stock/stock', {itemGrade: obj.status}]);
        }
    }

    inChart(): void {
        let color;
        const ibInfoCnt = this.ibInfo.nCnt + this.ibInfo.pCnt + this.ibInfo.pcCnt + this.ibInfo.sCnt + this.ibInfo.scCnt;
        const ibInfopsCnt = (this.ibInfo.pcCnt + this.ibInfo.scCnt) / ibInfoCnt * 100;
        const undecided = this.ibInfo.pCnt + this.ibInfo.sCnt + this.ibInfo.nCnt;
        let zeroInBound;
        const doughnutChartLabels = [
            '미확정',
            '확정',
        ];
        if (undecided === 0 && this.ibInfo.scCnt === 0) {
            zeroInBound = 0.1;
        } else {
            zeroInBound = undecided;
        }
        const doughnutChartData = {
            labels: doughnutChartLabels,
            datasets: [
                {
                    data: [zeroInBound, this.ibInfo.scCnt],
                    backgroundColor: ['#DDDDDD', '#9186D0'],
                    hoverBackgroundColor: ['#DDDDDD', '#9186D0'],
                    borderWidth: 1,
                    hoverBorderWidth: 1,
                    hoverBorderColor: ['#DDDDDD', '#9186D0'],
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
            onClick: (ctx: Context, event) => {
                if (event[0].index === 1) {
                    this.goPage({gbn: 'IB', status: 'SC'});
                } else if (event[0].index === 0) {
                    this.goPage({gbn: 'IB', status: 'N,P,S'});
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
                if (isNaN(ibInfopsCnt)) {
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
        this.inBoundChart = new Chart(ctx, {
            type: 'doughnut',
            data: doughnutChartData,
            options: doughnutChartOption,
            plugins: [inbound, inbound2],
        });
    }

    outChart(): void {
        let color;
        const obInfoCnt = this.obInfo.nCnt + this.obInfo.pCnt + this.obInfo.pcCnt + this.obInfo.sCnt + this.obInfo.scCnt;
        const obInfopsCnt = (this.obInfo.pcCnt + this.obInfo.scCnt) / obInfoCnt * 100;
        const undecided = this.obInfo.pCnt + this.obInfo.sCnt + this.obInfo.nCnt;
        let zeroOutBound;
        const doughnutChartLabels = [
            '미확정',
            '확정',
        ];
        if (undecided === 0 && this.obInfo.scCnt === 0) {
            zeroOutBound = 0.1;
        } else {
            zeroOutBound = undecided;
        }
        const doughnutChartData = {
            labels: doughnutChartLabels,
            datasets: [
                {
                    data: [zeroOutBound, this.obInfo.scCnt],
                    backgroundColor: ['#DDDDDD', '#C8B7F9'],
                    hoverBackgroundColor: ['#DDDDDD', '#C8B7F9'],
                    borderWidth: 1,
                    hoverBorderWidth: 1,
                    hoverBorderColor: ['#DDDDDD', '#C8B7F9'],
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
            onClick: (ctx: Context, event) => {
                if (event[0].index === 1) {
                    this.goPage({gbn: 'OB', status: 'SC'});
                } else if (event[0].index === 0) {
                    this.goPage({gbn: 'OB', status: 'N,P,S'});
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
                if (isNaN(obInfopsCnt)) {
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
        this.ouBoundChart = new Chart(ctx, {
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

        const ctx = document.getElementById('bill_chart');
        // @ts-ignore
        this.billsChart = new Chart(ctx, {
            data: {
                datasets: [{
                    type: 'line',
                    label: '매입',
                    data: buyPrice,
                    fill: false,
                    hidden: true,
                    borderColor: '#C8B7F9',
                    pointBackgroundColor: '#C8B7F9',
                    hoverBackgroundColor: '#C8B7F9',
                    backgroundColor: '#C8B7F9',
                    hoverBorderColor: '#C8B7F9',
                    pointBorderColor: '#C8B7F9',
                    pointHoverBackgroundColor: '#C8B7F9',
                    pointHoverBorderColor: '#C8B7F9',
                    borderWidth: 3,
                    pointBorderWidth: 3,
                    hoverBorderWidth: 3,
                }, {
                    type: 'line',
                    label: '매출',
                    data: salesPrice,
                    fill: false,
                    borderColor: '#9186D0',
                    pointBackgroundColor: '#9186D0',
                    hoverBackgroundColor: '#9186D0',
                    backgroundColor: '#9186D0',
                    hoverBorderColor: '#9186D0',
                    pointBorderColor: '#9186D0',
                    pointHoverBackgroundColor: '#9186D0',
                    pointHoverBorderColor: '#9186D0',
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
                                if (value.toString().length > 4) {
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
                this.billsChart.show(0);
            } else {
                this.billsChart.hide(0);
            }
        });
        document.getElementById('billbuy').addEventListener('click', () => {
            if (!this.salbool) {
                // truedlek
                this.billsChart.hide(1);
            } else {
                this.billsChart.show(1);
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
        const aBuyPrice = {etcCnt: 0, zCnt: 0, oCnt: 0, tCnt: 0, thCnt: 0, fCnt: 0};
        const uBuyPrice = {etcCnt: 0, zCnt: 0, oCnt: 0, tCnt: 0, thCnt: 0, fCnt: 0};
        const iBuyPrice = {etcCnt: 0, zCnt: 0, oCnt: 0, tCnt: 0, thCnt: 0, fCnt: 0};

        data.filter(option => option.subCd === '-').map((result: any) => {
            unusedQty.etcCnt = result.unusedQty;
            acceptableQty.etcCnt = result.acceptableQty;
            availQty.etcCnt = result.availQty;
            aBuyPrice.etcCnt = result.aBuyPrice;
            uBuyPrice.etcCnt = result.uBuyPrice;
            iBuyPrice.etcCnt = result.iBuyPrice;
        });
        data.filter(option => option.subCd === '0').map((result: any) => {
            unusedQty.zCnt = result.unusedQty;
            acceptableQty.zCnt = result.acceptableQty;
            availQty.zCnt = result.availQty;
            aBuyPrice.zCnt = result.aBuyPrice;
            uBuyPrice.etcCnt = result.uBuyPrice;
            iBuyPrice.etcCnt = result.iBuyPrice;
        });
        data.filter(option => option.subCd === '1').map((result: any) => {
            unusedQty.oCnt = result.unusedQty;
            acceptableQty.oCnt = result.acceptableQty;
            availQty.oCnt = result.availQty;
            aBuyPrice.oCnt = result.aBuyPrice;
            uBuyPrice.oCnt = result.uBuyPrice;
            iBuyPrice.oCnt = result.iBuyPrice;
        });
        data.filter(option => option.subCd === '2').map((result: any) => {
            unusedQty.tCnt = result.unusedQty;
            acceptableQty.tCnt = result.acceptableQty;
            availQty.tCnt = result.availQty;
            aBuyPrice.tCnt = result.aBuyPrice;
            uBuyPrice.tCnt = result.uBuyPrice;
            iBuyPrice.tCnt = result.iBuyPrice;
        });
        data.filter(option => option.subCd === '3').map((result: any) => {
            unusedQty.thCnt = result.unusedQty;
            acceptableQty.thCnt = result.acceptableQty;
            availQty.thCnt = result.availQty;
            aBuyPrice.thCnt = result.aBuyPrice;
            uBuyPrice.thCnt = result.uBuyPrice;
            iBuyPrice.thCnt = result.iBuyPrice;
        });
        data.filter(option => option.subCd === '4').map((result: any) => {
            unusedQty.fCnt = result.unusedQty;
            acceptableQty.fCnt = result.acceptableQty;
            availQty.fCnt = result.availQty;
            aBuyPrice.fCnt = result.aBuyPrice;
            uBuyPrice.fCnt = result.uBuyPrice;
            iBuyPrice.fCnt = result.iBuyPrice;
        });
        let acceptableTotalPrice;
        let unusedQtyTotalPrice;
        let availQtyTotalPrice;
        let totalPrice;
        this.acceptableTotal = acceptableQty.oCnt + acceptableQty.tCnt + acceptableQty.thCnt + acceptableQty.fCnt + acceptableQty.zCnt + acceptableQty.etcCnt;
        acceptableTotalPrice = aBuyPrice.etcCnt + aBuyPrice.zCnt + aBuyPrice.oCnt + aBuyPrice.tCnt + aBuyPrice.thCnt + aBuyPrice.fCnt;
        if (acceptableTotalPrice.toString().length > 4) {
            this.acceptableTotalPrice = String(acceptableTotalPrice.toString().slice(0, -3));
        } else {
            this.acceptableTotalPrice = acceptableTotalPrice;
        }
        this.unusedQtyTotal = unusedQty.oCnt + unusedQty.tCnt + unusedQty.thCnt + unusedQty.fCnt + unusedQty.zCnt + unusedQty.etcCnt;
        unusedQtyTotalPrice = uBuyPrice.etcCnt + uBuyPrice.zCnt + uBuyPrice.oCnt + uBuyPrice.tCnt + uBuyPrice.thCnt + uBuyPrice.fCnt;
        if (unusedQtyTotalPrice.toString().length > 4) {
            this.unusedQtyTotalPrice = String(unusedQtyTotalPrice.toString().slice(0, -3));
        } else {
            this.unusedQtyTotalPrice = unusedQtyTotalPrice;
        }
        this.sumAvailQty = availQty.etcCnt + availQty.zCnt + availQty.oCnt + availQty.tCnt + availQty.thCnt + availQty.fCnt;
        availQtyTotalPrice = iBuyPrice.etcCnt + iBuyPrice.zCnt + iBuyPrice.oCnt + iBuyPrice.tCnt + iBuyPrice.thCnt + iBuyPrice.fCnt;
        if (availQtyTotalPrice.toString().length > 4) {
            this.availQtyTotalPrice = String(availQtyTotalPrice.toString().slice(0, -3));
        } else {
            this.availQtyTotalPrice = availQtyTotalPrice;
        }
        totalPrice = acceptableTotalPrice + unusedQtyTotalPrice + availQtyTotalPrice;
        if (totalPrice.toString().length > 4) {
            this.stockTotalPrice = String(totalPrice.toString().slice(0, -3));
        } else {
            this.stockTotalPrice = totalPrice;
        }
        const ctx = document.getElementById('stock_chart');
        if (!this.mixedChart) {
            // @ts-ignore
            this.mixedChart = new Chart(ctx, {
                data: {
                    datasets: [{
                        type: 'bar',
                        axis: 'y',
                        label: '0등급',
                        data: [unusedQty.zCnt, acceptableQty.zCnt, availQty.zCnt],
                        fill: false,
                        borderColor: '#f1dcff',
                        hoverBackgroundColor: '#f1dcff',
                        backgroundColor: '#f1dcff',
                        hoverBorderColor: '#f1dcff',
                        borderWidth: 1,
                        hoverBorderWidth: 0.1,
                    }, {
                        type: 'bar',
                        axis: 'y',
                        label: '1등급',
                        data: [unusedQty.oCnt, acceptableQty.oCnt, availQty.oCnt],
                        fill: false,
                        borderColor: '#e2b9ff',
                        hoverBackgroundColor: '#e2b9ff',
                        backgroundColor: '#e2b9ff',
                        hoverBorderColor: '#e2b9ff',
                        borderWidth: 1,
                        hoverBorderWidth: 0.1,
                    }, {
                        type: 'bar',
                        axis: 'y',
                        label: '2등급',
                        data: [unusedQty.tCnt, acceptableQty.tCnt, availQty.tCnt],
                        fill: false,
                        borderColor: '#d195ff',
                        hoverBackgroundColor: '#d195ff',
                        backgroundColor: '#d195ff',
                        hoverBorderColor: '#d195ff',
                        borderWidth: 1,
                        hoverBorderWidth: 0.1,
                    }, {
                        type: 'bar',
                        axis: 'y',
                        label: '3등급',
                        data: [unusedQty.thCnt, acceptableQty.thCnt, availQty.thCnt],
                        fill: false,
                        borderColor: '#bd71ff',
                        hoverBackgroundColor: '#bd71ff',
                        backgroundColor: '#bd71ff',
                        hoverBorderColor: '#bd71ff',
                        borderWidth: 1,
                        hoverBorderWidth: 0.1,
                    }, {
                        type: 'bar',
                        axis: 'y',
                        label: '4등급',
                        data: [unusedQty.fCnt, acceptableQty.fCnt, availQty.fCnt],
                        fill: false,
                        borderColor: '#a648ff',
                        hoverBackgroundColor: '#a648ff',
                        backgroundColor: '#a648ff',
                        hoverBorderColor: '#a648ff',
                        borderWidth: 0.1,
                        hoverBorderWidth: 0.1,
                    }, {
                        type: 'bar',
                        axis: 'y',
                        label: '기타등급',
                        data: [unusedQty.etcCnt, acceptableQty.etcCnt, availQty.etcCnt],
                        fill: false,
                        borderColor: '#8b00ff',
                        hoverBackgroundColor: '#8b00ff',
                        backgroundColor: '#8b00ff',
                        hoverBorderColor: '#8b00ff',
                        borderWidth: 0.1,
                        hoverBorderWidth: 0.1,
                    }],
                    labels: ['불용', '가납', '보유'],
                },
                options: {
                    // responsive: false,
                    maxBarThickness: 25,
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
                                    size: 12,
                                    weight: 'bold'
                                },
                                color: '#8F95A0'
                            }
                        }
                    }
                },
            });
            this.stockData = true;
        } else {
            let unusedQtyAnalyze = [unusedQty.zCnt, unusedQty.oCnt, unusedQty.tCnt, unusedQty.thCnt, unusedQty.fCnt, unusedQty.etcCnt];
            let acceptableQtyAnalyze = [acceptableQty.zCnt, acceptableQty.oCnt, acceptableQty.tCnt, acceptableQty.thCnt, acceptableQty.fCnt, acceptableQty.etcCnt];
            let availQtyAnalyze = [availQty.zCnt, availQty.oCnt, availQty.tCnt, availQty.thCnt, availQty.fCnt, availQty.etcCnt];
            for (let i = 0; i < this.mixedChart.data.datasets.length; i++) {
                this.mixedChart.data.datasets[i].data[0] = unusedQtyAnalyze[i];
                this.mixedChart.data.datasets[i].data[1] = acceptableQtyAnalyze[i];
                this.mixedChart.data.datasets[i].data[2] = availQtyAnalyze[i];
            }
            this.mixedChart.update();
            this.stockData = false;
        }

    }

    colorChange(color: any): void {

        if (color === 'main') {
            let colors = [];
            let colors2 = [];
            for (let i = 0; i < this.mixedChart.data.datasets.length; i++) {
                colors = ['#f1dcff', '#e2b9ff', '#d195ff', '#bd71ff', '#a648ff', '#8b00ff'];
                this.mixedChart.data.datasets[i].borderColor = colors[i];
                this.mixedChart.data.datasets[i].hoverBackgroundColor = colors[i];
                this.mixedChart.data.datasets[i].backgroundColor = colors[i];
                this.mixedChart.data.datasets[i].hoverBorderColor = colors[i];
            }
            for (let i = 0; i < this.billsChart.data.datasets.length; i++) {
                colors2 = ['#C8B7F9', '#9186D0'];
                this.billsChart.data.datasets[i].borderColor = colors2[i];
                this.billsChart.data.datasets[i].pointBackgroundColor = colors2[i];
                this.billsChart.data.datasets[i].hoverBackgroundColor = colors2[i];
                this.billsChart.data.datasets[i].backgroundColor = colors2[i];
                this.billsChart.data.datasets[i].hoverBorderColor = colors2[i];
                this.billsChart.data.datasets[i].pointBorderColor = colors2[i];
                this.billsChart.data.datasets[i].pointHoverBackgroundColor = colors2[i];
                this.billsChart.data.datasets[i].pointHoverBorderColor = colors2[i];
            }
            this.inBoundChart.data.datasets[0].backgroundColor[1] = '#9186D0';
            this.inBoundChart.data.datasets[0].hoverBorderColor[1] = '#9186D0';
            this.inBoundChart.data.datasets[0].hoverBackgroundColor[1] = '#9186D0';
            this.ouBoundChart.data.datasets[0].backgroundColor[1] = '#C8B7F9';
            this.ouBoundChart.data.datasets[0].hoverBorderColor[1] = '#C8B7F9';
            this.ouBoundChart.data.datasets[0].hoverBackgroundColor[1] = '#C8B7F9';
            this.style = 'background-color: #9186D0!important; color: #FFFFFF;';
            this.styleTable = 'background-color: #f1dcff!important;';
            this.billsChart.update();
            this.ouBoundChart.update();
            this.inBoundChart.update();
            this.mixedChart.update();
        } else {
            let as;
            let colors = [];
            if (color.includes(',')) {
                as = color.split(',');
            } else {
                return color;
            }
            for (let i = 0; i < this.mixedChart.data.datasets.length; i++) {
                colors.push('rgb(' + (Number(as[0]) + (i * 30) + ', ' + (Number(as[1]) + (i * 30)) + ', ' + (Number(as[2]) + (i * 30)) + ')'));
                this.mixedChart.data.datasets[i].borderColor = colors[i];
                this.mixedChart.data.datasets[i].hoverBackgroundColor = colors[i];
                this.mixedChart.data.datasets[i].backgroundColor = colors[i];
                this.mixedChart.data.datasets[i].hoverBorderColor = colors[i];
            }
            for (let i = 0; i < this.billsChart.data.datasets.length; i++) {
                this.billsChart.data.datasets[i].borderColor = colors[4];
                this.billsChart.data.datasets[i].pointBackgroundColor = colors[4];
                this.billsChart.data.datasets[i].hoverBackgroundColor = colors[4];
                this.billsChart.data.datasets[i].backgroundColor = colors[4];
                this.billsChart.data.datasets[i].hoverBorderColor = colors[4];
                this.billsChart.data.datasets[i].pointBorderColor = colors[4];
                this.billsChart.data.datasets[i].pointHoverBackgroundColor = colors[4];
                this.billsChart.data.datasets[i].pointHoverBorderColor = colors[4];
            }
            this.inBoundChart.data.datasets[0].backgroundColor[1] = colors[3];
            this.inBoundChart.data.datasets[0].hoverBorderColor[1] = colors[3];
            this.inBoundChart.data.datasets[0].hoverBackgroundColor[1] = colors[3];
            if (color === '166,72,255') {
                this.ouBoundChart.data.datasets[0].backgroundColor[1] = '#9186D0';
                this.ouBoundChart.data.datasets[0].hoverBorderColor[1] = '#9186D0';
                this.ouBoundChart.data.datasets[0].hoverBackgroundColor[1] = '#9186D0';
                this.style = 'background-color: #9186D0!important; color: #FFFFFF;';
            } else {
                this.ouBoundChart.data.datasets[0].backgroundColor[1] = colors[4];
                this.ouBoundChart.data.datasets[0].hoverBorderColor[1] = colors[4];
                this.ouBoundChart.data.datasets[0].hoverBackgroundColor[1] = colors[4];
                this.style = 'background-color: ' + colors[0] + '!important; color: #FFFFFF;';
            }
            this.styleTable = 'background-color: ' + colors[5] + '!important; color: #000000;';
            this.billsChart.update();
            this.ouBoundChart.update();
            this.inBoundChart.update();
            this.mixedChart.update();
        }

    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    dashboardStock() {
        if (this.stockData){
            const rtn = this._dashboardsService.getDashboardStock();
            this.loadingClose(rtn);
        }
    }

    loadingClose(rtn: any): void {
        rtn.then((ex) => {
            this._functionService.cfn_loadingBarClear();
        });

    }
}



