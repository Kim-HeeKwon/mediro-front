import {
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit, Renderer2,
    ViewChild,
} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {FuseAlertType} from '../../../../../../@teamplat/components/alert';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {AccountService} from '../account.service';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {PopupStore} from '../../../../../core/common-popup/state/popup.store';
import {DeviceDetectorService} from 'ngx-device-detector';
import {CommonUdiComponent} from '../../../../../../@teamplat/components/common-udi';
import {postcode} from '../../../../../../assets/js/postCode';
import {geodata} from '../../../../../../assets/js/geoCode';

declare let daum: any;

@Component({
    selector       : 'dms-app-account-new',
    templateUrl    : 'new-account.component.html',
    styleUrls      : ['new-account.component.scss']
})

// eslint-disable-next-line @typescript-eslint/naming-convention
export class NewAccountComponent implements OnInit, OnDestroy
{
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    isMobile: boolean = false;
    isProgressSpinner: boolean = false;
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
        public matDialogRef: MatDialogRef<NewAccountComponent>,
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
            descr: ['', [Validators.required]],   // 거래처 명
            accountType: [{value:'CUST',disabled:true}, [Validators.required]],   // 유형
            custBusinessNumber : ['',[Validators.required]],
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

    accountSearch(): void
    {
        if(!this.isMobile){
            const popupUdi =this._matDialogPopup.open(CommonUdiComponent, {
                data: {
                    headerText : '거래처 조회',
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
                    headerText : '거래처 조회',
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
            this._accountService.getAccount(0,10,'account','asc','');
        }
        this.isProgressSpinner = false;
    }

    accountCreate(): void
    {
        this.isProgressSpinner = true;
        if(!this.selectedAccountForm.invalid){
            this.showAlert = false;
            this.selectedAccountForm.patchValue({'account': this.selectedAccountForm.controls['custBusinessNumber'].value});
            this._accountService.createAccount(this.selectedAccountForm.getRawValue()).subscribe((newAccount: any) => {
                this.alertMessage(newAccount);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        }else{
            // Set the alert
            this.alert = {
                type   : 'error',
                message: '사업자 번호와 거래처 명, 유형을 입력해주세요.'
            };
            this.isProgressSpinner = false;
            // Show the alert
            this.showAlert = true;
        }
    }
    closeDaumPopup(): void
    {
        this._renderer.setStyle(this.popup.nativeElement, 'display', 'none');
    }
}
