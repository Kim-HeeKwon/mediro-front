import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Common} from '../../../../../../@teamplat/providers/common/common';
import {SessionStore} from '../../../../../core/session/state/session.store';
import {FuseAlertType} from '../../../../../../@teamplat/components/alert';

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
    showAlert: boolean = false;
    yearlyBilling: boolean = false;
    planBillingForm: FormGroup;
    plans: any[];

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _sessionStore: SessionStore,
        private _common: Common
    )
    {
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
            cardCompany    : [''],
            cardPassword   : ['',[Validators.required]],
            yearPay        : ['']
        });

        // Get Customer Payment Info
        this.getBillingInfo();

        // Setup the plans
        this.plans = [
            {
                value  : 'basic',
                label  : '기본서비스',
                details: '유통관리를 고객을 위한 기본 서비스',
                price  : '49000',
                yearPrice : '490000'
            },
            {
                value  : 'premium',
                label  : '프리미엄서비스',
                details: '유통관리 및 데이터 연동 기반 프리미엄 서비스',
                price  : '99000',
                yearPrice : '990000'
            },
            {
                value  : 'customize',
                label  : '커스텀서비스',
                details: '맞춤 고객을 위한 커스텀서비스',
                price  : '00'
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
                console.log('고객정보');
                //console.log(responseData);
                if(!this._common.gfn_isNull(responseData.data)){
                    this.planBillingForm.patchValue({'yearPay':responseData.data[0].yearPay});
                    this.planBillingForm.patchValue({'plan':responseData.data[0].plan});
                    this.planBillingForm.patchValue({'cardHolder':responseData.data[0].cardHolder});
                    this.planBillingForm.patchValue({'cardNumber':responseData.data[0].cardNumber});
                    this.planBillingForm.patchValue({'cardExpiration':responseData.data[0].cardExpiration});
                    this.planBillingForm.patchValue({'cardCVC':responseData.data[0].cardCVC});
                    this.planBillingForm.patchValue({'cardCompany':responseData.data[0].cardCompany});
                    this.planBillingForm.patchValue({'cardPassword':responseData.data[0].cardPassword});
                }
            });
    }

}
