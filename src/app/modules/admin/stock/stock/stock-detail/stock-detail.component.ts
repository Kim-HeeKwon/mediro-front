import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, Inject,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';

import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {DeviceDetectorService} from 'ngx-device-detector';
import {fuseAnimations} from '../../../../../../@teamplat/animations';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CommonCode, FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {FuseAlertType} from "../../../../../../@teamplat/components/alert";



@Component({
    selector       : 'stock-detail',
    templateUrl    : './stock-detail.component.html',
    animations   : fuseAnimations
})


export class StockDetailComponent implements OnInit, OnDestroy {
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    showAlert: boolean = false;
    isMobile: boolean = false;
    selectedItemForm: FormGroup;
    is_edit: boolean = false;
    adjTypes: CommonCode[] = [];


    constructor(
        public matDialogRef: MatDialogRef<StockDetailComponent>,
        public _matDialogPopup: MatDialog,
        private _deviceService: DeviceDetectorService,
        private _formBuilder: FormBuilder,
        private _codeStore: CodeStore,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _utilService: FuseUtilsService)

    {
        this.isMobile = this._deviceService.isMobile();
        this.adjTypes = _utilService.commonValue(_codeStore.getValue().data, 'ADJ_TYPE');
    }

    ngOnInit(): void
    {
        this.selectedItemForm = this._formBuilder.group({
            itemCd: [{value: this.data.detail.itemCd ,disabled:true}], // 품목코드
            itemNm: [{value: this.data.detail.itemNm ,disabled:true}], // 품목명
            adjType: ['', [Validators.required]], // 보유 수량
            availQty: [{value: this.data.detail.availQty ,disabled:true}], // 보유수량
            adjustedQty: ['', [Validators.required]], // 조정수량

        });
    }

    ngOnDestroy(): void {
    }

    itemAdjustmentCreate(): void {
        if(!this.selectedItemForm.invalid) {
            this.showAlert = false;
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

}



