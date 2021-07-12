import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {SessionStore} from "../../../../../core/session/state/session.store";
import {CommonCode, FuseUtilsService} from "@teamplat/services/utils";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {Crypto} from "@teamplat/providers/common/crypto";
import {Common} from "@teamplat/providers/common/common";

@Component({
    selector       : 'settings-account',
    templateUrl    : './account.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsAccountComponent implements OnInit
{
    accountForm: FormGroup;
    userForm: FormGroup;

    userType: CommonCode[] = [];
    is_edit:Boolean = true;

    isAdmin:Boolean = false;
    /**
     * Constructor
     */
    constructor(
        private _sessionStore: SessionStore,
        private _utilService: FuseUtilsService,
        private _cryptoJson: Crypto,
        private _codeStore: CodeStore,
        private _common: Common,
        private _formBuilder: FormBuilder
    )
    {
        this.userType = _utilService.commonValue(_codeStore.getValue().data,'USER_GROUP');
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.userForm = this._formBuilder.group({
            // id: [this._sessionStore.getValue().id],
            id: [{
                value: this._sessionStore.getValue().id,
                disabled: this.is_edit
            }],
            name: [this._sessionStore.getValue().name],
            email: [this._sessionStore.getValue().email, Validators.email],
            businessNumber: [{
                value: this._sessionStore.getValue().businessNumber,
                disabled: this.is_edit
            }],
            businessName: [{
                value: this._sessionStore.getValue().businessName,
                disabled: this.is_edit
            }],
            userType: [{
                value: this._sessionStore.getValue().userType,
                disabled: this.is_edit
            }],
            phone:  [ '0' + this._sessionStore.getValue().phone],
            udiClientId: [this._sessionStore.getValue().udiClientId],
            udiClientSecret: [],
            passphrase: [],
            salt: [],
            iv: []
        });
        if(this._sessionStore.getValue().userType === 'UG10'){
            this.isAdmin = true;
        }
    }

    saveAccountInfo(): void {
        if(this.userForm.getRawValue().udiClientSecret === null || this.userForm.getRawValue().udiClientSecret === ''
            || this.userForm.getRawValue().udiClientSecret === undefined || this.userForm.getRawValue().udiClientSecret === 'null'){
        }else{
            let strJson = this._cryptoJson.getStringCryto(this.userForm.getRawValue().udiClientSecret);

            while (strJson.ciphertext.indexOf(' ') !== -1 || strJson.ciphertext.indexOf('+') !== -1){
                strJson = this._cryptoJson.getStringCryto(this.userForm.getRawValue().udiClientSecret);
            }

            strJson.ciphertext = encodeURIComponent(strJson.ciphertext);

            this.userForm.patchValue({udiClientSecret:strJson.ciphertext});
            this.userForm.patchValue({passphrase:strJson.passPhrase});
            this.userForm.patchValue({salt:strJson.salt});
            this.userForm.patchValue({iv:strJson.iv});
        }

        this._common.sendData(this.userForm.getRawValue(),'/v1/api/auth/update-user-info')
            .subscribe((response: any) => {
               this.userForm.patchValue({udiClientSecret:''});
               this._sessionStore.update(response.data);
            });
    }
}
