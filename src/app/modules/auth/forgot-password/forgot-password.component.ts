import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { fuseAnimations } from '@teamplat/animations';
import { FuseAlertType } from '@teamplat/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import {Router} from "@angular/router";

@Component({
    selector     : 'auth-forgot-password',
    templateUrl  : './forgot-password.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class AuthForgotPasswordComponent implements OnInit
{
    @ViewChild('forgotPasswordNgForm') forgotPasswordNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    forgotPasswordForm: FormGroup;
    userForm: FormGroup;
    showAlert: boolean = false;
    showStep1: boolean = true;
    showStep2: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _authService: AuthService,
        private _formBuilder: FormBuilder
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
        this.forgotPasswordForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            phone: ['', Validators.required],
        });

        // Create the userForm
        this.userForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            phone     : ['', Validators.required],
            randomNumber : ['']
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Send the reset link
     */
    sendResetLink(): void
    {
        //test
        this.showStep1 = false;
        this.showStep2 = true;

        // Return if the form is invalid
        if ( this.forgotPasswordForm.invalid )
        {
            return;
        }

        // Disable the form
        this.forgotPasswordForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Forgot password
        this._authService.forgotPassword(this.forgotPasswordForm.get('email').value)
            .pipe(
                finalize(() => {

                    // Re-enable the form
                    this.forgotPasswordForm.enable();

                    // Reset the form
                    this.forgotPasswordNgForm.resetForm();

                    // Show the alert
                    this.showAlert = true;
                })
            )
            .subscribe(
                (response) => {

                    // Set the alert
                    this.alert = {
                        type   : 'success',
                        message: '해당 이메일로 비밀번호 변경 링크를 발송하였습니다. 이메일 링크를 확인해주세요.'
                    };
                },
                (response) => {

                    // Set the alert
                    this.alert = {
                        type   : 'error',
                        message: '가입하신 이메일 정보를 찾을 수 없습니다. 다시 확인해 주세요.'
                    };
                }
            );
    }

    sendRandomValue(): void {
        this._router.navigate(['reset-password']);
    }

    sendSms(): void {

    }

}
