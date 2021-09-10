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
import {CommonScanService} from './common-scan.service';

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

    confirmText: string = '스캔';

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public _matDialogRef: MatDialogRef<CommonScanComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _utilService: FuseUtilsService,
        private _formBuilder: FormBuilder,
        public _matDialogPopup: MatDialog,
        public _commonScanService: CommonScanService,
        private _codeStore: CodeStore,
        private _changeDetectorRef: ChangeDetectorRef,
        private _popupStore: PopupStore) {
        if(data.confirmText){
            this.confirmText = data.confirmText;
        }
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
                    name : 'Live',
                    type: 'LiveStream',
                    constraints: {
                        /*width: 640,
                        height: 480,*/
                        facingMode: 'environment'
                    },
                    area: { // defines rectangle of the detection/localization area
                        top: '40%',    // top offset
                        right: '0%',  // right offset
                        left: '0%',   // left offset
                        bottom: '40%'  // bottom offset
                    },
                },
                /*locator: {
                    patchSize: 'medium',
                    halfSample: true
                },*/
                decoder: {
                    /*readers: ['ean_reader']*/
                    /*readers: ['code_128_reader'],*/
                    readers : ['code_128_reader',
                        'ean_reader',
                        'ean_8_reader',
                        'code_39_reader',
                        'code_39_vin_reader',
                        'codabar_reader',
                        'upc_reader',
                        'upc_e_reader',
                        'i2of5_reader'
                        /*{
                            format: 'ean_8_reader',
                            config: {}
                        },*/
                    /*    {
                        format: 'ean_reader',
                        config: {
                        }
                    }, {
                        format: 'code_39_reader',
                        config: {}
                    }, {
                        format: 'code_93_reader',
                        config: {}
                    }, {
                        format: 'ean_8_reader',
                        config: {}
                    }*/
                    ],
                    debug: {
                    showCanvas: true,
                    showPatches: true,
                    showFoundPatches: true,
                    showSkeleton: true,
                    showLabels: true,
                    showPatchLabels: true,
                    showRemainingPatchLabels: true,
                    boxFromPatches: {
                        showTransformed: true,
                        showTransformedBox: true,
                        showBB: true
                    }
                }
                },
                /*locator: {
                    patchSize: 'medium',
                    halfSample: true
                },*/
                multiple: true,
            },
            (err) => {
                if (err) {
                    this.errorMessage = `스캔 에러 입니다. 관리자에게 문의해주세요., 에러 메세지: ${err}`;
                } else {
                    Quagga.start();
                    Quagga.onDetected((res) => {
                        this.vibration();
                        if(this.barcodeScan){
                            const result = confirm(this.confirmText + '하시겠습니까?');
                            if(result)
                            {
                                /*console.log(res.codeResult.format);
                                console.log(res.codeResult.code);*/
                                this.barcodeScan = false;
                                console.log(res);
                                const data = [{
                                    res: res,
                                    rescodeResult : res.codeResult,
                                    udiDiCode : res.codeResult.code
                                }];
                                /*this._commonScanService.scanData(data)
                                    .pipe(takeUntil(this._unsubscribeAll))
                                    .subscribe((scan: any) => {

                                        this.barcodeScan = false;
                                        this._matDialogRef.close();
                                        this._changeDetectorRef.markForCheck();
                                        Quagga.stop();
                                    });*/


                                this.barcodeScan = false;
                                this._matDialogRef.close(data);
                                this._changeDetectorRef.markForCheck();
                                Quagga.stop();

                            }
                        }

                        // setTimeout(() => {
                        // }, 1000);
                        //this.onBarcodeScanned(res.codeResult.code);
                    });
                    this.stopVibration();
                }
            });

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
