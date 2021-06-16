import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fuseAnimations } from '@teamplat/animations';
import { FuseAlertType } from '@teamplat/components/alert';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector     : 'auth-sign-up',
    templateUrl  : './sign-up.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class AuthSignUpComponent implements OnInit
{
    @ViewChild('signUpNgForm') signUpNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    signUpForm: FormGroup;
    showAlert: boolean = false;
    showStep1: boolean = true;
    showStep2: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private _router: Router
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
        this.signUpForm = this._formBuilder.group({
                id        : [''],
                name      : ['', Validators.required],
                email     : ['', [Validators.required, Validators.email]],
                password  : ['', Validators.required],
                phone     : ['', Validators.required],
                businessNumber  : ['', Validators.required],
                agreements: ['', Validators.requiredTrue],
                company   : [''],
                avatar    : [''],
                userType        : [''],
                fileName        : [''],
                ciphertext        : [''],
                iv        : [''],
                salt        : [''],
                passPhrase        : [''],
                index        : [''],
                randomNumber : [''],
                handle        : ['insert'],
            }
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign up
     */
    signUp(): void
    {
        console.log(this.signUpForm.value);
        // Do nothing if the form is invalid
        if ( this.signUpForm.invalid )
        {
            return;
        }

        // 사업자번호 조회
        this._authService.checkBusinessNumber(this.signUpForm.value.businessNumber)
            .subscribe(
                (response) => {
                    if(response.status !== 'success'){
                        // Set the alert
                        this.alert = {
                            type   : 'error',
                            message: '국세청에 조회가 되지 않는 사업자등록번호 입니다. 다시 확인해주세요.'
                        };
                        this.showAlert = true;
                        this.showStep1 = true;
                        return;
                    }else{
                        // 사업자 등록증 확인 되면 임시 계정에 저장
                        // 임시계정에 저장된 휴대폰 번호를 가지고 휴대폰번호 인증확인
                        // 인증이 완료되면 본 계정으로 변환
                        // Disable the form
                        this.signUpForm.disable();

                        // Hide the alert
                        this.showAlert = false;

                        // Sign up
                        this._authService.signUpTemp(this.signUpForm.value)
                            .subscribe(
                                // eslint-disable-next-line @typescript-eslint/no-shadow
                                (response) => {
                                    console.log(response);
                                    if(response.status === 'SUCCESS'){
                                        this.showStep1 = false;
                                        this.showStep2 = true;
                                        this.signUpForm.enable();
                                    }
                                    // Navigate to the confirmation required page
                                    // this._router.navigateByUrl('/confirmation-required');
                                },
                                // eslint-disable-next-line @typescript-eslint/no-shadow
                                (response) => {

                                    // Re-enable the form
                                    this.signUpForm.enable();

                                    // Reset the form
                                    this.signUpNgForm.resetForm();

                                    // Set the alert
                                    this.alert = {
                                        type   : 'error',
                                        message: 'Something went wrong, please try again.'
                                    };

                                    // Show the alert
                                    this.showAlert = true;
                                }
                            );
                    }
                }
            );
    }

    /**
     * check Random Number
     */
    checkRandomNumber(): void
    {
        // Sign up
        this._authService.signUp(this.signUpForm.value)
            .subscribe(
                // eslint-disable-next-line @typescript-eslint/no-shadow
                (response) => {
                    console.log(response);
                    if(response.status === 'SUCCESS'){
                        this.showStep1 = false;
                        this.showStep2 = true;
                        this.signUpForm.enable();
                    }
                    // Navigate to the confirmation required page
                    this._router.navigateByUrl('/confirmation-required');
                },
                // eslint-disable-next-line @typescript-eslint/no-shadow
                (response) => {

                    // Re-enable the form
                    this.signUpForm.enable();

                    // Reset the form
                    this.signUpNgForm.resetForm();

                    // Set the alert
                    this.alert = {
                        type   : 'error',
                        message: 'Something went wrong, please try again.'
                    };

                    // Show the alert
                    this.showAlert = true;
                }
            );
    }

    // /**
    //  * 사업자등록증 체크
    //  */
    // checkBusinessNumber(): void
    // {
    //     console.log('check 사업자등록증');
    //     console.log(this.signUpForm.value.businessNumber);
    // }
}
