import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from "@angular/core";
import {Router} from "@angular/router";
import {TeamPlatConfirmationService} from "../../../../../../@teamplat/services/confirmation";
import {FormBuilder} from "@angular/forms";
import {SessionStore} from "../../../../../core/session/state/session.store";
import {FunctionService} from "../../../../../../@teamplat/services/function";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {Common} from "../../../../../../@teamplat/providers/common/common";

@Component({
    selector       : 'settings-kakaoNotificationTalk',
    templateUrl    : './kakaoNotificationTalk.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KakaoNotificationTalkComponent implements OnInit
{
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
        private _common: Common
    )
    {
    }

    /**
     * On init
     */
    ngOnInit(): void
    {

    }
}
