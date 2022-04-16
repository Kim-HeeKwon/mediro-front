import {ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CommonCode, FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {FuseAlertType} from "../../../../../../@teamplat/components/alert";
import {FunctionService} from "../../../../../../@teamplat/services/function";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {AccountService} from "../account.service";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {PopupStore} from "../../../../../core/common-popup/state/popup.store";
import {DeviceDetectorService} from "ngx-device-detector";
import {postcode} from '../../../../../../assets/js/postCode';
import {geodata} from '../../../../../../assets/js/geoCode';

@Component({
    selector       : 'dms-app-account-etc',
    templateUrl    : 'etc-account.component.html',
    styleUrls      : ['etc-account.component.scss']
})

// eslint-disable-next-line @typescript-eslint/naming-convention
export class EtcAccountComponent implements OnInit, OnDestroy
{

    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    isMobile: boolean = false;
    @ViewChild('daum_popup', { read: ElementRef, static: true }) popup: ElementRef;
    selectedAccountForm: FormGroup;
    accountType: CommonCode[] = null;
    cobFlagName: CommonCode[] = null;
    paymentTerms: CommonCode[] = null;

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
        private _functionService: FunctionService,
        public matDialogRef: MatDialogRef<EtcAccountComponent>,
        public _matDialogPopup: MatDialog,
        private _renderer: Renderer2,
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
        this.cobFlagName = _utilService.commonValueFilter(_codeStore.getValue().data,'COB_FLAG_NAME',this.filterList);
        this.paymentTerms = _utilService.commonValue(_codeStore.getValue().data,'PAYMENT_TERMS');
        this.isMobile = this._deviceService.isMobile();
    }

    /**
     * On init
     */
    ngOnInit(): void {
        this.selectedAccountForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            account: [{value:'',disabled:true}, [Validators.required]], // 거래처
            udiAccount: [''],
            udiHptlSymbl: [''],
            cobFlagType: [''],
            descr: ['', [Validators.required]],   // 거래처 명
            accountType: [{value:'CUST',disabled:true}, [Validators.required]],   // 유형
            custBusinessNumber : [''],
            custBusinessName: [''],
            representName: [''],
            businessCondition: [{value:'기타',disabled:true}],
            businessCategory: [''],
            address: [{value:'',disabled: false}, [Validators.required]],
            addressDetail: [''],
            addressX: [''],
            addressY: [''],
            addressZoneNo: [''],
            phoneNumber: [''],
            cellPhoneNumber: [''],
            fax: [''],
            email: [''],
            taxEmail: [''],
            manager: [''],
            managerCellPhoneNumber: [''],
            paymentTerms: [''],
            remark: [''],
            createUdiAccountCheck: [false],
            active: [false]  // cell상태
        });

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
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

    alertMessage(param: any): void
    {
        if(param.status === 'SUCCESS'){
            this.alert = {
                type   : 'success',
                message: '등록완료 하였습니다.'
            };
            // Show the alert
            this.showAlert = true;
            this._accountService.getAccount(0,40,'addDate','desc','');
        }else if (param.status === 'CANCEL') {

        }else{

            this.alert = {
                type   : 'error',
                message: param.msg
            };
            // Show the alert
            this.showAlert = true;
        }
    }

    accountCreate(): void
    {
        if(!this.selectedAccountForm.invalid){
            this.showAlert = false;
            this._accountService.createEtcAccount(this.selectedAccountForm.getRawValue()).subscribe((newAccount: any) => {

                this._functionService.cfn_loadingBarClear();

                this.alertMessage(newAccount);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        }else{
            // Set the alert
            this.alert = {
                type   : 'error',
                message: '거래처 명, 주소를 입력해주세요.'
            };
            // Show the alert
            this.showAlert = true;
        }
    }
    closeDaumPopup(): void
    {
        this._renderer.setStyle(this.popup.nativeElement, 'display', 'none');
    }
}
