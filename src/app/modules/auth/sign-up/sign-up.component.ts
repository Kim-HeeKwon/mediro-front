import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fuseAnimations } from '@teamplat/animations';
import { FuseAlertType } from '@teamplat/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import {MatDialog} from '@angular/material/dialog';
import {DeviceDetectorService} from 'ngx-device-detector';
import {PrivacyComponent} from './privacy/privacy.component';
import {Observable} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {TermOfServiceComponent} from "./term-of-service/term-of-service.component";

@Component({
    selector     : 'auth-sign-up',
    templateUrl  : './sign-up.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class AuthSignUpComponent implements OnInit
{
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild('signUpNgForm') signUpNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    signUpForm: FormGroup;
    showAlert: boolean = false;
    showStep1: boolean = true;
    showStep2: boolean = false;

    isMobile: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _matDialog: MatDialog,
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver
    )
    {
        this.isMobile = this._deviceService.isMobile();
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
                password  : ['', [Validators.required,Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9@$!%*#?&]+$/),
                    Validators.minLength(8),
                    Validators.maxLength(20)]],
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
        // Do nothing if the form is invalid
        if ( this.signUpForm.invalid )
        {
            console.log(this.signUpForm);
            if(this.signUpForm.controls.agreements.status === 'INVALID'){
                this.alert = {
                    type   : 'error',
                    message: '이용약관 및 정보처리방침에 동의해주세요.'
                };

                // Show the alert
                this.showAlert = true;
            }
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
                                    if(response.status === 'SUCCESS'){
                                        this.showStep1 = false;
                                        this.showStep2 = true;
                                        this.signUpForm.enable();
                                    }
                                    // Navigate to the confirmation required page
                                    // this._router.navigateByUrl('/confirmation-required');
                                },
                                // eslint-disable-next-line @typescript-eslint/no-shadow
                                (err) => {
                                    // Set the alert
                                    this.alert = {
                                        type   : 'error',
                                        message: '이미 가입한 사업자번호 입니다. 관리자에게 문의하여주세요.'
                                    };

                                    // Show the alert
                                    this.showAlert = true;
                                    // Re-enable the form
                                    this.signUpForm.enable();

                                    // Reset the form
                                    this.signUpNgForm.resetForm();
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
                        this._router.navigateByUrl('/confirmation-required');
                    }else{
                        this.alert = {
                            type   : 'error',
                            message: '인증번호가 유효하지 않습니다.'
                        };
                        this.showAlert = true;
                    }
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

    /**
     * sendSms
     */
    sendSms(): void
    {
        // Sign up
        this._authService.sendSms(this.signUpForm.value)
            .subscribe(
                // eslint-disable-next-line @typescript-eslint/no-shadow
                (response) => {
                    console.log(response);
                    if(response.status === 'SUCCESS'){
                        this.alert = {
                            type   : 'success',
                            message: '인증번호를 재전송 하였습니다.'
                        };
                        this.showAlert = true;
                    }else{
                        this.alert = {
                            type   : 'error',
                            message: '관리자에게 문의해주세요.'
                        };
                        this.showAlert = true;
                    }
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


    /**
     * 개인정보보호 확인
     */
    checkPrivacy(): void
    {
        if(!this.isMobile){
            this._matDialog.open(PrivacyComponent, {
                autoFocus: false,
                disableClose: true,
                maxHeight: '80vh',
                data     : {
                    note: {}
                },
            });
        }else{
            const d = this._matDialog.open(PrivacyComponent, {
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    d.updateSize('calc(100vw - 10px)','');
                } else {
                    // d.updateSize('calc(100% - 50px)', '');
                }
            });
            d.afterClosed().subscribe(() => {
                smallDialogSubscription.unsubscribe();
            });
        }
    }

    /**
     * 이용약관 확인
     */
    checkTermOfService(): void
    {
        if(!this.isMobile){
            this._matDialog.open(TermOfServiceComponent, {
                autoFocus: false,
                disableClose: true,
                maxHeight: '80vh',
                data     : {
                    note: {}
                },
            });
        }else{
            const d = this._matDialog.open(TermOfServiceComponent, {
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    d.updateSize('calc(100vw - 10px)','');
                } else {
                    // d.updateSize('calc(100% - 50px)', '');
                }
            });
            d.afterClosed().subscribe(() => {
                smallDialogSubscription.unsubscribe();
            });
        }
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
