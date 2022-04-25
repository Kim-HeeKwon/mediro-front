import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from "@angular/core";
import {fuseAnimations} from "../../../../../../@teamplat/animations";
import {Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {FuseAlertType} from "../../../../../../@teamplat/components/alert";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ManagesService} from "../../../../dms/udi/manages/manages.service";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {FunctionService} from "../../../../../../@teamplat/services/function";
import {TeamPlatConfirmationService} from "../../../../../../@teamplat/services/confirmation";
import {FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {DeviceDetectorService} from "ngx-device-detector";
import {UserService} from "../user.service";
import {takeUntil} from "rxjs/operators";

@Component({
    selector       : 'user-break',
    templateUrl    : './user-break.component.html',
    styleUrls: ['./user-break.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class UserBreakComponent implements OnInit, OnDestroy
{
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    isMobile: boolean = false;
    showAlert: boolean = false;
    breakForm: FormGroup;
    userList: any;
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public matDialogRef: MatDialogRef<UserBreakComponent>,
        public _matDialogPopup: MatDialog,
        private _managesService: ManagesService,
        private _formBuilder: FormBuilder,
        private _codeStore: CodeStore,
        private _userService: UserService,
        private _functionService: FunctionService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _utilService: FuseUtilsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver,
    ) {
        this.userList = data.select;
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        this.breakForm = this._formBuilder.group({
            breakReason : [{value: '',disabled:false}, [Validators.required]], // 탈퇴사유
            breakDate: [{value: '', disabled: false}, [Validators.required]], //탈퇴일자
        });
    }

    userInfoBreak() {
        if(!this.breakForm.invalid){
            const confirmation = this._teamPlatConfirmationService.open({
                title: '',
                message: '탈퇴하시겠습니까?',
                actions: {
                    confirm: {
                        label: '확인'
                    },
                    cancel: {
                        label: '닫기'
                    }
                }
            });
            confirmation.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        const rows = this.headerDataSet(this.userList);
                        this._userService.breakUserInfo(rows)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((user: any) => {
                                this._functionService.cfn_loadingBarClear();
                                this.alertMessage(user);
                                this._changeDetectorRef.markForCheck();
                            });
                    }
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();

        }else{
            // Set the alert
            this.alert = {
                type   : 'error',
                message: '필수값을 입력해주세요.'
            };

            // Show the alert
            this.showAlert = true;
        }
    }

    alertMessage(param: any): void {
        if (param.status === 'SUCCESS') {
            this._functionService.cfn_alert('정상적으로 처리되었습니다.');
            this.matDialogRef.close();
        } else {
            this._functionService.cfn_alert(param.msg);
        }
    }

    headerDataSet(userList: any) {
        for (let i = 0; i < userList.length; i++) {
            userList[i].breakReason = this.breakForm.controls['breakReason'].value;
            userList[i].breakDate = this.breakForm.controls['breakDate'].value;

            if(this.breakForm.getRawValue().breakDate.value === '' ||
                this.breakForm.getRawValue().breakDate === undefined ||
                this.breakForm.getRawValue().breakDate === null ||
                this.breakForm.getRawValue().breakDate === ''){
                userList[i].breakDate = '';
            }else{
                userList[i].breakDate = this.breakForm.controls['breakDate'].value;
            }
        }
        return userList;
    }
}
