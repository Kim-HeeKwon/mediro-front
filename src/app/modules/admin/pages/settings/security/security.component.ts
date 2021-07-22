import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Common} from '../../../../../../@teamplat/providers/common/common';
import {SessionStore} from '../../../../../core/session/state/session.store';
import {Crypto} from '../../../../../../@teamplat/providers/common/crypto';

@Component({
    selector       : 'settings-security',
    templateUrl    : './security.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsSecurityComponent implements OnInit
{
    securityForm: FormGroup;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _common: Common,
        private _sessionStore: SessionStore,
        private _cryptoJson: Crypto,
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
            newPassword      : ['',[Validators.required,Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9@$!%*#?&]+$/),
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

        //기존 패스워드 암호화
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

        // 기존 패스워드 검증작업 수행
        this._common.sendData(this.securityForm.getRawValue(),'/v1/api/auth/check-user-password')
            .subscribe((response: any) => {
                if(response.code === 'OK'){
                    // Same Pwd Check!!
                    //패스워드 Same check!!
                    if(this.securityForm.getRawValue().currentPassword === this.securityForm.getRawValue().newPassword)
                    {
                        alert('다른 패스워드를 입력해 주세요.');
                        return;
                    }
                    // 새로운 패스워드 적용

                    // 새로운 패스워드 암호화
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
                                alert('패스워드 변경 완료');
                            }
                        });

                }else{
                    // 기존 패스워드 검증실패
                    alert('기존 패스워드가 정확하지 않습니다.');
                }
            });

        // 새로운 패스워드
    }
}
