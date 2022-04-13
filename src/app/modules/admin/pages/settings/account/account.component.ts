import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnInit,
    Renderer2,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {SessionStore} from '../../../../../core/session/state/session.store';
import {CommonCode, FuseUtilsService} from '@teamplat/services/utils';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {Crypto} from '@teamplat/providers/common/crypto';
import {Common} from '@teamplat/providers/common/common';
import {FunctionService} from  '../../../../../../@teamplat/services/function';
import {postcode} from "../../../../../../assets/js/postCode";
import {geodata} from "../../../../../../assets/js/geoCode";

@Component({
    selector       : 'settings-account',
    templateUrl    : './account.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsAccountComponent implements OnInit
{
    @ViewChild('daum_popup', { read: ElementRef, static: true }) popup: ElementRef;
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
        private _renderer: Renderer2,
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
                // disabled: this.isEdit
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
            iv: [],
            representName: [],
            address: [],
            addressX: [],
            addressY: [],
            addressZoneNo: [],
            businessCondition: [],
            businessCategory: [],
            phoneNumber: [],
            fax: [],
        });
        //console.log(this._sessionStore.getValue().udiSupplyAutoDt);
        if(this._sessionStore.getValue().userType === 'UG10'){
            this.isAdmin = true;
        }

        this._common.sendData(this.userForm.getRawValue(),'/v1/api/auth/user-info-detail')
            .subscribe((response: any) => {
                if(response.data[0].phoneNumber === '0'){
                    response.data[0].phoneNumber = '';
                }else if(response.data[0].phoneNumber === ''){
                    response.data[0].phoneNumber = '';
                }else{
                    response.data[0].phoneNumber = '0' + response.data[0].phoneNumber;
                }

                if(response.data[0].fax === '0'){
                    response.data[0].fax = '';
                }else if(response.data[0].fax === ''){
                    response.data[0].fax = '';
                }else{
                    response.data[0].fax = '0' + response.data[0].fax;
                }

                this.userForm.patchValue(response.data[0]);
            });
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

                if(response.status === 'SUCCESS'){
                    this._common.sendData(this.userForm.getRawValue(),'/v1/api/auth/update-user-info-detail')
                        .subscribe((a: any) => {
                            this.alertMessage(a);
                        });
                }else{

                    this.alertMessage(response);
                }

            });
    }


    saveUdiInfo(): void {

        this._common.sendData(this.userForm.getRawValue(),'/v1/api/auth/update-udi-info')
            .subscribe((response: any) => {
                this.alertMessage(response);
            });
    }


    alertMessage(param: any): void {
        if (param.status !== 'SUCCESS') {
            this._functionService.cfn_alert(param.msg);
        } else {
            //this.backPage();
            this._functionService.cfn_alert('정상적으로 처리되었습니다.');
            this._sessionStore.update(param.data);
        }
    }

    openDaumPopup(): void
    {
        let geoValue;
        postcode(this._renderer, this.popup.nativeElement, (data: any) => {
            geodata(data.address, (result: any) => {
                this.userForm.patchValue({'address': result.road_address.address_name});
                this.userForm.patchValue({'addressX': result.road_address.x});
                this.userForm.patchValue({'addressY': result.road_address.y});
                this.userForm.patchValue({'addressZoneNo': result.road_address.zone_no});
            });
        });
    }

    closeDaumPopup(): void
    {
        this._renderer.setStyle(this.popup.nativeElement, 'display', 'none');
    }
}
