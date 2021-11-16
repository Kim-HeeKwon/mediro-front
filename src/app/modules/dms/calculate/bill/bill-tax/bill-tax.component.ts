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
import {ManagesService} from "../../../../dms/udi/manages/manages.service";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {BillService} from "../bill.service";
import {FunctionService} from "../../../../../../@teamplat/services/function";
import {TeamPlatConfirmationService} from "../../../../../../@teamplat/services/confirmation";
import {DeviceDetectorService} from "ngx-device-detector";
import {takeUntil} from "rxjs/operators";
import {Bill} from "../bill.types";

@Component({
    selector       : 'bill-tax',
    templateUrl    : './bill-tax.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class BillTaxComponent implements OnInit, OnDestroy
{
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );

    taxButton: string = 'save';
    taxCount: number = 0;
    isMobile: boolean = false;
    showAlert: boolean = false;
    detailList: any;
    taxForm: FormGroup;
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    issueType: CommonCode[] = null;
    chargeDirection: CommonCode[] = null;
    type: CommonCode[] = null;
    taxType: CommonCode[] = null;
    purposeType: CommonCode[] = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public matDialogRef: MatDialogRef<BillTaxComponent>,
        public _matDialogPopup: MatDialog,
        private _managesService: ManagesService,
        private _formBuilder: FormBuilder,
        private _codeStore: CodeStore,
        private _billService: BillService,
        private _functionService: FunctionService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _utilService: FuseUtilsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver,
    ) {
        this.detailList = data.select;
        this.taxButton = data.button;

        this.issueType = _utilService.commonValueFilter(_codeStore.getValue().data,'ISSUE_TYPE',['ALL']);
        this.chargeDirection = _utilService.commonValue(_codeStore.getValue().data,'CH_DIRECTION');
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data,'INVOICE_TYPE',['ALL']);
        this.taxType = _utilService.commonValue(_codeStore.getValue().data,'TAX_TYPE');
        this.purposeType = _utilService.commonValue(_codeStore.getValue().data,'PURPOSE_TYPE');
        this.isMobile = this._deviceService.isMobile();
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.taxForm = this._formBuilder.group({
            account : [{value: '',disabled:true}, [Validators.required]], // 공급자 사업자번호
            accountNm : [{value: '',disabled:true}, [Validators.required]], // 공급자
            toAccount : [{value: '',disabled:true}, [Validators.required]], // 공급받는자 사업자번호
            toAccountNm : [{value: '',disabled:true}, [Validators.required]], // 공급받는자
            issueType: [{value: '',disabled:true}, [Validators.required]], // 발행형태
            chargeDirection: [{value: '',disabled:true}, [Validators.required]], // 과금방향
            type: [{value: '',disabled:true}, [Validators.required]], // 유형
            taxType: [{value: '',disabled:true}, [Validators.required]], // 과세유형
            purposeType: ['', [Validators.required]], // 영수/청구
            billingAmt : [{value: '',disabled:true}, [Validators.required]],
            taxAmt : [{value: '',disabled:true}, [Validators.required]],
            billingTotalAmt : [{value: '',disabled:true}, [Validators.required]],
        });
        //console.log(this.detailList);

        let billingTotalAmt = 0;
        let billingAmt = 0;
        let taxAmt = 0;
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for(let i=0; i<this.detailList.length; i++){
            billingAmt += this.detailList[i].billingAmt;
            taxAmt += this.detailList[i].taxAmt;
            billingTotalAmt += this.detailList[i].billingTotalAmt;
        }

        if(this.detailList[0].type === 'S'){
            this.taxForm.patchValue({'type': 'SELL'});
        }else if(this.detailList[0].type === 'B'){
            this.taxForm.patchValue({'type': 'BUY'});
        }
        this.taxForm.patchValue({'issueType': '정발행'});
        this.taxForm.patchValue({'chargeDirection': '정과금'});

        if(this.detailList[0].taxGbn === '1'){
            this.taxForm.patchValue({'taxType': '과세'});
        }else if(this.detailList[0].taxGbn === '2'){
            this.taxForm.patchValue({'taxType': '영세'});
        }else if(this.detailList[0].taxGbn === '3'){
            this.taxForm.patchValue({'taxType': '면세'});
        }

        this.taxForm.patchValue({'billingAmt': billingAmt});
        this.taxForm.patchValue({'taxAmt': taxAmt});
        this.taxForm.patchValue({'billingTotalAmt': billingTotalAmt});

        this.taxForm.patchValue({'account': this.detailList[0].account});
        this.taxForm.patchValue({'accountNm': this.detailList[0].accountNm});

        this.taxForm.patchValue({'toAccount': this.detailList[0].toAccount});
        this.taxForm.patchValue({'toAccountNm': this.detailList[0].toAccountNm});

        this.taxCount = this.detailList.length;
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


    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    //즉시 발행
    invoice(): void {
        if(!this.taxForm.invalid){
            const confirmation = this._teamPlatConfirmationService.open({
                title  : '',
                message: '즉시발행 하시겠습니까?',
                actions: {
                    confirm: {
                        label: '발행'
                    },
                    cancel: {
                        label: '닫기'
                    }
                }
            });

            confirmation.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if(result) {
                        this.invoiceCall(this.detailList, 'INVOICE');
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

    //임시 저장
    invoiceSave(): void {

        if(!this.taxForm.invalid){
            const confirmation = this._teamPlatConfirmationService.open({
                title  : '',
                message: '마감 하시겠습니까?',
                actions: {
                    confirm: {
                        label: '확정'
                    },
                    cancel: {
                        label: '닫기'
                    }
                }
            });

            confirmation.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if(result) {
                        this.invoiceCall(this.detailList, 'SAVE');
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

    /* 트랜잭션 전 data Set
     * @param sendData
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: Bill[], check?: any) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i=0; i<sendData.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            sendData[i].account = this.taxForm.controls['account'].value;
            sendData[i].accountNm = this.taxForm.controls['accountNm'].value;
            sendData[i].toAccount = this.taxForm.controls['toAccount'].value;
            sendData[i].toAccountNm = this.taxForm.controls['toAccountNm'].value;
            sendData[i].issueType = this.taxForm.controls['issueType'].value;
            sendData[i].chargeDirection = this.taxForm.controls['chargeDirection'].value;
            sendData[i].type = this.taxForm.controls['type'].value;
            sendData[i].taxType = this.taxForm.controls['taxType'].value;
            sendData[i].purposeType = this.taxForm.controls['purposeType'].value;
            sendData[i].billingAmt = this.taxForm.controls['billingAmt'].value;
            sendData[i].taxAmt = this.taxForm.controls['taxAmt'].value;
            sendData[i].billingTotalAmt = this.taxForm.controls['billingTotalAmt'].value;
            sendData[i].check = check;
        }
        return sendData;
    }

    invoiceCall(sendData: Bill[], check?: any): void{
        if(sendData){
            sendData = this.headerDataSet(sendData, check);
            this._billService.invoice(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((bill: any) => {
                    this.cfn_alertCheckMessage(bill);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        }
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    cfn_alertCheckMessage(param: any, redirectUrl?: string): void
    {
        if(param.status !== 'SUCCESS'){

            const icon = 'information-circle';
            // Setup config form
            this._functionService.configForm = this._formBuilder.group({
                title      : '',
                message    : param.msg,
                icon       : this._formBuilder.group({
                    show : true,
                    name : 'heroicons_outline:' + icon,
                    color: 'accent'
                }),
                actions    : this._formBuilder.group({
                    confirm: this._formBuilder.group({
                        show : false,
                        label: '',
                    }),
                    cancel : this._formBuilder.group({
                        show : true,
                        label: '닫기'
                    })
                }),
                dismissible: true
            });
            const confirmation = this._teamPlatConfirmationService.open(this._functionService.configForm.value);
        }else{
            this._functionService.cfn_alert('정상적으로 처리되었습니다.','check-circle');
            this.matDialogRef.close();
        }
    }
}
