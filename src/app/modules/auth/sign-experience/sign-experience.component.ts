import {ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation} from "@angular/core";
import {fuseAnimations} from "../../../../@teamplat/animations";
import {Observable} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {FormBuilder, FormGroup, NgForm, Validators} from "@angular/forms";
import {FuseAlertType} from "../../../../@teamplat/components/alert";
import {MatDialog} from "@angular/material/dialog";
import {AuthService} from "../../../core/auth/auth.service";
import {Router} from "@angular/router";
import {DeviceDetectorService} from "ngx-device-detector";
import {CommonCode, FuseUtilsService} from "../../../../@teamplat/services/utils";
import {CodeStore} from "../../../core/common-code/state/code.store";
import {PrivacyComponent} from "../sign-experience/privacy/privacy.component";

@Component({
    selector     : 'auth-sign-experience',
    templateUrl  : './sign-experience.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class SignExperienceComponent implements OnInit
{
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild('signUpNgForm') signUpNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    signExperienceForm: FormGroup;
    showAlert: boolean = false;
    showStep1: boolean = true;

    isMobile: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _matDialog: MatDialog,
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _changeDetectorRef: ChangeDetectorRef,
        private _utilService: FuseUtilsService,
        private _codeStore: CodeStore,
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
        this.signExperienceForm = this._formBuilder.group({
                email     : ['', [Validators.required, Validators.email]],
                company   : ['', [Validators.required]],
                name      : ['', Validators.required],
                agreements: ['', Validators.requiredTrue],
                phone     : ['', Validators.required],
                select    : ['none', Validators.required],
            }
        );
    }

    experience() {
        // Return if the form is invalid
        if ( this.signExperienceForm.invalid )
        {
            if(this.signExperienceForm.controls.agreements.status === 'INVALID'){
                this.alert = {
                    type   : 'error',
                    message: '정보 입력 및 개인정보 수집에 동의를 해주세요.'
                };

                // Show the alert
                this.showAlert = true;
            }
            return;
        }

        if(this.signExperienceForm.getRawValue().select === 'none'){
            this.alert = {
                type   : 'error',
                message: '인지경로를 선택해주세요.'
            };

            // Show the alert
            this.showAlert = true;
            return;
        }

        this._authService.userExperience(this.signExperienceForm.getRawValue())
            .subscribe((newAccount: any) => {

            this.alertMessage(newAccount);

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
        // Hide the alert
        this.showAlert = false;
    }

    alertMessage(param: any): void
    {
        if(param.status !== 'SUCCESS'){
            this.alert = {
                type   : 'error',
                message: param.msg
            };
            // Show the alert
            this.showAlert = true;
        }else{
            // this.alert = {
            //     type   : 'success',
            //     message: '성공'
            // };
            // Show the alert
            this.showAlert = false;
            this._router.navigateByUrl('/sign-in');
        }
    }

    checkPrivacy() {
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
}
