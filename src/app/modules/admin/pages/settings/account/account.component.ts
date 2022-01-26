import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {SessionStore} from '../../../../../core/session/state/session.store';
import {CommonCode, FuseUtilsService} from '@teamplat/services/utils';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {Crypto} from '@teamplat/providers/common/crypto';
import {Common} from '@teamplat/providers/common/common';
import {FunctionService} from "../../../../../../@teamplat/services/function";

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
    udiSupplyAutoYn: CommonCode[] = [];
    udiSupplyAutoDt: CommonCode[] = [];
    isEdit: boolean = true;

    isAdmin: boolean = false;
    /**
     * Constructor
     */
    constructor(
        private _sessionStore: SessionStore,
        private _codeStore: CodeStore,
        private _functionService: FunctionService,
        private _utilService: FuseUtilsService,
        private _cryptoJson: Crypto,
        private _common: Common,
        private _formBuilder: FormBuilder
    )
    {
        this.userType = _utilService.commonValue(_codeStore.getValue().data,'USER_GROUP');
        this.udiSupplyAutoYn = _utilService.commonValue(_codeStore.getValue().data,'YN_FLAG');
        this.udiSupplyAutoDt = _utilService.commonValue(_codeStore.getValue().data,'UDI_SUP_DATE');
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
                disabled: this.isEdit
            }],
            name: [this._sessionStore.getValue().name],
            email: [this._sessionStore.getValue().email, Validators.email],
            businessNumber: [{
                value: this._sessionStore.getValue().businessNumber,
                disabled: this.isEdit
            }],
            businessName: [{
                value: this._sessionStore.getValue().businessName,
                disabled: this.isEdit
            }],
            userType: [{
                value: this._sessionStore.getValue().userType,
                disabled: this.isEdit
            }],
            phone:  [ '0' + this._sessionStore.getValue().phone],
            udiClientId: [this._sessionStore.getValue().udiClientId],
            udiClientSecret: [],
            udiSupplyAutoYn: [this._sessionStore.getValue().udiSupplyAutoYn],
            udiSupplyAutoDt: [this._sessionStore.getValue().udiSupplyAutoDt],
            passphrase: [],
            salt: [],
            iv: []
        });
        console.log(this._sessionStore.getValue().udiSupplyAutoDt);
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
               console.log(response.data);
               this._sessionStore.update(response.data);
            });
    }


    saveUdiInfo(): void {

        this._common.sendData(this.userForm.getRawValue(),'/v1/api/auth/update-udi-info')
            .subscribe((response: any) => {
                this.alertMessage(response);
            });
    }


    alertMessage(param: any): void {
        console.log(param);
        if (param.status !== 'SUCCESS') {
            this._functionService.cfn_alert(param.msg);
        } else {
            //this.backPage();
            this._functionService.cfn_alert('정상적으로 처리되었습니다.');
            this._sessionStore.update(param.data);
        }
    }
}
