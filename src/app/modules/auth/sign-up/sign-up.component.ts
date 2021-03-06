import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { fuseAnimations } from '@teamplat/animations';
import { FuseAlertType } from '@teamplat/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import {MatDialog} from '@angular/material/dialog';
import {DeviceDetectorService} from 'ngx-device-detector';
import {PrivacyComponent} from './privacy/privacy.component';
import {Observable} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {TermOfServiceComponent} from "./term-of-service/term-of-service.component";
import {SubscriptionFeeComponent} from "./subscription-fee/subscription-fee.component";

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
        private _activatedRoute: ActivatedRoute,
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
                // password  : ['', [Validators.required,Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9@$!%*#?&]+$/),
                //     Validators.minLength(8),
                //     Validators.maxLength(20)]],
                password  : ['', [Validators.required,Validators.pattern(/^(?=.*[a-z])(?=.*\d)[a-zA-Z0-9@$!%*#?&]+$/),
                    Validators.minLength(8),
                    Validators.maxLength(20)]],
                phone     : ['', Validators.required],
                businessNumber  : ['', Validators.required],
                agreements: ['', Validators.requiredTrue],
                channel    : ['none', Validators.required],
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
        if(this._activatedRoute.snapshot.queryParams.check !== undefined){
            if(this._activatedRoute.snapshot.queryParams.check !== 'fail'
                && this._activatedRoute.snapshot.queryParams.businessNumber !== undefined){
                this.signUpForm.patchValue(this._activatedRoute.snapshot.queryParams);
            }
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign up
     */
    signUp(): void
    {

        // if(!this.isMobile){
        //     this._matDialog.open(SubscriptionFeeComponent, {
        //         autoFocus: false,
        //         disableClose: true,
        //         maxHeight: '80vh',
        //         data     : {
        //             data: this.signUpForm.getRawValue()
        //         },
        //     });
        // }else{
        //     const d = this._matDialog.open(SubscriptionFeeComponent, {
        //         autoFocus: false,
        //         width: 'calc(100% - 50px)',
        //         maxWidth: '100vw',
        //         maxHeight: '80vh',
        //         data     : {
        //             data: this.signUpForm.getRawValue()
        //         },
        //         disableClose: true
        //     });
        //     const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
        //         if (size.matches) {
        //             d.updateSize('calc(100vw - 10px)','');
        //         } else {
        //             // d.updateSize('calc(100% - 50px)', '');
        //         }
        //     });
        //     d.afterClosed().subscribe(() => {
        //         smallDialogSubscription.unsubscribe();
        //     });
        // }
        // return;
        // Do nothing if the form is invalid
        if ( this.signUpForm.invalid )
        {
            if(this.signUpForm.controls.agreements.status === 'INVALID'){
                this.alert = {
                    type   : 'error',
                    message: '???????????? ??? ????????????????????? ??????????????????.'
                };

                // Show the alert
                this.showAlert = true;
            }
            return;
        }

        if(this.signUpForm.value.channel === 'none'){

            this.alert = {
                type   : 'error',
                message: '??????????????? ??????????????????.'
            };

            // Show the alert
            this.showAlert = true;
            return;
        }

        // ??????????????? ??????
        this._authService.checkBusinessNumber(this.signUpForm.value.businessNumber)
            .subscribe(
                (response) => {
                    if(response.status !== 'success'){
                        // Set the alert
                        this.alert = {
                            type   : 'error',
                            message: '???????????? ????????? ?????? ?????? ????????????????????? ?????????. ?????? ??????????????????.'
                        };
                        this.showAlert = true;
                        this.showStep1 = true;
                        return;
                    }else{
                        // ????????? ????????? ?????? ?????? ?????? ????????? ??????
                        // ??????????????? ????????? ????????? ????????? ????????? ??????????????? ????????????
                        // ????????? ???????????? ??? ???????????? ??????
                        // Disable the form
                        this.signUpForm.disable();

                        // Hide the alert
                        this.showAlert = false;

                        this._authService.signUpTemp(this.signUpForm.value)
                            .subscribe(
                                // eslint-disable-next-line @typescript-eslint/no-shadow
                                (response) => {
                                    console.log(response);
                                    if(response.status === 'SUCCESS'){
                                        this.showStep1 = false;
                                        this.showStep2 = true;
                                        this.signUpForm.enable();
                                    }else{
                                        this.showStep1 = true;
                                        this.showStep2 = false;
                                        this.signUpForm.enable();

                                        this.alert = {
                                            type   : 'error',
                                            message: response.msg
                                        };

                                        // Show the alert
                                        this.showAlert = true;
                                    }
                                    // Navigate to the confirmation required page
                                    // this._router.navigateByUrl('/confirmation-required');
                                },
                                // eslint-disable-next-line @typescript-eslint/no-shadow
                                (err) => {
                                    //console.log(err);
                                    // Set the alert
                                    this.alert = {
                                        type   : 'error',
                                        message: '?????? ????????? ??????????????? ?????????. ??????????????? ?????????????????????.'
                                    };

                                    // Show the alert
                                    this.showAlert = true;
                                    // Re-enable the form
                                    this.signUpForm.disable();

                                    // Reset the form
                                    this.signUpNgForm.resetForm();
                                }
                            );

                        // // ?????? ??????
                        // this._authService.subscriptionFee(this.signUpForm.value.businessNumber)
                        //     .subscribe(
                        //         // eslint-disable-next-line @typescript-eslint/no-shadow
                        //         (response) => {
                        //             if(response.status !== 'success'){
                        //                 console.log('??????');
                        //                 if(!this.isMobile){
                        //                     this._matDialog.open(SubscriptionFeeComponent, {
                        //                         autoFocus: false,
                        //                         disableClose: true,
                        //                         maxHeight: '80vh',
                        //                         data     : {
                        //                             data: this.signUpForm.getRawValue()
                        //                         },
                        //                     });
                        //                 }else{
                        //                     const d = this._matDialog.open(SubscriptionFeeComponent, {
                        //                         autoFocus: false,
                        //                         width: 'calc(100% - 50px)',
                        //                         maxWidth: '100vw',
                        //                         maxHeight: '80vh',
                        //                         data     : {
                        //                             data: this.signUpForm.getRawValue()
                        //                         },
                        //                         disableClose: true
                        //                     });
                        //                     const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                        //                         if (size.matches) {
                        //                             d.updateSize('calc(100vw - 10px)','');
                        //                         } else {
                        //                             // d.updateSize('calc(100% - 50px)', '');
                        //                         }
                        //                     });
                        //                     d.afterClosed().subscribe(() => {
                        //                         smallDialogSubscription.unsubscribe();
                        //                     });
                        //                 }
                        //                 return;
                        //             }else{
                        //                 console.log('??????');
                        //                 return;
                        //                 // Sign up
                        //                 this._authService.signUpTemp(this.signUpForm.value)
                        //                     .subscribe(
                        //                         // eslint-disable-next-line @typescript-eslint/no-shadow
                        //                         (response) => {
                        //                             if(response.status === 'SUCCESS'){
                        //                                 this.showStep1 = false;
                        //                                 this.showStep2 = true;
                        //                                 this.signUpForm.enable();
                        //                             }
                        //                             // Navigate to the confirmation required page
                        //                             // this._router.navigateByUrl('/confirmation-required');
                        //                         },
                        //                         // eslint-disable-next-line @typescript-eslint/no-shadow
                        //                         (err) => {
                        //                             // Set the alert
                        //                             this.alert = {
                        //                                 type   : 'error',
                        //                                 message: '?????? ????????? ??????????????? ?????????. ??????????????? ?????????????????????.'
                        //                             };
                        //
                        //                             // Show the alert
                        //                             this.showAlert = true;
                        //                             // Re-enable the form
                        //                             this.signUpForm.enable();
                        //
                        //                             // Reset the form
                        //                             this.signUpNgForm.resetForm();
                        //                         }
                        //                     );
                        //
                        //             }
                        //         });
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
                            message: '??????????????? ???????????? ????????????.'
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
                            message: '??????????????? ????????? ???????????????.'
                        };
                        this.showAlert = true;
                    }else{
                        this.alert = {
                            type   : 'error',
                            message: '??????????????? ??????????????????.'
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
     * ?????????????????? ??????
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
     * ???????????? ??????
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
    //  * ?????????????????? ??????
    //  */
    // checkBusinessNumber(): void
    // {
    //     console.log('check ??????????????????');
    //     console.log(this.signUpForm.value.businessNumber);
    // }
}
