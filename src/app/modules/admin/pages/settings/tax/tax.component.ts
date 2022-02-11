import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnInit,
    Renderer2,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Common} from "../../../../../../@teamplat/providers/common/common";
import {SessionStore} from "../../../../../core/session/state/session.store";
import {Crypto} from "../../../../../../@teamplat/providers/common/crypto";
import {TeamPlatConfirmationService} from "../../../../../../@teamplat/services/confirmation";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {FunctionService} from "../../../../../../@teamplat/services/function";
import {postcode} from "../../../../../../assets/js/postCode";
import {geodata} from "../../../../../../assets/js/geoCode";
import {environment} from "../../../../../../environments/environment";

@Component({
    selector       : 'settings-tax',
    templateUrl    : './tax.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsTaxComponent implements OnInit
{
    joinOk: boolean = false;
    taxForm: FormGroup;
    isEdit: boolean = true;
    isAdmin: boolean = false;
    @ViewChild('daum_popup', { read: ElementRef, static: true }) popup: ElementRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _renderer: Renderer2,
        private _formBuilder: FormBuilder,
        private _common: Common,
        private _functionService: FunctionService,
        private _sessionStore: SessionStore,
        private _cryptoJson: Crypto,
        private _teamPlatConfirmationService: TeamPlatConfirmationService
    )
    {
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.taxForm = this._formBuilder.group({
            corpNum: [{
                value: this._sessionStore.getValue().businessNumber,
                disabled: this.isEdit
            }],
            ceoname: [''],
            corpName: [{
                value: this._sessionStore.getValue().businessName,
                disabled: this.isEdit
            }],
            addr: [{
                value: '',
                //disabled: this.isEdit
            }],
            bizType: [{
                value: '',
                //disabled: this.isEdit
            }],
            bizClass: [{
                value: '',
                //disabled: this.isEdit
            }],
            id: ['',[Validators.required,
                Validators.minLength(8),
                Validators.maxLength(20)]],
            password  : ['',[Validators.required,
                Validators.minLength(8),
                Validators.maxLength(20)]],
            name: [''],
            email: [this._sessionStore.getValue().email, Validators.email],
            hp:  ['0' + this._sessionStore.getValue().phone],
            fax: [],
            tel: ['0' + this._sessionStore.getValue().phone],

        });

        if(this._sessionStore.getValue().userType === 'UG10'){
            this.isAdmin = true;
        }

        this.taxForm.patchValue({'ceoname': ''});
        this.taxForm.patchValue({'name': ''});
        this.taxForm.patchValue({'addr': ''});
        this.taxForm.patchValue({'bizType': ''});
        this.taxForm.patchValue({'bizClass': ''});

        this.taxForm.patchValue({'fax': ''});

        if(this._sessionStore.getValue().popBillId){
            this.taxForm.patchValue({'id': this._sessionStore.getValue().popBillId});
            this.taxForm.get('id').disable();
            this.joinOk = true;
            this.rtnInfo();
        }

    }

    rtnInfo(): void{
        this._common.sendDataChgUrl(this.taxForm.getRawValue(),environment.serverTaxUrl + '/v1/api/calculate/tax/getCorpInfo')
            .subscribe((response: any) => {
                if(response.status === 'SUCCESS'){
                    this.taxForm.patchValue(response.data[0]);
                    //this.taxForm.get('addr').disable();
                    //this.taxForm.get('bizClass').disable();
                    //this.taxForm.get('bizType').disable();
                    //this.taxForm.get('ceoname').disable();
                    //this.taxForm.get('corpName').disable();
                }
                //this._sessionStore.update(response.data);
            });

        this._common.sendDataChgUrl(this.taxForm.getRawValue(),environment.serverTaxUrl + '/v1/api/calculate/tax/getContactInfo')
            .subscribe((response: any) => {
                if(response.status === 'SUCCESS'){

                    this.taxForm.patchValue({'name': response.data[0].personName});
                    this.taxForm.patchValue({'email': response.data[0].email});
                    this.taxForm.patchValue({'hp': response.data[0].hp});
                    this.taxForm.patchValue({'fax': response.data[0].fax});
                    this.taxForm.patchValue({'tel': response.data[0].tel});

                }
                //this._sessionStore.update(response.data);
            });
    }

    joinMember(): void {

        const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
            title      : '',
            message    : '등록하시겠습니까?',
            icon       : this._formBuilder.group({
                show : true,
                name : 'heroicons_outline:user-circle',
                color: 'primary'
            }),
            actions    : this._formBuilder.group({
                confirm: this._formBuilder.group({
                    show : true,
                    label: '등록',
                    color: 'accent'
                }),
                cancel : this._formBuilder.group({
                    show : true,
                    label: '닫기'
                })
            }),
            dismissible: true
        }).value);

        confirmation.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if(result){
                    this._common.sendDataChgUrl(this.taxForm.getRawValue(),environment.serverTaxUrl + '/v1/api/calculate/tax/joinMember')
                        .subscribe((response: any) => {
                            this.cfn_alertCheckMessage(response);
                        });
                }
            });


    }

    updateCorpInfo(): void {

        const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
            title      : '',
            message    : '회사 정보를 변경하시겠습니까?',
            icon       : this._formBuilder.group({
                show : true,
                name : 'heroicons_outline:user-circle',
                color: 'primary'
            }),
            actions    : this._formBuilder.group({
                confirm: this._formBuilder.group({
                    show : true,
                    label: '변경',
                    color: 'accent'
                }),
                cancel : this._formBuilder.group({
                    show : true,
                    label: '닫기'
                })
            }),
            dismissible: true
        }).value);

        confirmation.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if(result){
                    this._common.sendDataChgUrl(this.taxForm.getRawValue(),environment.serverTaxUrl + '/v1/api/calculate/tax/updateCorpInfo')
                        .subscribe((response: any) => {
                            this.cfn_alertCheckMessage(response);
                        });
                }
            });
    }



    updateContact(): void {
        const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
            title      : '',
            message    : '담당자 정보를 변경하시겠습니까?',
            icon       : this._formBuilder.group({
                show : true,
                name : 'heroicons_outline:user-circle',
                color: 'primary'
            }),
            actions    : this._formBuilder.group({
                confirm: this._formBuilder.group({
                    show : true,
                    label: '변경',
                    color: 'accent'
                }),
                cancel : this._formBuilder.group({
                    show : true,
                    label: '닫기'
                })
            }),
            dismissible: true
        }).value);

        confirmation.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if(result){
                    this._common.sendDataChgUrl(this.taxForm.getRawValue(),environment.serverTaxUrl + '/v1/api/calculate/tax/updateContact')
                        .subscribe((response: any) => {
                            this.cfn_alertCheckMessage(response);
                        });
                }
            });
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    cfn_alertCheckMessage(param: any, redirectUrl?: string): void
    {
        if(param.status !== 'SUCCESS'){

            const icon = 'information-circle';
            // Setup config form
            this._functionService.configForm = this._formBuilder.group({
                title      : '',
                message    : param.msg,
                icon       : this._formBuilder.group({
                    show : true,
                    name : 'heroicons_outline:' + icon,
                    color: 'accent'
                }),
                actions    : this._formBuilder.group({
                    confirm: this._formBuilder.group({
                        show : false,
                        label: '',
                    }),
                    cancel : this._formBuilder.group({
                        show : true,
                        label: '닫기'
                    })
                }),
                dismissible: true
            });
            const confirmation = this._teamPlatConfirmationService.open(this._functionService.configForm.value);
        }else{
            this._functionService.cfn_alert('정상적으로 처리되었습니다.','check-circle');
            this._sessionStore.update({popBillId: this.taxForm.getRawValue().id});
            this.taxForm.get('id').disable();
            this.joinOk = true;
            this.rtnInfo();
        }
    }

    getTaxCertURL(): void {
        this._common.sendDataChgUrl(this.taxForm.getRawValue(),environment.serverTaxUrl + '/v1/api/calculate/tax/getTaxCertURL')
            .subscribe((param: any) => {
                if(param.status !== 'SUCCESS'){

                    const icon = 'information-circle';
                    // Setup config form
                    this._functionService.configForm = this._formBuilder.group({
                        title      : '',
                        message    : param.msg,
                        icon       : this._formBuilder.group({
                            show : true,
                            name : 'heroicons_outline:' + icon,
                            color: 'accent'
                        }),
                        actions    : this._formBuilder.group({
                            confirm: this._formBuilder.group({
                                show : false,
                                label: '',
                            }),
                            cancel : this._formBuilder.group({
                                show : true,
                                label: '닫기'
                            })
                        }),
                        dismissible: true
                    });
                    const confirmation = this._teamPlatConfirmationService.open(this._functionService.configForm.value);
                }else{
                    window.open(param.data[0].url, '인증서 등록','top=50,left=200,width=1100,height=700');
                }
            });
    }

    openDaumPopup(): void
    {
        let geoValue;
        postcode(this._renderer, this.popup.nativeElement, (data: any) => {
            geodata(data.address, (result: any) => {
                this.taxForm.patchValue({'addr': result.road_address.address_name});
            });
        });
    }

    closeDaumPopup(): void
    {
        this._renderer.setStyle(this.popup.nativeElement, 'display', 'none');
    }
}
