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
                    this.errorMessage = `QuaggaJS could not be initialized, err: ${err}`;
                } else {
                    Quagga.start();
                    Quagga.onDetected((res) => {
                        const result = confirm('스캔하시겠습니까?');
                        if(result)
                        {
                            console.log(res.codeResult.code);
                        }
                        //this.onBarcodeScanned(res.codeResult.code);
                    });
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
}
