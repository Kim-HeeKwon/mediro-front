import {Component, OnInit, ViewChild, ViewEncapsulation} from "@angular/core";
import {fuseAnimations} from "../../../../../@teamplat/animations";
import {FormBuilder, FormGroup, NgForm, Validators} from "@angular/forms";
import {FuseAlertType} from "../../../../../@teamplat/components/alert";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../../core/auth/auth.service";
import {CookieService} from "ngx-cookie-service";
import {SessionStore} from "../../../../core/session/state/session.store";

@Component({
    selector     : 'adm-auth-sign-in',
    templateUrl  : './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class SignInComponent implements OnInit
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
        private _formBuilder: FormBuilder,
        private _authService: AuthService,
        private _router: Router,
        private cookieService: CookieService,
        private _sessionStore: SessionStore,
    )
    {
    }

    ngOnInit(): void {
        // Create the form
        this.signInForm = this._formBuilder.group({
            email     : ['', [Validators.required, Validators.email]],
            password  : ['', Validators.required],
            rememberMe: [''],
            userGroup: ['ADMIN']
        });
    }

    admSignIn() {

        //this._router.navigateByUrl('/admin/user/user');
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
                    }else{

                        // Re-enable the form
                        this.signInForm.enable();

                        // Reset the form
                        this.signInNgForm.resetForm();

                        // Set the alert
                        this.alert = {
                            type   : 'error',
                            message: '관리자가 아닙니다. 다시 확인해주세요.'
                        };

                        // Show the alert
                        this.showAlert = true;
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
                        message: '이메일 또는 패스워드가 일치하지 않습니다.'
                    };

                    // Show the alert
                    this.showAlert = true;
                }
            );
    }
}
