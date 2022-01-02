import {
    ChangeDetectorRef,
    Component, ElementRef, Inject,
    OnDestroy,
    OnInit, Renderer2, ViewChild,
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {DeviceDetectorService} from 'ngx-device-detector';
import {fuseAnimations} from '../../../../../../@teamplat/animations';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {FuseAlertType} from '../../../../../../@teamplat/components/alert';
import {takeUntil} from 'rxjs/operators';
import {StockService} from '../stock.service';
import {Subject} from 'rxjs';
import {FunctionService} from '../../../../../../@teamplat/services/function';
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import {Stock, StockAdj, StockHistory} from '../stock.types';

@Component({
    selector       : 'stock-detail',
    templateUrl    : 'stock-detail.component.html',
    styleUrls      : ['stock-detail.component.scss']
})
export class StockDetailComponent implements OnInit, OnDestroy {
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    @ViewChild('daum_popup', { read: ElementRef, static: true }) popup: ElementRef;
    showAlert: boolean = false;
    isMobile: boolean = false;
    selectedStockForm: FormGroup;
    is_edit: boolean = false;
    adjTypes: CommonCode[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public matDialogRef: MatDialogRef<StockDetailComponent>,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _stockService: StockService,
        private _renderer: Renderer2,
        private _formBuilder: FormBuilder,
        private _deviceService: DeviceDetectorService,
        private _functionService: FunctionService,
        private _codeStore: CodeStore,
        private _changeDetectorRef: ChangeDetectorRef,
        private _utilService: FuseUtilsService)
    {
        this.isMobile = this._deviceService.isMobile();
        this.adjTypes = _utilService.commonValue(_codeStore.getValue().data, 'ADJ_TYPE');
    }
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {


        this.selectedStockForm = this._formBuilder.group({
            itemCd: [{value: this.data.detail.itemCd ,disabled:true}], // 품목코드
            itemNm: [{value: this.data.detail.itemNm ,disabled:true}], // 품목명
            adjType: ['', [Validators.required]], // 사유
            availQty: [{value: this.data.detail.availQty ,disabled:true}], // 보유수량
            qty: ['', [Validators.required]], // 조정수량
            active: [false]  // cell상태
        });
    }

    itemAdjustmentCreate(): void {
        if(!this.selectedStockForm.invalid) {
            this.showAlert = false;

            const confirmation = this._teamPlatConfirmationService.open({
                title  : '',
                message: '조정하시겠습니까?',
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
                        this._stockService.stockAdjustment(this.selectedStockForm.getRawValue())
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((stock: any) => {
                                this._functionService.cfn_alertCheckMessage(stock);
                                //팝업 닫고
                                this.matDialogRef.close();
                                //헤더 다시 조회
                                this._stockService.getHeader();
                                // Mark for check
                                this._changeDetectorRef.markForCheck();
                            });
                    }
                });
        }

        else{
            // Set the alert
            this.alert = {
                type   : 'error',
                message: '조정 수량 및 사유를 입력해주세요.'
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
