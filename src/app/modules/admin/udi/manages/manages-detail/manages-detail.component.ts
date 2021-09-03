import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, Inject,
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
import {ItemsService} from "../../../basic-info/items/items.service";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {CommonCode, FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {DeviceDetectorService} from "ngx-device-detector";
import {ManagesService} from "../manages.service";
import {takeUntil} from "rxjs/operators";
import {TeamPlatConfirmationService} from "../../../../../../@teamplat/services/confirmation";
import moment from "moment";
import {FunctionService} from "../../../../../../@teamplat/services/function";

@Component({
    selector       : 'manages-detail',
    templateUrl    : './manages-detail.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class ManagesDetailComponent implements OnInit, OnDestroy
{
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );

    isMobile: boolean = false;
    selectedForm: FormGroup;
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    suplyTypeCode: CommonCode[] = null;
    suplyFlagCode: CommonCode[] = null;
    showAlert: boolean = false;
    is_edit: boolean = false;
    minDate: string;
    maxDate: string;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public matDialogRef: MatDialogRef<ManagesDetailComponent>,
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
        this.suplyTypeCode = _utilService.commonValueFilter(_codeStore.getValue().data,'SUPLYTYPECODE',['ALL']);
        this.suplyFlagCode = _utilService.commonValue(_codeStore.getValue().data,'SUPLYFLAGCODE');
        this.isMobile = this._deviceService.isMobile();
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.selectedForm = this._formBuilder.group({
            suplyFlagCode: [{value: '',disabled:true}, [Validators.required]], // 공급구분
            suplyTypeCode: ['', [Validators.required]], // 공급형태
            stdCode : [{value: '',disabled:true}, [Validators.required]],
            udiDiCode : [{value: '',disabled:true}, [Validators.required]],
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
            suplyQty : [{value: '',disabled:true}],
            suplyUntpc : [''],
            suplyAmt : [{value: '',disabled:true}],
            remark : [''],
            bcncCobTypeName : [''],
            bcncCode : [''],
            bcncEntpAddr : [''],
            bcncEntpName : [''],
            bcncHptlCode : [''],
            bcncTaxNo : [''],
            cobTypeName : [''],
            dvyfgCobTypeName : [''],
            dvyfgEntpAddr : [''],
            dvyfgEntpName : [''],
            dvyfgHptlCode : [''],
            dvyfgPlaceBcncCode : [''],
            dvyfgTaxNo : [''],
            isDiffDvyfg : [''],
            meddevItemSeq : [''],
            no : [''],
            packQuantity : [{value: '',disabled:true}],
            rtngudFlagCode : [''],
            seq : [''],
            suplyContSeq : [''],
            suplyContStdmt : [''],
            totalCnt : [''],
            udiDiSeq : [''],
            grade : [{value: '',disabled:true}],
            active: [false]  // cell상태
        });


        if(this.data !== (null || undefined)){
            this.selectedForm.patchValue(
                this.data
            );
            const momentVariable = moment(this.selectedForm.getRawValue().suplyDate, 'YYYY-MM-DD');
            const stringvalue = momentVariable.format('YYYY-MM-DD');
            this.selectedForm.patchValue({'suplyDate': stringvalue});

            this.is_edit = true;

            const yearVariable = moment(this.selectedForm.getRawValue().suplyContStdmt, 'YYYY');
            const year = yearVariable.format('YYYY');
            const monthVariable = moment(this.selectedForm.getRawValue().suplyContStdmt, 'YYYYMM');
            const month = monthVariable.format('MM');

            this.minDate = year + '-' + month + '-' + '01';
            this.maxDate = year + '-' + month + '-' + new Date(Number(year), Number(month), 0).getDate();
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
                message: '수정되었습니다.'
            };
            // Show the alert
            this.showAlert = true;
            this._managesService.getHeader(0,100,'','asc',{});
        }
    }

    alertValueSettingMessage(param: any): void
    {
        //console.log(param);

        this.selectedForm.patchValue({'udiDiSeq': ''});
        this.selectedForm.patchValue({'typeName': ''});
        this.selectedForm.patchValue({'meddevItemSeq': ''});
        this.selectedForm.patchValue({'seq': ''});
        this.selectedForm.patchValue({'entpName': ''});
        this.selectedForm.patchValue({'itemName': ''});
        this.selectedForm.patchValue({'meaClassNo': ''});
        this.selectedForm.patchValue({'permitNo': ''});
        this.selectedForm.patchValue({'packQuantity': ''});
        this.selectedForm.patchValue({'brandName': ''});
        this.selectedForm.patchValue({'grade': ''});

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
                message: '고유식별자(UDI-DI) 검증 완료'
            };
            this.selectedForm.patchValue({'udiDiSeq': param.data[0].udiDiSeq});
            this.selectedForm.patchValue({'typeName': param.data[0].typeName});
            this.selectedForm.patchValue({'meddevItemSeq': param.data[0].meddevItemSeq});
            this.selectedForm.patchValue({'seq': param.data[0].seq});
            this.selectedForm.patchValue({'entpName': param.data[0].entpName});
            this.selectedForm.patchValue({'itemName': param.data[0].itemName});
            this.selectedForm.patchValue({'meaClassNo': param.data[0].meaClassNo});
            this.selectedForm.patchValue({'permitNo': param.data[0].permitNo});
            this.selectedForm.patchValue({'packQuantity': param.data[0].packQuantity});
            this.selectedForm.patchValue({'brandName': param.data[0].brandName});
            this.selectedForm.patchValue({'grade': param.data[0].grade});
            // Show the alert
            this.showAlert = true;
        }

        this.changeStdCode();
    }

    udiDiCodeChain(): void{
        //console.log(this.selectedForm.getRawValue().udiDiCode);

        this._managesService.getUdiDiCodeInfo(this.selectedForm.getRawValue())
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((manages: any) => {
                //console.log(manages);
                this.alertValueSettingMessage(manages);
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    udiPiCodeChain(): void{
        this.changeStdCode();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    suplyUpdate() {
        if(!this.selectedForm.invalid){
            const confirmation = this._teamPlatConfirmationService.open({
                title  : '',
                message: '수정하시겠습니까?',
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

                        //console.log(this.selectedForm.getRawValue());
                        //this.matDialogRef.close();
                        //return;

                        const sendData = [];
                        sendData.push(this.selectedForm.getRawValue());
                        this._managesService.updateSupplyInfo(sendData)
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
            // Set the alert
            this.alert = {
                type   : 'error',
                message: '필수값을 입력해주세요.'
            };

            // Show the alert
            this.showAlert = true;
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    changeStdCode(){
        let udiDiCode = this.selectedForm.getRawValue().udiDiCode;
        if(udiDiCode !== ''){
            udiDiCode = '(01)'+ udiDiCode;
        }
        const udiPiCode = this.selectedForm.getRawValue().udiPiCode;

        let changeUdiPiCode = '';
        const list = ['(11)', '(17)', '(10)', '(21)'];
        let lotNo;
        let manufYm;
        let useTmlmt;
        let itemSeq;
        list.forEach((check: any) => {

            const chk = check;
            let result = '';
            const idx = udiPiCode.indexOf(chk, 0);
            if(idx >= 0){
                let lastIndex = udiPiCode.indexOf('(', idx + 1);
                if(lastIndex >= 0){
                    lastIndex = udiPiCode.indexOf('(', idx + 1);
                }else{
                    lastIndex = udiPiCode.length;
                }
                result = udiPiCode.substring(idx, lastIndex)
                    .replace('(' + chk + ')','');

                if(chk === '(10)'){
                    lotNo = result;
                }else if(chk === '(11)'){
                    manufYm = result;
                }else if(chk === '(17)'){
                    useTmlmt = result;
                }else if(chk === '(21)'){
                    itemSeq = result;
                }
            }
        });

        if(lotNo !== undefined){
            changeUdiPiCode += lotNo;
        }else{
            lotNo = '';
        }
        if(itemSeq !== undefined){
            changeUdiPiCode += itemSeq;
        }else{
            itemSeq = '';
        }
        if(manufYm !== undefined){
            changeUdiPiCode += manufYm;
        }else{
            manufYm = '';
        }
        if(useTmlmt !== undefined){
            changeUdiPiCode += useTmlmt;
        }else{
            useTmlmt = '';
        }

        this.selectedForm.patchValue({'lotNo': lotNo.replace('(' + '10' + ')','')});
        this.selectedForm.patchValue({'itemSeq': itemSeq.replace('(' + '21' + ')','')});
        this.selectedForm.patchValue({'manufYm': manufYm.replace('(' + '11' + ')','')});
        this.selectedForm.patchValue({'useTmlmt': useTmlmt.replace('(' + '17' + ')','')});
        this.selectedForm.patchValue({'stdCode': udiDiCode + changeUdiPiCode});

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    changePrice(): void{

        const suplyQty = this.selectedForm.getRawValue().suplyQty;
        const suplyUntpc = this.selectedForm.getRawValue().suplyUntpc;
        const suplyAmt = suplyQty * suplyUntpc;
        if(suplyAmt > 0){
            this.selectedForm.patchValue({'suplyAmt': suplyAmt});
        }else{
            this.selectedForm.patchValue({'suplyAmt': 0});
        }
    }
}
