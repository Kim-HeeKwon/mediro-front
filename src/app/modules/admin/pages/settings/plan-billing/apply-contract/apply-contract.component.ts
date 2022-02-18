import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from "@angular/core";
import {fuseAnimations} from "../../../../../../../@teamplat/animations";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Subject} from "rxjs";
import {FuseAlertType} from "../../../../../../../@teamplat/components/alert";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SessionStore} from "../../../../../../core/session/state/session.store";
import {CodeStore} from "../../../../../../core/common-code/state/code.store";
import {Common} from "../../../../../../../@teamplat/providers/common/common";
import {Crypto} from "../../../../../../../@teamplat/providers/common/crypto";
import {FuseUtilsService} from "../../../../../../../@teamplat/services/utils";

@Component({
    selector       : 'apply-contract',
    templateUrl    : './apply-contract.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class ApplyContractComponent implements OnInit, OnDestroy
{
    userForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    showAlert: boolean = false;
    is_edit:boolean = false;
    is_editAmt: boolean =false;

    form: any;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _sessionStore: SessionStore,
        private _codeStore: CodeStore,
        private _common: Common,
        public matDialogRef: MatDialogRef<ApplyContractComponent>,
        private _cryptoJson: Crypto,
        private _formBuilder: FormBuilder,
        private _utilService: FuseUtilsService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {
        this.form = data.data;
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.userForm = this._formBuilder.group({
            contractData: ['', [Validators.required]],
            company: ['', [Validators.required]],
            manager: ['', [Validators.required]],
            managerEmail: ['', [Validators.required]],
            managerPhone: ['', [Validators.required]],
            payGrade: ['', [Validators.required]],
            yearUser: ['', [Validators.required]],
            amt: [0],
        });
        this.userForm.patchValue(this.form);

        if(this.form.payGrade === 'customize'){
            this.userForm.patchValue({'amt' : 0});
            this.userForm.controls['amt'].enable();
        }else{
            this.userForm.patchValue({'amt' : 0});
            this.userForm.controls['amt'].disable();
        }
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

    applicationReception() {

        if ( this.userForm.invalid )
        {
            this.alert = {
                type   : 'error',
                message: '계약정보 입력 및 메디로 워크 정보를 선택해주세요.'
            };

            // Show the alert
            this.showAlert = true;
            return;
        }
        // this._common.sendData(this.userForm.getRawValue(),'/v1/api/auth/user-contract')
        //     .subscribe((response: any) => {
        //     });
    }

    payGradeChange() {
        console.log(this.userForm.getRawValue().payGrade);
        if(this.userForm.getRawValue().payGrade === 'customize'){
            this.userForm.patchValue({'amt' : 0});
            this.userForm.controls['amt'].enable();
        }else{

            this.userForm.patchValue({'amt' : 0});
            this.userForm.controls['amt'].disable();
        }
        this._changeDetectorRef.markForCheck();
    }
}
