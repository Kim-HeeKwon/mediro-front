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
import {takeUntil} from "rxjs/operators";
import {Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ManagesService} from "../manages.service";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {FunctionService} from "../../../../../../@teamplat/services/function";
import {TeamPlatConfirmationService} from "../../../../../../@teamplat/services/confirmation";
import {CommonCode, FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {DeviceDetectorService} from "ngx-device-detector";
import {FuseAlertType} from "../../../../../../@teamplat/components/alert";
import {CommonPopupItemsComponent} from "../../../../../../@teamplat/components/common-popup-items";
import {Manages} from "../manages.types";

@Component({
    selector       : 'dms-manages-email',
    templateUrl    : './manages-email.component.html',
    styleUrls: ['./manages-email.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class ManagesEmailComponent implements OnInit, OnDestroy
{
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );

    month: CommonCode[] = null;
    year: CommonCode[] = null;
    isMobile: boolean = false;
    selectedForm: FormGroup;
    showAlert: boolean = false;
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    rows: any;
    searchForm: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public matDialogRef: MatDialogRef<ManagesEmailComponent>,
        public _matDialogPopup: MatDialog,
        private _managesService: ManagesService,
        private _formBuilder: FormBuilder,
        private _codeStore: CodeStore,
        private _functionService: FunctionService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _utilService: FuseUtilsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver,
    ) {
        this.isMobile = this._deviceService.isMobile();
        this.month = _utilService.commonValue(_codeStore.getValue().data, 'MONTH');
        this.year = _utilService.commonValue(_codeStore.getValue().data, 'YEAR');

        this.rows = data.rows;
        this.searchForm = data.searchForm;
    }
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        console.log(this.rows);
        console.log(this.searchForm);
        this.selectedForm = this._formBuilder.group({
            year: [''],
            month: [''],
            account: [''],
            accountNm: [{value: '', disabled: true}],
            email: ['',[Validators.required]],
        });

        this.selectedForm.patchValue(this.searchForm);
        this.selectedForm.controls['year'].disable();
        this.selectedForm.controls['month'].disable();
    }

    suplyEmail() {

        if(!this.selectedForm.invalid) {
            this.showAlert = false;

            const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
                title: '',
                message: '전송하시겠습니까?',
                icon: this._formBuilder.group({
                    show: true,
                    name: 'heroicons_outline:check-circle',
                    color: 'accent'
                }),
                actions: this._formBuilder.group({
                    confirm: this._formBuilder.group({
                        show: true,
                        label: '전송',
                        color: 'accent'
                    }),
                    cancel: this._formBuilder.group({
                        show: true,
                        label: '닫기'
                    })
                }),
                dismissible: true
            }).value);

            confirmation.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        this.rows = this.headerDataSet(this.rows);
                        this._managesService.sendEmail(this.rows)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((manage: any) => {
                                this._functionService.cfn_loadingBarClear();
                                this._functionService.cfn_alertCheckMessage(manage);
                                // Mark for check
                                this.matDialogRef.close();
                                this._changeDetectorRef.markForCheck();
                            });
                    }
                });
        }else{
            // Set the alert
            this.alert = {
                type   : 'error',
                message: '이메일 주소는 필수입니다.'
            };
            // Show the alert
            this.showAlert = true;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: Manages[]) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < sendData.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            sendData[i].year = this.selectedForm.controls['year'].value;
            sendData[i].month = this.selectedForm.controls['month'].value;
            sendData[i].email = this.selectedForm.controls['email'].value;
        }

        return sendData;
    }

    openAccountSearch() {
        if (!this.isMobile) {

            const popup = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup: 'P$_ALL_ACCOUNT',
                    headerText: '거래처 조회',
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });

            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        this.selectedForm.patchValue({'account': result.accountCd});
                        this.selectedForm.patchValue({'accountNm': result.accountNm});
                        this.selectedForm.patchValue({'email': result.email});
                        this._changeDetectorRef.markForCheck();
                    }
                });
        } else {
            const popup = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup: 'P$_ALL_ACCOUNT',
                    headerText: '거래처 조회'
                },
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });

            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    popup.updateSize('calc(100vw - 10px)', '');
                }
            });
            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        smallDialogSubscription.unsubscribe();
                        this.selectedForm.patchValue({'account': result.accountCd});
                        this.selectedForm.patchValue({'accountNm': result.accountNm});
                        this.selectedForm.patchValue({'email': result.email});
                    }
                });
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
}
