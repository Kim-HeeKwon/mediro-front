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
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    cardCompany: CommonCode[] = null;
    payMethod: string = '';
    payGrade: string = '';
    showAlert: boolean = false;
    yearlyBilling: boolean = false;
    planBillingForm: FormGroup;
    plans: any[];
    enterFee: number = 100;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _sessionStore: SessionStore,
        private _functionService: FunctionService,
        private _codeStore: CodeStore,
        private _utilService: FuseUtilsService,
        private _common: Common
    )
    {
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
            plan           : ['basic',[Validators.required]],
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
            yearPay        : ['']
        });
        this.planBillingForm.patchValue({'yearUser': 0 + ''});
        this.planBillingForm.patchValue({'payGrade': 'basic' + ''});

        // Get Customer Payment Info
        this.getBillingInfo();

        // Setup the plans
        this.plans = [
            {
                value  : 'basic',
                label  : '기본 사용료',
                details: '유통관리를 고객을 위한 기본 서비스',
                price  : '48000',
                yearPrice : '480000',
                borderStyle : 'border-color: #E0E0E0',
                color : 'color : #E0E0E0'
            },
            {
                value  : 'premium',
                label  : '프리미엄 사용료',
                details: '유통관리 및 데이터 연동 기반 프리미엄 서비스',
                price  : '98000',
                yearPrice : '980000',
                borderStyle : 'border-color: #FFDE33',
                color : 'color : #FFDE33'
            },
            {
                value  : 'customize',
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

            this._common.sendData(this.planBillingForm.getRawValue(),'/v1/api/payment/payment-basic-info')
                .subscribe((responseData: any) => {
                    console.log(responseData);
                });
        }else{
            // Set the alert
            this.alert = {
                type   : 'error',
                message: '성명(기업명), 카드번호, 유효기간 , CVC, 카드비밀번호를 입력해주세요.'
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
        }else{
            this.yearlyBilling = true;
        }
        console.log(this.yearlyBilling);

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
}
