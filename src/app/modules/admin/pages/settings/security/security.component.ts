import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Common} from '../../../../../../@teamplat/providers/common/common';
import {SessionStore} from '../../../../../core/session/state/session.store';
import {Crypto} from '../../../../../../@teamplat/providers/common/crypto';
import {TeamPlatConfirmationService} from "@teamplat/services/confirmation";

@Component({
    selector       : 'settings-security',
    templateUrl    : './security.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsSecurityComponent implements OnInit
{
    securityForm: FormGroup;
    configForm: FormGroup;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _common: Common,
        private _sessionStore: SessionStore,
        private _cryptoJson: Crypto,
        private _teamPlatConfirmationService: TeamPlatConfirmationService
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
        this.securityForm = this._formBuilder.group({
            currentPassword  : ['',[Validators.required,
                Validators.minLength(8),
                Validators.maxLength(20)]],
            newPassword      : ['',[Validators.required,Validators.pattern(/^(?=.*[a-z])(?=.*\d)[a-zA-Z0-9@$!%*#?&]+$/),
                Validators.minLength(8),
                Validators.maxLength(20)]],
            twoStep          : [true],
            askPasswordChange: [false],
            id        : [this._sessionStore.getValue().id],
            name: [this._sessionStore.getValue().name],
            email: [this._sessionStore.getValue().email],
            password: [],
            ciphertext: [],
            passPhrase: [],
            salt: [],
            iv: []
        });
    }

    changePassword(): void{
        //console.log(this.securityForm.getRawValue());

        if(this.securityForm.status === 'INVALID'){
            return;
        }

        //?????? ???????????? ?????????
        let strJson = this._cryptoJson.getStringCryto(this.securityForm.getRawValue().currentPassword);

        while (strJson.ciphertext.indexOf(' ') !== -1 || strJson.ciphertext.indexOf('+') !== -1){
            strJson = this._cryptoJson.getStringCryto(this.securityForm.getRawValue().currentPassword);
        }

        strJson.ciphertext = encodeURIComponent(strJson.ciphertext);

        this.securityForm.patchValue({ciphertext:strJson.ciphertext});
        this.securityForm.patchValue({passPhrase:strJson.passPhrase});
        this.securityForm.patchValue({salt:strJson.salt});
        this.securityForm.patchValue({iv:strJson.iv});
        this.securityForm.patchValue({password:this.securityForm.getRawValue().currentPassword});

        // ?????? ???????????? ???????????? ??????
        this._common.sendData(this.securityForm.getRawValue(),'/v1/api/auth/check-user-password')
            .subscribe((response: any) => {
                if(response.code === 'OK'){
                    // Same Pwd Check!!
                    //???????????? Same check!!
                    if(this.securityForm.getRawValue().currentPassword === this.securityForm.getRawValue().newPassword)
                    {
                        //alert('?????? ??????????????? ????????? ?????????.');

                        // Open the confirmation dialog
                        const confirmation = this._teamPlatConfirmationService.open({
                            title  : '?????? ????????????',
                            message: '?????? ??????????????? ????????? ?????????.',
                            actions: {
                                confirm: {
                                    label: '??????'
                                },
                                cancel: {
                                    show: false
                                }
                            }
                        });

                        return;
                    }
                    // ????????? ???????????? ??????

                    // ????????? ???????????? ?????????
                    let strJsonNew = this._cryptoJson.getStringCryto(this.securityForm.getRawValue().newPassword);

                    while (strJsonNew.ciphertext.indexOf(' ') !== -1 || strJsonNew.ciphertext.indexOf('+') !== -1){
                        strJsonNew = this._cryptoJson.getStringCryto(this.securityForm.getRawValue().newPassword);
                    }

                    strJsonNew.ciphertext = encodeURIComponent(strJsonNew.ciphertext);

                    this.securityForm.patchValue({ciphertext:strJsonNew.ciphertext});
                    this.securityForm.patchValue({passPhrase:strJsonNew.passPhrase});
                    this.securityForm.patchValue({salt:strJsonNew.salt});
                    this.securityForm.patchValue({iv:strJsonNew.iv});
                    this.securityForm.patchValue({password:this.securityForm.getRawValue().newPassword});

                    this._common.sendData(this.securityForm.getRawValue(),'/v1/api/auth/update-user-password')
                        .subscribe((responsePwd: any) => {
                            if(responsePwd.code === 'OK'){
                                alert('???????????? ?????? ??????');
                            }
                        });

                }else{
                    // ?????? ???????????? ????????????
                    alert('?????? ??????????????? ???????????? ????????????.');
                }
            });

        // ????????? ????????????
    }
}
