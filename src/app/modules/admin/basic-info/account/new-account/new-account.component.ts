import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, ElementRef,
    OnDestroy,
    OnInit, Renderer2, ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {Observable, Subject, throwError} from 'rxjs';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FuseAlertType} from '@teamplat/components/alert';
import {fuseAnimations} from '@teamplat/animations';
import {AccountService} from '../account.service';
import {CommonCode, CommonPopup, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {PopupStore} from '../../../../../core/common-popup/state/popup.store';

import { postcode } from 'assets/js/postCode.js';
import { geodata } from 'assets/js/geoCode.js';
import {PopupComponent} from '../../../util/common/popup/popup.component';

declare let daum: any;

@Component({
    selector       : 'new-account',
    templateUrl    : './new-account.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class NewAccountComponent implements OnInit, OnDestroy
{
    @ViewChild('daum_popup', { read: ElementRef, static: true }) popup: ElementRef;
    selectedAccountForm: FormGroup;
    accountType: CommonCode[] = null;
    pAccount: CommonPopup[] = null;
    filterList: string[];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    // eslint-disable-next-line @typescript-eslint/member-ordering
    showAlert: boolean = false;

    constructor(
        public matDialogRef: MatDialogRef<NewAccountComponent>,
        public _matDialogPopup: MatDialog,
        private _renderer: Renderer2,
        private _accountService: AccountService,
        private _formBuilder: FormBuilder,
        private _codeStore: CodeStore,
        private _popupStore: PopupStore,
        private _changeDetectorRef: ChangeDetectorRef,
        private _utilService: FuseUtilsService
    ) {
        this.filterList = ['ALL'];
        this.accountType = _utilService.commonValueFilter(_codeStore.getValue().data,'ACCOUNT_TYPE', this.filterList);
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.selectedAccountForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            account: ['', [Validators.required]], // 고객사
            descr: ['', [Validators.required]],   // 고객사 명
            accountType: ['', [Validators.required]],   // 유형
            custBusinessNumber : [''],
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
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    accountCreate(): void
    {
        if(!this.selectedAccountForm.invalid){
            this.showAlert = false;
            this._accountService.createAccount(this.selectedAccountForm.getRawValue()).subscribe((newAccount: any) => {

                this.alertMessage(newAccount);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        }else{
            // Set the alert
            this.alert = {
                type   : 'error',
                message: '고객사와 고객사 명을 입력해주세요.'
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
            this._accountService.getAccount(0,10,'account','asc','');
        }
    }

    accountSearch(): void
    {
        const popup =this._matDialogPopup.open(PopupComponent, {
            data: {
                popup : 'P$_ACCOUNT'
            }
        });
        popup.afterClosed().subscribe((result) => {
            if(result){
                this.selectedAccountForm.patchValue({'account': result.accountCd});
                this.selectedAccountForm.patchValue({'descr': result.accountNm});
            }
        });
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
