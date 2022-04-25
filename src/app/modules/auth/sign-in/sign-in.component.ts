import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@teamplat/animations';
import { FuseAlertType } from '@teamplat/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { CookieService } from 'ngx-cookie-service';
import {SessionStore} from "../../../core/session/state/session.store";

@Component({
    selector     : 'auth-sign-in',
    templateUrl  : './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class AuthSignInComponent implements OnInit
{
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    signInForm: FormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private cookieService: CookieService,
        private _sessionStore: SessionStore,
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
        this.signInForm = this._formBuilder.group({
            email     : ['', [Validators.required, Validators.email]],
            password  : ['', Validators.required],
            rememberMe: [''],
            userGroup: ['']
        });

        if(this.cookieService.get('remeberMe') === 'Y'){
            const cookieEmail = this.cookieService.get('email');
            this.signInForm.patchValue({email:cookieEmail});
            this.signInForm.patchValue({rememberMe:true});
        }

        //this.signInForm.patchValue({'email' : 'test@naver.com'});
        //this.signInForm.patchValue({'password' : 'test@naver.com'});

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void
    {
        // Return if the form is invalid
        if ( this.signInForm.invalid )
        {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign in
        this._authService.signIn(this.signInForm.value)
            .subscribe(
                (response) => {
                    // ID Cookies Setting
                    this.cookieService.set( 'remeberMe', 'Y' );
                    this.cookieService.set( 'email', this.signInForm.value.email );

                    const id = localStorage.getItem('id');
                    const userGroup = localStorage.getItem('userGroup');

                    if(userGroup === 'ADMIN'){
                        this._router.navigateByUrl('/admin/user/user');

                    }else if(id === 'test@naver.com'){
                        this._router.navigateByUrl('/monitoring/dashboards');
                    }else{
                        //첫 로그인 유저 패스원드 강제 입력
                        //console.log(this._sessionStore.getValue());
                        if(response.resultD.paymentBasicInfoCnt < 1 ||
                            response.resultD.paymentCardInfoCnt < 1){
                            this._router.navigateByUrl('/pages/settings/plan-billing');
                        }else{
                            if(this._sessionStore.getValue().initYn === 'Y'){
                                this._router.navigateByUrl('/pages/settings/security');
                                //this._router.navigateByUrl('/monitoring/dashboards');
                            }else{
                                // Set the redirect url.
                                // The '/signed-in-redirect' is a dummy url to catch the request and redirect the user
                                // to the correct page after a successful sign in. This way, that url can be set via
                                // routing file and we don't have to touch here.
                                const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';

                                // Navigate to the redirect url
                                this._router.navigateByUrl(redirectURL);
                            }
                        }
                    }

                },
                (response) => {

                    // Re-enable the form
                    this.signInForm.enable();

                    // Reset the form
                    this.signInNgForm.resetForm();

                    // Set the alert
                    this.alert = {
                        type   : 'error',
                        message: response
                    };

                    // Show the alert
                    this.showAlert = true;
                }
            );
    }
}
