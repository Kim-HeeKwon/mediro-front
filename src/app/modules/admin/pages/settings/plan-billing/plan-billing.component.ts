import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Common} from '../../../../../../@teamplat/providers/common/common';
import {SessionStore} from '../../../../../core/session/state/session.store';
import {FuseAlertType} from '../../../../../../@teamplat/components/alert';

import {environment} from 'environments/environment';

import { loadTossPayments } from '@tosspayments/sdk';
import {CommonCode, FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {FunctionService} from "../../../../../../@teamplat/services/function";
import {TeamPlatConfirmationService} from "../../../../../../@teamplat/services/confirmation";
import {takeUntil} from "rxjs/operators";
import {Observable, Subject} from "rxjs";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {ApplyContractComponent} from "./apply-contract/apply-contract.component";
import {DeviceDetectorService} from "ngx-device-detector";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
const clientKey = 'test_ck_XjExPeJWYVQ20nbeAkpr49R5gvNL';

//import { setBill } from 'assets/js/billCode.js';

@Component({
    selector       : 'settings-plan-billing',
    templateUrl    : './plan-billing.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPlanBillingComponent implements OnInit
{
    isMobile: boolean = false;
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    customerBirthday: string = '생년월일 or 사업자번호';

    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    configForm: FormGroup;
    cardCompany: CommonCode[] = null;
    payMethod: string = '';
    payGrade: string = '';
    showAlert: boolean = false;
    yearlyBilling: boolean = false;
    change: boolean = false;
    salesStyle = 'background-color: #D0E0FF; color: #276EED; border-radius: 4px;';
    planBillingForm: FormGroup;
    plans: any[];
    enterFee: number = 100;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _matDialog: MatDialog,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _sessionStore: SessionStore,
        private _functionService: FunctionService,
        private _deviceService: DeviceDetectorService,
        private _codeStore: CodeStore,
        private _utilService: FuseUtilsService,
        private _common: Common,
        private readonly breakpointObserver: BreakpointObserver
    )
    {
        this.isMobile = this._deviceService.isMobile();
        this.cardCompany = _utilService.commonValue(_codeStore.getValue().data, 'CARD_COMPANY');
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Create the form
        this.planBillingForm = this._formBuilder.group({
            mId            : [''],
            plan           : ['premium',[Validators.required]],
            cardHolder     : ['',[Validators.required]],
            cardNumber     : ['',[Validators.required]],
            cardExpiration : ['',[Validators.required]],
            cardCVC        : ['',[Validators.required]],
            payGrade       : [{value:'',disabled:true},[Validators.required]],
            yearUser       : [{value:'',disabled:true},[Validators.required]],
            ownerType      : ['',[Validators.required]],
            payMethod       : ['',[Validators.required]],
            cardCompany    : [''],
            cardPassword   : ['',[Validators.required]],
            customerBirthday : ['', [Validators.required]],
            basePrice : [''],
            yearPay        : ['']
        });
        this.planBillingForm.patchValue({'yearUser': 1 + ''});
        this.yearlyBilling = true;
        this.planBillingForm.patchValue({'payGrade': 'premium' + ''});

        // Get Customer Payment Info
        this.getBillingInfo();

        // Setup the plans
        this.plans = [
            {
                value  : 'basic',
                title  : '기본',
                label  : '기본 사용료',
                details: '유통관리를 고객을 위한 기본 서비스',
                salePrice : '490000',
                sale : '-15%',
                price  : '48000',
                yearPrice : '490000',
                borderStyle : 'border-color: #E0E0E0',
                color : 'color : #E0E0E0'
            },
            {
                value  : 'premium',
                title  : '프리미엄',
                label  : '프리미엄 사용료',
                details: '유통관리 및 데이터 연동 기반 프리미엄 서비스',
                sale : '-15%',
                salePrice : '990000',
                price  : '98000',
                yearPrice : '990000',
                borderStyle : 'border-color: #FFDE33',
                color : 'color : #FFDE33'
            },
            {
                value  : 'customize',
                title  : '커스텀',
                label  : '커스텀 사용료',
                details: '맞춤 고객을 위한 커스텀서비스',
                price  : '00',
                borderStyle : 'border-color: #343C48',
                color : 'color : #343C48'
            }
        ];
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    join(): void
    {
        const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
            title: '',
            message: '가입비 결제 하시겠습니까?',
            icon: this._formBuilder.group({
                show: true,
                name: 'heroicons_outline:check',
                color: 'primary'
            }),
            actions: this._formBuilder.group({
                confirm: this._formBuilder.group({
                    show: true,
                    label: '결제',
                    color: 'accent'
                }),
                cancel: this._formBuilder.group({
                    show: true,
                    label: '닫기'
                })
            }),
            dismissible: true
        }).value);

        confirmation.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if (result) {
                    const today = new Date();

                    const year = today.getFullYear(); // 년도
                    const month = today.getMonth() + 1;  // 월
                    const date = today.getDate();  // 날짜
                    const day = today.getDay();  // 요일
                    const hours = today.getHours(); // 시
                    const minutes = today.getMinutes();  // 분
                    const seconds = today.getSeconds();  // 초

                    let no = '';
                    no += '' + year + month + date + hours + minutes + seconds;

                    loadTossPayments(environment.tossClientKey).then((tossPayments) => {
                        tossPayments.requestPayment('카드', {
                            amount: 165000,
                            orderId: this._sessionStore.getValue().businessNumber + '_' + no,
                            orderName: '메디로 가입비 (VAT 포함)',
                            customerName: this._sessionStore.getValue().businessName,
                            successUrl: environment.paymentHookUrl + '/success?' +
                                'businessNumber=' + this._sessionStore.getValue().businessNumber + '&' +
                                'email=' + '' + '&' +
                                'name=' + '' + '&' +
                                'password=' + '' + '&' +
                                'phone=' + '' + '&' +
                                'agreements=' + '' + '&' +
                                'customerName=' + this._sessionStore.getValue().businessName + '',
                            failUrl: environment.paymentHookUrl + '/fail',
                        }).catch( (err) => {
                            console.log(err);
                            if (err.code === 'USER_CANCEL') {
                                //this._router.navigateByUrl('/monitoring/dashboards');
                                // 취소 이벤트 처리
                                //alert('취소');
                                //alert(environment.paymentHookUrl);
                            }
                        });
                    });
                }else {
                }
            });
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    saveBillingInfo(): void
    {
        this.showAlert = false;

        if(this.planBillingForm.getRawValue().payGrade === 'customize'){
            this._functionService.cfn_alert('커스텀 서비스는 문의 하여 주시기 바랍니다.');
            return;
        }

        if(!this.planBillingForm.invalid){

            this.planBillingForm.patchValue({'yearPay':this.yearlyBilling});
            this.planBillingForm.patchValue({'mId':this._sessionStore.getValue().businessNumber});
            //console.log()

            const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
                title: '',
                message: '정기 서비스를 신청하시겠습니까?',
                icon: this._formBuilder.group({
                    show: true,
                    name: 'heroicons_outline:check',
                    color: 'primary'
                }),
                actions: this._formBuilder.group({
                    confirm: this._formBuilder.group({
                        show: true,
                        label: '신청',
                        color: 'accent'
                    }),
                    cancel: this._formBuilder.group({
                        show: true,
                        label: '닫기'
                    })
                }),
                dismissible: true
            }).value);

            confirmation.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        this._common.sendDataLoading(this.planBillingForm.getRawValue(),'/v1/api/payment/payment-basic-info')
                            .subscribe((responseData: any) => {
                                this._functionService.cfn_loadingBarClear();
                                this.alertCheckMessage(responseData);
                                if(responseData.data !== null){
                                    const orderInfo = responseData.data[0];

                                    // loadTossPayments(environment.tossClientKey).then((tossPayments) => {
                                    //     tossPayments.requestPayment('카드', {
                                    //         amount: 100,
                                    //         orderId: this._sessionStore.getValue().businessNumber + orderInfo.serial,
                                    //         orderName: '메디로 가입비',
                                    //         customerName: this._sessionStore.getValue().businessName,
                                    //         successUrl: environment.paymentHookUrl + '/success',
                                    //         failUrl: environment.paymentHookUrl + '/fail',
                                    //     }).catch( (err) => {
                                    //         console.log(err);
                                    //         if (err.code === 'USER_CANCEL') {
                                    //             //this._router.navigateByUrl('/monitoring/dashboards');
                                    //             // 취소 이벤트 처리
                                    //             //alert('취소');
                                    //             //alert(environment.paymentHookUrl);
                                    //         }
                                    //     });
                                    // });
                                }

                            });
                    } else {
                    }
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();


        }else{
            // Set the alert
            this.alert = {
                type   : 'error',
                message: '성명(기업명), 카드번호, 유효기간 , CVC, 카드비밀번호, 생년월일 or 사업자번호를 입력해주세요.'
            };

            // Show the alert
            this.showAlert = true;
        }
    }

    getBillingInfo(): void
    {
        const param = {
            mId: this._sessionStore.getValue().businessNumber
        };

        this._common.sendData(param,'/v1/api/payment/get-payment-basic-info')
            .subscribe((responseData: any) => {
                if(!this._common.gfn_isNull(responseData.data)){
                    this.planBillingForm.patchValue({'yearPay':responseData.data[0].yearPay});
                    this.planBillingForm.patchValue({'plan':responseData.data[0].plan});
                    this.planBillingForm.patchValue({'cardHolder':responseData.data[0].cardHolder});
                    this.planBillingForm.patchValue({'cardNumber':responseData.data[0].cardNumber});
                    this.planBillingForm.patchValue({'cardExpiration':responseData.data[0].cardExpiration});
                    this.planBillingForm.patchValue({'cardCVC':responseData.data[0].cardCVC});
                    this.planBillingForm.patchValue({'cardCompany':responseData.data[0].cardCompany});
                    this.planBillingForm.patchValue({'cardPassword':responseData.data[0].cardPassword});

                    this.planBillingForm.patchValue({'yearUser':responseData.data[0].yearUser});
                    this.planBillingForm.patchValue({'payMethod':responseData.data[0].payMethod});
                    this.planBillingForm.patchValue({'payGrade':responseData.data[0].payGrade});
                    this.planBillingForm.patchValue({'ownerType':responseData.data[0].ownerType});
                    this.planBillingForm.patchValue({'customerBirthday':responseData.data[0].customerBirthday});

                    if(responseData.data[0].ownerType === '개인'){

                        this.customerBirthday = '생년월일';
                    }else if(responseData.data[0].ownerType === '법인'){

                        this.customerBirthday = '사업자번호';
                    }else{
                        this.customerBirthday = '생년월일 or 사업자번호';
                    }

                    console.log(responseData.data[0].payMethod);
                    this.payMethod = responseData.data[0].payMethod;
                    this._changeDetectorRef.markForCheck();

                    //this.yearlyBilling = responseData.data[0].yearUser === '0' ? false : true;
                }
            });
    }

    billEnterFee(): void
    {
        //setBill(); window.location.origin => environment
        // successUrl: environment.paymentHookUrl + '/success',  'http://localhost:8096/teamPlatFw/success',
        // failUrl: environment.paymentHookUrl + '/fail',
        loadTossPayments(environment.tossClientKey).then((tossPayments) => {
            tossPayments.requestPayment('카드', {
                amount: this.enterFee,
                orderId: this._sessionStore.getValue().businessNumber,
                orderName: '메디로 가입비',
                customerName: this._sessionStore.getValue().businessName,
                successUrl: environment.paymentHookUrl + '/success',
                failUrl: environment.paymentHookUrl + '/fail',
            }).catch( (err) => {
                if (err.code === 'USER_CANCEL') {
                    // 취소 이벤트 처리
                    //alert('취소');
                    //alert(environment.paymentHookUrl);
                }
            });
        });
    }

    billEnterFeeAccount(): void
    {
        //setBill(); window.location.origin => environment
        // successUrl: environment.paymentHookUrl + '/success',  'http://localhost:8096/teamPlatFw/success',
        // failUrl: environment.paymentHookUrl + '/fail',
        loadTossPayments(environment.tossClientKey).then((tossPayments) => {
            tossPayments.requestPayment('카드', {
                amount: this.enterFee,
                orderId: this._sessionStore.getValue().businessNumber,
                orderName: '메디로 가입비',
                customerName: this._sessionStore.getValue().businessName,
                successUrl: environment.paymentHookUrl + '/success',
                failUrl: environment.paymentHookUrl + '/fail',
            }).catch( (err) => {
                if (err.code === 'USER_CANCEL') {
                    // 취소 이벤트 처리
                    //alert('취소');
                    //alert(environment.paymentHookUrl);
                }
            });
        });
    }

    yearlyBillingBind() {
        if(this.yearlyBilling){
            this.yearlyBilling = false;
            this.salesStyle = 'background-color: #F0F0F0; color: #BABABA; border-radius: 4px;';
        }else{
            this.yearlyBilling = true;
            this.salesStyle = 'background-color: #D0E0FF; color: #276EED; border-radius: 4px;';
        }

        this.planBillingForm.patchValue({'yearUser': (this.yearlyBilling ? 1 : 0) + ''});
        //this.planBillingForm.patchValue({'payGrade': this.payGrade + ''});

        this._changeDetectorRef.markForCheck();
    }

    selectType(type: string) {
        this.payMethod = type;
    }

    planBind(value) {
        this.payGrade = value;
        //this.planBillingForm.patchValue({'yearUser': (this.yearlyBilling ? 1 : 0) + ''});
        this.planBillingForm.patchValue({'payGrade': this.payGrade + ''});

        this._changeDetectorRef.markForCheck();
    }

    customizeAS(): void{
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    alertCheckMessage(param: any, redirectUrl?: string): void
    {
        if(param.status !== 'SUCCESS'){

            const icon = 'information-circle';
            // Setup config form
            this.configForm = this._formBuilder.group({
                title      : '',
                message    : param.msg,
                icon       : this._formBuilder.group({
                    show : true,
                    name : 'heroicons_outline:' + icon,
                    color: 'accent'
                }),
                actions    : this._formBuilder.group({
                    confirm: this._formBuilder.group({
                        show : false,
                        label: '',
                    }),
                    cancel : this._formBuilder.group({
                        show : true,
                        label: '닫기'
                    })
                }),
                dismissible: true
            });
            const confirmation = this._teamPlatConfirmationService.open(this.configForm.value);
        }else{
            this._functionService.cfn_alert('정상적으로 처리되었습니다.','check-circle');
        }
    }

    ApplyContract() {

        if (!this.isMobile) {

            this._matDialog.open(ApplyContractComponent, {
                autoFocus: false,
                data     : {
                    data: this.planBillingForm.getRawValue()
                },
                maxHeight: '90vh',
                //width: '90vw',
                disableClose: true
            });
        }else{

            const p = this._matDialog.open(ApplyContractComponent, {
                autoFocus: false,
                data     : {
                    data: this.planBillingForm.getRawValue()
                },
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    p.updateSize('calc(100vw - 10px)', '');
                }
            });
        }
    }

    selectOwnerType(ownerType: string) {

        if(ownerType === '개인'){
            this.customerBirthday = '생년월일';
        }else if(ownerType === '법인'){
            this.customerBirthday = '사업자번호';
        }else{
            this.customerBirthday = '생년월일 or 사업자번호';
        }
    }
}
