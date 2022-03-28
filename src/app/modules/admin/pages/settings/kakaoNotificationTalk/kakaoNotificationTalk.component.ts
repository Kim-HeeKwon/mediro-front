import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from "@angular/core";
import {Router} from "@angular/router";
import {TeamPlatConfirmationService} from "../../../../../../@teamplat/services/confirmation";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SessionStore} from "../../../../../core/session/state/session.store";
import {FunctionService} from "../../../../../../@teamplat/services/function";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {Common} from "../../../../../../@teamplat/providers/common/common";
import {DeviceDetectorService} from "ngx-device-detector";

@Component({
    selector       : 'settings-kakaoNotificationTalk',
    templateUrl    : './kakaoNotificationTalk.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsKakaoNotificationTalkComponent implements OnInit
{
    isMobile: boolean = false;
    list: any = [];
    kakaoForm: FormGroup;
    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _sessionStore: SessionStore,
        private _functionService: FunctionService,
        private _codeStore: CodeStore,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private _common: Common
    )
    {
        this.isMobile = this._deviceService.isMobile();
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Create the form
        // Form 생성
        this.kakaoForm = this._formBuilder.group({
            ESTIMATE        : [false],
            ORDER        : [false],
        });

        const param = {
            mId: this._sessionStore.getValue().businessNumber
        };

        this._common.sendData(param,'/v1/api/kakaoNotificationTalk/header-list')
            .subscribe((responseData: any) => {
                if(!this._common.gfn_isNull(responseData.data)){
                    this.list = responseData.data;

                    this.list.forEach((l) => {

                        const kakaoSend = Boolean(l.kakaoSend);
                        l.kakaoSend = kakaoSend;
                    });

                    console.log(this.list);
                    this.kakaoForm.patchValue(this.list);

                    this._changeDetectorRef.markForCheck();
                }
            });
    }

    save() {

    }
}
