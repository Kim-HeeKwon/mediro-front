import {
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    ElementRef, Inject,
    OnDestroy,
    OnInit, Renderer2,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {fuseAnimations} from "../../../../../../@teamplat/animations";
import {Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CommonCode, FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {FuseAlertType} from "../../../../../../@teamplat/components/alert";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {AccountService} from "../../../basic-info/account/account.service";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {PopupStore} from "../../../../../core/common-popup/state/popup.store";
import {DeviceDetectorService} from "ngx-device-detector";
import {CommonUdiComponent} from "../../../../../../@teamplat/components/common-udi";
import {postcode} from "../../../../../../assets/js/postCode";
import {geodata} from "../../../../../../assets/js/geoCode";
import {takeUntil} from "rxjs/operators";
import {AccountData} from "../../../basic-info/account/account.types";
import {TeamPlatConfirmationService} from "../../../../../../@teamplat/services/confirmation";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector       : 'realgrid-detail',
    templateUrl    : './realgrid-detail.component.html',
    styleUrls      : ['./realgrid-detail.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class RealgridDetailComponent implements OnInit, OnDestroy
{
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    selectedAccount: AccountData | null = null;
    isMobile: boolean = false;
    @ViewChild('daum_popup', { read: ElementRef, static: true }) popup: ElementRef;
    selectedAccountForm: FormGroup;
    accountType: CommonCode[] = null;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    // eslint-disable-next-line @typescript-eslint/member-ordering
    showAlert: boolean = false;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    filterList: string[];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public matDialogRef: MatDialogRef<RealgridDetailComponent>,
        public _matDialogPopup: MatDialog,
        private _renderer: Renderer2,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _accountService: AccountService,
        private _formBuilder: FormBuilder,
        private _codeStore: CodeStore,
        private _popupStore: PopupStore,
        private _changeDetectorRef: ChangeDetectorRef,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver
    ) {
        this.filterList = ['ALL'];
        this.accountType = _utilService.commonValueFilter(_codeStore.getValue().data,'ACCOUNT_TYPE',this.filterList);
        this.isMobile = this._deviceService.isMobile();

        this.selectedAccount = data.selectedAccount;
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.selectedAccountForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // ?????????
            account: [{value:'',disabled:true}, [Validators.required]], // ?????????
            udiAccount: [''],
            udiHptlSymbl: [''],
            descr: ['', [Validators.required]],   // ????????? ???
            accountType: [{value:'',disabled:true}, [Validators.required]],   // ??????
            custBusinessNumber : [{value:'',disabled:true},[Validators.required]],
            custBusinessName: [''],
            representName: [''],
            businessCondition: [''],
            businessCategory: [''],
            address: [''],
            addressDetail: [''],
            addressX: [''],
            addressY: [''],
            addressZoneNo: [''],
            phoneNumber: [''],
            fax: [''],
            email: [''],
            active: [false]  // cell??????
        });

        if(this.selectedAccount !== null){
            this.selectedAccountForm.patchValue(
                this.selectedAccount
            );
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * ????????????
     */
    // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures,@typescript-eslint/explicit-function-return-type
    accountUpdate() {
        const accountData = this.selectedAccountForm.getRawValue();

        accountData.account = this.selectedAccount.account;
        accountData.accountType = this.selectedAccount.accountType;
        accountData.custBusinessNumber = this.selectedAccount.custBusinessNumber;
        this._accountService.updateAccount(accountData)
            .subscribe(
                (param: any) => {
                    if(param.status === 'SUCCESS'){
                        this.matDialogRef.close();
                    }

                },(response) => {
                });
    }
    /**
     * ??????
     */
    accountDelete(): void
    {
        const accountData = this.selectedAccountForm.getRawValue();

        accountData.account = this.selectedAccount.account;
        accountData.accountType = this.selectedAccount.accountType;
        accountData.custBusinessNumber = this.selectedAccount.custBusinessNumber;

        const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
            title      : '',
            message    : '?????????????????????????',
            icon       : this._formBuilder.group({
                show : true,
                name : 'heroicons_outline:exclamation',
                color: 'warn'
            }),
            actions    : this._formBuilder.group({
                confirm: this._formBuilder.group({
                    show : true,
                    label: '??????',
                    color: 'warn'
                }),
                cancel : this._formBuilder.group({
                    show : true,
                    label: '??????'
                })
            }),
            dismissible: true
        }).value);

        confirmation.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if (result) {
                    this._accountService.deleteAccount(accountData)
                        .subscribe(
                            (param: any) => {
                                if(param.status === 'SUCCESS'){
                                    this.matDialogRef.close();
                                }

                            },(response) => {
                            });
                }else{
                }
            });
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
                message: '???????????? ???????????????.'
            };
            // Show the alert
            this.showAlert = true;
            this._accountService.getAccount(0,10,'account','asc','');
        }
    }

    accountSearch(): void
    {
        if(!this.isMobile){
            const popupUdi =this._matDialogPopup.open(CommonUdiComponent, {
                data: {
                    headerText : '????????? ??????',
                    url : 'https://udiportal.mfds.go.kr/api/v1/company-info/bcnc',
                    searchList : ['companyName', 'taxNo', 'cobFlagCode'],
                    code: 'UDI_BCNC',
                    tail : false,
                    mediroUrl : 'bcnc/company-info',
                    tailKey : '',
                },
                autoFocus: false,
                maxHeight: '80vh',
                disableClose: true
            });
            popupUdi.afterClosed().subscribe((result) => {
                if(result){
                    this.selectedAccountForm.patchValue({'udiAccount': result.bcncCode});
                    this.selectedAccountForm.patchValue({'udiHptlSymbl': result.hptlSymbl});
                    this.selectedAccountForm.patchValue({'descr': result.companyName});
                    this.selectedAccountForm.patchValue({'businessCondition': result.bcncCobFlagCodeNm});
                    this.selectedAccountForm.patchValue({'businessCategory': result.bcncCobDetailName});
                    this.selectedAccountForm.patchValue({'representName': result.bossName});
                    this.selectedAccountForm.patchValue({'custBusinessName': result.companyName});

                    const taxNo = Number((result.taxNo).replace(/-/g,''));
                    const entpAddr = result.entpAddr.split(',');

                    let address = '';
                    if(entpAddr[0] !== undefined){
                        address = entpAddr[0];
                    }
                    let addressDetail = '';
                    if(entpAddr[1] !== undefined){
                        for(let i=1; i<entpAddr.length; i++){
                            addressDetail += entpAddr[i];
                        }
                    }

                    this.selectedAccountForm.patchValue({'address': address});
                    this.selectedAccountForm.patchValue({'addressDetail': addressDetail});
                    this.selectedAccountForm.patchValue({'account': taxNo === 0 ? '' : taxNo});
                    this.selectedAccountForm.patchValue({'custBusinessNumber': taxNo === 0 ? '' : taxNo});
                }
            });
        }else{
            const d = this._matDialogPopup.open(CommonUdiComponent, {
                data: {
                    headerText : '????????? ??????',
                    url : 'https://udiportal.mfds.go.kr/api/v1/company-info/bcnc',
                    searchList : ['companyName', 'taxNo', 'cobFlagCode'],
                    code: 'UDI_BCNC',
                    tail : false,
                    mediroUrl : 'bcnc/company-info',
                    tailKey : '',
                },
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    d.updateSize('calc(100vw - 10px)','');
                } else {
                    // d.updateSize('calc(100% - 50px)', '');
                }
            });
            d.afterClosed().subscribe((result) => {
                if(result){
                    this.selectedAccountForm.patchValue({'udiAccount': result.bcncCode});
                    this.selectedAccountForm.patchValue({'udiHptlSymbl': result.hptlSymbl});
                    this.selectedAccountForm.patchValue({'descr': result.companyName});
                    this.selectedAccountForm.patchValue({'businessCondition': result.bcncCobFlagCodeNm});
                    this.selectedAccountForm.patchValue({'businessCategory': result.bcncCobDetailName});
                    this.selectedAccountForm.patchValue({'representName': result.bossName});
                    this.selectedAccountForm.patchValue({'custBusinessName': result.companyName});

                    const taxNo = Number((result.taxNo).replace(/-/g,''));
                    const entpAddr = result.entpAddr.split(',');

                    let address = '';
                    if(entpAddr[0] !== undefined){
                        address = entpAddr[0];
                    }
                    let addressDetail = '';
                    if(entpAddr[1] !== undefined){
                        for(let i=1; i<entpAddr.length; i++){
                            addressDetail += entpAddr[i];
                        }
                    }

                    this.selectedAccountForm.patchValue({'address': address});
                    this.selectedAccountForm.patchValue({'addressDetail': addressDetail});
                    this.selectedAccountForm.patchValue({'account': taxNo === 0 ? '' : taxNo});
                    this.selectedAccountForm.patchValue({'custBusinessNumber': taxNo === 0 ? '' : taxNo});
                }
                smallDialogSubscription.unsubscribe();
            });
        }
    }

    openDaumPopup(): void
    {
        let geoValue;
        postcode(this._renderer, this.popup.nativeElement, (data: any) => {
            geodata(data.address, (result: any) => {
                this.selectedAccountForm.patchValue({'address': result.road_address.address_name});
                this.selectedAccountForm.patchValue({'addressX': result.road_address.x});
                this.selectedAccountForm.patchValue({'addressY': result.road_address.y});
                this.selectedAccountForm.patchValue({'addressZoneNo': result.road_address.zone_no});
            });
        });
    }

    closeDaumPopup(): void
    {
        this._renderer.setStyle(this.popup.nativeElement, 'display', 'none');
    }
}
