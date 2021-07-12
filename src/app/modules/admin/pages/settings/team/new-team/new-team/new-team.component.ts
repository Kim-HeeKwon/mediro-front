import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, Inject,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {Subject, throwError} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FuseAlertType} from '@teamplat/components/alert';
import {fuseAnimations} from '@teamplat/animations';
import {ItemSearchComponent} from '@teamplat/components/item-search';
import {CommonCode, FuseUtilsService} from '@teamplat/services/utils';
import {Crypto} from "../../../../../../../../@teamplat/providers/common/crypto";

@Component({
    selector       : 'new-team',
    templateUrl    : './new-team.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class NewTeamComponent implements OnInit, OnDestroy
{
    selectedItemForm: FormGroup;
    userForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    showAlert: boolean = false;
    itemGrades: any[] = [
        {
            id: 'UG10',
            name: 'ADMIN'
        },
        {
            id: 'UG20',
            name: 'WORKER'
        }];
    is_edit:boolean = false;
    itemUnit: CommonCode[] = [];
    itemStandard: CommonCode[] = [];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public matDialogRef: MatDialogRef<NewTeamComponent>,
        public _matDialogPopup: MatDialog,
        private _cryptoJson: Crypto,
        private _formBuilder: FormBuilder,
        private _utilService: FuseUtilsService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        console.log(this.data.teamData);
        this.userForm = this._formBuilder.group({
            id: [this.data.teamData.id, [Validators.required, Validators.email]],
            name: ['', [Validators.required]],
            email: [''],
            businessNumber: [''],
            businessName: [''],
            userType: [''],
            phone:  [ '', [Validators.required]],
            password:[''],
            passphrase: [],
            salt: [],
            iv: []
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    addTeamMember(): void
    {
        if(!this.userForm.invalid){
            this.showAlert = false;
            //console.log(this.selectedItemForm.getRawValue());
            let strJson = this._cryptoJson.getStringCryto(this.userForm.getRawValue().password);

            while (strJson.ciphertext.indexOf(' ') !== -1 || strJson.ciphertext.indexOf('+') !== -1){
                strJson = this._cryptoJson.getStringCryto(this.userForm.getRawValue().password);
            }
            strJson.ciphertext = encodeURIComponent(strJson.ciphertext);
            this.userForm.patchValue({password:strJson.ciphertext});
            this.userForm.patchValue({passphrase:strJson.passPhrase});
            this.userForm.patchValue({salt:strJson.salt});
            this.userForm.patchValue({iv:strJson.iv});
            this.userForm.patchValue({email:this.userForm.getRawValue().id});

            console.log(this.userForm.getRawValue());
        }else{
            // Set the alert
            this.alert = {
                type   : 'error',
                message: '아이디와 이름 전화번호를 입력해주세요.'
            };

            // Show the alert
            this.showAlert = true;
        }
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
            this.alert = {
                type   : 'success',
                message: '등록완료 하였습니다.'
            };
            // Show the alert
            this.showAlert = true;
        }
    }

    supplierSearch(): void
    {
        console.log('clisk');
    }
}
