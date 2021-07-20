import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit, ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {fuseAnimations} from '../../animations';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FuseUtilsService} from '../../services/utils';
import {FormBuilder} from '@angular/forms';
import {CodeStore} from '../../../app/core/common-code/state/code.store';
import {PopupStore} from '../../../app/core/common-popup/state/popup.store';
import {Subject} from 'rxjs';
import Quagga from 'quagga';

@Component({
    selector: 'app-common-scan',
    templateUrl: './common-scan.component.html',
    styleUrls: ['./common-scan.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class CommonScanComponent implements OnInit, OnDestroy, AfterViewInit {

    isLoading: boolean = false;
    barcodeScan: boolean = true;
    errorMessage: string;

    barcodeValue;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public _matDialogRef: MatDialogRef<CommonScanComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _utilService: FuseUtilsService,
        private _formBuilder: FormBuilder,
        public _matDialogPopup: MatDialog,
        private _codeStore: CodeStore,
        private _changeDetectorRef: ChangeDetectorRef,
        private _popupStore: PopupStore) {

    }

    ngOnInit(): void {

    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        if (!navigator.mediaDevices || !(typeof navigator.mediaDevices.getUserMedia === 'function')) {
            this.errorMessage = 'getUserMedia is not supported';
            return;
        }

        //this.barcodeScanner.start();

        Quagga.init({
                inputStream: {
                    constraints: {
                        facingMode: 'environment'
                    },
                    area: { // defines rectangle of the detection/localization area
                        top: '40%',    // top offset
                        right: '0%',  // right offset
                        left: '0%',   // left offset
                        bottom: '40%'  // bottom offset
                    },
                },
                decoder: {
                    readers: ['ean_reader']
                },
            },
            (err) => {
                if (err) {
                    this.errorMessage = `스캔 에러 입니다. 관리자에게 문의해주세요., 에러 메세지: ${err}`;
                } else {
                    Quagga.start();
                    Quagga.onDetected((res) => {
                        this.vibration();
                        const result = confirm('스캔하시겠습니까?');
                        if(result && this.barcodeScan)
                        {
                            this.barcodeScan = false;
                            console.log(res.codeResult.code);
                            setTimeout(() => {
                                this.barcodeScan = true;
                                //this.stopVibration();
                            }, 10000);
                        }
                        // setTimeout(() => {
                        // }, 1000);
                        //this.onBarcodeScanned(res.codeResult.code);
                    });
                    this.stopVibration();
                }
            });

        setTimeout(() => {
            //this.updateService.checkForUpdates();
            this._changeDetectorRef.markForCheck();
        }, 10000);
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        Quagga.stop();
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    onValueChanges(result): void{
        alert(result.codeResult.code);
        this.barcodeValue = result.codeResult.code;
    }

    onStarted(started): void{
        console.log(started);
    }

    vibration(): void{
        if (navigator.vibrate) {
            navigator.vibrate(10000); // 진동을 울리게 한다. 1000ms = 1초
        }
    }
    stopVibration(): void{
        navigator.vibrate(0);
    }

}
