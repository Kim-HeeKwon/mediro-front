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
            rememberMe: ['']
        });
    }

    admSignIn() {
        this._router.navigateByUrl('/admin/user/user');
    }
}
