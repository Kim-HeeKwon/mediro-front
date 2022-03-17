import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, Inject,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from "@angular/core";
import {fuseAnimations} from "../../../../../@teamplat/animations";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {takeUntil} from "rxjs/operators";
import {loadTossPayments} from "@tosspayments/sdk";
import {environment} from "../../../../../environments/environment";
import {Subject} from "rxjs";
import {TeamPlatConfirmationService} from "../../../../../@teamplat/services/confirmation";
import {FormBuilder} from "@angular/forms";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {Router} from "@angular/router";

@Component({
    selector       : 'subscription-fee',
    templateUrl    : './subscription-fee.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class SubscriptionFeeComponent implements OnInit, OnDestroy {

    form: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public matDialogRef: MatDialogRef<SubscriptionFeeComponent>,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _formBuilder: FormBuilder,
        private _functionService: FunctionService,
        private _router: Router,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {
        this.form = data.data;

    }

    ngOnInit(): void {
        console.log(this.form);
    }

    ngOnDestroy(): void {
    }

    subscriptionFee() {
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
                            orderId: this.form.businessNumber + '_' + no,
                            orderName: '메디로 가입비 (VAT 포함)',
                            customerName: this.form.company,
                            successUrl: environment.paymentHookUrl + '/success?' +
                                'businessNumber=' + this.form.businessNumber + '&' +
                                'email=' + this.form.email + '&' +
                                'name=' + this.form.name + '&' +
                                'password=' + this.form.password + '&' +
                                'phone=' + this.form.phone + '&' +
                                'agreements=' + this.form.agreements + '&' +
                                'customerName=' + this.form.company + '',
                            failUrl: environment.paymentHookUrl + '/fail',
                        }).then((value) => {
                          console.log(value + ': 성공');
                          this._router.navigateByUrl('/sign-up');
                        }).catch( (err) => {
                            if (err.code === 'USER_CANCEL') {
                                this._functionService.cfn_alert('취소됐습니다.');
                                this._changeDetectorRef.markForCheck();
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
}
