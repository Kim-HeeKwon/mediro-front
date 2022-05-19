import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {DeviceDetectorService} from 'ngx-device-detector';

@Component({
    selector: 'basicInfo-Manual',
    templateUrl: './basicInfo-Manual.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
// eslint-disable-next-line @typescript-eslint/naming-convention
export class basicInfoManualComponent {
    url: SafeResourceUrl;
    video: boolean = false;
    account: boolean = false;
    item: boolean = false;
    itemPrice: boolean = false;
    isMobile: boolean = false;

    constructor(public sanitizer: DomSanitizer,
                private _deviceService: DeviceDetectorService,) {
        this.isMobile = this._deviceService.isMobile();
    }

    accountBtn(): void {
        if(this.account) {
            this.account = false;
        }else {
            this.item = false;
            this.itemPrice = false;
            this.account = true;
            this.video = false;
        }
    }

    itemBtn(): void {
        if(this.item) {
            this.item = false;
        }else {
            this.item = true;
            this.itemPrice = false;
            this.account = false;
            this.video = false;
        }
    }

    itemPriceBtn(): void {
        if(this.itemPrice) {
            this.itemPrice = false;
        }else {
            this.item = false;
            this.itemPrice = true;
            this.account = false;
            this.video = false;
        }
    }

    accountCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/nfRvFLu4HQM');
    }

    accountUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/rBLZRWX57bE');
    }

    accountDelete(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/3pOV1Q5iPBk');
    }

    accountNewUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/lDAtEliYqdo');
    }

    itemCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/zjj53bStxwU');
    }

    itemBatchCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/aLMJNPGZZdk');
    }

    itemEtcCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/F8YvMdzPL1s');
    }

    itemUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/kilXiiumf2o');
    }

    itemDelete(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/1d47jCyh8f0');
    }

    itemPriceCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/HsESCT5kh8k');
    }

    itemPriceUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/tsTowdnc6TI');
    }

    itemPriceDelete(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/WiqGWBcIfOU');
    }
}
