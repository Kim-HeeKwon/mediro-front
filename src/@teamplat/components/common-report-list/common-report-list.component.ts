import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from "@angular/core";
import {fuseAnimations} from "../../animations";
import {ReportHeaderData} from "../common-report/common-report.types";
import {DeviceDetectorService} from "ngx-device-detector";
import {ActivatedRoute, Router} from "@angular/router";
import {EstimateService} from "../../../app/modules/dms/estimate-order/estimate/estimate.service";
import {Subject} from "rxjs";
import {TeamPlatConfirmationService} from "../../services/confirmation";
import {OrderService} from "../../../app/modules/dms/estimate-order/order/order.service";
import {takeUntil} from "rxjs/operators";
import {FunctionService} from "../../services/function";
import {FormBuilder} from "@angular/forms";

@Component({
    selector: 'app-common-report-list',
    templateUrl: './common-report-list.component.html',
    styleUrls: ['./common-report-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})

export class CommonReportListComponent implements OnInit, OnDestroy{
    isMobile: boolean = false;
    isLoading: boolean = false;
    headerText: string = '';
    divisionText: string = '';
    header: any;
    detail: any;
    qty: number = 0;
    unitPrice: number = 0;
    totalAmt: number = 0;
    taxAmt: number = 0;
    param: any;
    reportHeaderData: ReportHeaderData = new ReportHeaderData();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        private _deviceService: DeviceDetectorService,
        private _router: Router,
        private _changeDetectorRef: ChangeDetectorRef,
        private _estimateService: EstimateService,
        private _functionService: FunctionService,
        private _formBuilder: FormBuilder,
        private _orderService: OrderService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _activatedRoute: ActivatedRoute,) {

        this.isMobile = this._deviceService.isMobile();

        this.param = this._activatedRoute.snapshot.queryParams;
    }

    ngOnInit(): void {

        if(this.param){

            if(this.param.check){
                if(this.param.check === 'estimate'){
                    this.headerText = '?????????';
                    this.divisionText = '??????';

                    const searchParam = {
                        mid: this.param.mid,
                        qtNo: this.param.no,

                    };
                    const rtn = this._estimateService.getHeaderReport(0, 20, 'qtNo', 'desc', searchParam);

                    rtn.then((ex) => {

                        this.header = ex.estimateHeader;
                        this.reportHeaderData.no = ex.estimateHeader[0].qtNo;
                        this.reportHeaderData.date = ex.estimateHeader[0].qtDate;
                        this.reportHeaderData.remark = ex.estimateHeader[0].remarkHeader;
                        this.reportHeaderData.custBusinessNumber = ex.estimateHeader[0].custBusinessNumber;// ????????? ????????????
                        this.reportHeaderData.custBusinessName = ex.estimateHeader[0].custBusinessName;//??????
                        this.reportHeaderData.representName = ex.estimateHeader[0].representName;//??????
                        this.reportHeaderData.address = ex.estimateHeader[0].address;//??????
                        this.reportHeaderData.businessCondition = ex.estimateHeader[0].businessCondition;// ??????
                        this.reportHeaderData.businessCategory = ex.estimateHeader[0].businessCategory;// ??????
                        this.reportHeaderData.phoneNumber = '0' + ex.estimateHeader[0].phoneNumber;// ????????????
                        this.reportHeaderData.fax = '0' + ex.estimateHeader[0].fax;// ????????????
                        this.reportHeaderData.toAccountNm = ex.estimateHeader[0].toAccountNm;
                        this.reportHeaderData.deliveryDate = ex.estimateHeader[0].deliveryDate;
                        this.reportHeaderData.deliveryAddress = '';

                        this.reportHeaderData.phoneNumber = this.reportHeaderData.phoneNumber !== '00' ? this.reportHeaderData.phoneNumber : '';
                        this.reportHeaderData.fax = this.reportHeaderData.fax !== '00' ? this.reportHeaderData.fax : '';

                    });

                    const rtnD = this._estimateService.getDetailReport(0, 1000, 'qtLineNo', 'asc', searchParam);
                    rtnD.then((ex) => {

                        const estimateDetailData = [];
                        let index = 0;
                        ex.estimateDetail.forEach((data: any) => {
                            index++;
                            estimateDetailData.push({
                                no: index,
                                itemNm: data.itemNm,
                                standard: data.standard,
                                unit: data.unit,
                                itemGrade: data.itemGrade,
                                qty: data.qty,
                                unitPrice: data.qtPrice,
                                totalAmt: data.qtAmt,
                                taxAmt: 0,
                                remark: data.remarkDetail,
                            });
                        });
                        this.detail = estimateDetailData;

                        this.detail.forEach((reportDetail: any) => {
                            this.qty += reportDetail.qty;
                            this.unitPrice += reportDetail.unitPrice;
                            this.totalAmt += reportDetail.totalAmt;
                            this.taxAmt += reportDetail.taxAmt;
                        });

                        if(this.detail.length < 20){
                            let idx = this.detail.length;
                            const lastIdx = 20 - this.detail.length;
                            for(let i=0; i<lastIdx; i++){
                                this.detail.push({
                                    itemGrade: '',
                                    itemNm: '',
                                    no: idx+1,
                                    qty: '',
                                    remark: '',
                                    standard: '',
                                    taxAmt: '',
                                    totalAmt: '',
                                    unit: '',
                                    unitPrice: '',
                                });

                                idx++;
                            }
                        }
                    });

                }else if(this.param.check === 'order'){
                    this.headerText = '?????????';
                    this.divisionText = '??????';

                    const searchParam = {
                        mid: this.param.mid,
                        poNo: this.param.no,
                    };
                    const rtn = this._orderService.getHeaderReport(0, 20, 'poNo', 'desc', searchParam);

                    rtn.then((ex) => {

                        this.header = ex.orderHeader;
                        this.reportHeaderData.no = ex.orderHeader[0].poNo;
                        this.reportHeaderData.date = ex.orderHeader[0].poDate;
                        this.reportHeaderData.remark = ex.orderHeader[0].remarkHeader;
                        this.reportHeaderData.custBusinessNumber = ex.orderHeader[0].custBusinessNumber;// ????????? ????????????
                        this.reportHeaderData.custBusinessName = ex.orderHeader[0].custBusinessName;//??????
                        this.reportHeaderData.representName = ex.orderHeader[0].representName;//??????
                        this.reportHeaderData.address = ex.orderHeader[0].address;//??????
                        this.reportHeaderData.businessCondition = ex.orderHeader[0].businessCondition;// ??????
                        this.reportHeaderData.businessCategory = ex.orderHeader[0].businessCategory;// ??????
                        this.reportHeaderData.phoneNumber = '0' + ex.orderHeader[0].phoneNumber;// ????????????
                        this.reportHeaderData.fax = '0' + ex.orderHeader[0].fax;// ????????????
                        this.reportHeaderData.toAccountNm = ex.orderHeader[0].toAccountNm;
                        this.reportHeaderData.deliveryDate = ex.orderHeader[0].deliveryDate;
                        this.reportHeaderData.deliveryAddress = '?????? ?????????';

                        this.reportHeaderData.phoneNumber = this.reportHeaderData.phoneNumber !== '00' ? this.reportHeaderData.phoneNumber : '';
                        this.reportHeaderData.fax = this.reportHeaderData.fax !== '00' ? this.reportHeaderData.fax : '';

                    });

                    const rtnD = this._orderService.getDetailReport(0, 1000, 'poLineNo', 'asc', searchParam);
                    rtnD.then((ex) => {

                        const orderDetailData = [];
                        let index = 0;
                        ex.orderDetail.forEach((data: any) => {
                            index++;
                            orderDetailData.push({
                                no: index,
                                itemNm: data.itemNm,
                                standard: data.standard,
                                unit: data.unit,
                                itemGrade: data.itemGrade,
                                qty: data.reqQty,
                                unitPrice: data.unitPrice,
                                totalAmt: data.poAmt,
                                taxAmt: 0,
                                remark: data.remarkDetail,
                            });
                        });
                        this.detail = orderDetailData;

                        this.detail.forEach((reportDetail: any) => {
                            this.qty += reportDetail.qty;
                            this.unitPrice += reportDetail.unitPrice;
                            this.totalAmt += reportDetail.totalAmt;
                            this.taxAmt += reportDetail.taxAmt;
                        });

                        if(this.detail.length < 20){
                            let idx = this.detail.length;
                            const lastIdx = 20 - this.detail.length;
                            for(let i=0; i<lastIdx; i++){
                                this.detail.push({
                                    itemGrade: '',
                                    itemNm: '',
                                    no: idx+1,
                                    qty: '',
                                    remark: '',
                                    standard: '',
                                    taxAmt: '',
                                    totalAmt: '',
                                    unit: '',
                                    unitPrice: '',
                                });

                                idx++;
                            }
                        }
                    });


                }else{
                    this.headerText = '??? ??? ???';
                    this.divisionText = '';
                }
            }else{
                this.headerText = '??? ??? ???';
                this.divisionText = '';
            }


        }
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    phoneFomatter(num,type?): string{

        let formatNum = '';
        if(num !== undefined) {

            if(num.length === 11){
                if(type===0){
                    formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
                }else{
                    formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
                }
            }else if(num.length===8){
                formatNum = num.replace(/(\d{4})(\d{4})/, '$1-$2');
            }else{
                if(num.indexOf('02') === 0){
                    if(type === 0){
                        formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
                    }else{
                        formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
                    }
                }else{
                    if(type === 0){
                        formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
                    }else{
                        formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
                    }
                }
            }
        }
        return formatNum;
    }
    bizNoFormatter(num, type?): string {
        let formatNum = '';
        try{
            if (num.length === 10) {
                if (type === 0) {
                    formatNum = num.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3');
                } else {
                    formatNum = num.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3');
                }
            }
        } catch(e) {
            formatNum = num;
        }
        return formatNum;
    }
    priceToString(price): number {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    reCancel(): void{
        if(this.param.check === 'estimate'){
            const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
                title: '',
                message: '?????????????????????????',
                icon: this._formBuilder.group({
                    show: true,
                    name: 'heroicons_outline:exclamation',
                    color: 'warn'
                }),
                actions: this._formBuilder.group({
                    confirm: this._formBuilder.group({
                        show: true,
                        label: '??????',
                        color: 'warn'
                    }),
                    cancel: this._formBuilder.group({
                        show: true,
                        label: '??????'
                    })
                }),
                dismissible: true
            }).value);

            confirmation.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {

                        const sendData = this.header;

                        if (sendData) {
                            this._estimateService.estimateReCancel(sendData)
                                .pipe(takeUntil(this._unsubscribeAll))
                                .subscribe((estimate: any) => {
                                    this._functionService.cfn_alertCheckMessage(estimate);
                                    // Mark for check
                                    this._changeDetectorRef.markForCheck();
                                });
                        }
                    } else {
                    }
                });
        }
    }

    reject(): void{

        if(this.param.check === 'order'){
            const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
                title: '',
                message: '?????????????????????????',
                icon: this._formBuilder.group({
                    show: true,
                    name: 'heroicons_outline:exclamation',
                    color: 'warn'
                }),
                actions: this._formBuilder.group({
                    confirm: this._formBuilder.group({
                        show: true,
                        label: '??????',
                        color: 'warn'
                    }),
                    cancel: this._formBuilder.group({
                        show: true,
                        label: '??????'
                    })
                }),
                dismissible: true
            }).value);

            confirmation.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {

                        const sendData = this.header;

                        if (sendData) {
                            this._orderService.orderReject(sendData)
                                .pipe(takeUntil(this._unsubscribeAll))
                                .subscribe((order: any) => {
                                    this._functionService.cfn_alertCheckMessage(order);
                                    // Mark for check
                                    this._changeDetectorRef.markForCheck();
                                });
                        }
                    } else {
                    }
                });
        }


    }

    resend(): void{

        const confirmation = this._teamPlatConfirmationService.open({
            title: '',
            message: '?????????????????????????',
            actions: {
                confirm: {
                    label: '??????'
                },
                cancel: {
                    label: '??????'
                }
            }
        });


        if(this.param.check === 'estimate'){
            confirmation.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {

                        const sendData = this.header;

                        if (sendData) {
                            this._estimateService.estimateReply(sendData)
                                .pipe(takeUntil(this._unsubscribeAll))
                                .subscribe((estimate: any) => {
                                    this._functionService.cfn_alertCheckMessage(estimate);
                                    // Mark for check
                                    this._changeDetectorRef.markForCheck();
                                });
                        }
                    } else {
                    }
                });
        }else if(this.param.check === 'order'){
            confirmation.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {

                        const sendData = this.header;

                        if (sendData) {
                            this._orderService.orderReply(sendData)
                                .pipe(takeUntil(this._unsubscribeAll))
                                .subscribe((order: any) => {
                                    this._functionService.cfn_alertCheckMessage(order);
                                    // Mark for check
                                    this._changeDetectorRef.markForCheck();
                                });
                        }
                    } else {
                    }
                });
        }else{
            this._functionService.cfn_alert('???????????? ?????? ???????????????.');
        }

    }

    requestEstimate() {
        const confirmation = this._teamPlatConfirmationService.open({
            title: '',
            message: '????????? ???????????????????',
            actions: {
                confirm: {
                    label: '??????'
                },
                cancel: {
                    label: '??????'
                }
            }
        });


        if(this.param.check === 'estimate'){
            confirmation.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {

                        const sendData = this.header;

                        if (sendData) {
                            this._estimateService.estimateRequest(sendData)
                                .pipe(takeUntil(this._unsubscribeAll))
                                .subscribe((estimate: any) => {
                                    this._functionService.cfn_alertCheckMessage(estimate);
                                    // Mark for check
                                    this._changeDetectorRef.markForCheck();
                                });
                        }
                    } else {
                    }
                });
        }

    }
}
