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
import {CommonCode, FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ManagesNewService} from "./manages-new.service";
import {ManagesService} from "../manages.service";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {FunctionService} from "../../../../../../@teamplat/services/function";
import {TeamPlatConfirmationService} from "../../../../../../@teamplat/services/confirmation";
import {DeviceDetectorService} from "ngx-device-detector";
import {takeUntil} from "rxjs/operators";
import {CommonPopupItemsComponent} from "../../../../../../@teamplat/components/common-popup-items";

@Component({
    selector       : 'dms-manages-new',
    templateUrl    : './manages-new.component.html',
    styleUrls: ['./manages-new.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class ManagesNewComponent implements OnInit, OnDestroy
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
    month: CommonCode[] = null;
    year: CommonCode[] = null;
    suplyTypeCode: CommonCode[] = null;
    suplyFlagCode: CommonCode[] = null;
    is_edit: boolean = false;
    minDate: string;
    maxDate: string;
    validators: boolean = true;

    changeText: string = '';
    changeAccountText: string = '거래처';
    changeAccountHidden: boolean = true;
    changeIsDiffDvyfgHidden: boolean = true;
    changeDlvAccountHidden: boolean = true;
    suplyTypeCodeHidden: boolean = false;
    hidden: boolean = false;

    showAlert: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public matDialogRef: MatDialogRef<ManagesNewComponent>,
        public _matDialogPopup: MatDialog,
        private _managesNewService: ManagesNewService,
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
        this.month = _utilService.commonValue(_codeStore.getValue().data,'MONTH');
        this.year = _utilService.commonValueFilter(_codeStore.getValue().data,'YEAR',['2019','2020']);
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.selectedForm = this._formBuilder.group({
            year: [{value: ''}, [Validators.required]],
            month: [{value: ''}, [Validators.required]],
            suplyContStdmt: [{value: ''}],
            suplyFlagCode: [{value: ''}, [Validators.required]], // 공급구분
            suplyTypeCode: [{value: ''}], // 공급형태
            stdCode : [{value: ''}, [Validators.required]],
            udiDiCode : [{value: '',disabled:true}, [Validators.required]],
            udiPiCode : [{value: '',disabled:true}, [Validators.required]],
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
            bcncEntpName : [{value: '',disabled:true}],
            bcncHptlCode : [''],
            bcncTaxNo : [{value: '',disabled:true}],
            cobTypeName : [{value: '',disabled:true}],
            dvyfgCobTypeName : [{value: '',disabled:true}],
            dvyfgEntpAddr : [{value: '',disabled:true}],
            dvyfgEntpName : [{value: '',disabled:true}],
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
        this.selectedForm.patchValue({'stdCode': ''});
        this.selectedForm.patchValue({'udiDiCode': ''});
        this.selectedForm.patchValue({'udiPiCode': ''});
        this.changeAccountHidden = true;
        this.validators = true;


        /*if(this.data !== (null || undefined)){
            this.selectedForm.patchValue(
                this.data
            );
            const momentVariable = moment(this.selectedForm.getRawValue().suplyDate, 'YYYY-MM-DD');
            const stringvalue = momentVariable.format('YYYY-MM-DD');
            this.selectedForm.patchValue({'suplyDate': stringvalue});

            this.is_edit = true;
        }*/
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
            this.validators = true;
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
            this.validators = false;
            // Show the alert
            this.showAlert = true;
        }

        this.changeStdCode();
    }

    udiDiCodeChain(): void{
        //console.log(this.selectedForm.getRawValue().udiDiCode);
    }

    udiPiCodeChain(): void{
        this.changeStdCode();
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
                                    this._functionService.cfn_loadingBarClear();
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
                    message: '고유식별자(UDI-DI) 품목정보가 존재하지 않습니다.'
                };

                // Show the alert
                this.showAlert = true;
            }
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

        this.selectedForm.patchValue({'lotNo': lotNo.replace('(' + '10' + ')','')});
        this.selectedForm.patchValue({'itemSeq': itemSeq.replace('(' + '21' + ')','')});
        this.selectedForm.patchValue({'manufYm': manufYm.replace('(' + '11' + ')','')});
        this.selectedForm.patchValue({'useTmlmt': useTmlmt.replace('(' + '17' + ')','')});
        this.selectedForm.patchValue({'stdCode': udiDiCode + changeUdiPiCode});

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    changeSuplyFlagCode(): void{
        //거래처, 공급형태 필수
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        const suplyFlagCode = this.selectedForm.getRawValue().suplyFlagCode;
        if(suplyFlagCode === '1'){
            this.changeIsDiffDvyfgHidden = false;
        }else{
            this.selectedForm.patchValue({'isDiffDvyfg': false});
            this.changeIsDiffDvyfgHidden = true;
            this.changeDlvAccountHidden = true;
        }
        if(suplyFlagCode === '1'){
            this.changeText = '출고';
            this.changeAccountText = '공급받은 자(거래처)';
            this.changeAccountHidden = false;
            this.suplyTypeCodeHidden = false;
            this.hidden = false;
        }else if(suplyFlagCode === '2'){
            this.changeText = '반품';
            this.changeAccountText = '반품한 자(거래처)';
            this.changeAccountHidden = false;
            this.suplyTypeCodeHidden = true;
            this.hidden = true;
        }else if(suplyFlagCode === '3'){
            this.changeText = '폐기';
            this.changeAccountHidden = true;
            this.suplyTypeCodeHidden = true;
            this.hidden = true;
        }else if(suplyFlagCode === '4'){
            this.changeText = '임대';
            this.changeAccountText = '임대한 자(거래처)';
            this.changeAccountHidden = false;
            this.suplyTypeCodeHidden = false;
            this.hidden = true;
        }else if(suplyFlagCode === '5'){
            this.changeText = '회수';
            this.changeAccountText = '회수한 자(거래처)';
            this.changeAccountHidden = false;
            this.suplyTypeCodeHidden = true;
            this.hidden = true;
        }else{
            this.changeText = '';
            this.changeAccountHidden = true;
            this.suplyTypeCodeHidden = false;
            this.hidden = false;
        }
    }

    accountSearch(): void {
        if(!this.isMobile){
            const popup =this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup : 'P$_UDI_ACCOUNT',
                    headerText : '거래처 조회'
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });

            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if(result){
                        this.selectedForm.patchValue({'bcncCode': result.udiAccount});
                        this.selectedForm.patchValue({'bcncEntpAddr': result.address});
                        this.selectedForm.patchValue({'bcncEntpName': result.custBusinessName});
                        this.selectedForm.patchValue({'bcncTaxNo': result.custBusinessNumber});
                        this.selectedForm.patchValue({'cobTypeName': result.businessCondition});
                    }
                });
        }else{
            const d = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup : 'P$_UDI_ACCOUNT',
                    headerText : '거래처 조회'
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

    dlvAccountSearch(): void {
        if(!this.isMobile){
            const popup =this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup : 'P$_UDI_ACCOUNT',
                    headerText : '납품장소 조회'
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });

            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if(result){
                        this.selectedForm.patchValue({'dvyfgPlaceBcncCode': result.udiAccount});
                        this.selectedForm.patchValue({'dvyfgEntpAddr': result.address});
                        this.selectedForm.patchValue({'dvyfgEntpName': result.custBusinessName});
                        this.selectedForm.patchValue({'dvyfgTaxNo': result.custBusinessNumber});
                        this.selectedForm.patchValue({'dvyfgCobTypeName': result.businessCondition});
                    }
                });
        }else{
            const d = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup : 'P$_UDI_ACCOUNT',
                    headerText : '납품장소 조회'
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

    changeDate(): void{
        const year = this.selectedForm.getRawValue().year;
        const month = this.selectedForm.getRawValue().month;

        this.minDate = year + '-' + month + '-' + '01';
        this.maxDate = year + '-' + month + '-' + new Date(year, month, 0).getDate();
    }

    updateIsDiffDvyfg(): void {

        const isDiffDvyfg = this.selectedForm.getRawValue().isDiffDvyfg;

        if(isDiffDvyfg){
            this.changeDlvAccountHidden = false;
        }else{
            this.changeDlvAccountHidden = true;
        }
    }

    udiStdCode($event: any) {

        let udiCode = $event.target.value;
        if(udiCode === ''){

        }else{

            let lotNo;
            let manufYm;
            let useTmlmt;
            let itemSeq;
            let stdCode;

            if(udiCode.length < 17){
                this.failAlert();
                return;
            }

            const check_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
            if(check_kor.test(udiCode)){
                setTimeout(() =>{
                },100);
                // Set the alert
                this.alert = {
                    type   : 'error',
                    message: '한글은 입력할 수 없습니다.'
                };
                // Show the alert
                this.showAlert = true;
                return;
            }

            let udiDiCode;
            let udiPiCode;
            if(!udiCode.includes('(')){
                try{
                    udiDiCode = udiCode.substring(0, 16);
                    udiPiCode = '';
                    udiDiCode = '(' + udiDiCode.substring(0, 2) + ')' + udiDiCode.substring(2, 16);

                    let cutUdiPiCode = udiCode.substring(16, udiCode.length);

                    //값이 없을 때 까지
                    while(cutUdiPiCode !== ''){

                        if(cutUdiPiCode.substring(0, 2) === '11'){

                            manufYm = '(' + cutUdiPiCode.substring(0, 2) + ')' + cutUdiPiCode.substring(2, 8);
                            cutUdiPiCode = cutUdiPiCode.substring(8, cutUdiPiCode.length);

                        }else if(cutUdiPiCode.substring(0, 2) === '17'){

                            useTmlmt = '(' + cutUdiPiCode.substring(0, 2) + ')' + cutUdiPiCode.substring(2, 8);
                            cutUdiPiCode = cutUdiPiCode.substring(8, cutUdiPiCode.length);

                        }else if(cutUdiPiCode.substring(0, 2) === '10'){

                            const len = cutUdiPiCode.length;

                            if(len > 22){
                                lotNo = '(' + cutUdiPiCode.substring(0, 2) + ')' + cutUdiPiCode.substring(2, 22);
                                cutUdiPiCode = cutUdiPiCode.substring(22, cutUdiPiCode.length);
                            }else{
                                lotNo = '(' + cutUdiPiCode.substring(0, 2) + ')' + cutUdiPiCode.substring(2, cutUdiPiCode.length);
                                cutUdiPiCode = '';
                            }

                        }else if(cutUdiPiCode.substring(0, 2) === '21'){

                            const len = cutUdiPiCode.length;

                            if(len > 22){
                                itemSeq = '(' + cutUdiPiCode.substring(0, 2) + ')' + cutUdiPiCode.substring(2, 22);
                                cutUdiPiCode = cutUdiPiCode.substring(22, cutUdiPiCode.length);
                            }else{
                                itemSeq = '(' + cutUdiPiCode.substring(0, 2) + ')' + cutUdiPiCode.substring(2, cutUdiPiCode.length);
                                cutUdiPiCode = '';
                            }

                        }else{
                            break;
                        }
                    }

                    if(lotNo === undefined){
                        lotNo = '';
                    }
                    if(itemSeq === undefined){
                        itemSeq = '';
                    }

                    if(manufYm === undefined){
                        manufYm = '';
                    }else{
                        if(manufYm.replace('(' + '11' + ')','').length !== 6){
                            this._functionService.cfn_alert('제조연월이 잘못되었습니다. <br> 제조연월 형식은 (11)YYMMDD 입니다.');
                            return;
                        }
                    }

                    if(useTmlmt === undefined){
                        useTmlmt = '';
                    }else{
                        if(useTmlmt.replace('(' + '17' + ')','').length !== 6){
                            this._functionService.cfn_alert('유통기한이 잘못되었습니다. <br> 유통기한 형식은 (17)YYMMDD 입니다.');
                            return;
                        }
                    }

                    udiPiCode = manufYm + useTmlmt + lotNo + itemSeq;
                    udiCode = udiDiCode + udiPiCode;

                }catch (e){
                    this.failAlert();
                    return;
                }
            }

            const list = ['(01)', '(11)', '(17)', '(10)', '(21)'];
            list.forEach((check: any) => {

                const chk = check;
                let result = '';
                const idx = udiCode.indexOf(chk, 0);
                if(idx >= 0){
                    let lastIndex = udiCode.indexOf('(', idx + 1);
                    if(lastIndex >= 0){
                        lastIndex = udiCode.indexOf('(', idx + 1);
                    }else{
                        lastIndex = udiCode.length;
                    }
                    result = udiCode.substring(idx, lastIndex)
                        .replace('(' + chk + ')','');

                    if(chk === '(01)'){
                        stdCode = result;
                    }else if(chk === '(10)'){
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

            if(lotNo === undefined){
                lotNo = '';
            }
            if(itemSeq === undefined){
                itemSeq = '';
            }
            if(manufYm === undefined){
                manufYm = '';
            }else if(manufYm === ''){
                manufYm = '';
            }else{
                if(manufYm.replace('(' + '11' + ')','').length !== 6){
                    this._functionService.cfn_alert('제조연월이 잘못되었습니다. <br> 제조연월 형식은 (11)YYMMDD 입니다.');
                    return;
                }
            }
            if(useTmlmt === undefined){
                useTmlmt = '';
            }else if(useTmlmt === ''){
                useTmlmt = '';
            }else{
                if(useTmlmt.replace('(' + '17' + ')','').length !== 6){
                    this._functionService.cfn_alert('유통기한이 잘못되었습니다. <br> 유통기한 형식은 (17)YYMMDD 입니다.');
                    return;
                }
            }
            udiDiCode = stdCode;
            udiPiCode = manufYm + useTmlmt + lotNo + itemSeq;

            // console.log(udiDiCode);
            // console.log(udiPiCode);

            this.selectedForm.patchValue({'udiDiCode': udiDiCode});
            this.selectedForm.patchValue({'udiPiCode': udiPiCode});

            let udiDiCodeA = this.selectedForm.getRawValue().udiDiCode;

            if(udiDiCodeA.includes('(')){
                udiDiCodeA = udiDiCodeA.replace('(' + '01' + ')','');
                this.selectedForm.patchValue({'udiDiCode': udiDiCodeA});
                this._changeDetectorRef.markForCheck();
            }

            this._managesNewService.getUdiDiCodeInfo(this.selectedForm.getRawValue())
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((manages: any) => {
                    //console.log(manages);
                    this._functionService.cfn_loadingBarClear();
                    this.alertValueSettingMessage(manages);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        }
    }

    failAlert(){

        setTimeout(() =>{
            //this.selectedForm.patchValue({'stdCode': ''});
        },100);
        // Set the alert
        this.alert = {
            type   : 'error',
            message: '코드를 다시 입력해주세요. 올바른 형식이 아닙니다.'
        };
        // Show the alert
        this.showAlert = true;
    }
}
