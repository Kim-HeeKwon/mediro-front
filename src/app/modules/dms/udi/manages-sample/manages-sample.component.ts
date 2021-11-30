import {
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {fuseAnimations} from '../../../../../@teamplat/animations';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {takeUntil} from 'rxjs/operators';
import {ManagesNewService} from '../manages/manages-new/manages-new.service';
import {Observable, Subject} from 'rxjs';
import {CommonPopupItemsComponent} from '../../../../../@teamplat/components/common-popup-items';
import {MatDialog} from '@angular/material/dialog';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {TeamPlatConfirmationService} from '../../../../../@teamplat/services/confirmation';
import {FunctionService} from '../../../../../@teamplat/services/function';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {DeviceDetectorService} from 'ngx-device-detector';
import {SessionStore} from "../../../../core/session/state/session.store";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {Crypto} from "../../../../../@teamplat/providers/common/crypto";

@Component({
    selector       : 'dms-manages-sample',
    templateUrl    : 'manages-sample.component.html',
    styleUrls: ['manages-sample.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class ManagesSampleComponent implements OnInit, OnDestroy {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    selectedForm: FormGroup;
    userForm: FormGroup;
    minDate: string;
    maxDate: string;
    year: CommonCode[] = null;
    month: CommonCode[] = null;
    suplyTypeCode: CommonCode[] = null;
    suplyFlagCode: CommonCode[] = null;
    changeText: string = '';
    changeAccountText: string = '거래처';
    validators: boolean = true;
    isMobile: boolean = false;
    is_edit: boolean = false;
    changeAccountHidden: boolean = true;
    isEdit: boolean = true;
    changeIsDiffDvyfgHidden: boolean = true;
    changeDlvAccountHidden: boolean = true;
    suplyTypeCodeHidden: boolean = false;
    hidden: boolean = false;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _managesNewService: ManagesNewService,
        private _utilService: FuseUtilsService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef,
        public _matDialogPopup: MatDialog,
        private _codeStore: CodeStore,
        private _sessionStore: SessionStore,
        private _deviceService: DeviceDetectorService,
        private _formBuilder: FormBuilder,
        private _functionService: FunctionService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.suplyTypeCode = _utilService.commonValueFilter(_codeStore.getValue().data,'SUPLYTYPECODE',['ALL']);
        this.suplyFlagCode = _utilService.commonValue(_codeStore.getValue().data,'SUPLYFLAGCODE');
        this.isMobile = this._deviceService.isMobile();
        this.month = _utilService.commonValue(_codeStore.getValue().data,'MONTH');
        this.year = _utilService.commonValueFilter(_codeStore.getValue().data,'YEAR',['2019','2020']);
    }

    ngOnInit(): void {
        this.selectedForm = this._formBuilder.group({
            year: [{value: ''}, [Validators.required]],
            month: [{value: ''}, [Validators.required]],
            suplyContStdmt: [{value: ''}],
            suplyFlagCode: [{value: ''}, [Validators.required]], // 공급구분
            suplyTypeCode: [{value: ''}], // 공급형태
            stdCode : [{value: '',disabled:true}, [Validators.required]],
            udiDiCode : [{value: ''}, [Validators.required]],
            udiPiCode : [{value: ''}, [Validators.required]],
            entpName : [{value: '',disabled:true}],
            itemName : [{value: '',disabled:true}],
            meaClassNo : [{value: '',disabled:true}],
            permitNo : [{value: '',disabled:true}],
            typeName : [{value: '',disabled:true}],
            lotNo : [{value: '',disabled:true}],
            itemSeq : [{value: '',disabled:true}],
            manufYm : [{value: '',disabled:true}],
            useTmlmt : [{value: '',disabled:true}],
            suplyDate : [''],
            suplyQty : [''],
            indvdlzSuplyQty : [''],
            suplyUntpc : [''],
            suplyAmt : [''],
            remark : [''],
            bcncCobTypeName : [''],
            bcncCode : [{value: ''}],
            bcncEntpAddr : [{value: '',disabled:true}],
            bcncEntpName : [{value: '',disabled:false}],
            bcncHptlCode : [''],
            bcncTaxNo : [{value: '',disabled:true}],
            cobTypeName : [{value: '',disabled:true}],
            dvyfgCobTypeName : [{value: '',disabled:true}],
            dvyfgEntpAddr : [{value: '',disabled:true}],
            dvyfgEntpName : [''],
            dvyfgHptlCode : [''],
            dvyfgPlaceBcncCode : [{value: '',disabled:true}],
            dvyfgTaxNo : [{value: '',disabled:true}],
            isDiffDvyfg : [false],
            meddevItemSeq : [''],
            no : [''],
            packQuantity : [{value: '',disabled:true}],
            rtngudFlagCode : [''],
            seq : [''],
            suplyContSeq : [''],
            totalCnt : [''],
            udiDiSeq : [''],
            grade : [{value: '',disabled:true}],
            active: [false]  // cell상태
        });


        this.selectedForm.patchValue({'year': ''});
        this.selectedForm.patchValue({'month': ''});
        this.selectedForm.patchValue({'suplyTypeCode': ''});
        this.selectedForm.patchValue({'bcncCode': ''});
        this.selectedForm.patchValue({'udiDiCode': ''});
        this.selectedForm.patchValue({'udiPiCode': ''});
        this.changeAccountHidden = true;
        this.validators = true;
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    changeDate(): void {
        const year = this.selectedForm.getRawValue().year;
        const month = this.selectedForm.getRawValue().month;

        this.minDate = year + '-' + month + '-' + '01';
        this.maxDate = year + '-' + month + '-' + new Date(year, month, 0).getDate();
    }

    changeSuplyFlagCode(): void {
        //거래처, 공급형태 필수
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        const suplyFlagCode = this.selectedForm.getRawValue().suplyFlagCode;
        if (suplyFlagCode === '1') {
            this.changeIsDiffDvyfgHidden = false;
        } else {
            this.selectedForm.patchValue({'isDiffDvyfg': false});
            this.changeIsDiffDvyfgHidden = true;
            this.changeDlvAccountHidden = true;
        }
        if (suplyFlagCode === '1') {
            this.changeText = '출고';
            this.changeAccountText = '공급받은 자(거래처)';
            this.changeAccountHidden = false;
            this.suplyTypeCodeHidden = false;
            this.hidden = false;
        } else if (suplyFlagCode === '2') {
            this.changeText = '반품';
            this.changeAccountText = '반품한 자(거래처)';
            this.changeAccountHidden = false;
            this.suplyTypeCodeHidden = true;
            this.hidden = true;
        } else if (suplyFlagCode === '3') {
            this.changeText = '폐기';
            this.changeAccountHidden = true;
            this.suplyTypeCodeHidden = true;
            this.hidden = true;
        } else if (suplyFlagCode === '4') {
            this.changeText = '임대';
            this.changeAccountText = '임대한 자(거래처)';
            this.changeAccountHidden = false;
            this.suplyTypeCodeHidden = false;
            this.hidden = true;
        } else if (suplyFlagCode === '5') {
            this.changeText = '회수';
            this.changeAccountText = '회수한 자(거래처)';
            this.changeAccountHidden = false;
            this.suplyTypeCodeHidden = true;
            this.hidden = true;
        } else {
            this.changeText = '';
            this.changeAccountHidden = true;
            this.suplyTypeCodeHidden = false;
            this.hidden = false;
        }
    }

    udiDiCodeChain(): void {
        //console.log(this.selectedForm.getRawValue().udiDiCode);

        this._managesNewService.getUdiDiCodeInfo(this.selectedForm.getRawValue())
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((manages: any) => {
                //console.log(manages);
                // this.alertValueSettingMessage(manages);
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    changeStdCode() {
        // let udiDiCode = this.selectedForm.getRawValue().udiDiCode;
        // if (udiDiCode !== '') {
        //     udiDiCode = '(01)' + udiDiCode;
        // }
        // const udiPiCode = this.selectedForm.getRawValue().udiPiCode;
        //
        // let changeUdiPiCode = '';
        // const list = ['(11)', '(17)', '(10)', '(21)'];
        // let lotNo;
        // let manufYm;
        // let useTmlmt;
        // let itemSeq;
        // list.forEach((check: any) => {
        //
        //     const chk = check;
        //     let result = '';
        //     const idx = udiPiCode.indexOf(chk, 0);
        //     if (idx >= 0) {
        //         let lastIndex = udiPiCode.indexOf('(', idx + 1);
        //         if (lastIndex >= 0) {
        //             lastIndex = udiPiCode.indexOf('(', idx + 1);
        //         } else {
        //             lastIndex = udiPiCode.length;
        //         }
        //         result = udiPiCode.substring(idx, lastIndex)
        //             .replace('(' + chk + ')', '');
        //
        //         if (chk === '(10)') {
        //             lotNo = result;
        //         } else if (chk === '(11)') {
        //             manufYm = result;
        //         } else if (chk === '(17)') {
        //             useTmlmt = result;
        //         } else if (chk === '(21)') {
        //             itemSeq = result;
        //         }
        //     }
        // });
        //
        // if (lotNo !== undefined) {
        //     changeUdiPiCode += lotNo;
        // } else {
        //     lotNo = '';
        // }
        // if (itemSeq !== undefined) {
        //     changeUdiPiCode += itemSeq;
        // } else {
        //     itemSeq = '';
        // }
        // if (manufYm !== undefined) {
        //     changeUdiPiCode += manufYm;
        // } else {
        //     manufYm = '';
        // }
        // if (useTmlmt !== undefined) {
        //     changeUdiPiCode += useTmlmt;
        // } else {
        //     useTmlmt = '';
        // }
        //
        // this.selectedForm.patchValue({'lotNo': lotNo.replace('(' + '10' + ')', '')});
        // this.selectedForm.patchValue({'itemSeq': itemSeq.replace('(' + '21' + ')', '')});
        // this.selectedForm.patchValue({'manufYm': manufYm.replace('(' + '11' + ')', '')});
        // this.selectedForm.patchValue({'useTmlmt': useTmlmt.replace('(' + '17' + ')', '')});
        // this.selectedForm.patchValue({'stdCode': udiDiCode + changeUdiPiCode});
        //
        // // Mark for check
        // this._changeDetectorRef.markForCheck();
    }

    udiPiCodeChain(): void {
        this.changeStdCode();
    }

    accountSearch(): void {
        if (!this.isMobile) {
            const popup = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup: 'P$_UDI_ACCOUNT',
                    headerText: '거래처 조회'
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });

            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        this.selectedForm.patchValue({'bcncCode': result.udiAccount});
                        this.selectedForm.patchValue({'bcncEntpAddr': result.address});
                        this.selectedForm.patchValue({'bcncEntpName': result.custBusinessName});
                        this.selectedForm.patchValue({'bcncTaxNo': result.custBusinessNumber});
                        this.selectedForm.patchValue({'cobTypeName': result.businessCondition});
                    }
                });
        } else {
            const d = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup: 'P$_UDI_ACCOUNT',
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
                    d.updateSize('calc(100vw - 10px)', '');
                } else {
                    // d.updateSize('calc(100% - 50px)', '');
                }
            });
            d.afterClosed().subscribe((result) => {
                if (result) {
                    this.selectedForm.patchValue({'bcncCode': result.udiAccount});
                    this.selectedForm.patchValue({'bcncEntpAddr': result.address});
                    this.selectedForm.patchValue({'bcncEntpName': result.custBusinessName});
                    this.selectedForm.patchValue({'bcncTaxNo': result.custBusinessNumber});
                    this.selectedForm.patchValue({'cobTypeName': result.businessCondition});
                }
                smallDialogSubscription.unsubscribe();
            });
        }
    }

    updateIsDiffDvyfg(): void {

        const isDiffDvyfg = this.selectedForm.getRawValue().isDiffDvyfg;

        if (isDiffDvyfg) {
            this.changeDlvAccountHidden = false;
        } else {
            this.changeDlvAccountHidden = true;
        }
    }

    dlvAccountSearch(): void {
        if (!this.isMobile) {
            const popup = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup: 'P$_UDI_ACCOUNT',
                    headerText: '납품장소 조회'
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });

            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        this.selectedForm.patchValue({'dvyfgPlaceBcncCode': result.udiAccount});
                        this.selectedForm.patchValue({'dvyfgEntpAddr': result.address});
                        this.selectedForm.patchValue({'dvyfgEntpName': result.custBusinessName});
                        this.selectedForm.patchValue({'dvyfgTaxNo': result.custBusinessNumber});
                        this.selectedForm.patchValue({'dvyfgCobTypeName': result.businessCondition});
                    }
                });
        } else {
            const d = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup: 'P$_UDI_ACCOUNT',
                    headerText: '납품장소 조회'
                },
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    d.updateSize('calc(100vw - 10px)', '');
                } else {
                    // d.updateSize('calc(100% - 50px)', '');
                }
            });
            d.afterClosed().subscribe((result) => {
                if (result) {
                    this.selectedForm.patchValue({'dvyfgPlaceBcncCode': result.udiAccount});
                    this.selectedForm.patchValue({'dvyfgEntpAddr': result.address});
                    this.selectedForm.patchValue({'dvyfgEntpName': result.custBusinessName});
                    this.selectedForm.patchValue({'dvyfgTaxNo': result.custBusinessNumber});
                    this.selectedForm.patchValue({'dvyfgCobTypeName': result.businessCondition});
                }
                smallDialogSubscription.unsubscribe();
            });
        }
    }

    changePrice(): void {

        const suplyQty = this.selectedForm.getRawValue().suplyQty;
        const suplyUntpc = this.selectedForm.getRawValue().suplyUntpc;
        const suplyAmt = suplyQty * suplyUntpc;
        if (suplyAmt > 0) {
            this.selectedForm.patchValue({'suplyAmt': suplyAmt});
        } else {
            this.selectedForm.patchValue({'suplyAmt': 0});
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    suplyCreate() {
        if(!this.selectedForm.invalid){
            if(!this.validators){
                const confirmation = this._teamPlatConfirmationService.open({
                    title  : '',
                    message: '추가하시겠습니까?',
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
                        if(result){
                            const suplyContStdmt = this.selectedForm.controls['year'].value + this.selectedForm.controls['month'].value;
                            this.selectedForm.patchValue({'suplyContStdmt': suplyContStdmt});
                            //console.log(this.selectedForm.getRawValue());
                            //this.matDialogRef.close();
                            //return;
                            const sendData = [];
                            sendData.push(this.selectedForm.getRawValue());
                            this._managesNewService.createSupplyInfo(sendData)
                                .pipe(takeUntil(this._unsubscribeAll))
                                .subscribe((manage: any) => {
                                    this._functionService.cfn_alertCheckMessage(manage);
                                    // Mark for check
                                    this._changeDetectorRef.markForCheck();
                                });
                        }
                    });
                // Mark for check
                this._changeDetectorRef.markForCheck();
            }else{
                // this._functionService.cfn_alert('고유식별자(UDI-DI) 품목정보가 존재하지 않습니다.');
            }
        }else{
            // this._functionService.cfn_alert('필수값을 입력해주세요.');
        }
    }

}
